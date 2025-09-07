'use client';

import { useState, useEffect } from 'react';
import { getPredefinedModels } from '@/lib/firebase';
import { PredefinedModel } from '@/types';

interface ModelLibraryProps {
  onSelectModel: (imageUrl: string) => void;
  selectedModelUrl?: string;
}

export default function ModelLibrary({ onSelectModel, selectedModelUrl }: ModelLibraryProps) {
  const [models, setModels] = useState<PredefinedModel[]>([]);
  const [filter, setFilter] = useState<'male' | 'female'>('female');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchModels = async () => {
      setLoading(true);
      setError('');
      try {
        const fetchedModels = await getPredefinedModels();
        setModels(fetchedModels);
        if (fetchedModels.length === 0) {
          setError('No models available. Please check back later.');
        }
      } catch (err) {
        console.error('Error fetching models:', err);
        setError('Failed to load models. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchModels();
  }, []);

  const filteredModels = models.filter(model => model.gender === filter);

  if (loading) {
    return (
      <div className="w-full aspect-square">
        <div className="upload-zone">
          <div className="flex flex-col items-center justify-center h-full text-[var(--muted-foreground)] space-y-6 p-8">
            <div className="loading-luxury w-16 h-16"></div>
            <div className="text-center space-y-2">
              <p className="text-heading-3 font-semibold text-[var(--foreground)]">Loading Models...</p>
              <p className="text-body text-[var(--muted-foreground)]">Please wait while we fetch our model library</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full aspect-square">
        <div className="upload-zone">
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6 p-8">
            <div className="w-20 h-20 mx-auto mb-6 bg-red-500/20 rounded-3xl flex items-center justify-center">
              <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="space-y-2">
              <p className="text-heading-3 font-semibold text-red-400">Error Loading Models</p>
              <p className="text-body text-[var(--muted-foreground)]">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Buttons */}
      <div className="flex justify-center gap-2">
        <button 
          onClick={() => setFilter('female')} 
          className={`px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 ${
            filter === 'female' 
              ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--primary-alt)] text-[var(--primary-foreground)] shadow-md' 
              : 'bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--card-hover)] hover:text-[var(--foreground)]'
          }`}
        >
          Female ({models.filter(m => m.gender === 'female').length})
        </button>
        <button 
          onClick={() => setFilter('male')} 
          className={`px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 ${
            filter === 'male' 
              ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--primary-alt)] text-[var(--primary-foreground)] shadow-md' 
              : 'bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--card-hover)] hover:text-[var(--foreground)]'
          }`}
        >
          Male ({models.filter(m => m.gender === 'male').length})
        </button>
      </div>

      {/* Models Grid */}
      {filteredModels.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto mb-6 bg-[var(--muted)] rounded-3xl flex items-center justify-center">
            <svg className="w-10 h-10 text-[var(--muted-foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <p className="text-heading-3 font-semibold text-[var(--foreground)] mb-2">No {filter} models found</p>
          <p className="text-body text-[var(--muted-foreground)]">Try selecting a different filter or check back later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredModels.map((model) => {
            const isSelected = selectedModelUrl === model.imageUrl;
            return (
              <div 
                key={model.id} 
                onClick={() => onSelectModel(model.imageUrl)}
                className={`relative cursor-pointer group transition-all duration-300 ${
                  isSelected ? 'scale-105' : 'hover:scale-105'
                }`}
              >
                {/* Selection Indicator */}
                {isSelected && (
                  <div className="absolute -top-3 -right-3 z-10">
                    <div className="bg-green-500 text-white rounded-full p-2 shadow-lg animate-pulse">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                )}

                {/* Enhanced Gradient Border */}
                <div className={`absolute -inset-1 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-alt)] rounded-2xl blur opacity-30 transition duration-500 ${
                  isSelected ? 'opacity-60' : 'group-hover:opacity-50'
                }`}></div>
                
                {/* Model Image */}
                <div className="relative">
                  <img 
                    src={model.imageUrl} 
                    alt={model.name}
                    className={`relative w-full aspect-[3/4] object-cover rounded-2xl border-2 shadow-lg transition-all duration-300 ${
                      isSelected 
                        ? 'border-[var(--primary)] shadow-xl' 
                        : 'border-[var(--border-strong)] group-hover:shadow-xl'
                    }`}
                    onError={(e) => {
                      console.error(`Failed to load model image: ${model.imageUrl}`);
                      e.currentTarget.src = '/placeholder-model.jpg'; // You might want to add a placeholder
                    }}
                  />
                  
                  {/* Model Info Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent rounded-b-2xl p-3">
                    <div className="text-white">
                      <p className="font-semibold text-sm mb-1">{model.name}</p>
                      {model.tags && model.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {model.tags.slice(0, 2).map((tag, index) => (
                            <span key={index} className="text-xs bg-white/20 backdrop-blur-sm rounded-full px-2 py-0.5">
                              {tag}
                            </span>
                          ))}
                          {model.tags.length > 2 && (
                            <span className="text-xs bg-white/20 backdrop-blur-sm rounded-full px-2 py-0.5">
                              +{model.tags.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Gender Badge */}
                  <div className="absolute top-3 left-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      model.gender === 'female' 
                        ? 'bg-pink-500/80 text-white' 
                        : 'bg-blue-500/80 text-white'
                    }`}>
                      {model.gender.charAt(0).toUpperCase() + model.gender.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Instructions */}
      <div className="text-center text-body-sm text-[var(--muted-foreground)] mt-6">
        <p>Click on any model to select them for your fashion generation</p>
      </div>
    </div>
  );
}
