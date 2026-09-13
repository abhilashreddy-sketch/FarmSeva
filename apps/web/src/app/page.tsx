'use client';

import React from 'react';
import Link from 'next/link';
import {
  Tractor,
  Store,
  Microscope,
  Truck,
  PhoneCall,
  ShieldCheck,
  Award,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Users,
  CheckCircle2,
  Leaf,
  ShoppingBag,
  Clock
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

export default function LandingPage() {
  const { t } = useLanguage();
  const { user, getRoleDashboardPath } = useAuth();

  return (
    <div className="space-y-16 py-2">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-green-950 text-white p-8 md:p-14 shadow-2xl border border-emerald-700">
        {/* Background Decorative Elements */}
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-40 top-0 w-72 h-72 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <Badge variant="harvest" size="md" className="shadow-md">
            <Sparkles className="w-3.5 h-3.5 mr-1" />
            INDIA'S MULTI-CHANNEL AGRICULTURAL PLATFORM
          </Badge>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight">
            FARM SEVA
          </h1>

          <p className="text-emerald-100 text-lg sm:text-xl font-medium leading-relaxed max-w-2xl">
            India's Multi-Channel Agricultural Marketplace & Crop Support Platform connecting farmers, local agri-dealers, certified agronomists, and district delivery partners.
          </p>

          {/* Action CTAs */}
          <div className="pt-4 flex flex-wrap gap-4 items-center">
            {user ? (
              <Link href={getRoleDashboardPath(user.role, user.status)}>
                <Button variant="harvest" size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
                  GO TO MY DASHBOARD ({user.role.replace(/_/g, ' ')})
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/register">
                  <Button variant="harvest" size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
                    Get Started Free
                  </Button>
                </Link>
                <Link href="/farmer/marketplace">
                  <Button variant="outline" size="lg" className="border-emerald-400 text-white hover:bg-emerald-800/60">
                    Explore Marketplace
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Trust Highlights under CTA */}
          <div className="pt-6 border-t border-emerald-700/60 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-semibold text-emerald-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
              <span>100% Genuine Products</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Certified Pathologists</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
              <span>District OTP Delivery</span>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Statistics Counter Bar */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <Card className="text-center p-6 bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3 text-2xl font-bold">
            🌾
          </div>
          <h3 className="text-3xl font-black text-slate-900">10,000+</h3>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Active Farmers</p>
        </Card>

        <Card className="text-center p-6 bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-3 text-2xl font-bold">
            🏪
          </div>
          <h3 className="text-3xl font-black text-slate-900">500+</h3>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Agri Dealers</p>
        </Card>

        <Card className="text-center p-6 bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center mx-auto mb-3 text-2xl font-bold">
            🔬
          </div>
          <h3 className="text-3xl font-black text-slate-900">150+</h3>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Certified Experts</p>
        </Card>

        <Card className="text-center p-6 bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-3 text-2xl font-bold">
            📍
          </div>
          <h3 className="text-3xl font-black text-slate-900">25+</h3>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Districts Covered</p>
        </Card>
      </section>

      {/* Premium Role Selection Cards Section */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <Badge variant="success" size="md">STAKEHOLDER PORTALS</Badge>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            CHOOSE YOUR ROLE ON FARM SEVA
          </h2>
          <p className="text-sm font-medium text-slate-600">
            Tailored digital interfaces designed for every participant in the agricultural ecosystem.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* 1. FARMER CARD */}
          <Card hoverable className="flex flex-col justify-between p-6 border-t-4 border-t-emerald-600">
            <div className="space-y-4">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-800 rounded-2xl flex items-center justify-center text-3xl shadow-sm">
                <Tractor className="w-8 h-8 text-emerald-700" />
              </div>
              <div>
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Farmer Portal</span>
                <h3 className="text-xl font-black text-slate-900">FARMER (किसान / రైతు)</h3>
              </div>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Manage your crops, report disease symptoms for expert diagnostic guidance, and buy genuine inputs.
              </p>
              
              <ul className="space-y-2 text-xs text-slate-700 font-semibold pt-2 border-t border-slate-100">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Free Crop Disease Diagnosis</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Verified Seeds & Fertilisers</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Farm-Gate Delivery Confirmation</span>
                </li>
              </ul>
            </div>

            <div className="pt-6">
              <Link href="/register?role=FARMER" className="block w-full">
                <Button variant="primary" size="md" className="w-full" rightIcon={<ChevronRight className="w-4 h-4" />}>
                  Register as Farmer
                </Button>
              </Link>
            </div>
          </Card>

          {/* 2. AGRI DEALER / SELLER CARD */}
          <Card hoverable className="flex flex-col justify-between p-6 border-t-4 border-t-amber-500">
            <div className="space-y-4">
              <div className="w-14 h-14 bg-amber-100 text-amber-800 rounded-2xl flex items-center justify-center text-3xl shadow-sm">
                <Store className="w-8 h-8 text-amber-700" />
              </div>
              <div>
                <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Seller Portal</span>
                <h3 className="text-xl font-black text-slate-900">AGRI DEALER / SELLER</h3>
              </div>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Register your licensed retail shop, manage inventory stock, and receive orders from local district farmers.
              </p>

              <ul className="space-y-2 text-xs text-slate-700 font-semibold pt-2 border-t border-slate-100">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Direct District Farmer Reach</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Automated Stock Management</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Guaranteed Seller Settlements</span>
                </li>
              </ul>
            </div>

            <div className="pt-6">
              <Link href="/register?role=SELLER" className="block w-full">
                <Button variant="harvest" size="md" className="w-full" rightIcon={<ChevronRight className="w-4 h-4" />}>
                  Register Agri Shop
                </Button>
              </Link>
            </div>
          </Card>

          {/* 3. CROP EXPERT CARD */}
          <Card hoverable className="flex flex-col justify-between p-6 border-t-4 border-t-sky-500">
            <div className="space-y-4">
              <div className="w-14 h-14 bg-sky-100 text-sky-800 rounded-2xl flex items-center justify-center text-3xl shadow-sm">
                <Microscope className="w-8 h-8 text-sky-700" />
              </div>
              <div>
                <span className="text-xs font-bold text-sky-700 uppercase tracking-wider">Expert Desk</span>
                <h3 className="text-xl font-black text-slate-900">CROP EXPERT</h3>
              </div>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Certified agronomists and plant pathologists review crop disease photos and prescribe formal guidance.
              </p>

              <ul className="space-y-2 text-xs text-slate-700 font-semibold pt-2 border-t border-slate-100">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                  <span>Certified Advisory Network</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                  <span>Private Clinical Diagnostics</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                  <span>Farmer Guidance Issuance</span>
                </li>
              </ul>
            </div>

            <div className="pt-6">
              <Link href="/register?role=EXPERT" className="block w-full">
                <Button variant="secondary" size="md" className="w-full bg-sky-100 text-sky-900 hover:bg-sky-200" rightIcon={<ChevronRight className="w-4 h-4" />}>
                  Join as Expert
                </Button>
              </Link>
            </div>
          </Card>

          {/* 4. DELIVERY PARTNER CARD */}
          <Card hoverable className="flex flex-col justify-between p-6 border-t-4 border-t-purple-500">
            <div className="space-y-4">
              <div className="w-14 h-14 bg-purple-100 text-purple-800 rounded-2xl flex items-center justify-center text-3xl shadow-sm">
                <Truck className="w-8 h-8 text-purple-700" />
              </div>
              <div>
                <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">Logistics Network</span>
                <h3 className="text-xl font-black text-slate-900">DELIVERY PARTNER</h3>
              </div>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Deliver agricultural inputs directly from retail shops to farmer fields with 6-digit OTP confirmation.
              </p>

              <ul className="space-y-2 text-xs text-slate-700 font-semibold pt-2 border-t border-slate-100">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                  <span>Optimized District Routes</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                  <span>6-Digit Drop OTP Security</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                  <span>Per-Delivery Payouts</span>
                </li>
              </ul>
            </div>

            <div className="pt-6">
              <Link href="/register?role=DELIVERY" className="block w-full">
                <Button variant="secondary" size="md" className="w-full bg-purple-100 text-purple-900 hover:bg-purple-200" rightIcon={<ChevronRight className="w-4 h-4" />}>
                  Register Delivery
                </Button>
              </Link>
            </div>
          </Card>

        </div>
      </section>

      {/* How FARM SEVA Works Step-by-Step */}
      <section className="bg-slate-900 text-white rounded-3xl p-8 md:p-12 space-y-8 shadow-xl">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <Badge variant="harvest" size="md">SIMPLE 4-STEP PROCESS</Badge>
          <h2 className="text-2xl md:text-3xl font-black text-white">How FARM SEVA Works</h2>
          <p className="text-sm text-slate-400">Seamless integration from crop symptom detection to door-step product delivery.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 space-y-3 relative">
            <span className="w-8 h-8 bg-emerald-500 text-slate-950 font-black rounded-xl flex items-center justify-center text-sm shadow">1</span>
            <h4 className="font-extrabold text-lg text-white">Register & Add Crop</h4>
            <p className="text-xs text-slate-400 leading-relaxed">Farmer adds farm location, language preference, and active crops (Chilli, Paddy, Cotton).</p>
          </div>

          <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 space-y-3 relative">
            <span className="w-8 h-8 bg-amber-400 text-slate-950 font-black rounded-xl flex items-center justify-center text-sm shadow">2</span>
            <h4 className="font-extrabold text-lg text-white">Report & Get Advice</h4>
            <p className="text-xs text-slate-400 leading-relaxed">Upload symptom photos. Assigned expert conducts clinical diagnosis & sends guidance.</p>
          </div>

          <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 space-y-3 relative">
            <span className="w-8 h-8 bg-sky-400 text-slate-950 font-black rounded-xl flex items-center justify-center text-sm shadow">3</span>
            <h4 className="font-extrabold text-lg text-white">Order Genuine Inputs</h4>
            <p className="text-xs text-slate-400 leading-relaxed">Buy recommended products from verified local dealers via Cash-on-Delivery or Online.</p>
          </div>

          <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 space-y-3 relative">
            <span className="w-8 h-8 bg-purple-400 text-slate-950 font-black rounded-xl flex items-center justify-center text-sm shadow">4</span>
            <h4 className="font-extrabold text-lg text-white">Farm-Gate Delivery</h4>
            <p className="text-xs text-slate-400 leading-relaxed">Delivery partner delivers order to farm. Secure release via 6-digit OTP code.</p>
          </div>
        </div>
      </section>

      {/* Toll-Free Helpline Call Banner */}
      <section className="bg-gradient-to-r from-amber-500 to-amber-400 p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border-2 border-amber-300">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-emerald-950 text-amber-400 rounded-2xl flex items-center justify-center text-3xl shadow-lg shrink-0">
            <PhoneCall className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <Badge variant="success" size="sm" className="bg-emerald-950 text-amber-300 border-none font-bold">
              24/7 VOICE ASSISTANCE
            </Badge>
            <h3 className="font-black text-xl md:text-2xl text-emerald-950">
              No Smartphone or Internet? Call Our Toll-Free Helpline!
            </h3>
            <p className="text-xs md:text-sm text-emerald-900 font-semibold max-w-xl">
              Call-Center Agents assist farmers over phone calls to register farms, report pest issues, and place input orders.
            </p>
          </div>
        </div>
        <a
          href="tel:180032767382"
          className="bg-emerald-950 hover:bg-emerald-900 text-amber-300 font-black text-base px-8 py-4 rounded-2xl shadow-xl transition transform hover:-translate-y-0.5 whitespace-nowrap shrink-0 border border-amber-400/30"
        >
          📞 1800-FARM-SEVA (1800-3276-7382)
        </a>
      </section>
    </div>
  );
}
