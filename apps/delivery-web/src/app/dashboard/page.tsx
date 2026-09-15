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
  Toast,
} from '@farm-seva/shared-ui';
import {
  Truck,
  Package,
  DollarSign,
  CheckCircle2,
  ArrowRight,
  Clock,
  MapPin,
  RefreshCw,
  Power,
  Navigation as NavIcon,
} from 'lucide-react';
import Link from 'next/link';
import { apiFetch, getAuthToken } from '../../lib/api-client';

interface DeliveryRecord {
  id: string;
  orderId: string;
  status: 'ASSIGNED' | 'PICKED_UP' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
  assignedAt?: string;
  updatedAt?: string;
  order?: {
    orderNumber?: string;
    totalAmount?: number;
    shippingAddress?: {
      villageTaluk?: string;
      district?: string;
    };
    shop?: {
      shopName?: string;
      district?: string;
    };
  };
}

export default function DeliveryDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deliveries, setDeliveries] = useState<DeliveryRecord[]>([]);
  const [isAvailable, setIsAvailable] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [earningsData, setEarningsData] = useState({ todayEarnings: 0, completedCount: 0 });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fetchData = async () => {
    const token = getAuthToken();
    if (!token) {
      router.push('/login');
      return;
    }

    setLoading(true);
    setError(null);

    // Fetch Profile for availability
    const profRes = await apiFetch<any>('/api/v1/delivery/profile');
    if (profRes.success && profRes.data) {
      setIsAvailable(Boolean(profRes.data.isAvailable));
    }

    // Fetch Assigned Deliveries
    const delRes = await apiFetch<DeliveryRecord[]>('/api/v1/delivery/orders');
    if (delRes.success && Array.isArray(delRes.data)) {
      setDeliveries(delRes.data);
    } else if (delRes.error) {
      setError(delRes.error);
    }

    // Fetch Earnings Summary
    const earnRes = await apiFetch<any>('/api/v1/delivery/earnings');
    if (earnRes.success && earnRes.data) {
      setEarningsData({
        todayEarnings: earnRes.data.todayEarnings || 0,
        completedCount: earnRes.data.completedCount || 0,
      });
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleAvailability = async () => {
    setToggling(true);
    const newStatus = !isAvailable;

    const res = await apiFetch('/api/v1/delivery/status', {
      method: 'PATCH',
      body: JSON.stringify({ isAvailable: newStatus }),
    });

    setToggling(false);

    if (res.success) {
      setIsAvailable(newStatus);
      setToast({
        message: newStatus ? 'You are now ONLINE and available for orders.' : 'You are now OFFLINE.',
        type: 'success',
      });
    } else {
      setToast({ message: res.error || 'Failed to update availability status', type: 'error' });
    }
  };

  const activeDelivery = deliveries.find((d) => d.status === 'ASSIGNED' || d.status === 'PICKED_UP' || d.status === 'OUT_FOR_DELIVERY');
  const pendingCount = deliveries.filter((d) => d.status === 'ASSIGNED').length;
  const inTransitCount = deliveries.filter((d) => d.status === 'PICKED_UP' || d.status === 'OUT_FOR_DELIVERY').length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {toast && (
        <Toast
          title={toast.type === 'success' ? 'Success' : 'Error'}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Top Banner & Availability Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-purple-900 to-slate-900 text-white p-6 rounded-2xl border border-purple-800 shadow-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge status={isAvailable ? 'processing' : 'inactive'} className={isAvailable ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30' : 'bg-slate-700 text-slate-300'}>
              {isAvailable ? 'ONLINE • ACCEPTING TASKS' : 'OFFLINE'}
            </Badge>
            <span className="text-xs text-purple-300 font-semibold">• Live API Connected</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black">Partner Logistics Desk</h1>
          <p className="text-xs text-purple-100 font-medium">
            Manage active shipments, shop pickups, and farmer delivery handovers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant={isAvailable ? 'outline' : 'primary'}
            size="sm"
            onClick={handleToggleAvailability}
            isLoading={toggling}
            className={isAvailable ? 'bg-emerald-500/20 text-emerald-100 border-emerald-400/40 hover:bg-emerald-500/30 text-xs' : 'bg-purple-600 text-white hover:bg-purple-700 text-xs font-bold'}
            leftIcon={<Power className="w-3.5 h-3.5" />}
          >
            {isAvailable ? 'Go Offline' : 'Go Online'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            className="bg-white/10 text-white border-white/20 hover:bg-white/20 text-xs"
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh Desk
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <MetricCard
          title="Assigned Tasks"
          value={pendingCount.toString()}
          subtitle="Ready for pickup"
          icon={<Clock className="w-5 h-5 text-amber-500" />}
        />
        <MetricCard
          title="In Transit"
          value={inTransitCount.toString()}
          subtitle="Out for delivery"
          icon={<NavIcon className="w-5 h-5 text-purple-500" />}
        />
        <MetricCard
          title="Completed Total"
          value={earningsData.completedCount.toString()}
          subtitle="Delivered orders"
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-500" />}
        />
        <MetricCard
          title="Today's Earnings"
          value={`₹${earningsData.todayEarnings}`}
          subtitle="Settled payouts"
          icon={<DollarSign className="w-5 h-5 text-purple-600" />}
        />
      </div>

      {/* Active Delivery Highlight Banner */}
      {activeDelivery && (
        <Card className="p-5 border-purple-300 bg-purple-50/50 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge status="processing" className="bg-purple-200 text-purple-900">
                ACTIVE SHIPMENT
              </Badge>
              <span className="text-xs font-bold text-slate-700">
                Order #{activeDelivery.order?.orderNumber || activeDelivery.orderId.slice(-6)}
              </span>
            </div>
            <Link href={`/deliveries/${activeDelivery.id}`}>
              <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                Open Active Task
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
            <div className="flex items-center gap-2 text-slate-700">
              <MapPin className="w-4 h-4 text-purple-600 shrink-0" />
              <span>
                <strong>Pickup:</strong> {activeDelivery.order?.shop?.shopName || 'Retail Dealer Shop'}, {activeDelivery.order?.shop?.district || 'District Hub'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <NavIcon className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Drop-off:</strong> {activeDelivery.order?.shippingAddress?.villageTaluk || 'Farmer Field'}, {activeDelivery.order?.shippingAddress?.district || 'District'}
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* Assigned Deliveries Desk */}
      <Card className="p-6 border-slate-200 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Package className="w-4 h-4 text-purple-600" />
              Assigned Deliveries Queue
            </h2>
            <p className="text-xs text-slate-500">
              Showing order fulfillment tasks assigned to your vehicle profile
            </p>
          </div>
          <Link href="/deliveries" className="text-xs font-bold text-purple-600 hover:underline">
            View All Queue ({deliveries.length}) →
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : error ? (
          <ErrorState title="Unable to Load Delivery Tasks" message={error} onRetry={fetchData} />
        ) : deliveries.length === 0 ? (
          <EmptyState
            icon={<Truck className="w-12 h-12 text-slate-400" />}
            title="No Assigned Deliveries"
            description="You currently have no pending delivery assignments. Ensure your online status is enabled to receive new dispatches."
          />
        ) : (
          <div className="space-y-3">
            {deliveries.slice(0, 5).map((d) => (
              <div
                key={d.id}
                className="p-4 rounded-xl border border-slate-200 bg-white hover:border-purple-300 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-slate-900">
                      Order #{d.order?.orderNumber || d.orderId.slice(-6)}
                    </span>
                    <Badge
                      status={
                        d.status === 'DELIVERED'
                          ? 'success'
                          : d.status === 'PICKED_UP' || d.status === 'OUT_FOR_DELIVERY'
                          ? 'processing'
                          : 'pending'
                      }
                    >
                      {d.status.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                    <span>Shop: {d.order?.shop?.shopName || 'Agri Dealer Shop'}</span>
                    <span>• Destination: {d.order?.shippingAddress?.district || 'District Hub'}</span>
                  </div>
                </div>

                <Link href={`/deliveries/${d.id}`} className="shrink-0">
                  <Button variant="outline" size="sm" className="border-purple-300 text-purple-700 hover:bg-purple-50 text-xs font-bold w-full sm:w-auto">
                    View Details →
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
