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
} from '@farm-seva/shared-ui';
import { ShoppingBag, Search, RefreshCw, Eye, Package } from 'lucide-react';
import Link from 'next/link';
import { apiFetch, getAuthToken } from '../../lib/api-client';

interface PlatformOrder {
  id: string;
  orderNumber: string;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  createdAt: string;
  farmerUser?: {
    fullName: string;
    phone: string;
  };
  sellerProfile?: {
    businessName?: string;
  };
  items?: Array<{
    id: string;
    productTitle: string;
    quantity: number;
    unitPrice: number;
  }>;
}

export default function AdminOrdersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orders, setOrders] = useState<PlatformOrder[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchOrders = async () => {
    const token = getAuthToken();
    if (!token) {
      router.push('/login');
      return;
    }

    setLoading(true);
    setError(null);

    let url = '/api/v1/orders/admin/orders';
    if (statusFilter) url += `?status=${statusFilter}`;

    const res = await apiFetch<PlatformOrder[]>(url);

    if (res.success && Array.isArray(res.data)) {
      setOrders(res.data);
    } else {
      setError(res.error || 'Failed to fetch platform orders');
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const filteredOrders = orders.filter((o) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const orderNo = o.orderNumber || o.id;
    const farmerName = o.farmerUser?.fullName || '';
    const sellerName = o.sellerProfile?.businessName || '';
    return (
      orderNo.toLowerCase().includes(q) ||
      farmerName.toLowerCase().includes(q) ||
      sellerName.toLowerCase().includes(q)
    );
  });

  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return <Badge status="success">Delivered</Badge>;
      case 'CANCELLED':
        return <Badge status="cancelled">Cancelled</Badge>;
      case 'DISPATCHED':
      case 'OUT_FOR_DELIVERY':
      case 'IN_TRANSIT':
        return <Badge status="processing">{status}</Badge>;
      case 'PENDING_ACCEPTANCE':
      case 'ACCEPTED':
      case 'PACKING':
        return <Badge status="warning">{status}</Badge>;
      default:
        return <Badge status="active">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-slate-800" />
            Master Platform Orders Directory
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Monitor farmer purchases, seller dispatch progress, and admin fulfillment status.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchOrders}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Refresh Orders
        </Button>
      </div>

      <Card className="p-4 border-slate-200">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="sm:col-span-2">
            <TextInput
              label="Search Orders"
              placeholder="Search order number, farmer name, or seller business..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Filter by Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="">All Statuses</option>
              <option value="PENDING_ACCEPTANCE">Pending Acceptance</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="PACKING">Packing</option>
              <option value="DISPATCHED">Dispatched</option>
              <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>
      </Card>

      {loading ? (
        <CardSkeleton />
      ) : error ? (
        <ErrorState title="Orders Directory Unavailable" message={error} onRetry={fetchOrders} />
      ) : filteredOrders.length === 0 ? (
        <EmptyState
          title="No Platform Orders Found"
          description="No orders matched your search and filter criteria."
          icon={<ShoppingBag className="w-8 h-8 text-slate-400" />}
        />
      ) : (
        <Card className="overflow-hidden border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Order No</th>
                  <th className="px-4 py-3">Farmer / Buyer</th>
                  <th className="px-4 py-3">Seller</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">
                      <div>#{order.orderNumber || order.id.slice(0, 8)}</div>
                      <div className="text-[10px] text-slate-400 font-normal">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">{order.farmerUser?.fullName || 'Farmer'}</div>
                      <div className="text-[10px] text-slate-400">{order.farmerUser?.phone}</div>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {order.sellerProfile?.businessName || 'Agri Dealer'}
                    </td>
                    <td className="px-4 py-3 font-extrabold text-slate-900">
                      ₹{order.totalAmount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">{getOrderStatusBadge(order.status)}</td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/orders/${order.id}`}>
                        <Button variant="outline" size="sm" leftIcon={<Eye className="w-3 h-3" />}>
                          Inspect Order
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
