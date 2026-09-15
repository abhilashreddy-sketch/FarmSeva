import './globals.css';
import React from 'react';
import { BrandHeader, Navigation } from '@farm-seva/shared-ui';
import { CropDoctorModal } from '../components/CropDoctorModal';

export const metadata = {
  title: 'FARM SEVA FARMER — Customer Application',
  description: 'India\'s Multi-Channel Farmer Marketplace & Crop Support Application',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased">
        <BrandHeader role="FARMER" />
        <Navigation role="FARMER" />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 sm:py-8 pb-24 sm:pb-8">
          {children}
        </main>

        <CropDoctorModal />

        <footer className="bg-slate-900 text-slate-400 py-6 text-center text-xs border-t border-slate-800 hidden sm:block">
          <p>© 2026 FARM SEVA FARMER Application • Connected to Central REST API</p>
        </footer>
      </body>
    </html>
  );
}
