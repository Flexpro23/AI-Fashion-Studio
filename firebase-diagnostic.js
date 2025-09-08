#!/usr/bin/env node

// Firebase Project Diagnostic Tool
console.log('🔍 Firebase Project Diagnostic Report');
console.log('=====================================\n');

// Environment Analysis
console.log('📝 ENVIRONMENT CONFIGURATION');
console.log('============================');

const requiredEnvVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
  'NEXT_PUBLIC_FIREBASE_RECAPTCHA_ENTERPRISE_SITE_KEY',
  'NEXT_PUBLIC_USE_PHONE_AUTH_TESTING'
];

// Load environment variables
require('dotenv').config({ path: '.env.local' });

let envStatus = 'PASSED';

requiredEnvVars.forEach(envVar => {
  const value = process.env[envVar];
  const status = value ? '✅' : '❌';
  
  if (!value) envStatus = 'FAILED';
  
  if (envVar.includes('KEY') || envVar.includes('ID')) {
    console.log(`${status} ${envVar}: ${value ? value.substring(0, 20) + '...' : 'MISSING'}`);
  } else {
    console.log(`${status} ${envVar}: ${value || 'MISSING'}`);
  }
});

console.log(`\n🎯 Environment Status: ${envStatus}\n`);

// Firebase SDK Configuration Verification
console.log('🔧 FIREBASE SDK CONFIGURATION');
console.log('=============================');

const expectedConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

console.log('Expected Configuration:');
Object.entries(expectedConfig).forEach(([key, value]) => {
  console.log(`  ${key}: ${value || 'MISSING'}`);
});

// Project Validation
console.log('\n🚀 PROJECT VALIDATION');
console.log('=====================');

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;
const recaptchaKey = process.env.NEXT_PUBLIC_FIREBASE_RECAPTCHA_ENTERPRISE_SITE_KEY;

console.log(`Project ID: ${projectId}`);
console.log(`App ID: ${appId}`);
console.log(`reCAPTCHA Key: ${recaptchaKey ? recaptchaKey.substring(0, 10) + '...' : 'MISSING'}`);

// Expected vs Actual validation
const expectedProjectId = 'ai-fashion-studio-demo';
const expectedAppId = '1:1057549888211:web:2005ca2aaa8f324f4f0226';

console.log(`\n✅ Project ID Match: ${projectId === expectedProjectId ? 'YES' : 'NO'}`);
console.log(`✅ App ID Match: ${appId === expectedAppId ? 'YES' : 'NO'}`);

// Domain Configuration Check
console.log('\n🌐 DOMAIN CONFIGURATION');
console.log('=======================');

console.log('Required Authorized Domains:');
console.log('  ✅ localhost (for development)');
console.log('  ❓ 127.0.0.1 (CRITICAL - check if added to Firebase Console)');
console.log('  ❓ your-production-domain.com (for production)');

console.log('\nreCAPTCHA Enterprise Domains (must match Firebase authorized domains):');
console.log('  ❓ localhost');
console.log('  ❓ 127.0.0.1 (CRITICAL - check in Google Cloud Console)');

// Common Issues Checklist
console.log('\n🔧 COMMON ISSUES CHECKLIST');
console.log('==========================');

const issues = [
  {
    check: '127.0.0.1 added to Firebase authorized domains',
    status: '❓ MANUAL CHECK REQUIRED',
    fix: 'Firebase Console → Authentication → Settings → Authorized domains → Add: 127.0.0.1'
  },
  {
    check: '127.0.0.1 added to reCAPTCHA Enterprise allowlisted domains',
    status: '❓ MANUAL CHECK REQUIRED', 
    fix: 'Google Cloud Console → reCAPTCHA Enterprise → Your Key → Add domain: 127.0.0.1'
  },
  {
    check: 'API Key restrictions properly configured',
    status: '❓ MANUAL CHECK REQUIRED',
    fix: 'Google Cloud Console → APIs & Services → Credentials → Add HTTP referrer: 127.0.0.1/*'
  },
  {
    check: 'App Check debug token configured',
    status: '❓ MANUAL CHECK REQUIRED',
    fix: 'Firebase Console → App Check → Debug tokens → Add token'
  },
  {
    check: 'SMS toll fraud protection configured',
    status: '❓ MANUAL CHECK REQUIRED',
    fix: 'Firebase Console → Authentication → Sign-in method → Phone → SMS settings'
  }
];

issues.forEach((issue, index) => {
  console.log(`${index + 1}. ${issue.check}`);
  console.log(`   Status: ${issue.status}`);
  console.log(`   Fix: ${issue.fix}\n`);
});

// Browser Console Commands
console.log('🌐 BROWSER CONSOLE DIAGNOSTIC COMMANDS');
console.log('======================================');

console.log('Copy and paste these commands in your browser console at http://127.0.0.1:3000/signup-phone:\n');

console.log('1. Check Firebase App initialization:');
console.log('   console.log("Firebase:", window.firebase || "Not loaded");');

console.log('\n2. Check reCAPTCHA Enterprise availability:');
console.log('   console.log("reCAPTCHA:", window.grecaptcha?.enterprise || "Not loaded");');

console.log('\n3. Check environment variables in browser:');
console.log('   console.log("Env check:", {');
console.log('     apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.slice(0,10),');
console.log('     projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,');
console.log('     recaptchaKey: process.env.NEXT_PUBLIC_FIREBASE_RECAPTCHA_ENTERPRISE_SITE_KEY?.slice(0,10)');
console.log('   });');

console.log('\n4. Check current domain and URL:');
console.log('   console.log("Current:", { origin: window.location.origin, href: window.location.href });');

console.log('\n5. Check network errors:');
console.log('   // Open Network tab and look for failed requests to:');
console.log('   // - identitytoolkit.googleapis.com');
console.log('   // - recaptcha-enterprise.js');
console.log('   // - Any 403/400 errors');

console.log('\n6. Check App Check status:');
console.log('   // Look for console messages about App Check debug tokens');

// Next Steps
console.log('\n🎯 IMMEDIATE NEXT STEPS');
console.log('======================');

console.log('1. 🔴 CRITICAL: Access your app via http://127.0.0.1:3000/signup-phone');
console.log('2. 🔴 CRITICAL: Add 127.0.0.1 to Firebase Console authorized domains');
console.log('3. 🔴 CRITICAL: Add 127.0.0.1 to reCAPTCHA Enterprise allowlisted domains');
console.log('4. 📊 Run browser console commands above to check status');
console.log('5. 🐛 Check browser Network tab for failed requests');
console.log('6. 📞 Test phone authentication flow');

console.log('\n🆘 IF ISSUES PERSIST');
console.log('====================');
console.log('1. Try in incognito/private mode');
console.log('2. Clear browser cache and cookies');
console.log('3. Try different network (mobile hotspot)');
console.log('4. Use test phone numbers: +1 650-555-3434 with code 654321');
console.log('5. Check IMMEDIATE_FIX_INSTRUCTIONS.md for step-by-step guide');

console.log('\n📧 SUPPORT INFORMATION');
console.log('======================');
console.log('When asking for help, include:');
console.log('1. This diagnostic report output');
console.log('2. Browser console logs');
console.log('3. Network tab screenshots');
console.log('4. Exact error messages');
console.log('5. Steps to reproduce');

console.log('\n✅ Diagnostic Complete!');
console.log(`Generated at: ${new Date().toISOString()}`);
