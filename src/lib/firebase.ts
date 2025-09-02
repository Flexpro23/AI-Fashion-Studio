import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

// Validate required environment variables
const requiredEnvVars = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Check for missing environment variables
const missingVars = Object.entries(requiredEnvVars)
  .filter(([, value]) => !value)
  .map(([key]) => `NEXT_PUBLIC_FIREBASE_${key.toUpperCase()}`);

if (missingVars.length > 0) {
  console.error('🚨 Missing Firebase Environment Variables:', missingVars);
  console.error('Please add these to your Vercel environment variables:');
  missingVars.forEach(varName => console.error(`- ${varName}`));
  
  // In production, throw an error to prevent deployment with missing config
  if (process.env.NODE_ENV === 'production') {
    throw new Error(`Missing required Firebase environment variables: ${missingVars.join(', ')}`);
  }
}

const firebaseConfig = {
  apiKey: requiredEnvVars.apiKey,
  authDomain: requiredEnvVars.authDomain,
  projectId: requiredEnvVars.projectId,
  storageBucket: requiredEnvVars.storageBucket,
  messagingSenderId: requiredEnvVars.messagingSenderId,
  appId: requiredEnvVars.appId,
};

// Initialize Firebase app (prevent duplicate initialization)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

// Development emulators (optional - uncomment if using Firebase emulators)
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  // Only connect emulators in browser environment during development
  // Uncomment these lines if you're using Firebase emulators locally:
  
  // if (!auth._delegate._authDomain.includes('firebase')) {
  //   connectAuthEmulator(auth, 'http://localhost:9099');
  // }
  // if (!db._delegate._databaseId.projectId.includes('demo')) {
  //   connectFirestoreEmulator(db, 'localhost', 8080);
  // }
  // if (!storage._location.bucket.includes('demo')) {
  //   connectStorageEmulator(storage, 'localhost', 9199);
  // }
  // if (!functions._region.includes('demo')) {
  //   connectFunctionsEmulator(functions, 'localhost', 5001);
  // }
}

// Log successful initialization
console.log('🔥 Firebase initialized successfully:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  environment: process.env.NODE_ENV,
  apiKeyPrefix: firebaseConfig.apiKey?.substring(0, 10) + '...',
});

export default app;
