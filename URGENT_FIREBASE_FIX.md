# 🚨 URGENT: Fix Firebase Authentication Error

## The Problem
You're getting this error:
```
Firebase: Error (auth/requests-to-this-api-identitytoolkit-method-google.cloud.identitytoolkit.v1.authenticationservice.signup-are-blocked.)
```

This means **Email/Password authentication is disabled** in your Firebase console.

## 🔥 IMMEDIATE FIX REQUIRED

### Step 1: Enable Authentication
1. **Go to**: https://console.firebase.google.com/
2. **Select your project**: `ai-fashion-studio-demo`
3. **Click "Authentication"** in the left sidebar
4. **Click "Sign-in method" tab**
5. **Find "Email/Password"** in the list
6. **Click on it** and toggle **"Enable"** to ON
7. **Click "Save"**

### Step 2: Verify Project Settings
1. **Check if billing is enabled**:
   - Go to https://console.cloud.google.com/
   - Select project `ai-fashion-studio-demo`
   - Go to "Billing" and ensure it's linked to a billing account
   
2. **Enable required APIs**:
   - Go to "APIs & Services" → "Library"
   - Search and enable: "Identity Toolkit API"

### Step 3: Test the Fix
1. **Try creating an account** on your website
2. **Should work immediately** after enabling authentication

## 🛡️ Why This Happens

Firebase projects have authentication **disabled by default** for security. You must manually enable each sign-in method you want to use.

## ✅ Verification

After completing Step 1, you should be able to:
- Create new accounts ✅
- Sign in with existing accounts ✅
- Access protected pages ✅

## 📞 Still Having Issues?

If the error persists after enabling authentication:
1. **Check browser console** for other errors
2. **Verify environment variables** are set correctly in Vercel
3. **Contact support**: +962790685302

## 🔧 Environment Variables (For Vercel)

Make sure these are set in your Vercel project:
```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCEK9JMQnmpEYLBrI4K4Se2_RF8gc8b6vY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=ai-fashion-studio-demo.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=ai-fashion-studio-demo
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=ai-fashion-studio-demo.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1057549888211
NEXT_PUBLIC_FIREBASE_APP_ID=1:1057549888211:web:a8c9b5d1f4e6h7i8j9k0l1m2n3o4p5q6
```

**This should fix the authentication error immediately!** 🚀
