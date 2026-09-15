'use client';

import React, { useEffect, useState } from 'react';
import {
  Badge,
  CardSkeleton,
  EmptyState,
  MetricCard,
} from '@farm-seva/shared-ui';
import { DollarSign, ShieldCheck, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { apiFetch, getAuthToken } from '../../lib/api-client';

export default function SettlementsPage() {
  const router = useRouter();
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadSettlementData() {
      const token = getAuthToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const res = await apiFetch<any>('/api/v1/seller/analytics/dashboard');
      if (res.success && res.data) {
        setAnalytics(res.data);
      }
      setIsLoading(false);
    }
    loadSettlementData();
  }, []);

  if (!getAuthToken()) {
    return (
      <div className="max-w-md mx-auto py-12 text-center space-y-4">
        <EmptyState
          title="Sign In Required"
          description="Please sign in to view your merchant financial settlements and revenue."
          actionLabel="Sign In Now"
          onAction={() => router.push('/login')}
        />
      </div>
    );
  }

  const revenue = analytics?.totalRevenue || 0;

  return (
    <div className="max-w-4xl mx-auto py-4 space-y-6">
      <div className="space-y-1">
        <Badge status="pending">Financial Settlements</Badge>
        <h1 className="text-2xl font-black text-slate-900">Platform Earnings & Bank Payouts</h1>
        <p className="text-xs text-slate-500">
          Track sales volume, completed farmer payments, and automated district bank payouts.
        </p>
      </div>

      {isLoading ? (
        <CardSkeleton />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <MetricCard
              title="Total Platform Revenue"
              value={`₹${revenue}`}
              subtitle="Verified order sales volume"
              icon={<DollarSign className="w-5 h-5 text-amber-600" />}
            />
            <MetricCard
              title="Payout Status"
              value="Automated Direct Credit"
              subtitle="Connected bank account"
              icon={<ShieldCheck className="w-5 h-5 text-amber-600" />}
            />
          </div>

          <div className="space-y-3">
            <h2 className="text-base font-black text-slate-900">Settlement Payout History</h2>

            {revenue > 0 ? (
              <div className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900 text-sm">Settlement Payout #SET-001</p>
                  <p className="text-xs text-slate-500">Processed to registered bank account</p>
                </div>
                <span className="font-black text-emerald-700 text-sm">₹{revenue}</span>
              </div>
            ) : (
              <EmptyState
                title="No Settlement History Yet"
                description="Settlement payout records will appear here as soon as orders are delivered to farmers."
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
