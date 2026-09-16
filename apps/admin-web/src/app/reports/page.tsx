'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  MetricCard,
  Card,
  Badge,
  Button,
  TextInput,
  CardSkeleton,
  EmptyState,
  ErrorState,
  Toast,
} from '@farm-seva/shared-ui';
import {
  BarChart3,
  DollarSign,
  FileSpreadsheet,
  RefreshCw,
  SlidersHorizontal,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Percent,
} from 'lucide-react';
import { apiFetch, getAuthToken } from '../../lib/api-client';
import { API_BASE_URL } from '../../config/api';

interface RevenueMetrics {
  grossGMV?: number;
  platformRevenue?: number;
  totalOrders?: number;
  totalDelivered?: number;
  totalCancelled?: number;
  averageOrderValue?: number;
  cancellationRatePercent?: number;
  settlementMode?: string;
}

interface ReconciliationReport {
  matchedCount?: number;
  mismatchedCount?: number;
  totalDiscrepancyAmount?: number;
  summary?: string;
}

interface BusinessSettings {
  platformCommissionPercent?: number;
  fixedTransactionFee?: number;
  deliveryFeeDefault?: number;
  minOrderValueForFreeDelivery?: number;
  sellerSettlementDays?: number;
  cancellationWindowHours?: number;
}

