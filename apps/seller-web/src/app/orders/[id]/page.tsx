'use client';

import React, { useEffect, useState } from 'react';
import {
  Badge,
  Button,
  CardSkeleton,
  ErrorState,
  Toast,
} from '@farm-seva/shared-ui';
import { ArrowLeft, CheckCircle2, Package, Truck, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { apiFetch, getAuthToken } from '../../../lib/api-client';

export default function SellerOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadOrder = async () => {
    const token = getAuthToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    const res = await apiFetch<any>(`/api/v1/orders/seller/orders/${orderId}`);
    if (res.success && res.data) {
      setOrder(res.data);
    } else {
      setError(res.error || 'Seller order details could not be loaded.');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (orderId) loadOrder();
  }, [orderId]);

  const handleUpdateStatus = async (newStatus: string) => {
    setIsUpdating(true);
    setError(null);
    const res = await apiFetch(`/api/v1/orders/seller/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: newStatus }),
    });

    setIsUpdating(false);
    if (res.success) {
      setToastMessage(`Order status updated to ${newStatus}`);
      loadOrder();
    } else {
      setError(res.error || 'Failed to update order status.');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto py-8">
        <CardSkeleton />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-3xl mx-auto py-8">
        <ErrorState
          type="404"
          title="Order Not Found"
          message={error || 'Order record is unavailable.'}
          onRetry={() => router.push('/orders')}
        />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-4 space-y-6">
      <Link href="/orders" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Merchant Orders</span>
      </Link>

      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Merchant Order Desk</span>
            <h1 className="text-xl font-black text-slate-900">#{order.id.slice(0, 12)}</h1>
          </div>
          <Badge status={order.status === 'DELIVERED' ? 'success' : 'pending'}>{order.status}</Badge>
        </div>

        {/* Action Buttons for Status Transition */}
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-3">
          <h3 className="font-bold text-amber-950 text-xs uppercase tracking-wider">Merchant Order Actions</h3>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="primary"
              className="bg-emerald-700 hover:bg-emerald-800"
              isLoading={isUpdating}
              onClick={() => handleUpdateStatus('CONFIRMED')}
            >
              Confirm Order
            </Button>
            <Button
              size="sm"
              variant="secondary"
              isLoading={isUpdating}
              onClick={() => handleUpdateStatus('PROCESSING')}
            >
              Mark Processing
            </Button>
            <Button
              size="sm"
              variant="outline"
              isLoading={isUpdating}
              onClick={() => handleUpdateStatus('OUT_FOR_DELIVERY')}
            >
              Ready for Delivery
            </Button>
          </div>
        </div>

        {/* Items Breakdown */}
        <div className="space-y-3">
          <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Ordered Products</h3>
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl p-4 bg-white space-y-3">
            {(order.items || order.orderItems || []).map((item: any) => (
              <div key={item.id} className="flex justify-between items-center text-xs py-2 first:pt-0 last:pb-0">
                <div>
                  <p className="font-bold text-slate-900">{item.product?.name || item.name}</p>
                  <p className="text-slate-500">Qty: {item.quantity} × ₹{item.price}</p>
                </div>
                <p className="font-black text-slate-900">₹{item.price * item.quantity}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-sm">
          <span className="font-bold text-slate-600">Total Order Amount</span>
          <span className="text-xl font-black text-slate-900">₹{order.totalAmount || order.total}</span>
        </div>
      </div>

      {toastMessage && (
        <Toast type="success" title="Status Updated" message={toastMessage} onClose={() => setToastMessage(null)} />
      )}
    </div>
  );
}
