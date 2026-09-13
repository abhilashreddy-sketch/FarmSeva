'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';

import { API_BASE_URL } from '@/config/api';

export default function AdminBusinessDashboardPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();

  const [metrics, setMetrics] = useState<any>(null);
  const [reconciliation, setReconciliation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!isLoading) {
      if (!user || user.role !== 'ADMIN') {
        router.push('/login');
        return;
      }
      fetchBusinessData();
    }
  }, [user, isLoading, router]);

  const fetchBusinessData = async () => {
    setLoading(true);
    setMsg('');
    try {
      const [mRes, rRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/v1/admin/business/revenue`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/api/v1/admin/financial/reconciliation`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const mData = await mRes.json();
      const rData = await rRes.json();

      if (mData.success) setMetrics(mData.data);
      if (rData.success) setReconciliation(rData.data);
    } catch (e) {
      setMsg('Failed to load admin financial metrics');
    }
    setLoading(false);
  };

  const handleDownloadCSV = () => {
    window.open(`${API_BASE_URL}/api/v1/admin/business/reports/export`, '_blank');
  };

  if (isLoading || loading) {
    return <div className="p-8 text-center font-bold">Loading Admin Business Command Center...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-950 to-teal-900 text-white p-6 rounded-3xl shadow-xl flex items-center justify-between flex-wrap gap-4">
        <div>
          <span className="bg-amber-400 text-emerald-950 text-xs font-black px-3 py-1 rounded-full uppercase">
            ADMIN COMMERCIAL REVENUE DESK
          </span>
          <h1 className="text-2xl font-black mt-2">Financial Engine & Reconciliation</h1>
          <p className="text-emerald-100 text-xs mt-1 font-semibold">
            Mode: <strong>{metrics?.settlementMode}</strong>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadCSV}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl transition shadow"
          >
            📥 Export CSV Report
          </button>
          <button
            onClick={fetchBusinessData}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition border border-white/20"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {msg && (
        <div className="p-4 bg-red-50 text-red-700 rounded-2xl border border-red-200 text-xs font-bold">
          {msg}
        </div>
      )}

      {/* Commercial Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl shadow-md border border-gray-100">
          <span className="text-xs font-bold text-gray-500 uppercase">Gross GMV</span>
          <div className="text-2xl font-black text-gray-900 mt-1">₹{metrics?.grossGMV || 0}</div>
          <p className="text-[10px] text-gray-400 font-semibold mt-1">Total platform sales volume</p>
        </div>

        <div className="bg-white p-5 rounded-3xl shadow-md border border-gray-100">
          <span className="text-xs font-bold text-emerald-700 uppercase">Platform Revenue</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">₹{metrics?.platformRevenue || 0}</div>
          <p className="text-[10px] text-emerald-500 font-semibold mt-1">Net earned commissions</p>
        </div>

        <div className="bg-white p-5 rounded-3xl shadow-md border border-gray-100">
          <span className="text-xs font-bold text-gray-500 uppercase">Avg Order Value (AOV)</span>
          <div className="text-2xl font-black text-blue-600 mt-1">₹{metrics?.averageOrderValue || 0}</div>
          <p className="text-[10px] text-gray-400 font-semibold mt-1">Per transaction average</p>
        </div>

        <div className="bg-white p-5 rounded-3xl shadow-md border border-gray-100">
          <span className="text-xs font-bold text-gray-500 uppercase">Cancellation Rate</span>
          <div className="text-2xl font-black text-red-600 mt-1">{metrics?.cancellationRatePercent || 0}%</div>
          <p className="text-[10px] text-gray-400 font-semibold mt-1">Order cancellation ratio</p>
        </div>
      </div>

      {/* Financial Reconciliation Audit */}
      <div className="bg-white p-6 rounded-3xl shadow-md border border-gray-100 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-black text-gray-900">
              ⚖️ Automated Financial Reconciliation Desk
            </h2>
            <p className="text-xs text-gray-500 font-semibold mt-0.5">
              Cross-checks Gateway Payments ↔ Double-Entry Ledger ↔ Seller Settlements
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
            reconciliation?.isBalanced ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
          }`}>
            {reconciliation?.isBalanced ? '✅ LEDGER BALANCED' : '❌ DISCREPANCY DETECTED'}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center text-xs">
          <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
            <div className="font-bold text-gray-500">Total Debits</div>
            <div className="text-base font-black text-gray-900 mt-0.5">₹{reconciliation?.globalLedgerDebits || 0}</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
            <div className="font-bold text-gray-500">Total Credits</div>
            <div className="text-base font-black text-gray-900 mt-0.5">₹{reconciliation?.globalLedgerCredits || 0}</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
            <div className="font-bold text-gray-500">Ledger Difference</div>
            <div className="text-base font-black text-emerald-600 mt-0.5">₹{reconciliation?.ledgerDifference || 0}</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
            <div className="font-bold text-gray-500">Discrepancy Count</div>
            <div className="text-base font-black text-gray-900 mt-0.5">{reconciliation?.discrepancyCount || 0}</div>
          </div>
        </div>

        {reconciliation?.discrepancies?.length > 0 && (
          <div className="space-y-2 mt-4">
            <h3 className="text-xs font-black uppercase text-red-600">Audit Discrepancies ({reconciliation.discrepancies.length})</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {reconciliation.discrepancies.map((d: any, idx: number) => (
                <div key={idx} className="p-3 bg-red-50 text-red-900 text-xs font-bold rounded-2xl border border-red-200">
                  <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase mr-2">
                    {d.type}
                  </span>
                  {d.description}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
