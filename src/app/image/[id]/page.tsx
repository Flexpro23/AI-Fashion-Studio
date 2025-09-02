'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Generation {
  id: string;
  userId: string;
  garmentImageUrl: string;
  outputImageUrl: string;
  createdAt: Date;
  method: string;
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
      // Try direct download first
      try {
        const response = await fetch(generation.outputImageUrl, {
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
      } catch {
        // Fallback: open in new tab for manual download
        const link = document.createElement('a');
        link.href = generation.outputImageUrl;
        link.target = '_blank';
        link.download = `ai-fashion-${generation.id}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download image. Please try right-clicking and saving the image.');
    }
  };

  const handleCopy = async () => {
    if (!generation) return;

    try {
      // Try to copy actual image
      try {
        const response = await fetch(generation.outputImageUrl, {
          mode: 'cors',
          credentials: 'omit'
        });
        const blob = await response.blob();
        const clipboardItem = new ClipboardItem({
          [blob.type]: blob
        });
        await navigator.clipboard.write([clipboardItem]);
        alert('Image copied to clipboard!');
      } catch {
        // Fallback to URL
        await navigator.clipboard.writeText(generation.outputImageUrl);
        alert('Image URL copied to clipboard!');
      }
    } catch (error) {
      console.error('Copy error:', error);
      alert('Failed to copy image');
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
      {/* Header */}
      <div className="sticky top-0 bg-[var(--background)]/90 backdrop-blur-md border-b border-[var(--border)] z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-[var(--hover)] rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-semibold text-[var(--foreground)]">AI Generated Fashion</h1>
              <p className="text-sm text-[var(--muted-foreground)]">
                Created on {generation.createdAt.toLocaleDateString('en-US', { 
                  year: 'numeric',
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="p-2 bg-[var(--muted)] hover:bg-[var(--hover)] rounded-lg transition-colors touch-target"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
            <button
              onClick={handleDownload}
              className="p-2 bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 rounded-lg transition-opacity touch-target"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Image */}
          <div className="lg:col-span-2">
            <div className="relative bg-[var(--muted)] rounded-2xl overflow-hidden shadow-xl">
              {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="loading-luxury w-8 h-8"></div>
                </div>
              )}
              <img
                src={generation.outputImageUrl}
                alt="AI Generated Fashion"
                className="w-full h-auto object-contain max-h-[70vh]"
                onLoad={() => setImageLoading(false)}
                onError={() => setImageLoading(false)}
              />
              
              {/* AI Badge */}
              <div className="absolute top-4 left-4 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-alt)] rounded-full px-3 py-1.5 flex items-center space-x-2">
                <svg className="w-4 h-4 text-[var(--primary-foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707" />
                </svg>
                <span className="text-sm font-medium text-[var(--primary-foreground)]">AI Generated</span>
              </div>
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            
            {/* Garment Image */}
            <div className="card p-6">
              <h3 className="font-semibold text-[var(--foreground)] mb-4">Original Garment</h3>
              <div className="relative bg-[var(--muted)] rounded-xl overflow-hidden">
                <img
                  src={generation.garmentImageUrl}
                  alt="Original Garment"
                  className="w-full h-48 object-cover"
                />
              </div>
            </div>

            {/* Generation Details */}
            <div className="card p-6">
              <h3 className="font-semibold text-[var(--foreground)] mb-4">Generation Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-[var(--muted-foreground)]">Created:</span>
                  <span className="text-[var(--foreground)] font-medium">
                    {generation.createdAt.toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--muted-foreground)]">Format:</span>
                  <span className="text-[var(--foreground)] font-medium">JPEG</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="card p-6">
              <h3 className="font-semibold text-[var(--foreground)] mb-4">Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={handleDownload}
                  className="w-full flex items-center justify-center space-x-2 bg-[var(--primary)] text-[var(--primary-foreground)] py-3 rounded-xl hover:opacity-90 transition-opacity touch-target"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Download Image</span>
                </button>
                
                <button
                  onClick={handleCopy}
                  className="w-full flex items-center justify-center space-x-2 bg-[var(--muted)] text-[var(--foreground)] py-3 rounded-xl hover:bg-[var(--hover)] transition-colors touch-target"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span>Copy to Clipboard</span>
                </button>

                <button
                  onClick={() => router.push('/studio')}
                  className="w-full flex items-center justify-center space-x-2 bg-[var(--secondary)] text-[var(--secondary-foreground)] py-3 rounded-xl hover:bg-[var(--secondary-hover)] transition-colors touch-target"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Create New</span>
                </button>
              </div>
            </div>

            {/* Technical Info */}
            <div className="card p-6">
              <h3 className="font-semibold text-[var(--foreground)] mb-4">Technical Info</h3>
              <div className="grid grid-cols-1 gap-3 text-sm">
                <div>
                  <span className="text-[var(--muted-foreground)]">Image Quality:</span>
                  <p className="font-medium">High Resolution</p>
                </div>
                <div>
                  <span className="text-[var(--muted-foreground)]">Processing:</span>
                  <p className="font-medium">AI Image Synthesis</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
