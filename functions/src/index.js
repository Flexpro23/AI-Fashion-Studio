const admin = require("firebase-admin");
const functions = require("firebase-functions");
const { GoogleAuth } = require("google-auth-library");
const axios = require("axios");
const { GoogleGenAI } = require("@google/genai");

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp();
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
    
    // Use Google Auth library to get credentials from environment
    const auth = new GoogleAuth({
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
              text: "Generate a realistic image of this person wearing this clothing. Make it look natural, well-fitted, and ensure the full outfit is visible. Blend the clothing naturally onto the person while maintaining realistic lighting, shadows, and fabric draping.",
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
        temperature: 1,
        topP: 0.95,
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

// Simple V2 function using Google GenAI SDK with Gemini 2.5 Flash Image Preview
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
    
    // Initialize Google GenAI
    const ai = new GoogleGenAI({
      vertexai: true,
      project: 'ai-fashion-studio-demo',
      location: 'global'
    });
    
    const req = {
      model: 'gemini-2.5-flash-image-preview',
      contents: [
        {
          role: "user",
          parts: [
            {
              text: "Generate a realistic image of this person wearing this clothing. Make it look natural, well-fitted, and ensure the full outfit is visible."
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
            }
          ]
        }
      ],
      config: {
        maxOutputTokens: 32768,
        temperature: 1,
        topP: 0.95,
        responseModalities: ["TEXT", "IMAGE"],
      },
    };

    const response = await ai.models.generateContent(req);
    console.log("Got response from Gemini 2.5");
    console.log("Full response structure:", JSON.stringify(response, null, 2));
    
    // Debug response structure - response is direct, not nested
    if (response && response.candidates) {
      console.log("Direct response.candidates found:", response.candidates);
      
      if (response.candidates && response.candidates.length > 0) {
        console.log("Found candidates, checking parts...");
        const parts = response.candidates[0].content.parts || [];
        console.log("Parts:", JSON.stringify(parts, null, 2));
        
        for (const part of parts) {
          console.log("Processing part:", JSON.stringify(part, null, 2));
          
          // Try multiple possible locations for image data
          let imageData = null;
          let mimeType = "image/jpeg";
          
          if (part.inlineData && part.inlineData.data) {
            console.log("Found image data in part.inlineData.data");
            imageData = part.inlineData.data;
            mimeType = part.inlineData.mimeType || "image/jpeg";
          } else if (part.blob && part.blob.data) {
            console.log("Found image data in part.blob.data");
            imageData = part.blob.data;
            mimeType = part.blob.mimeType || "image/jpeg";
          } else if (part.image && part.image.data) {
            console.log("Found image data in part.image.data");
            imageData = part.image.data;
            mimeType = part.image.mimeType || "image/jpeg";
          } else if (part.data) {
            console.log("Found image data in part.data");
            imageData = part.data;
          }
          
          if (imageData) {
            console.log("Processing image data, length:", imageData.length);
          
            // Save image
            const generatedImageBuffer = Buffer.from(imageData, 'base64');
            const fileName = `generated-v2-${Date.now()}.jpg`;
            const file = storage.bucket().file(`generated/${userId}/${fileName}`);
            
            await file.save(generatedImageBuffer, { 
              metadata: { 
                contentType: mimeType,
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

            // Save to Firestore
            await db.collection('generations').add({
              userId,
              garmentImageUrl,
              outputImageUrl: publicUrl,
              createdAt: new Date(),
              method: 'gemini-2.5-simple'
            });

            return {
              success: true,
              resultUrl: publicUrl,
              imageData: imageData,
              mimeType: mimeType,
            };
          }
        }
      } else {
        console.log("No candidates found in direct response");
      }
    } else {
      console.log("No response.candidates found - checking for nested response...");
      
      // Try the old nested structure as fallback
      if (response && response.response && response.response.candidates) {
        console.log("Found nested response.response.candidates");
        const parts = response.response.candidates[0].content.parts || [];
        console.log("Nested parts:", JSON.stringify(parts, null, 2));
        
        // Same parsing logic for nested structure...
        for (const part of parts) {
          let imageData = null;
          let mimeType = "image/jpeg";
          
          if (part.inlineData && part.inlineData.data) {
            imageData = part.inlineData.data;
            mimeType = part.inlineData.mimeType || "image/jpeg";
          } else if (part.blob && part.blob.data) {
            imageData = part.blob.data;
            mimeType = part.blob.mimeType || "image/jpeg";
          } else if (part.image && part.image.data) {
            imageData = part.image.data;
            mimeType = part.image.mimeType || "image/jpeg";
          } else if (part.data) {
            imageData = part.data;
          }
          
          if (imageData) {
            console.log("Found image data in nested structure");
            const generatedImageBuffer = Buffer.from(imageData, 'base64');
            const fileName = `generated-v2-${Date.now()}.jpg`;
            const file = storage.bucket().file(`generated/${userId}/${fileName}`);
            
            await file.save(generatedImageBuffer, { 
              metadata: { 
                contentType: mimeType,
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
              method: 'gemini-2.5-simple'
            });

            return {
              success: true,
              resultUrl: publicUrl,
              imageData: imageData,
              mimeType: mimeType,
            };
          }
        }
      }
    }

    console.log("No image data found in any parts - returning error");
    return {
      success: false,
      error: "No image generated",
    };

  } catch (error) {
    console.error("V2 generation error:", error);
    throw new functions.https.HttpsError("internal", `Generation failed: ${error.message}`);
  }
});
