'use client';

import { useEffect } from 'react';
import { getRecaptchaSiteKey } from '@/lib/recaptcha-config';

interface RecaptchaLoaderProps {
  onLoad?: () => void;
}

export default function RecaptchaLoader({ onLoad }: RecaptchaLoaderProps) {
  useEffect(() => {
    // Clean up any existing reCAPTCHA instances
    const cleanup = () => {
      // Remove any existing reCAPTCHA scripts
      const existingScripts = document.querySelectorAll('script[src*="recaptcha"]');
      existingScripts.forEach(script => script.remove());
      
      // Clear reCAPTCHA container
      const container = document.getElementById('recaptcha-container');
      if (container) {
        container.innerHTML = '';
      }
      
      // Clear global reCAPTCHA variables
      if (window.grecaptcha) {
        delete window.grecaptcha;
      }
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch (e) {}
        window.recaptchaVerifier = null;
      }
    };

    // Load reCAPTCHA with our specific site key
    const loadRecaptcha = () => {
      cleanup();
      
      const siteKey = getRecaptchaSiteKey();
      console.log('Loading reCAPTCHA with site key:', siteKey);
      
      // Create script element for reCAPTCHA
      const script = document.createElement('script');
      script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}&hl=en`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        console.log('reCAPTCHA script loaded successfully');
        if (onLoad) {
          setTimeout(onLoad, 100); // Small delay to ensure reCAPTCHA is fully initialized
        }
      };
      
      script.onerror = (error) => {
        console.error('Failed to load reCAPTCHA script:', error);
      };
      
      document.head.appendChild(script);
    };

    loadRecaptcha();

    // Cleanup on unmount
    return cleanup;
  }, [onLoad]);

  return (
    <>
      {/* Invisible reCAPTCHA container */}
      <div id="recaptcha-container" style={{ display: 'none' }}></div>
    </>
  );
}
