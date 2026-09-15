import React from 'react';
import Link from 'next/link';
import { API_BASE_URL } from '../config/api';

export default function DeliveryHomePage() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto py-6">
      <div className="bg-gradient-to-r from-purple-900 to-slate-900 border border-purple-800 text-white p-8 rounded-3xl shadow-xl space-y-4">
        <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-black uppercase">
          Logistics Application
        </span>
        <h1 className="text-3xl font-black">Welcome to FARM SEVA DELIVERY</h1>
        <p className="text-purple-200 text-sm font-medium">
          District Last-Mile Delivery Partner Console — Toggle online status, stream real-time GPS coordinates, and verify 4-digit customer delivery OTPs.
        </p>
        <div className="flex gap-4 pt-2">
          <Link href="/login" className="bg-purple-600 text-white px-5 py-2.5 rounded-xl font-extrabold text-sm hover:bg-purple-500 transition">
            Driver Sign In
          </Link>
          <Link href="/register" className="bg-slate-800 text-purple-200 border border-purple-700 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-700 transition">
            Register Driver Account
          </Link>
        </div>
      </div>

      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-2 text-xs text-slate-400">
        <h3 className="font-bold text-slate-100 text-sm">Centralized API Connection</h3>
        <p>Endpoint Target: <code className="bg-slate-950 px-2 py-0.5 rounded text-purple-400 font-bold">{API_BASE_URL}</code></p>
        <p>Connected Database: Supabase PostgreSQL via Shared REST API</p>
      </div>
    </div>
  );
}
