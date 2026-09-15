'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  MetricCard,
  Card,
  Badge,
  Button,
  CardSkeleton,
  EmptyState,
  ErrorState,
} from '@farm-seva/shared-ui';
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  UserCheck,
  Truck,
  ArrowRight,
  RefreshCw,
  BarChart3,
  CheckCircle2,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';
import { apiFetch, getAuthToken } from '../../lib/api-client';

interface DashboardMetrics {
  users?: {
    total?: number;
    farmers?: number;
    sellers?: number;
    experts?: number;
    deliveryPartners?: number;
  };
  orders?: {
    total?: number;
    pending?: number;
    completed?: number;
    totalRevenue?: number;
  };
  kyc?: {
    pendingApplications?: number;
  };
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);

  const fetchMetrics = async () => {
    const token = getAuthToken();
    if (!token) {
      router.push('/login');
      return;
    }

    setLoading(true);
    setError(null);

    const res = await apiFetch<DashboardMetrics>('/api/v1/admin/dashboard/metrics');

    if (res.success && res.data) {
      setMetrics(res.data);
    } else {
      setError(res.error || 'Failed to fetch platform dashboard metrics');
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white p-6 rounded-2xl border border-slate-800 shadow-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge status="processing" className="bg-emerald-500/20 text-emerald-200 border-emerald-400/30">
              Master Platform Overview
            </Badge>
            <span className="text-xs text-slate-300 font-semibold">• Live API Connected</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black">Admin Operational Desk</h1>
          <p className="text-xs text-slate-200 font-medium">
            Real-time platform analytics, user moderation, order dispatch, and financial audit.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchMetrics}
            className="bg-white/10 text-white border-white/20 hover:bg-white/20 text-xs"
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh Metrics
          </Button>
          <Link href="/reports">
            <Button size="sm" className="bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 text-xs" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              Financial Reports
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : error ? (
        <ErrorState title="Unable to Load Metrics" message={error} onRetry={fetchMetrics} />
      ) : !metrics ? (
        <ErrorState title="No Data" message="Platform metrics unavailable." />
      ) : (
        <div className="space-y-6">
          {/* User Counts Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <MetricCard
              title="Total Farmers"
              value={(metrics.users?.farmers ?? 0).toString()}
              subtitle="Registered crop growers"
              icon={<Users className="w-5 h-5 text-emerald-600" />}
            />
            <MetricCard
              title="Licensed Sellers"
              value={(metrics.users?.sellers ?? 0).toString()}
              subtitle="Agri dealer shops"
              icon={<ShoppingBag className="w-5 h-5 text-amber-500" />}
            />
            <MetricCard
              title="Certified Experts"
              value={(metrics.users?.experts ?? 0).toString()}
              subtitle="Agronomist pathologists"
              icon={<ShieldCheck className="w-5 h-5 text-sky-500" />}
            />
            <MetricCard
              title="Delivery Partners"
              value={(metrics.users?.deliveryPartners ?? 0).toString()}
              subtitle="Logistics fleet"
              icon={<Truck className="w-5 h-5 text-purple-600" />}
            />
          </div>

          {/* Orders & Financial Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <MetricCard
              title="Total Platform Orders"
              value={(metrics.orders?.total ?? 0).toString()}
              subtitle="Fulfillment transactions"
              icon={<ShoppingBag className="w-5 h-5 text-slate-700" />}
            />
            <MetricCard
              title="Pending KYC Reviews"
              value={(metrics.kyc?.pendingApplications ?? 0).toString()}
              subtitle="Awaiting moderation"
              icon={<UserCheck className="w-5 h-5 text-rose-500" />}
            />
            <MetricCard
              title="Gross Marketplace Revenue"
              value={`₹${(metrics.orders?.totalRevenue ?? 0).toLocaleString()}`}
              subtitle="Total GMV processed"
              icon={<BarChart3 className="w-5 h-5 text-emerald-600" />}
            />
          </div>

          {/* Quick Action Navigation Grid */}
          <Card className="p-6 border-slate-200 space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4 text-emerald-600" />
              Administrative Operational Control Desks
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <Link href="/users">
                <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-emerald-500 hover:shadow-xs transition space-y-1">
                  <div className="font-extrabold text-slate-900 flex items-center justify-between">
                    <span>User Management</span>
                    <Users className="w-4 h-4 text-emerald-600" />
                  </div>
                  <p className="text-slate-500">Moderate platform user roles & account statuses</p>
                </div>
              </Link>

              <Link href="/kyc">
                <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-emerald-500 hover:shadow-xs transition space-y-1">
                  <div className="font-extrabold text-slate-900 flex items-center justify-between">
                    <span>KYC Moderation</span>
                    <UserCheck className="w-4 h-4 text-amber-600" />
                  </div>
                  <p className="text-slate-500">Audit seller & expert license documents</p>
                </div>
              </Link>

              <Link href="/deliveries">
                <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-emerald-500 hover:shadow-xs transition space-y-1">
                  <div className="font-extrabold text-slate-900 flex items-center justify-between">
                    <span>Delivery Assignment</span>
                    <Truck className="w-4 h-4 text-purple-600" />
                  </div>
                  <p className="text-slate-500">Assign delivery partners to pending orders</p>
                </div>
              </Link>

              <Link href="/products">
                <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-emerald-500 hover:shadow-xs transition space-y-1">
                  <div className="font-extrabold text-slate-900 flex items-center justify-between">
                    <span>Product Moderation</span>
                    <ShoppingBag className="w-4 h-4 text-sky-600" />
                  </div>
                  <p className="text-slate-500">Review pending marketplace product listings</p>
                </div>
              </Link>

              <Link href="/reports">
                <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-emerald-500 hover:shadow-xs transition space-y-1">
                  <div className="font-extrabold text-slate-900 flex items-center justify-between">
                    <span>Financial Reports</span>
                    <BarChart3 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <p className="text-slate-500">Process payouts & export CSV analytics</p>
                </div>
              </Link>

              <Link href="/notifications">
                <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-emerald-500 hover:shadow-xs transition space-y-1">
                  <div className="font-extrabold text-slate-900 flex items-center justify-between">
                    <span>System Alerts</span>
                    <ShieldCheck className="w-4 h-4 text-slate-700" />
                  </div>
                  <p className="text-slate-500">Inspect system notifications & audit log</p>
                </div>
              </Link>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
