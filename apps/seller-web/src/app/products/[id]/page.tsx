'use client';

import React, { useEffect, useState } from 'react';
import {
  Badge,
  Button,
  CardSkeleton,
  ErrorState,
  TextInput,
  Toast,
} from '@farm-seva/shared-ui';
import { ArrowLeft, Save, Package } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { apiFetch, getAuthToken } from '../../../lib/api-client';

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [listing, setListing] = useState<any>(null);
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadListing() {
      setIsLoading(true);
      setError(null);
      const res = await apiFetch<any[]>('/api/v1/seller/marketplace/listings');
      if (res.success && Array.isArray(res.data)) {
        const match = res.data.find((l) => l.id === productId || l.productId === productId);
        if (match) {
          setListing(match);
          setPrice(String(match.sellingPrice || match.price || match.product?.price || ''));
          setStock(String(match.quantityAvailable ?? match.stock ?? match.product?.stock ?? ''));
        } else {
          setError('Listing details not found in seller catalog.');
        }
      } else {
        setError(res.error || 'Failed to fetch listing details.');
      }
      setIsLoading(false);
    }
    if (productId) loadListing();
  }, [productId]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!price || !stock) return;

    setIsSaving(true);
    setError(null);

    const res = await apiFetch(`/api/v1/seller/marketplace/listings/${listing.id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        sellingPrice: parseFloat(price),
        quantityAvailable: parseInt(stock, 10),
      }),
    });

    setIsSaving(false);
    if (res.success) {
      setToastMessage('Listing price and inventory stock updated!');
    } else {
      setError(res.error || 'Failed to update listing.');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <CardSkeleton />
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <ErrorState
          type="404"
          title="Listing Not Found"
          message={error || 'Listing unavailable.'}
          onRetry={() => router.push('/products')}
        />
      </div>
    );
  }

  const productName = listing.product?.name || listing.name;

  return (
    <div className="max-w-2xl mx-auto py-4 space-y-6">
      <Link href="/products" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Product Catalog</span>
      </Link>

      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Badge status="pending">Listing Editor</Badge>
            <h1 className="text-xl font-black text-slate-900">{productName}</h1>
            <p className="text-xs text-slate-500">Category: {listing.product?.category?.name || 'Input Item'}</p>
          </div>
        </div>

        {error && <ErrorState type="inline" message={error} />}

        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <TextInput
              label="Selling Price (₹)"
              type="number"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />

            <TextInput
              label="Inventory Quantity"
              type="number"
              required
              value={stock}
              onChange={(e) => setStock(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="submit"
              variant="primary"
              isLoading={isSaving}
              className="bg-amber-600 hover:bg-amber-700 text-white"
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Stock & Price Updates
            </Button>
          </div>
        </form>
      </div>

      {toastMessage && (
        <Toast
          type="success"
          title="Updated"
          message={toastMessage}
          onClose={() => setToastMessage(null)}
        />
      )}
    </div>
  );
}
