# 🌐 Browser Console Diagnostic Commands

## 🎯 Instructions
1. Open your browser to: `http://127.0.0.1:3000/signup-phone`
2. Open Developer Tools (F12 or Cmd+Option+I)
3. Go to the **Console** tab
4. Copy and paste each command below one by one
5. Share the results to help identify the issue

---

## 📋 Diagnostic Commands

### 1. Check Current URL and Domain
```javascript
console.log("🌐 Current URL Info:", {
  origin: window.location.origin,
  hostname: window.location.hostname,
  href: window.location.href,
  protocol: window.location.protocol
});
```

### 2. Check Firebase Environment Variables
```javascript
console.log("🔧 Firebase Environment Check:", {
  apiKey: typeof window !== 'undefined' && process?.env?.NEXT_PUBLIC_FIREBASE_API_KEY?.slice(0,10) + '...',
  projectId: process?.env?.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  authDomain: process?.env?.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  recaptchaKey: process?.env?.NEXT_PUBLIC_FIREBASE_RECAPTCHA_ENTERPRISE_SITE_KEY?.slice(0,10) + '...',
  testingMode: process?.env?.NEXT_PUBLIC_USE_PHONE_AUTH_TESTING
});
```

### 3. Check Firebase App Initialization
```javascript
console.log("🔥 Firebase App Status:", {
  firebaseLoaded: typeof window?.firebase !== 'undefined',
  firebaseApp: window?.firebaseApp || 'Not available',
  firebaseAuth: window?.firebaseAuth || 'Not available'
});
```

### 4. Check reCAPTCHA Enterprise Availability
```javascript
console.log("🛡️ reCAPTCHA Enterprise Status:", {
  grecaptchaLoaded: typeof window?.grecaptcha !== 'undefined',
  enterpriseAPI: typeof window?.grecaptcha?.enterprise !== 'undefined',
  recaptchaScripts: Array.from(document.querySelectorAll('script')).filter(s => s.src.includes('recaptcha')).map(s => s.src)
});
```

### 5. Check reCAPTCHA Container
```javascript
console.log("📦 reCAPTCHA Container Status:", {
  containerExists: !!document.getElementById('recaptcha-container'),
  containerHTML: document.getElementById('recaptcha-container')?.outerHTML || 'Not found',
  allRecaptchaElements: document.querySelectorAll('[id*="recaptcha"], [class*="recaptcha"]').length
});
```

### 6. Check App Check Status
```javascript
console.log("🔒 App Check Status:", {
  appCheckDebugToken: localStorage.getItem('APP_CHECK_DEBUG_TOKEN'),
  debugTokenGlobal: window?.FIREBASE_APPCHECK_DEBUG_TOKEN || 'Not set'
});
```

### 7. Check Network Connectivity to Firebase
```javascript
fetch('https://identitytoolkit.googleapis.com/v1/projects')
  .then(response => console.log("🌍 Firebase API Connectivity:", { 
    status: response.status, 
    ok: response.ok,
    statusText: response.statusText 
  }))
  .catch(error => console.log("❌ Firebase API Error:", error));
```

### 8. Check Phone Auth Context Status
```javascript
// This should show the phone auth context state
console.log("📱 Phone Auth Context:", {
  phoneAuthContext: window?.phoneAuthContext || 'Check if usePhoneAuth hook is working',
  recaptchaVerifier: window?.recaptchaVerifier || 'Not initialized'
});
```

### 9. Manual reCAPTCHA Test
```javascript
// Try to manually initialize reCAPTCHA
if (window.grecaptcha?.enterprise) {
  console.log("✅ reCAPTCHA Enterprise is available");
  
  // Try to get site key
  const siteKey = process?.env?.NEXT_PUBLIC_FIREBASE_RECAPTCHA_ENTERPRISE_SITE_KEY || '6LcdRMIrAAAAAKbZOpLW5JJzJS_fPvgi8JPyByR4';
  console.log("🔑 Using site key:", siteKey?.slice(0,10) + '...');
  
} else {
  console.log("❌ reCAPTCHA Enterprise not available");
}
```

### 10. Check All Console Errors
```javascript
// Check for any console errors
console.log("🐛 Console Error Summary:");
console.log("Check the Console tab for any RED error messages");
console.log("Look specifically for:");
console.log("- 403 Forbidden errors");
console.log("- 400 Bad Request errors"); 
console.log("- auth/invalid-app-credential errors");
console.log("- reCAPTCHA related errors");
```

---

## 🔍 What to Look For

### ✅ **Good Signs:**
- Current hostname shows `127.0.0.1` (not `localhost`)
- Firebase environment variables are present
- reCAPTCHA Enterprise API is available
- reCAPTCHA container exists
- No 403/400 network errors

### ❌ **Problem Signs:**
- Hostname shows `localhost` instead of `127.0.0.1`
- Missing environment variables
- reCAPTCHA Enterprise not loaded
- Network errors to Firebase APIs
- `auth/invalid-app-credential` errors

---

## 📊 Network Tab Investigation

1. Open **Network** tab in Developer Tools
2. Try to send an OTP
3. Look for these requests:

### Expected Requests:
- `https://www.google.com/recaptcha/enterprise.js` - Should load successfully
- `https://identitytoolkit.googleapis.com/v1/accounts:sendVerificationCode` - This is where the error occurs

### Check for:
- **403 Forbidden**: Domain not authorized
- **400 Bad Request**: Invalid app credentials
- **Failed to load**: Network connectivity issues

---

## 🚨 Immediate Fix Commands

If you see domain issues, try these:

### Force 127.0.0.1 Access:
```javascript
if (window.location.hostname === 'localhost') {
  window.location.href = window.location.href.replace('localhost', '127.0.0.1');
}
```

### Clear All Firebase State:
```javascript
localStorage.clear();
sessionStorage.clear();
console.log("🧹 Cleared all storage - refresh the page");
```

---

## 📞 Share Results

When reporting issues, include:
1. All console command outputs
2. Any RED error messages from Console tab
3. Network tab screenshot showing failed requests
4. Your current URL (should be 127.0.0.1, not localhost)

This will help identify the exact root cause of the authentication failure!
