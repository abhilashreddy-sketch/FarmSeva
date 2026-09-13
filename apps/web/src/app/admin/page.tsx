'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldAlert, Users, Store, Microscope, ShoppingBag, Radio, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { StatsCard } from '../../components/ui/StatsCard';
import { Skeleton } from '../../components/ui/Skeleton';

import { API_BASE_URL } from '@/config/api';

export default function AdminDashboardPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();

  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!isLoading) {
      if (!user || user.role !== 'ADMIN') {
        router.push('/login');
      } else {
        loadMetrics();
      }
    }
  }, [user, isLoading, token, router]);

  const loadMetrics = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/admin/dashboard/metrics`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setMetrics(data.data);
    } catch (e) {
      console.error('Failed to load admin metrics:', e);
    }
    setLoading(false);
  };

  if (isLoading || loading) {
    return <div className="p-8 text-center font-bold text-slate-500">Loading Admin Control Center...</div>;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-2">
      {/* Admin Executive Header */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-6 md:p-8 shadow-xl border border-slate-800">
        <div className="flex items-center justify-between flex-wrap gap-4 relative z-10">
          <div className="space-y-2">
            <Badge variant="harvest" size="md" className="bg-amber-400 text-slate-950">
              <ShieldAlert className="w-3.5 h-3.5 mr-1" /> MASTER ADMIN COMMAND CENTER
            </Badge>
            <h1 className="text-2xl md:text-4xl font-black tracking-tight">
              Platform Operations Control
            </h1>
            <p className="text-slate-300 text-xs md:text-sm font-medium">
              Real-time marketplace telemetry, verification queues, double-entry financial ledger audit, and provider gateway statuses.
            </p>
          </div>

          <Badge variant="success" size="md" className="py-2 px-4 text-xs font-black">
            System Online (100% Operational)
          </Badge>
        </div>
      </div>

      {/* Overview Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Farmers"
          value={metrics?.totalFarmers || 0}
          subtitle={`${metrics?.activeFarmers || 0} Active Accounts`}
          icon={<Users className="w-6 h-6 text-emerald-600" />}
          variant="emerald"
        />

        <StatsCard
          title="Input Sellers"
          value={metrics?.totalSellers || 0}
          subtitle={`${metrics?.pendingSellers || 0} Pending Verification`}
          icon={<Store className="w-6 h-6 text-amber-600" />}
          variant="amber"
        />

        <StatsCard
          title="Agri Experts"
          value={metrics?.totalExperts || 0}
          subtitle={`${metrics?.pendingExperts || 0} Pending Review`}
          icon={<Microscope className="w-6 h-6 text-purple-600" />}
          variant="purple"
        />

        <StatsCard
          title="Orders Today"
          value={metrics?.ordersToday || 0}
          subtitle={`${metrics?.ordersDelivered || 0} Delivered`}
          icon={<ShoppingBag className="w-6 h-6 text-sky-600" />}
          variant="blue"
        />
      </div>

      {/* Admin Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/admin/marketplace">
          <Card hoverable padding="md" className="space-y-3 h-full">
            <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center text-2xl shadow-sm">
              <Store className="w-6 h-6" />
            </div>
            <h3 className="font-black text-slate-900 text-lg">Seller & Catalog Control</h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Verify agricultural input shop licenses, approve chemical pesticide products, and review CIB compliance.
            </p>
          </Card>
        </Link>

        <Link href="/admin/crop-problems">
          <Card hoverable padding="md" className="space-y-3 h-full">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center text-2xl shadow-sm">
              <Microscope className="w-6 h-6" />
            </div>
            <h3 className="font-black text-slate-900 text-lg">Expert Case Assignment</h3>
            <div className="text-xs text-slate-500 font-medium leading-relaxed">
              Assign certified pathologists and agronomists to open farmer disease diagnostics.
            </div>
          </Card>
        </Link>

        <Link href="/admin/communications">
          <Card hoverable padding="md" className="space-y-3 h-full">
            <div className="w-12 h-12 bg-purple-100 text-purple-700 rounded-2xl flex items-center justify-center text-2xl shadow-sm">
              <Radio className="w-6 h-6" />
            </div>
            <h3 className="font-black text-slate-900 text-lg">Emergency Broadcast Desk</h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Dispatch regional emergency alerts across SMS, WhatsApp Business, FCM Push, and IVR channels.
            </p>
          </Card>
        </Link>
      </div>

      {/* Provider Sandbox Status Matrix */}
      <Card padding="md" className="space-y-4">
        <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
          <Radio className="w-5 h-5 text-emerald-600" /> External Service Provider Gateway Status Matrix
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {metrics?.providerStatuses &&
            Object.entries(metrics.providerStatuses).map(([key, val]) => (
              <div key={key} className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 text-center space-y-1.5">
                <div className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">{key}</div>
                <Badge variant={val === 'CONFIGURED' ? 'success' : 'warning'} size="sm">
                  {String(val)}
                </Badge>
              </div>
            ))}
        </div>
      </Card>
    </div>
  );
}
