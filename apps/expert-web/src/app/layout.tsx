import './globals.css';
import React from 'react';
import Link from 'next/link';
import { Microscope } from 'lucide-react';

export const metadata = {
  title: 'FARM SEVA EXPERT — Crop Expert Workstation',
  description: 'Agronomist Workstation for Plant Pathology & Crop Guidance',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased">
        <header className="bg-sky-700 text-white shadow-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 font-black text-xl tracking-tight text-white">
              <span className="p-1 bg-sky-900 text-sky-200 rounded-lg text-lg">🔬</span>
              <span>FARM SEVA EXPERT</span>
            </Link>
            <nav className="flex items-center gap-4 text-xs font-bold text-sky-100">
              <Link href="/" className="hover:text-white">Home</Link>
              <Link href="/login" className="hover:text-white">Login</Link>
              <Link href="/register" className="hover:text-white">Register Expert</Link>
              <Link href="/dashboard" className="bg-sky-950 text-white px-3 py-1.5 rounded-lg font-black">Workstation</Link>
            </nav>
          </div>
        </header>

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
          {children}
        </main>

        <footer className="bg-slate-900 text-slate-400 py-6 text-center text-xs border-t border-slate-800">
          <p>© 2026 FARM SEVA EXPERT Application • Connected to Shared REST API</p>
        </footer>
      </body>
    </html>
  );
}
