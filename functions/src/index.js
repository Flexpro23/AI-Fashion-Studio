const admin = require("firebase-admin");
const functions = require("firebase-functions");
const { GoogleAuth } = require("google-auth-library");
const axios = require("axios");

// Initialize Firebase Admin with proper configuration for 2nd Gen functions
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();
const storage = admin.storage();

// Helper function to download images from Firebase Storage URLs and convert to base64
async function downloadImageFromUrl(url) {
  console.log(`⬇️ Downloading image from URL: ${url}`);
  try {
    const bucket = storage.bucket();
    let filePath;

    if (url.startsWith('gs://')) {
      filePath = url.replace(/^gs:\/\/[^\/]+\//, '');
    } else if (url.includes('firebasestorage.googleapis.com')) {
      const urlObj = new URL(url);
      let pathMatch = urlObj.pathname.match(/\/v0\/b\/[^\/]+\/o\/(.+?)(?:\?|$)/);
      if (!pathMatch) {
        pathMatch = urlObj.pathname.match(/\/o\/(.+?)(?:\?|$)/);
      }
      if (!pathMatch) {
        throw new Error(`Invalid Firebase Storage URL format: ${urlObj.pathname}`);
      }
      filePath = decodeURIComponent(pathMatch[1]);
    } else {
      throw new Error('Unsupported URL format. Expected gs:// or Firebase Storage download URL');
    }

    console.log(`📂 Parsed file path: ${filePath}`);
    const file = bucket.file(filePath);
    const [buffer] = await file.download();
    console.log(`✅ Image downloaded: ${filePath}`);
    return buffer;
  } catch (error) {
    console.error('❌ Error downloading image:', error);
    throw error;
  }
}

// Test function for basic authentication
exports.testAuth = functions.https.onCall(async (data, context) => {
  console.log("Test function called");
  console.log("Auth context:", context?.auth?.uid ? "Authenticated" : "Not authenticated");
  
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Test failed: Not authenticated');
  }
  
  console.log("User ID:", context.auth.uid);
  console.log("✅ Success!");
  return { success: true, message: "Test passed!" };
});

