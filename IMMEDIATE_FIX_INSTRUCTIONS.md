# 🚨 IMMEDIATE FIX FOR auth/invalid-app-credential ERROR

## ⚡ Quick Solution (5 minutes)

### The Problem
You're getting `auth/invalid-app-credential` because Firebase doesn't recognize `localhost` as an authorized domain.

### The Fix
**Access your app via `127.0.0.1` instead of `localhost`**

## 🔧 Step-by-Step Instructions

### Step 1: Add Domain to Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: `ai-fashion-studio-demo`
3. Go to **Authentication** → **Settings** → **Authorized domains**
4. Click **Add domain**
5. Enter: `127.0.0.1`
6. Click **Done**

### Step 2: Add Domain to reCAPTCHA Enterprise
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project: `ai-fashion-studio-demo`
3. Go to **Security** → **reCAPTCHA Enterprise**
4. Click on your key: `6LcdRMIrAAAAAKbZOpLW5JJzJS_fPvgi8JPyByR4`
5. In **Domains** section, add: `127.0.0.1`
6. Click **Save**

### Step 3: Check API Key Restrictions
1. In Google Cloud Console, go to **APIs & Services** → **Credentials**
2. Find your API key: `AIzaSyDJ0Ut9HLme5UJsh06Nj3GE-RHa1oCGZ6U`
3. Click on the key to edit
4. Under **Application restrictions** → **HTTP referrers**
5. Add: `127.0.0.1/*`
6. Click **Save**

### Step 4: Access Your App
1. **IMPORTANT**: Use `http://127.0.0.1:3000/signup-phone` instead of `localhost:3000`
2. Test the phone authentication flow
3. The `auth/invalid-app-credential` error should be resolved

## 🧪 Testing
```bash
# Open this URL in your browser:
http://127.0.0.1:3000/signup-phone

# Try with a real phone number
# The reCAPTCHA should work and SMS should be sent
```

## 💡 Why This Works
- Firebase requires domains to be explicitly authorized
- `localhost` and `127.0.0.1` are treated as different domains
- reCAPTCHA Enterprise must also know about the domain
- API keys can be restricted to specific domains

## 🔍 What You Should See
After the fix:
1. ✅ No more `auth/invalid-app-credential` error
2. ✅ reCAPTCHA challenge works
3. ✅ SMS verification codes are sent
4. ✅ Phone authentication completes successfully

## 📞 If You Still Have Issues
1. Clear browser cache and cookies
2. Try in incognito/private mode
3. Check browser console for any remaining errors
4. Verify all domains were added correctly

## 📋 Alternative Testing
If you want to test without fixing domains immediately:
1. Toggle **Test Mode: ON** in your app
2. Use Firebase test phone numbers like `+1 650-555-3434` with code `654321`
3. This bypasses domain restrictions for testing

---

**This fix should resolve your immediate issue in under 5 minutes!** 🚀
