const admin = require("firebase-admin");
const functions = require("firebase-functions");
const { GoogleAuth } = require("google-auth-library");
const axios = require("axios");
const { VertexAI } = require('@google-cloud/vertexai');
const path = require('path');

// Initialize Firebase Admin with service account
if (!admin.apps.length) {
  const serviceAccountPath = path.join(__dirname, 'service-account-key.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccountPath),
    projectId: 'ai-fashion-studio-demo'
  });
}

const db = admin.firestore();
const storage = admin.storage();

// Helper function to download images from Firebase Storage URLs and convert to base64
async function downloadImageFromUrl(url) {
  console.log('Downloading image from URL:', url);
  
  // Handle both gs:// URLs and https:// download URLs
  const bucket = storage.bucket();
  
  if (url.startsWith('gs://')) {
    // Parse the gs:// URL to get the file path
    const filePath = url.replace(/^gs:\/\/[^\/]+\//, '');
    console.log('Parsed gs:// file path:', filePath);
    const file = bucket.file(filePath);
    const [buffer] = await file.download();
    return buffer;
  } else if (url.includes('firebasestorage.googleapis.com')) {
    // Parse the https download URL to extract the file path
    const urlObj = new URL(url);
    console.log('URL pathname:', urlObj.pathname);
    console.log('URL search params:', urlObj.search);
    
    // Firebase Storage URLs have format: /v0/b/{bucket}/o/{path}?{params}
    // or /o/{path}?{params} for some cases
    let pathMatch = urlObj.pathname.match(/\/v0\/b\/[^\/]+\/o\/(.+?)(?:\?|$)/);
    if (!pathMatch) {
      pathMatch = urlObj.pathname.match(/\/o\/(.+?)(?:\?|$)/);
    }
    
    if (!pathMatch) {
      console.error('Failed to parse Firebase Storage URL:', url);
      console.error('Pathname:', urlObj.pathname);
      throw new Error(`Invalid Firebase Storage URL format. Expected /v0/b/{bucket}/o/{path} or /o/{path}, got: ${urlObj.pathname}`);
    }
    
    const encodedPath = pathMatch[1];
    const filePath = decodeURIComponent(encodedPath);
    console.log('Parsed file path:', filePath);
    
    const file = bucket.file(filePath);
    const [buffer] = await file.download();
    return buffer;
  } else {
    console.error('Unsupported URL format:', url);
    throw new Error('Unsupported URL format. Expected gs:// or Firebase Storage download URL');
  }
}

exports.generateImage = functions.https.onCall(async (data, context) => {
  console.log("Function called with data keys:", Object.keys(data || {}));
  console.log("Auth context:", context?.auth?.uid ? "Authenticated" : "Not authenticated");

  // Check if user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }

  // Handle FlutterFlow's data structure - parameters might be nested in 'data' property
  let actualData = data;
  if (data && data.data && typeof data.data === 'object') {
    actualData = data.data;
    console.log("Using nested data structure, keys:", Object.keys(actualData || {}));
  }

  // Extract parameters - supporting both base64 and URL formats
  const { modelImageUrl, garmentImageUrl, baseOutfitImage, baseClothingImage } = actualData;
  const userId = context.auth.uid;

  // Determine if we have URLs (from current UI) or base64 data (from other implementation)
  let modelBase64, garmentBase64;

  try {
    if (modelImageUrl && garmentImageUrl) {
      // Current UI sends URLs - need to download and convert to base64
      console.log('Model image URL:', modelImageUrl);
      console.log('Garment image URL:', garmentImageUrl);
      console.log('Downloading images from URLs...');
      
      const modelImageBuffer = await downloadImageFromUrl(modelImageUrl);
      const garmentImageBuffer = await downloadImageFromUrl(garmentImageUrl);
      
      modelBase64 = modelImageBuffer.toString('base64');
      garmentBase64 = garmentImageBuffer.toString('base64');
      console.log('Images downloaded and converted to base64 successfully.');
      
    } else if (baseOutfitImage && baseClothingImage) {
      // Direct base64 input
      modelBase64 = baseOutfitImage;
      garmentBase64 = baseClothingImage;
      console.log('Using provided base64 images.');
      
    } else {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Missing required parameters. Provide either (modelImageUrl + garmentImageUrl) or (baseOutfitImage + baseClothingImage)."
      );
    }

    if (!modelBase64 || typeof modelBase64 !== "string") {
      console.error("Invalid model image data. Received:", typeof modelBase64);
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Missing or invalid model image data (must be base64-encoded string).",
      );
    }

    if (!garmentBase64 || typeof garmentBase64 !== "string") {
      console.error("Invalid garment image data. Received:", typeof garmentBase64);
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Missing or invalid garment image data (must be base64-encoded string).",
      );
    }

    console.log("Starting image generation process...");
    
    // Use Google Auth library with service account credentials
    const serviceAccountPath = path.join(__dirname, 'service-account-key.json');
    const auth = new GoogleAuth({
      keyFile: serviceAccountPath,
      scopes: ["https://www.googleapis.com/auth/cloud-platform"],
    });
    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();
    
    console.log("Successfully obtained access token");
    
    // Vertex AI API endpoint for Gemini image generation
    const projectId = "ai-fashion-studio-demo";
    const location = "us-central1";
    const modelId = "gemini-2.0-flash-preview-image-generation";
    const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${modelId}:generateContent`;

    console.log("Using endpoint:", endpoint);

    // Prepare request data
    const requestData = {
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `
You are a professional digital fashion assistant. Your task is to perform a hyper-realistic virtual try-on.

You will be given two images:
1.  The 'Model Image' which contains a person.
2.  The 'Garment Image' which contains an article of clothing.

**Your instructions are absolute:**
1.  Take the exact garment from the 'Garment Image' and place it onto the person in the 'Model Image'.
2.  **CRITICAL:** The final output image MUST be identical to the original 'Model Image' in every way EXCEPT for the clothing. You MUST NOT change the model's facial features, expression, skin tone, hair, body shape, or pose. You MUST NOT change the background, lighting, or shadows of the original scene.
3.  The garment must fit the model's body naturally, conforming to their pose and creating realistic wrinkles, drapes, and shadows.
4.  If the 'Garment Image' has a background, ignore it completely. Only use the clothing item itself.

The operation is a precise replacement of the clothing on the original model, nothing more.
`,
            },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: modelBase64,
              },
            },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: garmentBase64,
              },
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.3,
        topP: 0.8,
        maxOutputTokens: 8192,
        responseModalities: ["TEXT", "IMAGE"],
      },
      safetySettings: [
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "OFF" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "OFF" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "OFF" },
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "OFF" },
        { category: "HARM_CATEGORY_IMAGE_HATE", threshold: "OFF" },
        { category: "HARM_CATEGORY_IMAGE_DANGEROUS_CONTENT", threshold: "OFF" },
        { category: "HARM_CATEGORY_IMAGE_HARASSMENT", threshold: "OFF" },
        { category: "HARM_CATEGORY_IMAGE_SEXUALLY_EXPLICIT", threshold: "OFF" },
      ],
    };

    console.log("Making API request to Vertex AI...");

    // Make the API request
    const response = await axios.post(endpoint, requestData, {
      headers: {
        Authorization: `Bearer ${accessToken.token}`,
        "Content-Type": "application/json",
      },
      timeout: 60000, // 60 second timeout
    });

    console.log("Received response from Vertex AI");

    // Process the response
    if (response.data && response.data.candidates && response.data.candidates.length > 0) {
      const parts = response.data.candidates[0].content.parts || [];
      for (const part of parts) {
        if (part.inlineData) {
          console.log("Successfully generated image");
          
          // Save the generated image to Firebase Storage
          const generatedImageBuffer = Buffer.from(part.inlineData.data, 'base64');
          const fileName = `generated-image-${Date.now()}.jpg`;
          const file = storage.bucket().file(`generated/${userId}/${fileName}`);
          
          await file.save(generatedImageBuffer, { 
            metadata: {
              contentType: part.inlineData.mimeType || 'image/jpeg',
              cacheControl: 'public, max-age=31536000'
            }
          });
          await file.makePublic();

          // Set CORS headers for the file
          await file.setMetadata({
            metadata: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type'
            }
          });

          const publicUrl = file.publicUrl();

          // Create a record in Firestore
          await db.collection('generations').add({
            userId,
            garmentImageUrl: garmentImageUrl || 'base64-provided',
            outputImageUrl: publicUrl,
            createdAt: new Date(),
            method: 'vertex-ai-gemini-2.0'
          });

          return {
            success: true,
            resultUrl: publicUrl,
            imageData: part.inlineData.data,
            mimeType: part.inlineData.mimeType || "image/jpeg",
          };
        }
      }
    }

    console.warn("No image data found in response");
    return {
      success: false,
      error: "Image generation failed: No image returned by model.",
    };
  } catch (error) {
    console.error("Image generation error:", error.response?.data || error.message || error);

    let message = "Image generation failed due to an internal error.";
    let errorCode = "internal";

    if (error.response?.status === 401) {
      message = "Authentication failed. Please check API permissions.";
      errorCode = "unauthenticated";
    } else if (error.response?.status === 403) {
      message = "Access denied. Please check API permissions and quotas.";
      errorCode = "permission-denied";
    } else if (error.response?.data) {
      message += ` Details: ${JSON.stringify(error.response.data)}`;
    } else if (error.message) {
      message += ` Details: ${error.message}`;
    }
    
    throw new functions.https.HttpsError(errorCode, message);
  }
});

// Simple V2 function using Vertex AI with proper service account authentication
exports.generateImageV2 = functions.https.onCall(async (data, context) => {
  console.log("GenerateImageV2 function called");
  
  // Check if user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }

  const { modelImageUrl, garmentImageUrl } = data;
  const userId = context.auth.uid;

  try {
    console.log('Downloading images...');
    const modelImageBuffer = await downloadImageFromUrl(modelImageUrl);
    const garmentImageBuffer = await downloadImageFromUrl(garmentImageUrl);
    
    const modelBase64 = modelImageBuffer.toString('base64');
    const garmentBase64 = garmentImageBuffer.toString('base64');
    
    console.log("Starting Gemini 2.5 generation...");
    
    // Initialize Vertex AI with service account (automatically uses function's credentials)
    const vertexAI = new VertexAI({
      project: 'ai-fashion-studio-demo',
      location: 'us-central1'
    });
    
    const model = vertexAI.getGenerativeModel({
      model: 'gemini-1.5-pro-vision-001'
    });
    
    const prompt = `
You are a professional digital fashion assistant. Your task is to perform a hyper-realistic virtual try-on.

You will be given two images:
1.  The 'Model Image' which contains a person.
2.  The 'Garment Image' which contains an article of clothing.

**Your instructions are absolute:**
1.  Take the exact garment from the 'Garment Image' and place it onto the person in the 'Model Image'.
2.  **CRITICAL:** The final output image MUST be identical to the original 'Model Image' in every way EXCEPT for the clothing. You MUST NOT change the model's facial features, expression, skin tone, hair, body shape, or pose. You MUST NOT change the background, lighting, or shadows of the original scene.
3.  The garment must fit the model's body naturally, conforming to their pose and creating realistic wrinkles, drapes, and shadows.
4.  If the 'Garment Image' has a background, ignore it completely. Only use the clothing item itself.

The operation is a precise replacement of the clothing on the original model, nothing more.
`;

const request = {
  contents: [
    {
      role: 'user',
      parts: [
        { text: prompt },
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: modelBase64
          }
        },
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: garmentBase64
          }
        }
      ]
    }
  ],
  generationConfig: {
    temperature: 0.3,
    topP: 0.8,
    maxOutputTokens: 8192,
  }
};

const response = await model.generateContent(request);
console.log("Got response from Vertex AI");

// Extract image from response
const result = response.response;
if (result && result.candidates && result.candidates.length > 0) {
  const candidate = result.candidates[0];
  if (candidate.content && candidate.content.parts) {
    for (const part of candidate.content.parts) {
      if (part.inlineData && part.inlineData.data) {
        console.log("Found generated image");
        
        // Save image
        const generatedImageBuffer = Buffer.from(part.inlineData.data, 'base64');
        const fileName = `generated-v2-${Date.now()}.jpg`;
        const file = storage.bucket().file(`generated/${userId}/${fileName}`);
        
        await file.save(generatedImageBuffer, { 
          metadata: { 
            contentType: part.inlineData.mimeType || 'image/jpeg',
            cacheControl: 'public, max-age=31536000'
          }
        });
        await file.makePublic();

        // Set CORS headers for the file
        await file.setMetadata({
          metadata: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
          }
        });

        const publicUrl = file.publicUrl();

        await db.collection('generations').add({
          userId,
          garmentImageUrl,
          outputImageUrl: publicUrl,
          createdAt: new Date(),
          method: 'vertex-ai-gemini-1.5-pro-vision'
        });

        return {
          success: true,
          resultUrl: publicUrl,
          imageData: part.inlineData.data,
          mimeType: part.inlineData.mimeType || "image/jpeg",
        };
      }
    }
  }
}

console.log("No image generated");
return {
  success: false,
  error: "No image generated",
};

} catch (error) {
  console.error("V2 generation error:", error);
  throw new functions.https.HttpsError("internal", `Generation failed: ${error.message}`);
}
});
