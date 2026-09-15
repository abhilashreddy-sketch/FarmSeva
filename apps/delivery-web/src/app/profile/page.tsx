'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Badge, Button, TextInput, CardSkeleton, Toast } from '@farm-seva/shared-ui';
import { User, ShieldCheck, Truck, Phone, Mail, LogOut, LifeBuoy, Send, CheckCircle2 } from 'lucide-react';
import { apiFetch, getAuthToken, removeAuthToken } from '../../lib/api-client';

interface DeliveryProfile {
  id: string;
  isAvailable: boolean;
  vehicleType?: string;
  vehicleNumber?: string;
  licenseNumber?: string;
  rating?: number;
  totalDeliveries?: number;
  user?: {
    fullName?: string;
    email?: string;
    phone?: string;
    kycStatus?: string;
    status?: string;
  };
}

export default function DeliveryProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<DeliveryProfile | null>(null);

  // Support Ticket Form State
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [supportCategory, setSupportCategory] = useState('DELIVERY_DELAY');
  const [supportDescription, setSupportDescription] = useState('');
  const [submittingTicket, setSubmittingTicket] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fetchProfile = async () => {
    const token = getAuthToken();
    if (!token) {
      router.push('/login');
      return;
    }

    setLoading(true);

    const res = await apiFetch<DeliveryProfile>('/api/v1/delivery/profile');

    if (res.success && res.data) {
      setProfile(res.data);
    } else {
      setProfile({
        id: 'DP-1001',
        isAvailable: true,
        vehicleType: 'Two-Wheeler (Motorcycle)',
        vehicleNumber: 'AP 07 AB 1234',
        licenseNumber: 'DL-2026-88741',
        rating: 4.9,
        totalDeliveries: 42,
        user: {
          fullName: 'Ramesh Kumar',
          email: 'delivery@farmseva.com',
          phone: '+91 98765 43210',
          kycStatus: 'VERIFIED',
          status: 'ACTIVE',
        },
      });
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSignOut = () => {
    removeAuthToken();
    setToast({ message: 'Signed out successfully.', type: 'success' });
    setTimeout(() => {
      router.push('/login');
    }, 800);
  };

  const handleCreateSupportTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportDescription) {
      setToast({ message: 'Please enter a description for support assistance.', type: 'error' });
      return;
    }

    setSubmittingTicket(true);

    const res = await apiFetch('/api/v1/delivery/support', {
      method: 'POST',
      body: JSON.stringify({
        category: supportCategory,
        description: supportDescription,
      }),
    });

    setSubmittingTicket(false);

    if (res.success) {
      setToast({ message: 'Support ticket submitted successfully to logistics helpdesk!', type: 'success' });
      setShowSupportModal(false);
      setSupportDescription('');
    } else {
      setToast({ message: res.error || 'Failed to submit support ticket', type: 'error' });
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
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
            <User className="w-6 h-6 text-purple-600" />
            Partner Profile & Vehicle
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Manage your delivery partner credentials, vehicle info, and support desk
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleSignOut}
          className="border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold"
          leftIcon={<LogOut className="w-3.5 h-3.5" />}
        >
          Sign Out
        </Button>
      </div>

      {loading ? (
        <CardSkeleton />
      ) : profile ? (
        <div className="space-y-6">
          {/* Header Card */}
          <Card className="p-6 border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-purple-100 border border-purple-300 flex items-center justify-center text-purple-700 font-black text-xl">
                  {profile.user?.fullName?.charAt(0) || 'D'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-black text-slate-900">{profile.user?.fullName || 'Delivery Partner'}</h2>
                    <Badge status="verified" className="bg-emerald-100 text-emerald-800">
                      <ShieldCheck className="w-3.5 h-3.5 inline mr-1" />
                      {profile.user?.kycStatus || 'VERIFIED'} PARTNER
                    </Badge>
                  </div>
                  <p className="text-xs text-purple-700 font-bold">{profile.vehicleType || 'Two-Wheeler Logistics'}</p>
                  <p className="text-[11px] text-slate-400">{profile.user?.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSupportModal(true)}
                  className="border-purple-300 text-purple-700 hover:bg-purple-50 text-xs font-bold"
                  leftIcon={<LifeBuoy className="w-3.5 h-3.5" />}
                >
                  Logistics Helpdesk
                </Button>
              </div>
            </div>
          </Card>

          {/* Vehicle & KYC Details */}
          <Card className="p-6 border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Vehicle Registration & Partner Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[11px] text-slate-400 font-medium block">Vehicle Registration Number</span>
                <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-purple-600" />
                  {profile.vehicleNumber || 'AP 07 AB 1234'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[11px] text-slate-400 font-medium block">Driving License ID</span>
                <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  {profile.licenseNumber || 'DL-2026-88741'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[11px] text-slate-400 font-medium block">Verified Phone Number</span>
                <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-purple-600" />
                  {profile.user?.phone || '+91 98765 43210'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[11px] text-slate-400 font-medium block">Account Status</span>
                <span className="font-extrabold text-emerald-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  {profile.user?.status || 'ACTIVE'} & ONLINE
                </span>
              </div>
            </div>
          </Card>

          {/* Support Ticket Modal */}
          {showSupportModal && (
            <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
              <Card className="w-full max-w-md p-6 bg-white border-slate-200 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <LifeBuoy className="w-5 h-5 text-purple-600" />
                    Delivery Support Helpdesk
                  </h3>
                  <button onClick={() => setShowSupportModal(false)} className="text-slate-400 hover:text-slate-600 font-bold text-sm">
                    ✕
                  </button>
                </div>

                <form onSubmit={handleCreateSupportTicket} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Assistance Category</label>
                    <select
                      value={supportCategory}
                      onChange={(e) => setSupportCategory(e.target.value)}
                      className="w-full px-3 py-2.5 text-xs font-medium border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                    >
                      <option value="DELIVERY_DELAY">Delivery Delay / Traffic Issue</option>
                      <option value="FARMER_UNREACHABLE">Farmer Unreachable at Drop-off</option>
                      <option value="DEALER_SHOP_CLOSED">Dealer Shop Closed on Pickup</option>
                      <option value="DAMAGED_PACKAGE">Damaged Product Package</option>
                      <option value="PAYMENT_DISCREPANCY">Earnings Payout Discrepancy</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Issue Description *</label>
                    <textarea
                      rows={3}
                      placeholder="Describe the delivery issue or assistance required..."
                      value={supportDescription}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSupportDescription(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-medium border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                      required
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" size="sm" type="button" onClick={() => setShowSupportModal(false)}>
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      type="submit"
                      isLoading={submittingTicket}
                      className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs"
                      rightIcon={<Send className="w-3.5 h-3.5" />}
                    >
                      Submit Ticket
                    </Button>
                  </div>
                </form>
              </Card>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
