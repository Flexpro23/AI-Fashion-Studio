'use client';

import { useEffect, useState } from 'react';
import { auth, db, storage } from '@/lib/firebase';

interface FirebaseStatus {
  auth: boolean;
  firestore: boolean;
  storage: boolean;
  config: boolean;
  error?: string;
}

export default function FirebaseStatusDebug() {
  const [status, setStatus] = useState<FirebaseStatus>({
    auth: false,
    firestore: false,
    storage: false,
    config: false
  });
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    checkFirebaseStatus();
  }, []);

  const checkFirebaseStatus = async () => {
    try {
      // Check configuration
      const configOk = !!(
        process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
        process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
      );

      // Check auth
      const authOk = !!auth.app;
      
      // Check firestore  
      const firestoreOk = !!db.app;
      
      // Check storage
      const storageOk = !!storage.app;

      setStatus({
        auth: authOk,
        firestore: firestoreOk,
        storage: storageOk,
        config: configOk
      });

      // Log configuration for debugging
      if (typeof window !== 'undefined') {
        console.log('🔥 Firebase Configuration Check:', {
          apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✅ Set' : '❌ Missing',
          authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? '✅ Set' : '❌ Missing',
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? '✅ Set' : '❌ Missing',
          storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? '✅ Set' : '❌ Missing',
          messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? '✅ Set' : '❌ Missing',
          appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? '✅ Set' : '❌ Missing',
        });
      }

    } catch (error) {
      console.error('Firebase status check error:', error);
      setStatus(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unknown error'
      }));
    }
  };

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setShowDebug(!showDebug)}
        className="bg-gray-800 text-white px-3 py-2 rounded-lg text-xs font-mono hover:bg-gray-700 transition-colors"
      >
        🔥 Firebase Status
      </button>
      
      {showDebug && (
        <div className="absolute bottom-12 right-0 bg-black text-white p-4 rounded-lg font-mono text-xs w-80 shadow-xl">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold">Firebase Status</h3>
            <button
              onClick={() => setShowDebug(false)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Config:</span>
              <span className={status.config ? 'text-green-400' : 'text-red-400'}>
                {status.config ? '✅' : '❌'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span>Auth:</span>
              <span className={status.auth ? 'text-green-400' : 'text-red-400'}>
                {status.auth ? '✅' : '❌'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span>Firestore:</span>
              <span className={status.firestore ? 'text-green-400' : 'text-red-400'}>
                {status.firestore ? '✅' : '❌'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span>Storage:</span>
              <span className={status.storage ? 'text-green-400' : 'text-red-400'}>
                {status.storage ? '✅' : '❌'}
              </span>
            </div>

            {status.error && (
              <div className="mt-3 p-2 bg-red-900/50 rounded text-red-300 text-xs">
                Error: {status.error}
              </div>
            )}

            <div className="mt-3 pt-2 border-t border-gray-700">
              <div className="text-xs text-gray-400">
                Project: {process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'Not set'}
              </div>
              <div className="text-xs text-gray-400">
                Domain: {process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'Not set'}
              </div>
            </div>

            <button
              onClick={checkFirebaseStatus}
              className="w-full mt-2 bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-xs transition-colors"
            >
              Recheck Status
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
