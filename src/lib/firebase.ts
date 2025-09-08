import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, collection, getDocs } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check';
import { PredefinedModel } from '@/types';

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

// Initialize App Check with reCAPTCHA Enterprise
let appCheck = null;
if (typeof window !== 'undefined') {
  try {
    const recaptchaKey = process.env.NEXT_PUBLIC_FIREBASE_RECAPTCHA_ENTERPRISE_SITE_KEY;

    // Enable App Check debug token for local dev if none registered
    if (process.env.NODE_ENV !== 'production') {
      // Use existing token if set in localStorage, otherwise auto-generate
      const existingToken = localStorage.getItem('APP_CHECK_DEBUG_TOKEN');
      // @ts-expect-error: debug token is an undocumented global
      self.FIREBASE_APPCHECK_DEBUG_TOKEN = existingToken || true;
      console.log('🔧 App Check debug token enabled for development');
    }

    // Ensure the reCAPTCHA Enterprise script is loaded with the site key
    if (recaptchaKey) {
      const hasEnterpriseScript = Array.from(document.getElementsByTagName('script')).some(
        (s) => s.src.includes('recaptcha/enterprise.js')
      );
      if (!hasEnterpriseScript) {
        const script = document.createElement('script');
        script.src = `https://www.google.com/recaptcha/enterprise.js?render=${recaptchaKey}`;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }

      appCheck = initializeAppCheck(app, {
        provider: new ReCaptchaEnterpriseProvider(recaptchaKey),
        isTokenAutoRefreshEnabled: true
      });
      console.log('✅ App Check initialized successfully with reCAPTCHA Enterprise');
    } else {
      console.warn('⚠️  reCAPTCHA Enterprise key not found in environment variables');
    }
  } catch (error) {
    console.error('❌ Failed to initialize App Check:', error);
    console.log('📝 Make sure App Check is properly configured in Firebase Console');
  }
}

export { appCheck };


// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app, 'us-central1');

// Optional: Disable app verification in dev for phone auth testing with test numbers
if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production' && process.env.NEXT_PUBLIC_USE_PHONE_AUTH_TESTING === 'true') {
  try {
    // Only use with Firebase Console > Authentication > Phone > "Phone numbers for testing"
    (auth as any).settings.appVerificationDisabledForTesting = true;
    console.warn('⚠️  Phone Auth app verification disabled for testing (dev only).');
  } catch (err) {
    console.warn('Could not disable app verification for testing:', err);
  }
}

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

// Firebase initialized successfully

// Service function to fetch predefined models from Firestore
export const getPredefinedModels = async (): Promise<PredefinedModel[]> => {
  try {
    const modelsCollection = collection(db, 'predefinedModels');
    const modelSnapshot = await getDocs(modelsCollection);
    
    if (modelSnapshot.empty) {
      return [];
    }
    
    const modelList = modelSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as PredefinedModel[];
    
    return modelList;
  } catch (error) {
    console.error('Error fetching predefined models:', error);
    return [];
  }
};

export default app;
