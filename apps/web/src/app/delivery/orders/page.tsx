'use client';

import { API_BASE_URL } from '@/config/api';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';

export default function DeliveryPartnerConsolePage() {
  const { token } = useAuth();
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // OTP Modal State
  const [otpModalDeliveryId, setOtpModalDeliveryId] = useState<string | null>(null);
  const [enteredOtp, setEnteredOtp] = useState<string>('');
  const [otpSubmitting, setOtpSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (token) {
      fetchAssignedDeliveries();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchAssignedDeliveries = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/logistics/delivery/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setDeliveries(data.data);
      } else {
        setError(data.error?.message || 'Failed to load assigned deliveries');
      }
    } catch (err) {
      setError('Error connecting to logistics service');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDeliveryStatus = async (deliveryId: string, status: string, deliveryOtp?: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/logistics/delivery/orders/${deliveryId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status, deliveryOtp }),
      });
      const data = await res.json();
      if (data.success) {
        setOtpModalDeliveryId(null);
        setEnteredOtp('');
        fetchAssignedDeliveries();
      } else {
        alert(data.error?.message || 'Failed to update delivery status');
      }
    } catch (err) {
      alert('Error updating delivery status');
    }
  };

  const handleVerifyOtpAndDeliver = (e: React.FormEvent) => {
    e.preventDefault();
    if (!enteredOtp || enteredOtp.length !== 6) {
      alert('Please enter a valid 6-digit OTP code');
      return;
    }
    if (otpModalDeliveryId) {
      handleUpdateDeliveryStatus(otpModalDeliveryId, 'DELIVERED', enteredOtp);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
              <span>🚚</span> Delivery Partner Console
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              View assigned rural deliveries, pickup packages, and verify OTP upon farmer drop-off.
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
            <p className="mt-2 text-sm text-gray-600 font-medium">Loading assigned tasks...</p>
          </div>
        ) : deliveries.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-200 shadow-sm">
            <span className="text-4xl">🛵</span>
            <h3 className="text-lg font-bold text-gray-800 mt-2">No Active Deliveries Assigned</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              You will be notified when an admin assigns new farmer delivery packages to you.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {deliveries.map((del) => (
              <div
                key={del.id}
                className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm flex flex-col md:flex-row justify-between gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-bold text-gray-500 font-mono">Delivery ID: {del.id.slice(0, 8)}</span>
                    <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase ${
                      del.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {del.status}
                    </span>
                  </div>

                  <p className="text-xs font-bold text-gray-900">
                    🧑‍🌾 Customer: {del.order?.farmer?.user?.fullName} ({del.order?.farmer?.user?.phone})
                  </p>

                  <p className="text-xs text-gray-600 mt-1">
                    📍 Drop-off Village: <strong>{del.order?.deliveryAddress?.villageOrCity}, {del.order?.deliveryAddress?.district}</strong>
                  </p>
                  <p className="text-[11px] text-gray-500">
                    Address: {del.order?.deliveryAddress?.addressLine1}
                  </p>

                  <div className="mt-2 text-xs text-emerald-700 font-bold">
                    💵 Payment Mode: {del.order?.paymentMethod} ({del.order?.totalAmount ? `₹${del.order.totalAmount}` : ''})
                  </div>
                </div>

                <div className="flex flex-col justify-center gap-2 border-l pl-4 min-w-[200px]">
                  {del.status === 'ASSIGNED' && (
                    <button
                      onClick={() => handleUpdateDeliveryStatus(del.id, 'PICKED_UP')}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 px-4 rounded-xl shadow"
                    >
                      📦 Confirm Pickup from Shop
                    </button>
                  )}

                  {del.status === 'PICKED_UP' && (
                    <button
                      onClick={() => handleUpdateDeliveryStatus(del.id, 'OUT_FOR_DELIVERY')}
                      className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs py-2 px-4 rounded-xl shadow"
                    >
                      🛵 Mark Out For Delivery
                    </button>
                  )}

                  {del.status === 'OUT_FOR_DELIVERY' && (
                    <button
                      onClick={() => {
                        setOtpModalDeliveryId(del.id);
                        setEnteredOtp('');
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-4 rounded-xl shadow flex items-center justify-center gap-1"
                    >
                      🔑 Verify Farmer Delivery OTP
                    </button>
                  )}

                  {del.status === 'DELIVERED' && (
                    <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-center">
                      ✅ Drop-Off Verified & Completed
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* OTP VERIFICATION MODAL */}
        {otpModalDeliveryId && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-100">
              <h3 className="text-lg font-extrabold text-gray-900 mb-2 flex items-center gap-2">
                <span>🔑</span> Enter Farmer Delivery OTP
              </h3>
              <p className="text-xs text-gray-600 mb-4">
                Ask the farmer for their 6-digit secret delivery OTP shown on their order invoice screen.
              </p>

              <form onSubmit={handleVerifyOtpAndDeliver}>
                <input
                  type="text"
                  maxLength={6}
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 849201"
                  required
                  className="w-full text-center text-3xl tracking-widest font-mono font-black border-2 border-emerald-500 rounded-xl py-3 focus:outline-none focus:ring-4 focus:ring-emerald-200 mb-6"
                />

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-2.5 rounded-xl shadow text-sm"
                  >
                    Verify & Complete Delivery
                  </button>
                  <button
                    type="button"
                    onClick={() => setOtpModalDeliveryId(null)}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold px-4 py-2.5 rounded-xl text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
