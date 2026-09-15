'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Card,
  Badge,
  Button,
  CardSkeleton,
  ErrorState,
  Toast,
} from '@farm-seva/shared-ui';
import {
  ShoppingBag,
  ArrowLeft,
  Package,
  User,
  Store,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';
import { apiFetch, getAuthToken } from '../../../lib/api-client';

interface OrderDetail {
  id: string;
  orderNumber: string;
  totalAmount: number;
  deliveryFee: number;
  taxAmount: number;
  discountAmount: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  createdAt: string;
  farmerUser?: {
    id: string;
    fullName: string;
    phone: string;
  };
  sellerProfile?: {
    id: string;
    businessName?: string;
  };
  deliveryAddress?: any;
  items?: Array<{
    id: string;
    productTitle: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
}

export default function AdminOrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<OrderDetail | null>(null);

  // Status Override State
  const [newStatus, setNewStatus] = useState<string>('ACCEPTED');
  const [updating, setUpdating] = useState(false);

  const [toast, setToast] = useState<{ title: string; message: string; type: 'success' | 'error' } | null>(null);

  const fetchOrderDetail = async () => {
    const token = getAuthToken();
    if (!token) {
      router.push('/login');
      return;
    }

    setLoading(true);
    setError(null);

    const res = await apiFetch<OrderDetail[]>(`/api/v1/orders/admin/orders`);

    if (res.success && Array.isArray(res.data)) {
      const found = res.data.find((o) => o.id === orderId);
      if (found) {
        setOrder(found);
        setNewStatus(found.status);
      } else {
        setError('Platform order record not found');
      }
    } else {
      setError(res.error || 'Failed to fetch order details');
    }

    setLoading(false);
  };

  useEffect(() => {
    if (orderId) fetchOrderDetail();
  }, [orderId]);

  const handleUpdateStatus = async () => {
    if (!order) return;
    setUpdating(true);

    const res = await apiFetch(`/api/v1/orders/admin/orders/${order.id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: newStatus }),
    });

    if (res.success) {
      setToast({
        title: 'Status Updated',
        message: `Order status overridden to ${newStatus}`,
        type: 'success',
      });
      fetchOrderDetail();
    } else {
      setToast({
        title: 'Update Failed',
        message: res.error || 'Failed to update order status',
        type: 'error',
      });
    }

    setUpdating(false);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {toast && (
        <Toast
          title={toast.title}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div>
        <Link href="/orders" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 mb-2 font-semibold">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Orders Directory
        </Link>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
          <ShoppingBag className="w-6 h-6 text-slate-800" />
          Order Inspection & Status Override
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          Detailed breakdown of items, pricing, delivery address, and admin fulfillment controls.
        </p>
      </div>

      {loading ? (
        <CardSkeleton />
      ) : error ? (
        <ErrorState title="Order Record Unavailable" message={error} onRetry={fetchOrderDetail} />
      ) : !order ? (
        <ErrorState title="Order Not Found" message="The requested order record does not exist." />
      ) : (
        <div className="space-y-6">
          {/* Header Card */}
          <Card className="p-6 border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge status="processing" className="font-mono">#{order.orderNumber || order.id.slice(0, 8)}</Badge>
                  <Badge status={order.status === 'DELIVERED' ? 'success' : 'warning'}>{order.status}</Badge>
                </div>
                <h2 className="text-lg font-bold text-slate-900">
                  Total Order Amount: ₹{order.totalAmount.toLocaleString()}
                </h2>
                <div className="text-xs text-slate-400">
                  Payment: <span className="font-mono uppercase">{order.paymentMethod}</span> ({order.paymentStatus})
                </div>
              </div>

              {/* Admin Status Override Box */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2 max-w-xs w-full">
                <label className="block text-xs font-bold text-slate-800">Admin Status Override</label>
                <div className="flex items-center gap-2">
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="PENDING_ACCEPTANCE">PENDING_ACCEPTANCE</option>
                    <option value="ACCEPTED">ACCEPTED</option>
                    <option value="PACKING">PACKING</option>
                    <option value="DISPATCHED">DISPATCHED</option>
                    <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
                    <option value="DELIVERED">DELIVERED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                    onClick={handleUpdateStatus}
                    disabled={updating}
                  >
                    {updating ? 'Saving...' : 'Update'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Buyer & Seller Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-emerald-600" /> Farmer / Buyer Details
                </div>
                <div>Name: <span className="font-semibold">{order.farmerUser?.fullName || 'Farmer'}</span></div>
                <div>Phone: <span className="font-semibold">{order.farmerUser?.phone || 'N/A'}</span></div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Store className="w-4 h-4 text-amber-600" /> Agri Seller / Merchant
                </div>
                <div>Business: <span className="font-semibold">{order.sellerProfile?.businessName || 'Agri Dealer'}</span></div>
              </div>
            </div>

            {/* Order Items Table */}
            <div className="space-y-2 pt-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Ordered Products</h3>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-2">Item Title</th>
                      <th className="px-4 py-2">Unit Price</th>
                      <th className="px-4 py-2">Qty</th>
                      <th className="px-4 py-2 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {order.items && order.items.length > 0 ? (
                      order.items.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-2 font-medium text-slate-900">{item.productTitle}</td>
                          <td className="px-4 py-2">₹{item.unitPrice}</td>
                          <td className="px-4 py-2 font-semibold">{item.quantity}</td>
                          <td className="px-4 py-2 text-right font-bold text-slate-900">
                            ₹{item.totalPrice || item.unitPrice * item.quantity}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-4 py-3 text-center text-slate-400">
                          Order item details unavailable.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
