'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { 
  signInWithPhoneNumber,
  ConfirmationResult,
  RecaptchaVerifier
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { debugFirebaseConfig } from '@/lib/firebase-debug';
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

interface PhoneAuthContextType {
  // State
  phoneNumber: string;
  verificationId: string;
  confirmationResult: ConfirmationResult | null;
  isOtpSent: boolean;
  isVerifying: boolean;
  error: string;
  isTestMode: boolean;
  
  // Actions
  setPhoneNumber: (phone: string) => void;
  sendOTP: (phone: string) => Promise<boolean>;
  verifyOTP: (otp: string, userData?: { name: string; email?: string }) => Promise<boolean>;
  loginWithPhone: (phone: string, password: string) => Promise<boolean>;
  resetState: () => void;
  toggleTestMode: () => void;
}

const PhoneAuthContext = createContext<PhoneAuthContextType | undefined>(undefined);

interface CustomPhoneAuthProviderProps {
  children: ReactNode;
}

export function CustomPhoneAuthProvider({ children }: CustomPhoneAuthProviderProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [isTestMode, setIsTestMode] = useState(process.env.NEXT_PUBLIC_USE_PHONE_AUTH_TESTING === 'true');

  const sendOTP = async (phone: string): Promise<boolean> => {
    try {
      setIsVerifying(true);
      setError('');
      
      // Debug: Log Firebase configuration
      debugFirebaseConfig();

      // Ensure reCAPTCHA Enterprise script is available before creating verifier
      await new Promise<void>((resolve) => {
        if (typeof window !== 'undefined' && (window as any).grecaptcha?.enterprise) {
          console.log('✅ reCAPTCHA Enterprise already loaded');
          resolve();
        } else {
          console.log('⏳ Waiting for reCAPTCHA Enterprise to load...');
          const checkInterval = setInterval(() => {
            if ((window as any).grecaptcha?.enterprise) {
              console.log('✅ reCAPTCHA Enterprise loaded successfully');
              clearInterval(checkInterval);
              resolve();
            }
          }, 50);
          // Safety timeout
          setTimeout(() => {
            console.warn('⚠️ Timeout waiting for reCAPTCHA Enterprise, proceeding anyway');
            clearInterval(checkInterval);
            resolve();
          }, 3000);
        }
      });

      // Skip client cooldown if in testing mode
      if (!isTestMode) {
        // Check rate limiting (basic client-side check)
        const lastAttempt = localStorage.getItem(`sms_attempt_${phone}`);
        if (lastAttempt) {
          const timeDiff = Date.now() - parseInt(lastAttempt);
          const cooldownMs = 5 * 60 * 1000; // 5 minutes
          if (timeDiff < cooldownMs) {
            const remainingMin = Math.ceil((cooldownMs - timeDiff) / 60000);
            setError(`Please wait ${remainingMin} minute(s) before requesting another code.`);
            setIsVerifying(false);
            return false;
          }
        }
      }

      // Check for Firebase rate limiting (15 minute cooldown)
      const firebaseRateLimit = localStorage.getItem('firebase_rate_limit');
      if (firebaseRateLimit) {
        const timeDiff = Date.now() - parseInt(firebaseRateLimit);
        const cooldownMs = 15 * 60 * 1000; // 15 minutes
        if (timeDiff < cooldownMs) {
          const remainingMin = Math.ceil((cooldownMs - timeDiff) / 60000);
          setError(`Rate limit exceeded. Please wait ${remainingMin} minute(s) before trying again.`);
          setIsVerifying(false);
          return false;
        } else {
          // Clear the rate limit if cooldown has passed
          localStorage.removeItem('firebase_rate_limit');
        }
      }

      // Create reCAPTCHA verifier (App Check will handle the verification)
      if (!window.recaptchaVerifier) {
        // Clear any existing reCAPTCHA container
        const container = document.getElementById('recaptcha-container');
        if (container) {
          container.innerHTML = '';
        }
        
        // Choose reCAPTCHA size based on testing mode
        const recaptchaSize = isTestMode ? 'invisible' : 'normal';
        console.log(`🔧 Creating reCAPTCHA verifier with size: ${recaptchaSize} (Test Mode: ${isTestMode})`);
        
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: recaptchaSize,
          callback: () => {
            console.log('✅ reCAPTCHA verified for phone auth');
          },
          'error-callback': (error: unknown) => {
            console.error('❌ reCAPTCHA error:', error);
            setError('reCAPTCHA verification failed. Please try again.');
          }
        });
        
        // For visible reCAPTCHA, render it immediately
        if (recaptchaSize === 'normal') {
          try {
            await window.recaptchaVerifier.render();
            console.log('✅ Visible reCAPTCHA rendered successfully');
          } catch (renderError) {
            console.error('❌ Failed to render visible reCAPTCHA:', renderError);
          }
        }
      }
      
      // Send OTP with the verifier (App Check will handle the actual verification)
      console.log('📞 Attempting to send SMS to:', phone);
      console.log('🔐 reCAPTCHA verifier ready:', !!window.recaptchaVerifier);
      
      const confirmationResult = await signInWithPhoneNumber(auth, phone, window.recaptchaVerifier);
      
      console.log('✅ SMS sent successfully, confirmation result received');
      console.log('📋 Confirmation result verificationId:', confirmationResult.verificationId ? 'Present' : 'Missing');
      
      setConfirmationResult(confirmationResult);
      setPhoneNumber(phone);
      setIsOtpSent(true);
      setIsVerifying(false);
      
      if (!isTestMode) {
        // Record attempt timestamp for rate limiting
        localStorage.setItem(`sms_attempt_${phone}`, Date.now().toString());
      }
      
      return true;
    } catch (error: unknown) {
      console.error('❌ Error sending OTP:', error);
      
      // Log detailed error information
      if (error && typeof error === 'object') {
        const firebaseError = error as any;
        console.error('Error code:', firebaseError.code);
        console.error('Error message:', firebaseError.message);
        console.error('Error details:', firebaseError);
      }
      
      // Handle rate limiting
      if (error && typeof error === 'object' && 'code' in error && error.code === 'auth/too-many-requests') {
        // Record the rate limit timestamp
        localStorage.setItem('firebase_rate_limit', Date.now().toString());
      }
      
      setError(getErrorMessage(error));
      setIsVerifying(false);
      
      // Reset reCAPTCHA on error
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch (clearError) {
          console.warn('Could not clear reCAPTCHA verifier:', clearError);
        }
        window.recaptchaVerifier = null;
      }
      
      return false;
    }
  };

  const verifyOTP = async (otp: string, userData?: { name: string; email?: string }): Promise<boolean> => {
    try {
      setIsVerifying(true);
      setError('');

      if (!confirmationResult) {
        setError('No verification session found. Please request a new code.');
        setIsVerifying(false);
        return false;
      }

      // Verify OTP
      const result = await confirmationResult.confirm(otp);
      const user = result.user;

      // Check if user document exists
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        // Create new user document for first-time users
        await setDoc(userRef, {
          phoneNumber: phoneNumber,
          name: userData?.name || '',
          email: userData?.email || null,
          createdAt: new Date(),
          remainingGenerations: 2,
          totalGenerations: 0,
          authMethod: 'phone',
          isPhoneVerified: true,
          isEmailVerified: false,
          lastLoginAt: new Date()
        });
      } else {
        // Update last login for existing users
        await setDoc(userRef, {
          lastLoginAt: new Date()
        }, { merge: true });
      }

      setIsVerifying(false);
      resetState();
      return true;
    } catch (error: unknown) {
      console.error('Error verifying OTP:', error);
      setError(getErrorMessage(error));
      setIsVerifying(false);
      return false;
    }
  };

  // Function to login with phone and password (for existing users)
  const loginWithPhone = async (phone: string, password: string): Promise<boolean> => {
    try {
      setIsVerifying(true);
      setError('');

      // For existing users, we need to use email/password auth but find the user by phone
      // First, try to find the user document by phone number
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('phone', '==', phone));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError('No account found with this phone number.');
        setIsVerifying(false);
        return false;
      }

      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();
      
      if (!userData.email) {
        setError('This account was not set up with email authentication.');
        setIsVerifying(false);
        return false;
      }

      // Use email/password auth for existing users
      const { signInWithEmailAndPassword } = await import('firebase/auth');
      await signInWithEmailAndPassword(auth, userData.email, password);
      
      setIsVerifying(false);
      return true;

    } catch (error: unknown) {
      console.error('Phone login error:', error);
      setError('Invalid phone number or password.');
      setIsVerifying(false);
      return false;
    }
  };

  const toggleTestMode = () => {
    setIsTestMode(!isTestMode);
    console.log(`🔄 Test mode toggled to: ${!isTestMode}`);
    // Reset state when switching modes
    resetState();
  };

  const resetState = () => {
    setPhoneNumber('');
    setVerificationId('');
    setConfirmationResult(null);
    setIsOtpSent(false);
    setIsVerifying(false);
    setError('');
    
    // Clean up reCAPTCHA
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
      window.recaptchaVerifier = null;
    }
  };

  const getErrorMessage = (error: unknown): string => {
    if (!error || typeof error !== 'object' || !('code' in error)) {
      return 'An error occurred. Please try again.';
    }
    
    const errorCode = (error as { code: string }).code;
    switch (errorCode) {
      case 'auth/invalid-phone-number':
        return 'Invalid phone number. Please check the format.';
      case 'auth/too-many-requests':
        return 'Too many requests. Please wait 15 minutes before trying again.';
      case 'auth/invalid-verification-code':
        return 'Invalid verification code. Please try again.';
      case 'auth/code-expired':
        return 'Verification code has expired. Please request a new one.';
      case 'auth/missing-phone-number':
        return 'Phone number is required.';
      case 'auth/quota-exceeded':
        return 'SMS quota exceeded. Please try again later.';
      case 'auth/invalid-app-credential':
        return 'Authentication configuration error. Please contact support or try again later.';
      case 'auth/app-not-authorized':
        return 'App not authorized for this operation. Please try again.';
      case 'auth/captcha-check-failed':
        return 'reCAPTCHA verification failed. Please refresh and try again.';
      default:
        return (error as { message?: string }).message || 'An error occurred. Please try again.';
    }
  };

  const value = {
    phoneNumber,
    verificationId,
    confirmationResult,
    isOtpSent,
    isVerifying,
    error,
    isTestMode,
    setPhoneNumber,
    sendOTP,
    verifyOTP,
    loginWithPhone,
    resetState,
    toggleTestMode
  };

  return (
    <PhoneAuthContext.Provider value={value}>
      {children}
      {/* reCAPTCHA container */}
      <div id="recaptcha-container"></div>
    </PhoneAuthContext.Provider>
  );
}

export function usePhoneAuth() {
  const context = useContext(PhoneAuthContext);
  if (context === undefined) {
    throw new Error('usePhoneAuth must be used within a PhoneAuthProvider');
  }
  return context;
}

// Global declaration for reCAPTCHA
declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier | null;
  }
}
