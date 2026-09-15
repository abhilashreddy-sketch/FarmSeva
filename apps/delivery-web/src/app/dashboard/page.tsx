import React from 'react';

export default function DeliveryDashboardPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto py-6">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-sm space-y-2 text-slate-100">
        <span className="bg-purple-900 text-purple-200 text-xs font-bold px-2.5 py-1 rounded-full uppercase">
          Logistics Driver Console
        </span>
        <h1 className="text-2xl font-black text-white">Delivery Workspace Foundation</h1>
        <p className="text-xs text-slate-400 font-medium">
          Connected to Shared Express REST API & Supabase PostgreSQL Database.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-bold">
        <div className="p-4 bg-slate-900 border border-purple-900 rounded-xl text-purple-200">
          📍 HTML5 Live GPS Trajectory
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-emerald-400">
          🔑 Customer Delivery 4-Digit OTP Check
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-amber-400">
          💰 Daily & Weekly Earnings Ledger
        </div>
      </div>
    </div>
  );
}
