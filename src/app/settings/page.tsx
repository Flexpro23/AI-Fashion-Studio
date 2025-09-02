'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SettingsPage() {
  const { user, userData, logout } = useAuth();
  const router = useRouter();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

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
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gradient mb-2">Settings</h1>
          <p className="text-[var(--muted-foreground)]">Manage your account and preferences</p>
        </div>

        {/* Account Sections */}
        <div className="space-y-6">
          {sections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="card-step">
              <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4 flex items-center">
                <span className="mr-2">{section.title === 'Account Information' ? '👤' : '⚡'}</span>
                {section.title}
              </h2>
              
              <div className="space-y-3">
                {section.items.map((item, itemIndex) => (
                  <div 
                    key={itemIndex} 
                    className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 ${
                      item.highlight === 'success' 
                        ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                        : item.highlight === 'warning'
                        ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
                        : 'bg-[var(--muted)] border-[var(--border)]'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{item.icon}</span>
                      <span className="font-medium text-[var(--foreground)]">{item.label}</span>
                    </div>
                    <span className={`font-semibold ${
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
          ))}

          {/* Quick Actions */}
          <div className="card-step">
            <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4 flex items-center">
              <span className="mr-2">🎯</span>
              Quick Actions
            </h2>
            
            <div className="space-y-3">
              {/* View Plans */}
              <button
                onClick={() => router.push('/pricing')}
                className="w-full flex items-center justify-between p-4 rounded-xl bg-[var(--primary)]/10 border border-[var(--primary)]/20 hover:bg-[var(--primary)]/20 transition-all duration-200"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">💎</span>
                  <span className="font-medium text-[var(--foreground)]">View Plans & Pricing</span>
                </div>
                <svg className="w-5 h-5 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Contact Support */}
              <button
                onClick={() => router.push('/contact')}
                className="w-full flex items-center justify-between p-4 rounded-xl bg-[var(--muted)] border border-[var(--border)] hover:bg-[var(--hover)] transition-all duration-200"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">📞</span>
                  <span className="font-medium text-[var(--foreground)]">Contact Support</span>
                </div>
                <svg className="w-5 h-5 text-[var(--muted-foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Generation Status Alert */}
              {userData.remainingGenerations <= 0 && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">⚠️</span>
                    <div>
                      <p className="font-semibold text-red-600 dark:text-red-400">No Generations Remaining</p>
                      <p className="text-sm text-red-500 dark:text-red-300">Contact support to purchase more generations</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Logout Section */}
          <div className="card-step">
            <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4 flex items-center">
              <span className="mr-2">🚪</span>
              Account Management
            </h2>
            
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="w-full flex items-center justify-center p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/30 transition-all duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
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
