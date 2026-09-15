import './globals.css';
import React from 'react';
import { BrandHeader, Navigation } from '@farm-seva/shared-ui';

export const metadata = {
  title: 'FARM SEVA DELIVERY — Logistics Partner Application',
  description: 'District Last-Mile Delivery & Route Navigation Application',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased">
        <BrandHeader role="DELIVERY" />
        <Navigation role="DELIVERY" />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 sm:py-8 pb-20 sm:pb-8">
          {children}
        </main>

        <footer className="bg-slate-900 text-slate-500 py-6 text-center text-xs border-t border-slate-800 hidden sm:block">
          <p>© 2026 FARM SEVA DELIVERY Application • Master Design System</p>
        </footer>
      </body>
    </html>
  );
}
