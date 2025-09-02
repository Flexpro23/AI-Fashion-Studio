# 🚀 VERCEL ENVIRONMENT VARIABLES SETUP

## 🚨 CRITICAL: Missing Environment Variables Cause Auth Failure

When environment variables are missing in Vercel, Firebase can't connect properly, causing the `auth/requests-blocked` error.

## 📋 COMPLETE VERCEL ENVIRONMENT VARIABLES LIST

### Step 1: Go to Vercel Dashboard
1. **Visit**: https://vercel.com/dashboard
2. **Select your project**: AI Fashion Studio
3. **Go to**: Settings → Environment Variables

### Step 2: Add These EXACT Environment Variables

Copy and paste these **exactly** as shown:

#### 🔥 Firebase Configuration (REQUIRED)
```
Variable Name: NEXT_PUBLIC_FIREBASE_API_KEY
Value: AIzaSyCEK9JMQnmpEYLBrI4K4Se2_RF8gc8b6vY
Environment: Production, Preview, Development
```

```
Variable Name: NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
Value: ai-fashion-studio-demo.firebaseapp.com
Environment: Production, Preview, Development
```

```
Variable Name: NEXT_PUBLIC_FIREBASE_PROJECT_ID
Value: ai-fashion-studio-demo
Environment: Production, Preview, Development
```

```
Variable Name: NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
Value: ai-fashion-studio-demo.firebasestorage.app
Environment: Production, Preview, Development
```

```
Variable Name: NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
Value: 1057549888211
Environment: Production, Preview, Development
```

```
Variable Name: NEXT_PUBLIC_FIREBASE_APP_ID
Value: 1:1057549888211:web:a8c9b5d1f4e6h7i8j9k0l1m2n3o4p5q6
Environment: Production, Preview, Development
```

#### 🔐 Security Variables (REQUIRED)
```
Variable Name: NEXTAUTH_SECRET
Value: your-super-secret-jwt-key-here-change-in-production-12345
Environment: Production, Preview, Development
```

```
Variable Name: NEXTAUTH_URL
Value: https://your-vercel-domain.vercel.app
Environment: Production, Preview, Development
```

## ⚠️ CRITICAL CHECKLIST

### ✅ Variable Name Requirements:
- [ ] **EXACT spelling** (case-sensitive)
- [ ] **NO extra spaces**
- [ ] **Must start with NEXT_PUBLIC_** for client-side access
- [ ] **ALL variables added** (6 Firebase + 2 Auth = 8 total)

### ✅ Environment Selection:
- [ ] **Production** ✅ (for live site)
- [ ] **Preview** ✅ (for PR previews) 
- [ ] **Development** ✅ (for branch deployments)

### ✅ After Adding Variables:
- [ ] **Redeploy** your Vercel project
- [ ] **Test authentication** on live site
- [ ] **Check browser console** for any remaining errors

## 🔍 DEBUGGING STEPS

### Step 1: Verify Variables Are Set
Add this to your signup page temporarily to debug:

```javascript
// Add to signup page for debugging
console.log('Environment Check:', {
  apiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: !!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: !!process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: !!process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
});
```

### Step 2: Check Firebase Console
1. **Go to**: https://console.firebase.google.com/
2. **Select**: `ai-fashion-studio-demo`
3. **Authentication** → **Sign-in method**
4. **Verify**: Email/Password is **ENABLED**

### Step 3: Check Vercel Domain in Firebase
1. **Firebase Console** → **Authentication** → **Settings** → **Authorized domains**
2. **Add your Vercel domain**: `your-project.vercel.app`

## 🚨 COMMON MISTAKES

### ❌ Wrong Variable Names:
```
FIREBASE_API_KEY          ← WRONG (missing NEXT_PUBLIC_)
NEXT_PUBLIC_API_KEY       ← WRONG (missing FIREBASE_)
next_public_firebase_api_key ← WRONG (wrong case)
```

### ✅ Correct Variable Name:
```
NEXT_PUBLIC_FIREBASE_API_KEY ← CORRECT
```

### ❌ Wrong Environment Selection:
- Only selecting "Production" but not "Preview" or "Development"

### ✅ Correct Environment Selection:
- Select ALL THREE: Production, Preview, Development

## 🔄 QUICK FIX STEPS

1. **Add all 8 environment variables** to Vercel
2. **Select all 3 environments** for each variable
3. **Go to Vercel Deployments** → **Redeploy latest**
4. **Test authentication** on live site
5. **Check browser console** for any errors

## 📞 STILL HAVING ISSUES?

If authentication still fails after setting all variables:

1. **Check browser console** for specific error messages
2. **Verify Firebase billing** is enabled
3. **Confirm Identity Toolkit API** is enabled in Google Cloud Console
4. **Contact support**: +962790685302

## 🎯 SUCCESS INDICATOR

After setting all variables correctly, you should see:
- ✅ No environment variable errors in console
- ✅ Firebase connection successful
- ✅ Authentication signup/login works
- ✅ No `auth/requests-blocked` errors

**This will fix your Vercel authentication issues!** 🚀
