'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Store, Package, Clock, DollarSign, AlertTriangle, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { StatsCard } from '../../components/ui/StatsCard';

export default function SellerDashboard() {
  const { user, isLoading } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) router.push('/login');
      else if (user.status === 'PENDING_VERIFICATION') router.push('/account-pending');
      else if (user.status === 'SUSPENDED') router.push('/account-suspended');
      else if (user.role !== 'SELLER' && user.role !== 'ADMIN') router.push('/unauthorized');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return <div className="p-8 text-center font-bold text-slate-500">Loading Seller Portal...</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2">
      {/* Seller Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-800 via-amber-700 to-amber-900 text-white p-6 md:p-8 shadow-xl border border-amber-600">
        <div className="flex items-center justify-between flex-wrap gap-4 relative z-10">
          <div className="space-y-2">
            <Badge variant="harvest" size="md" className="bg-amber-400 text-emerald-950">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" /> VERIFIED AGRI DEALER (APPROVED)
            </Badge>
            <h1 className="text-2xl md:text-4xl font-black tracking-tight">
              {user.fullName}
            </h1>
            <p className="text-amber-100 text-xs md:text-sm font-medium">
              Verified Retailer • Pesticide License Status: ACTIVE • Phone: {user.phone}
            </p>
          </div>

          <div className="w-16 h-16 bg-amber-600/60 rounded-2xl flex items-center justify-center text-4xl shadow-inner border border-amber-400/40 shrink-0">
            🏪
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Pending Orders"
          value="0"
          subtitle="Awaiting seller confirmation"
          icon={<Clock className="w-6 h-6 text-amber-600" />}
          variant="amber"
        />

        <StatsCard
          title="Packing In Progress"
          value="0"
          subtitle="Order dispatch pipeline"
          icon={<Package className="w-6 h-6 text-sky-600" />}
          variant="blue"
        />

        <StatsCard
          title="Active Listings"
          value="12"
          subtitle="CIB-registered products"
          icon={<Store className="w-6 h-6 text-emerald-600" />}
          variant="emerald"
        />

        <StatsCard
          title="Monthly Sales"
          value="₹0.00"
          subtitle="Verified settlements"
          icon={<DollarSign className="w-6 h-6 text-purple-600" />}
          variant="purple"
        />
      </div>

      {/* Main Dealer Actions & Inventory Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card padding="md" className="space-y-4 border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-lg text-slate-900 flex items-center gap-2">
              <Store className="w-5 h-5 text-amber-600" /> Shop Inventory & Catalog
            </h3>
            <Badge variant="success" size="sm">Active</Badge>
          </div>
          <p className="text-xs text-slate-600 font-medium leading-relaxed">
            Manage your input shop inventory, stock counts, batch prices, and district availability.
          </p>
          <div className="pt-2 flex gap-3">
            <Link href="/seller/marketplace">
              <Button variant="harvest" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Manage Listings & Stock
              </Button>
            </Link>
          </div>
        </Card>

        <Card padding="md" className="space-y-4 border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-lg text-slate-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-sky-600" /> Order Processing Desk
            </h3>
            <Badge variant="info" size="sm">0 Active</Badge>
          </div>
          <p className="text-xs text-slate-600 font-medium leading-relaxed">
            Review incoming orders from local farmers, accept orders, update stock status, and trigger logistics dispatch.
          </p>
          <div className="pt-2 flex gap-3">
            <Link href="/seller/orders">
              <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                View Order Queue
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* Compliance & Settlement Notice */}
      <Card padding="md" className="bg-slate-900 text-white border-slate-800 space-y-3">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-amber-400" />
          <h4 className="font-bold text-sm text-white">CIB Regulatory Compliance & Double-Entry Financial Settlement</h4>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          All chemical pesticides sold on FARM SEVA are strictly validated against active pesticide licenses. Automated seller settlements execute after 7-day post-delivery hold periods via double-entry financial ledger accounting.
        </p>
      </Card>
    </div>
  );
}
