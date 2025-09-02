'use client';

import { useState } from 'react';

interface ImageDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  createdAt: Date;
  method: string;
  model: string;
}

export default function ImageDetailModal({
  isOpen,
  onClose,
  imageUrl,
  createdAt,
  method,
  model
}: ImageDetailModalProps) {
  const [imageLoading, setImageLoading] = useState(true);

  if (!isOpen) return null;

  const handleDownload = async () => {
    try {
      // Try direct download first
      try {
        const response = await fetch(imageUrl, {
          mode: 'cors',
          credentials: 'omit'
        });
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ai-fashion-${Date.now()}.jpg`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } catch {
        // Fallback: open in new tab for manual download
        const link = document.createElement('a');
        link.href = imageUrl;
        link.target = '_blank';
        link.download = `ai-fashion-${Date.now()}.jpg`;
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
      alert('Failed to copy image');
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-[var(--background)] rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-[var(--background)] border-b border-[var(--border)] p-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[var(--foreground)]">AI Generated Fashion</h2>
            <p className="text-sm text-[var(--muted-foreground)]">
              Created on {createdAt.toLocaleDateString('en-US', { 
                year: 'numeric',
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--hover)] rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Image */}
        <div className="p-4">
          <div className="relative bg-[var(--muted)] rounded-xl overflow-hidden">
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="loading-luxury w-8 h-8"></div>
              </div>
            )}
            <img
              src={imageUrl}
              alt="AI Generated Fashion"
              className="w-full h-auto max-h-[60vh] object-contain"
              onLoad={() => setImageLoading(false)}
              onError={() => setImageLoading(false)}
            />
          </div>

          {/* Details */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-[var(--foreground)] mb-2">Generation Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[var(--muted-foreground)]">AI Model:</span>
                    <span className="text-[var(--foreground)] font-medium">{model}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--muted-foreground)]">Method:</span>
                    <span className="text-[var(--foreground)] font-medium">{method}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--muted-foreground)]">Created:</span>
                    <span className="text-[var(--foreground)] font-medium">
                      {createdAt.toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-[var(--foreground)] mb-2">Actions</h3>
                <div className="flex flex-col space-y-2">
                  <button
                    onClick={handleDownload}
                    className="flex items-center justify-center space-x-2 bg-[var(--primary)] text-[var(--primary-foreground)] py-2 px-4 rounded-xl hover:opacity-90 transition-opacity"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Download Image</span>
                  </button>
                  
                  <button
                    onClick={handleCopy}
                    className="flex items-center justify-center space-x-2 bg-[var(--muted)] text-[var(--foreground)] py-2 px-4 rounded-xl hover:bg-[var(--hover)] transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span>Copy Image</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Technical Info */}
          <div className="mt-6 p-4 bg-[var(--muted)] rounded-xl">
            <h3 className="font-semibold text-[var(--foreground)] mb-2">Technical Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-[var(--muted-foreground)]">AI Engine:</span>
                <p className="font-medium">Google Gemini 2.5 Flash</p>
              </div>
              <div>
                <span className="text-[var(--muted-foreground)]">Image Format:</span>
                <p className="font-medium">JPEG</p>
              </div>
              <div>
                <span className="text-[var(--muted-foreground)]">Quality:</span>
                <p className="font-medium">High Resolution</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
