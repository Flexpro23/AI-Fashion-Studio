'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push('/studio');
      } else {
        router.push('/login');
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--background)] via-[var(--surface)] to-[var(--background-alt)] flex items-center justify-center relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--primary-alt)] blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/3 w-48 h-48 rounded-full bg-gradient-to-br from-[var(--primary-alt)] to-[var(--primary)] blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="text-center space-y-8 relative z-10">
          {/* Enhanced Logo Animation */}
          <div className="relative">
            <div className="loading-luxury w-24 h-24 mx-auto"></div>
            <div className="absolute -top-2 -right-2 text-2xl animate-bounce">✨</div>
            <div className="absolute -bottom-2 -left-2 text-xl animate-bounce" style={{ animationDelay: '0.5s' }}>🎨</div>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-5xl font-bold text-gradient">AI Fashion Studio</h2>
            <p className="text-xl text-[var(--muted-foreground)] animate-pulse">Preparing your creative space...</p>
            
            {/* Loading Progress Indicator */}
            <div className="w-64 mx-auto mt-8">
              <div className="h-2 bg-[var(--border)] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--primary-alt)] rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
