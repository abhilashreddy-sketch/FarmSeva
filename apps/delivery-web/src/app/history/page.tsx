'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Badge, TextInput, Button, CardSkeleton, EmptyState, ErrorState } from '@farm-seva/shared-ui';
import { History, Search, RefreshCw, MapPin, Store } from 'lucide-react';
import Link from 'next/link';
import { apiFetch, getAuthToken } from '../../lib/api-client';

interface HistoryItem {
  id: string;
  orderId: string;
  status: string;
  updatedAt: string;
  deliveredAt?: string;
  order?: {
    orderNumber?: string;
    shippingAddress?: {
      villageTaluk?: string;
      district?: string;
    };
    shop?: {
      shopName?: string;
      district?: string;
    };
  };
}

export default function DeliveryHistoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'DELIVERED' | 'CANCELLED'>('ALL');

  const fetchHistory = async () => {
    const token = getAuthToken();
    if (!token) {
      router.push('/login');
      return;
    }

    setLoading(true);
    setError(null);

    const query = statusFilter !== 'ALL' ? `?status=${statusFilter}` : '';
    const res = await apiFetch<HistoryItem[]>(`/api/v1/delivery/history${query}`);

    if (res.success && Array.isArray(res.data)) {
      setHistory(res.data);
    } else {
      setError(res.error || 'Failed to fetch delivery history');
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchHistory();
  }, [statusFilter]);

  const filtered = history.filter((item) => {
    const orderNum = item.order?.orderNumber || item.orderId || '';
    const shop = item.order?.shop?.shopName || '';
    return (
      orderNum.toLowerCase().includes(search.toLowerCase()) ||
      shop.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <History className="w-6 h-6 text-purple-600" />
            Delivery History Archive
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Search completed and historical order delivery records
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchHistory}
          className="border-slate-300 text-slate-700 hover:bg-slate-100 text-xs self-start sm:self-auto"
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Refresh Archive
        </Button>
      </div>

      <Card className="p-4 border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex gap-2">
            {['ALL', 'DELIVERED', 'CANCELLED'].map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  statusFilter === tab
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="w-full sm:w-64">
            <TextInput
              placeholder="Search order # or shop..."
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            />
          </div>
        </div>

        {loading ? (
          <CardSkeleton />
        ) : error ? (
          <ErrorState title="Unable to Load History" message={error} onRetry={fetchHistory} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<History className="w-12 h-12 text-slate-400" />}
            title="No Past Delivery Records"
            description="There are no completed or cancelled delivery records matching your filter."
          />
        ) : (
          <div className="space-y-3 pt-2">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-slate-200 bg-white hover:border-purple-300 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-slate-900">
                      Order #{item.order?.orderNumber || item.orderId.slice(-6)}
                    </span>
                    <Badge status={item.status === 'DELIVERED' ? 'success' : 'rejected'}>
                      {item.status}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Store className="w-3.5 h-3.5 text-purple-600" />
                      {item.order?.shop?.shopName || 'Agri Dealer'}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      {item.order?.shippingAddress?.district || 'District'}
                    </span>
                    <span>• {new Date(item.deliveredAt || item.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <Link href={`/deliveries/${item.id}`} className="shrink-0">
                  <Button variant="outline" size="sm" className="border-purple-300 text-purple-700 hover:bg-purple-50 text-xs font-bold w-full sm:w-auto">
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
