'use client';

import React, { useState, useEffect } from 'react';
import {
  User,
  Truck,
  MapPin,
  ShieldCheck,
  Globe,
  HelpCircle,
  LogOut,
  CheckCircle2,
  AlertCircle,
  FileText,
  Send,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import LanguageSelector from '../../../components/LanguageSelector';

export default function DeliveryProfilePage() {
  const { user, token, logout } = useAuth();
  const { t } = useLanguage();

  const [profileData, setProfileData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Support Ticket Modal state
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [category, setCategory] = useState('WRONG_ADDRESS');
  const [description, setDescription] = useState('');
  const [submittingSupport, setSubmittingSupport] = useState(false);
  const [supportSuccess, setSupportSuccess] = useState(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://farmseva.onrender.com';

  useEffect(() => {
    fetchProfile();
  }, [token]);

  const fetchProfile = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/delivery/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setProfileData(data.data);
      }
    } catch (err) {
      console.error('Error fetching delivery profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !description.trim()) return;
    setSubmittingSupport(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/delivery/support`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ category, description }),
      });
      const data = await res.json();
      if (data.success) {
        setSupportSuccess(true);
        setTimeout(() => {
          setSupportSuccess(false);
          setSupportModalOpen(false);
          setDescription('');
        }, 2000);
      }
    } catch (err) {
      console.error('Failed to submit support ticket:', err);
    } finally {
      setSubmittingSupport(false);
    }
  };

  const vehicleType = profileData?.vehicleType || 'Motorcycle / Bike';
  const vehicleNumber = profileData?.vehicleNumber || 'AP 07 AB 1234';
  const activeDistrict = profileData?.activeDistrict || 'Guntur';
  const kycStatus = profileData?.user?.kycStatus || 'VERIFIED';

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <User className="w-6 h-6 text-emerald-400" />
          {t('delivery.profileTitle', 'Delivery Partner Profile & Settings')}
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          {t('delivery.profileSub', 'Manage vehicle details, active district, operational support, and language preferences.')}
        </p>
      </div>

      {/* Profile Card */}
      <Card padding="lg" className="bg-slate-900 border-slate-800 space-y-6">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center text-3xl font-black text-white shadow-lg shrink-0">
            🚚
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white">{user?.fullName}</h2>
              <Badge variant="success" size="sm">
                <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                {kycStatus}
              </Badge>
            </div>
            <p className="text-xs text-slate-300 font-medium">
              📱 {user?.phone} • ✉️ {user?.email || 'partner@farmseva.com'}
            </p>
          </div>
        </div>

        {/* Logistics Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
              🛵 VEHICLE TYPE
            </span>
            <span className="font-extrabold text-sm text-white">{vehicleType}</span>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
              🔢 VEHICLE NUMBER
            </span>
            <span className="font-mono font-black text-sm text-emerald-400">{vehicleNumber}</span>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
              📍 SERVICE DISTRICT
            </span>
            <span className="font-extrabold text-sm text-white">{activeDistrict}</span>
          </div>
        </div>
      </Card>

      {/* Settings & Preferences */}
      <Card padding="lg" className="bg-slate-900 border-slate-800 space-y-6">
        <h3 className="font-black text-base text-white border-b border-slate-800 pb-3 flex items-center gap-2">
          <Globe className="w-4 h-4 text-emerald-400" />
          {t('delivery.settingsTitle', 'App Preferences & Language')}
        </h3>

        <div className="space-y-4">
          {/* Language Selector */}
          <div className="flex items-center justify-between flex-wrap gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <div>
              <h4 className="font-bold text-sm text-white">
                {t('delivery.preferredLanguage', 'Preferred App Language')}
              </h4>
              <p className="text-xs text-slate-400">
                Choose your native language across all 8 supported Indian languages.
              </p>
            </div>
            <LanguageSelector variant="compact" />
          </div>

          {/* Operational Support Trigger */}
          <div className="flex items-center justify-between flex-wrap gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <div>
              <h4 className="font-bold text-sm text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                {t('delivery.needHelpTitle', 'Need Operational Support?')}
              </h4>
              <p className="text-xs text-slate-400">
                Report customer unavailable, wrong address, package issues, or payment problems.
              </p>
            </div>
            <Button
              onClick={() => setSupportModalOpen(true)}
              variant="outline"
              size="sm"
              className="border-amber-500/40 text-amber-400 hover:bg-amber-950 font-bold"
            >
              Contact Logistics Support
            </Button>
          </div>

          {/* Logout */}
          <div className="pt-2">
            <Button
              onClick={logout}
              variant="secondary"
              size="md"
              className="w-full bg-rose-600/80 hover:bg-rose-600 text-white font-black text-xs"
            >
              <LogOut className="w-4 h-4 mr-2" />
              {t('navbar.logout', 'Log Out of Logistics Console')}
            </Button>
          </div>
        </div>
      </Card>

      {/* Operational Support Ticket Modal */}
      {supportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-black text-base text-white flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-amber-400" />
                Logistics Support Ticket
              </h3>
              <button
                onClick={() => setSupportModalOpen(false)}
                className="text-slate-400 hover:text-white font-bold text-xs"
              >
                ✕
              </button>
            </div>

            {supportSuccess ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h4 className="font-bold text-sm text-white">Support Ticket Submitted!</h4>
                <p className="text-xs text-slate-300">Logistics dispatch agent will review immediately.</p>
              </div>
            ) : (
              <form onSubmit={handleSupportSubmit} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300 block">Issue Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium"
                  >
                    <option value="CUSTOMER_UNAVAILABLE">Customer Unavailable</option>
                    <option value="SELLER_UNAVAILABLE">Seller / Shop Unavailable</option>
                    <option value="WRONG_ADDRESS">Wrong Address / Unreachable Location</option>
                    <option value="PACKAGE_DAMAGE">Package Damaged or Item Discrepancy</option>
                    <option value="VEHICLE_BREAKDOWN">Vehicle Problem / Breakdown</option>
                    <option value="EARNING_ISSUE">Payment / Earning Settlement Problem</option>
                    <option value="OTHER">Other Issue</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300 block">Issue Description</label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide details about the issue..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setSupportModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={submittingSupport || !description.trim()}
                    className="bg-emerald-600 hover:bg-emerald-500 font-black"
                  >
                    {submittingSupport ? 'Submitting...' : 'Submit Ticket'}
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
