'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';

import { API_BASE_URL } from '@/config/api';

export default function FarmerProfilePage() {
  const { user, token, isLoading, setUser } = useAuth();
  const { t, setLocale } = useLanguage();
  const router = useRouter();

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  // Profile Edit State
  const [fullName, setFullName] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('en');
  const [village, setVillage] = useState('');
  const [district, setDistrict] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [totalLandAcres, setTotalLandAcres] = useState('');
  const [primaryWaterSource, setPrimaryWaterSource] = useState('');

  // Notification Preferences State
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [whatsappEnabled, setWhatsappEnabled] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [inAppEnabled, setInAppEnabled] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      if (!user) router.push('/login');
      else {
        loadProfile();
        loadPreferences();
      }
    }
  }, [user, isLoading, token, router]);

  const loadPreferences = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/notifications/preferences`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && data.data) {
        setSmsEnabled(data.data.smsEnabled ?? true);
        setWhatsappEnabled(data.data.whatsappEnabled ?? true);
        setPushEnabled(data.data.pushEnabled ?? true);
        setInAppEnabled(data.data.inAppEnabled ?? true);
      }
    } catch (e) {
      console.error('Failed to load notification preferences:', e);
    }
  };

  const loadProfile = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/farmer/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setProfile(data.data);
        setFullName(data.data.user?.fullName || '');
        setPreferredLanguage(data.data.user?.preferredLanguage || 'en');
        setVillage(data.data.village || '');
        setDistrict(data.data.district || '');
        setState(data.data.state || '');
        setPincode(data.data.pincode || '');
        setExperienceYears(data.data.experienceYears?.toString() || '');
        setTotalLandAcres(data.data.totalLandAcres?.toString() || '');
        setPrimaryWaterSource(data.data.primaryWaterSource || 'Borewell');
      }
    } catch (e) {
      console.error('Failed to load profile:', e);
    }
    setLoading(false);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg('');
    setSaving(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/farmer/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName,
          preferredLanguage,
          village: village || undefined,
          district: district || undefined,
          state: state || undefined,
          pincode: pincode || undefined,
          experienceYears: experienceYears ? parseInt(experienceYears, 10) : undefined,
          totalLandAcres: totalLandAcres ? parseFloat(totalLandAcres) : undefined,
          primaryWaterSource: primaryWaterSource || undefined,
        }),
      });

      // Also update notification preferences
      await fetch(`${API_BASE_URL}/api/v1/notifications/preferences`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          smsEnabled,
          whatsappEnabled,
          pushEnabled,
          inAppEnabled,
          language: preferredLanguage,
        }),
      });

      const data = await res.json();
      setSaving(false);

      if (data.success) {
        setMsg('Profile & notification preferences updated successfully!');
        setLocale(preferredLanguage as any);
        if (user) {
          setUser({ ...user, fullName, preferredLanguage });
        }
        loadProfile();
      } else {
        setMsg(`⚠️ ${data.error?.message || 'Failed to update profile'}`);
      }
    } catch (e) {
      setSaving(false);
      setMsg('⚠️ Network error updating profile');
    }
  };

  if (isLoading || loading) return <div className="p-8 text-center font-bold">Loading Profile...</div>;

  return (
    <div className="max-w-2xl mx-auto py-4 space-y-6">
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl border border-emerald-100 space-y-6">
        <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-3xl font-bold">
            👤
          </div>
          <div>
            <h1 className="text-2xl font-black text-emerald-950">{fullName}</h1>
            <p className="text-xs font-semibold text-gray-500">
              Mobile: <strong>{user?.phone}</strong> • Role: <strong>FARMER</strong>
            </p>
          </div>
        </div>

        {msg && (
          <div className={`p-4 rounded-2xl text-xs font-bold ${msg.startsWith('⚠️') ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-800'}`}>
            {msg}
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-gray-700 mb-1">Full Name *</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl border-2 border-gray-200 font-bold"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-extrabold text-gray-700 mb-1">Preferred Language</label>
              <select
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl border-2 border-gray-200 font-bold bg-white"
              >
                <option value="en">English</option>
                <option value="te">తెలుగు (Telugu)</option>
                <option value="kn">ಕನ್ನಡ (Kannada)</option>
                <option value="hi">हिन्दी (Hindi)</option>
                <option value="ta">தமிழ் (Tamil)</option>
                <option value="mr">मराठी (Marathi)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-extrabold text-gray-700 mb-1">Village / Town</label>
              <input
                type="text"
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                placeholder="e.g. Kaza"
                className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-extrabold text-gray-700 mb-1">District</label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="e.g. Guntur"
                className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-extrabold text-gray-700 mb-1">State</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="e.g. Andhra Pradesh"
                className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-extrabold text-gray-700 mb-1">Farming Experience (Years)</label>
              <input
                type="number"
                value={experienceYears}
                onChange={(e) => setExperienceYears(e.target.value)}
                placeholder="e.g. 15"
                className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-extrabold text-gray-700 mb-1">Total Land (Acres)</label>
              <input
                type="number"
                step="0.5"
                value={totalLandAcres}
                onChange={(e) => setTotalLandAcres(e.target.value)}
                placeholder="e.g. 5.5"
                className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-extrabold text-gray-700 mb-1">Water Source</label>
              <select
                value={primaryWaterSource}
                onChange={(e) => setPrimaryWaterSource(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 font-bold bg-white"
              >
                <option value="Borewell">Borewell</option>
                <option value="Canal">Canal</option>
                <option value="Rainfed">Rainfed</option>
                <option value="River / Pond">River / Pond</option>
              </select>
            </div>
          </div>

          {/* Multi-Channel Notification Preferences Section */}
          <div className="pt-4 border-t border-gray-100 space-y-3">
            <h3 className="text-sm font-black text-emerald-950 flex items-center gap-1.5">
              📡 Multi-Channel Alert Preferences
            </h3>
            <p className="text-xs text-gray-500 font-medium">
              Choose how you wish to receive urgent order updates, delivery status, and crop advisories.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <label className="flex items-center gap-2 p-3 rounded-xl border border-gray-200 bg-gray-50/50 cursor-pointer font-bold text-xs text-gray-800">
                <input
                  type="checkbox"
                  checked={smsEnabled}
                  onChange={(e) => setSmsEnabled(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                📱 SMS Alerts
              </label>
              <label className="flex items-center gap-2 p-3 rounded-xl border border-gray-200 bg-gray-50/50 cursor-pointer font-bold text-xs text-gray-800">
                <input
                  type="checkbox"
                  checked={whatsappEnabled}
                  onChange={(e) => setWhatsappEnabled(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                💬 WhatsApp Messages
              </label>
              <label className="flex items-center gap-2 p-3 rounded-xl border border-gray-200 bg-gray-50/50 cursor-pointer font-bold text-xs text-gray-800">
                <input
                  type="checkbox"
                  checked={pushEnabled}
                  onChange={(e) => setPushEnabled(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                🔔 Push Notifications
              </label>
              <label className="flex items-center gap-2 p-3 rounded-xl border border-gray-200 bg-gray-50/50 cursor-pointer font-bold text-xs text-gray-800">
                <input
                  type="checkbox"
                  checked={inAppEnabled}
                  onChange={(e) => setInAppEnabled(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                📥 In-App Inbox
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base py-3.5 rounded-xl shadow transition mt-4"
          >
            {saving ? 'Saving Profile...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
