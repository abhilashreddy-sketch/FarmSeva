'use client';

import React, { useEffect, useState } from 'react';
import {
  Badge,
  Button,
  CardSkeleton,
  EmptyState,
  ErrorState,
  Table,
} from '@farm-seva/shared-ui';
import { Package, AlertTriangle, CheckCircle2, Edit } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiFetch, getAuthToken } from '../../lib/api-client';

export default function InventoryPage() {
  const router = useRouter();
  const [listings, setListings] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadInventory() {
      const token = getAuthToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      const res = await apiFetch<any[]>('/api/v1/seller/marketplace/listings');
      if (res.success && Array.isArray(res.data)) {
        setListings(res.data);
      } else if (!res.success) {
        setError(res.error || 'Failed to fetch inventory stock records.');
      }
      setIsLoading(false);
    }
    loadInventory();
  }, []);

  if (!getAuthToken()) {
    return (
      <div className="max-w-md mx-auto py-12 text-center space-y-4">
        <EmptyState
          title="Sign In Required"
          description="Please sign in to access shop inventory management."
          actionLabel="Sign In Now"
          onAction={() => router.push('/login')}
        />
      </div>
    );
  }

  const filteredListings = listings.filter((l) => {
    const qty = l.stock ?? l.product?.stock ?? 0;
    if (filter === 'low') return qty > 0 && qty <= 5;
    if (filter === 'out') return qty === 0;
    return true;
  });

  const columns = [
    {
      key: 'product',
      header: 'Product Name',
      render: (item: any) => (
        <div>
          <p className="font-bold text-slate-900">{item.product?.name || item.name}</p>
          <p className="text-[11px] text-slate-500">{item.product?.category?.name || 'Input'}</p>
        </div>
      ),
    },
    {
      key: 'price',
      header: 'Retail Price',
      render: (item: any) => <span className="font-bold text-slate-900">₹{item.price || item.product?.price}</span>,
    },
    {
      key: 'stock',
      header: 'Current Stock',
      render: (item: any) => {
        const qty = item.stock ?? item.product?.stock ?? 0;
        return (
          <Badge status={qty > 5 ? 'active' : qty > 0 ? 'warning' : 'cancelled'}>
            {qty > 0 ? `${qty} units in stock` : 'OUT OF STOCK'}
          </Badge>
        );
      },
    },
    {
      key: 'actions',
      header: 'Stock Control',
      render: (item: any) => (
        <Link href={`/products/${item.id}`}>
          <Button variant="outline" size="sm" leftIcon={<Edit className="w-3.5 h-3.5" />}>
            Update Stock
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="max-w-5xl mx-auto py-4 space-y-6">
      <div className="space-y-1">
        <Badge status="pending">Inventory Manager</Badge>
        <h1 className="text-2xl font-black text-slate-900">Shop Inventory & Stock Alerts</h1>
        <p className="text-xs text-slate-500">
          Monitor stock levels, update unit quantities, and prevent out-of-stock orders.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl transition ${
            filter === 'all' ? 'bg-amber-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All Items ({listings.length})
        </button>
        <button
          onClick={() => setFilter('low')}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl transition ${
            filter === 'low' ? 'bg-amber-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Low Stock ({listings.filter((l) => (l.stock ?? l.product?.stock ?? 0) <= 5 && (l.stock ?? l.product?.stock ?? 0) > 0).length})
        </button>
        <button
          onClick={() => setFilter('out')}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl transition ${
            filter === 'out' ? 'bg-amber-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Out of Stock ({listings.filter((l) => (l.stock ?? l.product?.stock ?? 0) === 0).length})
        </button>
      </div>

      {isLoading ? (
        <CardSkeleton />
      ) : error ? (
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      ) : filteredListings.length > 0 ? (
        <Table columns={columns} data={filteredListings} rowKey={(item) => item.id} />
      ) : (
        <EmptyState
          title="No Inventory Records Match Filter"
          description="Your shop inventory contains no items matching the selected stock filter."
        />
      )}
    </div>
  );
}
