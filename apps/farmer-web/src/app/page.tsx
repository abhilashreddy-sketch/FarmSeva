'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sprout,
  Store,
  Stethoscope,
  Truck,
  ShieldCheck,
  ArrowRight,
  ChevronRight,
  Menu,
  X,
  Layers,
  Calendar,
  Camera,
  ShoppingBag,
  Sparkles,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export default function PublicLandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const workflowSteps = [
    {
      step: '01',
      title: 'Create Your Farm',
      summary: 'Farmer creates their farm, fields and crop information.',
      icon: <Layers className="w-5 h-5 text-emerald-600" />,
      detail: 'Set up geographic boundaries, soil classification, acreage, and irrigation parameters in a clear structural hierarchy.',
    },
    {
      step: '02',
      title: 'Understand Your Crop',
      summary: 'Track crops, growth stages and farm activities.',
      icon: <Calendar className="w-5 h-5 text-emerald-600" />,
      detail: 'Follow biological milestones from sowing to maturity with stage-specific nutrition, irrigation, and management schedules.',
    },
    {
      step: '03',
      title: 'Identify Crop Problems',
      summary: 'Farmers can report crop problems and receive structured support through the Crop Problem workflow.',
      icon: <Camera className="w-5 h-5 text-emerald-600" />,
      detail: 'Capture field photos and symptom observations for systematic diagnostic intake and visual symptom tracking.',
    },
    {
      step: '04',
      title: 'Get Agricultural Support',
      summary: 'Connect with agricultural experts when expert assistance is required.',
      icon: <Stethoscope className="w-5 h-5 text-emerald-600" />,
      detail: 'Directly escalate complex plant pathology cases to certified agronomists for verified digital prescriptions.',
    },
    {
      step: '05',
      title: 'Find Agricultural Products',
      summary: 'Browse the FARM SEVA agricultural marketplace.',
      icon: <ShoppingBag className="w-5 h-5 text-emerald-600" />,
      detail: 'Explore certified seeds, bio-pesticides, fertilizers, and equipment available from licensed district suppliers.',
    },
    {
      step: '06',
      title: 'Purchase From Sellers',
      summary: 'Buy agricultural products through verified platform workflows.',
      icon: <Store className="w-5 h-5 text-emerald-600" />,
      detail: 'Transparent dealer pricing, structured itemized billing, and secure digital or cash payment confirmation.',
    },
    {
      step: '07',
      title: 'Receive Your Order',
      summary: 'Delivery partners complete the fulfillment process.',
      icon: <Truck className="w-5 h-5 text-emerald-600" />,
      detail: 'Last-mile fulfillment to the farm gate secured with one-time password (OTP) handover verification.',
    },
  ];

  const platformParticipants = [
    {
      role: 'Farmers',
      badge: 'Cultivation & Market',
      title: 'Complete Farm & Crop Management',
      desc: 'Centralized tools to organize land parcels, log crop milestones, request expert pathology consultations, and purchase authentic agricultural inputs.',
      icon: <Sprout className="w-6 h-6 text-emerald-600" />,
      theme: 'border-emerald-500/30 hover:border-emerald-500',
    },
    {
      role: 'Agricultural Sellers',
      badge: 'Merchant Console',
      title: 'Licensed Input Distribution',
      desc: 'Authorized regional dealers manage certified seed, fertilizer, and machinery catalogs, maintain live inventory, and fulfill farmer orders.',
      icon: <Store className="w-6 h-6 text-amber-600" />,
      theme: 'border-amber-500/30 hover:border-amber-500',
    },
    {
      role: 'Crop-Support Experts',
      badge: 'Agronomy Workstation',
      title: 'Scientific Pathology Advisory',
      desc: 'Qualified plant pathologists and agronomists evaluate field problem submissions, verify symptoms, and issue structured treatment guidance.',
      icon: <Stethoscope className="w-6 h-6 text-sky-600" />,
      theme: 'border-sky-500/30 hover:border-sky-500',
    },
    {
      role: 'Delivery Partners',
      badge: 'Fulfillment Logistics',
      title: 'Secure Last-Mile Delivery',
      desc: 'Dedicated logistics operators manage rural field dispatches with route coordination and cryptographic OTP verification at the farm gate.',
      icon: <Truck className="w-6 h-6 text-purple-600" />,
      theme: 'border-purple-500/30 hover:border-purple-500',
    },
    {
      role: 'Operations & Governance',
      badge: 'Platform Operations',
      title: 'Trust, Compliance & Standards',
      desc: 'Operational oversight ensuring seller KYC verification, marketplace catalog integrity, order state compliance, and audit trail records.',
      icon: <ShieldCheck className="w-6 h-6 text-slate-700" />,
      theme: 'border-slate-400/30 hover:border-slate-500',
    },
  ];

  return (
    <div className="min-h-screen bg-[#fafaf9] text-stone-900 flex flex-col font-sans selection:bg-emerald-700 selection:text-white overflow-x-hidden">
      
      {/* ========================================================================= */}
      {/* 1. CLEAN PUBLIC STARTUP NAVBAR                                            */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-50 bg-[#063828]/95 backdrop-blur-md border-b border-emerald-800/50 text-white shadow-sm transition-all duration-300">
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
                  <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-800/80 text-emerald-200 border border-emerald-600/50">
                    AgriTech
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-emerald-200/90 uppercase tracking-widest hidden md:block">
                  Smart Farming • Trusted Marketplace • Expert Support
                </span>
              </div>
            </Link>

            {/* Public Navigation Links (Minimal & Startup-Oriented) */}
            <nav className="hidden md:flex items-center gap-8 text-xs lg:text-sm font-bold text-emerald-100/90">
              <a href="#hero" className="hover:text-amber-300 transition-colors py-2">
                Home
              </a>
              <a href="#how-it-works" className="hover:text-amber-300 transition-colors py-2">
                How It Works
              </a>
              <a href="#about" className="hover:text-amber-300 transition-colors py-2">
                About FARM SEVA
              </a>
            </nav>

            {/* Public Auth Action CTAs */}
            <div className="hidden sm:flex items-center gap-3 shrink-0">
              <Link
                href="/login"
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white hover:bg-emerald-800/70 border border-emerald-600/60 transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/register"
                className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black bg-amber-400 hover:bg-amber-300 text-emerald-950 shadow-sm transition-all transform hover:-translate-y-0.5"
              >
                Get Started
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 rounded-xl bg-emerald-800/80 text-white hover:bg-emerald-700 transition"
              aria-label="Toggle Public Menu"
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
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 border-b border-emerald-800/80 flex items-center justify-between"
              >
                <span>How It Works</span>
                <ChevronRight className="w-4 h-4 text-emerald-400" />
              </a>
              <a
                href="#about"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 border-b border-emerald-800/80 flex items-center justify-between"
              >
                <span>About FARM SEVA</span>
                <ChevronRight className="w-4 h-4 text-emerald-400" />
              </a>
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
      {/* 2. PLATFORM HERO SECTION                                                  */}
      {/* ========================================================================= */}
      <section id="hero" className="relative overflow-hidden bg-gradient-to-b from-[#063828] via-[#064e3b] to-[#04241a] text-white pt-16 sm:pt-24 pb-24 sm:pb-36 px-4 sm:px-6 lg:px-8">
        
        {/* Subtle Radial Grid Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(16,185,129,0.12)_1px,transparent_1px)] [background-size:32px_32px] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Hero Positioning & Messaging */}
            <div className="lg:col-span-7 space-y-7 text-center lg:text-left">
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-emerald-900/80 border border-emerald-500/40 text-amber-300 text-xs font-bold tracking-wider uppercase shadow-inner">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Agricultural Operating Platform</span>
              </div>

              <h1 className="text-4xl sm:text-6xl xl:text-7xl font-black tracking-tight leading-[1.08] text-white">
                Everything Your Farm Needs.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-200 to-emerald-300">
                  One Intelligent Platform.
                </span>
              </h1>

              <p className="text-emerald-100/90 text-base sm:text-xl font-normal leading-relaxed max-w-2xl mx-auto lg:mx-0">
                FARM SEVA brings farm management, crop support, agricultural products, expert assistance and delivery into one connected platform built for the complete farming journey.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  href="/register"
                  className="px-8 py-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-base shadow-lg shadow-amber-400/20 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-3 group"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <a
                  href="#how-it-works"
                  className="px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-base border border-emerald-400/30 backdrop-blur-sm transition-all flex items-center justify-center gap-2"
                >
                  <span>Explore FARM SEVA</span>
                  <ChevronRight className="w-5 h-5 text-emerald-300" />
                </a>
              </div>

              {/* Verified Trust Badges */}
              <div className="pt-6 border-t border-emerald-800/80 flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 text-xs text-emerald-200/90">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  <span className="font-semibold">Centralized Farm Records</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  <span className="font-semibold">Licensed Input Sellers</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  <span className="font-semibold">Certified Agronomists</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  <span className="font-semibold">Secured OTP Delivery</span>
                </div>
              </div>
            </div>

            {/* Hero Right Composition: Editorial Platform Architecture */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none space-y-4">
                
                {/* Platform Architecture Card */}
                <div className="bg-emerald-900/80 backdrop-blur-xl border border-emerald-600/40 rounded-3xl p-6 sm:p-7 shadow-2xl text-white">
                  <div className="flex items-center justify-between border-b border-emerald-700/60 pb-3 mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300">
                        <Layers className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-wider text-amber-300">FARM SEVA Platform</h4>
                        <p className="text-sm font-bold text-white">One Connected Ecosystem</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                      Core Architecture
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="p-3 rounded-2xl bg-black/25 border border-emerald-800/40 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg">🌾</span>
                        <span className="font-bold text-white">Farm & Crop Operations</span>
                      </div>
                      <span className="text-[10px] text-emerald-300 font-semibold">Hierarchy Model</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-black/25 border border-emerald-800/40 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg">🔬</span>
                        <span className="font-bold text-white">Pathology & Crop Doctor</span>
                      </div>
                      <span className="text-[10px] text-sky-300 font-semibold">Expert Escalation</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-black/25 border border-emerald-800/40 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg">🏪</span>
                        <span className="font-bold text-white">Verified Input Marketplace</span>
                      </div>
                      <span className="text-[10px] text-amber-300 font-semibold">Licensed Sellers</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-black/25 border border-emerald-800/40 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg">🚚</span>
                        <span className="font-bold text-white">Milestone Field Fulfillment</span>
                      </div>
                      <span className="text-[10px] text-purple-300 font-semibold">OTP Handover</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-emerald-800/60 text-center">
                    <span className="text-[11px] text-emerald-200/80 font-medium">
                      Built for Indian agriculture • Production RBAC governed
                    </span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. HOW FARM SEVA WORKS — 7-STEP VISUAL JOURNEY                            */}
      {/* ========================================================================= */}
      <section id="how-it-works" className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto space-y-16">
          
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-black uppercase tracking-wider">
              <span>Ecosystem Workflow</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-stone-900">
              How FARM SEVA Works
            </h2>
            <p className="text-stone-600 text-base sm:text-lg font-normal">
              A structured 7-step journey designed to support farmers from seasonal planning to final order fulfillment.
            </p>
          </div>

          {/* 7 Visual Journey Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {workflowSteps.map((ws) => (
              <div
                key={ws.step}
                className="group relative bg-[#fafaf9] hover:bg-white border border-stone-200 hover:border-emerald-500 rounded-3xl p-6 transition-all duration-300 shadow-xs hover:shadow-xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-black px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-mono">
                      {ws.step}
                    </span>
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-700 group-hover:text-white transition-colors">
                      {ws.icon}
                    </div>
                  </div>
                  <h3 className="text-lg font-black text-stone-900 mb-2">{ws.title}</h3>
                  <p className="text-xs sm:text-sm font-bold text-stone-700 leading-snug mb-3">
                    {ws.summary}
                  </p>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    {ws.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. ABOUT FARM SEVA — THE CONNECTED PLATFORM ECOSYSTEM                     */}
      {/* ========================================================================= */}
      <section id="about" className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-[#fafaf9] border-b border-stone-200">
        <div className="max-w-7xl mx-auto space-y-16">
          
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100/80 border border-emerald-300 text-emerald-900 text-xs font-black uppercase tracking-wider">
              <span>Platform Positioning</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-stone-900">
              About FARM SEVA
            </h2>
            <p className="text-stone-600 text-base sm:text-lg font-normal leading-relaxed">
              An intelligent agricultural platform connecting farmers, agricultural sellers, crop-support experts and delivery partners in one connected ecosystem.
            </p>
          </div>

          {/* 5 Participant Architecture Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {platformParticipants.map((p) => (
              <div
                key={p.role}
                className={`bg-white rounded-3xl p-6 sm:p-8 border shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col justify-between ${p.theme}`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center text-xl">
                      {p.icon}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
                      {p.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-stone-900">{p.role}</h3>
                    <p className="text-xs font-bold text-stone-500 mt-0.5">{p.title}</p>
                  </div>

                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                    {p.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. CALL TO ACTION SECTION                                                 */}
      {/* ========================================================================= */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#063828] via-[#042e21] to-[#032017] text-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-900/80 border border-emerald-500/40 text-amber-300 text-xs font-bold tracking-wider uppercase">
            <span>Ready to Begin</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Connect Your Agricultural Journey with FARM SEVA
          </h2>

          <p className="text-emerald-100/85 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Experience complete farm management, verified agricultural input purchasing, expert agronomic advisory, and reliable fulfillment in one intelligent system.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="px-8 py-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-sm uppercase tracking-wider shadow-lg transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              <span>Get Started Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-sm uppercase tracking-wider border border-emerald-400/30 backdrop-blur-sm transition flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4 text-emerald-300" />
              <span>Sign In to Platform</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. CLEAN PUBLIC FOOTER                                                    */}
      {/* ========================================================================= */}
      <footer className="bg-slate-950 text-slate-400 py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-400 text-emerald-950 flex items-center justify-center font-black text-base shadow">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <span className="font-black text-base text-white tracking-tight">FARM SEVA</span>
              <p className="text-[11px] text-slate-500">Smart Farming • Trusted Marketplace • Expert Support</p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs font-semibold">
            <a href="#hero" className="hover:text-white transition">Home</a>
            <a href="#how-it-works" className="hover:text-white transition">How It Works</a>
            <a href="#about" className="hover:text-white transition">About FARM SEVA</a>
            <Link href="/login" className="hover:text-white transition">Log In</Link>
            <Link href="/register" className="hover:text-white transition">Get Started</Link>
          </div>

          <div className="text-[11px] text-slate-500 text-center md:text-right">
            <p>© 2026 FARM SEVA. All rights reserved.</p>
            <p className="text-[10px] text-slate-600 mt-0.5">Production Agricultural Technology Platform</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
