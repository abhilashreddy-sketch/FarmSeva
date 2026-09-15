import './globals.css';
import React from 'react';
import { LanguageProvider } from '../context/LanguageContext';
import { AuthProvider } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { Footer } from '../components/Footer';
import { FloatingCropDoctor } from '../components/FloatingCropDoctor';
import { MobileBottomNav } from '../components/MobileBottomNav';

export const metadata = {
  title: 'FARM SEVA - Multi-Channel Agricultural Marketplace & Crop Advisory',
  description: 'India\'s multi-channel agricultural platform for farmers, agri-dealers, crop experts, and district logistics.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased selection:bg-emerald-500 selection:text-white pb-14 md:pb-0">
        <AuthProvider>
          <LanguageProvider>
            <Navbar />
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
              {children}
            </main>
            <Footer />
            <FloatingCropDoctor />
            <MobileBottomNav />
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
