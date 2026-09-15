'use client';

import React, { useEffect, useState } from 'react';
import {
  Badge,
  Button,
  CardSkeleton,
  ErrorState,
} from '@farm-seva/shared-ui';
import { ArrowLeft, CheckCircle2, Clock, Truck, ShieldCheck, MapPin } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { apiFetch, getAuthToken } from '../../../lib/api-client';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadOrder() {
      const token = getAuthToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      const res = await apiFetch<any>(`/api/v1/orders/farmer/orders/${orderId}`);
      if (res.success && res.data) {
        setOrder(res.data);
      } else {
        setError(res.error || 'Order details could not be retrieved.');
      }
      setIsLoading(false);
    }
    if (orderId) loadOrder();
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto py-8 space-y-4">
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
          message={error || 'The requested order details could not be loaded.'}
          onRetry={() => router.push('/orders')}
        />
      </div>
    );
  }

  const steps = [
    { label: 'Order Placed', done: true },
    { label: 'Dealer Confirmed', done: ['CONFIRMED', 'PROCESSING', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.status) },
    { label: 'Out for Delivery', done: ['OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.status) },
    { label: 'Delivered', done: order.status === 'DELIVERED' },
  ];

  return (
    <div className="max-w-3xl mx-auto py-4 space-y-6">
      <Link href="/orders" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Orders</span>
      </Link>

      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Order Reference</span>
            <h1 className="text-xl font-black text-slate-900">#{order.id.slice(0, 12)}</h1>
          </div>
          <Badge status={order.status === 'DELIVERED' ? 'success' : 'pending'}>{order.status}</Badge>
        </div>

        {/* Visual Progress Timeline */}
        <div className="space-y-3">
          <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Fulfillment Timeline</h3>
          <div className="grid grid-cols-4 gap-2 pt-2">
            {steps.map((step, idx) => (
              <div key={idx} className="text-center space-y-1.5">
                <div
                  className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center font-bold text-xs ${
                    step.done ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-400 border border-slate-200'
                  }`}
                >
                  {step.done ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                </div>
                <p className={`text-[10px] font-bold ${step.done ? 'text-emerald-900' : 'text-slate-400'}`}>
                  {step.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Address & Verification */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1 text-xs text-slate-700">
          <div className="flex items-center gap-1.5 font-bold text-slate-900">
            <MapPin className="w-4 h-4 text-emerald-700" />
            <span>Delivery Destination</span>
          </div>
          <p>{order.address || order.shippingAddress || 'Registered Farmer Field / Address'}</p>
        </div>

        {/* Itemized Receipt */}
        <div className="space-y-3">
          <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Order Items</h3>
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl p-4 bg-white space-y-3">
            {(order.items || order.orderItems || []).map((item: any) => (
              <div key={item.id} className="flex justify-between items-center text-xs py-2 first:pt-0 last:pb-0">
                <div>
                  <p className="font-bold text-slate-900">{item.product?.name || item.name || 'Input Item'}</p>
                  <p className="text-slate-500">Qty: {item.quantity} × ₹{item.price}</p>
                </div>
                <p className="font-black text-slate-900">₹{item.price * item.quantity}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-sm">
          <span className="font-bold text-slate-600">Total Order Value</span>
          <span className="text-xl font-black text-slate-900">₹{order.totalAmount || order.total}</span>
        </div>
      </div>
    </div>
  );
}
