// 🔍 COPY AND PASTE THIS ENTIRE SCRIPT INTO BROWSER CONSOLE
// Go to: http://127.0.0.1:3000/signup-phone
// Open DevTools → Console → Paste this script → Press Enter

console.log('🔍 AI Fashion Studio - Complete Browser Diagnostic');
console.log('================================================');

// 1. Environment Variables Check
console.log('\n1️⃣ ENVIRONMENT VARIABLES CHECK');
console.log('==============================');

const envVars = {
  apiKey: typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_FIREBASE_API_KEY,
  projectId: typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  authDomain: typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  recaptchaKey: typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_FIREBASE_RECAPTCHA_ENTERPRISE_SITE_KEY,
  testingMode: typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_USE_PHONE_AUTH_TESTING
};

Object.entries(envVars).forEach(([key, value]) => {
  const status = value ? '✅' : '❌';
  const displayValue = key.includes('Key') && value ? value.slice(0, 10) + '...' : value;
  console.log(`${status} ${key}: ${displayValue || 'MISSING'}`);
});

// 2. Current URL and Domain Check
console.log('\n2️⃣ URL AND DOMAIN CHECK');
console.log('========================');
console.log('Current Origin:', window.location.origin);
console.log('Current Hostname:', window.location.hostname);
console.log('Current URL:', window.location.href);
console.log('Protocol:', window.location.protocol);

const expectedOrigin = 'http://127.0.0.1:3000';
const isCorrectOrigin = window.location.origin === expectedOrigin;
console.log(`✅ Correct Origin (${expectedOrigin}):`, isCorrectOrigin ? '✅ YES' : '❌ NO');

// 3. Firebase App Status
console.log('\n3️⃣ FIREBASE APP STATUS');
console.log('======================');

// Check if Firebase is loaded
const firebaseLoaded = typeof window.firebase !== 'undefined';
console.log('Firebase SDK Loaded:', firebaseLoaded ? '✅ YES' : '❌ NO');

// Check Firebase app instance
try {
  const firebaseApps = window.firebase?.apps || [];
  console.log('Firebase Apps Count:', firebaseApps.length);
  
  if (firebaseApps.length > 0) {
    const app = firebaseApps[0];
    console.log('✅ Firebase App Config:', {
      projectId: app.options.projectId,
      apiKey: app.options.apiKey?.slice(0, 10) + '...',
      authDomain: app.options.authDomain
    });
  }
} catch (error) {
  console.log('❌ Firebase App Error:', error.message);
}

// 4. Firebase Auth Status
console.log('\n4️⃣ FIREBASE AUTH STATUS');
console.log('========================');

try {
  const auth = window.firebase?.auth?.();
  if (auth) {
    console.log('✅ Firebase Auth Instance:', 'Available');
    console.log('Auth Current User:', auth.currentUser || 'None');
    console.log('Auth App:', auth.app?.options?.projectId);
  } else {
    console.log('❌ Firebase Auth:', 'Not available');
  }
} catch (error) {
  console.log('❌ Firebase Auth Error:', error.message);
}

// 5. reCAPTCHA Status
console.log('\n5️⃣ reCAPTCHA STATUS');
console.log('===================');

// Check reCAPTCHA Enterprise
const grecaptchaLoaded = typeof window.grecaptcha !== 'undefined';
const enterpriseLoaded = typeof window.grecaptcha?.enterprise !== 'undefined';

console.log('reCAPTCHA Script Loaded:', grecaptchaLoaded ? '✅ YES' : '❌ NO');
console.log('reCAPTCHA Enterprise API:', enterpriseLoaded ? '✅ YES' : '❌ NO');

// Check reCAPTCHA scripts
const recaptchaScripts = Array.from(document.querySelectorAll('script'))
  .filter(script => script.src.includes('recaptcha'))
  .map(script => script.src);

console.log('reCAPTCHA Scripts:', recaptchaScripts.length);
recaptchaScripts.forEach((src, index) => {
  console.log(`  ${index + 1}. ${src}`);
});

// 6. reCAPTCHA Container Check
console.log('\n6️⃣ reCAPTCHA CONTAINER CHECK');
console.log('============================');

const recaptchaContainer = document.getElementById('recaptcha-container');
console.log('Container Exists:', recaptchaContainer ? '✅ YES' : '❌ NO');

if (recaptchaContainer) {
  console.log('Container HTML:', recaptchaContainer.outerHTML);
  console.log('Container Children:', recaptchaContainer.children.length);
  console.log('Container Visible:', recaptchaContainer.offsetHeight > 0);
}

// 7. App Check Status
console.log('\n7️⃣ APP CHECK STATUS');
console.log('===================');

