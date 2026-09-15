import './globals.css';
import React from 'react';
import Link from 'next/link';
import { Sprout, Home, ShoppingBag, ShoppingCart, User } from 'lucide-react';

export const metadata = {
  title: 'FARM SEVA FARMER — Customer Application',
  description: 'India\'s Multi-Channel Farmer Marketplace & Crop Support Application',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased">
        <header className="bg-emerald-800 text-white shadow-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 font-black text-xl tracking-tight text-white">
              <span className="p-1 bg-amber-400 text-emerald-950 rounded-lg text-lg">🌾</span>
              <span>FARM SEVA FARMER</span>
            </Link>
            <nav className="flex items-center gap-4 text-xs font-bold text-emerald-100">
              <Link href="/" className="hover:text-white">Home</Link>
              <Link href="/login" className="hover:text-white">Login</Link>
              <Link href="/register" className="hover:text-white">Register</Link>
              <Link href="/dashboard" className="bg-amber-400 text-emerald-950 px-3 py-1.5 rounded-lg font-black">Dashboard</Link>
            </nav>
          </div>
        </header>

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
          {children}
        </main>

        <footer className="bg-emerald-950 text-emerald-200 py-6 text-center text-xs border-t border-emerald-900">
          <p>© 2026 FARM SEVA FARMER Application • Connected to Shared REST API</p>
        </footer>
      </body>
    </html>
  );
}
