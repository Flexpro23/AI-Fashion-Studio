const admin = require("firebase-admin");
const functions = require("firebase-functions");
const { GoogleGenAI } = require("@google/genai");

// Initialize Firebase Admin - use default credentials in Cloud Functions environment
if (!admin.apps.length) {
  // Check if running in Cloud Functions environment
  if (process.env.FUNCTIONS_EMULATOR || process.env.GOOGLE_CLOUD_PROJECT) {
    // In Cloud Functions, use Application Default Credentials
    admin.initializeApp();
  } else {
    // Local development - use service account
    const path = require('path');
    const serviceAccount = require(path.join(__dirname, '../service-account-key.json'));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: 'ai-fashion-studio-demo'
    });
  }
}

const db = admin.firestore();
const storage = admin.storage();

// Helper function to download images from Firebase Storage URLs and convert to base64
async function downloadImageFromUrl(url) {
  console.log('Downloading image from URL:', url);
  
  try {
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
      
      // Firebase Storage URLs have format: /v0/b/{bucket}/o/{path}?{params}
      let pathMatch = urlObj.pathname.match(/\/v0\/b\/[^\/]+\/o\/(.+?)(?:\?|$)/);
      if (!pathMatch) {
        pathMatch = urlObj.pathname.match(/\/o\/(.+?)(?:\?|$)/);
      }
      
      if (!pathMatch) {
        console.error('Failed to parse Firebase Storage URL:', url);
        throw new Error(`Invalid Firebase Storage URL format: ${urlObj.pathname}`);
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
  } catch (error) {
    console.error('Error downloading image:', error);
    throw error;
  }
}

// Simple test function
exports.testSimple = functions.https.onCall(async (data, context) => {
  console.log("🧪 === SIMPLE TEST FUNCTION CALLED ===");
  console.log("⏰ Timestamp:", new Date().toISOString());
  
  if (!context.auth) {
    console.error("❌ No auth");
    throw new functions.https.HttpsError('unauthenticated', 'Not authenticated');
  }

  console.log("✅ Success!");
  return { success: true, message: "Test passed!" };
});

// Main image generation function using Gemini 2.5 Flash Image Preview
exports.generateImageV2 = functions.https.onCall(async (data, context) => {
  console.log("🚀 === GENERATEIMAGEV2 FUNCTION STARTED ===");
  console.log("⏰ Timestamp:", new Date().toISOString());
  
  try {
    console.log("📝 Data received:", JSON.stringify(data, null, 2));
    console.log("🔐 Auth context:", JSON.stringify(context?.auth, null, 2));
    
    // CRITICAL: Check if user is authenticated
    if (!context.auth) {
      console.error("❌ AUTHENTICATION FAILED: No auth context provided");
      throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }

    console.log("✅ User authenticated:", context.auth.uid);

    const { modelImageUrl, garmentImageUrl } = data;
    const userId = context.auth.uid;

    console.log("👤 User ID:", userId);
    console.log("📸 Model Image URL:", modelImageUrl);
    console.log("👗 Garment Image URL:", garmentImageUrl);

    // Validate input parameters
    if (!modelImageUrl || !garmentImageUrl) {
      console.error("❌ Missing required parameters");
      throw new functions.https.HttpsError('invalid-argument', 'Missing modelImageUrl or garmentImageUrl');
    }

    console.log("⬇️ Starting image download...");
    
    // Download images
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
    
    console.log("🤖 Initializing Gemini AI...");
    
    // Initialize Google GenAI with Vertex AI
    const ai = new GoogleGenAI({
      vertexai: true,
      project: 'ai-fashion-studio-demo',
      location: 'global'
    });
    
    console.log("✅ Gemini AI initialized successfully");
    
    // FOR TESTING: Return success without actual generation
    console.log("🧪 TEST MODE: Returning success without generation");
    return {
      success: true,
      message: "Function reached this point successfully!",
      userId: userId,
      modelUrl: modelImageUrl,
      garmentUrl: garmentImageUrl
    };

  } catch (error) {
    console.error("💥 === GENERATION ERROR ===");
    console.error("🔍 Error type:", error.constructor.name);
    console.error("📝 Error message:", error.message);
    console.error("📚 Error stack:", error.stack);
    console.error("🔧 Full error:", error);
    
    // Check for specific error types
    if (error.message && error.message.includes('Authentication')) {
      console.error("🔐 Authentication error detected");
      throw new functions.https.HttpsError("unauthenticated", `Authentication failed: ${error.message}`);
    } else if (error.message && error.message.includes('Permission denied')) {
      console.error("🚫 Permission error detected");
      throw new functions.https.HttpsError("permission-denied", `Permission denied: ${error.message}`);
    } else if (error.message && error.message.includes('API key')) {
      console.error("🗝️ API key error detected");
      throw new functions.https.HttpsError("failed-precondition", `API configuration error: ${error.message}`);
    } else {
      console.error("⚠️ General error - throwing as internal");
      throw new functions.https.HttpsError("internal", `Generation failed: ${error.message}`);
    }
  }
});