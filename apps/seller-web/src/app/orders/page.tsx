'use client';

import React, { useEffect, useState } from 'react';
import {
  Badge,
  Button,
  CardSkeleton,
  EmptyState,
  ErrorState,
} from '@farm-seva/shared-ui';
import { ShoppingCart, ArrowRight, Package } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiFetch, getAuthToken } from '../../lib/api-client';

export default function SellerOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSellerOrders() {
      const token = getAuthToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      const res = await apiFetch<any[]>('/api/v1/orders/seller/orders');
      if (res.success && Array.isArray(res.data)) {
        setOrders(res.data);
      } else if (!res.success) {
        setError(res.error || 'Failed to fetch seller order desk records.');
      }
      setIsLoading(false);
    }
    loadSellerOrders();
  }, []);

  if (!getAuthToken()) {
    return (
      <div className="max-w-md mx-auto py-12 text-center space-y-4">
        <EmptyState
          title="Sign In Required"
          description="Please sign in to access merchant order fulfillment."
          actionLabel="Sign In Now"
          onAction={() => router.push('/login')}
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-4 space-y-6">
      <div className="space-y-1">
        <Badge status="pending">Order Desk</Badge>
        <h1 className="text-2xl font-black text-slate-900">District Farmer Orders</h1>
        <p className="text-xs text-slate-500">
          Process incoming farmer purchases, confirm shop availability, and mark ready for delivery dispatch.
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
              className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm hover:border-amber-500 transition space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-amber-600" />
                  <span className="font-black text-slate-900 text-sm">Order #{ord.id.slice(0, 8)}</span>
                </div>
                <Badge status={ord.status === 'DELIVERED' ? 'success' : 'pending'}>{ord.status}</Badge>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
                <div>
                  <p>Order Date: {ord.createdAt ? new Date(ord.createdAt).toLocaleDateString() : 'Recorded'}</p>
                  <p className="font-bold text-slate-900 mt-0.5">Order Amount: ₹{ord.totalAmount || ord.total}</p>
                </div>

                <Link href={`/orders/${ord.id}`}>
                  <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Process & Update Status
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No Orders Received Yet"
          description="Farmer orders for your shop will appear here as soon as customers checkout."
        />
      )}
    </div>
  );
}
