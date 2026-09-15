'use client';

import React, { useEffect, useState } from 'react';
import {
  Badge,
  Button,
  CardSkeleton,
  EmptyState,
  ErrorState,
} from '@farm-seva/shared-ui';
import { ShoppingBag, ArrowRight, Package } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiFetch, getAuthToken } from '../../lib/api-client';

export default function FarmerOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadOrders() {
      const token = getAuthToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      const res = await apiFetch<any[]>('/api/v1/orders/farmer/orders');
      if (res.success && Array.isArray(res.data)) {
        setOrders(res.data);
      } else if (!res.success) {
        setError(res.error || 'Failed to load order history.');
      }
      setIsLoading(false);
    }
    loadOrders();
  }, []);

  if (!getAuthToken()) {
    return (
      <div className="max-w-md mx-auto py-12 text-center space-y-4">
        <EmptyState
          title="Sign In Required"
          description="Please sign in with your Farmer account to view order history and delivery tracking."
          actionLabel="Sign In Now"
          onAction={() => router.push('/login')}
        />
      </div>
    );
  }

  const getStatusVariant = (status: string) => {
    const s = (status || '').toUpperCase();
    if (s === 'DELIVERED') return 'success';
    if (s === 'OUT_FOR_DELIVERY') return 'processing';
    if (s === 'PROCESSING' || s === 'CONFIRMED') return 'pending';
    if (s === 'CANCELLED' || s === 'REJECTED') return 'cancelled';
    return 'warning';
  };

  return (
    <div className="max-w-3xl mx-auto py-4 space-y-6">
      <div className="space-y-1">
        <Badge status="active">Order History</Badge>
        <h1 className="text-2xl font-black text-slate-900">Your District Orders</h1>
        <p className="text-xs text-slate-500">
          Track fulfillment status, dealer dispatch, and driver OTP verification.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <CardSkeleton /><CardSkeleton />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      ) : orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((ord) => (
            <div
              key={ord.id}
              className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm hover:border-emerald-500 transition space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-emerald-700" />
                  <span className="font-black text-slate-900 text-sm">Order #{ord.id.slice(0, 8)}</span>
                </div>
                <Badge status={getStatusVariant(ord.status)}>{ord.status}</Badge>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
                <div>
                  <p>Order Date: {ord.createdAt ? new Date(ord.createdAt).toLocaleDateString() : 'N/A'}</p>
                  <p className="font-bold text-slate-900 mt-0.5">Total Amount: ₹{ord.totalAmount || ord.total}</p>
                </div>

                <Link href={`/orders/${ord.id}`}>
                  <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Track & Details
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No Orders Found"
          description="You have not placed any agricultural marketplace orders yet."
          actionLabel="Browse Marketplace"
          onAction={() => router.push('/products')}
        />
      )}
    </div>
  );
}
