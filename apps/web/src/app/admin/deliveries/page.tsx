'use client';

import { API_BASE_URL } from '@/config/api';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';

export default function AdminDeliveriesPage() {
  const { token } = useAuth();
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [partners, setPartners] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Assignment Modal
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<string | null>(null);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>('');

  useEffect(() => {
    if (token) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [delRes, dpRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/v1/logistics/admin/deliveries`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/api/v1/logistics/admin/delivery-partners`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const delData = await delRes.json();
      const dpData = await dpRes.json();

      if (delData.success) setDeliveries(delData.data);
      if (dpData.success) setPartners(dpData.data);
    } catch (err) {
      setError('Error connecting to logistics admin service');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignPartner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeliveryId || !selectedPartnerId) {
      alert('Please select a delivery partner');
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/logistics/admin/deliveries/${selectedDeliveryId}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ deliveryPartnerId: selectedPartnerId }),
      });
      const data = await res.json();
      if (data.success) {
        setSelectedDeliveryId(null);
        setSelectedPartnerId('');
        fetchData();
      } else {
        alert(data.error?.message || 'Failed to assign delivery partner');
      }
    } catch (err) {
      alert('Error assigning delivery partner');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
              <span>🛵</span> Rural Logistics & Delivery Dispatch
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Assign delivery personnel to orders, monitor delivery status, and enforce OTP security.
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
            <p className="mt-2 text-sm text-gray-600 font-medium">Loading logistics queue...</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-100 border-b text-gray-700 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Delivery ID</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Village Destination</th>
                    <th className="p-4">Assigned Driver</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-gray-800">
                  {deliveries.map((del) => (
                    <tr key={del.id} className="hover:bg-gray-50/80">
                      <td className="p-4 font-mono font-bold">{del.id.slice(0, 8)}</td>
                      <td className="p-4">
                        <div className="font-bold">{del.order?.farmer?.user?.fullName}</div>
                        <div className="text-[10px] text-gray-500">{del.order?.farmer?.user?.phone}</div>
                      </td>
                      <td className="p-4 font-semibold">{del.order?.deliveryAddress?.villageOrCity}, {del.order?.deliveryAddress?.district}</td>
                      <td className="p-4 font-semibold text-indigo-700">
                        {del.deliveryPartner?.user?.fullName || <span className="text-amber-600 italic">Unassigned</span>}
                      </td>
                      <td className="p-4">
                        <span className={`font-extrabold text-[10px] px-2.5 py-1 rounded-full uppercase ${
                          del.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {del.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {del.status === 'PENDING' || del.status === 'ASSIGNED' ? (
                          <button
                            onClick={() => {
                              setSelectedDeliveryId(del.id);
                              setSelectedPartnerId(del.deliveryPartnerId || '');
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs shadow"
                          >
                            Assign / Change Driver
                          </button>
                        ) : (
                          <span className="text-[11px] text-gray-400 font-medium">In Transit / Completed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* DRIVER ASSIGNMENT MODAL */}
        {selectedDeliveryId && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-100">
              <h3 className="text-lg font-extrabold text-gray-900 mb-2 flex items-center gap-2">
                <span>🛵</span> Assign Delivery Partner
              </h3>
              <p className="text-xs text-gray-600 mb-4">
                Select an active delivery agent to pick up and dispatch this order package.
              </p>

              <form onSubmit={handleAssignPartner}>
                <div className="mb-6">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Delivery Partner *</label>
                  <select
                    value={selectedPartnerId}
                    onChange={(e) => setSelectedPartnerId(e.target.value)}
                    required
                    className="w-full border rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 font-semibold text-gray-800"
                  >
                    <option value="">Select a partner...</option>
                    {partners.map((dp) => (
                      <option key={dp.id} value={dp.id}>
                        {dp.user?.fullName} ({dp.vehicleType || 'Bike'} - {dp.user?.phone})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-2.5 rounded-xl shadow text-sm"
                  >
                    Confirm Assignment
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedDeliveryId(null)}
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
