'use client';

import { API_BASE_URL } from '@/config/api';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';

export default function AdminMarketplacePage() {
  const { token, user } = useAuth();
  const [pendingProducts, setPendingProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (token && user?.role === 'ADMIN') {
      fetchPendingProducts();
    }
  }, [token]);

  const fetchPendingProducts = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/admin/marketplace/pending-products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setPendingProducts(data.data);
      }
    } catch (err: any) {
      console.error('Failed to load pending products', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/admin/marketplace/products/${id}/review`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        fetchPendingProducts();
      }
    } catch (err: any) {
      alert('Review failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
              <span>🏷️</span> Admin Catalog Control & Product Approval Queue
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Review seller submitted crop protection listings for CIB regulatory compliance before publishing.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-gray-500">
            <span className="text-3xl animate-spin inline-block">⏳</span>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200 font-extrabold text-sm text-gray-800">
              Pending Product Approvals ({pendingProducts.length})
            </div>
            {pendingProducts.length === 0 ? (
              <div className="p-12 text-center text-gray-500 text-xs font-semibold">
                ✅ All submitted products have been reviewed. Queue is currently empty.
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-100 text-gray-600 font-bold uppercase border-b border-gray-200">
                    <th className="p-3">Product Name</th>
                    <th className="p-3">Seller Business</th>
                    <th className="p-3">Pesticide License</th>
                    <th className="p-3">CIB Reg No.</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pendingProducts.map((p: any) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="p-3 font-bold text-gray-900">{p.name}</td>
                      <td className="p-3 text-gray-600">{p.seller?.businessName}</td>
                      <td className="p-3 font-mono">{p.seller?.pesticideLicenseNo}</td>
                      <td className="p-3 font-mono">{p.compliance?.cgbRegistrationNo || 'Pending'}</td>
                      <td className="p-3 text-right flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleReview(p.id, 'APPROVED')}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-3 py-1.5 rounded-lg shadow"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReview(p.id, 'REJECTED')}
                          className="bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs px-3 py-1.5 rounded-lg shadow"
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
