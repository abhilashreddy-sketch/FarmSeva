'use client';

import { API_BASE_URL } from '@/config/api';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';

export default function SellerOrdersPage() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      fetchShopOrders();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchShopOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/orders/seller/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setOrders(data.data);
      } else {
        setError(data.error?.message || 'Failed to load shop orders');
      }
    } catch (err) {
      setError('Error connecting to seller order service');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/orders/seller/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        fetchShopOrders();
      } else {
        alert(data.error?.message || 'Failed to update order status');
      }
    } catch (err) {
      alert('Error updating order status');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
              <span>🏪</span> Agro-Retailer Fulfillment Console
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Manage incoming farmer orders, update fulfillment state, and trigger delivery dispatch.
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
            <p className="mt-2 text-sm text-gray-600 font-medium">Loading shop orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-200 shadow-sm">
            <span className="text-4xl">📋</span>
            <h3 className="text-lg font-bold text-gray-800 mt-2">No Active Farmer Orders</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              Orders placed by farmers for your shop products will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((ord) => (
              <div
                key={ord.id}
                className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm flex flex-col md:flex-row justify-between gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-bold text-gray-500 font-mono">Order #{ord.id.slice(0, 8)}</span>
                    <span className="text-[10px] font-extrabold bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full uppercase">
                      {ord.status}
                    </span>
                  </div>

                  <p className="text-xs font-bold text-gray-900">
                    🧑‍🌾 Farmer: {ord.farmer?.user?.fullName} ({ord.farmer?.user?.phone})
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    📍 Destination: {ord.deliveryAddress?.villageOrCity}, {ord.deliveryAddress?.district}
                  </p>

                  <div className="mt-3 divide-y border-t pt-2">
                    {ord.items?.map((item: any) => (
                      <div key={item.id} className="py-1 flex justify-between text-xs text-gray-700">
                        <span>{item.product?.name} ({item.variant?.packSize} {item.variant?.unit})</span>
                        <span className="font-bold">x {item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col justify-between items-end gap-2 border-l pl-4">
                  <div className="text-right">
                    <span className="text-xs text-gray-500">Order Value</span>
                    <p className="text-lg font-extrabold text-emerald-700">₹{ord.totalAmount.toFixed(2)}</p>
                  </div>

                  {/* Status Action Buttons */}
                  <div className="flex flex-wrap gap-2">
                    {ord.status === 'PENDING_ACCEPTANCE' && (
                      <button
                        onClick={() => handleUpdateStatus(ord.id, 'ACCEPTED')}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow"
                      >
                        Accept Order
                      </button>
                    )}
                    {ord.status === 'ACCEPTED' && (
                      <button
                        onClick={() => handleUpdateStatus(ord.id, 'PACKING')}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow"
                      >
                        Start Packing
                      </button>
                    )}
                    {ord.status === 'PACKING' && (
                      <button
                        onClick={() => handleUpdateStatus(ord.id, 'DISPATCHED')}
                        className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow"
                      >
                        Dispatch Package
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
