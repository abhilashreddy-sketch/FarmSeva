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
  Toast,
} from '@farm-seva/shared-ui';
import { Truck, UserCheck, RefreshCw, Send, MapPin, CheckCircle2 } from 'lucide-react';
import { apiFetch, getAuthToken } from '../../lib/api-client';

interface DeliveryOrder {
  id: string;
  orderNumber: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  farmerUser?: {
    fullName: string;
    phone: string;
  };
  sellerProfile?: {
    businessName?: string;
  };
  deliveryAssignment?: {
    id: string;
    status: string;
    deliveryPartnerId?: string;
    deliveryPartnerUser?: {
      fullName: string;
      phone: string;
    };
  };
}

interface DeliveryPartner {
  id: string;
  phone: string;
  fullName: string;
  deliveryProfile?: {
    id: string;
    vehicleType?: string;
    vehicleNumber?: string;
    status?: string;
  };
}

export default function AdminDeliveriesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [partners, setPartners] = useState<DeliveryPartner[]>([]);

  // Assignment Modal
  const [selectedOrder, setSelectedOrder] = useState<DeliveryOrder | null>(null);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>('');
  const [assigning, setAssigning] = useState(false);

  const [toast, setToast] = useState<{ title: string; message: string; type: 'success' | 'error' } | null>(null);

  const fetchData = async () => {
    const token = getAuthToken();
    if (!token) {
      router.push('/login');
      return;
    }

    setLoading(true);
    setError(null);

    const [ordersRes, partnersRes] = await Promise.all([
      apiFetch<DeliveryOrder[]>('/api/v1/orders/admin/orders'),
      apiFetch<DeliveryPartner[]>('/api/v1/admin/users?role=DELIVERY_PARTNER'),
    ]);

    if (ordersRes.success && Array.isArray(ordersRes.data)) {
      setOrders(ordersRes.data);
    } else {
      setError(ordersRes.error || 'Failed to fetch platform dispatch orders');
    }

    if (partnersRes.success && Array.isArray(partnersRes.data)) {
      setPartners(partnersRes.data);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssignPartner = async () => {
    if (!selectedOrder || !selectedPartnerId) return;
    setAssigning(true);

    const deliveryId = selectedOrder.deliveryAssignment?.id || selectedOrder.id;

    const res = await apiFetch(`/api/v1/admin/deliveries/${deliveryId}/assign`, {
      method: 'POST',
      body: JSON.stringify({ deliveryPartnerId: selectedPartnerId }),
    });

    if (res.success) {
      setToast({
        title: 'Delivery Partner Assigned',
        message: `Assigned partner to order #${selectedOrder.orderNumber || selectedOrder.id.slice(0, 8)}`,
        type: 'success',
      });
      setSelectedOrder(null);
      setSelectedPartnerId('');
      fetchData();
    } else {
      setToast({
        title: 'Assignment Failed',
        message: res.error || 'Failed to assign delivery partner',
        type: 'error',
      });
    }

    setAssigning(false);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {toast && (
        <Toast
          title={toast.title}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Truck className="w-6 h-6 text-purple-600" />
            Delivery Dispatch Control Desk
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Assign logistics partners to accepted orders and monitor active shipment tracking.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchData}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Refresh Dispatch Desk
        </Button>
      </div>

      {loading ? (
        <CardSkeleton />
      ) : error ? (
        <ErrorState title="Dispatch Desk Unavailable" message={error} onRetry={fetchData} />
      ) : orders.length === 0 ? (
        <EmptyState
          title="No Active Orders for Dispatch"
          description="There are currently no platform orders pending logistics assignment."
          icon={<Truck className="w-8 h-8 text-slate-400" />}
        />
      ) : (
        <Card className="overflow-hidden border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Order No</th>
                  <th className="px-4 py-3">Buyer / Seller</th>
                  <th className="px-4 py-3">Order Status</th>
                  <th className="px-4 py-3">Assigned Logistics Partner</th>
                  <th className="px-4 py-3 text-right">Dispatch Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {orders.map((order) => {
                  const assignedUser = order.deliveryAssignment?.deliveryPartnerUser;
                  return (
                    <tr key={order.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-4 py-3 font-mono font-bold text-slate-900">
                        <div>#{order.orderNumber || order.id.slice(0, 8)}</div>
                        <div className="text-[10px] text-slate-400 font-normal">
                          ₹{order.totalAmount.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{order.farmerUser?.fullName || 'Farmer'}</div>
                        <div className="text-[10px] text-slate-500">From: {order.sellerProfile?.businessName || 'Agri Seller'}</div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          status={
                            order.status === 'DELIVERED'
                              ? 'success'
                              : order.status === 'CANCELLED'
                              ? 'cancelled'
                              : 'warning'
                          }
                        >
                          {order.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        {assignedUser ? (
                          <div>
                            <div className="font-semibold text-purple-900 flex items-center gap-1">
                              <UserCheck className="w-3.5 h-3.5 text-purple-600" />
                              {assignedUser.fullName}
                            </div>
                            <div className="text-[10px] text-slate-400">{assignedUser.phone}</div>
                          </div>
                        ) : (
                          <span className="text-amber-600 font-medium italic">Unassigned</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setSelectedOrder(order);
                            setSelectedPartnerId(order.deliveryAssignment?.deliveryPartnerId || '');
                          }}
                          leftIcon={<Send className="w-3 h-3" />}
                        >
                          {assignedUser ? 'Reassign Partner' : 'Assign Partner'}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Assignment Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Truck className="w-5 h-5 text-purple-600" />
              Assign Logistics Delivery Partner
            </h3>
            <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl space-y-1">
              <div><span className="font-semibold text-slate-800">Order Ref:</span> #{selectedOrder.orderNumber || selectedOrder.id.slice(0, 8)}</div>
              <div><span className="font-semibold text-slate-800">Buyer:</span> {selectedOrder.farmerUser?.fullName}</div>
              <div><span className="font-semibold text-slate-800">Pickup Seller:</span> {selectedOrder.sellerProfile?.businessName}</div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Select Active Delivery Partner</label>
              <select
                value={selectedPartnerId}
                onChange={(e) => setSelectedPartnerId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
              >
                <option value="">-- Choose Partner from Fleet --</option>
                {partners.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.fullName} ({p.phone}) - {p.deliveryProfile?.vehicleType || 'Vehicle'}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(null)}>
                Cancel
              </Button>
              <Button
                size="sm"
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold"
                onClick={handleAssignPartner}
                disabled={assigning || !selectedPartnerId}
              >
                {assigning ? 'Dispatching...' : 'Confirm Assignment'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
