'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Tractor,
  ShoppingBag,
  Package,
  Stethoscope,
  MessageSquare,
  Bell,
  Home,
  User,
  PhoneCall,
  Sparkles,
  ChevronRight,
  Sun,
  CloudRain,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

import { API_BASE_URL } from '@/config/api';

export default function FarmerDashboard() {
  const { user, token, isLoading } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  const [farmsCount, setFarmsCount] = useState(0);
  const [cropsCount, setCropsCount] = useState(0);
  const [profileData, setProfileData] = useState<any>(null);
  const [fetchingData, setFetchingData] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      if (!user) router.push('/login');
      else if (user.status === 'SUSPENDED') router.push('/account-suspended');
      else if (user.role !== 'FARMER' && user.role !== 'ADMIN') router.push('/unauthorized');
      else loadDashboardStats();
    }
  }, [user, isLoading, token, router]);

  const loadDashboardStats = async () => {
    if (!token) return;
    setFetchingData(true);
    try {
      const [profileRes, farmsRes, cropsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/v1/farmer/profile`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/api/v1/farmer/farms`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/api/v1/farmer/crops`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const profileJson = await profileRes.json();
      const farmsJson = await farmsRes.json();
      const cropsJson = await cropsRes.json();

      if (profileJson.success) setProfileData(profileJson.data);
      if (farmsJson.success) setFarmsCount(farmsJson.data.length);
      if (cropsJson.success) setCropsCount(cropsJson.data.length);
    } catch (e) {
      console.error('Error fetching farmer dashboard stats:', e);
    }
    setFetchingData(false);
  };

  const calculateProfileCompletion = () => {
    if (!profileData) return 25;
    let score = 25;
    if (profileData.village && profileData.district && profileData.state) score += 25;
    if (farmsCount > 0) score += 25;
    if (cropsCount > 0) score += 25;
    return score;
  };

  if (isLoading || !user) {
    return <div className="p-8 text-center font-bold text-slate-500">Loading Farmer Workspace...</div>;
  }

  const completionPct = calculateProfileCompletion();

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2">
      {/* Farmer Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-green-900 text-white p-6 md:p-8 shadow-xl border border-emerald-700">
        <div className="flex items-center justify-between flex-wrap gap-4 relative z-10">
          <div className="space-y-2">
            <Badge variant="harvest" size="md">
              <Sparkles className="w-3.5 h-3.5 mr-1" /> FARMER DASHBOARD (రైతు ఖాతా)
            </Badge>
            <h1 className="text-2xl md:text-4xl font-black tracking-tight">
              Welcome back, {user.fullName}!
            </h1>
            <p className="text-emerald-100 text-xs md:text-sm font-medium">
              📱 {user.phone} • 📍 {profileData?.district || 'District Not Set'}, {profileData?.state || 'State Not Set'}
            </p>
          </div>
          
          <div className="w-16 h-16 bg-emerald-700/60 rounded-2xl flex items-center justify-center text-4xl shadow-inner border border-emerald-500/40 shrink-0">
            👨‍🌾
          </div>
        </div>
      </div>

      {/* Progressive Profile Completion Progress */}
      {completionPct < 100 && (
        <Card className="border border-amber-200 bg-amber-50/60 p-5 space-y-3">
          <div className="flex items-center justify-between text-xs font-black">
            <span className="text-amber-950 flex items-center gap-1.5">
              🚀 Progressive Profile Onboarding ({completionPct}% Complete)
            </span>
            <Link href="/farmer/profile" className="text-emerald-700 hover:underline">
              Complete Setup →
            </Link>
          </div>
          <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-amber-500 h-full transition-all duration-500 rounded-full"
              style={{ width: `${completionPct}%` }}
            />
          </div>
          <p className="text-xs text-slate-600 font-medium">
            Add your village, land farms, and sown crops to unlock customized disease diagnostic advisories.
          </p>
        </Card>
      )}

      {/* Weather & Season Context Widget */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-gradient-to-br from-sky-50 to-blue-50 border-sky-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-sky-500 text-white rounded-xl">
              <Sun className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold text-sky-800 uppercase tracking-wider">District Weather</span>
              <h4 className="text-lg font-black text-slate-900">32°C • Clear Sky</h4>
              <p className="text-xs text-slate-600 font-medium">Ideal conditions for crop spraying</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-600 text-white rounded-xl">
              <Tractor className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider">Active Season</span>
              <h4 className="text-lg font-black text-slate-900">Kharif Season</h4>
              <p className="text-xs text-slate-600 font-medium">{cropsCount} registered crop varieties</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500 text-slate-950 rounded-xl font-bold">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold text-amber-900 uppercase tracking-wider">Pest Watch Alert</span>
              <h4 className="text-lg font-black text-slate-900">Chilli Thrips Alert</h4>
              <p className="text-xs text-slate-600 font-medium">High humidity pest warning in district</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Farmer Feature Touch Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* 1. MY CROPS */}
        <Link href="/farmer/crops">
          <Card hoverable className="p-5 flex flex-col items-center text-center space-y-2 border-emerald-200">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center text-2xl shadow-sm">
              <Tractor className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-black text-slate-900">{t('myCrops')}</h3>
            <Badge variant="success" size="sm">
              {fetchingData ? '...' : `${cropsCount} Active`}
            </Badge>
          </Card>
        </Link>

        {/* 2. MARKETPLACE */}
        <Link href="/farmer/marketplace">
          <Card hoverable className="p-5 flex flex-col items-center text-center space-y-2 border-amber-200">
            <div className="w-14 h-14 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center text-2xl shadow-sm">
              <ShoppingBag className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-black text-slate-900">Shop Inputs</h3>
            <Badge variant="harvest" size="sm">Marketplace</Badge>
          </Card>
        </Link>

        {/* 3. MY ORDERS */}
        <Link href="/farmer/orders">
          <Card hoverable className="p-5 flex flex-col items-center text-center space-y-2 border-sky-200">
            <div className="w-14 h-14 bg-sky-100 text-sky-700 rounded-2xl flex items-center justify-center text-2xl shadow-sm">
              <Package className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-black text-slate-900">My Orders</h3>
            <Badge variant="info" size="sm">Track Delivery</Badge>
          </Card>
        </Link>

        {/* 4. CROP PROBLEM */}
        <Link href="/farmer/crop-problems">
          <Card hoverable className="p-5 flex flex-col items-center text-center space-y-2 border-rose-200">
            <div className="w-14 h-14 bg-rose-100 text-rose-700 rounded-2xl flex items-center justify-center text-2xl shadow-sm">
              <Stethoscope className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-black text-slate-900">Crop Problem</h3>
            <Badge variant="danger" size="sm">Report Pest</Badge>
          </Card>
        </Link>

        {/* 5. EXPERT SUPPORT */}
        <Link href="/farmer/consultations">
          <Card hoverable className="p-5 flex flex-col items-center text-center space-y-2 border-purple-200">
            <div className="w-14 h-14 bg-purple-100 text-purple-700 rounded-2xl flex items-center justify-center text-2xl shadow-sm">
              <MessageSquare className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-black text-slate-900">Expert Advisory</h3>
            <Badge variant="neutral" size="sm">Consult Chat</Badge>
          </Card>
        </Link>

        {/* 6. NOTIFICATIONS */}
        <Link href="/farmer/notifications">
          <Card hoverable className="p-5 flex flex-col items-center text-center space-y-2 border-slate-200">
            <div className="w-14 h-14 bg-slate-100 text-slate-700 rounded-2xl flex items-center justify-center text-2xl shadow-sm">
              <Bell className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-black text-slate-900">Alerts</h3>
            <Badge variant="neutral" size="sm">Inbox</Badge>
          </Card>
        </Link>

        {/* 7. MY FARMS */}
        <Link href="/farmer/farms">
          <Card hoverable className="p-5 flex flex-col items-center text-center space-y-2 border-teal-200">
            <div className="w-14 h-14 bg-teal-100 text-teal-700 rounded-2xl flex items-center justify-center text-2xl shadow-sm">
              <Home className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-black text-slate-900">{t('myFarm')}</h3>
            <Badge variant="success" size="sm">
              {fetchingData ? '...' : `${farmsCount} Units`}
            </Badge>
          </Card>
        </Link>

        {/* 8. PROFILE */}
        <Link href="/farmer/profile">
          <Card hoverable className="p-5 flex flex-col items-center text-center space-y-2 border-slate-200">
            <div className="w-14 h-14 bg-slate-100 text-slate-700 rounded-2xl flex items-center justify-center text-2xl shadow-sm">
              <User className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-black text-slate-900">{t('myProfile')}</h3>
            <Badge variant="neutral" size="sm">Settings</Badge>
          </Card>
        </Link>
      </div>

      {/* Toll-Free Call Support Banner */}
      <Card padding="md" className="bg-amber-500 text-emerald-950 border-amber-400">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="space-y-1">
            <h4 className="font-black text-lg flex items-center gap-2">
              <PhoneCall className="w-5 h-5" /> Need Assistance? Call Toll-Free!
            </h4>
            <p className="text-xs font-semibold text-emerald-950/90">
              Call-Center Agents assist farmers to register crops, report pest issues, and place input orders over phone calls.
            </p>
          </div>
          <a
            href="tel:180032767382"
            className="bg-emerald-950 hover:bg-emerald-900 text-amber-300 px-6 py-3 rounded-2xl font-black text-sm shadow transition"
          >
            1800-FARM-SEVA
          </a>
        </div>
      </Card>
    </div>
  );
}
