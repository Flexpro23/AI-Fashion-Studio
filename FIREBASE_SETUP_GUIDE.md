# 🔥 Firebase Setup Guide - Complete Configuration

## 🚨 URGENT: Fixing the Authentication Blocked Error

The error `auth/requests-to-this-api-identitytoolkit-method-google.cloud.identitytoolkit.v1.authenticationservice.signup-are-blocked` indicates that Firebase Authentication is not properly configured.

### ⚡ Immediate Fix Steps:

#### 1. Enable Authentication in Firebase Console

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select your project**: `ai-fashion-studio-demo`
3. **Navigate to Authentication** → **Sign-in method**
4. **Enable Email/Password**:
   - Click on "Email/Password"
   - Toggle "Enable" to ON
   - Click "Save"

#### 2. Check Project Billing

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Select project**: `ai-fashion-studio-demo`
3. **Check Billing**: Ensure the project has a valid billing account
4. **Enable APIs**: Make sure Identity Toolkit API is enabled

#### 3. Verify API Quotas

1. **APIs & Services** → **Enabled APIs & services**
2. **Find "Identity Toolkit API"**
3. **Check quotas and ensure they're not exceeded**

## 🔧 Complete Firebase Project Setup

### Step 1: Create/Configure Firebase Project

```bash
# If starting fresh:
npm install -g firebase-tools
firebase login
firebase init
```

### Step 2: Authentication Configuration

#### Enable Sign-in Methods:
1. **Email/Password**: ✅ REQUIRED
2. **Google**: ✅ Recommended
3. **Anonymous**: ✅ Optional (for guest users)

#### Authorized Domains:
Add these domains to Authentication → Settings → Authorized domains:
- `localhost` (for development)
- `ai-fashion-studio.vercel.app` (your Vercel domain)
- `ai-fashion-studio-demo.firebaseapp.com` (Firebase hosting)

### Step 3: Firestore Database

#### Create Database:
1. **Go to Firestore Database**
2. **Create database in production mode**
3. **Choose location**: `us-central1` (or your preferred region)

#### Security Rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read and write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can read and write their own generations
    match /generations/{genId} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

### Step 4: Storage Configuration

#### Create Storage Bucket:
1. **Go to Storage**
2. **Get started**
3. **Choose location**: Same as Firestore

#### Storage Rules:
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow authenticated users to upload and read their own files
    match /generated/{userId}/{fileName} {
      allow read: if true; // Public read for generated images
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

#### CORS Configuration:
```json
[
  {
    "origin": ["*"],
    "method": ["GET", "HEAD", "OPTIONS"],
    "maxAgeSeconds": 86400,
    "responseHeader": [
      "Content-Type",
      "Content-Length", 
      "Date",
      "Server",
      "Cache-Control"
    ]
  }
]
```

Apply CORS:
```bash
gsutil cors set cors.json gs://ai-fashion-studio-demo.firebasestorage.app
```

### Step 5: Cloud Functions Setup

#### Deploy Functions:
```bash
cd functions
npm install
firebase deploy --only functions
```

#### Required APIs to Enable:
- Identity Toolkit API
- Cloud Functions API
- Cloud Firestore API
- Firebase Storage API
- Vertex AI API (for image generation)

## 🔍 Debugging Authentication Issues

### Check Firebase Configuration:

```javascript
// Add this to your app for debugging
console.log('Firebase Config:', {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
});
```

### Test Authentication:

```javascript
// Test function to verify auth is working
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export async function testAuth() {
  try {
    console.log('Testing Firebase Auth...');
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'test123456';
    
    const result = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
    console.log('Auth test successful:', result.user.uid);
    return true;
  } catch (error) {
    console.error('Auth test failed:', error);
    return false;
  }
}
```

## 🚀 Environment Variables for Vercel

### Production Environment Variables:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCEK9JMQnmpEYLBrI4K4Se2_RF8gc8b6vY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=ai-fashion-studio-demo.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=ai-fashion-studio-demo
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=ai-fashion-studio-demo.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1057549888211
NEXT_PUBLIC_FIREBASE_APP_ID=1:1057549888211:web:a8c9b5d1f4e6h7i8j9k0l1m2n3o4p5q6

# Security
NEXTAUTH_SECRET=generate-a-secure-random-string-here
NEXTAUTH_URL=https://your-vercel-domain.vercel.app
```

## 🔧 Troubleshooting Common Issues

### Issue 1: Authentication Blocked
**Solution**: Enable Email/Password in Firebase Console

### Issue 2: Billing Required  
**Solution**: Add valid billing account to Google Cloud Project

### Issue 3: API Not Enabled
**Solution**: Enable Identity Toolkit API in Google Cloud Console

### Issue 4: Domain Not Authorized
**Solution**: Add your domain to Firebase Auth authorized domains

### Issue 5: Quota Exceeded
**Solution**: Check API quotas in Google Cloud Console

## 📞 Support Contact

If Firebase setup issues persist:
- **Phone**: +962790685302
- **Email**: Setup support available during business hours

## ✅ Verification Checklist

- [ ] Firebase project created
- [ ] Authentication enabled (Email/Password)
- [ ] Billing account configured
- [ ] APIs enabled (Identity Toolkit, Firestore, Storage)
- [ ] Domains authorized
- [ ] Environment variables set
- [ ] Security rules deployed
- [ ] CORS configured
- [ ] Cloud Functions deployed
- [ ] Test user creation successful

## 🔄 After Setup

1. **Test locally**: `npm run dev`
2. **Test signup**: Create a test account
3. **Deploy to Vercel**: Push to GitHub
4. **Test production**: Verify on live site

Your Firebase setup should now be complete and authentication should work properly!
