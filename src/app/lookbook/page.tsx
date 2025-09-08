'use client';

import { useAuth } from '@/contexts/AuthContext';
import ImageCard from '@/components/ImageCard';
import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Generation {
  id: string;
  imageUrl: string;
  modelImageUrl: string;
  garmentImageUrl: string;
  createdAt: Date;
  modelUsed: string;
}

export default function LookbookPage() {
  const { user } = useAuth();
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGenerations = async () => {
      if (!user) return;

      try {
        const q = query(
          collection(db, 'generations'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        const generationsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        })) as Generation[];

        setGenerations(generationsData);
      } catch (error) {
        console.error('Error fetching generations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGenerations();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[var(--foreground)] mb-4">Please sign in</h1>
          <p className="text-[var(--muted-foreground)]">You need to be signed in to view your lookbook.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-luxury w-12 h-12"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--background)] via-[var(--surface)] to-[var(--background-alt)] pb-24">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Compact Mobile Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gradient mb-1 sm:mb-2">Your Lookbook</h1>
          <p className="text-sm sm:text-base text-[var(--muted-foreground)]">
            {generations.length > 0 
              ? `${generations.length} AI-generated fashion ${generations.length === 1 ? 'creation' : 'creations'}`
              : 'No fashion creations yet'
            }
          </p>
        </div>

        {/* Mobile-Optimized Gallery */}
        {generations.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {generations.map((generation) => (
              <div 
                key={generation.id}
                className="group relative bg-[var(--surface)] rounded-xl sm:rounded-2xl overflow-hidden border border-[var(--border)] hover:border-[var(--primary)] transition-all duration-300 hover:shadow-lg"
              >
                {/* Image */}
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img 
                    src={generation.imageUrl} 
                    alt="Generated fashion look" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Mobile-friendly overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="text-white text-xs sm:text-sm font-medium truncate">
                      {new Date(generation.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-white/80 text-xs truncate">
                      {generation.modelUsed}
                    </p>
                  </div>
                </div>
                
                {/* Quick Actions for Mobile */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button
                    onClick={() => window.open(generation.imageUrl, '_blank')}
                    className="w-8 h-8 sm:w-10 sm:h-10 bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-colors"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 sm:py-16">
            <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-6 sm:mb-8 bg-[var(--muted)] rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 sm:w-16 sm:h-16 text-[var(--muted-foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold text-[var(--foreground)] mb-3 sm:mb-4">No creations yet</h2>
            <p className="text-sm sm:text-base text-[var(--muted-foreground)] mb-6 sm:mb-8 max-w-md mx-auto px-4">
              Start creating AI-powered fashion looks in the studio to see them here.
            </p>
            <a
              href="/studio"
              className="btn-primary inline-flex items-center px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Your First Look
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
