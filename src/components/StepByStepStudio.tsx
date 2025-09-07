'use client';

import { useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/contexts/AuthContext';
import { functions } from '@/lib/firebase';
import ImageUploader from './ImageUploader';
import ModelLibrary from './ModelLibrary';
import Link from 'next/link';

type Step = 'model' | 'garment' | 'choose-method' | 'generating' | 'result';

interface StepByStepStudioProps {
  onComplete?: (resultUrl: string) => void;
}

export default function StepByStepStudio({ onComplete }: StepByStepStudioProps) {
  const [currentStep, setCurrentStep] = useState<Step>('model');
  const [modelImageUrl, setModelImageUrl] = useState<string>('');
  const [garmentImageUrl, setGarmentImageUrl] = useState<string>('');
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string>('');
  const [, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [modelSelectionType, setModelSelectionType] = useState<'library' | 'upload'>('library');
  const router = useRouter();
  const { user, userData, decrementGenerations } = useAuth();

  const steps = [
    { id: 'model', title: 'Select Model', description: 'Choose from our library or upload your own', icon: '👤' },
    { id: 'garment', title: 'Upload Garment', description: 'Select the clothing item', icon: '👕' },
    { id: 'choose-method', title: 'Choose Method', description: 'Select generation type', icon: '⚙️' },
    { id: 'generating', title: 'AI Magic', description: 'Creating your vision', icon: '✨' },
    { id: 'result', title: 'Final Result', description: 'Your masterpiece is ready', icon: '🎨' }
  ];

  const handleModelUpload = (url: string) => {
    console.log('Model upload completed, URL:', url);
    setModelImageUrl(url);
    // Don't auto-advance, let user click Next button
  };

  const handleModelSelect = (url: string) => {
    console.log('Model selected from library, URL:', url);
    setModelImageUrl(url);
  };

  const handleGarmentUpload = (url: string) => {
    console.log('Garment upload completed, URL:', url);
    setGarmentImageUrl(url);
    // Don't auto-advance, let user click Next button
  };

  const handleModelNext = () => {
    if (modelImageUrl) {
      setCurrentStep('garment');
    }
  };

  const handleGarmentNext = () => {
    if (garmentImageUrl) {
      setCurrentStep('choose-method');
    }
  };

  const handleCloudFunctionV2Generate = () => {
    // Check if user has remaining generations
    if (!userData || userData.remainingGenerations <= 0) {
      router.push('/contact');
      return;
    }
    handleGenerate('cloudv2');
  };



  const handleGenerate = async (method: 'cloudv2') => {
    if (!modelImageUrl || !garmentImageUrl) return;

    // Check authentication before proceeding
    if (!user) {
      console.error('User not authenticated');
      setError('Please log in to generate images');
      return;
    }

    setCurrentStep('generating');
    setIsGenerating(true);
    setError('');
    setProgress(0);

    try {
      // Comprehensive authentication debugging
      console.log('🔐 === AUTHENTICATION DEBUG ===');
      console.log('👤 User object present:', !!user);
      console.log('👤 User UID:', user?.uid);
      console.log('👤 User email:', user?.email);
      console.log('📧 User emailVerified:', user?.emailVerified);
      console.log('🔄 User refreshToken present:', !!user?.refreshToken);
      console.log('⏰ User metadata:', user?.metadata);
      
      // Get current ID token for debugging
      console.log('🎫 Getting ID token...');
      const idToken = await user.getIdToken(true); // Force refresh
      console.log('✅ ID Token obtained (first 50 chars):', idToken.substring(0, 50) + '...');
      console.log('🎫 ID Token length:', idToken.length);
      
      // Validate token format
      const tokenParts = idToken.split('.');
      console.log('🧩 Token parts count:', tokenParts.length);
      
      // Decode token header for debugging (without verification)
      try {
        const header = JSON.parse(atob(tokenParts[0]));
        console.log('🎫 Token header:', header);
      } catch (e) {
        console.warn('⚠️ Could not decode token header:', e);
      }
      
      // Test Firebase app configuration
      console.log('🔥 Firebase config check:');
      console.log('📱 App name:', functions.app.name);
      console.log('🌍 Functions region:', functions._region);
      console.log('🔗 Functions URL:', functions._url);
      
      // First test authentication with a simple function
      console.log('🧪 Testing authentication first...');
      const testAuth = httpsCallable(functions, 'testAuth');
      
      try {
        const authTestResult = await testAuth({ test: 'authentication' });
        console.log('✅ Auth test successful:', authTestResult);
      } catch (authError) {
        console.error('❌ Auth test failed:', authError);
        throw new Error(`Authentication test failed: ${authError.message}`);
      }
      
      // Use Firebase Cloud Function V2 (Gemini 2.5)
      console.log('🚀 Creating httpsCallable for generateImageV2...');
      const generateImageV2 = httpsCallable(functions, 'generateImageV2');
      
      console.log('📞 Calling Firebase Cloud Function V2 (Gemini 2.5)...');
      console.log('📸 Model URL:', modelImageUrl);
      console.log('👗 Garment URL:', garmentImageUrl);
      
      // Prepare call data
      const callData = {
        modelImageUrl,
        garmentImageUrl
      };
      console.log('📦 Call data prepared:', callData);
      
      // Simulate progress for cloud function V2
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 500);
      
      console.log('🚀 Making function call...');
      console.log('⏰ Call timestamp:', new Date().toISOString());
      
      const result = await generateImageV2(callData);

      clearInterval(progressInterval);
      
      console.log('Cloud Function V2 result:', result);
      const { resultUrl } = result.data as { resultUrl: string };
      setGeneratedImageUrl(resultUrl);
      
      // Decrement user's generation count
      await decrementGenerations();
      
      setProgress(100);
      
      setTimeout(() => {
        setCurrentStep('result');
        onComplete?.(resultUrl);
      }, 500);

    } catch (error: unknown) {
      console.error('Generation error:', error);
      setError(`Failed to generate image using ${method}. Please try again.`);
      setCurrentStep('choose-method');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!generatedImageUrl) return;
    
    try {
      showNotification('📥 Starting download...', 'success');
      
      // Create a proxy URL to avoid CORS issues
      // const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(generatedImageUrl)}`;
      
      try {
        // Try direct download first
        const response = await fetch(generatedImageUrl, {
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
        showNotification('✅ Image downloaded successfully!', 'success');
      } catch {
        // Fallback: open in new tab for manual download
        console.log('CORS error, opening in new tab');
        const link = document.createElement('a');
        link.href = generatedImageUrl;
        link.target = '_blank';
        link.download = `ai-fashion-${Date.now()}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showNotification('✅ Image opened in new tab for download!', 'success');
      }
    } catch (error) {
      console.error('Download error:', error);
      showNotification('❌ Download failed. Please try again.', 'error');
    }
  };

  const handleCopy = async () => {
    if (!generatedImageUrl) return;
    
    try {
      showNotification('📋 Copying image...', 'success');
      
      // Try to copy the actual image data
      try {
        const response = await fetch(generatedImageUrl, {
          mode: 'cors',
          credentials: 'omit'
        });
        const blob = await response.blob();
        
        // Create ClipboardItem with the image blob
        const clipboardItem = new ClipboardItem({
          [blob.type]: blob
        });
        
        await navigator.clipboard.write([clipboardItem]);
        showNotification('✅ Image copied to clipboard!', 'success');
      } catch {
        // Fallback to copying URL if image copy fails
        console.log('Image copy failed, copying URL instead');
        await navigator.clipboard.writeText(generatedImageUrl);
        showNotification('✅ Image URL copied to clipboard!', 'success');
      }
    } catch (error) {
      console.error('Copy error:', error);
      showNotification('❌ Failed to copy image', 'error');
    }
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    // Create a temporary notification element
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-2xl shadow-lg transition-all duration-300 ${
      type === 'success' ? 'bg-green-500/20 border border-green-500/30 text-green-400' : 'bg-red-500/20 border border-red-500/30 text-red-400'
    }`;
    notification.textContent = message;
    notification.style.transform = 'translateX(100%)';
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  };

  const resetStudio = () => {
    setCurrentStep('model');
    setModelImageUrl('');
    setGarmentImageUrl('');
    setGeneratedImageUrl('');
    setError('');
    setProgress(0);
    setModelSelectionType('library');
  };

  const goToLookbook = () => {
    router.push('/lookbook');
  };

  const goToHome = () => {
    router.push('/');
  };

  const getCurrentStepIndex = () => {
    return steps.findIndex(step => step.id === currentStep);
  };

  const renderStepIndicator = () => (
    <div className="flex justify-center items-center space-x-2 md:space-x-4 mb-4 md:mb-8">
      {steps.map((step, index) => {
        const stepIndex = getCurrentStepIndex();
        const isActive = index === stepIndex;
        const isCompleted = index < stepIndex;


        return (
          <div key={step.id} className="flex items-center">
            {/* Mobile-optimized step indicator */}
            <div className={`step-indicator-mobile ${isActive ? 'active' : isCompleted ? 'completed' : 'pending'}`}>
              {isCompleted ? '✓' : step.icon}
            </div>
            {index < steps.length - 1 && (
              <div className={`w-4 h-0.5 md:w-8 md:h-1 mx-1 md:mx-2 rounded-full transition-all duration-500 ${
                isCompleted ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--primary-alt)]' : 'bg-[var(--border-strong)]'
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );

  const renderStepContent = () => {
    const currentStepData = steps[getCurrentStepIndex()];

    switch (currentStep) {
      case 'model':
        return (
          <div className="card-step animate-slide-up">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">{currentStepData.icon}</div>
              <h2 className="text-heading-2 text-gradient mb-2">{currentStepData.title}</h2>
              <p className="text-body text-[var(--muted-foreground)]">{currentStepData.description}</p>
            </div>

            {/* Model Selection Tabs */}
            <div className="flex justify-center mb-6">
              <div className="bg-[var(--muted)] rounded-2xl p-1 flex">
                <button
                  onClick={() => setModelSelectionType('library')}
                  className={`px-6 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                    modelSelectionType === 'library'
                      ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--primary-alt)] text-[var(--primary-foreground)] shadow-md'
                      : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                  }`}
                >
                  Choose Our Model
                </button>
                <button
                  onClick={() => setModelSelectionType('upload')}
                  className={`px-6 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                    modelSelectionType === 'upload'
                      ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--primary-alt)] text-[var(--primary-foreground)] shadow-md'
                      : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                  }`}
                >
                  Upload Your Own
                </button>
              </div>
            </div>

            {/* Model Selection Content */}
            {modelSelectionType === 'library' ? (
              <div className="space-y-6">
                <ModelLibrary 
                  onSelectModel={handleModelSelect}
                  selectedModelUrl={modelImageUrl}
                />
                {modelImageUrl && (
                  <div className="animate-slide-up">
                    <button 
                      onClick={handleModelNext}
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
            ) : (
              <ImageUploader 
                type="models" 
                onUploadComplete={handleModelUpload} 
                onNext={handleModelNext}
                currentImageUrl={modelImageUrl}
                showNextButton={!!modelImageUrl}
              />
            )}
          </div>
        );

      case 'garment':
        return (
          <div className="card-step animate-slide-left">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">{currentStepData.icon}</div>
              <h2 className="text-heading-2 text-gradient mb-2">{currentStepData.title}</h2>
              <p className="text-body text-[var(--muted-foreground)]">{currentStepData.description}</p>
            </div>
            <ImageUploader 
              type="garments" 
              onUploadComplete={handleGarmentUpload} 
              onNext={handleGarmentNext}
              currentImageUrl={garmentImageUrl}
              showNextButton={!!garmentImageUrl}
            />
            {error && (
              <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-center animate-fade-in">
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span>{error}</span>
                </div>
              </div>
            )}
          </div>
        );

      case 'choose-method':
        return (
          <div className="card-step animate-slide-left">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">{currentStepData.icon}</div>
              <h2 className="text-heading-2 text-gradient mb-2">{currentStepData.title}</h2>
              <p className="text-body text-[var(--muted-foreground)]">{currentStepData.description}</p>
            </div>
            
            <div className="space-y-6">
              {/* Preview both images */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="text-center">
                  <img 
                    src={modelImageUrl} 
                    alt="Model" 
                    className="w-full aspect-square object-cover rounded-2xl border border-[var(--border)] mb-2"
                  />
                  <p className="text-body-sm text-[var(--muted-foreground)]">Model</p>
                </div>
                <div className="text-center">
                  <img 
                    src={garmentImageUrl} 
                    alt="Garment" 
                    className="w-full aspect-square object-cover rounded-2xl border border-[var(--border)] mb-2"
                  />
                  <p className="text-body-sm text-[var(--muted-foreground)]">Garment</p>
                </div>
              </div>

              {/* Generation Counter */}
              {userData && (
                <div className="mb-6 p-4 bg-[var(--primary)]/10 border border-[var(--primary)]/20 rounded-2xl text-center">
                  <div className="text-2xl font-bold text-[var(--primary)] mb-1">
                    {userData.remainingGenerations}
                  </div>
                  <div className="text-sm text-[var(--muted-foreground)]">
                    {userData.remainingGenerations === 1 ? 'Generation remaining' : 'Generations remaining'}
                  </div>
                </div>
              )}

              {/* Generation method button */}
              <div className="space-y-4">
                {userData && userData.remainingGenerations > 0 ? (
                  <button 
                    onClick={handleCloudFunctionV2Generate}
                    className="btn-step w-full flex items-center justify-center bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    Generate AI Fashion Image ✨
                  </button>
                ) : (
                  <Link href="/pricing" className="block">
                    <button className="btn-step w-full flex items-center justify-center bg-gradient-to-r from-[var(--primary)] to-[var(--primary-alt)] hover:from-[var(--primary-alt)] hover:to-[var(--primary)]">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      View Plans & Get More Credits
                      <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-1M10 6V5a2 2 0 012-2h2a2 2 0 012 2v1M10 6h4" />
                      </svg>
                    </button>
                  </Link>
                )}
              </div>

              <div className="text-center text-body-sm text-[var(--muted-foreground)] mt-4">
                {userData && userData.remainingGenerations > 0 
                  ? 'Using advanced AI image generation for realistic fashion synthesis.'
                  : (
                    <div className="space-y-2">
                      <p>You&apos;ve used all your free generations.</p>
                      <p className="text-[var(--primary)]">
                        Click the button above to view our pricing plans and get more credits.
                      </p>
                    </div>
                  )
                }
              </div>
            </div>

            {error && (
              <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-center animate-fade-in">
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span>{error}</span>
                </div>
              </div>
            )}
          </div>
        );

      case 'generating':
        return (
          <div className="card-step animate-scale-in text-center">
            <div className="text-6xl mb-6 animate-pulse">{currentStepData.icon}</div>
            <h2 className="text-heading-2 text-gradient mb-4">{currentStepData.title}</h2>
            <p className="text-body text-[var(--muted-foreground)] mb-8">{currentStepData.description}</p>
            
            <div className="space-y-8">
              {/* Enhanced loading animation */}
              <div className="relative">
                <div className="loading-luxury mx-auto w-20 h-20"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-6 h-6 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-alt)] rounded-full animate-ping"></div>
                </div>
              </div>
              
              {/* Enhanced progress display */}
              <div className="space-y-3">
                {progress > 0 ? (
                  <>
                    <div className="progress-bar h-4">
                      <div 
                        className="progress-fill progress-pulse h-full" 
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="text-body-sm text-[var(--primary)] font-medium">
                      {Math.round(progress)}% Complete
                    </p>
                  </>
                ) : (
                  <div className="flex items-center justify-center space-x-3">
                    <div className="loading-luxury w-8 h-8"></div>
                    <p className="text-body-sm text-[var(--primary)] font-medium">
                      Processing...
                    </p>
                  </div>
                )}</div>
              
              {/* Status messages with better styling */}
              <div className="bg-[var(--muted)] rounded-2xl p-6 border border-[var(--border)]">
                <p className="text-body text-[var(--foreground)] font-medium">
                  {progress < 30 && "🔍 Analyzing your images..."}
                  {progress >= 30 && progress < 60 && "🎨 Understanding the style..."}
                  {progress >= 60 && progress < 90 && "✨ Generating your vision..."}
                  {progress >= 90 && "🎉 Almost ready..."}
                </p>
                <p className="text-body-sm text-[var(--muted-foreground)] mt-2">
                  Please wait while our AI creates your perfect fashion shot
                </p>
              </div>
            </div>
          </div>
        );

      case 'result':
        return (
          <div className="card-step animate-slide-up text-center">
            <div className="text-6xl mb-6">{currentStepData.icon}</div>
            <h2 className="text-heading-2 text-gradient mb-4">{currentStepData.title}</h2>
            <p className="text-body text-[var(--muted-foreground)] mb-8">{currentStepData.description}</p>
            
            {generatedImageUrl && (
              <div className="space-y-8">
                {/* Enhanced image display */}
                <div className="relative inline-block group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-alt)] rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
                  <div className="relative">
                    <img 
                      src={generatedImageUrl} 
                      alt="Generated fashion shot" 
                      className="max-w-full max-h-96 rounded-3xl shadow-2xl border-2 border-[var(--border-strong)] transition-transform duration-300 hover:scale-105"
                    />
                    <div className="absolute -top-4 -right-4 w-10 h-10 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-alt)] rounded-full flex items-center justify-center shadow-lg animate-bounce">
                      <span className="text-sm">✨</span>
                    </div>
                  </div>
                </div>
                
                {/* Action buttons with enhanced styling */}
                <div className="space-y-4">
                  <div className="flex flex-col gap-3 justify-center">
                    <button onClick={handleDownload} className="btn-primary flex items-center justify-center space-x-3 group touch-target">
                      <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>Download Image</span>
                    </button>
                    
                    <button onClick={handleCopy} className="btn-secondary flex items-center justify-center space-x-3 group touch-target">
                      <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span>Copy Image</span>
                    </button>
                  </div>
                  
                  {/* Navigation actions */}
                  <div className="pt-4 border-t border-[var(--border)]">
                    <div className="flex flex-col gap-3 justify-center">
                      <button onClick={goToHome} className="btn-primary flex items-center justify-center space-x-2 touch-target">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        <span>Go to Home</span>
                      </button>
                      <button onClick={goToLookbook} className="btn-secondary flex items-center justify-center space-x-2 touch-target">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        <span>View Gallery</span>
                      </button>
                      <button onClick={resetStudio} className="btn-ghost flex items-center justify-center space-x-2 touch-target">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0V9a8 8 0 1115.356 2m-15.356-2H4" />
                        </svg>
                        <span>Create Another</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-display text-gradient mb-4">AI Fashion Studio</h1>
          <p className="text-body-lg text-[var(--muted-foreground)]">
            Transform your vision into reality with AI-powered fashion photography
          </p>
        </div>

        {/* Step Indicator */}
        {renderStepIndicator()}

        {/* Step Content */}
        <div className="animate-fade-in">
          {renderStepContent()}
        </div>
      </div>
    </div>
  );
}
