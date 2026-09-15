'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  Badge,
  Button,
  TextInput,
  CardSkeleton,
  EmptyState,
  ErrorState,
} from '@farm-seva/shared-ui';
import {
  Package,
  Search,
  ArrowRight,
  RefreshCw,
  MapPin,
  Store,
} from 'lucide-react';
import Link from 'next/link';
import { apiFetch, getAuthToken } from '../../lib/api-client';

interface DeliveryTask {
  id: string;
  orderId: string;
  status: 'ASSIGNED' | 'PICKED_UP' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
  assignedAt?: string;
  updatedAt?: string;
  order?: {
    orderNumber?: string;
    totalAmount?: number;
    shippingAddress?: {
      fullName?: string;
      phone?: string;
      villageTaluk?: string;
      district?: string;
      state?: string;
      pincode?: string;
    };
    shop?: {
      shopName?: string;
      contactPhone?: string;
      addressLine?: string;
      district?: string;
    };
    items?: Array<{ id: string; quantity: number; unitPrice: number }>;
  };
}

export default function DeliveriesListPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deliveries, setDeliveries] = useState<DeliveryTask[]>([]);
  const [activeTab, setActiveTab] = useState<'ALL' | 'ASSIGNED' | 'IN_TRANSIT' | 'DELIVERED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchDeliveries = async () => {
    const token = getAuthToken();
    if (!token) {
      router.push('/login');
      return;
    }

    setLoading(true);
    setError(null);

    const res = await apiFetch<DeliveryTask[]>('/api/v1/delivery/orders');

    if (res.success && Array.isArray(res.data)) {
      setDeliveries(res.data);
    } else {
      setError(res.error || 'Failed to fetch assigned deliveries list');
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const filteredDeliveries = deliveries.filter((d) => {
    const orderNum = d.order?.orderNumber || d.orderId || '';
    const shopName = d.order?.shop?.shopName || '';
    const farmerName = d.order?.shippingAddress?.fullName || '';
    const matchesSearch =
      orderNum.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shopName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      farmerName.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === 'ALL') return true;
    if (activeTab === 'ASSIGNED') return d.status === 'ASSIGNED';
    if (activeTab === 'IN_TRANSIT') return d.status === 'PICKED_UP' || d.status === 'OUT_FOR_DELIVERY';
    if (activeTab === 'DELIVERED') return d.status === 'DELIVERED';

    return true;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Package className="w-6 h-6 text-purple-600" />
            Delivery Tasks Queue
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Inspect assigned agricultural product pickups and farmer drop-off tasks
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchDeliveries}
          className="border-slate-300 text-slate-700 hover:bg-slate-100 text-xs self-start sm:self-auto"
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Refresh Queue
        </Button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <Card className="p-4 border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'ALL', label: 'All Tasks', count: deliveries.length },
              {
                id: 'ASSIGNED',
                label: 'Ready Pickup',
                count: deliveries.filter((d) => d.status === 'ASSIGNED').length,
              },
              {
                id: 'IN_TRANSIT',
                label: 'In Transit',
                count: deliveries.filter((d) => d.status === 'PICKED_UP' || d.status === 'OUT_FOR_DELIVERY').length,
              },
              {
                id: 'DELIVERED',
                label: 'Completed',
                count: deliveries.filter((d) => d.status === 'DELIVERED').length,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{tab.label}</span>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white/20">
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="w-full sm:w-64">
            <TextInput
              placeholder="Search order #, shop, farmer..."
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            />
          </div>
        </div>

        {/* Task List */}
        {loading ? (
          <div className="space-y-3 pt-2">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : error ? (
          <ErrorState title="Failed to Load Tasks" message={error} onRetry={fetchDeliveries} />
        ) : filteredDeliveries.length === 0 ? (
          <EmptyState
            icon={<Package className="w-12 h-12 text-slate-400" />}
            title="No Matching Delivery Tasks"
            description={
              searchQuery
                ? `No delivery tasks match "${searchQuery}". Try adjusting your search query or filter.`
                : 'There are no delivery tasks in this category.'
            }
          />
        ) : (
          <div className="space-y-3 pt-2">
            {filteredDeliveries.map((d) => (
              <div
                key={d.id}
                className="p-4 rounded-xl border border-slate-200 bg-white hover:border-purple-300 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Store className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                      <span><strong>Pickup:</strong> {d.order?.shop?.shopName || 'Agri Dealer Shop'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span><strong>Drop-off:</strong> {d.order?.shippingAddress?.villageTaluk || 'Farmer Field'}, {d.order?.shippingAddress?.district || 'District'}</span>
                    </div>
                  </div>
                </div>

                <Link href={`/deliveries/${d.id}`} className="shrink-0">
                  <Button variant="primary" size="sm" className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs w-full sm:w-auto" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                    Open Task
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
