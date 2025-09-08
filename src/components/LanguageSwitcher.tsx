'use client';

import { useState, useEffect } from 'react';

interface LanguageSwitcherProps {
  className?: string;
}

export default function LanguageSwitcher({ className = '' }: LanguageSwitcherProps) {
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'ar'>('en');

  useEffect(() => {
    // Load saved language preference
    const savedLang = localStorage.getItem('language') as 'en' | 'ar' || 'en';
    setCurrentLanguage(savedLang);
    
    // Apply language to document
    document.documentElement.lang = savedLang;
    document.documentElement.dir = savedLang === 'ar' ? 'rtl' : 'ltr';
  }, []);

  const handleLanguageChange = (lang: 'en' | 'ar') => {
    setCurrentLanguage(lang);
    localStorage.setItem('language', lang);
    
    // Apply language and direction to document
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    
    // Show notification
    const message = lang === 'ar' 
      ? 'تم تغيير اللغة إلى العربية' 
      : 'Language changed to English';
    
    // Simple notification (you can replace with a proper toast system)
    if (window.alert) {
      setTimeout(() => {
        alert(message);
      }, 100);
    }
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <span className="text-sm text-[var(--muted-foreground)]">
        {currentLanguage === 'ar' ? 'اللغة:' : 'Language:'}
      </span>
      
      <div className="flex bg-[var(--muted)] rounded-lg p-1 border border-[var(--border)]">
        <button
          onClick={() => handleLanguageChange('en')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
            currentLanguage === 'en'
              ? 'bg-[var(--primary)] text-[var(--primary-foreground)] shadow-sm'
              : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
          }`}
        >
          English
        </button>
        
        <button
          onClick={() => handleLanguageChange('ar')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
            currentLanguage === 'ar'
              ? 'bg-[var(--primary)] text-[var(--primary-foreground)] shadow-sm'
              : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
          }`}
        >
          العربية
        </button>
      </div>
    </div>
  );
}
