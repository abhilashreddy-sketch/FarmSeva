'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  Badge,
  Button,
  TextInput,
  Toast,
  CardSkeleton,
  EmptyState,
  ErrorState,
} from '@farm-seva/shared-ui';
import {
  Truck,
  MapPin,
  Phone,
  Store,
  Navigation as NavIcon,
  ShieldCheck,
  CheckCircle2,
  Package,
} from 'lucide-react';
import Link from 'next/link';
import { apiFetch, getAuthToken } from '../../lib/api-client';

interface DeliveryTaskDetail {
  id: string;
  orderId: string;
  status: 'ASSIGNED' | 'PICKED_UP' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
  order: {
    id: string;
    orderNumber?: string;
    netAmount?: number;
    shippingAddress?: {
      fullName?: string;
      phone?: string;
      addressLine1?: string;
      villageTaluk?: string;
      district?: string;
      latitude?: number;
      longitude?: number;
    };
    shop?: {
      shopName?: string;
      contactPhone?: string;
      addressLine?: string;
      district?: string;
    };
  };
}

export default function ActiveDeliveryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTask, setActiveTask] = useState<DeliveryTaskDetail | null>(null);
  const [deliveryOtp, setDeliveryOtp] = useState('');
  const [updating, setUpdating] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fetchActiveTask = async () => {
    const token = getAuthToken();
    if (!token) {
      router.push('/login');
      return;
    }

    setLoading(true);
    setError(null);

    const res = await apiFetch<DeliveryTaskDetail[]>('/api/v1/delivery/orders');

    if (res.success && Array.isArray(res.data)) {
      const active = res.data.find(
        (d) => d.status === 'ASSIGNED' || d.status === 'PICKED_UP' || d.status === 'OUT_FOR_DELIVERY'
      );
      setActiveTask(active || null);
    } else {
      setError(res.error || 'Failed to fetch active delivery');
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchActiveTask();
  }, []);

  const handleUpdateStatus = async (targetStatus: string) => {
    if (!activeTask) return;
    if (targetStatus === 'DELIVERED' && !deliveryOtp) {
      setToast({ message: 'Delivery OTP is required for completion.', type: 'error' });
      return;
    }

    setUpdating(true);

    const res = await apiFetch(`/api/v1/delivery/orders/${activeTask.id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({
        status: targetStatus,
        deliveryOtp: targetStatus === 'DELIVERED' ? deliveryOtp : undefined,
      }),
    });

    setUpdating(false);

    if (res.success) {
      setToast({ message: `Delivery status updated to ${targetStatus.replace(/_/g, ' ')}!`, type: 'success' });
      fetchActiveTask();
    } else {
      setToast({ message: res.error || 'Failed to update status.', type: 'error' });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {toast && (
        <Toast
          title={toast.type === 'success' ? 'Success' : 'Error'}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <NavIcon className="w-6 h-6 text-purple-600" />
            Active Delivery Workstation
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Manage your current in-progress shipment and OTP drop-off handover
          </p>
        </div>
      </div>

      {loading ? (
        <CardSkeleton />
      ) : error ? (
        <ErrorState title="Unable to Load Active Task" message={error} onRetry={fetchActiveTask} />
      ) : !activeTask ? (
        <EmptyState
          icon={<Truck className="w-12 h-12 text-slate-400" />}
          title="No Active Delivery Task"
          description="You currently have no order in transit. Check your assigned queue for new pickup tasks."
          actionLabel="Browse Assigned Tasks"
          onAction={() => router.push('/deliveries')}
        />
      ) : (
        <div className="space-y-6">
          <Card className="p-6 border-purple-300 bg-purple-50/40 space-y-4">
            <div className="flex items-center justify-between">
              <Badge status="processing" className="bg-purple-200 text-purple-900">
                IN PROGRESS • {activeTask.status.replace(/_/g, ' ')}
              </Badge>
              <span className="text-xs font-mono font-bold text-slate-600">
                Order #{activeTask.order?.orderNumber || activeTask.orderId.slice(-6)}
              </span>
            </div>

            {/* Quick Contact & Address Links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-white rounded-xl border border-purple-100 space-y-2">
                <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                  <Store className="w-4 h-4 text-purple-600" />
                  Pickup Dealer
                </span>
                <p className="text-xs font-black text-slate-900">{activeTask.order?.shop?.shopName || 'Agri Dealer Shop'}</p>
                <p className="text-[11px] text-slate-600">{activeTask.order?.shop?.addressLine || 'Shop Location'}, {activeTask.order?.shop?.district || 'District'}</p>
                {activeTask.order?.shop?.contactPhone && (
                  <a href={`tel:${activeTask.order.shop.contactPhone}`} className="inline-flex items-center gap-1 text-xs font-bold text-purple-700 hover:underline pt-1">
                    <Phone className="w-3.5 h-3.5" /> Call Shop ({activeTask.order.shop.contactPhone})
                  </a>
                )}
              </div>

              <div className="p-4 bg-white rounded-xl border border-emerald-100 space-y-2">
                <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  Drop-off Farmer
                </span>
                <p className="text-xs font-black text-slate-900">{activeTask.order?.shippingAddress?.fullName || 'Farmer Recipient'}</p>
                <p className="text-[11px] text-slate-600">{activeTask.order?.shippingAddress?.villageTaluk || 'Field Location'}, {activeTask.order?.shippingAddress?.district || 'District'}</p>
                {activeTask.order?.shippingAddress?.phone && (
                  <a href={`tel:${activeTask.order.shippingAddress.phone}`} className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:underline pt-1">
                    <Phone className="w-3.5 h-3.5" /> Call Farmer ({activeTask.order.shippingAddress.phone})
                  </a>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="pt-3 border-t border-purple-100 space-y-3">
              {activeTask.status === 'ASSIGNED' && (
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => handleUpdateStatus('PICKED_UP')}
                  isLoading={updating}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold"
                  rightIcon={<Package className="w-4 h-4" />}
                >
                  Confirm Dealer Pickup
                </Button>
              )}

              {activeTask.status === 'PICKED_UP' && (
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => handleUpdateStatus('OUT_FOR_DELIVERY')}
                  isLoading={updating}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold"
                  rightIcon={<NavIcon className="w-4 h-4" />}
                >
                  Mark Out for Delivery (In Transit)
                </Button>
              )}

              {(activeTask.status === 'OUT_FOR_DELIVERY' || activeTask.status === 'PICKED_UP') && (
                <div className="p-4 bg-white rounded-xl border border-emerald-200 space-y-3">
                  <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Complete Delivery Handover
                  </span>
                  <TextInput
                    label="Farmer Delivery OTP *"
                    placeholder="Enter 4-digit OTP"
                    value={deliveryOtp}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDeliveryOtp(e.target.value)}
                  />
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => handleUpdateStatus('DELIVERED')}
                    isLoading={updating}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                    rightIcon={<CheckCircle2 className="w-4 h-4" />}
                  >
                    Verify OTP & Complete Task
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
