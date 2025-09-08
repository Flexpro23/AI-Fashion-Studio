'use client';

import { useState, useRef } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

interface ImageUploaderProps {
  type: 'models' | 'garments';
  onUploadComplete: (url: string) => void;
  onNext?: () => void; // Add next handler
  currentImageUrl?: string;
  showNextButton?: boolean; // Control when to show next button
}

export default function ImageUploader({ 
  type, 
  onUploadComplete, 
  onNext,
  currentImageUrl, 
  showNextButton = false 
}: ImageUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const handleFileUpload = async (file: File) => {
    if (!user) return;
    
    // Prevent double upload by checking if already uploading
    if (isUploading) return;

    setIsUploading(true);
    try {
      const timestamp = Date.now();
      const filename = `${timestamp}_${file.name}`;
      const storageRef = ref(storage, `uploads/${user.uid}/${type}/${filename}`);
      
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      
      onUploadComplete(downloadURL);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (isUploading) return; // Prevent during upload
    
    const imageFile = Array.from(e.dataTransfer.files).find(file => file.type.startsWith('image/'));
    if (imageFile) handleFileUpload(imageFile);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && !isUploading) { // Prevent during upload
      handleFileUpload(file);
    }
    // Reset the input value to allow re-selecting the same file
    e.target.value = '';
  };

  const handleChangeImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUploadComplete('');
  };

  // Show loading state during upload
  if (isUploading) {
    return (
      <div className="w-full aspect-square">
        <div className="upload-zone">
          <div className="flex flex-col items-center justify-center h-full text-[var(--muted-foreground)] space-y-6 p-8">
            <div className="loading-luxury w-16 h-16"></div>
            <div className="text-center space-y-2">
              <p className="text-heading-3 font-semibold text-[var(--foreground)]">Uploading...</p>
              <p className="text-body text-[var(--muted-foreground)]">Please wait while we process your image</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show upload interface when no image
  if (!currentImageUrl) {
    return (
      <div className="w-full aspect-square">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <div
          className={`upload-zone ${isDragOver ? 'dragover' : ''}`}
          onDrop={handleDrop}
          onDragOver={(e) => { 
            e.preventDefault(); 
            setIsDragOver(true); 
          }}
          onDragLeave={() => setIsDragOver(false)}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="text-center text-[var(--muted-foreground)] p-8">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-[var(--primary)] to-[var(--primary-alt)] rounded-3xl flex items-center justify-center shadow-lg">
              <svg className="w-10 h-10 text-[var(--primary-foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p className="text-heading-3 font-semibold text-[var(--foreground)] mb-3">
              {isDragOver ? 'Drop your image here' : 'Upload Image'}
            </p>
            <p className="text-body text-[var(--muted-foreground)] mb-2">
              Click to browse or drag & drop
            </p>
            <p className="text-body-sm text-[var(--muted-foreground)] opacity-70">PNG, JPG, WebP up to 10MB</p>
          </div>
        </div>
      </div>
    );
  }

  // Show preview with controls when image is uploaded
  return (
    <div className="w-full space-y-6">
      {/* Image Preview */}
      <div className="w-full aspect-square relative group">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        {/* Success Badge */}
        <div className="absolute -top-3 -right-3 z-10">
          <div className="bg-green-500 text-white rounded-full p-2 shadow-lg animate-pulse">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        {/* Enhanced Gradient Border */}
        <div className="absolute -inset-1 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-alt)] rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
        
        <img 
          src={currentImageUrl} 
          alt={`${type} preview`} 
          className="relative w-full h-full object-cover rounded-3xl border-2 border-[var(--border-strong)] shadow-xl transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl" 
          onLoad={() => {}
          onError={(e) => console.error(`${type} image failed to load:`, currentImageUrl, e)}
        />

        {/* Image Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent rounded-b-3xl p-4">
          <div className="text-white">
            <p className="font-semibold capitalize text-lg">{type} Image</p>
            <p className="text-sm opacity-90">✨ Ready for AI generation</p>
          </div>
        </div>
        
        {/* Small Action Icons in Bottom Right */}
        <div className="absolute bottom-4 right-4 flex space-x-2">
          <button 
            onClick={handleChangeImage}
            className="w-10 h-10 bg-white/90 backdrop-blur-md border border-white/20 text-gray-700 rounded-full flex items-center justify-center hover:bg-white hover:scale-110 transition-all duration-200 shadow-lg group/btn"
            title="Change Image"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          </button>
          <button 
            onClick={handleRemoveImage}
            className="w-10 h-10 bg-red-500/90 backdrop-blur-md border border-red-500/20 text-white rounded-full flex items-center justify-center hover:bg-red-500 hover:scale-110 transition-all duration-200 shadow-lg group/btn"
            title="Remove Image"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Enhanced Next Button */}
      {showNextButton && onNext && (
        <div className="animate-slide-up">
          <button 
            onClick={onNext}
            className="btn-step w-full flex items-center justify-center bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Continue to Next Step
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}