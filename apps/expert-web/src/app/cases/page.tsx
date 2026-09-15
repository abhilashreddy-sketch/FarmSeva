'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  Badge,
  Button,
  TextInput,
  CardSkeleton,
  EmptyState,
  ErrorState,
} from '@farm-seva/shared-ui';
import {
  Stethoscope,
  Search,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';
import { apiFetch, getAuthToken } from '../../lib/api-client';

interface ExpertCase {
  id: string;
  cropName?: string;
  crop?: string;
  problemTitle?: string;
  farmerNotes?: string;
  description?: string;
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'PENDING_REVIEW' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'PENDING';
  createdAt: string;
  farmerName?: string;
  district?: string;
  images?: string[];
  aiConfidence?: number;
}

export default function CasesQueuePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cases, setCases] = useState<ExpertCase[]>([]);
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING_REVIEW' | 'IN_PROGRESS' | 'RESOLVED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

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
        setCases(cropRes.data);
      } else {
        setError(res.error || cropRes.error || 'Failed to fetch case queue from API server');
      }
    } else if (Array.isArray(res.data)) {
      setCases(res.data);
    } else {
      setCases([]);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const filteredCases = cases.filter((c) => {
    const cropName = c.cropName || c.crop || '';
    const notes = c.problemTitle || c.farmerNotes || c.description || '';
    const matchesSearch =
      cropName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notes.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === 'ALL') return true;
    if (activeTab === 'PENDING_REVIEW') return c.status === 'PENDING_REVIEW' || c.status === 'PENDING';
    if (activeTab === 'IN_PROGRESS') return c.status === 'IN_PROGRESS';
    if (activeTab === 'RESOLVED') return c.status === 'RESOLVED' || c.status === 'CLOSED';

    return true;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Stethoscope className="w-6 h-6 text-sky-600" />
            Pathology Cases Queue
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Inspect farmer crop disease submissions, review AI diagnosis, and issue binding guidelines
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchCases}
          className="border-slate-300 text-slate-700 hover:bg-slate-100 text-xs self-start sm:self-auto"
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Refresh Queue
        </Button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <Card className="p-4 border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'ALL', label: 'All Cases', count: cases.length },
              {
                id: 'PENDING_REVIEW',
                label: 'Pending Triage',
                count: cases.filter((c) => c.status === 'PENDING_REVIEW' || c.status === 'PENDING').length,
              },
              {
                id: 'IN_PROGRESS',
                label: 'In Diagnosis',
                count: cases.filter((c) => c.status === 'IN_PROGRESS').length,
              },
              {
                id: 'RESOLVED',
                label: 'Resolved',
                count: cases.filter((c) => c.status === 'RESOLVED' || c.status === 'CLOSED').length,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === tab.id
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{tab.label}</span>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white/20">
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="w-full sm:w-64">
            <TextInput
              placeholder="Search crop or symptoms..."
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            />
          </div>
        </div>

        {/* Case List */}
        {loading ? (
          <div className="space-y-3 pt-2">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : error ? (
          <ErrorState title="Failed to Load Cases Queue" message={error} onRetry={fetchCases} />
        ) : filteredCases.length === 0 ? (
          <EmptyState
            icon={<Stethoscope className="w-12 h-12 text-slate-400" />}
            title="No Matching Cases Found"
            description={
              searchQuery
                ? `No crop cases match "${searchQuery}". Try changing your search query or filter.`
                : 'There are no crop pathology submissions in this status category.'
            }
          />
        ) : (
          <div className="space-y-3 pt-2">
            {filteredCases.map((c) => (
              <div
                key={c.id}
                className="p-4 rounded-xl border border-slate-200 bg-white hover:border-sky-300 hover:shadow-xs transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-extrabold text-sm text-slate-900">
                      {c.cropName || c.crop || 'Crop Disease Submission'}
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

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {c.problemTitle || c.farmerNotes || c.description || 'Reported crop disease symptoms.'}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                    <span>Farmer: {c.farmerName || 'Registered Farmer'}</span>
                    <span>• District: {c.district || 'Regional District'}</span>
                    <span>• Submitted: {new Date(c.createdAt || Date.now()).toLocaleDateString()}</span>
                  </div>
                </div>

                <Link href={`/cases/${c.id}`} className="shrink-0">
                  <Button variant="primary" size="sm" className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs w-full sm:w-auto" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                    Evaluate Case
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
