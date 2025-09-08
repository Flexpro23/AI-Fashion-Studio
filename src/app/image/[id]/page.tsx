'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Generation {
  id: string;
  userId: string;
  imageUrl: string;
  modelImageUrl: string;
  garmentImageUrl: string;
  modelUsed: string;
  createdAt: Date;
}

export default function ImageDetailPage() {
  const [generation, setGeneration] = useState<Generation | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(true);
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();

  useEffect(() => {
    const fetchGeneration = async () => {
      if (!user || !params.id) return;

      try {
        const docRef = doc(db, 'generations', params.id as string);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          
          // Verify user owns this generation
          if (data.userId !== user.uid) {
            router.push('/lookbook');
            return;
          }

          setGeneration({
            id: docSnap.id,
            ...data,
            createdAt: data.createdAt.toDate()
          } as Generation);
        } else {
          router.push('/lookbook');
        }
      } catch (error) {
        console.error('Error fetching generation:', error);
        router.push('/lookbook');
      } finally {
        setLoading(false);
      }
    };

    fetchGeneration();
  }, [user, params.id, router]);

  const handleDownload = async () => {
    if (!generation) return;

    try {
      const response = await fetch(generation.imageUrl, {
        mode: 'cors',
        credentials: 'omit'
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ai-fashion-${generation.id}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      // Fallback: open in new tab for manual download
      const link = document.createElement('a');
      link.href = generation.imageUrl;
      link.target = '_blank';
      link.download = `ai-fashion-${generation.id}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--background)] via-[var(--surface)] to-[var(--background-alt)] flex items-center justify-center">
        <div className="loading-luxury w-8 h-8"></div>
      </div>
    );
  }

  if (!generation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--background)] via-[var(--surface)] to-[var(--background-alt)] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[var(--foreground)] mb-4">Image Not Found</h1>
          <button
            onClick={() => router.push('/lookbook')}
            className="bg-[var(--primary)] text-[var(--primary-foreground)] px-6 py-3 rounded-xl hover:opacity-90 transition-opacity"
          >
            Back to Gallery
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--background)] via-[var(--surface)] to-[var(--background-alt)] pb-24">
      {/* Mobile-First Header */}
      <div className="sticky top-0 bg-[var(--background)]/95 backdrop-blur-md border-b border-[var(--border)] z-10">
        <div className="px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-[var(--hover)] rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-lg sm:text-xl font-semibold text-[var(--foreground)]">Image Details</h1>
              <p className="text-xs sm:text-sm text-[var(--muted-foreground)] hidden sm:block">
                {generation.createdAt.toLocaleDateString()}
              </p>
            </div>
          </div>
          
          {/* Simple Download Button */}
          <button
            onClick={handleDownload}
            className="p-2 sm:p-3 bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 rounded-lg transition-opacity touch-target"
            title="Download Image"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </button>
        </div>
      </div>

      <div className="px-3 sm:px-4 py-4 sm:py-8 max-w-6xl mx-auto">
        {/* Generated Image - Top Priority */}
        <div className="mb-6 sm:mb-8">
          <div className="relative bg-[var(--surface)] rounded-2xl overflow-hidden shadow-xl border border-[var(--border)]">
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-[var(--muted)]">
                <div className="loading-luxury w-8 h-8"></div>
              </div>
            )}
            <img
              src={generation.imageUrl}
              alt="AI Generated Fashion"
              className="w-full h-auto object-contain max-h-[60vh] sm:max-h-[70vh]"
              onLoad={() => setImageLoading(false)}
              onError={() => setImageLoading(false)}
            />
            
            {/* AI Badge */}
            <div className="absolute top-3 left-3 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-alt)] rounded-full px-3 py-1.5 flex items-center space-x-2">
              <svg className="w-3 h-3 sm:w-4 sm:h-4 text-[var(--primary-foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707" />
              </svg>
              <span className="text-xs sm:text-sm font-medium text-[var(--primary-foreground)]">AI Generated</span>
            </div>
          </div>
        </div>

        {/* Original Images - Side by Side */}
        <div className="grid grid-cols-2 gap-3 sm:gap-6 mb-6">
          {/* Model Image */}
          <div className="bg-[var(--surface)] rounded-xl sm:rounded-2xl overflow-hidden border border-[var(--border)]">
            <div className="p-3 sm:p-4 border-b border-[var(--border)]">
              <h3 className="text-sm sm:text-base font-semibold text-[var(--foreground)]">Model</h3>
            </div>
            <div className="relative">
              <img
                src={generation.modelImageUrl}
                alt="Original Model"
                className="w-full aspect-[3/4] object-cover"
              />
            </div>
          </div>

          {/* Garment Image */}
          <div className="bg-[var(--surface)] rounded-xl sm:rounded-2xl overflow-hidden border border-[var(--border)]">
            <div className="p-3 sm:p-4 border-b border-[var(--border)]">
              <h3 className="text-sm sm:text-base font-semibold text-[var(--foreground)]">Garment</h3>
            </div>
            <div className="relative">
              <img
                src={generation.garmentImageUrl}
                alt="Original Garment"
                className="w-full aspect-[3/4] object-cover"
              />
            </div>
          </div>
        </div>

        {/* Simple Info Card */}
        <div className="bg-[var(--surface)] rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-[var(--border)]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-[var(--muted-foreground)]">Created:</span>
                <span className="text-sm font-medium text-[var(--foreground)]">
                  {generation.createdAt.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-[var(--muted-foreground)]">Model:</span>
                <span className="text-sm font-medium text-[var(--foreground)]">
                  {generation.modelUsed}
                </span>
              </div>
            </div>
            
            {/* Mobile Download Button */}
            <button
              onClick={handleDownload}
              className="sm:hidden w-full flex items-center justify-center space-x-2 bg-[var(--primary)] text-[var(--primary-foreground)] py-3 rounded-xl hover:opacity-90 transition-opacity touch-target"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-sm font-medium">Download Image</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
