# 🔧 Fix CORS Issue for Firebase Storage

## 🚨 Issue Detected
Your app shows CORS errors when trying to access Firebase Storage images:
```
Access to fetch at 'https://storage.googleapis.com/...' has been blocked by CORS policy
```

## 🔧 Solution: Apply CORS Configuration

### Method 1: Using Google Cloud Console (Recommended)
1. **Go to:** https://console.cloud.google.com/
2. **Select project:** `ai-fashion-studio-demo`
3. **Navigate to:** Cloud Storage → Buckets
4. **Find bucket:** `ai-fashion-studio-demo.firebasestorage.app`
5. **Click:** Permissions tab
6. **Add CORS configuration:**

```json
[
  {
    "origin": ["*"],
    "method": ["GET", "HEAD", "OPTIONS"],
    "responseHeader": [
      "Content-Type",
      "Content-Length",
      "Date",
      "Server",
      "Cache-Control",
      "Access-Control-Allow-Origin"
    ],
    "maxAgeSeconds": 86400
  }
]
```

### Method 2: Using gsutil (Command Line)
If you have Google Cloud SDK installed:

```bash
# Install Google Cloud SDK first if not installed
# https://cloud.google.com/sdk/docs/install

# Authenticate
gcloud auth login

# Set project
gcloud config set project ai-fashion-studio-demo

# Apply CORS configuration
gsutil cors set cors.json gs://ai-fashion-studio-demo.firebasestorage.app
```

### Method 3: Alternative Image Loading
Update your image loading to use Firebase Storage SDK instead of direct URLs:

```javascript
// Instead of direct fetch, use Firebase Storage
import { ref, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';

// Get proper download URL
const imageRef = ref(storage, 'path/to/image.jpg');
const downloadURL = await getDownloadURL(imageRef);
```

## ✅ After Fixing CORS
- Images will load directly in the browser
- No more CORS errors in console
- Better user experience
- Images will display properly in your app

## 🔍 Test the Fix
1. Apply CORS configuration
2. Wait 5-10 minutes for propagation
3. Refresh your app
4. Try generating new images
5. Check console for CORS errors (should be gone)

The CORS issue is preventing images from displaying properly but is not a security risk.
