import './globals.css';
import React from 'react';
import Link from 'next/link';
import { Truck } from 'lucide-react';

export const metadata = {
  title: 'FARM SEVA DELIVERY — Logistics Partner Application',
  description: 'District Last-Mile Delivery & Route Navigation Application',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased">
        <header className="bg-purple-900 border-b border-purple-800 text-white shadow-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 font-black text-xl tracking-tight text-white">
              <span className="p-1 bg-purple-700 text-white rounded-lg text-lg">🚚</span>
              <span>FARM SEVA DELIVERY</span>
            </Link>
            <nav className="flex items-center gap-4 text-xs font-bold text-purple-200">
              <Link href="/" className="hover:text-white">Home</Link>
              <Link href="/login" className="hover:text-white">Login</Link>
              <Link href="/register" className="hover:text-white">Register Driver</Link>
              <Link href="/dashboard" className="bg-purple-600 text-white px-3 py-1.5 rounded-lg font-black">Logistics Console</Link>
            </nav>
          </div>
        </header>

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
          {children}
        </main>

        <footer className="bg-slate-900 text-slate-500 py-6 text-center text-xs border-t border-slate-800">
          <p>© 2026 FARM SEVA DELIVERY Application • Connected to Shared REST API</p>
        </footer>
      </body>
    </html>
  );
}
