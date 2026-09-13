'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';

import { API_BASE_URL } from '@/config/api';

export default function SellerEarningsDashboardPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();

  const [data, setData] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoading) {
      if (!user || user.role !== 'SELLER') {
        router.push('/login');
        return;
      }
      fetchAnalytics();
    }
  }, [user, isLoading, router]);

  const fetchAnalytics = async () => {
    setLoadingData(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/seller/analytics/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error?.message || 'Failed to load seller analytics');
      }
    } catch (e) {
      setError('Network error loading seller analytics');
    }
    setLoadingData(false);
  };

  if (isLoading || loadingData) {
    return <div className="p-8 text-center font-bold">Loading Seller Earnings Dashboard...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 space-y-6">
      {/* DEMO Warning Banner */}
      <div className="bg-amber-500 text-amber-950 p-4 rounded-2xl shadow flex items-center justify-between font-extrabold text-xs">
        <span className="flex items-center gap-2">
          <span>⚠️</span> DEMO ENVIRONMENT — NO REAL MONEY TRANSFERRED (Accounting simulation mode)
        </span>
        <span className="bg-amber-900 text-amber-100 px-3 py-1 rounded-full uppercase text-[10px]">
          SANDBOX MODE
        </span>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-gray-800 text-white p-6 rounded-3xl shadow-xl flex items-center justify-between flex-wrap gap-4">
        <div>
          <span className="bg-emerald-400 text-slate-950 text-xs font-black px-3 py-1 rounded-full uppercase">
            SELLER COMMERCIAL PORTAL
          </span>
          <h1 className="text-2xl font-black mt-2">{data?.businessName || 'My Retail Shop'}</h1>
          <p className="text-gray-300 text-xs mt-1 font-semibold">
            Status: <strong className="text-emerald-400">{data?.verificationStatus}</strong> • Payout Account: <strong>{data?.payoutAccountMasked}</strong> ({data?.ifscMasked})
          </p>
        </div>
        <button
          onClick={fetchAnalytics}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition border border-white/20"
        >
          🔄 Refresh Financials
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-2xl border border-red-200 text-xs font-bold">
          {error}
        </div>
      )}

      {/* Commercial Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl shadow-md border border-gray-100">
          <span className="text-xs font-bold text-gray-500 uppercase">Gross GMV Sales</span>
          <div className="text-2xl font-black text-gray-900 mt-1">₹{data?.metrics?.grossSalesGMV || 0}</div>
          <p className="text-[10px] text-gray-400 font-semibold mt-1">Total customer purchases</p>
        </div>

        <div className="bg-white p-5 rounded-3xl shadow-md border border-gray-100">
          <span className="text-xs font-bold text-gray-500 uppercase">Platform Commission</span>
          <div className="text-2xl font-black text-amber-600 mt-1">₹{data?.metrics?.platformCommission || 0}</div>
          <p className="text-[10px] text-gray-400 font-semibold mt-1">5% fee + transaction charges</p>
        </div>

        <div className="bg-white p-5 rounded-3xl shadow-md border border-gray-100">
          <span className="text-xs font-bold text-gray-500 uppercase">Net Seller Earnings</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">₹{data?.metrics?.netSellerEarnings || 0}</div>
          <p className="text-[10px] text-gray-400 font-semibold mt-1">Authoritative ledger balance</p>
        </div>

        <div className="bg-white p-5 rounded-3xl shadow-md border border-gray-100">
          <span className="text-xs font-bold text-gray-500 uppercase">Completed Settlements</span>
          <div className="text-2xl font-black text-blue-600 mt-1">₹{data?.metrics?.completedSettlementAmount || 0}</div>
          <p className="text-[10px] text-blue-500 font-semibold mt-1">DEMO accounting batches</p>
        </div>
      </div>

      {/* Operational Order & Stock Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Order Breakdown */}
        <div className="bg-white p-6 rounded-3xl shadow-md border border-gray-100 space-y-4">
          <h2 className="text-sm font-black text-gray-900 flex items-center justify-between">
            <span>📦 Order Fulfillment Summary</span>
            <span className="text-xs font-bold text-gray-400">Total: {data?.metrics?.totalOrders || 0}</span>
          </h2>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-amber-50 p-3 rounded-2xl border border-amber-100">
              <span className="text-xs font-bold text-amber-700">Pending</span>
              <div className="text-lg font-black text-amber-900">{data?.metrics?.pendingOrders || 0}</div>
            </div>
            <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-100">
              <span className="text-xs font-bold text-emerald-700">Delivered</span>
              <div className="text-lg font-black text-emerald-900">{data?.metrics?.completedOrders || 0}</div>
            </div>
            <div className="bg-red-50 p-3 rounded-2xl border border-red-100">
              <span className="text-xs font-bold text-red-700">Cancelled</span>
              <div className="text-lg font-black text-red-900">{data?.metrics?.cancelledOrders || 0}</div>
            </div>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white p-6 rounded-3xl shadow-md border border-gray-100 space-y-4">
          <h2 className="text-sm font-black text-gray-900 flex items-center justify-between">
            <span>⚠️ Low Stock Alerts</span>
            <span className="text-xs font-bold text-amber-600">{data?.lowStockListings?.length || 0} items</span>
          </h2>

          {(!data?.lowStockListings || data.lowStockListings.length === 0) ? (
            <div className="py-6 text-center text-xs text-gray-500 font-bold">
              All inventory levels are healthy (stock &gt; 5).
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {data.lowStockListings.map((item: any) => (
                <div key={item.id} className="p-3 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-amber-950">{item.productName}</div>
                    <div className="text-[10px] text-amber-700">Selling Price: ₹{item.sellingPrice}</div>
                  </div>
                  <span className="bg-amber-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full">
                    {item.quantityAvailable} LEFT
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Settlement History */}
      <div className="bg-white p-6 rounded-3xl shadow-md border border-gray-100 space-y-4">
        <h2 className="text-sm font-black text-gray-900">
          💸 Settlement Payout History
        </h2>

        {(!data?.settlements || data.settlements.length === 0) ? (
          <div className="py-8 text-center text-xs text-gray-500 font-bold">
            No settlement payouts processed yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 font-black uppercase text-[10px]">
                <tr>
                  <th className="p-3">Ref ID</th>
                  <th className="p-3">Gross Sales</th>
                  <th className="p-3">Commission</th>
                  <th className="p-3">Net Payout</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Mode</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-bold">
                {data.settlements.map((s: any) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="p-3 text-gray-900 font-mono text-[11px]">{s.settlementRef}</td>
                    <td className="p-3 text-gray-700">₹{s.totalGross}</td>
                    <td className="p-3 text-amber-600">₹{s.totalCommission}</td>
                    <td className="p-3 text-emerald-600 font-black">₹{s.totalNetPayout}</td>
                    <td className="p-3">
                      <span className="bg-blue-100 text-blue-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                        {s.status}
                      </span>
                    </td>
                    <td className="p-3 text-[10px] text-amber-700 font-semibold">{s.demoBadge}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
