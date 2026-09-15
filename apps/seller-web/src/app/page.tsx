import React from 'react';
import Link from 'next/link';
import { API_BASE_URL } from '../config/api';

export default function SellerHomePage() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto py-6">
      <div className="bg-gradient-to-r from-amber-700 to-amber-900 text-white p-8 rounded-3xl shadow-xl space-y-4">
        <span className="bg-amber-300 text-amber-950 px-3 py-1 rounded-full text-xs font-black uppercase">
          Agri Dealer Application
        </span>
        <h1 className="text-3xl font-black">Welcome to FARM SEVA SELLER</h1>
        <p className="text-amber-100 text-sm font-medium">
          Licensed Retail Shop Console — Manage inventory stock, list agricultural products, and fulfill district farmer orders.
        </p>
        <div className="flex gap-4 pt-2">
          <Link href="/login" className="bg-amber-300 text-amber-950 px-5 py-2.5 rounded-xl font-extrabold text-sm hover:bg-amber-200 transition">
            Seller Sign In
          </Link>
          <Link href="/register" className="bg-amber-800 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-amber-700 transition">
            Register Agri Shop
          </Link>
        </div>
      </div>

      <div className="p-6 bg-white border border-slate-200 rounded-2xl space-y-2 text-xs text-slate-600">
        <h3 className="font-bold text-slate-900 text-sm">Centralized API Connection</h3>
        <p>Endpoint Target: <code className="bg-slate-100 px-2 py-0.5 rounded text-amber-700 font-bold">{API_BASE_URL}</code></p>
        <p>Connected Database: Supabase PostgreSQL via Shared REST API</p>
      </div>
    </div>
  );
}
