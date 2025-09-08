'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { 
  getAuth, 
  RecaptchaVerifier, 
  signInWithPhoneNumber,
  PhoneAuthProvider,
  signInWithCredential,
  ConfirmationResult
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

interface PhoneAuthContextType {
  // State
  phoneNumber: string;
  verificationId: string;
  confirmationResult: ConfirmationResult | null;
  isOtpSent: boolean;
  isVerifying: boolean;
  error: string;
  
  // Actions
  setPhoneNumber: (phone: string) => void;
  sendOTP: (phone: string) => Promise<boolean>;
  verifyOTP: (otp: string, userData?: { name: string; email?: string }) => Promise<boolean>;
  resetState: () => void;
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

  const sendOTP = async (phone: string): Promise<boolean> => {
    try {
      setIsVerifying(true);
      setError('');

      // Initialize reCAPTCHA
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
          callback: () => {
            // reCAPTCHA solved
          },
          'expired-callback': () => {
            setError('reCAPTCHA expired. Please try again.');
          }
        });
      }

      const appVerifier = window.recaptchaVerifier;
      
      // Send OTP
      const confirmationResult = await signInWithPhoneNumber(auth, phone, appVerifier);
      
      setConfirmationResult(confirmationResult);
      setPhoneNumber(phone);
      setIsOtpSent(true);
      setIsVerifying(false);
      
      return true;
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      setError(getErrorMessage(error));
      setIsVerifying(false);
      
      // Reset reCAPTCHA on error
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
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
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      setError(getErrorMessage(error));
      setIsVerifying(false);
      return false;
    }
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

  const getErrorMessage = (error: any): string => {
    switch (error.code) {
      case 'auth/invalid-phone-number':
        return 'Invalid phone number. Please check the format.';
      case 'auth/too-many-requests':
        return 'Too many requests. Please try again later.';
      case 'auth/invalid-verification-code':
        return 'Invalid verification code. Please try again.';
      case 'auth/code-expired':
        return 'Verification code has expired. Please request a new one.';
      case 'auth/missing-phone-number':
        return 'Phone number is required.';
      case 'auth/quota-exceeded':
        return 'SMS quota exceeded. Please try again later.';
      default:
        return error.message || 'An error occurred. Please try again.';
    }
  };

  const value = {
    phoneNumber,
    verificationId,
    confirmationResult,
    isOtpSent,
    isVerifying,
    error,
    setPhoneNumber,
    sendOTP,
    verifyOTP,
    resetState
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
