'use client';

import { useAuth } from '@/contexts/AuthContext';
import ImageCard from '@/components/ImageCard';
import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Generation {
  id: string;
  outputImageUrl: string;
  createdAt: Date;
  method: string;
  model: string;
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
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gradient mb-2">Your Lookbook</h1>
          <p className="text-[var(--muted-foreground)]">
            {generations.length > 0 
              ? `${generations.length} AI-generated fashion ${generations.length === 1 ? 'creation' : 'creations'}`
              : 'No fashion creations yet'
            }
          </p>
        </div>

        {/* Gallery */}
        {generations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 image-grid">
            {generations.map((generation) => (
              <ImageCard
                key={generation.id}
                imageUrl={generation.outputImageUrl}
                createdAt={generation.createdAt}
                method={generation.method}
                model={generation.model}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-32 h-32 mx-auto mb-8 bg-[var(--muted)] rounded-full flex items-center justify-center">
              <svg className="w-16 h-16 text-[var(--muted-foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">No creations yet</h2>
            <p className="text-[var(--muted-foreground)] mb-8 max-w-md mx-auto">
              Start creating AI-powered fashion looks in the studio to see them here.
            </p>
            <a
              href="/studio"
              className="btn-primary inline-flex items-center px-6 py-3"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
