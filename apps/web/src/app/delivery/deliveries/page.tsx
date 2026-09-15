'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Package,
  Truck,
  MapPin,
  Store,
  Navigation,
  CheckCircle2,
  KeyRound,
  PhoneCall,
  Clock,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';

type DeliveryTab = 'ALL' | 'NEW' | 'ACCEPTED' | 'PICKUP' | 'IN_TRANSIT' | 'COMPLETED';

export default function DeliveriesConsolePage() {
  const { token } = useAuth();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState<DeliveryTab>('ALL');
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);

  // OTP Modal State
  const [otpModalDelivery, setOtpModalDelivery] = useState<any | null>(null);
  const [otpValue, setOtpValue] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [completedSuccess, setCompletedSuccess] = useState(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://farmseva.onrender.com';

  useEffect(() => {
    fetchDeliveries();
  }, [token]);

  const fetchDeliveries = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/delivery/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setDeliveries(data.data);
      }
    } catch (err) {
      console.error('Error fetching deliveries queue:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (deliveryId: string, targetStatus: string) => {
    if (!token) return;
    setStatusUpdating(deliveryId);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/delivery/orders/${deliveryId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: targetStatus }),
      });

      const data = await res.json();
      if (data.success) {
        await fetchDeliveries();
      }
    } catch (err) {
      console.error('Status update failed:', err);
    } finally {
      setStatusUpdating(null);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpModalDelivery || !token || otpValue.length < 6) return;
    setOtpVerifying(true);
    setOtpError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/delivery/orders/${otpModalDelivery.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'DELIVERED', deliveryOtp: otpValue }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setOtpError(data.error?.message || t('delivery.invalidOtp', 'Invalid delivery OTP entered. Please check with customer.'));
      } else {
        setCompletedSuccess(true);
        setTimeout(() => {
          setOtpModalDelivery(null);
          setCompletedSuccess(false);
          setOtpValue('');
          fetchDeliveries();
        }, 2000);
      }
    } catch (err) {
      setOtpError(t('delivery.networkError', 'Network error. Please try again.'));
    } finally {
      setOtpVerifying(false);
    }
  };

  const filterDeliveries = () => {
    if (activeTab === 'ALL') return deliveries;
    if (activeTab === 'NEW') return deliveries.filter((d) => d.status === 'ASSIGNED');
    if (activeTab === 'ACCEPTED') return deliveries.filter((d) => d.status === 'ACCEPTED');
    if (activeTab === 'PICKUP') return deliveries.filter((d) => d.status === 'PICKED_UP');
    if (activeTab === 'IN_TRANSIT') return deliveries.filter((d) => d.status === 'IN_TRANSIT');
    if (activeTab === 'COMPLETED') return deliveries.filter((d) => d.status === 'DELIVERED');
    return deliveries;
  };

  const filtered = filterDeliveries();

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Package className="w-6 h-6 text-emerald-400" />
            {t('delivery.queueTitle', 'Deliveries Management Console')}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {t('delivery.queueSub', 'Manage pickup confirmation, navigate to farmer fields, and execute OTP verified drop-offs.')}
          </p>
        </div>

        <button
          onClick={fetchDeliveries}
          className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300 px-3.5 py-2 rounded-xl transition shrink-0"
        >
          🔄 Refresh Queue
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        {[
          { key: 'ALL', label: t('delivery.tabAll', 'ALL') },
          { key: 'NEW', label: t('delivery.tabNew', 'NEW') },
          { key: 'ACCEPTED', label: t('delivery.tabAccepted', 'ACCEPTED') },
          { key: 'PICKUP', label: t('delivery.tabPickup', 'PICKUP') },
          { key: 'IN_TRANSIT', label: t('delivery.tabInTransit', 'IN TRANSIT') },
          { key: 'COMPLETED', label: t('delivery.tabCompleted', 'COMPLETED') },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as DeliveryTab)}
            className={`px-4 py-2 rounded-xl text-xs font-black transition shrink-0 ${
              activeTab === tab.key
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Deliveries List */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 font-bold text-xs animate-pulse">
          Loading assigned deliveries queue...
        </div>
      ) : filtered.length > 0 ? (
        <div className="space-y-4">
          {filtered.map((del) => {
            const isAssigned = del.status === 'ASSIGNED';
            const isAccepted = del.status === 'ACCEPTED';
            const isPickedUp = del.status === 'PICKED_UP';
            const isInTransit = del.status === 'IN_TRANSIT';
            const isDelivered = del.status === 'DELIVERED';

            const storeName = del.order?.shop?.shopName || 'Agri Super Store';
            const storePhone = del.order?.shop?.contactPhone;
            const storeAddress = del.order?.shop?.addressLine || 'Main Market, Bhuvanagiri';

            const recipientName = del.order?.shippingAddress?.recipientName || 'Farmer Ramesh';
            const recipientAddress = del.order?.shippingAddress
              ? `${del.order.shippingAddress.houseNo}, ${del.order.shippingAddress.streetLandmark}, ${del.order.shippingAddress.villageTaluk}`
              : 'Main Village, Guntur';

            const earningAmount = del.earnings || 85;

            return (
              <Card key={del.id} padding="md" className="bg-slate-900 border-slate-800 space-y-4">
                {/* Header Row */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-xs text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded-lg border border-emerald-800/40">
                      ORDER #{del.order?.orderNumber || del.id.substring(0, 8).toUpperCase()}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      Assigned: {new Date(del.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant={isDelivered ? 'success' : 'info'} size="sm">
                      {del.status}
                    </Badge>
                    <span className="text-xs font-black text-amber-400 bg-amber-950/60 px-2.5 py-1 rounded-lg border border-amber-800/40">
                      💰 ₹{earningAmount}
                    </span>
                  </div>
                </div>

                {/* Locations Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Pickup */}
                  <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">
                      🏪 PICKUP FROM
                    </span>
                    <h4 className="font-black text-white">{storeName}</h4>
                    <p className="text-slate-300">{storeAddress}</p>
                    {storePhone && (
                      <a href={`tel:${storePhone}`} className="inline-flex items-center gap-1 text-emerald-400 font-bold hover:underline pt-1">
                        <PhoneCall className="w-3 h-3" />
                        <span>{storePhone}</span>
                      </a>
                    )}
                  </div>

                  {/* Drop */}
                  <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block">
                      📍 DELIVER TO
                    </span>
                    <h4 className="font-black text-white">{recipientName}</h4>
                    <p className="text-slate-300">{recipientAddress}</p>
                    <span className="text-[11px] text-slate-400 block pt-0.5">• Distance: ~4.2 km</span>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="flex items-center justify-between border-t border-slate-800 pt-3 flex-wrap gap-2">
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${del.pickupLat || 16.312},${del.pickupLng || 80.441}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-xl transition"
                  >
                    <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Google Nav</span>
                  </a>

                  <div className="flex items-center gap-2">
                    {isAssigned && (
                      <Button
                        onClick={() => handleUpdateStatus(del.id, 'ACCEPTED')}
                        disabled={statusUpdating === del.id}
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-500 font-black text-xs"
                      >
                        Accept Delivery
                      </Button>
                    )}

                    {isAccepted && (
                      <Button
                        onClick={() => handleUpdateStatus(del.id, 'PICKED_UP')}
                        disabled={statusUpdating === del.id}
                        size="sm"
                        className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs"
                      >
                        Confirm Pickup
                      </Button>
                    )}

                    {isPickedUp && (
                      <Button
                        onClick={() => handleUpdateStatus(del.id, 'IN_TRANSIT')}
                        disabled={statusUpdating === del.id}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-500 font-black text-xs"
                      >
                        Start Transit to Customer
                      </Button>
                    )}

                    {isInTransit && (
                      <Button
                        onClick={() => setOtpModalDelivery(del)}
                        size="sm"
                        className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs"
                      >
                        <KeyRound className="w-3.5 h-3.5 mr-1" />
                        Enter Delivery OTP
                      </Button>
                    )}

                    {isDelivered && (
                      <span className="inline-flex items-center gap-1 text-xs font-extrabold text-emerald-400">
                        <CheckCircle2 className="w-4 h-4" />
                        Completed & Settled
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card padding="lg" className="bg-slate-900 border-slate-800 text-center py-16 space-y-3">
          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto text-3xl">
            📦
          </div>
          <h4 className="font-black text-sm text-slate-300">
            {t('delivery.noDeliveriesInTab', 'No deliveries match this filter')}
          </h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {t('delivery.tabEmptyDesc', 'Stay online to receive new assigned deliveries in your active district.')}
          </p>
        </Card>
      )}

      {/* OTP Verification Modal */}
      {otpModalDelivery && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-emerald-400" />
                <h3 className="font-black text-base text-white">
                  Delivery OTP Verification
                </h3>
              </div>
              <button
                onClick={() => setOtpModalDelivery(null)}
                className="text-slate-400 hover:text-white font-bold text-xs"
              >
                ✕
              </button>
            </div>

            {completedSuccess ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto animate-bounce" />
                <h3 className="font-black text-lg text-white">
                  🎉 DELIVERY COMPLETED!
                </h3>
                <p className="text-xs text-slate-300">
                  Order verified. Earning of ₹{otpModalDelivery?.earnings || 85} credited!
                </p>
              </div>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <p className="text-xs text-slate-300">
                  Ask customer for 6-digit OTP code to confirm receipt of Order #{otpModalDelivery?.order?.orderNumber || 'FS-1000'}.
                </p>

                <div className="space-y-1">
                  <input
                    type="text"
                    maxLength={6}
                    value={otpValue}
                    onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 6-digit OTP"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-center text-2xl font-mono tracking-widest text-emerald-400 focus:outline-none focus:border-emerald-500"
                    autoFocus
                  />
                  {otpError && <p className="text-xs font-bold text-rose-400 pt-1">{otpError}</p>}
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setOtpModalDelivery(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={otpValue.length < 6 || otpVerifying}
                    className="bg-emerald-600 hover:bg-emerald-500 font-black"
                  >
                    {otpVerifying ? 'Verifying OTP...' : 'Submit & Complete'}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
