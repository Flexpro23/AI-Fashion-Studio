'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { usePhoneAuth } from '@/contexts/PhoneAuthContext';
import PhoneInput from '@/components/PhoneInput';
import RecaptchaLoader from '@/components/RecaptchaLoader';

// Fashion icon component
const FashionIcon = ({ className }: { className?: string }) => (
  <div className={`relative ${className}`}>
    <svg viewBox="0 0 100 100" className="w-full h-full">
      {/* Abstract fashion icon inspired by elegant hangers or fabric */}
      <defs>
        <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--primary)" />
          <stop offset="100%" stopColor="var(--primary-alt)" />
        </linearGradient>
      </defs>
      <path
        d="M20 30 Q50 10 80 30 L75 40 Q50 25 25 40 Z M25 45 L75 45 L70 75 Q50 85 30 75 Z"
        fill="url(#iconGradient)"
        className="opacity-80"
      />
      <circle cx="50" cy="20" r="8" fill="url(#iconGradient)" className="opacity-60" />
    </svg>
  </div>
);

export default function LoginPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginWithEmailPassword } = useAuth();
  const { loginWithPhone } = usePhoneAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!phoneNumber || !password) {
        setError('Please enter both phone number and password.');
        return;
      }

      // Try to login with phone and password
      const success = await loginWithPhone(phoneNumber, password);
      if (success) {
        router.push('/studio');
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } catch (error: unknown) {
      setError('Failed to log in. Please check your credentials.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--background)] via-[var(--muted)] to-[var(--background)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.05'%3E%3Cpath d='M30 30c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        <div>
          {/* App Icon */}
          <div className="mx-auto h-16 w-16 mb-8">
            <FashionIcon className="h-full w-full text-[var(--primary)]" />
          </div>
          
          <div className="text-center">
            <h2 className="text-3xl font-bold text-[var(--foreground)] mb-2">AI Fashion Studio</h2>
            <p className="text-[var(--muted-foreground)] text-sm">Elegance meets innovation</p>
          </div>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Phone Number Input */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-[var(--foreground)] mb-2">
                PHONE NUMBER
              </label>
              <PhoneInput
                value={phoneNumber}
                onChange={setPhoneNumber}
                placeholder="Enter your phone number"
                className="w-full"
              />
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[var(--foreground)] mb-2">
                PASSWORD
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none relative block w-full px-4 py-3 border border-[var(--border)] placeholder-[var(--muted-foreground)] text-[var(--foreground)] bg-[var(--background)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent transition-all duration-200"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm dark:bg-red-900 dark:bg-opacity-20 dark:border-red-800 dark:text-red-400">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-[var(--primary)] to-[var(--primary-alt)] hover:from-[var(--primary-alt)] hover:to-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--ring)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing In...
                </div>
              ) : (
                <>
                  <span className="mr-2">📱</span>
                  Enter Studio
                </>
              )}
            </button>
          </div>

          <div className="text-center">
            <div className="text-sm text-[var(--muted-foreground)] mb-4">or</div>
            
            <button
              type="button"
              onClick={() => router.push('/login-email')}
              className="w-full flex justify-center py-2.5 px-4 border border-[var(--border)] text-sm font-medium rounded-xl text-[var(--foreground)] bg-[var(--background)] hover:bg-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--ring)] transition-all duration-200"
            >
              📧 Continue with Email
            </button>
          </div>

          <div className="text-center pt-4">
            <p className="text-sm text-[var(--muted-foreground)]">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => router.push('/signup-phone')}
                className="font-medium text-[var(--primary)] hover:text-[var(--primary-alt)] transition-colors duration-200"
              >
                Create Account & Get 2 Free Generations
              </button>
            </p>
          </div>
        </form>

        {/* reCAPTCHA Loader */}
        <RecaptchaLoader />

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-[var(--muted-foreground)]">
            CRAFTED FOR FASHION PROFESSIONALS
          </p>
        </div>
      </div>
    </div>
  );
}