'use client';

import React, { useState, useEffect } from 'react';
import {
  Wallet,
  Calendar,
  CheckCircle2,
  Clock,
  TrendingUp,
  DollarSign,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { StatsCard } from '../../../components/ui/StatsCard';

export default function DeliveryEarningsPage() {
  const { token } = useAuth();
  const { t } = useLanguage();

  const [earningsData, setEarningsData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://farmseva.onrender.com';

  useEffect(() => {
    fetchEarnings();
  }, [token]);

  const fetchEarnings = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/delivery/earnings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setEarningsData(data.data);
      }
    } catch (err) {
      console.error('Error fetching earnings:', err);
    } finally {
      setLoading(false);
    }
  };

  const todayEarnings = earningsData?.todayEarnings || 0;
  const weekEarnings = earningsData?.weekEarnings || 0;
  const totalEarnings = earningsData?.totalEarnings || 0;
  const completedCount = earningsData?.completedCount || 0;
  const pendingSettlement = earningsData?.pendingSettlement || 0;
  const settledAmount = earningsData?.settledAmount || 0;
  const earningsList = earningsData?.earnings || [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Wallet className="w-6 h-6 text-emerald-400" />
          {t('delivery.earningsTitle', 'Delivery Earnings & Settlement Dashboard')}
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          {t('delivery.earningsSub', 'Track real completed delivery earnings, daily performance, and direct bank settlement records.')}
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title={t('delivery.todayEarnings', "Today's Earnings")}
          value={`₹${todayEarnings}`}
          subtitle="Updated real-time"
          icon={<DollarSign className="w-6 h-6 text-emerald-400" />}
          variant="emerald"
        />

        <StatsCard
          title={t('delivery.thisWeek', 'This Week')}
          value={`₹${weekEarnings}`}
          subtitle="Weekly total"
          icon={<TrendingUp className="w-6 h-6 text-purple-400" />}
          variant="purple"
        />

        <StatsCard
          title={t('delivery.completedCount', 'Completed Drops')}
          value={`${completedCount}`}
          subtitle="OTP verified deliveries"
          icon={<CheckCircle2 className="w-6 h-6 text-blue-400" />}
          variant="blue"
        />

        <StatsCard
          title={t('delivery.settledAmount', 'Settled Amount')}
          value={`₹${settledAmount}`}
          subtitle="Bank transferred"
          icon={<ShieldCheck className="w-6 h-6 text-amber-400" />}
          variant="amber"
        />
      </div>

      {/* Earnings Breakdown Table */}
      <Card padding="md" className="bg-slate-900 border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
          <h3 className="font-black text-base text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-400" />
            {t('delivery.recentEarningsLedger', 'Recent Delivery Earnings Ledger')}
          </h3>
          <Badge variant="success" size="sm">
            {earningsList.length} Transactions
          </Badge>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 font-bold text-xs animate-pulse">
            Loading earnings records...
          </div>
        ) : earningsList.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-3">Order #</th>
                  <th className="py-3 px-3">Date & Time</th>
                  <th className="py-3 px-3">Location</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Earning</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {earningsList.map((item: any) => (
                  <tr key={item.id} className="hover:bg-slate-850/50 transition">
                    <td className="py-3 px-3 font-mono font-black text-emerald-400">
                      #{item.orderNumber}
                    </td>
                    <td className="py-3 px-3 text-slate-300">
                      {new Date(item.deliveredAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-slate-300">
                      {item.village}, {item.district}
                    </td>
                    <td className="py-3 px-3">
                      <Badge variant="success" size="sm">
                        {item.settlementStatus}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 text-right font-black text-white text-sm">
                      +₹{item.amount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center space-y-2">
            <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto text-2xl">
              💰
            </div>
            <h4 className="font-bold text-sm text-slate-300">
              {t('delivery.noEarningsYet', 'No completed delivery earnings yet')}
            </h4>
            <p className="text-xs text-slate-400">
              {t('delivery.completeDeliveriesPrompt', 'Accept and complete active delivery orders to earn guaranteed payouts.')}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
