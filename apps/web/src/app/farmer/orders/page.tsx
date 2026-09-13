'use client';

import { API_BASE_URL } from '@/config/api';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, ArrowRight, ShoppingBag } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';

export default function FarmerOrdersPage() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) fetchOrders();
    else setLoading(false);
  }, [token]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/orders/farmer/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setOrders(data.data);
      else setError(data.error?.message || 'Failed to load orders');
    } catch (err) {
      setError('Error connecting to order service');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'DELIVERED':
        return <Badge variant="success" size="sm">Delivered</Badge>;
      case 'OUT_FOR_DELIVERY':
      case 'DISPATCHED':
        return <Badge variant="warning" size="sm">In Transit</Badge>;
      case 'CANCELLED':
        return <Badge variant="danger" size="sm">Cancelled</Badge>;
      default:
        return <Badge variant="info" size="sm">{status?.replace(/_/g, ' ')}</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2">
      <div>
        <Badge variant="harvest" size="md">FARMER ORDERS TRACKER</Badge>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1 flex items-center gap-2">
          <Package className="w-6 h-6 text-emerald-600" /> Your Orders History
        </h1>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl text-xs font-bold">
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} variant="card" className="h-28" />)}
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag className="w-8 h-8" />}
          title="No Orders Found"
          description="You have not placed any input orders yet. Browse our marketplace to discover seeds and fertilisers."
          actionLabel="Explore Marketplace →"
          onAction={() => window.location.href = '/farmer/marketplace'}
        />
      ) : (
        <div className="space-y-4">
          {orders.map((ord) => (
            <Card key={ord.id} hoverable padding="md" className="flex flex-col md:flex-row justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-500 font-mono">
                    Order #{ord.id.slice(0, 8)}
                  </span>
                  {getStatusBadge(ord.status)}
                </div>

                <p className="text-xs font-semibold text-slate-700">
                  🏬 Retailer Shop: <strong className="text-slate-900">{ord.sellerShop?.shopName}</strong>
                </p>

                <p className="text-[11px] text-slate-400 font-medium">
                  📅 Placed on {new Date(ord.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>

                <div className="flex items-center gap-4 text-xs font-medium text-slate-600 pt-1">
                  <span>Items: <strong className="text-slate-900">{ord.items?.length || 0}</strong></span>
                  <span>Total: <strong className="text-emerald-700 font-black text-sm">₹{ord.totalAmount}</strong></span>
                  <span>Mode: <strong className="text-slate-900">{ord.paymentMethod}</strong></span>
                </div>
              </div>

              <div className="flex items-end">
                <Link href={`/farmer/orders/${ord.id}`}>
                  <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    View Details & Timeline
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
