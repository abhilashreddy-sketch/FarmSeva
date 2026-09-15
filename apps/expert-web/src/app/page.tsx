import React from 'react';
import Link from 'next/link';
import { API_BASE_URL } from '../config/api';

export default function ExpertHomePage() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto py-6">
      <div className="bg-gradient-to-r from-sky-700 to-blue-900 text-white p-8 rounded-3xl shadow-xl space-y-4">
        <span className="bg-sky-300 text-sky-950 px-3 py-1 rounded-full text-xs font-black uppercase">
          Agronomist Workstation
        </span>
        <h1 className="text-3xl font-black">Welcome to FARM SEVA EXPERT</h1>
        <p className="text-sky-100 text-sm font-medium">
          Certified Agronomist & Pathologist Console — Review farmer crop disease submissions and issue treatment guidance.
        </p>
        <div className="flex gap-4 pt-2">
          <Link href="/login" className="bg-sky-300 text-sky-950 px-5 py-2.5 rounded-xl font-extrabold text-sm hover:bg-sky-200 transition">
            Expert Sign In
          </Link>
          <Link href="/register" className="bg-sky-800 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-sky-600 transition">
            Register Expert Profile
          </Link>
        </div>
      </div>

      <div className="p-6 bg-white border border-slate-200 rounded-2xl space-y-2 text-xs text-slate-600">
        <h3 className="font-bold text-slate-900 text-sm">Centralized API Connection</h3>
        <p>Endpoint Target: <code className="bg-slate-100 px-2 py-0.5 rounded text-sky-700 font-bold">{API_BASE_URL}</code></p>
        <p>Connected Database: Supabase PostgreSQL via Shared REST API</p>
      </div>
    </div>
  );
}
