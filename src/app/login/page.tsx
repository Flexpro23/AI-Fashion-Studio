'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      router.push('/studio');
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
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--primary-alt)] blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/3 w-48 h-48 rounded-full bg-gradient-to-br from-[var(--primary-alt)] to-[var(--primary)] blur-2xl"></div>
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10 animate-slide-up">
        {/* Header Section */}
        <div className="text-center space-y-6">
          <div className="mx-auto w-20 h-20 animate-scale-in">
            <FashionIcon />
          </div>
          <div className="space-y-2">
            <h1 className="text-display text-gradient font-bold">
              AI Fashion Studio
            </h1>
            <p className="text-body text-[var(--muted-foreground)]">
              Elegance meets innovation
            </p>
          </div>
        </div>
        
        {/* Login Card */}
        <div className="card-elevated animate-fade-in" style={{ animationDelay: '200ms' }}>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="border-gradient animate-slide-up">
                <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span>{error}</span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Email Input */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-caption text-[var(--foreground)]">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="Enter your email"
                autoComplete="email"
              />
            </div>
            
            {/* Password Input */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-caption text-[var(--foreground)]">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="Enter your password"
                autoComplete="current-password"
              />
            </div>
            
            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex justify-center items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="loading-luxury w-5 h-5"></div>
                  <span>Signing you in...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  <span>Enter Studio</span>
                </>
              )}
            </button>
          </form>

          {/* Signup Link */}
          <div className="text-center">
            <p className="text-[var(--muted-foreground)]">
              Don&apos;t have an account?{' '}
              <button
                onClick={() => router.push('/signup')}
                className="text-[var(--primary)] hover:underline font-medium"
              >
                Create Account & Get 2 Free Generations
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-caption text-[var(--muted-foreground)] animate-fade-in" style={{ animationDelay: '400ms' }}>
          Crafted for fashion professionals
        </div>
      </div>
    </div>
  );
}