export default function AdminReportsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [metrics, setMetrics] = useState<RevenueMetrics | null>(null);
  const [reconReport, setReconReport] = useState<ReconciliationReport | null>(null);
  const [settings, setSettings] = useState<BusinessSettings | null>(null);

  // Settlement Execution Modal State
  const [sellerId, setSellerId] = useState('');
  const [processingSettlement, setProcessingSettlement] = useState(false);

  // Business Settings Update State
  const [commission, setCommission] = useState('5.0');
  const [fixedFee, setFixedFee] = useState('10.0');
  const [savingSettings, setSavingSettings] = useState(false);

  const [toast, setToast] = useState<{ title: string; message: string; type: 'success' | 'error' } | null>(null);

  const fetchReportsData = async () => {
    const token = getAuthToken();
    if (!token) {
      router.push('/login');
      return;
    }

    setLoading(true);
    setError(null);

    const [revRes, reconRes, settingsRes] = await Promise.all([
      apiFetch<RevenueMetrics>('/api/v1/admin/business/revenue'),
      apiFetch<ReconciliationReport>('/api/v1/admin/financial/reconciliation'),
      apiFetch<BusinessSettings>('/api/v1/admin/business/settings'),
    ]);

    if (revRes.success && revRes.data) {
      setMetrics(revRes.data);
    } else {
      setError(revRes.error || 'Failed to load business financial analytics');
    }

    if (reconRes.success && reconRes.data) {
      setReconReport(reconRes.data);
    }

    if (settingsRes.success && settingsRes.data) {
      setSettings(settingsRes.data);
      if (settingsRes.data.platformCommissionPercent !== undefined) {
        setCommission(settingsRes.data.platformCommissionPercent.toString());
      }
      if (settingsRes.data.fixedTransactionFee !== undefined) {
        setFixedFee(settingsRes.data.fixedTransactionFee.toString());
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchReportsData();
  }, []);

  const handleProcessSettlement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sellerId) return;

    setProcessingSettlement(true);
    const idempotencyKey = `settle-${sellerId}-${Date.now()}`;

    const res = await apiFetch('/api/v1/admin/settlements/process', {
      method: 'POST',
      body: JSON.stringify({ sellerId, idempotencyKey }),
    });

    if (res.success) {
      setToast({
        title: 'Settlement Processed',
        message: `Seller settlement calculated successfully`,
        type: 'success',
      });
      setSellerId('');
    } else {
      setToast({
        title: 'Settlement Failed',
        message: res.error || 'Failed to process seller settlement',
        type: 'error',
      });
    }

    setProcessingSettlement(false);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);

    const res = await apiFetch('/api/v1/admin/business/settings', {
      method: 'PUT',
      body: JSON.stringify({
        platformCommissionPercent: parseFloat(commission),
        fixedTransactionFee: parseFloat(fixedFee),
      }),
    });

    if (res.success) {
      setToast({
        title: 'Settings Saved',
        message: 'Platform commission and transaction fee rates updated',
        type: 'success',
      });
      fetchReportsData();
    } else {
      setToast({
        title: 'Save Failed',
        message: res.error || 'Failed to update business settings',
        type: 'error',
      });
    }

    setSavingSettings(false);
  };

  const handleExportCSV = () => {
    const token = getAuthToken();
    if (!token) return;
    window.open(`${API_BASE_URL}/api/v1/admin/business/reports/export?token=${token}`, '_blank');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {toast && (
        <Toast
          title={toast.title}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-emerald-600" />
            Financial Analytics & Business Reports Desk
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Inspect Gross GMV, platform commission ledger, seller payout settlements, and CSV exports.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchReportsData}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh Data
          </Button>
          <Button
            size="sm"
            onClick={handleExportCSV}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
            leftIcon={<FileSpreadsheet className="w-3.5 h-3.5" />}
          >
            Export CSV Report
          </Button>
        </div>
      </div>

      {loading ? (
        <CardSkeleton />
      ) : error ? (
        <ErrorState title="Financial Desk Unavailable" message={error} onRetry={fetchReportsData} />
      ) : (
        <div className="space-y-6">
          {/* Top Key Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <MetricCard
              title="Gross GMV"
              value={`₹${(metrics?.grossGMV ?? 0).toLocaleString()}`}
              subtitle="Total marketplace volume"
              icon={<TrendingUp className="w-5 h-5 text-emerald-600" />}
            />
            <MetricCard
              title="Platform Revenue"
              value={`₹${(metrics?.platformRevenue ?? 0).toLocaleString()}`}
              subtitle="Authoritative ledger revenue"
              icon={<DollarSign className="w-5 h-5 text-amber-600" />}
            />
            <MetricCard
              title="Avg Order Value (AOV)"
              value={`₹${(metrics?.averageOrderValue ?? 0).toLocaleString()}`}
              subtitle="Mean ticket size"
              icon={<BarChart3 className="w-5 h-5 text-sky-600" />}
            />
            <MetricCard
              title="Cancellation Rate"
              value={`${metrics?.cancellationRatePercent ?? 0}%`}
              subtitle="Total order cancellations"
              icon={<Percent className="w-5 h-5 text-rose-500" />}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Reconciliation Audit Card */}
            <Card className="p-6 border-slate-200 space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                Financial Ledger Reconciliation
              </h2>
              <p className="text-xs text-slate-500">
                Authoritative double-entry ledger reconciliation against payment provider gateways.
              </p>

              <div className="space-y-2 bg-slate-50 p-4 rounded-xl text-xs">
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-600 font-medium">Matched Payment Records:</span>
                  <span className="font-extrabold text-emerald-700">{reconReport?.matchedCount ?? 0}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-600 font-medium">Mismatched Records:</span>
                  <span className="font-extrabold text-rose-600">{reconReport?.mismatchedCount ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 font-medium">Total Discrepancy Amount:</span>
                  <span className="font-extrabold text-slate-900">₹{reconReport?.totalDiscrepancyAmount ?? 0}</span>
                </div>
              </div>

              {reconReport?.summary && (
                <p className="text-xs text-slate-500 italic bg-amber-50/60 p-3 rounded-lg border border-amber-200/60">
                  {reconReport.summary}
                </p>
              )}
            </Card>

            {/* Seller Settlement Execution Card */}
            <Card className="p-6 border-slate-200 space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-amber-600" />
                Execute Seller Payout Settlement
              </h2>
              <p className="text-xs text-slate-500">
                Calculate & process payout settlements for verified seller shops.
              </p>

              <form onSubmit={handleProcessSettlement} className="space-y-3">
                <TextInput
                  label="Seller Profile ID"
                  required
                  placeholder="e.g. seller_clx123..."
                  value={sellerId}
                  onChange={(e) => setSellerId(e.target.value)}
                />

                <Button
                  size="sm"
                  type="submit"
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold"
                  disabled={processingSettlement || !sellerId}
                >
                  {processingSettlement ? 'Calculating Payout...' : 'Process Settlement'}
                </Button>
              </form>
            </Card>
          </div>

          {/* Business Settings & Commission Rate Override */}
          <Card className="p-6 border-slate-200 space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-slate-700" />
              Platform Commission Rates & Fee Configuration
            </h2>

            <form onSubmit={handleSaveSettings} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <TextInput
                label="Platform Commission Rate (%)"
                required
                type="number"
                step="0.1"
                value={commission}
                onChange={(e) => setCommission(e.target.value)}
              />

              <TextInput
                label="Fixed Transaction Fee (₹)"
                required
                type="number"
                step="1"
                value={fixedFee}
                onChange={(e) => setFixedFee(e.target.value)}
              />

              <div className="flex items-end">
                <Button
                  size="sm"
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold"
                  disabled={savingSettings}
                >
                  {savingSettings ? 'Saving...' : 'Update Platform Settings'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
