'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import StepByStepStudio from '@/components/StepByStepStudio';

export default function StudioPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--background)] via-[var(--surface)] to-[var(--background-alt)] flex items-center justify-center">
        <div className="loading-luxury w-8 h-8"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <StepByStepStudio />;
}
