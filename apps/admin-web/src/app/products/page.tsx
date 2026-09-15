'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  Badge,
  Button,
  TextInput,
  CardSkeleton,
  EmptyState,
  ErrorState,
  Toast,
} from '@farm-seva/shared-ui';
import { Package, CheckCircle2, XCircle, RefreshCw, Eye, Tag, AlertTriangle } from 'lucide-react';
import { apiFetch, getAuthToken } from '../../lib/api-client';

interface PendingProduct {
  id: string;
  name: string;
  brand: string;
  manufacturer: string;
  description: string;
  activeIngredients?: string;
  cgbRegistrationNo?: string;
  toxicityClass?: string;
  approvalStatus: string;
  createdAt: string;
  category?: {
    name: string;
  };
}

export default function AdminProductsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<PendingProduct[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Review Modal State
  const [selectedProduct, setSelectedProduct] = useState<PendingProduct | null>(null);
  const [actionType, setActionType] = useState<'APPROVED' | 'REJECTED'>('APPROVED');
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  const [toast, setToast] = useState<{ title: string; message: string; type: 'success' | 'error' } | null>(null);

  const fetchPendingProducts = async () => {
    const token = getAuthToken();
    if (!token) {
      router.push('/login');
      return;
    }

    setLoading(true);
    setError(null);

    const res = await apiFetch<PendingProduct[]>('/api/v1/admin/marketplace/pending-products');

    if (res.success && Array.isArray(res.data)) {
      setProducts(res.data);
    } else {
      setError(res.error || 'Failed to fetch pending marketplace products');
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchPendingProducts();
  }, []);

  const handleReviewProduct = async () => {
    if (!selectedProduct) return;
    setProcessing(true);

    const res = await apiFetch(`/api/v1/admin/marketplace/products/${selectedProduct.id}/review`, {
      method: 'PATCH',
      body: JSON.stringify({
        status: actionType,
        rejectionReason: actionType === 'REJECTED' ? rejectionReason : undefined,
      }),
    });

    if (res.success) {
      setToast({
        title: actionType === 'APPROVED' ? 'Product Approved' : 'Product Rejected',
        message: `Product ${selectedProduct.name} status updated`,
        type: 'success',
      });
      setSelectedProduct(null);
      setRejectionReason('');
      fetchPendingProducts();
    } else {
      setToast({
        title: 'Review Failed',
        message: res.error || 'Failed to review product listing',
        type: 'error',
      });
    }

    setProcessing(false);
  };

  const filteredProducts = products.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.manufacturer.toLowerCase().includes(q) ||
      (p.cgbRegistrationNo && p.cgbRegistrationNo.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {toast && (
        <Toast
          title={toast.title}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Package className="w-6 h-6 text-sky-600" />
            Marketplace Product Moderation Desk
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Review new seller product listings, CGB registration numbers, and toxicity labeling.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchPendingProducts}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Refresh Desk
        </Button>
      </div>

      <Card className="p-4 border-slate-200">
        <TextInput
          label="Search Products"
          placeholder="Search product title, brand, manufacturer, or CGB registration..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </Card>

      {loading ? (
        <CardSkeleton />
      ) : error ? (
        <ErrorState title="Product Desk Unavailable" message={error} onRetry={fetchPendingProducts} />
      ) : filteredProducts.length === 0 ? (
        <EmptyState
          title="No Pending Product Listings"
          description="There are currently no new seller product listings pending moderation."
          icon={<Package className="w-8 h-8 text-slate-400" />}
        />
      ) : (
        <Card className="overflow-hidden border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Product Name</th>
                  <th className="px-4 py-3">Brand & Mfg</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">CGB Reg / Toxicity</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      <div>{p.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{p.id}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div>{p.brand}</div>
                      <div className="text-[10px] text-slate-400">{p.manufacturer}</div>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800">{p.category?.name || 'General'}</td>
                    <td className="px-4 py-3 font-mono">
                      <div>Reg: {p.cgbRegistrationNo || 'N/A'}</div>
                      <div className="text-[10px] text-slate-400">Class: {p.toxicityClass || 'N/A'}</div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge status="warning">{p.approvalStatus}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setSelectedProduct(p);
                          setActionType('APPROVED');
                        }}
                      >
                        Review Listing
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Product Review Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-sky-600" />
              Review Seller Product Listing
            </h3>
            <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl space-y-1">
              <div><span className="font-semibold text-slate-800">Title:</span> {selectedProduct.name}</div>
              <div><span className="font-semibold text-slate-800">Brand:</span> {selectedProduct.brand}</div>
              <div><span className="font-semibold text-slate-800">Manufacturer:</span> {selectedProduct.manufacturer}</div>
              <div><span className="font-semibold text-slate-800">Active Ingredients:</span> {selectedProduct.activeIngredients || 'None'}</div>
              <div><span className="font-semibold text-slate-800">CGB Reg No:</span> {selectedProduct.cgbRegistrationNo || 'N/A'}</div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Moderation Decision</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setActionType('APPROVED')}
                  className={`p-2.5 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 ${
                    actionType === 'APPROVED'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-700 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 bg-white text-slate-600'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Approve Product
                </button>
                <button
                  type="button"
                  onClick={() => setActionType('REJECTED')}
                  className={`p-2.5 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 ${
                    actionType === 'REJECTED'
                      ? 'bg-rose-50 border-rose-500 text-rose-700 ring-2 ring-rose-500/20'
                      : 'border-slate-200 bg-white text-slate-600'
                  }`}
                >
                  <XCircle className="w-4 h-4 text-rose-600" />
                  Reject Listing
                </button>
              </div>
            </div>

            {actionType === 'REJECTED' && (
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Rejection Reason</label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Specify safety or compliance issue..."
                  rows={3}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setSelectedProduct(null)}>
                Cancel
              </Button>
              <Button
                size="sm"
                className={actionType === 'APPROVED' ? 'bg-emerald-600 hover:bg-emerald-700 text-white font-bold' : 'bg-rose-600 hover:bg-rose-700 text-white font-bold'}
                onClick={handleReviewProduct}
                disabled={processing}
              >
                {processing ? 'Processing...' : actionType === 'APPROVED' ? 'Approve Listing' : 'Reject Listing'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
