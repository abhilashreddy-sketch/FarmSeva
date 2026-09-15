'use client';

import React from 'react';
import {
  MetricCard,
  InformationCard,
  Button,
  Badge,
} from '@farm-seva/shared-ui';
import { Truck, Package, ShieldCheck, ArrowRight, MapPin, DollarSign } from 'lucide-react';
import Link from 'next/link';

export default function DeliveryHomePage() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto py-4">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-10 rounded-3xl shadow-xl space-y-4 border border-purple-700">
        <div className="flex items-center gap-2">
          <Badge status="processing" className="bg-purple-500/20 text-purple-200 border-purple-400/30">
            Delivery Partner Console
          </Badge>
          <span className="text-xs text-purple-300 font-bold">• API Target: http://localhost:4000</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
          FARM SEVA DELIVERY
        </h1>
        <p className="text-purple-100 text-sm sm:text-base font-medium max-w-2xl leading-relaxed">
          Official Delivery Partner Logistics Console. Fulfill agricultural supply orders from licensed dealers directly to farmers with real-time OTP drop-off verification.
        </p>

        <div className="flex flex-wrap gap-3 pt-2">
          <Link href="/login">
            <Button variant="primary" size="md" className="bg-purple-500 text-white hover:bg-purple-400 font-bold" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Partner Sign In
            </Button>
          </Link>
          <Link href="/register">
            <Button variant="outline" size="md" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
              Register Delivery Vehicle
            </Button>
          </Link>
        </div>
      </div>

      {/* Logistics Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Fulfillment Desk"
          value="Assigned Queue"
          subtitle="Real-time order dispatch"
          icon={<Package className="w-5 h-5 text-purple-600" />}
        />
        <MetricCard
          title="Drop-off Verification"
          value="OTP Code"
          subtitle="Secure farmer handover"
          icon={<ShieldCheck className="w-5 h-5 text-purple-600" />}
        />
        <MetricCard
          title="Partner Payouts"
          value="Settlement"
          subtitle="Direct delivery earnings"
          icon={<DollarSign className="w-5 h-5 text-purple-600" />}
        />
      </div>

      {/* Information Modules */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InformationCard
          badgeText="PICKUP & TASK"
          title="Dealer Pickup & Farmer Handover"
          description="Collect verified seed, fertilizer, and equipment orders from retail shops and navigate directly to registered farmer locations."
          icon={<Truck className="w-6 h-6 text-purple-600" />}
          action={
            <Link href="/login">
              <Button variant="outline" size="sm" className="border-purple-600 text-purple-700 hover:bg-purple-50">
                Access Deliveries
              </Button>
            </Link>
          }
        />
        <InformationCard
          badgeText="LOCATION & GPS"
          title="Live GPS & Location Reporting"
          description="Report active delivery coordinates to keep farmers updated on order arrival status."
          icon={<MapPin className="w-6 h-6 text-purple-600" />}
          action={
            <Link href="/login">
              <Button variant="outline" size="sm" className="border-purple-600 text-purple-700 hover:bg-purple-50">
                Open Console
              </Button>
            </Link>
          }
        />
      </div>

      {/* Quality Callout */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-purple-400" />
            <h3 className="font-bold text-sm">Verified Delivery Partner Network</h3>
          </div>
          <p className="text-xs text-slate-400">
            FARM SEVA delivery operations connect verified agricultural dealers with farmers across all districts.
          </p>
        </div>
        <Link href="/register">
          <Button size="sm" className="bg-purple-500 hover:bg-purple-400 text-white font-bold whitespace-nowrap">
            Register Partner Profile
          </Button>
        </Link>
      </div>
    </div>
  );
}