const appCheckDebugToken = localStorage.getItem('APP_CHECK_DEBUG_TOKEN');
const globalDebugToken = window.FIREBASE_APPCHECK_DEBUG_TOKEN;

console.log('App Check Debug Token (localStorage):', appCheckDebugToken || 'Not set');
console.log('App Check Debug Token (global):', globalDebugToken || 'Not set');

// 8. Network Connectivity Test
console.log('\n8️⃣ NETWORK CONNECTIVITY TEST');
console.log('=============================');

// Test Firebase API connectivity
const apiKey = envVars.apiKey || 'AIzaSyDJ0Ut9HLme5UJsh06Nj3GE-RHa1oCGZ6U';
const testUrl = `https://identitytoolkit.googleapis.com/v1/projects?key=${apiKey}`;

console.log('Testing Firebase API connectivity...');
fetch(testUrl, { method: 'GET' })
  .then(response => {
    console.log('✅ Firebase API Test:', {
      status: response.status,
      ok: response.ok,
      statusText: response.statusText,
      url: response.url
    });
  })
  .catch(error => {
    console.log('❌ Firebase API Test Failed:', error.message);
  });

// 9. Phone Auth Context Check
console.log('\n9️⃣ PHONE AUTH CONTEXT CHECK');
console.log('===========================');

// Try to access phone auth context
try {
  // Look for React DevTools or context
  const reactRoot = document.querySelector('#__next, [data-reactroot]');
  console.log('React Root Found:', reactRoot ? '✅ YES' : '❌ NO');
  
  // Check for any phone auth related global variables
  const phoneAuthGlobals = Object.keys(window).filter(key => 
    key.toLowerCase().includes('phone') || 
    key.toLowerCase().includes('auth') ||
    key.toLowerCase().includes('recaptcha')
  );
  
  console.log('Phone Auth Related Globals:', phoneAuthGlobals.length);
  phoneAuthGlobals.forEach(key => {
    console.log(`  - window.${key}:`, typeof window[key]);
  });
  
} catch (error) {
  console.log('❌ Phone Auth Context Error:', error.message);
}

// 10. Manual reCAPTCHA Test
console.log('\n🔟 MANUAL reCAPTCHA TEST');
console.log('========================');

if (window.grecaptcha?.enterprise) {
  const siteKey = envVars.recaptchaKey || '6LcdRMIrAAAAAKbZOpLW5JJzJS_fPvgi8JPyByR4';
  
  console.log('Attempting manual reCAPTCHA initialization...');
  console.log('Site Key:', siteKey?.slice(0, 10) + '...');
  
  try {
    // This is just a test - don't actually render
    console.log('✅ reCAPTCHA Enterprise ready for initialization');
    console.log('Site Key Format:', /^6L[\w-]{38}$/.test(siteKey) ? '✅ Valid' : '❌ Invalid');
  } catch (error) {
    console.log('❌ reCAPTCHA Test Error:', error.message);
  }
} else {
  console.log('❌ reCAPTCHA Enterprise not available for testing');
}

// 11. Browser Storage Check
console.log('\n1️⃣1️⃣ BROWSER STORAGE CHECK');
console.log('===========================');

console.log('LocalStorage Items:');
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  if (key?.includes('firebase') || key?.includes('auth') || key?.includes('recaptcha')) {
    console.log(`  - ${key}: ${localStorage.getItem(key)?.slice(0, 50)}...`);
  }
}

console.log('SessionStorage Items:');
for (let i = 0; i < sessionStorage.length; i++) {
  const key = sessionStorage.key(i);
  if (key?.includes('firebase') || key?.includes('auth') || key?.includes('recaptcha')) {
    console.log(`  - ${key}: ${sessionStorage.getItem(key)?.slice(0, 50)}...`);
  }
}

// 12. Console Error Summary
console.log('\n1️⃣2️⃣ CONSOLE ERROR SUMMARY');
console.log('===========================');

console.log('🔍 Look for RED errors in the Console tab above');
console.log('🔍 Check Network tab for failed requests');
console.log('🔍 Look specifically for:');
console.log('   - 403 Forbidden errors');
console.log('   - 400 Bad Request errors');
console.log('   - auth/invalid-app-credential');
console.log('   - Failed to load recaptcha scripts');

// Final Summary
console.log('\n🎯 DIAGNOSTIC COMPLETE!');
console.log('========================');
console.log('✅ Environment check complete');
console.log('✅ Firebase status checked');
console.log('✅ reCAPTCHA status verified');
console.log('✅ Network connectivity tested');
console.log('');
console.log('📋 NEXT STEPS:');
console.log('1. Review all the output above');
console.log('2. Look for any ❌ RED errors');
console.log('3. Check Network tab for failed requests');
console.log('4. Try sending an OTP and watch for errors');
console.log('');
console.log('💬 Share this entire console output for analysis!');
