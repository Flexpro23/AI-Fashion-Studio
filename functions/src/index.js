const admin = require("firebase-admin");
const functions = require("firebase-functions");
const { GoogleGenAI } = require("@google/genai");

// Initialize Firebase Admin (automatically uses Cloud Function's service account)
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

// V2 function using @google/genai SDK for Gemini 2.5 Flash Image Preview
exports.generateImageV2 = functions.https.onCall(async (data, context) => {
  console.log("=== GENERATEIMAGEV2 FUNCTION CALLED ===");
  console.log("Timestamp:", new Date().toISOString());
  console.log("Data keys:", Object.keys(data || {}));
  console.log("Raw context:", JSON.stringify(context, null, 2));
  console.log("Context auth:", context?.auth ? `Authenticated as ${context.auth.uid}` : "NOT AUTHENTICATED");
  console.log("Auth token present:", !!context?.auth?.token);
  
  // CRITICAL: Check if user is authenticated
  if (!context.auth) {
    console.error("🚨 AUTHENTICATION FAILED: No auth context provided");
    console.error("Full context object:", context);
    throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }

  const { modelImageUrl, garmentImageUrl } = data;
  const userId = context.auth.uid;

  console.log("User ID:", userId);
  console.log("Model Image URL:", modelImageUrl);
  console.log("Garment Image URL:", garmentImageUrl);

  try {
    console.log('Downloading images...');
    const modelImageBuffer = await downloadImageFromUrl(modelImageUrl);
    const garmentImageBuffer = await downloadImageFromUrl(garmentImageUrl);
    
    console.log('Images downloaded successfully');
    const modelBase64 = modelImageBuffer.toString('base64');
    const garmentBase64 = garmentImageBuffer.toString('base64');
    console.log(`Model image base64 length: ${modelBase64.length}`);
    console.log(`Garment image base64 length: ${garmentBase64.length}`);
    
    console.log("Starting Gemini 2.5 generation...");
    
    // Initialize Google GenAI with Vertex AI - using default service account authentication
    console.log("Initializing GoogleGenAI client...");
    const ai = new GoogleGenAI({
      vertexai: true,
      project: 'ai-fashion-studio-demo',
      location: 'global'
    });
    
    console.log("GenAI client initialized successfully");
    
    // Enhanced prompt for better virtual try-on results
    const enhancedPrompt = `
You are a professional digital fashion assistant. Your task is to perform a hyper-realistic virtual try-on.

You will be given two images:
1. The 'Model Image' which contains a person.
2. The 'Garment Image' which contains an article of clothing.

**Your instructions are absolute:**
1. Take the exact garment from the 'Garment Image' and place it onto the person in the 'Model Image'.
2. **CRITICAL:** The final output image MUST be identical to the original 'Model Image' in every way EXCEPT for the clothing. You MUST NOT change the model's facial features, expression, skin tone, hair, body shape, or pose. You MUST NOT change the background, lighting, or shadows of the original scene.
3. The garment must fit the model's body naturally, conforming to their pose and creating realistic wrinkles, drapes, and shadows.
4. If the 'Garment Image' has a background, ignore it completely. Only use the clothing item itself.

The operation is a precise replacement of the clothing on the original model, nothing more.
`;
    
    const req = {
      model: 'gemini-2.5-flash-image-preview',
      contents: [
        {
          role: "user",
          parts: [
            { text: enhancedPrompt },
            { inlineData: { mimeType: "image/jpeg", data: modelBase64 } },
            { inlineData: { mimeType: "image/jpeg", data: garmentBase64 } }
          ]
        }
      ],
      config: {
        maxOutputTokens: 32768,
        temperature: 0.3,
        topP: 0.8,
        responseModalities: ["TEXT", "IMAGE"],
      },
    };

    console.log("Making request to Gemini 2.5...");
    const response = await ai.models.generateContent(req);
    console.log("Got response from Gemini 2.5");
    
    // Extract image from response
    if (response && response.candidates && response.candidates.length > 0) {
      const parts = response.candidates[0].content.parts || [];
      for (const part of parts) {
        let imageData = null;
        let mimeType = "image/jpeg";
        
        // Check for image data in different possible locations
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
          console.log("Found generated image data");
          
          // Save image to Firebase Storage
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
          console.log("Image saved to:", publicUrl);

          // Create record in Firestore
          await db.collection('generations').add({
            userId,
            garmentImageUrl,
            outputImageUrl: publicUrl,
            createdAt: new Date(),
            method: 'gemini-2.5-simple',
            model: 'gemini-2.5-flash-image-preview'
          });

          return {
            success: true,
            resultUrl: publicUrl,
            imageData,
            mimeType,
          };
        }
      }
    }

    console.log("No image generated");
    return {
      success: false,
      error: "No image generated",
    };

  } catch (error) {
    console.error("=== V2 GENERATION ERROR ===");
    console.error("Error type:", error.constructor.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    console.error("Error details:", error);
    
    // Check for specific error types
    if (error.message && error.message.includes('Authentication')) {
      console.error("Authentication error detected");
      throw new functions.https.HttpsError("unauthenticated", `Authentication failed: ${error.message}`);
    } else if (error.message && error.message.includes('Permission denied')) {
      console.error("Permission error detected");
      throw new functions.https.HttpsError("permission-denied", `Permission denied: ${error.message}`);
    } else if (error.message && error.message.includes('API key')) {
      console.error("API key error detected");
      throw new functions.https.HttpsError("failed-precondition", `API configuration error: ${error.message}`);
    } else {
      console.error("General error - throwing as internal");
      throw new functions.https.HttpsError("internal", `Generation failed: ${error.message}`);
    }
  }
});
