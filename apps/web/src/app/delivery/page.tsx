'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Truck, MapPin, CheckCircle2, ShieldCheck, ArrowRight, Package } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { StatsCard } from '../../components/ui/StatsCard';

export default function DeliveryDashboard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) router.push('/login');
      else if (user.status === 'SUSPENDED') router.push('/account-suspended');
      else if (user.role !== 'DELIVERY_PARTNER' && user.role !== 'ADMIN') router.push('/unauthorized');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return <div className="p-8 text-center font-bold text-slate-500">Loading Delivery Console...</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2">
      {/* Delivery Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-800 to-purple-950 text-white p-6 md:p-8 shadow-xl border border-purple-700">
        <div className="flex items-center justify-between flex-wrap gap-4 relative z-10">
          <div className="space-y-2">
            <Badge variant="harvest" size="md" className="bg-purple-400 text-purple-950">
              <Truck className="w-3.5 h-3.5 mr-1" /> DISTRICT LOGISTICS NETWORK
            </Badge>
            <h1 className="text-2xl md:text-4xl font-black tracking-tight">
              {user.fullName}
            </h1>
            <p className="text-purple-100 text-xs md:text-sm font-medium">
              Active Delivery Partner • District: GUNTUR • Phone: {user.phone}
            </p>
          </div>

          <div className="w-16 h-16 bg-purple-700/60 rounded-2xl flex items-center justify-center text-4xl shadow-inner border border-purple-500/40 shrink-0">
            🚚
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard
          title="Assigned Pickups"
          value="0"
          subtitle="Shop pickup queue"
          icon={<Package className="w-6 h-6 text-purple-600" />}
          variant="purple"
        />

        <StatsCard
          title="Out For Delivery"
          value="0"
          subtitle="Active field transit"
          icon={<MapPin className="w-6 h-6 text-amber-600" />}
          variant="amber"
        />

        <StatsCard
          title="Completed Deliveries"
          value="0"
          subtitle="OTP verified drops"
          icon={<CheckCircle2 className="w-6 h-6 text-emerald-600" />}
          variant="emerald"
        />
      </div>

      {/* Main Delivery Queue Panel */}
      <Card padding="md" className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-black text-lg text-slate-900 flex items-center gap-2">
            <Truck className="w-5 h-5 text-purple-600" /> Active Order Delivery Queue
          </h3>
          <Badge variant="info" size="sm">0 Active Drops</Badge>
        </div>
        <p className="text-xs text-slate-600 font-medium leading-relaxed">
          Review shop pickup locations, navigate to farmer fields, and verify drop-off using the farmer's 6-digit OTP code.
        </p>

        <div className="pt-2">
          <Link href="/delivery/orders">
            <Button variant="primary" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Open Deliveries Console
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
