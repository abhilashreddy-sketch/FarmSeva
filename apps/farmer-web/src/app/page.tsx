'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Sprout,
  ShoppingBag,
  Stethoscope,
  Truck,
  ShieldCheck,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  Camera,
  FileText,
  MapPin,
  ChevronRight,
  Menu,
  X,
  Lock,
  Search,
  Globe,
  Activity,
  BadgeCheck,
  Zap,
  Award,
  ScanLine,
  Leaf,
  Clock,
  HeartHandshake,
  Sliders,
  Check,
  Tag,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { apiFetch } from '../lib/api-client';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
}

interface Product {
  id: string;
  title: string;
  brand?: string;
  description?: string;
  price: number;
  mrp?: number;
  stock?: number;
  unit?: string;
  packageSize?: string;
  imageUrl?: string;
  category?: {
    name: string;
    slug: string;
  };
  seller?: {
    businessName: string;
    city?: string;
  };
}

export default function FarmerPublicLandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  
  // Interactive Crop Doctor Simulator state
  const [activeCropCase, setActiveCropCase] = useState<number>(0);
  
  // Interactive My Farm Hierarchy state
  const [activeFarmStage, setActiveFarmStage] = useState<number>(1);

  // Fetch real categories and products from FARM SEVA REST API
  useEffect(() => {
    let isMounted = true;
    async function loadMarketplaceData() {
      try {
        setIsLoadingProducts(true);
        const [catRes, prodRes] = await Promise.all([
          apiFetch<Category[]>('/api/v1/marketplace/categories'),
          apiFetch<Product[]>('/api/v1/marketplace/products?limit=8'),
        ]);

        if (isMounted) {
          if (catRes.success && Array.isArray(catRes.data)) {
            setCategories(catRes.data);
          }
          if (prodRes.success && Array.isArray(prodRes.data)) {
            setProducts(prodRes.data);
          }
        }
      } catch (err) {
        console.error('Failed to load marketplace data:', err);
      } finally {
        if (isMounted) {
          setIsLoadingProducts(false);
        }
      }
    }

    loadMarketplaceData();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(p => p.category?.slug === selectedCategory || p.category?.name.toLowerCase() === selectedCategory.toLowerCase());

  // Crop Doctor Simulation Scenarios
  const cropDoctorCases = [
    {
      crop: 'Paddy (Rice)',
      stage: 'Tillering Phase',
      photoLabel: 'Leaf Lesion Sample #P-104',
      symptom: 'Spindle-shaped elliptical lesions with grayish centers & brown margins',
      detectedIssue: 'Rice Blast (Magnaporthe oryzae)',
      confidence: 94,
      severity: 'Moderate',
      treatment: 'Apply systemic tricyclazole spray @ 120g/acre; maintain optimal field drainage.',
      expertAction: 'Escalate to Plant Pathologist Dr. S. K. Narayana for confirmation',
    },
    {
      crop: 'Cotton',
      stage: 'Boll Formation',
      photoLabel: 'Boll Surface Sample #C-208',
      symptom: 'Flared squares with small entrance boreholes and dark granular excreta',
      detectedIssue: 'Pink Bollworm (Pectinophora gossypiella)',
      confidence: 91,
      severity: 'High Alert',
      treatment: 'Deploy pheromone traps (5/acre); apply approved bio-pesticide or spinosad formulation.',
      expertAction: 'Direct case escalation to Regional Cotton Extension Center',
    },
    {
      crop: 'Tomato',
      stage: 'Vegetative Flowering',
      photoLabel: 'Foliage Sample #T-089',
      symptom: 'Target-like concentric rings on lower leaves with yellow halo',
      detectedIssue: 'Early Blight (Alternaria solani)',
      confidence: 96,
      severity: 'Manageable',
      treatment: 'Remove infected bottom leaves; spray copper oxychloride or bio-fungicide preventative.',
      expertAction: 'University Agronomist verified advisory available on farmer timeline',
    },
  ];

  // My Farm Multi-Tier Model
  const farmHierarchyLevels = [
    {
      step: '01',
      title: 'Farmer Profile',
      scope: 'Ravi Kumar • Telangana',
      desc: 'Centralized farmer identity with verified landholdings, Aadhaar KYC & mobile authentication.',
      badge: 'Verified Farmer ID: FS-FMR-9842',
    },
    {
      step: '02',
      title: 'Registered Farm',
      scope: 'Sri Lakshmi Farm • 14.5 Acres',
      desc: 'Geo-referenced parcel with borewell irrigation, black alluvial soil, and seasonal rainfall log.',
      badge: 'Borewell & Canal Irrigated',
    },
    {
      step: '03',
      title: 'Field Subdivision',
      scope: 'North Plot (Field A) • 4.2 Acres',
      desc: 'Granular field parcel mapped for precise resource allocation and micro-irrigation management.',
      badge: 'Clay Loam • pH 7.2',
    },
    {
      step: '04',
      title: 'Active Crop Batch',
      scope: 'Paddy (BPT-5204 Samba Masuri)',
      desc: 'Sown July 15 • Expected Harvest Nov 20 • Stage: Active Panicle Initiation.',
      badge: 'Day 64 of 135',
    },
    {
      step: '05',
      title: 'Current Needs',
      scope: 'Top-dressing Nitrogen & Potassium',
      desc: 'Soil moisture telemetry suggests 45mm deficit; nutrient uptake peak expected in next 7 days.',
      badge: 'Irrigation & Fertilizer Scheduled',
    },
    {
      step: '06',
      title: 'Recommended Action',
      scope: 'Apply 35kg MOP / Acre + Bio-Potash',
      desc: 'Actionable prescription linked directly to verified local input dealers for door-step dispatch.',
      badge: 'One-Click Sourcing Ready',
    },
  ];

  return (
    <div className="min-h-screen bg-[#fafaf9] text-stone-900 flex flex-col font-sans selection:bg-emerald-600 selection:text-white overflow-x-hidden">

      {/* ========================================================================= */}
      {/* 1. STICKY EDITORIAL NAVIGATION                                           */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-50 bg-[#063828]/95 backdrop-blur-md border-b border-emerald-800/50 text-white shadow-md transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18 sm:h-20 gap-4">
            
            {/* Brand Logo */}
            <Link href="/" className="flex items-center gap-3 shrink-0 group focus:outline-none">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 text-emerald-950 flex items-center justify-center font-black text-xl shadow-md group-hover:scale-105 transition-transform">
                <Sprout className="w-6 h-6 text-emerald-950" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-black text-xl sm:text-2xl tracking-tight text-white group-hover:text-amber-300 transition-colors">
                    FARM SEVA
                  </span>
                  <span className="hidden lg:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-800/80 text-emerald-200 border border-emerald-600/50">
                    AgriTech
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-emerald-200/90 uppercase tracking-widest hidden sm:block">
                  Smart Farming • Trusted Marketplace
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-xs lg:text-sm font-semibold text-emerald-100/90">
              <a href="#hero" className="hover:text-amber-300 transition-colors py-2">Home</a>
              <a href="#my-farm" className="hover:text-amber-300 transition-colors py-2">My Farm</a>
              <a href="#crop-doctor" className="hover:text-amber-300 transition-colors py-2">Crop Doctor</a>
              <a href="#experts" className="hover:text-amber-300 transition-colors py-2">Experts</a>
              <a href="#marketplace" className="hover:text-amber-300 transition-colors py-2">Marketplace</a>
              <Link href="/orders" className="hover:text-amber-300 transition-colors py-2">Orders</Link>
            </nav>

            {/* Auth Action CTAs */}
            <div className="hidden sm:flex items-center gap-3 shrink-0">
              <Link
                href="/login"
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white hover:bg-emerald-800/70 border border-emerald-600/60 transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/register"
                className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-amber-400 hover:bg-amber-300 text-emerald-950 shadow-sm transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                Get Started
              </Link>
            </div>

            {/* Mobile Drawer Trigger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 rounded-xl bg-emerald-800/80 text-white hover:bg-emerald-700 transition"
              aria-label="Open Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Slide Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#063828] border-b border-emerald-700 px-5 pt-3 pb-8 space-y-4 animate-fadeIn">
            <nav className="flex flex-col space-y-2 text-sm font-bold text-white">
              <a
                href="#hero"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 border-b border-emerald-800/80 flex items-center justify-between"
              >
                <span>Home</span>
                <ChevronRight className="w-4 h-4 text-emerald-400" />
              </a>
              <a
                href="#my-farm"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 border-b border-emerald-800/80 flex items-center justify-between"
              >
                <span>My Farm</span>
                <ChevronRight className="w-4 h-4 text-emerald-400" />
              </a>
              <a
                href="#crop-doctor"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 border-b border-emerald-800/80 flex items-center justify-between"
              >
                <span>Crop Doctor</span>
                <ChevronRight className="w-4 h-4 text-emerald-400" />
              </a>
              <a
                href="#experts"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 border-b border-emerald-800/80 flex items-center justify-between"
              >
                <span>Agricultural Experts</span>
                <ChevronRight className="w-4 h-4 text-emerald-400" />
              </a>
              <a
                href="#marketplace"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 border-b border-emerald-800/80 flex items-center justify-between"
              >
                <span>Marketplace</span>
                <ChevronRight className="w-4 h-4 text-emerald-400" />
              </a>
              <Link
                href="/orders"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 border-b border-emerald-800/80 flex items-center justify-between"
              >
                <span>Track Orders</span>
                <ChevronRight className="w-4 h-4 text-emerald-400" />
              </Link>
            </nav>

            <div className="pt-2 grid grid-cols-2 gap-3">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-3 rounded-xl bg-emerald-800 text-white font-bold text-xs"
              >
                Log In
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-3 rounded-xl bg-amber-400 text-emerald-950 font-black text-xs shadow"
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ========================================================================= */}
      {/* 2. FULL-SCREEN HERO SECTION                                              */}
      {/* ========================================================================= */}
      <section id="hero" className="relative overflow-hidden bg-gradient-to-b from-[#063828] via-[#064e3b] to-[#04241a] text-white pt-16 sm:pt-20 pb-24 sm:pb-32 px-4 sm:px-6 lg:px-8">
        {/* Subtle Agricultural Grid & Mesh Overlay */}
        <div className="absolute inset-0 bg-mesh-dark opacity-80 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(rgba(16,185,129,0.12)_1px,transparent_1px)] [background-size:32px_32px] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Hero Left Content */}
            <div className="lg:col-span-7 space-y-7 text-center lg:text-left">
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-emerald-900/80 border border-emerald-500/40 text-amber-300 text-xs font-bold tracking-wider uppercase shadow-inner">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Next-Gen Agricultural Intelligence</span>
              </div>

              <h1 className="text-4xl sm:text-6xl xl:text-7xl font-black tracking-tight leading-[1.08] text-white">
                Everything Your Farm Needs.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-200 to-emerald-300">
                  One Intelligent Platform.
                </span>
              </h1>

              <p className="text-emerald-100/85 text-base sm:text-xl font-normal leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Manage your farm, understand crop problems, connect with agricultural experts and purchase trusted agricultural inputs through FARM SEVA.
              </p>

              <div className="pt-3 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  href="/register"
                  className="px-8 py-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-base shadow-lg shadow-amber-400/20 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-3 group"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <a
                  href="#marketplace"
                  className="px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-base border border-emerald-400/30 backdrop-blur-sm transition-all flex items-center justify-center gap-2"
                >
                  <span>Explore Marketplace</span>
                  <ShoppingBag className="w-5 h-5 text-emerald-300" />
                </a>
              </div>

              {/* 5 Core Pillars Badge Row */}
              <div className="pt-6 border-t border-emerald-800/80 grid grid-cols-2 sm:grid-cols-5 gap-3 text-center sm:text-left">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-semibold text-emerald-200">Farm Lifecycle</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-semibold text-emerald-200">AI Crop Doctor</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-semibold text-emerald-200">Agronomists</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-semibold text-emerald-200">Marketplace</span>
                </div>
                <div className="flex items-center gap-2 col-span-2 sm:col-span-1 justify-center sm:justify-start">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-semibold text-emerald-200">OTP Delivery</span>
                </div>
              </div>
            </div>

            {/* Hero Right Composition: Modern AgriTech Multi-Card Suite */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none space-y-4">

                {/* Card 1: My Farm Real-Time Monitor */}
                <div className="bg-emerald-900/80 backdrop-blur-xl border border-emerald-600/40 rounded-3xl p-5 shadow-2xl text-white transform hover:-translate-y-1 transition-all">
                  <div className="flex items-center justify-between border-b border-emerald-700/60 pb-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300">
                        <Layers className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-wider text-amber-300">Farm Intelligence</h4>
                        <p className="text-sm font-bold text-white">Sri Lakshmi Farm • Plot A</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                      Active Sowing
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 rounded-xl bg-black/20">
                      <span className="text-[10px] text-emerald-300/80 block">Crop</span>
                      <span className="font-bold">Paddy Samba</span>
                    </div>
                    <div className="p-2 rounded-xl bg-black/20">
                      <span className="text-[10px] text-emerald-300/80 block">Acreage</span>
                      <span className="font-bold">4.2 Acres</span>
                    </div>
                    <div className="p-2 rounded-xl bg-black/20">
                      <span className="text-[10px] text-emerald-300/80 block">Health</span>
                      <span className="font-bold text-emerald-400">96% Optimal</span>
                    </div>
                  </div>
                </div>

                {/* Card 2: AI Crop Doctor Live Diagnostic Scan */}
                <div className="bg-slate-900/90 backdrop-blur-xl border border-emerald-500/40 rounded-3xl p-5 shadow-2xl text-white transform hover:-translate-y-1 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-amber-400/20 text-amber-300">
                        <ScanLine className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-wider text-emerald-300">Crop Doctor AI</h4>
                        <p className="text-sm font-bold text-white">Visual Pre-Screening</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                      94% Confidence
                    </span>
                  </div>
                  <div className="bg-emerald-950/60 rounded-2xl p-3 border border-emerald-700/50 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div className="text-xs">
                      <p className="font-bold text-white">Detected: Rice Blast Early Stage</p>
                      <p className="text-slate-300 text-[11px] mt-0.5">Bio-fungicide spray recommended within 48 hours.</p>
                    </div>
                  </div>
                </div>

                {/* Card 3: Dual Verified Sourcing & Delivery Strip */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-emerald-900/80 backdrop-blur-xl border border-emerald-700/60 rounded-2xl p-3.5 text-xs text-white">
                    <div className="flex items-center gap-1.5 text-amber-300 font-bold mb-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Verified Inputs</span>
                    </div>
                    <p className="text-[11px] text-slate-200">100% Licensed Regional Fertilizer & Seed Dealers</p>
                  </div>
                  <div className="bg-emerald-900/80 backdrop-blur-xl border border-emerald-700/60 rounded-2xl p-3.5 text-xs text-white">
                    <div className="flex items-center gap-1.5 text-emerald-300 font-bold mb-1">
                      <Truck className="w-3.5 h-3.5" />
                      <span>Delivery OTP</span>
                    </div>
                    <p className="text-[11px] text-slate-200">Two-party bcrypt verification at farm gate</p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. SCROLL STORY (01 to 07) — THE COMPLETE FARM SEVA JOURNEY               */}
      {/* ========================================================================= */}
      <section id="how-it-works" className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-black uppercase tracking-wider">
              <span>Platform Journey</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-stone-900">
              The Farmer's Complete Lifecycle.
            </h2>
            <p className="text-stone-600 text-base sm:text-lg font-normal">
              From land registration to post-harvest delivery, FARM SEVA provides structured, intelligent support at every milestone.
            </p>
          </div>

          {/* 7-Step Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            
            {/* Step 01 */}
            <div className="group relative bg-[#fafaf9] hover:bg-white border border-stone-200 hover:border-emerald-500 rounded-3xl p-6 transition-all duration-300 shadow-sm hover:shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-black px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                    01
                  </span>
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <Layers className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="text-lg font-black text-stone-900 mb-2">Create Your Farm</h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mb-4">
                  Map your land hierarchically: Farmer → Farm → Field → Crop with soil type, acreage & water source.
                </p>
              </div>
              <div className="pt-3 border-t border-stone-200/80 text-[11px] font-bold text-emerald-800 flex items-center gap-1.5">
                <span>Granular field boundaries</span>
              </div>
            </div>

            {/* Step 02 */}
            <div className="group relative bg-[#fafaf9] hover:bg-white border border-stone-200 hover:border-emerald-500 rounded-3xl p-6 transition-all duration-300 shadow-sm hover:shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-black px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                    02
                  </span>
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <Calendar className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="text-lg font-black text-stone-900 mb-2">Track Your Crop</h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mb-4">
                  Follow biological growth stages from sowing, tillering, flowering through harvest with day-by-day logging.
                </p>
              </div>
              <div className="pt-3 border-t border-stone-200/80 text-[11px] font-bold text-emerald-800 flex items-center gap-1.5">
                <span>Stage-specific activity schedule</span>
              </div>
            </div>

            {/* Step 03 */}
            <div className="group relative bg-[#fafaf9] hover:bg-white border border-stone-200 hover:border-emerald-500 rounded-3xl p-6 transition-all duration-300 shadow-sm hover:shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-black px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                    03
                  </span>
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <Camera className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="text-lg font-black text-stone-900 mb-2">Crop Doctor</h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mb-4">
                  Take a photo of pest damage or leaf lesions for instant computer-vision diagnostic pre-screening.
                </p>
              </div>
              <div className="pt-3 border-t border-stone-200/80 text-[11px] font-bold text-emerald-800 flex items-center gap-1.5">
                <span>Confidence & symptom scoring</span>
              </div>
            </div>

            {/* Step 04 */}
            <div className="group relative bg-[#fafaf9] hover:bg-white border border-stone-200 hover:border-emerald-500 rounded-3xl p-6 transition-all duration-300 shadow-sm hover:shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-black px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                    04
                  </span>
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="text-lg font-black text-stone-900 mb-2">Agricultural Expert</h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mb-4">
                  Seamlessly escalate complex symptoms to certified agronomists for verified prescription guidance.
                </p>
              </div>
              <div className="pt-3 border-t border-stone-200/80 text-[11px] font-bold text-emerald-800 flex items-center gap-1.5">
                <span>Accredited university researchers</span>
              </div>
            </div>

            {/* Step 05 */}
            <div className="group relative bg-[#fafaf9] hover:bg-white border border-stone-200 hover:border-emerald-500 rounded-3xl p-6 transition-all duration-300 shadow-sm hover:shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-black px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                    05
                  </span>
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="text-lg font-black text-stone-900 mb-2">Marketplace</h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mb-4">
                  Browse certified Seeds, Fertilizers, Crop Protection, Bio-inputs & Equipment from verified regional dealers.
                </p>
              </div>
              <div className="pt-3 border-t border-stone-200/80 text-[11px] font-bold text-emerald-800 flex items-center gap-1.5">
                <span>100% genuine inputs</span>
              </div>
            </div>

            {/* Step 06 */}
            <div className="group relative bg-[#fafaf9] hover:bg-white border border-stone-200 hover:border-emerald-500 rounded-3xl p-6 transition-all duration-300 shadow-sm hover:shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-black px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                    06
                  </span>
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="text-lg font-black text-stone-900 mb-2">Trusted Purchase</h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mb-4">
                  Fair transparent pricing, live seller inventory verification, and secure online UPI/Card or Cash on Delivery.
                </p>
              </div>
              <div className="pt-3 border-t border-stone-200/80 text-[11px] font-bold text-emerald-800 flex items-center gap-1.5">
                <span>Transparent billing & receipt</span>
              </div>
            </div>

            {/* Step 07 */}
            <div className="group relative bg-[#fafaf9] hover:bg-white border border-stone-200 hover:border-emerald-500 rounded-3xl p-6 transition-all duration-300 shadow-sm hover:shadow-xl flex flex-col justify-between md:col-span-2 lg:col-span-2 xl:col-span-2">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-black px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                    07
                  </span>
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <Truck className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="text-lg font-black text-stone-900 mb-2">Secured Delivery with OTP</h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mb-4">
                  Complete milestone visibility: Placed → Packing → Dispatch → Out for Delivery → bcrypt Delivery OTP Verification.
                </p>
              </div>
              <div className="pt-3 border-t border-stone-200/80 flex items-center justify-between text-[11px] font-bold text-emerald-800">
                <span>Handoff secured by farmer OTP</span>
                <span className="text-amber-600">Zero stolen or misplaced orders</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. CROP DOCTOR SHOWCASE — CINEMATIC INTERACTIVE SECTION                  */}
      {/* ========================================================================= */}
      <section id="crop-doctor" className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-stone-900 to-[#063828] text-white relative">
        <div className="max-w-7xl mx-auto relative z-10">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-black uppercase tracking-wider">
              <Camera className="w-3.5 h-3.5 text-amber-400" />
              <span>Intelligent Field Vision</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
              Instant Diagnosis. Real Solutions.
            </h2>
            <p className="text-emerald-100/80 text-base sm:text-lg font-normal">
              Capture symptoms with your smartphone camera. Our assistive computer vision detects disease signatures and suggests agronomist-vetted remedies.
            </p>
          </div>

          {/* Diagnostic Simulator Container */}
          <div className="bg-slate-900/90 border border-emerald-500/30 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
            
            {/* Step Workflow Header Strip */}
            <div className="mb-8 flex items-center justify-between flex-wrap gap-4 pb-6 border-b border-slate-800">
              <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm font-bold text-slate-300 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
                <span className="px-3 py-1.5 rounded-xl bg-emerald-800 text-white shrink-0">1. Upload Photo</span>
                <ChevronRight className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="px-3 py-1.5 rounded-xl bg-emerald-800 text-white shrink-0">2. AI Pre-Screening</span>
                <ChevronRight className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="px-3 py-1.5 rounded-xl bg-emerald-800 text-white shrink-0">3. Problem Identification</span>
                <ChevronRight className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="px-3 py-1.5 rounded-xl bg-amber-400 text-emerald-950 font-black shrink-0">4. Expert Escalation</span>
              </div>

              {/* Scenario Switcher Buttons */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 hidden lg:inline">Sample Cases:</span>
                {cropDoctorCases.map((c, idx) => (
                  <button
                    key={c.crop}
                    onClick={() => setActiveCropCase(idx)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                      activeCropCase === idx
                        ? 'bg-amber-400 text-emerald-950'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {c.crop}
                  </button>
                ))}
              </div>
            </div>

            {/* Diagnostic Details Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Left Column: Visual Leaf Scanner Simulation */}
              <div className="lg:col-span-6 relative bg-slate-950 rounded-2xl border border-slate-800 p-5 overflow-hidden">
                <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-3 mb-4">
                  <span className="font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    LIVE SCANNER
                  </span>
                  <span>{cropDoctorCases[activeCropCase].photoLabel}</span>
                </div>

                <div className="relative h-64 sm:h-72 rounded-xl bg-gradient-to-br from-emerald-950/60 to-slate-900 flex items-center justify-center border border-emerald-500/20 overflow-hidden">
                  <div className="text-center p-6 space-y-3 z-10">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-400/30">
                      <Leaf className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="font-bold text-white text-base">{cropDoctorCases[activeCropCase].crop}</p>
                      <p className="text-xs text-emerald-300">{cropDoctorCases[activeCropCase].stage}</p>
                    </div>
                    <div className="inline-block px-3 py-1 rounded-full bg-slate-900/90 border border-slate-700 text-slate-300 text-xs">
                      {cropDoctorCases[activeCropCase].symptom}
                    </div>
                  </div>

                  {/* Visual Laser Scanner Line */}
                  <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent animate-scanner shadow-[0_0_15px_#f59e0b]" />
                </div>
              </div>

              {/* Right Column: AI Result & Treatment Prescription */}
              <div className="lg:col-span-6 space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-extrabold tracking-wider text-amber-400">Analysis Result</span>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-black">
                    {cropDoctorCases[activeCropCase].confidence}% Match Confidence
                  </span>
                </div>

                <div>
                  <h3 className="text-2xl sm:text-3xl font-black text-white">
                    {cropDoctorCases[activeCropCase].detectedIssue}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Severity Level: <span className="text-amber-300 font-bold">{cropDoctorCases[activeCropCase].severity}</span>
                  </p>
                </div>

                <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-emerald-300 uppercase tracking-wide">Recommended Course of Action</span>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                    {cropDoctorCases[activeCropCase].treatment}
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/advisory"
                    className="px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow"
                  >
                    <span>Escalate Case to Agronomist</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/crops"
                    className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm border border-slate-700 transition flex items-center justify-center gap-2"
                  >
                    <span>Log into Crop Timeline</span>
                  </Link>
                </div>

                <p className="text-[11px] text-slate-400 italic">
                  * Note: AI suggestions serve as an assistive decision-support layer. For high-value crops or severe outbreaks, verified expert escalation is strongly advised.
                </p>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. MARKETPLACE SHOWCASE — REAL API DATA ONLY                              */}
      {/* ========================================================================= */}
      <section id="marketplace" className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-[#fafaf9] border-b border-stone-200">
        <div className="max-w-7xl mx-auto">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-black uppercase tracking-wider">
                <ShoppingBag className="w-3.5 h-3.5 text-emerald-700" />
                <span>Verified Agricultural Marketplace</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-stone-900">
                Genuine Agricultural Inputs. Direct from Licensed Sellers.
              </h2>
              <p className="text-stone-600 text-base font-normal">
                Authentic Seeds, Fertilizers, Crop Protection, Bio-inputs & Equipment verified by FARM SEVA inspectors.
              </p>
            </div>

            <Link
              href="/products"
              className="px-6 py-3 rounded-2xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-sm transition flex items-center gap-2 self-start md:self-auto shrink-0 shadow"
            >
              <span>View Complete Catalog</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition ${
                selectedCategory === 'all'
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'bg-stone-200/80 text-stone-700 hover:bg-stone-300'
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition ${
                  selectedCategory === cat.slug
                    ? 'bg-emerald-800 text-white shadow-sm'
                    : 'bg-stone-200/80 text-stone-700 hover:bg-stone-300'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Product Cards Grid or Elegant Empty State */}
          {isLoadingProducts ? (
            <div className="py-16 text-center space-y-4">
              <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-stone-600 text-sm font-semibold">Connecting to FARM SEVA central catalog...</p>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map((prod) => (
                <div
                  key={prod.id}
                  className="bg-white border border-stone-200 hover:border-emerald-500 rounded-3xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="aspect-square w-full rounded-2xl bg-emerald-50/60 border border-emerald-100 flex items-center justify-center p-4 relative overflow-hidden">
                      {prod.imageUrl ? (
                        <img
                          src={prod.imageUrl}
                          alt={prod.title}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="text-center text-emerald-800 space-y-1">
                          <Sprout className="w-12 h-12 mx-auto text-emerald-600/70" />
                          <span className="text-[10px] uppercase font-bold tracking-wider text-stone-500">Verified Product</span>
                        </div>
                      )}
                      {prod.category && (
                        <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-white/90 backdrop-blur-sm border border-stone-200 text-[10px] font-bold text-stone-700">
                          {prod.category.name}
                        </span>
                      )}
                    </div>

                    <div>
                      <h4 className="text-base font-black text-stone-900 line-clamp-1 group-hover:text-emerald-700 transition">
                        {prod.title}
                      </h4>
                      {prod.seller && (
                        <p className="text-xs text-stone-500 font-medium mt-0.5 flex items-center gap-1">
                          <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{prod.seller.businessName}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-stone-100 mt-4 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-stone-500 block uppercase font-bold">Price</span>
                      <span className="text-lg font-black text-emerald-900">₹{prod.price}</span>
                      {prod.unit && <span className="text-[10px] text-stone-500 ml-1">/ {prod.unit}</span>}
                    </div>
                    <Link
                      href="/products"
                      className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 text-xs font-bold transition shadow-sm"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Elegant Empty State (No hardcoded fake items) */
            <div className="bg-white border border-stone-200 rounded-3xl p-12 text-center max-w-xl mx-auto space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-stone-900">Curating Regional Inventory</h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                Licensed agricultural retailers are currently updating real-time inventory for this category. Explore the full catalog or contact regional dealers directly.
              </p>
              <div className="pt-2">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-800 text-white font-bold text-xs hover:bg-emerald-700 transition"
                >
                  <span>Explore All Products</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. EXPERT ADVISORY SECTION                                               */}
      {/* ========================================================================= */}
      <section id="experts" className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-black uppercase tracking-wider">
                <Stethoscope className="w-3.5 h-3.5 text-emerald-700" />
                <span>Certified Agronomist Advisory</span>
              </div>

              <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-stone-900 leading-tight">
                Connect Directly with University & KVK Experts.
              </h2>

              <p className="text-stone-600 text-base leading-relaxed">
                When digital pre-screening highlights complex infections, FARM SEVA links your case to accredited agricultural scientists. Receive verified chemical and cultural prescriptions tailored to your soil and micro-climate.
              </p>

              {/* 4 Feature Points */}
              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-stone-900">Multi-Language Agronomist Consultations</span>
                    <p className="text-xs text-stone-600">Guidance delivered in Telugu, Hindi, Kannada, Tamil, Marathi and English.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-stone-900">Direct Farm Timeline Synchronization</span>
                    <p className="text-xs text-stone-600">Prescriptions automatically update your daily irrigation and pesticide schedule.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-stone-900">Verified Agronomist Credentials</span>
                    <p className="text-xs text-stone-600">All participating specialists hold accredited M.Sc or Ph.D credentials in Agricultural Sciences.</p>
                  </div>
                </div>
              </div>

              <div className="pt-3">
                <Link
                  href="/advisory"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-sm shadow transition"
                >
                  <span>Consult an Agricultural Expert</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Workflow Card Visual */}
            <div className="lg:col-span-6 bg-[#fafaf9] border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <h3 className="text-sm font-black uppercase tracking-wider text-emerald-800">
                The 5-Step Escalation Cycle
              </h3>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-stone-200">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs shrink-0">1</div>
                  <div className="text-xs">
                    <p className="font-bold text-stone-900">Crop Problem Reported</p>
                    <p className="text-stone-500">Farmer captures symptom photos and logs affected acreage.</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-stone-200">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">2</div>
                  <div className="text-xs">
                    <p className="font-bold text-stone-900">AI Computer Vision Pre-Screening</p>
                    <p className="text-stone-500">Automated classification isolates disease candidate and confidence score.</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-stone-200">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">3</div>
                  <div className="text-xs">
                    <p className="font-bold text-stone-900">Agronomist Case Assignment</p>
                    <p className="text-stone-500">Specialist reviews soil history, past fertilizers & weather alerts.</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-stone-200">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">4</div>
                  <div className="text-xs">
                    <p className="font-bold text-stone-900">Verified Actionable Prescription</p>
                    <p className="text-stone-500">Dosage, cultural practice & safety withdrawal period prescribed.</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-stone-200">
                  <div className="w-8 h-8 rounded-xl bg-amber-400 text-emerald-950 flex items-center justify-center font-bold text-xs shrink-0">5</div>
                  <div className="text-xs">
                    <p className="font-bold text-stone-900">Automatic Farm Timeline Sync</p>
                    <p className="text-stone-500">Farmer dashboard updates tasks & alerts regional delivery partner.</p>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. MY FARM SECTION — MULTI-TIER INTELLIGENCE HIERARCHY                     */}
      {/* ========================================================================= */}
      <section id="my-farm" className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-[#063828] text-white">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-black uppercase tracking-wider">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span>Hierarchical Land Intelligence</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
              Structured Farm Organization.
            </h2>
            <p className="text-emerald-100/80 text-base sm:text-lg font-normal">
              FARM SEVA structures your agricultural operations across 6 interconnected tiers — from farmer identity to parcel-specific action.
            </p>
          </div>

          {/* Interactive Tier Cascade */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: Stage Selector List */}
            <div className="lg:col-span-5 space-y-2.5">
              {farmHierarchyLevels.map((lvl, index) => (
                <button
                  key={lvl.step}
                  onClick={() => setActiveFarmStage(index)}
                  className={`w-full text-left p-4 rounded-2xl transition-all duration-200 border flex items-center justify-between ${
                    activeFarmStage === index
                      ? 'bg-amber-400 text-emerald-950 border-amber-300 shadow-lg'
                      : 'bg-emerald-900/60 hover:bg-emerald-800/80 text-white border-emerald-700/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-black px-2 py-0.5 rounded-md ${
                      activeFarmStage === index ? 'bg-emerald-950 text-amber-300' : 'bg-emerald-800 text-emerald-300'
                    }`}>
                      {lvl.step}
                    </span>
                    <span className="text-sm font-bold">{lvl.title}</span>
                  </div>
                  <ChevronRight className={`w-4 h-4 ${activeFarmStage === index ? 'text-emerald-950' : 'text-emerald-400'}`} />
                </button>
              ))}
            </div>

            {/* Right Column: Active Stage Showcase Panel */}
            <div className="lg:col-span-7 bg-slate-900/90 border border-emerald-500/40 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase text-amber-400 tracking-wider">Level Details</span>
                  <span className="text-xs text-slate-400">• Step {farmHierarchyLevels[activeFarmStage].step} of 06</span>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold">
                  {farmHierarchyLevels[activeFarmStage].badge}
                </span>
              </div>

              <div>
                <h3 className="text-2xl sm:text-4xl font-black text-white">
                  {farmHierarchyLevels[activeFarmStage].title}
                </h3>
                <p className="text-base text-amber-300 font-bold mt-1">
                  {farmHierarchyLevels[activeFarmStage].scope}
                </p>
              </div>

              <div className="bg-emerald-950/60 rounded-2xl p-5 border border-emerald-800/60">
                <p className="text-slate-200 text-sm leading-relaxed">
                  {farmHierarchyLevels[activeFarmStage].desc}
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/farms"
                  className="px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow"
                >
                  <span>Manage My Farm Parcels</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/crops"
                  className="px-6 py-3 rounded-xl bg-emerald-800/80 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm border border-emerald-600/50 transition flex items-center justify-center gap-2"
                >
                  <span>View Active Crop Batches</span>
                </Link>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. TRUST & ARCHITECTURE SECTION — ZERO FAKE STATS                        */}
      {/* ========================================================================= */}
      <section id="trust" className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-black uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>Platform Integrity</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-stone-900">
              Built on Modern Security & Real Domain Verification.
            </h2>
            <p className="text-stone-600 text-base font-normal">
              FARM SEVA operates with bank-grade encryption, zero fake claims, and verified agricultural custody protocols.
            </p>
          </div>

          {/* 6 Real Architectural Pillars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <div className="bg-[#fafaf9] border border-stone-200 rounded-3xl p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <h4 className="text-base font-black text-stone-900">Secure Farmer Accounts</h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                Mobile OTP authentication backed by bcrypt hashing and secure JWT session rotation for confidential farm data.
              </p>
            </div>

            <div className="bg-[#fafaf9] border border-stone-200 rounded-3xl p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <BadgeCheck className="w-5 h-5" />
              </div>
              <h4 className="text-base font-black text-stone-900">Verified Seller Workflows</h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                All pesticide and fertilizer sellers must submit state licenses and pass manual administrative compliance verification.
              </p>
            </div>

            <div className="bg-[#fafaf9] border border-stone-200 rounded-3xl p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <h4 className="text-base font-black text-stone-900">Structured Product Data</h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                Clear chemical formulations, recommended dosages, target pests, and safety withdrawal periods for every listed item.
              </p>
            </div>

            <div className="bg-[#fafaf9] border border-stone-200 rounded-3xl p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-base font-black text-stone-900">Private KYC Vault</h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                Sensitive identity and license documents are isolated in private cloud storage accessible only via time-limited signed URLs.
              </p>
            </div>

            <div className="bg-[#fafaf9] border border-stone-200 rounded-3xl p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <h4 className="text-base font-black text-stone-900">Secure Payments Architecture</h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                Server-side HMAC signature verification and idempotent webhooks ensure tamper-proof online transactions and verified COD.
              </p>
            </div>

            <div className="bg-[#fafaf9] border border-stone-200 rounded-3xl p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <Truck className="w-5 h-5" />
              </div>
              <h4 className="text-base font-black text-stone-900">Delivery Verification Protocol</h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                Two-party one-time password protocol hashed with bcrypt ensures products are only marked delivered upon verified farmer receipt.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 9. EDITORIAL FOOTER & APP DIRECTORY                                      */}
      {/* ========================================================================= */}
      <footer className="bg-[#04241a] text-stone-300 pt-20 pb-12 px-4 sm:px-6 lg:px-8 border-t border-emerald-900">
        <div className="max-w-7xl mx-auto space-y-16">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
            
            {/* Column 1: Brand Info */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-400 text-emerald-950 flex items-center justify-center font-black">
                  <Sprout className="w-5 h-5" />
                </div>
                <span className="font-black text-xl text-white tracking-tight">FARM SEVA</span>
              </div>
              <p className="text-xs text-stone-400 leading-relaxed max-w-sm">
                Next-generation agricultural operating system for Indian farmers. Integrating farm parcel management, crop diagnostics, licensed agri-dealers, and accredited university extension specialists.
              </p>
              <div className="pt-2 flex items-center gap-3 text-xs text-emerald-400 font-bold">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Central API Operational • Singapore Cloud</span>
              </div>
            </div>

            {/* Column 2: Farmer Quick Links */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase text-amber-400 tracking-wider">Farmer Platform</h4>
              <ul className="space-y-2 text-xs">
                <li><Link href="/farms" className="hover:text-white transition">My Farms & Plots</Link></li>
                <li><Link href="/crops" className="hover:text-white transition">Crop Health Tracker</Link></li>
                <li><Link href="/advisory" className="hover:text-white transition">Ask Crop Doctor</Link></li>
                <li><Link href="/products" className="hover:text-white transition">Agri Inputs Catalog</Link></li>
                <li><Link href="/orders" className="hover:text-white transition">Order Tracking & OTP</Link></li>
              </ul>
            </div>

            {/* Column 3: Agricultural Ecosystem Consoles */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase text-amber-400 tracking-wider">Ecosystem Consoles</h4>
              <ul className="space-y-2 text-xs">
                <li><a href="https://farmer.farmseva.com" className="hover:text-white transition">Farmer Web Portal</a></li>
                <li><a href="https://seller.farmseva.com" className="hover:text-white transition">Seller Retail Console</a></li>
                <li><a href="https://expert.farmseva.com" className="hover:text-white transition">Agronomist Workstation</a></li>
                <li><a href="https://delivery.farmseva.com" className="hover:text-white transition">Delivery Partner App</a></li>
                <li><a href="https://admin.farmseva.com" className="hover:text-white transition">Administrator Portal</a></li>
              </ul>
            </div>

            {/* Column 4: Trust & Architecture */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase text-amber-400 tracking-wider">Compliance & Security</h4>
              <ul className="space-y-2 text-xs text-stone-400">
                <li><span>Verified Dealer Licensing</span></li>
                <li><span>Bcrypt Delivery Protocol</span></li>
                <li><span>Private KYC Storage Vault</span></li>
                <li><span>HMAC Payment Protection</span></li>
                <li><span>Supabase PostgreSQL Cluster</span></li>
              </ul>
            </div>

          </div>

          {/* Bottom Legal & Copyright Bar */}
          <div className="pt-8 border-t border-emerald-900/60 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-400 gap-4">
            <p>© 2026 FARM SEVA Inc. All rights reserved. Smart Farming • Trusted Marketplace • Expert Support.</p>
            <div className="flex items-center gap-6">
              <span className="hover:text-white transition cursor-pointer">Privacy Policy</span>
              <span className="hover:text-white transition cursor-pointer">Terms of Service</span>
              <span className="hover:text-white transition cursor-pointer">Security Practices</span>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
