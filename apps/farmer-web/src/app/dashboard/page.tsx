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
import { Sprout, ShoppingBag, FileText, User, Plus, ArrowRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { apiFetch, getAuthToken, removeAuthToken } from '../../lib/api-client';

export default function FarmerDashboardPage() {
  const [profile, setProfile] = useState<any>(null);
  const [crops, setCrops] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      const token = getAuthToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const [profRes, cropRes, ordRes] = await Promise.all([
        apiFetch<any>('/api/v1/farmer/profile'),
        apiFetch<any[]>('/api/v1/farmer/crops'),
        apiFetch<any[]>('/api/v1/orders/farmer/orders'),
      ]);

      if (profRes.success) setProfile(profRes.data);
      if (cropRes.success && Array.isArray(cropRes.data)) setCrops(cropRes.data);
      if (ordRes.success && Array.isArray(ordRes.data)) setOrders(ordRes.data);
      setIsLoading(false);
    }
    loadDashboard();
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
          description="Please sign in with your Farmer account to view your farm dashboard, registered crops, and orders."
          actionLabel="Sign In Now"
          onAction={() => window.location.href = '/login'}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-4">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-green-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Badge status="verified">Farmer Console</Badge>
          <h1 className="text-2xl font-black">
            Welcome back, {profile?.name || profile?.user?.name || 'Farmer'}
          </h1>
          <p className="text-emerald-100 text-xs font-medium">
            Phone: {profile?.phone || profile?.user?.phone || 'Connected'} • District: {profile?.district || 'Registered'}
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={handleLogout} className="bg-white/10 text-white border-white/20">
          Sign Out
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Registered Crops"
          value={isLoading ? '...' : crops.length}
          subtitle="Active field sowings"
          icon={<Sprout className="w-5 h-5 text-emerald-700" />}
        />
        <MetricCard
          title="Marketplace Orders"
          value={isLoading ? '...' : orders.length}
          subtitle="Track purchases & delivery"
          icon={<ShoppingBag className="w-5 h-5 text-emerald-700" />}
        />
        <MetricCard
          title="Crop Doctor AI"
          value="Available"
          subtitle="Instant plant pathology"
          icon={<ShieldCheck className="w-5 h-5 text-emerald-700" />}
        />
      </div>

      {/* Quick Action Navigation */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link href="/products">
          <Button variant="primary" size="md" className="w-full bg-emerald-700 hover:bg-emerald-800" leftIcon={<ShoppingBag className="w-4 h-4" />}>
            Buy Inputs
          </Button>
        </Link>
        <Link href="/crops">
          <Button variant="secondary" size="md" className="w-full" leftIcon={<Sprout className="w-4 h-4" />}>
            My Crops
          </Button>
        </Link>
        <Link href="/orders">
          <Button variant="outline" size="md" className="w-full" leftIcon={<FileText className="w-4 h-4" />}>
            View Orders
          </Button>
        </Link>
        <Link href="/advisory">
          <Button variant="outline" size="md" className="w-full" leftIcon={<ShieldCheck className="w-4 h-4" />}>
            Crop Help
          </Button>
        </Link>
      </div>

      {/* Registered Crops Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-slate-900">Active Crop Sowings</h2>
          <Link href="/crops" className="text-xs font-bold text-emerald-700 hover:underline">
            Manage Crops →
          </Link>
        </div>

        {isLoading ? (
          <CardSkeleton />
        ) : crops.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {crops.map((crop: any) => (
              <InformationCard
                key={crop.id}
                badgeText={crop.stage || 'SOWN'}
                title={crop.name || crop.cropName}
                description={`Field: ${crop.fieldName || 'Main Plot'} • Sowing Date: ${crop.sowingDate ? new Date(crop.sowingDate).toLocaleDateString() : 'N/A'}`}
                icon={<Sprout className="w-6 h-6 text-emerald-700" />}
                action={
                  <Link href={`/crops/${crop.id}`}>
                    <Button variant="outline" size="sm">View Crop Details</Button>
                  </Link>
                }
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No Registered Crops"
            description="Register your current crop sowings to receive personalized advisory and disease prevention alerts."
            actionLabel="Add First Crop"
            onAction={() => window.location.href = '/crops'}
          />
        )}
      </div>

      {/* Orders Summary */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-slate-900">Recent Marketplace Purchases</h2>
          <Link href="/orders" className="text-xs font-bold text-emerald-700 hover:underline">
            All Orders →
          </Link>
        </div>

        {isLoading ? (
          <CardSkeleton />
        ) : orders.length > 0 ? (
          <div className="space-y-3">
            {orders.slice(0, 3).map((ord: any) => (
              <div key={ord.id} className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">Order #{ord.id.slice(0, 8)}</span>
                    <Badge status={ord.status?.toLowerCase() || 'pending'} />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Total: ₹{ord.totalAmount || ord.total} • {ord.items?.length || 1} items</p>
                </div>
                <Link href={`/orders/${ord.id}`}>
                  <Button variant="outline" size="sm">Details</Button>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No Recent Orders"
            description="You have not placed any marketplace orders yet. Browse certified seeds and fertilizers from local dealers."
            actionLabel="Browse Products"
            onAction={() => window.location.href = '/products'}
          />
        )}
      </div>
    </div>
  );
}
