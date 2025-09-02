# 🔥 Environment Variables Template

## For Local Development (.env.local)
Create a `.env.local` file in your project root with these values:

```bash
# 🔥 Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDJ0Ut9HLme5UJsh06Nj3GE-RHa1oCGZ6U
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=ai-fashion-studio-demo.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=ai-fashion-studio-demo
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=ai-fashion-studio-demo.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1057549888211
NEXT_PUBLIC_FIREBASE_APP_ID=1:1057549888211:web:2005ca2aaa8f324f4f0226

# 🔐 Security Variables
NEXTAUTH_SECRET=ai-fashion-studio-super-secure-secret-key-2024-production
NEXTAUTH_URL=http://localhost:3000

# 🌍 Environment
NODE_ENV=development
```

## For Vercel Production
Add these to Vercel → Settings → Environment Variables:

```bash
# 🔥 Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDJ0Ut9HLme5UJsh06Nj3GE-RHa1oCGZ6U
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=ai-fashion-studio-demo.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=ai-fashion-studio-demo
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=ai-fashion-studio-demo.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1057549888211
NEXT_PUBLIC_FIREBASE_APP_ID=1:1057549888211:web:2005ca2aaa8f324f4f0226

# 🔐 Security Variables  
NEXTAUTH_SECRET=ai-fashion-studio-super-secure-secret-key-2024-production
NEXTAUTH_URL=https://your-vercel-domain.vercel.app

# 🌍 Environment
NODE_ENV=production
```

## 📝 Setup Instructions:

### Local Development:
1. Copy the local development variables above
2. Create `.env.local` in your project root
3. Paste the variables
4. Run `npm run dev`

### Vercel Deployment:
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add each variable individually
3. Select ALL environments: Production, Preview, Development
4. Replace `your-vercel-domain` with your actual domain
5. Redeploy your project

### ⚠️ Important Notes:
- **NEVER** commit `.env.local` to git (it's in .gitignore)
- **ALWAYS** select all environments in Vercel
- **MUST** replace `your-vercel-domain` with actual domain
- **REQUIRED** to redeploy after adding environment variables
