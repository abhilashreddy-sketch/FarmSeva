'use client';

import { API_BASE_URL } from '@/config/api';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';

export default function AdminOrdersPage() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      fetchAllOrders();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchAllOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/orders/admin/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setOrders(data.data);
      } else {
        setError(data.error?.message || 'Failed to load order audit log');
      }
    } catch (err) {
      setError('Error connecting to admin order service');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
              <span>🛡️</span> Platform Admin Order Log
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Comprehensive system-wide order registry across all shops, farmers, and delivery states.
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm mb-6">
            ⚠️ {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <span className="text-3xl animate-spin inline-block">⏳</span>
            <p className="mt-2 text-sm text-gray-600 font-medium">Loading platform audit log...</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-100 border-b text-gray-700 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Order ID</th>
                    <th className="p-4">Farmer</th>
                    <th className="p-4">Retail Shop</th>
                    <th className="p-4">Village / District</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Payment</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-gray-800">
                  {orders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-gray-50/80">
                      <td className="p-4 font-mono font-bold">{ord.id.slice(0, 8)}</td>
                      <td className="p-4">
                        <div className="font-bold">{ord.farmer?.user?.fullName}</div>
                        <div className="text-[10px] text-gray-500">{ord.farmer?.user?.phone}</div>
                      </td>
                      <td className="p-4 font-semibold">{ord.sellerShop?.shopName}</td>
                      <td className="p-4">{ord.deliveryAddress?.villageOrCity}, {ord.deliveryAddress?.district}</td>
                      <td className="p-4 font-extrabold text-emerald-700">₹{ord.totalAmount.toFixed(2)}</td>
                      <td className="p-4 font-semibold">{ord.paymentMethod}</td>
                      <td className="p-4">
                        <span className="bg-emerald-100 text-emerald-800 font-extrabold text-[10px] px-2 py-0.5 rounded-full uppercase">
                          {ord.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
