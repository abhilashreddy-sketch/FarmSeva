import React from 'react';
import Link from 'next/link';
import { API_BASE_URL } from '../config/api';

export default function AdminHomePage() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto py-6">
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-8 rounded-3xl shadow-xl space-y-4 border border-slate-700">
        <span className="bg-amber-400 text-slate-950 px-3 py-1 rounded-full text-xs font-black uppercase">
          Protected Operations Workstation
        </span>
        <h1 className="text-3xl font-black text-amber-400">Welcome to FARM SEVA ADMIN</h1>
        <p className="text-slate-300 text-sm font-medium">
          Platform Governance & Operations Desk — Seller/Expert KYC moderation, product catalog approvals, delivery oversight, and revenue auditing.
        </p>
        <div className="flex gap-4 pt-2">
          <Link href="/login" className="bg-amber-400 text-slate-950 px-5 py-2.5 rounded-xl font-extrabold text-sm hover:bg-amber-300 transition">
            Admin Authenticate
          </Link>
          <Link href="/dashboard" className="bg-slate-800 text-white border border-slate-600 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-700 transition">
            View Operations Desk
          </Link>
        </div>
      </div>

      <div className="p-6 bg-white border border-slate-200 rounded-2xl space-y-2 text-xs text-slate-600">
        <h3 className="font-bold text-slate-900 text-sm">Centralized API Connection</h3>
        <p>Endpoint Target: <code className="bg-slate-100 px-2 py-0.5 rounded text-slate-800 font-bold">{API_BASE_URL}</code></p>
        <p>Connected Database: Supabase PostgreSQL via Shared REST API</p>
      </div>
    </div>
  );
}
