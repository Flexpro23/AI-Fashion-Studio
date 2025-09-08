// Debug file to help identify the reCAPTCHA key issue
export const debugFirebaseConfig = () => {
  console.log('=== Firebase Debug Info ===');
  console.log('Environment Variables:');
  console.log('API Key:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY);
  console.log('Project ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
  console.log('Auth Domain:', process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN);
  
  console.log('Expected reCAPTCHA Enterprise Key: 6LcdRMIrAAAAAKbZOpLW5JJzJS_fPvgi8JPyByR4');
  
  // Check if any scripts are loaded with the old key
  const scripts = document.querySelectorAll('script');
  scripts.forEach((script, index) => {
    if (script.src && script.src.includes('recaptcha')) {
      console.log(`reCAPTCHA Script ${index}:`, script.src);
    }
  });
  
  // Check if there are any elements with reCAPTCHA classes
  const recaptchaElements = document.querySelectorAll('[class*="recaptcha"], [id*="recaptcha"]');
  console.log('reCAPTCHA Elements found:', recaptchaElements.length);
  recaptchaElements.forEach((el, index) => {
    console.log(`Element ${index}:`, el);
  });
  
  console.log('=== End Debug Info ===');
};
