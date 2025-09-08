'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function SettingsPage() {
  const { user, userData, logout } = useAuth();
  const router = useRouter();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showAccountInfo, setShowAccountInfo] = useState(false);

  if (!user || !userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-luxury w-12 h-12"></div>
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const sections = [
    {
      title: 'Account Information',
      items: [
        { label: 'Name', value: userData.name, icon: '👤' },
        { label: 'Email', value: userData.email, icon: '📧' },
        { label: 'Phone', value: userData.phone, icon: '📱' },
        { 
          label: 'Member Since', 
          value: userData.createdAt.toLocaleDateString(), 
          icon: '📅' 
        }
      ]
    },
    {
      title: 'Generation Status',
      items: [
        { 
          label: 'Remaining Generations', 
          value: userData.remainingGenerations.toString(), 
          icon: '⚡',
          highlight: userData.remainingGenerations > 0 ? 'success' : 'warning'
        },
        { 
          label: 'Total Generated', 
          value: userData.totalGenerations.toString(), 
          icon: '🎨' 
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--background)] via-[var(--surface)] to-[var(--background-alt)] pb-24">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-2xl">
        {/* Compact Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gradient mb-1 sm:mb-2">Settings</h1>
          <p className="text-sm sm:text-base text-[var(--muted-foreground)] hidden sm:block">Manage your account and preferences</p>
        </div>

        {/* Compact Sections */}
        <div className="space-y-4 sm:space-y-6">
          {/* Collapsible Account Information */}
          <div className="card-step">
            <button
              onClick={() => setShowAccountInfo(!showAccountInfo)}
              className="w-full flex items-center justify-between p-2 sm:p-4 hover:bg-[var(--hover)] rounded-xl transition-all duration-200"
            >
              <div className="flex items-center space-x-2 sm:space-x-3">
                <span className="text-xl sm:text-2xl">👤</span>
                <span className="font-semibold text-[var(--foreground)] text-sm sm:text-xl">Account Information</span>
              </div>
              <svg 
                className={`w-4 h-4 sm:w-5 sm:h-5 text-[var(--muted-foreground)] transition-transform duration-200 ${
                  showAccountInfo ? 'rotate-180' : ''
                }`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showAccountInfo && (
              <div className="space-y-2 sm:space-y-3 mt-3 sm:mt-4 px-2 sm:px-4 pb-2 sm:pb-4">
                {sections[0].items.map((item, itemIndex) => (
                  <div 
                    key={itemIndex} 
                    className="flex items-center justify-between p-2 sm:p-3 rounded-xl bg-[var(--muted)] border border-[var(--border)]"
                  >
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <span className="text-base sm:text-xl">{item.icon}</span>
                      <span className="font-medium text-[var(--foreground)] text-xs sm:text-sm">{item.label}</span>
                    </div>
                    <span className="text-[var(--muted-foreground)] text-xs sm:text-sm font-medium">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Generation Status - Always Visible */}
          <div className="card-step">
            <h2 className="text-lg sm:text-xl font-semibold text-[var(--foreground)] mb-3 sm:mb-4 flex items-center p-2 sm:p-0">
              <span className="mr-2 text-xl sm:text-2xl">⚡</span>
              Generation Status
            </h2>
            
            <div className="space-y-2 sm:space-y-3">
              {sections[1].items.map((item, itemIndex) => (
                <div 
                  key={itemIndex} 
                  className={`flex items-center justify-between p-3 sm:p-4 rounded-xl border transition-all duration-200 ${
                    item.highlight === 'success' 
                      ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                      : item.highlight === 'warning'
                      ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
                      : 'bg-[var(--muted)] border-[var(--border)]'
                  }`}
                >
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <span className="text-base sm:text-xl">{item.icon}</span>
                    <span className="font-medium text-[var(--foreground)] text-sm sm:text-base">{item.label}</span>
                  </div>
                  <span className={`font-semibold text-sm sm:text-base ${
                    item.highlight === 'success' 
                      ? 'text-green-600 dark:text-green-400'
                      : item.highlight === 'warning'
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-[var(--muted-foreground)]'
                  }`}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions - Compact */}
          <div className="card-step">
            <h2 className="text-base sm:text-lg font-semibold text-[var(--foreground)] mb-3 flex items-center">
              <span className="mr-2 text-lg">🎯</span>
              Quick Actions
            </h2>
            
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {/* View Plans */}
              <button
                onClick={() => router.push('/pricing')}
                className="flex flex-col items-center p-2 sm:p-3 rounded-lg bg-[var(--primary)]/10 border border-[var(--primary)]/20 hover:bg-[var(--primary)]/20 transition-all duration-200"
              >
                <span className="text-lg mb-1">💎</span>
                <span className="text-xs sm:text-sm font-medium text-[var(--foreground)] text-center">Plans & Pricing</span>
              </button>

              {/* Contact Support */}
              <button
                onClick={() => router.push('/contact')}
                className="flex flex-col items-center p-2 sm:p-3 rounded-lg bg-[var(--muted)] border border-[var(--border)] hover:bg-[var(--hover)] transition-all duration-200"
              >
                <span className="text-lg mb-1">📞</span>
                <span className="text-xs sm:text-sm font-medium text-[var(--foreground)] text-center">Contact Support</span>
              </button>
            </div>

              {/* Generation Status Alert */}
              {userData.remainingGenerations <= 0 && (
                <div className="mt-3 p-3 rounded-lg bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">⚠️</span>
                    <div>
                      <p className="text-sm font-semibold text-red-600 dark:text-red-400">No Generations Remaining</p>
                      <p className="text-xs text-red-500 dark:text-red-300">Contact support to purchase more</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Language Settings */}
          <div className="card-step">
            <h2 className="text-base sm:text-lg font-semibold text-[var(--foreground)] mb-3 flex items-center">
              <span className="mr-2 text-lg">🌐</span>
              Language Settings
            </h2>
            
            <LanguageSwitcher />
          </div>

          {/* Account Management - Moved to End */}
          <div className="card-step">
            <h2 className="text-base sm:text-lg font-semibold text-[var(--foreground)] mb-3 flex items-center">
              <span className="mr-2 text-lg">🚪</span>
              Account Management
            </h2>
            
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="w-full flex items-center justify-center p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/30 transition-all duration-200"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="text-sm font-medium">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Logout Confirmation Modal */}
        {showLogoutConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-[var(--background)] rounded-2xl p-6 max-w-sm w-full">
              <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">Confirm Sign Out</h3>
              <p className="text-[var(--muted-foreground)] mb-6">
                Are you sure you want to sign out of your account?
              </p>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 bg-red-500 text-white py-2 px-4 rounded-xl hover:bg-red-600 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
