'use client';

import React, { useEffect, useState } from 'react';
import {
  SearchInput,
  Button,
  Badge,
  CardSkeleton,
  EmptyState,
  ErrorState,
  Table,
} from '@farm-seva/shared-ui';
import { Package, Plus, Edit, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiFetch, getAuthToken } from '../../lib/api-client';

export default function SellerProductsPage() {
  const router = useRouter();
  const [listings, setListings] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadListings() {
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
        setError(res.error || 'Failed to fetch merchant product listings.');
      }
      setIsLoading(false);
    }
    loadListings();
  }, []);

  if (!getAuthToken()) {
    return (
      <div className="max-w-md mx-auto py-12 text-center space-y-4">
        <EmptyState
          title="Sign In Required"
          description="Please sign in to manage your shop's product listings."
          actionLabel="Sign In Now"
          onAction={() => router.push('/login')}
        />
      </div>
    );
  }

  const filtered = listings.filter((l) => {
    const name = l.product?.name || l.name || '';
    return !searchQuery.trim() || name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const tableColumns = [
    {
      key: 'name',
      header: 'Product Name',
      render: (item: any) => (
        <div>
          <p className="font-bold text-slate-900">{item.product?.name || item.name}</p>
          <p className="text-[11px] text-slate-500">{item.product?.category?.name || 'Agri Input'}</p>
        </div>
      ),
    },
    {
      key: 'price',
      header: 'Price',
      render: (item: any) => <span className="font-black text-slate-900">₹{item.price || item.product?.price}</span>,
    },
    {
      key: 'stock',
      header: 'Stock',
      render: (item: any) => {
        const qty = item.stock ?? item.product?.stock ?? 0;
        return (
          <Badge status={qty > 5 ? 'active' : qty > 0 ? 'warning' : 'cancelled'}>
            {qty} units
          </Badge>
        );
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: any) => (
        <Link href={`/products/${item.id}`}>
          <Button variant="outline" size="sm" leftIcon={<Edit className="w-3.5 h-3.5" />}>
            Edit
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="max-w-5xl mx-auto py-4 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <Badge status="pending">Catalog Management</Badge>
          <h1 className="text-2xl font-black text-slate-900">Merchant Product Listings</h1>
          <p className="text-xs text-slate-500">
            Publish and manage seeds, bio-pesticides, and fertilizers available in your shop.
          </p>
        </div>

        <Link href="/products/new">
          <Button variant="primary" size="md" className="bg-amber-600 hover:bg-amber-700 text-white" leftIcon={<Plus className="w-4 h-4" />}>
            Add Product Listing
          </Button>
        </Link>
      </div>

      <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
        <SearchInput
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search products in catalog..."
        />
      </div>

      {isLoading ? (
        <CardSkeleton />
      ) : error ? (
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      ) : filtered.length > 0 ? (
        <Table
          columns={tableColumns}
          data={filtered}
          rowKey={(item) => item.id}
        />
      ) : (
        <EmptyState
          title="No Product Listings Found"
          description={
            searchQuery
              ? 'No products matched your search filter.'
              : 'You have not added any product listings to your shop catalog yet.'
          }
          actionLabel="Add First Product"
          onAction={() => router.push('/products/new')}
        />
      )}
    </div>
  );
}
