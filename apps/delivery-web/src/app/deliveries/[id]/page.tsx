'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Card,
  Badge,
  Button,
  TextInput,
  Toast,
  CardSkeleton,
  ErrorState,
} from '@farm-seva/shared-ui';
import {
  Truck,
  ArrowLeft,
  CheckCircle2,
  MapPin,
  Phone,
  Store,
  User,
  Navigation as NavIcon,
  ShieldCheck,
  Package,
  Send,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import { apiFetch, getAuthToken } from '../../../lib/api-client';

interface DeliveryTaskDetail {
  id: string;
  orderId: string;
  status: 'ASSIGNED' | 'PICKED_UP' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
  notes?: string;
  assignedAt?: string;
  pickedUpAt?: string;
  deliveredAt?: string;
  updatedAt?: string;
  order: {
    id: string;
    orderNumber?: string;
    netAmount?: number;
    paymentStatus?: string;
    paymentMethod?: string;
    shippingAddress?: {
      fullName?: string;
      phone?: string;
      addressLine1?: string;
      villageTaluk?: string;
      district?: string;
      state?: string;
      pincode?: string;
      latitude?: number;
      longitude?: number;
    };
    shop?: {
      shopName?: string;
      contactPhone?: string;
      addressLine?: string;
      district?: string;
    };
    items?: Array<{
      id: string;
      quantity: number;
      unitPrice: number;
      product?: { name: string; category?: string };
    }>;
  };
}

export default function DeliveryTaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const deliveryId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [task, setTask] = useState<DeliveryTaskDetail | null>(null);
  const [deliveryOtp, setDeliveryOtp] = useState('');
  const [statusNotes, setStatusNotes] = useState('');
  const [updating, setUpdating] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fetchTaskDetail = async () => {
    const token = getAuthToken();
    if (!token) {
      router.push('/login');
      return;
    }

    setLoading(true);
    setError(null);

    // Fetch assigned deliveries and match ID
    const res = await apiFetch<DeliveryTaskDetail[]>('/api/v1/delivery/orders');

    if (res.success && Array.isArray(res.data)) {
      const match = res.data.find((d) => d.id === deliveryId || d.orderId === deliveryId);
      if (match) {
        setTask(match);
      } else {
        setError(`Delivery task #${deliveryId} not found in your assigned queue.`);
      }
    } else {
      setError(res.error || `Failed to fetch delivery task #${deliveryId}`);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (deliveryId) {
      fetchTaskDetail();
    }
  }, [deliveryId]);

  const handleUpdateStatus = async (targetStatus: string) => {
    if (targetStatus === 'DELIVERED' && !deliveryOtp) {
      setToast({ message: 'Delivery OTP is required for completion.', type: 'error' });
      return;
    }

    setUpdating(true);
    setToast(null);

    const res = await apiFetch(`/api/v1/delivery/orders/${deliveryId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({
        status: targetStatus,
        deliveryOtp: targetStatus === 'DELIVERED' ? deliveryOtp : undefined,
        notes: statusNotes || undefined,
      }),
    });

    setUpdating(false);

    if (res.success) {
      setToast({ message: `Delivery status updated to ${targetStatus.replace(/_/g, ' ')}!`, type: 'success' });
      fetchTaskDetail();
    } else {
      setToast({ message: res.error || 'Failed to update delivery status.', type: 'error' });
    }
  };

  const openNavigation = (lat?: number, lng?: number, addressStr?: string) => {
    let url = 'https://www.google.com/maps';
    if (lat && lng) {
      url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    } else if (addressStr) {
      url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(addressStr)}`;
    }
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {toast && (
        <Toast
          title={toast.type === 'success' ? 'Success' : 'Error'}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Back Bar */}
      <div className="flex items-center justify-between">
        <Link href="/deliveries">
          <Button variant="outline" size="sm" className="border-slate-300 text-slate-700" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Deliveries
          </Button>
        </Link>
        <span className="text-xs font-bold text-slate-400">• Task Fulfillment Desk</span>
      </div>

      {loading ? (
        <CardSkeleton />
      ) : error ? (
        <ErrorState title="Task Not Found" message={error} onRetry={fetchTaskDetail} />
      ) : !task ? (
        <ErrorState title="Task Unavailable" message="Delivery details could not be parsed." />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Order Overview & Addresses */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="p-5 border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <Badge
                  status={
                    task.status === 'DELIVERED'
                      ? 'success'
                      : task.status === 'PICKED_UP' || task.status === 'OUT_FOR_DELIVERY'
                      ? 'processing'
                      : 'pending'
                  }
                >
                  {task.status.replace(/_/g, ' ')}
                </Badge>
                <span className="text-xs font-mono font-bold text-slate-500">#{task.order?.orderNumber || task.orderId.slice(-6)}</span>
              </div>

              {/* Shop / Pickup Address */}
              <div className="space-y-2 p-3 bg-purple-50/60 rounded-xl border border-purple-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-purple-900 flex items-center gap-1.5">
                    <Store className="w-4 h-4 text-purple-600" />
                    1. Pickup Dealer Location
                  </span>
                </div>
                <p className="text-xs font-black text-slate-900">{task.order?.shop?.shopName || 'Retail Dealer Shop'}</p>
                <p className="text-[11px] text-slate-600 leading-snug">{task.order?.shop?.addressLine || 'Dealer Shop Address'}, {task.order?.shop?.district || 'District'}</p>
                {task.order?.shop?.contactPhone && (
                  <a href={`tel:${task.order.shop.contactPhone}`} className="inline-flex items-center gap-1 text-xs font-bold text-purple-700 hover:underline pt-1">
                    <Phone className="w-3.5 h-3.5" /> Call Shop ({task.order.shop.contactPhone})
                  </a>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openNavigation(undefined, undefined, `${task.order?.shop?.shopName || ''} ${task.order?.shop?.addressLine || ''}`)}
                  className="w-full mt-2 border-purple-300 text-purple-700 hover:bg-purple-100 text-xs font-bold"
                  rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
                >
                  Navigate to Dealer
                </Button>
              </div>

              {/* Farmer / Drop-off Address */}
              <div className="space-y-2 p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-emerald-900 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    2. Drop-off Farmer Address
                  </span>
                </div>
                <p className="text-xs font-black text-slate-900">{task.order?.shippingAddress?.fullName || 'Farmer Recipient'}</p>
                <p className="text-[11px] text-slate-600 leading-snug">
                  {task.order?.shippingAddress?.addressLine1 || ''} {task.order?.shippingAddress?.villageTaluk || 'Village Field'}, {task.order?.shippingAddress?.district || 'District'} {task.order?.shippingAddress?.pincode || ''}
                </p>
                {task.order?.shippingAddress?.phone && (
                  <a href={`tel:${task.order.shippingAddress.phone}`} className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:underline pt-1">
                    <Phone className="w-3.5 h-3.5" /> Call Farmer ({task.order.shippingAddress.phone})
                  </a>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openNavigation(task.order?.shippingAddress?.latitude, task.order?.shippingAddress?.longitude, `${task.order?.shippingAddress?.villageTaluk || ''} ${task.order?.shippingAddress?.district || ''}`)}
                  className="w-full mt-2 border-emerald-300 text-emerald-800 hover:bg-emerald-100 text-xs font-bold"
                  rightIcon={<NavIcon className="w-3.5 h-3.5" />}
                >
                  Navigate to Farmer
                </Button>
              </div>

              {/* Payment Summary */}
              {task.order?.netAmount && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                  <span className="font-bold text-slate-600">Order Amount:</span>
                  <span className="font-black text-slate-900 text-sm">₹{task.order.netAmount}</span>
                </div>
              )}
            </Card>
          </div>

          {/* Right Column: Workflow Actions & Progress */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Workflow Timeline */}
            <Card className="p-6 border-slate-200 space-y-4">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Truck className="w-4 h-4 text-purple-600" />
                Delivery Fulfillment Progress
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-bold">
                <div className={`p-3 rounded-xl border ${task.status === 'ASSIGNED' ? 'bg-purple-600 text-white border-purple-600' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                  1. Assigned
                </div>
                <div className={`p-3 rounded-xl border ${task.status === 'PICKED_UP' ? 'bg-purple-600 text-white border-purple-600' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                  2. Picked Up
                </div>
                <div className={`p-3 rounded-xl border ${task.status === 'OUT_FOR_DELIVERY' ? 'bg-purple-600 text-white border-purple-600' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                  3. Out for Delivery
                </div>
                <div className={`p-3 rounded-xl border ${task.status === 'DELIVERED' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                  4. Delivered
                </div>
              </div>
            </Card>

            {/* Operational Action Desk */}
            <Card className="p-6 border-slate-200 space-y-4">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-purple-600" />
                Delivery Action Desk
              </h2>

              {task.status === 'ASSIGNED' && (
                <div className="space-y-3">
                  <p className="text-xs text-slate-600">
                    Proceed to the dealer shop, inspect order items, and confirm pickup once loaded.
                  </p>
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => handleUpdateStatus('PICKED_UP')}
                    isLoading={updating}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold"
                    rightIcon={<Package className="w-4 h-4" />}
                  >
                    Confirm Dealer Pickup Completed
                  </Button>
                </div>
              )}

              {task.status === 'PICKED_UP' && (
                <div className="space-y-3">
                  <p className="text-xs text-slate-600">
                    Order has been picked up from dealer. Mark in-transit when departing towards farmer destination.
                  </p>
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
                </div>
              )}

              {(task.status === 'OUT_FOR_DELIVERY' || task.status === 'PICKED_UP') && (
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-3">
                    <h3 className="text-xs font-bold text-emerald-900 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      Farmer Handover & OTP Completion Verification
                    </h3>
                    <p className="text-xs text-emerald-800">
                      Request the 4-digit Delivery OTP sent to the farmer to complete order drop-off.
                    </p>

                    <div className="space-y-2">
                      <TextInput
                        label="Farmer Delivery OTP *"
                        type="text"
                        placeholder="Enter 4-digit OTP (e.g. 4829)"
                        value={deliveryOtp}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDeliveryOtp(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <TextInput
                        label="Delivery Notes (Optional)"
                        placeholder="Handed over directly to farmer"
                        value={statusNotes}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStatusNotes(e.target.value)}
                      />
                    </div>

                    <Button
                      variant="primary"
                      size="lg"
                      onClick={() => handleUpdateStatus('DELIVERED')}
                      isLoading={updating}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                      rightIcon={<CheckCircle2 className="w-4 h-4" />}
                    >
                      Verify OTP & Complete Delivery
                    </Button>
                  </div>
                </div>
              )}

              {task.status === 'DELIVERED' && (
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-center space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                  <h3 className="font-bold text-sm text-emerald-900">Delivery Fully Completed</h3>
                  <p className="text-xs text-emerald-700">
                    Delivered on {task.deliveredAt ? new Date(task.deliveredAt).toLocaleDateString() : 'Today'}. Payout has been recorded to your earnings account.
                  </p>
                </div>
              )}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
