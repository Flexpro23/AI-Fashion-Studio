// Firebase Authentication Debug Script
const admin = require('firebase-admin');

// Initialize Firebase Admin with service account
const serviceAccount = require('./functions/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'ai-fashion-studio-demo'
});

async function debugAuth() {
  console.log('=== FIREBASE AUTH DEBUG ===');
  
  try {
    // List all users
    const listUsersResult = await admin.auth().listUsers(1000);
    console.log(`Total users: ${listUsersResult.users.length}`);
    
    // Check if there are any users
    if (listUsersResult.users.length > 0) {
      const user = listUsersResult.users[0];
      console.log('Sample user:', {
        uid: user.uid,
        email: user.email,
        emailVerified: user.emailVerified,
        disabled: user.disabled,
        customClaims: user.customClaims
      });
      
      // Try to create a custom token
      const customToken = await admin.auth().createCustomToken(user.uid);
      console.log('Custom token created successfully:', customToken.substring(0, 50) + '...');
    }
    
    console.log('Firebase Auth is working correctly');
  } catch (error) {
    console.error('Firebase Auth error:', error);
  }
}

debugAuth();
