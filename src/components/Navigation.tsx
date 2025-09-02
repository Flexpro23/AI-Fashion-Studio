'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const { user, userData, logout } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const navItems = [
    { href: '/studio', label: 'Studio' },
    { href: '/lookbook', label: 'Lookbook' },
  ];

  return (
    <nav className="hidden md:flex bg-[var(--background)]/80 backdrop-blur-lg border-b border-[var(--border)] sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center space-x-12">
            {/* Enhanced Logo */}
            <Link href="/studio" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-[var(--primary)] to-[var(--primary-alt)] rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                <svg className="w-6 h-6 text-[var(--primary-foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707" />
                </svg>
              </div>
              <h1 className="text-heading-3 text-gradient font-bold">AI Fashion Studio</h1>
            </Link>
            
            {/* Enhanced Navigation Links */}
            <div className="flex items-center space-x-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      isActive 
                        ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--primary-alt)] text-[var(--primary-foreground)] shadow-md' 
                        : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--hover)]'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
          
          {/* User Section */}
          <div className="flex items-center space-x-6">
            {/* Generation Counter */}
            {userData && (
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-[var(--primary)] to-[var(--primary-alt)] rounded-full px-4 py-2">
                  <div className="flex items-center space-x-2 text-white">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span className="font-bold">{userData.remainingGenerations}</span>
                    <span className="text-sm opacity-90">left</span>
                  </div>
                </div>
                {userData.remainingGenerations <= 0 && (
                  <Link href="/contact" className="text-xs text-red-400 hover:underline">
                    Get more →
                  </Link>
                )}
              </div>
            )}

            <div className="text-right">
              <p className="text-body-sm text-[var(--muted-foreground)]">Welcome back</p>
              <p className="text-caption text-[var(--foreground)] font-semibold">
                {userData?.name || user.email}
              </p>
            </div>
            <button
              onClick={logout}
              className="btn-ghost flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
