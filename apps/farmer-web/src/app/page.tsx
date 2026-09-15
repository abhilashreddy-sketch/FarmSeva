import React from 'react';
import Link from 'next/link';
import { Sprout, ShoppingBag, ArrowRight } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

export default function FarmerHomePage() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto py-6">
      <div className="bg-gradient-to-r from-emerald-800 to-green-900 text-white p-8 rounded-3xl shadow-xl space-y-4">
        <span className="bg-amber-400 text-emerald-950 px-3 py-1 rounded-full text-xs font-black uppercase">
          Customer Application
        </span>
        <h1 className="text-3xl font-black">Welcome to FARM SEVA FARMER</h1>
        <p className="text-emerald-100 text-sm font-medium">
          Buy verified agricultural inputs, track crop sowings, and get Gemini AI crop disease diagnostics.
        </p>
        <div className="flex gap-4 pt-2">
          <Link href="/login" className="bg-amber-400 text-emerald-950 px-5 py-2.5 rounded-xl font-extrabold text-sm hover:bg-amber-300 transition">
            Farmer Sign In
          </Link>
          <Link href="/register" className="bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-emerald-600 transition">
            Register Account
          </Link>
        </div>
      </div>

      <div className="p-6 bg-white border border-slate-200 rounded-2xl space-y-2 text-xs text-slate-600">
        <h3 className="font-bold text-slate-900 text-sm">Centralized API Connection</h3>
        <p>Endpoint Target: <code className="bg-slate-100 px-2 py-0.5 rounded text-emerald-700 font-bold">{API_BASE_URL}</code></p>
        <p>Connected Database: Supabase PostgreSQL via Shared REST API</p>
      </div>
    </div>
  );
}
