// Quick diagnostic script for rate limiting issues
console.log('🔍 Firebase Rate Limit Diagnostic Tool');
console.log('=====================================');

// Check environment variables
console.log('\n📝 Environment Variables:');
console.log('NODE_ENV:', process.env.NODE_ENV || 'not set');
console.log('API Key:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'Present' : 'Missing');
console.log('Project ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'Missing');
console.log('reCAPTCHA Key:', process.env.NEXT_PUBLIC_FIREBASE_RECAPTCHA_ENTERPRISE_SITE_KEY ? 'Present' : 'Missing');
console.log('Testing Mode:', process.env.NEXT_PUBLIC_USE_PHONE_AUTH_TESTING || 'false');

// Check localStorage rate limiting
if (typeof window !== 'undefined') {
  console.log('\n💾 Local Storage Rate Limit Data:');
  
  // Check for Firebase rate limit timestamp
  const firebaseRateLimit = localStorage.getItem('firebase_rate_limit');
  if (firebaseRateLimit) {
    const timestamp = parseInt(firebaseRateLimit);
    const now = Date.now();
    const timeDiff = now - timestamp;
    const remainingMs = (15 * 60 * 1000) - timeDiff; // 15 minute cooldown
    
    if (remainingMs > 0) {
      const remainingMin = Math.ceil(remainingMs / 60000);
      console.log(`❌ Firebase rate limit active - ${remainingMin} minutes remaining`);
      console.log(`   Set at: ${new Date(timestamp)}`);
      console.log(`   Expires: ${new Date(timestamp + 15 * 60 * 1000)}`);
    } else {
      console.log('✅ Firebase rate limit expired, should be clear');
      localStorage.removeItem('firebase_rate_limit');
    }
  } else {
    console.log('✅ No Firebase rate limit found in localStorage');
  }
  
  // Check SMS attempt timestamps
  const keys = Object.keys(localStorage).filter(key => key.startsWith('sms_attempt_'));
  if (keys.length > 0) {
    console.log('\n📱 SMS Attempt History:');
    keys.forEach(key => {
      const timestamp = parseInt(localStorage.getItem(key));
      const phone = key.replace('sms_attempt_', '');
      const timeDiff = Date.now() - timestamp;
      const remainingMs = (5 * 60 * 1000) - timeDiff; // 5 minute cooldown
      
      if (remainingMs > 0) {
        const remainingMin = Math.ceil(remainingMs / 60000);
        console.log(`   ${phone}: ⏳ ${remainingMin}min cooldown remaining`);
      } else {
        console.log(`   ${phone}: ✅ Available`);
      }
    });
  } else {
    console.log('✅ No SMS attempt cooldowns found');
  }
}

// Network diagnostics
console.log('\n🌐 Network Information:');
if (typeof window !== 'undefined' && navigator.onLine !== undefined) {
  console.log('Online Status:', navigator.onLine ? 'Connected' : 'Offline');
}

// Current timestamp for reference
console.log('\n🕐 Current Time:', new Date().toISOString());

console.log('\n🚀 Next Steps:');
console.log('1. Check Firebase Console → Authentication → Usage');
console.log('2. Try from different network/IP');
console.log('3. Check App Check debug tokens');
console.log('4. Verify domain authorization');
console.log('\n📖 See RATE_LIMIT_INVESTIGATION_PLAN.md for detailed steps');
