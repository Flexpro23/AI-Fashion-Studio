import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import BottomNavigation from '@/components/BottomNavigation';
import FirebaseStatusDebug from '@/components/FirebaseStatus';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Fashion Studio - Transform Your Vision Into Reality",
  description: "Create stunning fashion photos with AI-powered image generation. Upload your model and garment photos to see realistic fashion combinations in seconds.",
  keywords: "AI fashion, fashion photography, AI image generation, clothing visualization, fashion design",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <Navigation />
          <main className="min-h-screen">
            {children}
          </main>
          <BottomNavigation />
          <FirebaseStatusDebug />
        </AuthProvider>
      </body>
    </html>
  );
}
