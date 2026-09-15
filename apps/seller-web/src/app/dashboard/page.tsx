'use client';

import React, { useEffect, useState } from 'react';
import {
  MetricCard,
  InformationCard,
  Button,
  Badge,
  CardSkeleton,
  EmptyState,
} from '@farm-seva/shared-ui';
import { Store, Package, ShoppingCart, Plus, ArrowRight, DollarSign, ShieldCheck, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { apiFetch, getAuthToken, removeAuthToken } from '../../lib/api-client';

export default function SellerDashboardPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [kycStatus, setKycStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      const token = getAuthToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const [analyticsRes, listRes, ordRes, kycRes] = await Promise.all([
        apiFetch<any>('/api/v1/seller/analytics/dashboard'),
        apiFetch<any[]>('/api/v1/seller/marketplace/listings'),
        apiFetch<any[]>('/api/v1/orders/seller/orders'),
        apiFetch<any>('/api/v1/kyc/me'),
      ]);

      if (analyticsRes.success) setAnalytics(analyticsRes.data);
      if (listRes.success && Array.isArray(listRes.data)) setListings(listRes.data);
      if (ordRes.success && Array.isArray(ordRes.data)) setOrders(ordRes.data);
      if (kycRes.success) setKycStatus(kycRes.data);

      setIsLoading(false);
    }
    loadDashboardData();
  }, []);

  const handleLogout = () => {
    removeAuthToken();
    window.location.href = '/login';
  };

  if (!getAuthToken()) {
    return (
      <div className="max-w-md mx-auto py-12 text-center space-y-4">
        <EmptyState
          title="Sign In Required"
          description="Please sign in with your Seller account to access the Merchant Console."
          actionLabel="Sign In Now"
          onAction={() => window.location.href = '/login'}
        />
      </div>
    );
  }

  const pendingOrders = orders.filter((o) => ['PENDING', 'CONFIRMED', 'PROCESSING'].includes(o.status));
  const lowStockItems = listings.filter((l) => (l.stock ?? l.product?.stock ?? 0) <= 5);

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-4">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-700 to-amber-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-amber-600">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge status="pending">Agri Dealer Console</Badge>
            {kycStatus?.status && (
              <Badge status={kycStatus.status === 'APPROVED' ? 'verified' : 'warning'}>
                KYC: {kycStatus.status}
              </Badge>
            )}
          </div>
          <h1 className="text-2xl font-black">
            Merchant Desk • {analytics?.shopName || analytics?.user?.name || 'Agri Shop'}
          </h1>
          <p className="text-amber-100 text-xs font-medium">
            Managed listings & district order fulfillment console
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={handleLogout} className="bg-white/10 text-white border-white/20">
          Sign Out
        </Button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <MetricCard
          title="Active Listings"
          value={isLoading ? '...' : listings.length}
          subtitle="Catalog products in shop"
          icon={<Package className="w-5 h-5 text-amber-600" />}
        />
        <MetricCard
          title="Actionable Orders"
          value={isLoading ? '...' : pendingOrders.length}
          subtitle="Awaiting dispatch"
          icon={<ShoppingCart className="w-5 h-5 text-amber-600" />}
        />
        <MetricCard
          title="Stock Alerts"
          value={isLoading ? '...' : lowStockItems.length}
          subtitle="Low or out-of-stock items"
          icon={<AlertTriangle className="w-5 h-5 text-amber-600" />}
        />
        <MetricCard
          title="Settlements"
          value={isLoading ? '...' : `₹${analytics?.totalRevenue || 0}`}
          subtitle="Total platform payouts"
          icon={<DollarSign className="w-5 h-5 text-amber-600" />}
        />
      </div>

      {/* Quick Merchant Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link href="/products/new">
          <Button variant="primary" size="md" className="w-full bg-amber-600 hover:bg-amber-700 text-white" leftIcon={<Plus className="w-4 h-4" />}>
            Add Product
          </Button>
        </Link>
        <Link href="/inventory">
          <Button variant="secondary" size="md" className="w-full" leftIcon={<Package className="w-4 h-4" />}>
            Manage Stock
          </Button>
        </Link>
        <Link href="/orders">
          <Button variant="outline" size="md" className="w-full" leftIcon={<ShoppingCart className="w-4 h-4" />}>
            Fulfill Orders
          </Button>
        </Link>
        <Link href="/settlements">
          <Button variant="outline" size="md" className="w-full" leftIcon={<DollarSign className="w-4 h-4" />}>
            Settlements
          </Button>
        </Link>
      </div>

      {/* Actionable Orders Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-slate-900">Orders Requiring Action</h2>
          <Link href="/orders" className="text-xs font-bold text-amber-700 hover:underline">
            All Merchant Orders →
          </Link>
        </div>

        {isLoading ? (
          <CardSkeleton />
        ) : pendingOrders.length > 0 ? (
          <div className="space-y-3">
            {pendingOrders.map((ord: any) => (
              <div key={ord.id} className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">Order #{ord.id.slice(0, 8)}</span>
                    <Badge status="pending">{ord.status}</Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Amount: ₹{ord.totalAmount || ord.total} • Farmer Order</p>
                </div>
                <Link href={`/orders/${ord.id}`}>
                  <Button variant="outline" size="sm">Process Order</Button>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No Pending Orders"
            description="You have fulfilled all current farmer orders for your district."
            actionLabel="View All Orders"
            onAction={() => window.location.href = '/orders'}
          />
        )}
      </div>

      {/* Product Catalog Overview */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-slate-900">Active Shop Catalog</h2>
          <Link href="/products" className="text-xs font-bold text-amber-700 hover:underline">
            Manage Product Catalog →
          </Link>
        </div>

        {isLoading ? (
          <CardSkeleton />
        ) : listings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {listings.slice(0, 4).map((item: any) => (
              <InformationCard
                key={item.id}
                badgeText={item.product?.category?.name || 'LISTING'}
                title={item.product?.name || item.name}
                description={`Price: ₹${item.price || item.product?.price} • Stock: ${item.stock ?? item.product?.stock ?? 0} units`}
                icon={<Package className="w-6 h-6 text-amber-700" />}
                action={
                  <Link href={`/products/${item.id}`}>
                    <Button variant="outline" size="sm">Edit Listing</Button>
                  </Link>
                }
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No Product Listings Active"
            description="Publish your first seed, fertilizer, or farm tool listing to start receiving district farmer orders."
            actionLabel="Add First Product"
            onAction={() => window.location.href = '/products/new'}
          />
        )}
      </div>
    </div>
  );
}
