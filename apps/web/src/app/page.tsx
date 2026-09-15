'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Tractor,
  Store,
  Microscope,
  Truck,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { API_BASE_URL } from '../config/api';

export default function LandingPage() {
  const { t } = useLanguage();
  const { user, getRoleDashboardPath } = useAuth();

  const [stats, setStats] = useState<{
    activeFarmers: number;
    activeDealers: number;
    certifiedExperts: number;
    approvedProducts: number;
    districtsCovered: number;
  } | null>(null);

  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/public/stats`);
        const data = await res.json();
        if (data.success) {
          setStats(data.data);
        }
      } catch (err) {
        console.error('Failed to load dynamic public stats:', err);
      } finally {
        setIsLoadingStats(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="space-y-16 py-2">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-green-950 text-white p-8 md:p-14 shadow-2xl border border-emerald-700">
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-40 top-0 w-72 h-72 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <Badge variant="harvest" size="md" className="shadow-md">
            <Sparkles className="w-3.5 h-3.5 mr-1" />
            INDIA'S MULTI-CHANNEL AGRICULTURAL PLATFORM
          </Badge>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight">
            EVERYTHING YOUR FARM NEEDS, IN ONE PLACE.
          </h1>

          <p className="text-emerald-100 text-lg sm:text-xl font-medium leading-relaxed max-w-2xl">
            FARM SEVA connects Indian farmers, verified local agri-dealers, certified agronomists, and last-mile delivery partners across one connected platform.
          </p>

          <div className="pt-4 flex flex-wrap gap-4 items-center">
            {user ? (
              <Link href={getRoleDashboardPath(user.role, user.status)}>
                <Button variant="harvest" size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
                  GO TO MY DASHBOARD ({user.role.replace(/_/g, ' ')})
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/farmer/register">
                  <Button variant="harvest" size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
                    Get Started as a Farmer
                  </Button>
                </Link>
                <Link href="/farmer/marketplace">
                  <Button variant="outline" size="lg" className="border-emerald-400 text-white hover:bg-emerald-800/60">
                    Explore Input Catalog
                  </Button>
                </Link>
              </>
            )}
          </div>

          <div className="pt-6 border-t border-emerald-700/60 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-semibold text-emerald-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
              <span>100% Genuine Verified Products</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Certified Agronomist Guidance</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
              <span>OTP Handover District Delivery</span>
            </div>
          </div>
        </div>
      </section>

      {/* Real Live Database Statistics Counter Bar */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <Card className="text-center p-6 bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3 text-2xl font-bold">
            🌾
          </div>
          <h3 className="text-3xl font-black text-slate-900">
            {isLoadingStats ? <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-600" /> : stats?.activeFarmers ?? 0}
          </h3>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Active Farmers</p>
        </Card>

        <Card className="text-center p-6 bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-3 text-2xl font-bold">
            🏪
          </div>
          <h3 className="text-3xl font-black text-slate-900">
            {isLoadingStats ? <RefreshCw className="w-6 h-6 animate-spin mx-auto text-amber-600" /> : stats?.activeDealers ?? 0}
          </h3>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Verified Agri Dealers</p>
        </Card>

        <Card className="text-center p-6 bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center mx-auto mb-3 text-2xl font-bold">
            🔬
          </div>
          <h3 className="text-3xl font-black text-slate-900">
            {isLoadingStats ? <RefreshCw className="w-6 h-6 animate-spin mx-auto text-sky-600" /> : stats?.certifiedExperts ?? 0}
          </h3>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Certified Experts</p>
        </Card>

        <Card className="text-center p-6 bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-3 text-2xl font-bold">
            📍
          </div>
          <h3 className="text-3xl font-black text-slate-900">
            {isLoadingStats ? <RefreshCw className="w-6 h-6 animate-spin mx-auto text-purple-600" /> : stats?.districtsCovered ?? 0}
          </h3>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Districts Covered</p>
        </Card>
      </section>

      {/* 4 Public Stakeholder Application Cards */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <Badge variant="success" size="md">ECOSYSTEM APPLICATIONS</Badge>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            CHOOSE YOUR FARM SEVA APPLICATION PORTAL
          </h2>
          <p className="text-sm font-medium text-slate-600">
            Specialized digital applications designed specifically for each participant in the agricultural supply chain.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* 1. FARMER APP CARD */}
          <Card hoverable className="flex flex-col justify-between p-6 border-t-4 border-t-emerald-600">
            <div className="space-y-4">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-800 rounded-2xl flex items-center justify-center shadow-sm">
                <Tractor className="w-8 h-8 text-emerald-700" />
              </div>
              <div>
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Customer App</span>
                <h3 className="text-xl font-black text-slate-900">FARM SEVA FARMER</h3>
              </div>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Buy genuine seeds & fertilizers, track sowings, get instant Gemini AI crop advice, and order delivery.
              </p>
            </div>

            <div className="pt-6 space-y-2">
              <Link href="/farmer/login" className="block w-full">
                <Button variant="harvest" size="md" className="w-full font-bold" rightIcon={<ChevronRight className="w-4 h-4" />}>
                  Farmer Login
                </Button>
              </Link>
              <Link href="/farmer/register" className="block w-full text-center text-xs font-bold text-emerald-700 hover:underline py-1">
                New Farmer Register
              </Link>
            </div>
          </Card>

          {/* 2. SELLER APP CARD */}
          <Card hoverable className="flex flex-col justify-between p-6 border-t-4 border-t-amber-500">
            <div className="space-y-4">
              <div className="w-14 h-14 bg-amber-100 text-amber-800 rounded-2xl flex items-center justify-center shadow-sm">
                <Store className="w-8 h-8 text-amber-700" />
              </div>
              <div>
                <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Agri Dealer App</span>
                <h3 className="text-xl font-black text-slate-900">FARM SEVA SELLER</h3>
              </div>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Register licensed retail shop, list inventory stock, receive local district farmer orders, and track payouts.
              </p>
            </div>

            <div className="pt-6 space-y-2">
              <Link href="/seller/login" className="block w-full">
                <Button variant="harvest" size="md" className="w-full font-bold bg-amber-600 hover:bg-amber-700 border-amber-700" rightIcon={<ChevronRight className="w-4 h-4" />}>
                  Seller Login
                </Button>
              </Link>
              <Link href="/seller/register" className="block w-full text-center text-xs font-bold text-amber-700 hover:underline py-1">
                Register Agri Shop
              </Link>
            </div>
          </Card>

          {/* 3. EXPERT APP CARD */}
          <Card hoverable className="flex flex-col justify-between p-6 border-t-4 border-t-sky-500">
            <div className="space-y-4">
              <div className="w-14 h-14 bg-sky-100 text-sky-800 rounded-2xl flex items-center justify-center shadow-sm">
                <Microscope className="w-8 h-8 text-sky-700" />
              </div>
              <div>
                <span className="text-xs font-bold text-sky-700 uppercase tracking-wider">Agronomist Workstation</span>
                <h3 className="text-xl font-black text-slate-900">FARM SEVA EXPERT</h3>
              </div>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Certified plant pathologists review crop leaf disease submissions and prescribe treatment guidance.
              </p>
            </div>

            <div className="pt-6 space-y-2">
              <Link href="/expert/login" className="block w-full">
                <Button variant="primary" size="md" className="w-full font-bold bg-sky-600 hover:bg-sky-700 border-sky-700" rightIcon={<ChevronRight className="w-4 h-4" />}>
                  Expert Login
                </Button>
              </Link>
              <Link href="/expert/register" className="block w-full text-center text-xs font-bold text-sky-700 hover:underline py-1">
                Register Expert Profile
              </Link>
            </div>
          </Card>

          {/* 4. DELIVERY APP CARD */}
          <Card hoverable className="flex flex-col justify-between p-6 border-t-4 border-t-purple-500">
            <div className="space-y-4">
              <div className="w-14 h-14 bg-purple-100 text-purple-800 rounded-2xl flex items-center justify-center shadow-sm">
                <Truck className="w-8 h-8 text-purple-700" />
              </div>
              <div>
                <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">Logistics App</span>
                <h3 className="text-xl font-black text-slate-900">FARM SEVA DELIVERY</h3>
              </div>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                District delivery drivers toggle online, navigate GPS routes, verify customer OTPs, and track earnings.
              </p>
            </div>

            <div className="pt-6 space-y-2">
              <Link href="/delivery/login" className="block w-full">
                <Button variant="primary" size="md" className="w-full font-bold bg-purple-700 hover:bg-purple-800 border-purple-800" rightIcon={<ChevronRight className="w-4 h-4" />}>
                  Delivery Driver Login
                </Button>
              </Link>
              <Link href="/delivery/register" className="block w-full text-center text-xs font-bold text-purple-700 hover:underline py-1">
                Register Driver Profile
              </Link>
            </div>
          </Card>

        </div>
      </section>
    </div>
  );
}
