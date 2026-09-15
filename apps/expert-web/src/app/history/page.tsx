'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Badge, TextInput, Button, CardSkeleton, EmptyState, ErrorState } from '@farm-seva/shared-ui';
import { Archive, Search, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { apiFetch, getAuthToken } from '../../lib/api-client';

interface ArchivedCase {
  id: string;
  cropName?: string;
  crop?: string;
  problemTitle?: string;
  farmerNotes?: string;
  severity?: string;
  status: string;
  createdAt: string;
  farmerName?: string;
  district?: string;
}

export default function HistoryArchivePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cases, setCases] = useState<ArchivedCase[]>([]);
  const [search, setSearch] = useState('');

  const fetchHistory = async () => {
    const token = getAuthToken();
    if (!token) {
      router.push('/login');
      return;
    }

    setLoading(true);
    setError(null);

    const res = await apiFetch<ArchivedCase[]>('/api/v1/crop-doctor/history');

    if (res.success && Array.isArray(res.data)) {
      setCases(res.data);
    } else {
      const expRes = await apiFetch<ArchivedCase[]>('/api/v1/expert/cases');
      if (expRes.success && Array.isArray(expRes.data)) {
        setCases(expRes.data.filter((c) => c.status === 'RESOLVED' || c.status === 'CLOSED'));
      } else {
        setError(res.error || expRes.error || 'Failed to fetch pathology archives');
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const filteredHistory = cases.filter((c) => {
    const cropName = c.cropName || c.crop || '';
    const notes = c.problemTitle || c.farmerNotes || '';
    return (
      cropName.toLowerCase().includes(search.toLowerCase()) ||
      notes.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Archive className="w-6 h-6 text-sky-600" />
            Pathology Archives & Resolved Cases
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Search historical crop pathology diagnoses and official agronomist prescriptions
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchHistory}
          className="border-slate-300 text-slate-700 hover:bg-slate-100 text-xs self-start sm:self-auto"
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Refresh Archives
        </Button>
      </div>

      <Card className="p-4 border-slate-200 space-y-4">
        <div className="w-full sm:w-80">
          <TextInput
            placeholder="Search crop or disease history..."
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
          />
        </div>

        {loading ? (
          <CardSkeleton />
        ) : error ? (
          <ErrorState title="Unable to Load Archives" message={error} onRetry={fetchHistory} />
        ) : filteredHistory.length === 0 ? (
          <EmptyState
            icon={<Archive className="w-12 h-12 text-slate-400" />}
            title="No Resolved Cases Found"
            description="There are no past resolved diagnoses matching your search criteria."
          />
        ) : (
          <div className="space-y-3 pt-2">
            {filteredHistory.map((c) => (
              <div
                key={c.id}
                className="p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50/80 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-slate-900">
                      {c.cropName || c.crop || 'Crop Pathology Case'}
                    </span>
                    <Badge status="success">RESOLVED</Badge>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-1">
                    {c.problemTitle || c.farmerNotes || 'Official agronomist diagnosis issued.'}
                  </p>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400">
                    <span>Farmer: {c.farmerName || 'Registered Farmer'}</span>
                    <span>• District: {c.district || 'District Hub'}</span>
                    <span>• Resolved: {new Date(c.createdAt || Date.now()).toLocaleDateString()}</span>
                  </div>
                </div>

                <Link href={`/cases/${c.id}`} className="shrink-0">
                  <Button variant="outline" size="sm" className="border-sky-300 text-sky-700 hover:bg-sky-50 text-xs font-bold w-full sm:w-auto">
                    Inspect Record →
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
