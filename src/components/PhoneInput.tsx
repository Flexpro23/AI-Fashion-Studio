'use client';

import { useState } from 'react';
import PhoneInputComponent from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
}

export default function PhoneInput({ 
  value, 
  onChange, 
  placeholder = "Enter phone number", 
  disabled = false,
  error 
}: PhoneInputProps) {
  return (
    <div className="w-full">
      <div className="relative">
        <PhoneInputComponent
          international
          defaultCountry="JO"
          value={value}
          onChange={(value) => onChange(value || '')}
          placeholder={placeholder}
          disabled={disabled}
          className={`phone-input ${error ? 'error' : ''}`}
        />
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      
      <style jsx global>{`
        .phone-input {
          width: 100%;
        }
        
        .phone-input .PhoneInputInput {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid var(--border);
          border-radius: 12px;
          background-color: var(--background);
          color: var(--foreground);
          font-size: 16px;
          transition: all 0.2s ease;
        }
        
        .phone-input .PhoneInputInput:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px var(--primary)/20;
        }
        
        .phone-input.error .PhoneInputInput {
          border-color: #ef4444;
        }
        
        .phone-input .PhoneInputCountrySelect {
          margin-right: 8px;
          padding: 8px;
          border: 2px solid var(--border);
          border-radius: 8px;
          background-color: var(--background);
          color: var(--foreground);
        }
        
        .phone-input .PhoneInputCountrySelect:focus {
          outline: none;
          border-color: var(--primary);
        }
        
        .phone-input .PhoneInputCountrySelectArrow {
          color: var(--muted-foreground);
        }
      `}</style>
    </div>
  );
}
