'use client';

import { useState } from 'react';

interface ImageCardProps {
  imageUrl: string;
  createdAt: Date;
  method: string;
  model: string;
}

export default function ImageCard({ 
  imageUrl, 
  createdAt, 
  method: _method,
  model: _model
}: ImageCardProps) {
  const [showOverlay, setShowOverlay] = useState(false);

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      try {
        const response = await fetch(imageUrl, {
          mode: 'cors',
          credentials: 'omit'
        });
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `fashion-shot-${Date.now()}.jpg`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } catch {
        // Fallback: open in new tab
        const link = document.createElement('a');
        link.href = imageUrl;
        link.target = '_blank';
        link.download = `fashion-shot-${Date.now()}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download image');
    }
  };

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      // Try to copy actual image
      try {
        const response = await fetch(imageUrl, {
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
        await navigator.clipboard.writeText(imageUrl);
        alert('Image URL copied to clipboard!');
      }
    } catch (error) {
      console.error('Copy error:', error);
      alert('Failed to copy');
    }
  };



  return (
    <div 
      className="relative cursor-pointer group card overflow-hidden"
      onMouseEnter={() => setShowOverlay(true)}
      onMouseLeave={() => setShowOverlay(false)}
    >
      <img
        src={imageUrl}
        alt="Generated fashion shot"
        className="w-full h-auto object-cover transition-all duration-500 group-hover:scale-110"
      />
      
      {/* Enhanced Overlay */}
      <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-all duration-300 ${
        showOverlay ? 'opacity-100' : 'opacity-0'
      }`}>
        {/* Action Buttons */}
        <div className="absolute top-4 right-4 flex flex-col space-y-2">
          <button
            onClick={handleDownload}
            className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all duration-200 shadow-lg hover:shadow-xl"
            title="Download"
          >
            <svg className="w-4 h-4 text-[var(--foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </button>
          
          <button
            onClick={handleCopy}
            className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all duration-200 shadow-lg hover:shadow-xl"
            title="Copy URL"
          >
            <svg className="w-4 h-4 text-[var(--foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
          

        </div>

        {/* View Details Indicator */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center justify-between">
            <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1.5">
              <p className="text-caption text-[var(--foreground)]">
                {createdAt.toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  year: '2-digit'
                })}
              </p>
            </div>
            <div className="bg-gradient-to-r from-[var(--primary)] to-[var(--primary-alt)] rounded-lg px-3 py-1.5">
              <p className="text-caption text-[var(--primary-foreground)] font-semibold">
                Click to View
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Badge */}
      <div className="absolute top-4 left-4 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-alt)] rounded-full p-2">
        <svg className="w-3 h-3 text-[var(--primary-foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707" />
        </svg>
      </div>
    </div>
  );
}
