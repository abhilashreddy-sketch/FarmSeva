'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  MetricCard,
  Card,
  Badge,
  Button,
  CardSkeleton,
  EmptyState,
  ErrorState,
} from '@farm-seva/shared-ui';
import {
  Stethoscope,
  FileText,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Clock,
  Activity,
  RefreshCw,
  Search,
} from 'lucide-react';
import Link from 'next/link';
import { apiFetch, getAuthToken } from '../../lib/api-client';

interface ExpertCase {
  id: string;
  cropName?: string;
  problemTitle?: string;
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'PENDING_REVIEW' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  createdAt: string;
  farmerName?: string;
  district?: string;
  images?: string[];
  aiConfidence?: number;
}

export default function ExpertDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cases, setCases] = useState<ExpertCase[]>([]);
  const [metrics, setMetrics] = useState({
    pending: 0,
    inProgress: 0,
    resolved: 0,
    criticalCount: 0,
  });

  const fetchCases = async () => {
    const token = getAuthToken();
    if (!token) {
      router.push('/login');
      return;
    }

    setLoading(true);
    setError(null);

    const res = await apiFetch<ExpertCase[]>('/api/v1/expert/cases');

    if (!res.success) {
      const cropRes = await apiFetch<ExpertCase[]>('/api/v1/expert/crop-problems');
      if (cropRes.success && Array.isArray(cropRes.data)) {
        processCases(cropRes.data);
      } else {
        setError(res.error || cropRes.error || 'Failed to fetch expert case queue from API server');
      }
    } else if (Array.isArray(res.data)) {
      processCases(res.data);
    } else {
      setCases([]);
      setMetrics({ pending: 0, inProgress: 0, resolved: 0, criticalCount: 0 });
    }

    setLoading(false);
  };

  const processCases = (caseList: ExpertCase[]) => {
    setCases(caseList);
    const pending = caseList.filter((c) => c.status === 'PENDING_REVIEW' || (c as any).status === 'PENDING').length;
    const inProgress = caseList.filter((c) => c.status === 'IN_PROGRESS').length;
    const resolved = caseList.filter((c) => c.status === 'RESOLVED' || c.status === 'CLOSED').length;
    const criticalCount = caseList.filter((c) => c.severity === 'CRITICAL' || c.severity === 'HIGH').length;

    setMetrics({ pending, inProgress, resolved, criticalCount });
  };

  useEffect(() => {
    fetchCases();
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-sky-900 to-slate-900 text-white p-6 rounded-2xl border border-sky-800 shadow-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge status="processing" className="bg-sky-500/20 text-sky-200 border-sky-400/30">
              Agronomist Workstation
            </Badge>
            <span className="text-xs text-sky-300 font-semibold">• Live API Connected</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black">Pathology Triage Desk</h1>
          <p className="text-xs text-sky-100 font-medium">
            Review farmer crop symptoms, inspect AI pathology findings, and submit medical treatment guidelines.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="bg-white/10 text-white border-white/20 hover:bg-white/20 text-xs"
            onClick={fetchCases}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh Desk
          </Button>
          <Link href="/cases">
            <Button size="sm" className="bg-sky-400 text-slate-950 font-bold hover:bg-sky-300 text-xs" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              Full Queue
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Section */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <MetricCard
          title="Pending Review"
          value={metrics.pending.toString()}
          subtitle="Awaiting agronomist triage"
          icon={<Clock className="w-5 h-5 text-amber-500" />}
        />
        <MetricCard
          title="In Diagnosis"
          value={metrics.inProgress.toString()}
          subtitle="Evaluation in progress"
          icon={<Activity className="w-5 h-5 text-sky-500" />}
        />
        <MetricCard
          title="Resolved Cases"
          value={metrics.resolved.toString()}
          subtitle="Guidance issued to farmers"
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-500" />}
        />
        <MetricCard
          title="High Severity Alerts"
          value={metrics.criticalCount.toString()}
          subtitle="Requires priority attention"
          icon={<AlertTriangle className="w-5 h-5 text-rose-500" />}
        />
      </div>

      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
          <Stethoscope className="w-4 h-4 text-sky-600" />
          <span>Quick Agronomist Tools:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/cases">
            <Button variant="outline" size="sm" className="text-xs border-slate-300">
              <Search className="w-3.5 h-3.5 mr-1" /> Browse Triage Queue
            </Button>
          </Link>
          <Link href="/diagnosis">
            <Button variant="outline" size="sm" className="text-xs border-sky-300 text-sky-700 hover:bg-sky-50">
              <Activity className="w-3.5 h-3.5 mr-1" /> AI Pathology Tester
            </Button>
          </Link>
          <Link href="/advisory">
            <Button variant="outline" size="sm" className="text-xs border-amber-300 text-amber-800 hover:bg-amber-50">
              <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Post Regional Bulletin
            </Button>
          </Link>
        </div>
      </div>

      {/* Triage Cases Table / List */}
      <Card className="p-6 border-slate-200 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-sky-600" />
              Active Triage Queue
            </h2>
            <p className="text-xs text-slate-500">
              Showing incoming crop disease submissions requiring agronomist evaluation
            </p>
          </div>
          <Link href="/cases" className="text-xs font-bold text-sky-600 hover:underline">
            View All ({cases.length}) →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : error ? (
          <ErrorState
            title="Unable to Load Triage Queue"
            message={error}
            onRetry={fetchCases}
          />
        ) : cases.length === 0 ? (
          <EmptyState
            icon={<Stethoscope className="w-12 h-12 text-slate-400" />}
            title="No Pending Cases in Queue"
            description="There are currently no active crop pathology submissions assigned to your queue."
            actionLabel="Inspect All Cases"
            onAction={() => router.push('/cases')}
          />
        ) : (
          <div className="space-y-3">
            {cases.slice(0, 5).map((c) => (
              <div
                key={c.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-100/80 transition gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-slate-900">
                      {c.cropName || (c as any).crop || 'Crop Disease Submission'}
                    </span>
                    {c.severity && (
                      <Badge
                        status={
                          c.severity === 'CRITICAL' || c.severity === 'HIGH'
                            ? 'rejected'
                            : c.severity === 'MEDIUM'
                            ? 'warning'
                            : 'active'
                        }
                      >
                        {c.severity}
                      </Badge>
                    )}
                    <Badge
                      status={
                        c.status === 'RESOLVED' || c.status === 'CLOSED'
                          ? 'success'
                          : c.status === 'IN_PROGRESS'
                          ? 'processing'
                          : 'pending'
                      }
                    >
                      {c.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-1">
                    {c.problemTitle || (c as any).farmerNotes || (c as any).description || 'Reported leaf discoloration and spot symptoms.'}
                  </p>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400">
                    <span>Farmer: {c.farmerName || 'Registered Farmer'}</span>
                    <span>• District: {c.district || 'Regional Hub'}</span>
                    <span>• {new Date(c.createdAt || Date.now()).toLocaleDateString()}</span>
                  </div>
                </div>

                <Link href={`/cases/${c.id}`} className="shrink-0">
                  <Button variant="outline" size="sm" className="border-sky-300 text-sky-700 hover:bg-sky-50 text-xs font-bold w-full sm:w-auto">
                    Evaluate Case →
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
