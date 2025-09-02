# 🚀 AI Fashion Studio - Vercel Deployment Guide

## 📋 Pre-Deployment Checklist

### 1. Environment Variables Setup

Create a `.env.local` file in your project root with the following variables:

```bash
# Firebase Configuration (Required)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCEK9JMQnmpEYLBrI4K4Se2_RF8gc8b6vY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=ai-fashion-studio-demo.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=ai-fashion-studio-demo
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=ai-fashion-studio-demo.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1057549888211
NEXT_PUBLIC_FIREBASE_APP_ID=1:1057549888211:web:a8c9b5d1f4e6h7i8j9k0l1m2n3o4p5q6

# Security (Generate new ones for production)
NEXTAUTH_SECRET=your-super-secret-jwt-key-here-change-in-production
NEXTAUTH_URL=https://your-domain.vercel.app

# Optional: Enhanced Features
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id
SENTRY_DSN=your-sentry-dsn
```

### 2. Firebase Project Configuration

Ensure your Firebase project has:
- ✅ Authentication enabled
- ✅ Firestore Database created
- ✅ Storage bucket configured
- ✅ Cloud Functions deployed
- ✅ Proper security rules

## 🌐 Vercel Deployment Steps

### Step 1: GitHub Repository Setup

1. Push your code to GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/Flexpro23/AI-Fashion-Studio.git
git push -u origin main
```

### Step 2: Vercel Project Creation

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure project settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

### Step 3: Environment Variables Configuration

In Vercel Dashboard → Project Settings → Environment Variables, add:

| Variable | Value | Environment |
|----------|-------|-------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | `AIzaSyCEK9JMQnmpEYLBrI4K4Se2_RF8gc8b6vY` | Production, Preview |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `ai-fashion-studio-demo.firebaseapp.com` | Production, Preview |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `ai-fashion-studio-demo` | Production, Preview |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `ai-fashion-studio-demo.firebasestorage.app` | Production, Preview |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `1057549888211` | Production, Preview |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | `1:1057549888211:web:a8c9b5d1f4e6h7i8j9k0l1m2n3o4p5q6` | Production, Preview |
| `NEXTAUTH_SECRET` | Generate a secure random string | Production, Preview |
| `NEXTAUTH_URL` | Your Vercel domain URL | Production, Preview |

### Step 4: Domain Configuration

1. In Vercel Dashboard → Project Settings → Domains
2. Add your custom domain (optional)
3. Configure DNS settings as instructed

## ⚠️ Potential Issues & Solutions

### Issue 1: Build Errors

**Problem**: TypeScript compilation errors
**Solution**: 
```bash
npm run type-check
# Fix any TypeScript errors before deployment
```

### Issue 2: Firebase Authentication

**Problem**: Authentication not working on Vercel
**Solution**: Add your Vercel domain to Firebase Auth:
1. Firebase Console → Authentication → Settings → Authorized domains
2. Add `your-project.vercel.app`

### Issue 3: Storage CORS Issues

**Problem**: Image access blocked by CORS policy
**Solution**: Configure Firebase Storage CORS:
```bash
# Install Google Cloud SDK first if not installed
# https://cloud.google.com/sdk/docs/install

# Authenticate with Google Cloud
gcloud auth login

# Set the project
gcloud config set project ai-fashion-studio-demo

# Apply CORS configuration
gsutil cors set cors.json gs://ai-fashion-studio-demo.firebasestorage.app
```

The `cors.json` file is already included in the project and configured for public image access.

### Issue 4: Cloud Functions

**Problem**: Cloud Functions not accessible
**Solution**: Ensure Functions have proper CORS headers and are deployed in the same region

### Issue 5: Environment Variables

**Problem**: Environment variables not working
**Solution**: 
- Ensure all variables start with `NEXT_PUBLIC_` for client-side access
- Redeploy after adding environment variables
- Check variable names match exactly

## 🔧 Build Optimization

### Next.js Configuration

The `next.config.ts` is optimized for production:
- Image optimization enabled
- Bundle analyzer available
- Proper headers for security

### Performance Optimizations

- ✅ Image optimization with Next.js Image component
- ✅ Code splitting and lazy loading
- ✅ Compressed assets
- ✅ Optimized fonts and CSS
- ✅ Service worker for caching (optional)

## 📊 Monitoring & Analytics

### Recommended Integrations

1. **Vercel Analytics**: Automatic performance monitoring
2. **Sentry**: Error tracking and performance monitoring
3. **Google Analytics**: User behavior tracking

## 🔄 Continuous Deployment

Once configured, Vercel will automatically:
- Build and deploy on every push to main branch
- Create preview deployments for pull requests
- Roll back deployments if needed

## 🛡️ Security Considerations

### Production Security Checklist

- ✅ Generate new `NEXTAUTH_SECRET` for production
- ✅ Enable HTTPS only (Vercel default)
- ✅ Configure proper Firebase security rules
- ✅ Set up proper CORS policies
- ✅ Enable Vercel's security headers
- ✅ Regular dependency updates

### Firebase Security Rules

Ensure your Firestore rules are production-ready:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /generations/{generationId} {
      allow read, write, delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

## 🎯 Post-Deployment Testing

After deployment, test:
- ✅ User registration and login
- ✅ Image upload functionality
- ✅ AI generation process
- ✅ Download and copy features
- ✅ Mobile responsiveness
- ✅ Settings page functionality
- ✅ Pricing page and contact features

## 📞 Support

If you encounter issues:
1. Check Vercel deployment logs
2. Verify Firebase configuration
3. Test environment variables
4. Check browser console for errors
5. Review Cloud Functions logs

## 🚀 Quick Deploy Command

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy directly
vercel --prod
```

---

**🎉 Your AI Fashion Studio is now ready for production!**
