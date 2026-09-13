'use client';

import { API_BASE_URL } from '@/config/api';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';

export default function SellerMarketplacePage() {
  const { token, user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (token && user?.role === 'SELLER') {
      fetchSellerListings();
    }
  }, [token]);

  const fetchSellerListings = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/seller/marketplace/listings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const resData = await res.json();
      if (resData.success) {
        setData(resData.data);
      }
    } catch (err: any) {
      console.error('Failed to load seller listings', err);
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
              <span>📦</span> Retailer Inventory & Shop Listings Manager
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Manage product pricing and stock inventory for {data?.businessName || 'your agri retail store'}.
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
              Active Shop Listings ({data?.listings?.length || 0})
            </div>
            {data?.listings?.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-xs font-semibold">
                No active listings yet. Add products to start selling to local farmers.
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-100 text-gray-600 font-bold uppercase border-b border-gray-200">
                    <th className="p-3">Product Name</th>
                    <th className="p-3">Shop</th>
                    <th className="p-3">Pack Variant</th>
                    <th className="p-3">Stock Available</th>
                    <th className="p-3">Selling Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data?.listings?.map((l: any) => (
                    <tr key={l.id} className="hover:bg-gray-50">
                      <td className="p-3 font-bold text-gray-900">{l.product?.name}</td>
                      <td className="p-3 text-gray-600">{l.shop?.shopName}</td>
                      <td className="p-3 font-semibold">{l.variant?.packSize} {l.variant?.packUnit}</td>
                      <td className="p-3 font-bold">
                        <div className="flex items-center gap-2">
                          <span>{l.quantityAvailable} units</span>
                          {l.quantityAvailable === 0 ? (
                            <span className="bg-red-100 text-red-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                              OUT OF STOCK
                            </span>
                          ) : l.quantityAvailable <= 5 ? (
                            <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase animate-pulse">
                              LOW STOCK
                            </span>
                          ) : (
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                              IN STOCK
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 font-black text-emerald-950 text-sm">₹{l.sellingPrice}</td>
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
