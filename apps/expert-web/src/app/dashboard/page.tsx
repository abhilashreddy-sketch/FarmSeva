import React from 'react';

export default function ExpertDashboardPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto py-6">
      <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-sm space-y-2">
        <span className="bg-sky-100 text-sky-800 text-xs font-bold px-2.5 py-1 rounded-full uppercase">
          Agronomist Workstation
        </span>
        <h1 className="text-2xl font-black text-slate-900">Expert Workstation Foundation</h1>
        <p className="text-xs text-slate-600 font-medium">
          Connected to Shared Express REST API & Supabase PostgreSQL Database.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-bold">
        <div className="p-4 bg-sky-50 border border-sky-200 rounded-xl text-sky-900">
          📋 Diagnostic Triage Queue
        </div>
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900">
          🔬 Leaf Photo & AI Assessment
        </div>
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900">
          📝 Prescriptive Advisory Issuance
        </div>
      </div>
    </div>
  );
}
