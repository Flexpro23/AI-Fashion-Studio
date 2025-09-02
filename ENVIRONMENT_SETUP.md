# 🔐 Environment Variables Setup

## Required Environment Variables for Vercel Deployment

Add these to your Vercel project environment variables:

### Firebase Configuration (Required)
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCEK9JMQnmpEYLBrI4K4Se2_RF8gc8b6vY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=ai-fashion-studio-demo.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=ai-fashion-studio-demo
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=ai-fashion-studio-demo.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1057549888211
NEXT_PUBLIC_FIREBASE_APP_ID=1:1057549888211:web:a8c9b5d1f4e6h7i8j9k0l1m2n3o4p5q6
```

### Firebase Admin (for Cloud Functions - Add to Firebase Functions config)
```bash
# These should be set in Firebase Functions environment
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
```

### Security & Production
```bash
NEXTAUTH_SECRET=generate-a-secure-random-string-here
NEXTAUTH_URL=https://your-vercel-domain.vercel.app
```

## Local Development (.env.local)

Create a `.env.local` file in your project root:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCEK9JMQnmpEYLBrI4K4Se2_RF8gc8b6vY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=ai-fashion-studio-demo.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=ai-fashion-studio-demo
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=ai-fashion-studio-demo.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1057549888211
NEXT_PUBLIC_FIREBASE_APP_ID=1:1057549888211:web:a8c9b5d1f4e6h7i8j9k0l1m2n3o4p5q6

# Development
NEXTAUTH_SECRET=your-dev-secret
NEXTAUTH_URL=http://localhost:3000
```

## Firebase Functions Service Account Setup

For the Cloud Functions to work properly:

1. Download your Firebase service account key from Firebase Console > Project Settings > Service Accounts
2. Save it as `functions/service-account-key.json` (this file is gitignored)
3. Deploy functions with: `firebase deploy --only functions`

## Vercel Deployment Steps

1. Import project from GitHub to Vercel
2. Set framework preset to "Next.js"
3. Add all environment variables listed above
4. Deploy!

## Security Notes

- ✅ Service account keys removed from code
- ✅ All sensitive data moved to environment variables
- ✅ Production-ready security headers configured
- ✅ CORS policies properly set
