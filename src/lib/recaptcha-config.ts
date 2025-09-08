// reCAPTCHA Site Keys for different platforms
export const RECAPTCHA_SITE_KEYS = {
  // Web reCAPTCHA key for browser-based authentication
  WEB: '6LcVi8ErAAAAAGxaZyDPoDeSmedFlJMrhfjmqu4N',
  
  // Android reCAPTCHA key for Android app
  ANDROID: '6Ldri8ErAAAAAOYm3rzGPVYrUBUqoID309KnSL6w',
  
  // iOS reCAPTCHA key for iOS app
  IOS: '6Lefz8ErAAAAAIcXhITtxC-DXYBgeZEt8e7_0O28'
};

// Get the appropriate reCAPTCHA key based on platform
export function getRecaptchaSiteKey(): string {
  // For web applications, always use the WEB key
  return RECAPTCHA_SITE_KEYS.WEB;
}

// reCAPTCHA configuration settings
export const RECAPTCHA_CONFIG = {
  // Use invisible reCAPTCHA for better user experience
  size: 'invisible' as const,
  
  // Theme (can be 'light' or 'dark')
  theme: 'light' as const,
  
  // Badge position for invisible reCAPTCHA
  badge: 'bottomright' as const,
  
  // Language (auto-detect based on browser settings)
  hl: 'auto'
};

// Validation settings based on Firebase configuration
export const SMS_VALIDATION_CONFIG = {
  // SMS fraud risk threshold (matches Firebase setting: 0.5)
  fraudRiskThreshold: 0.5,
  
  // Maximum SMS attempts per phone number per day
  maxAttemptsPerDay: 3,
  
  // Cooldown period between attempts (in minutes)
  cooldownPeriod: 5,
  
  // Rate limiting per hour (matches Firebase: 100)
  maxSignupsPerHour: 100
};

export default {
  RECAPTCHA_SITE_KEYS,
  getRecaptchaSiteKey,
  RECAPTCHA_CONFIG,
  SMS_VALIDATION_CONFIG
};
