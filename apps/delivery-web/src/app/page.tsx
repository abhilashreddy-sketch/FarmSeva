import React from 'react';
import {
  MetricCard,
  InformationCard,
  Button,
  Badge,
} from '@farm-seva/shared-ui';
import { Truck, Navigation, ShieldCheck, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function DeliveryHomePage() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto py-4">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-purple-900 to-slate-900 text-white p-6 sm:p-10 rounded-3xl shadow-xl space-y-4 border border-purple-800">
        <div className="flex items-center gap-2">
          <Badge status="active" className="bg-purple-500 text-white border-purple-400">Logistics Application</Badge>
          <span className="text-xs text-purple-200 font-bold">• Shared API Target: http://localhost:4000</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
          FARM SEVA DELIVERY
        </h1>
        <p className="text-purple-200 text-sm font-medium max-w-2xl leading-relaxed">
          District Last-Mile Delivery Partner Console. Toggle online status, stream real-time GPS coordinates, and verify 4-digit customer delivery OTPs upon drop-off.
        </p>

        <div className="flex flex-wrap gap-3 pt-2">
          <Link href="/login">
            <Button variant="primary" size="md" className="bg-purple-600 text-white hover:bg-purple-500" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Driver Sign In
            </Button>
          </Link>
          <Link href="/register">
            <Button variant="outline" size="md" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
              Register Driver Account
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Last-Mile Ops"
          value="Dispatch Ready"
          subtitle="District route optimization"
          icon={<Truck className="w-5 h-5 text-purple-400" />}
        />
        <MetricCard
          title="Live GPS Tracking"
          value="Online / Offline"
          subtitle="Real-time telemetry stream"
          icon={<Navigation className="w-5 h-5 text-purple-400" />}
        />
        <MetricCard
          title="OTP Security"
          value="4-Digit Verification"
          subtitle="Guaranteed order delivery"
          icon={<ShieldCheck className="w-5 h-5 text-purple-400" />}
        />
      </div>

      {/* Information Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InformationCard
          badgeText="LOGISTICS"
          title="Pickup & District Route"
          description="Receive instant dispatch assignments from verified agricultural dealers to rural farm drop-off points."
          icon={<Truck className="w-6 h-6 text-purple-400" />}
          action={
            <Link href="/login">
              <Button variant="outline" size="sm" className="border-purple-700 text-purple-200 hover:bg-purple-900">
                Logistics Console
              </Button>
            </Link>
          }
        />
        <InformationCard
          badgeText="SECURITY"
          title="OTP Verification & Settlement"
          description="Complete farmer deliveries with instant OTP verification for automatic driver earnings credit."
          icon={<ShieldCheck className="w-6 h-6 text-purple-400" />}
          action={
            <Link href="/login">
              <Button variant="outline" size="sm" className="border-purple-700 text-purple-200 hover:bg-purple-900">
                Driver Portal
              </Button>
            </Link>
          }
        />
      </div>
    </div>
  );
}
