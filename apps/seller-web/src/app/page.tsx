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
import { Store, Package, ShoppingCart, ArrowRight, ShieldCheck, DollarSign, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { apiFetch } from '../lib/api-client';

export default function SellerHomePage() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadPublicStats() {
      setIsLoading(true);
      const res = await apiFetch<any>('/api/v1/seller/analytics/dashboard');
      if (res.success && res.data) {
        setStats(res.data);
      }
      setIsLoading(false);
    }
    loadPublicStats();
  }, []);

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-2 sm:py-4">
      {/* Merchant Hero Banner */}
      <div className="bg-gradient-to-r from-amber-700 to-amber-900 text-white p-6 sm:p-10 rounded-3xl shadow-xl space-y-4 border border-amber-600">
        <div className="flex items-center gap-2">
          <Badge status="pending">Agri Dealer Application</Badge>
          <span className="text-xs text-amber-200 font-bold">• Licensed Retail Merchant Console</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
          FARM SEVA SELLER
        </h1>
        <p className="text-amber-100 text-sm font-medium max-w-2xl leading-relaxed">
          Manage your digital agricultural shop. List certified seeds, bio-pesticides, and fertilizers, track district farmer orders, manage inventory stock, and view payouts.
        </p>

        <div className="grid grid-cols-2 sm:flex flex-wrap gap-2.5 pt-2">
          <Link href="/login" className="w-full sm:w-auto">
            <Button variant="primary" size="md" className="w-full bg-amber-400 text-amber-950 hover:bg-amber-300 font-black" rightIcon={<ArrowRight className="w-4 h-4" />}>
              SELLER SIGN IN
            </Button>
          </Link>
          <Link href="/register" className="w-full sm:w-auto">
            <Button variant="outline" size="md" className="w-full bg-white/10 text-white border-white/20 hover:bg-white/20">
              REGISTER SHOP
            </Button>
          </Link>
          <Link href="/products" className="w-full sm:w-auto">
            <Button variant="outline" size="md" className="w-full bg-white/10 text-white border-white/20 hover:bg-white/20">
              MANAGE PRODUCTS
            </Button>
          </Link>
          <Link href="/orders" className="w-full sm:w-auto">
            <Button variant="outline" size="md" className="w-full bg-white/10 text-white border-white/20 hover:bg-white/20">
              VIEW ORDERS
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricCard
          title="Digital Catalog"
          value={isLoading ? '...' : stats?.activeListings ?? 'Active'}
          subtitle="Certified dealer stock"
          icon={<Package className="w-4 h-4 text-amber-700" />}
        />
        <MetricCard
          title="District Orders"
          value={isLoading ? '...' : stats?.pendingOrders ?? 'Pending'}
          subtitle="Actionable farmer orders"
          icon={<ShoppingCart className="w-4 h-4 text-amber-700" />}
        />
        <MetricCard
          title="KYC Status"
          value="License Gate"
          subtitle="Admin trade license audit"
          icon={<ShieldCheck className="w-4 h-4 text-amber-700" />}
        />
        <MetricCard
          title="Settlements"
          value="Automated"
          subtitle="District bank payouts"
          icon={<DollarSign className="w-4 h-4 text-amber-700" />}
        />
      </div>

      {/* Merchant Workflow Guide */}
      <div className="space-y-3">
        <h2 className="text-base font-black text-slate-900">Dealer Operations Workflow</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InformationCard
            badgeText="CATALOG MANAGEMENT"
            title="Publish Product Listings"
            description="List government-compliant fertilizers, seeds, and equipment with transparent district retail pricing."
            icon={<Package className="w-6 h-6 text-amber-700" />}
            action={
              <Link href="/login">
                <Button variant="outline" size="sm">Manage Shop Products</Button>
              </Link>
            }
          />
          <InformationCard
            badgeText="ORDER FULFILLMENT"
            title="Farmer Order Processing"
            description="Receive real-time notifications when farmers place orders and prepare shipments for district delivery drivers."
            icon={<ShoppingCart className="w-6 h-6 text-amber-700" />}
            action={
              <Link href="/login">
                <Button variant="outline" size="sm">View Order Desk</Button>
              </Link>
            }
          />
        </div>
      </div>
    </div>
  );
}