// Main image generation function using Gemini 2.5 Flash Image Preview  
exports.generateImageV2 = functions.https.onCall(async (data, context) => {
  console.log("🚀 === GENERATEIMAGEV2 FUNCTION STARTED ===");
  console.log("⏰ Timestamp:", new Date().toISOString());
  console.log("Function called with data keys:", Object.keys(data || {}));
  console.log("Full context:", JSON.stringify(context, null, 2));
  console.log("Auth context:", context?.auth?.uid ? "Authenticated" : "Not authenticated");

  try {
    // Handle different Firebase Functions data structures
    let actualData = data;
    let authContext = context;
    
    // Check if data has the new structure with nested data
    if (data && data.data && typeof data.data === 'object') {
      actualData = data.data;
      console.log("📦 Using nested data structure, keys:", Object.keys(actualData || {}));
    }
    
    // Check if auth is in data instead of context (newer Firebase Functions structure)
    if (data && data.auth && !context?.auth) {
      authContext = { auth: data.auth };
      console.log("🔄 Auth found in data instead of context");
    }

    console.log("🔐 Final auth context:", authContext?.auth?.uid ? "Authenticated" : "Not authenticated");
    console.log("🔐 Auth UID:", authContext?.auth?.uid);

    // CRITICAL: Check if user is authenticated
    if (!authContext || !authContext.auth || !authContext.auth.uid) {
      console.error("❌ AUTHENTICATION FAILED: No auth context provided");
      console.error("❌ Context:", context);
      console.error("❌ Data:", data);
      throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }

    console.log("✅ User authenticated:", authContext.auth.uid);

    const { modelImageUrl, garmentImageUrl } = actualData;
    const userId = authContext.auth.uid;

    console.log("👤 User ID:", userId);
    console.log("📸 Model Image URL:", modelImageUrl);
    console.log("👗 Garment Image URL:", garmentImageUrl);

    // Validate input parameters
    if (!modelImageUrl || !garmentImageUrl) {
      console.error("❌ Missing required parameters");
      throw new functions.https.HttpsError('invalid-argument', 'Missing modelImageUrl or garmentImageUrl');
    }

    console.log("⬇️ Starting image download...");

    // Download images and convert to base64
    const modelImageBuffer = await downloadImageFromUrl(modelImageUrl);
    const garmentImageBuffer = await downloadImageFromUrl(garmentImageUrl);

    console.log("✅ Images downloaded successfully");
    console.log(`📏 Model image size: ${modelImageBuffer.length} bytes`);
    console.log(`📏 Garment image size: ${garmentImageBuffer.length} bytes`);

    // Convert to base64
    const modelBase64 = modelImageBuffer.toString('base64');
    const garmentBase64 = garmentImageBuffer.toString('base64');

    console.log(`📊 Model base64 length: ${modelBase64.length}`);
    console.log(`📊 Garment base64 length: ${garmentBase64.length}`);

    console.log("🔑 Starting image generation process...");
    
    // Use Google Auth library to get credentials (like your working function)
    const auth = new GoogleAuth({
      scopes: ["https://www.googleapis.com/auth/cloud-platform"],
    });
    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();
    
    console.log("✅ Successfully obtained access token");
    
    // Vertex AI API endpoint for Gemini 2.5 Flash Image Preview
    const projectId = "ai-fashion-studio-demo";
    const location = "us-central1";
    const modelId = "gemini-2.5-flash-image-preview";
    const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${modelId}:generateContent`;

    console.log("🌐 Using endpoint:", endpoint);

    // Prepare request data with enhanced prompt
    const requestData = {
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Create a high-quality, photorealistic image of the person from the first image wearing the clothing item from the second image. 

Requirements:
- The person should be wearing the garment naturally and it should fit properly
- Maintain the person's pose, facial features, and body proportions from the original image
- The clothing should look realistic and well-fitted
- Preserve the style, color, and texture of the garment from the second image
- Ensure professional lighting and composition
- The background should be clean and neutral
- Show the complete outfit in a natural, appealing way

Make the final result look like a professional fashion photograph with the person naturally wearing the new clothing.`,
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
        temperature: 0.7,
        topP: 0.9,
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

    console.log("📡 Making API request to Vertex AI...");

    // Make the API request (like your working function)
    const response = await axios.post(endpoint, requestData, {
      headers: {
        Authorization: `Bearer ${accessToken.token}`,
        "Content-Type": "application/json",
      },
      timeout: 120000, // 2 minute timeout for image generation
    });

    console.log("✅ Received response from Vertex AI");

    // Process the response (like your working function)
    if (response.data && response.data.candidates && response.data.candidates.length > 0) {
      const parts = response.data.candidates[0].content.parts || [];
      for (const part of parts) {
        if (part.inlineData) {
          console.log("🎨 Successfully generated image");
          
          // Save the generated image to Firebase Storage
          const generatedImageBase64 = part.inlineData.data;
          const imageBuffer = Buffer.from(generatedImageBase64, 'base64');
          
          const fileName = `generated/${userId}/${Date.now()}_generated.jpg`;
          const bucket = storage.bucket();
          const file = bucket.file(fileName);
          
          await file.save(imageBuffer, {
            metadata: {
              contentType: part.inlineData.mimeType || 'image/jpeg',
              metadata: {
                uploadedBy: userId,
                generatedAt: new Date().toISOString(),
                modelUsed: 'gemini-2.5-flash-image-preview'
              }
            }
          });
          
          // Make the file publicly accessible
          await file.makePublic();
          
          const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
          
          console.log("💾 Image saved to Firebase Storage:", publicUrl);
          
          // Update user's generation count
          const userRef = db.collection('users').doc(userId);
          await userRef.update({
            totalGenerations: admin.firestore.FieldValue.increment(1),
            remainingGenerations: admin.firestore.FieldValue.increment(-1),
            lastGeneratedAt: admin.firestore.FieldValue.serverTimestamp()
          });
          
          console.log("📊 Updated user generation count");
          
          return {
            success: true,
            resultUrl: publicUrl,
            message: "Image generated successfully!"
          };
        }
      }
    }

    console.warn("⚠️ No image data found in response");
    throw new functions.https.HttpsError("internal", "Image generation failed: No image returned by model.");

  } catch (error) {
    console.error("💥 === GENERATION ERROR ===");
    console.error("🔍 Error type:", error.constructor.name);
    console.error("📝 Error message:", error.message);
    console.error("📚 Error details:", error.response?.data || error);

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