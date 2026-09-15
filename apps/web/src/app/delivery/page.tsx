'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  Truck,
  MapPin,
  CheckCircle2,
  Package,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Power,
  Navigation,
  Clock,
  KeyRound,
  PhoneCall,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

// Dynamic import for Leaflet map component (SSR disabled)
const DeliveryMap = dynamic(() => import('../../components/delivery/DeliveryMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-72 bg-slate-900 rounded-2xl flex items-center justify-center text-xs font-bold text-slate-400">
      Loading Live Map...
    </div>
  ),
});

export default function DeliveryDashboard() {
  const { user, token } = useAuth();
  const { t } = useLanguage();

  const [isOnline, setIsOnline] = useState(false);
  const [locationStatus, setLocationStatus] = useState<'IDLE' | 'ACTIVE' | 'DENIED' | 'UNAVAILABLE'>('IDLE');
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number; accuracy?: number } | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const [activeDelivery, setActiveDelivery] = useState<any | null>(null);
  const [loadingDelivery, setLoadingDelivery] = useState(true);
  const [statusUpdating, setStatusUpdating] = useState(false);

  // OTP Verification Modal state
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [completedSuccess, setCompletedSuccess] = useState(false);

  const watchIdRef = useRef<number | null>(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://farmseva.onrender.com';

  // Fetch assigned deliveries on mount
  useEffect(() => {
    fetchAssignedDeliveries();
  }, [token]);

  const fetchAssignedDeliveries = async () => {
    if (!token) return;
    setLoadingDelivery(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/delivery/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        // Find active delivery (in transit, accepted, or arrived)
        const active = data.data.find(
          (d: any) => d.status === 'ASSIGNED' || d.status === 'ACCEPTED' || d.status === 'PICKED_UP' || d.status === 'IN_TRANSIT'
        );
        setActiveDelivery(active || (data.data.length > 0 ? data.data[0] : null));
      }
    } catch (err) {
      console.error('[DeliveryDashboard] Error fetching deliveries:', err);
    } finally {
      setLoadingDelivery(false);
    }
  };

  // Handle Online/Offline Status Toggle
  const toggleOnlineStatus = async () => {
    const nextState = !isOnline;

    if (nextState) {
      // Request HTML5 Location permission
      if (!('geolocation' in navigator)) {
        setLocationStatus('UNAVAILABLE');
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const accuracy = position.coords.accuracy;

          setCurrentCoords({ lat, lng, accuracy });
          setLocationStatus('ACTIVE');
          setLastUpdated(new Date().toLocaleTimeString());
          setIsOnline(true);

          // Sync online status & location to API
          await syncStatusToBackend(true, lat, lng);
          startLocationTracking();
        },
        (error) => {
          console.warn('Location permission denied or unavailable:', error);
          setLocationStatus('DENIED');
          setIsOnline(false);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      // Turn Offline
      setIsOnline(false);
      setLocationStatus('IDLE');
      stopLocationTracking();
      await syncStatusToBackend(false);
    }
  };

  const syncStatusToBackend = async (online: boolean, lat?: number, lng?: number) => {
    if (!token) return;
    try {
      await fetch(`${API_BASE_URL}/api/v1/delivery/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isAvailable: online, latitude: lat, longitude: lng }),
      });
    } catch (err) {
      console.error('Failed to sync delivery status:', err);
    }
  };

  const startLocationTracking = () => {
    if (watchIdRef.current !== null) return;
    if (!('geolocation' in navigator)) return;

    watchIdRef.current = navigator.geolocation.watchPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const accuracy = pos.coords.accuracy;

        setCurrentCoords({ lat, lng, accuracy });
        setLastUpdated(new Date().toLocaleTimeString());

        // Send periodic GPS location updates to server
        if (token) {
          fetch(`${API_BASE_URL}/api/v1/delivery/location`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              latitude: lat,
              longitude: lng,
              accuracy,
              deliveryId: activeDelivery?.id,
            }),
          }).catch((e) => console.warn('Location post failed:', e));
        }
      },
      (err) => console.warn('GPS Watch error:', err),
      { enableHighAccuracy: true, maximumAge: 15000 }
    );
  };

  const stopLocationTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  };

  // Handle Delivery Status Transitions (ACCEPT -> PICKED_UP -> IN_TRANSIT -> DELIVERED)
  const handleUpdateStatus = async (newStatus: string) => {
    if (!activeDelivery || !token) return;
    setStatusUpdating(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/delivery/orders/${activeDelivery.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (data.success) {
        await fetchAssignedDeliveries();
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setStatusUpdating(false);
    }
  };

  // Submit OTP Verification for Delivery Completion
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDelivery || !token || otpValue.length < 6) return;
    setOtpVerifying(true);
    setOtpError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/delivery/orders/${activeDelivery.id}/status`, {
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
          setOtpModalOpen(false);
          setCompletedSuccess(false);
          setOtpValue('');
          fetchAssignedDeliveries();
        }, 2000);
      }
    } catch (err) {
      setOtpError(t('delivery.networkError', 'Network error. Please try again.'));
    } finally {
      setOtpVerifying(false);
    }
  };

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('delivery.greetMorning', 'Good morning');
    if (hour < 17) return t('delivery.greetAfternoon', 'Good afternoon');
    return t('delivery.greetEvening', 'Good evening');
  };

  const defaultPartnerLat = currentCoords?.lat || 16.3067;
  const defaultPartnerLng = currentCoords?.lng || 80.4365;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Greeting Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              {t('delivery.districtLogistics', 'FARM SEVA Logistics Network')}
            </span>
            <h1 className="text-2xl md:text-4xl font-black tracking-tight text-white">
              {getTimeGreeting()}, {user?.fullName?.split(' ')[0]} 👋
            </h1>
            <p className="text-slate-300 text-xs md:text-sm font-medium">
              {t('delivery.readyPrompt', "Ready for today's deliveries?")} • District: Guntur
            </p>
          </div>

          {/* ONLINE / OFFLINE Control Switch */}
          <div className="shrink-0 bg-slate-950/80 p-4 rounded-2xl border border-slate-800 flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`} />
                <span className="font-black text-sm text-white">
                  {isOnline ? t('delivery.onlineStatus', '🟢 ONLINE') : t('delivery.offlineStatus', '⚫ OFFLINE')}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {isOnline
                  ? t('delivery.onlineDesc', 'Available for deliveries')
                  : t('delivery.offlineDesc', 'Currently unavailable')}
              </p>
            </div>

            <button
              onClick={toggleOnlineStatus}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs transition shadow-lg ${
                isOnline
                  ? 'bg-rose-600 hover:bg-rose-500 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              <Power className="w-4 h-4" />
              <span>{isOnline ? t('delivery.goOffline', 'Go Offline') : t('delivery.goOnline', 'Go Online')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Location Permission / GPS Status Notification Banner */}
      {locationStatus === 'DENIED' && (
        <div className="bg-amber-950/90 border border-amber-500/40 rounded-2xl p-4 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0" />
            <div>
              <h4 className="font-extrabold text-sm text-amber-200">
                {t('delivery.locAccessRequired', 'Location Access Required')}
              </h4>
              <p className="text-xs text-amber-300">
                {t('delivery.locPermissionDesc', 'FARM SEVA uses your GPS location to assign and track active deliveries.')}
              </p>
            </div>
          </div>
          <button
            onClick={toggleOnlineStatus}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-4 py-2 rounded-xl transition"
          >
            {t('delivery.allowLocation', 'Allow Location')}
          </button>
        </div>
      )}

      {/* Active GPS Status Bar */}
      {isOnline && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-400 animate-bounce" />
            <span className="font-bold text-white">{t('delivery.locActive', '📍 Location Active')}</span>
            {currentCoords?.accuracy && (
              <span className="text-slate-400 text-[11px] font-mono">
                (Accuracy ±{Math.round(currentCoords.accuracy)}m)
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-slate-400 text-[11px]">
            <span>Updated {lastUpdated || 'Just now'}</span>
            <button
              onClick={toggleOnlineStatus}
              className="hover:text-emerald-400 transition"
              title="Refresh GPS"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Spotlight: Active Delivery Card */}
      <Card padding="lg" className="bg-slate-900 border-slate-800 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-emerald-400" />
            <h3 className="font-black text-lg text-white">
              {t('delivery.currentAssignment', 'Current Active Delivery Assignment')}
            </h3>
          </div>
          {activeDelivery && (
            <Badge variant="info" size="sm" className="bg-emerald-950 text-emerald-400 border border-emerald-600/40">
              STATUS: {activeDelivery.status}
            </Badge>
          )}
        </div>

        {loadingDelivery ? (
          <div className="py-12 text-center text-slate-400 font-bold text-xs animate-pulse">
            Loading active delivery details...
          </div>
        ) : activeDelivery ? (
          <div className="space-y-6">
            {/* Delivery Metadata Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  🏪 {t('delivery.pickupLocation', 'Pickup Point (Seller / Shop)')}
                </span>
                <h4 className="font-black text-sm text-white">
                  {activeDelivery.order?.shop?.shopName || 'Agri Super Store'}
                </h4>
                <p className="text-xs text-slate-300">
                  {activeDelivery.order?.shop?.addressLine || 'Main Road, Bhuvanagiri, Guntur'}
                </p>
                {activeDelivery.order?.shop?.contactPhone && (
                  <a
                    href={`tel:${activeDelivery.order.shop.contactPhone}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 hover:underline pt-1"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Call Shop ({activeDelivery.order.shop.contactPhone})</span>
                  </a>
                )}
              </div>

              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  📍 {t('delivery.dropLocation', 'Delivery Point (Farmer / Customer)')}
                </span>
                <h4 className="font-black text-sm text-white">
                  {activeDelivery.order?.shippingAddress?.recipientName || 'Farmer Ramesh'}
                </h4>
                <p className="text-xs text-slate-300">
                  {activeDelivery.order?.shippingAddress?.houseNo},{' '}
                  {activeDelivery.order?.shippingAddress?.streetLandmark},{' '}
                  {activeDelivery.order?.shippingAddress?.villageTaluk},{' '}
                  {activeDelivery.order?.shippingAddress?.district}
                </p>
                <div className="flex items-center gap-3 pt-1">
                  <span className="text-xs font-extrabold text-amber-400">
                    💰 Earning: ₹{activeDelivery.earnings || 85}
                  </span>
                  <span className="text-xs font-bold text-slate-400">
                    • Distance: ~4.2 km
                  </span>
                </div>
              </div>
            </div>

            {/* Interactive Live GPS Leaflet Map */}
            <DeliveryMap
              partnerLat={defaultPartnerLat}
              partnerLng={defaultPartnerLng}
              pickupLat={activeDelivery.pickupLat ? Number(activeDelivery.pickupLat) : 16.312}
              pickupLng={activeDelivery.pickupLng ? Number(activeDelivery.pickupLng) : 80.441}
              pickupName={activeDelivery.order?.shop?.shopName}
              dropLat={activeDelivery.deliveryLat ? Number(activeDelivery.deliveryLat) : 16.325}
              dropLng={activeDelivery.deliveryLng ? Number(activeDelivery.deliveryLng) : 80.452}
              dropName={activeDelivery.order?.shippingAddress?.recipientName}
              activeStatus={activeDelivery.status}
            />

            {/* Priority Next Action Controls */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between flex-wrap gap-4">
              <div>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block">
                  {t('delivery.priorityNextAction', 'PRIORITY NEXT ACTION')}
                </span>
                <p className="text-xs text-slate-300 font-medium">
                  {activeDelivery.status === 'ASSIGNED' && t('delivery.actAccept', 'Accept job to initiate delivery navigation.')}
                  {activeDelivery.status === 'ACCEPTED' && t('delivery.actNavigatePickup', 'Navigate to shop pickup location.')}
                  {activeDelivery.status === 'PICKED_UP' && t('delivery.actNavigateCustomer', 'Navigate to farmer location.')}
                  {activeDelivery.status === 'IN_TRANSIT' && t('delivery.actArrived', 'Ask customer for 6-digit delivery OTP.')}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {activeDelivery.status === 'ASSIGNED' && (
                  <Button
                    onClick={() => handleUpdateStatus('ACCEPTED')}
                    disabled={statusUpdating}
                    variant="primary"
                    size="md"
                    className="bg-emerald-600 hover:bg-emerald-500 font-black text-xs"
                  >
                    {t('delivery.acceptDelivery', 'Accept Delivery')}
                  </Button>
                )}

                {activeDelivery.status === 'ACCEPTED' && (
                  <Button
                    onClick={() => handleUpdateStatus('PICKED_UP')}
                    disabled={statusUpdating}
                    variant="primary"
                    size="md"
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs"
                  >
                    {t('delivery.confirmPickup', 'Confirm Pickup')}
                  </Button>
                )}

                {activeDelivery.status === 'PICKED_UP' && (
                  <Button
                    onClick={() => handleUpdateStatus('IN_TRANSIT')}
                    disabled={statusUpdating}
                    variant="primary"
                    size="md"
                    className="bg-blue-600 hover:bg-blue-500 font-black text-xs"
                  >
                    {t('delivery.startTransit', 'Start Navigation to Customer')}
                  </Button>
                )}

                {activeDelivery.status === 'IN_TRANSIT' && (
                  <Button
                    onClick={() => setOtpModalOpen(true)}
                    variant="primary"
                    size="md"
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs"
                  >
                    <KeyRound className="w-4 h-4 mr-1.5" />
                    {t('delivery.verifyOtpBtn', 'Enter Delivery OTP')}
                  </Button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center space-y-3">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto text-3xl">
              🚚
            </div>
            <h4 className="font-extrabold text-sm text-slate-300">
              {t('delivery.noActiveAssignment', 'No active delivery assignments')}
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {t('delivery.stayOnlineHint', 'Stay online to receive eligible Last-Mile delivery jobs in your district.')}
            </p>
            <div className="pt-2">
              <Link href="/delivery/deliveries">
                <Button variant="outline" size="sm">
                  {t('delivery.viewQueue', 'View Deliveries Queue')}
                </Button>
              </Link>
            </div>
          </div>
        )}
      </Card>

      {/* OTP Verification Modal */}
      {otpModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-emerald-400" />
                <h3 className="font-black text-base text-white">
                  {t('delivery.otpVerification', 'Delivery OTP Verification')}
                </h3>
              </div>
              <button
                onClick={() => setOtpModalOpen(false)}
                className="text-slate-400 hover:text-white font-bold text-xs"
              >
                ✕
              </button>
            </div>

            {completedSuccess ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto animate-bounce" />
                <h3 className="font-black text-lg text-white">
                  🎉 {t('delivery.deliveryCompleted', 'DELIVERY COMPLETED!')}
                </h3>
                <p className="text-xs text-slate-300">
                  Delivery verified & signed off. Earning of ₹{activeDelivery?.earnings || 85} credited!
                </p>
              </div>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <p className="text-xs text-slate-300">
                  {t('delivery.askOtpPrompt', "Ask the farmer/customer for the 6-digit delivery OTP code.")}
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
                    onClick={() => setOtpModalOpen(false)}
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
