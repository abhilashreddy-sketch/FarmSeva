import React from 'react';

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto py-6">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-2 text-white">
        <span className="bg-amber-400 text-slate-950 text-xs font-bold px-2.5 py-1 rounded-full uppercase">
          Protected Control Desk
        </span>
        <h1 className="text-2xl font-black text-amber-400">Admin Operations Workstation Foundation</h1>
        <p className="text-xs text-slate-400 font-medium">
          Connected to Shared Express REST API & Supabase PostgreSQL Database.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-bold">
        <div className="p-4 bg-white border border-slate-200 rounded-xl text-slate-900">
          📜 Seller & Expert KYC Moderation
        </div>
        <div className="p-4 bg-white border border-slate-200 rounded-xl text-slate-900">
          📦 Product Catalog Approvals
        </div>
        <div className="p-4 bg-white border border-slate-200 rounded-xl text-slate-900">
          📊 Platform Revenue & Emergency Broadcasts
        </div>
      </div>
    </div>
  );
}
