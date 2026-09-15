'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, MetricCard, Badge, Button, CardSkeleton, EmptyState, ErrorState } from '@farm-seva/shared-ui';
import { DollarSign, CheckCircle2, RefreshCw, Calendar, MapPin } from 'lucide-react';
import { apiFetch, getAuthToken } from '../../lib/api-client';

interface EarningItem {
  id: string;
  orderId: string;
  orderNumber: string;
  deliveredAt: string;
  amount: number;
  settlementStatus: string;
  district: string;
  village: string;
}

interface EarningsData {
  todayEarnings: number;
  weekEarnings: number;
  totalEarnings: number;
  completedCount: number;
  pendingSettlement: number;
  settledAmount: number;
  earnings: EarningItem[];
}

export default function DeliveryEarningsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<EarningsData | null>(null);

  const fetchEarnings = async () => {
    const token = getAuthToken();
    if (!token) {
      router.push('/login');
      return;
    }

    setLoading(true);
    setError(null);

    const res = await apiFetch<EarningsData>('/api/v1/delivery/earnings');

    if (res.success && res.data) {
      setData(res.data);
    } else {
      setError(res.error || 'Failed to fetch partner earnings data from API server');
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchEarnings();
  }, []);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-purple-600" />
            Partner Earnings & Settlements
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Monitor completed order fulfillment earnings and payout status
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchEarnings}
          className="border-slate-300 text-slate-700 hover:bg-slate-100 text-xs self-start sm:self-auto"
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Refresh Earnings
        </Button>
      </div>

      {loading ? (
        <CardSkeleton />
      ) : error ? (
        <ErrorState title="Unable to Load Earnings" message={error} onRetry={fetchEarnings} />
      ) : !data ? (
        <ErrorState title="No Financial Data" message="Earnings summary could not be retrieved." />
      ) : (
        <div className="space-y-6">
          {/* Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <MetricCard
              title="Today's Earnings"
              value={`₹${data.todayEarnings}`}
              subtitle="Settled today"
              icon={<DollarSign className="w-5 h-5 text-purple-600" />}
            />
            <MetricCard
              title="This Week"
              value={`₹${data.weekEarnings}`}
              subtitle="Weekly total"
              icon={<Calendar className="w-5 h-5 text-purple-600" />}
            />
            <MetricCard
              title="All-Time Earnings"
              value={`₹${data.totalEarnings}`}
              subtitle="Lifetime earnings"
              icon={<DollarSign className="w-5 h-5 text-emerald-600" />}
            />
            <MetricCard
              title="Completed Orders"
              value={data.completedCount.toString()}
              subtitle="Fulfilled tasks"
              icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
            />
          </div>

          {/* Breakdown List */}
          <Card className="p-6 border-slate-200 space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-purple-600" />
              Completed Delivery Payout Breakdown ({data.earnings?.length || 0})
            </h2>

            {!data.earnings || data.earnings.length === 0 ? (
              <EmptyState
                icon={<DollarSign className="w-12 h-12 text-slate-400" />}
                title="No Completed Delivery Payouts"
                description="Complete your first delivery task to earn partner payouts."
              />
            ) : (
              <div className="space-y-3">
                {data.earnings.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-slate-900">
                          Order #{item.orderNumber}
                        </span>
                        <Badge status="success">SETTLED</Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {item.village}, {item.district}
                        </span>
                        <span>• {new Date(item.deliveredAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-black text-emerald-700">+₹{item.amount}</span>
                      <span className="text-[10px] text-slate-400 block font-bold">Payout Credited</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
