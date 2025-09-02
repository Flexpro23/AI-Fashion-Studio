'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// A simple icon component for demonstration
const Icon = ({ path, className }: { path: string; className?: string }) => (
  <svg className={`w-6 h-6 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={path} />
  </svg>
);

export default function BottomNavigation() {
  const { user } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const navItems = [
    {
      href: '/studio',
      label: 'Studio',
      icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707',
    },
    {
      href: '/lookbook',
      label: 'Lookbook',
      icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
    },
    {
      href: '/settings',
      label: 'Settings',
      icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[var(--background)]/95 backdrop-blur-lg border-t border-[var(--border)] z-50">
      <div className="flex justify-around items-center h-20 px-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href} 
              className={`flex flex-col items-center justify-center w-full p-2 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-gradient-to-b from-[var(--primary)] to-[var(--primary-alt)] text-[var(--primary-foreground)] shadow-lg scale-105' 
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--hover)]'
              }`}
            >
              <div className={`p-2 rounded-lg transition-all ${isActive ? 'bg-white/20' : ''}`}>
                <Icon path={item.icon} className="w-6 h-6" />
              </div>
              <span className={`text-xs font-medium mt-1 ${isActive ? 'font-semibold' : ''}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
      
      {/* iPhone-style home indicator */}
      <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-[var(--muted-foreground)]/30 rounded-full"></div>
    </nav>
  );
}
