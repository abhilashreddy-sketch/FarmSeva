import React from 'react';
import {
  MetricCard,
  InformationCard,
  Button,
  Badge,
} from '@farm-seva/shared-ui';
import { ShieldCheck, UserCheck, LayoutDashboard, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function AdminHomePage() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto py-4">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 sm:p-10 rounded-3xl shadow-xl space-y-4 border border-slate-700">
        <div className="flex items-center gap-2">
          <Badge status="verified" className="bg-amber-400 text-slate-950 border-amber-300">Protected Operations Workstation</Badge>
          <span className="text-xs text-slate-300 font-bold">• Shared API Target: http://localhost:4000</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-amber-400">
          FARM SEVA ADMIN
        </h1>
        <p className="text-slate-300 text-sm font-medium max-w-2xl leading-relaxed">
          Platform Governance & Operations Desk. Seller/Expert KYC moderation, product catalog approvals, delivery oversight, and platform revenue auditing.
        </p>

        <div className="flex flex-wrap gap-3 pt-2">
          <Link href="/login">
            <Button variant="primary" size="md" className="bg-amber-400 text-slate-950 hover:bg-amber-300 font-black" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Admin Authenticate
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline" size="md" className="bg-slate-800 text-white border-slate-600 hover:bg-slate-700">
              View Control Desk
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Platform Governance"
          value="KYC Audit Desk"
          subtitle="Strict seller & expert verification"
          icon={<UserCheck className="w-5 h-5 text-slate-800" />}
        />
        <MetricCard
          title="Catalog Moderation"
          value="Product Approvals"
          subtitle="Authentic agricultural inputs"
          icon={<ShieldCheck className="w-5 h-5 text-slate-800" />}
        />
        <MetricCard
          title="Operations Control"
          value="Real-Time Desk"
          subtitle="System health & delivery metrics"
          icon={<LayoutDashboard className="w-5 h-5 text-slate-800" />}
        />
      </div>

      {/* Information Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InformationCard
          badgeText="KYC AUDIT"
          title="Seller & Expert Moderation"
          description="Review business trade licenses, fertilizer dealer certificates, and agronomist degrees before approving platform accounts."
          icon={<UserCheck className="w-6 h-6" />}
          action={
            <Link href="/login">
              <Button variant="outline" size="sm">Audit KYC Queue</Button>
            </Link>
          }
        />
        <InformationCard
          badgeText="OPERATIONS"
          title="System Governance & Analytics"
          description="Monitor platform transaction volume, district fulfillment performance, and AI crop doctor query rates."
          icon={<LayoutDashboard className="w-6 h-6" />}
          action={
            <Link href="/login">
              <Button variant="outline" size="sm">Open Governance Desk</Button>
            </Link>
          }
        />
      </div>
    </div>
  );
}
