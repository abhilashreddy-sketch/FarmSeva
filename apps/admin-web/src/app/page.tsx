'use client';

import React from 'react';
import {
  MetricCard,
  InformationCard,
  Button,
  Badge,
} from '@farm-seva/shared-ui';
import { ShieldCheck, Users, ShoppingBag, ArrowRight, UserCheck, BarChart3, Truck } from 'lucide-react';
import Link from 'next/link';

export default function AdminHomePage() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto py-4">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white p-6 sm:p-10 rounded-3xl shadow-xl space-y-4 border border-slate-700">
        <div className="flex items-center gap-2">
          <Badge status="processing" className="bg-emerald-500/20 text-emerald-200 border-emerald-400/30">
            Operational Control Center
          </Badge>
          <span className="text-xs text-slate-300 font-bold">• Shared API Target: http://localhost:4000</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
          FARM SEVA ADMIN
        </h1>
        <p className="text-slate-200 text-sm sm:text-base font-medium max-w-2xl leading-relaxed">
          Master Platform Control Desk. Manage multi-role users, audit seller/expert KYC applications, dispatch delivery partners, review product compliance, and process financial reconciliation.
        </p>

        <div className="flex flex-wrap gap-3 pt-2">
          <Link href="/login">
            <Button variant="primary" size="md" className="bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-bold" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Administrator Sign In
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline" size="md" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
              Open Control Desk
            </Button>
          </Link>
        </div>
      </div>

      {/* Control Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="User Moderation"
          value="4 Role Types"
          subtitle="Farmers, Sellers, Experts, Partners"
          icon={<Users className="w-5 h-5 text-emerald-600" />}
        />
        <MetricCard
          title="KYC Audit Console"
          value="Verification"
          subtitle="Trade license & expert review"
          icon={<UserCheck className="w-5 h-5 text-emerald-600" />}
        />
        <MetricCard
          title="Delivery Dispatch"
          value="Assignments"
          subtitle="Driver order assignment desk"
          icon={<Truck className="w-5 h-5 text-emerald-600" />}
        />
      </div>

      {/* Information Modules */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InformationCard
          badgeText="PLATFORM OVERVIEW"
          title="System Metrics & User Management"
          description="Inspect live system registration counts, user status toggles (Active / Suspended), and account moderation across all roles."
          icon={<ShieldCheck className="w-6 h-6 text-emerald-600" />}
          action={
            <Link href="/login">
              <Button variant="outline" size="sm" className="border-emerald-600 text-emerald-700 hover:bg-emerald-50">
                Access Users Desk
              </Button>
            </Link>
          }
        />
        <InformationCard
          badgeText="FINANCIAL & AUDIT"
          title="Settlements & Business Analytics"
          description="Process seller payouts, perform audit reconciliation, review platform revenue, and export financial CSV reports."
          icon={<BarChart3 className="w-6 h-6 text-emerald-600" />}
          action={
            <Link href="/login">
              <Button variant="outline" size="sm" className="border-emerald-600 text-emerald-700 hover:bg-emerald-50">
                Open Financial Desk
              </Button>
            </Link>
          }
        />
      </div>

      {/* Security Callout */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-sm">Privileged Administrator Console</h3>
          </div>
          <p className="text-xs text-slate-400">
            Access to this console requires verified ADMIN role authentication enforced directly by backend RBAC.
          </p>
        </div>
        <Link href="/login">
          <Button size="sm" className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold whitespace-nowrap">
            Admin Sign In
          </Button>
        </Link>
      </div>
    </div>
  );
}
