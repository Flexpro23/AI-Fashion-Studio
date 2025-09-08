'use client';

import { useState, useEffect } from 'react';
import OtpInput from 'react-otp-input';

interface OTPInputProps {
  value: string;
  onChange: (value: string) => void;
  numInputs?: number;
  isDisabled?: boolean;
  hasErrored?: boolean;
  placeholder?: string;
}

export default function OTPInput({ 
  value, 
  onChange, 
  numInputs = 6, 
  isDisabled = false, 
  hasErrored = false,
  placeholder = '•'
}: OTPInputProps) {
  const [timeLeft, setTimeLeft] = useState(30);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  const handleResend = () => {
    setTimeLeft(30);
    setCanResend(false);
    // TODO: Implement resend logic
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-6">
        <OtpInput
          value={value}
          onChange={onChange}
          numInputs={numInputs}
          renderSeparator={() => <span className="w-2" />}
          inputType="number"
          shouldAutoFocus
          renderInput={(props) => (
            <input
              {...props}
              style={{
                width: '100%',
                height: '48px',
                margin: '0 4px',
                fontSize: '18px',
                borderRadius: '12px',
                border: hasErrored ? '2px solid #ef4444' : '2px solid var(--border)',
                backgroundColor: 'var(--background)',
                color: 'var(--foreground)',
                textAlign: 'center',
                outline: 'none',
                transition: 'all 0.2s ease',
              }}
              disabled={isDisabled}
              placeholder={placeholder}
            />
          )}
        />
      </div>
      
      {/* Resend Timer */}
      <div className="text-center">
        {canResend ? (
          <button
            onClick={handleResend}
            className="text-[var(--primary)] hover:text-[var(--primary-alt)] font-medium transition-colors"
          >
            Resend Code
          </button>
        ) : (
          <p className="text-[var(--muted-foreground)] text-sm">
            Resend code in {timeLeft}s
          </p>
        )}
      </div>
    </div>
  );
}
