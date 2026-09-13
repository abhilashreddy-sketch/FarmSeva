'use client';

import { API_BASE_URL } from '@/config/api';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

function CompareContent() {
  const searchParams = useSearchParams();
  const ids = searchParams.get('ids');

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ids) {
      fetchComparison(ids);
    } else {
      setLoading(false);
    }
  }, [ids]);

  const fetchComparison = async (productIds: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/marketplace/products/compare?productIds=${productIds}`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
      } else {
        setError(data.error?.message || 'Failed to compare products');
      }
    } catch (err: any) {
      setError('Error fetching comparison data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        <div className="mb-4">
          <Link href="/farmer/marketplace" className="text-xs font-bold text-emerald-800 hover:underline">
            ← Back to Marketplace
          </Link>
        </div>

        <h1 className="text-2xl font-extrabold text-gray-900 mb-6 flex items-center gap-2">
          <span>⚖️</span> Side-by-Side Product Comparison
        </h1>

        {loading ? (
          <div className="py-12 text-center text-gray-500">
            <span className="text-3xl animate-spin inline-block">⏳</span>
            <p className="mt-2 text-sm font-semibold">Comparing product specifications...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 shadow-sm">
            <span className="text-4xl">⚠️</span>
            <h3 className="text-lg font-bold text-gray-800 mt-2">No Products Selected</h3>
            <p className="text-xs text-gray-500 mt-1">Select products from the marketplace catalog to compare.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase w-48">Specification</th>
                  {products.map((p: any) => (
                    <th key={p.id} className="p-4 text-center">
                      <div className="text-xs font-bold text-emerald-700">{p.brand}</div>
                      <div className="text-sm font-black text-gray-900">{p.name}</div>
                      <div className="text-base font-black text-emerald-950 mt-1">₹{p.sellingPrice}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                <tr>
                  <td className="p-4 font-bold text-gray-700 bg-gray-50">Active Ingredients</td>
                  {products.map((p: any) => (
                    <td key={p.id} className="p-4 text-center font-semibold text-gray-900">
                      {p.activeIngredients || 'N/A'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 font-bold text-gray-700 bg-gray-50">Toxicity Label Class</td>
                  {products.map((p: any) => (
                    <td key={p.id} className="p-4 text-center font-bold">
                      {p.compliance?.toxicityClass || 'Green'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 font-bold text-gray-700 bg-gray-50">Pre-Harvest Interval (PHI)</td>
                  {products.map((p: any) => (
                    <td key={p.id} className="p-4 text-center font-bold text-amber-900">
                      {p.compliance?.waitingPeriodDays ? `${p.compliance.waitingPeriodDays} Days` : 'N/A'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 font-bold text-gray-700 bg-gray-50">Dosage Recommendation</td>
                  {products.map((p: any) => (
                    <td key={p.id} className="p-4 text-center text-gray-700">
                      {p.dosageInstructions || 'As per label'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 font-bold text-gray-700 bg-gray-50">CIB Registration No.</td>
                  {products.map((p: any) => (
                    <td key={p.id} className="p-4 text-center font-mono text-gray-600 text-[11px]">
                      {p.compliance?.cgbRegistrationNo || 'Verified'}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

export default function CompareProductsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center font-bold text-gray-600">Loading Product Comparison...</div>}>
      <CompareContent />
    </Suspense>
  );
}
