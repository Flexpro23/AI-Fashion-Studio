'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePhoneAuth } from '@/contexts/PhoneAuthContext';
import PhoneInput from '@/components/PhoneInput';
import OTPInput from '@/components/OTPInput';
import RecaptchaLoader from '@/components/RecaptchaLoader';
import { isValidPhoneNumber } from 'libphonenumber-js';

type Step = 'phone' | 'otp' | 'profile';

export default function PhoneSignupPage() {
  const router = useRouter();
  const { 
    phoneNumber, 
    isOtpSent, 
    isVerifying, 
    error, 
    sendOTP, 
    verifyOTP, 
    resetState 
  } = usePhoneAuth();

  const [step, setStep] = useState<Step>('phone');
  const [formData, setFormData] = useState({
    phone: '',
    otp: '',
    name: '',
    email: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validatePhone = (phone: string): boolean => {
    if (!phone) {
      setFormErrors({ phone: 'Phone number is required' });
      return false;
    }
    
    if (!isValidPhoneNumber(phone)) {
      setFormErrors({ phone: 'Please enter a valid phone number' });
      return false;
    }

    setFormErrors({});
    return true;
  };

  const validateProfile = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSendOTP = async () => {
    if (!validatePhone(formData.phone)) return;

    const success = await sendOTP(formData.phone);
    if (success) {
      setStep('otp');
    }
  };

  const handleVerifyOTP = async () => {
    if (!formData.otp || formData.otp.length !== 6) {
      setFormErrors({ otp: 'Please enter the 6-digit code' });
      return;
    }

    // For new signups, we need profile info
    if (step === 'otp') {
      setStep('profile');
      return;
    }

    // Final verification with profile data
    const success = await verifyOTP(formData.otp, {
      name: formData.name,
      email: formData.email || undefined
    });

    if (success) {
      router.push('/studio');
    }
  };

  const handleCompleteSignup = async () => {
    if (!validateProfile()) return;

    const success = await verifyOTP(formData.otp, {
      name: formData.name,
      email: formData.email || undefined
    });

    if (success) {
      router.push('/studio');
    }
  };

  const handleBack = () => {
    if (step === 'otp') {
      resetState();
      setStep('phone');
    } else if (step === 'profile') {
      setStep('otp');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--background)] via-[var(--surface)] to-[var(--background-alt)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gradient mb-2">Create Account</h1>
          <p className="text-[var(--muted-foreground)]">
            {step === 'phone' && 'Enter your phone number to get started'}
            {step === 'otp' && 'Enter the verification code'}
            {step === 'profile' && 'Complete your profile'}
          </p>
        </div>

        <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-6 shadow-xl">
          {/* Progress Indicator */}
          <div className="flex justify-center mb-6">
            <div className="flex space-x-2">
              {['phone', 'otp', 'profile'].map((currentStep, index) => (
                <div
                  key={currentStep}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    step === currentStep 
                      ? 'bg-[var(--primary)]' 
                      : index < ['phone', 'otp', 'profile'].indexOf(step)
                      ? 'bg-[var(--primary)]'
                      : 'bg-[var(--border)]'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Phone Number Step */}
          {step === 'phone' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Phone Number
                </label>
                <PhoneInput
                  value={formData.phone}
                  onChange={(value) => setFormData({ ...formData, phone: value })}
                  placeholder="Enter your phone number"
                  error={formErrors.phone}
                  disabled={isVerifying}
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              <button
                onClick={handleSendOTP}
                disabled={isVerifying || !formData.phone}
                className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isVerifying ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Sending Code...</span>
                  </div>
                ) : (
                  'Send Verification Code'
                )}
              </button>

              <div className="text-center">
                <p className="text-sm text-[var(--muted-foreground)]">
                  Already have an account?{' '}
                  <button
                    onClick={() => router.push('/login')}
                    className="text-[var(--primary)] hover:text-[var(--primary-alt)] font-medium"
                  >
                    Sign In
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* OTP Verification Step */}
          {step === 'otp' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-4 text-center">
                  Enter the 6-digit code sent to {formData.phone}
                </label>
                <OTPInput
                  value={formData.otp}
                  onChange={(value) => setFormData({ ...formData, otp: value })}
                  hasErrored={!!formErrors.otp}
                />
                {formErrors.otp && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400 text-center">
                    {formErrors.otp}
                  </p>
                )}
              </div>

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              <div className="space-y-3">
                <button
                  onClick={handleVerifyOTP}
                  disabled={isVerifying || formData.otp.length !== 6}
                  className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isVerifying ? 'Verifying...' : 'Continue'}
                </button>

                <button
                  onClick={handleBack}
                  className="w-full btn-secondary py-3"
                >
                  Back
                </button>
              </div>
            </div>
          )}

          {/* Profile Completion Step */}
          {step === 'profile' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter your full name"
                  className={`w-full px-4 py-3 border-2 rounded-xl bg-[var(--background)] text-[var(--foreground)] transition-colors ${
                    formErrors.name ? 'border-red-500' : 'border-[var(--border)] focus:border-[var(--primary)]'
                  }`}
                />
                {formErrors.name && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter your email address"
                  className={`w-full px-4 py-3 border-2 rounded-xl bg-[var(--background)] text-[var(--foreground)] transition-colors ${
                    formErrors.email ? 'border-red-500' : 'border-[var(--border)] focus:border-[var(--primary)]'
                  }`}
                />
                {formErrors.email && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.email}</p>
                )}
              </div>

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              <div className="space-y-3">
                <button
                  onClick={handleCompleteSignup}
                  disabled={isVerifying || !formData.name.trim()}
                  className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isVerifying ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Creating Account...</span>
                    </div>
                  ) : (
                    'Complete Signup'
                  )}
                </button>

                <button
                  onClick={handleBack}
                  className="w-full btn-secondary py-3"
                >
                  Back
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Terms */}
        <p className="text-xs text-[var(--muted-foreground)] text-center mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>

        {/* reCAPTCHA Loader */}
        <RecaptchaLoader />
      </div>
    </div>
  );
}
