'use client';

import React, { useState, useEffect } from 'react';
import {
  History,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Package,
  Calendar,
  Store,
  MapPin,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';

export default function DeliveryHistoryPage() {
  const { token } = useAuth();
  const { t } = useLanguage();

  const [history, setHistory] = useState<any[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'DELIVERED' | 'CANCELLED' | 'FAILED'>('ALL');
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://farmseva.onrender.com';

  useEffect(() => {
    fetchHistory();
  }, [token, filter]);

  const fetchHistory = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/delivery/history?status=${filter}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setHistory(data.data);
      }
    } catch (err) {
      console.error('Error fetching delivery history:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <History className="w-6 h-6 text-emerald-400" />
            {t('delivery.historyTitle', 'Delivery History & Completed Records')}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {t('delivery.historySub', 'Review completed, cancelled, or failed delivery records and receipts.')}
          </p>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 shrink-0">
          {['ALL', 'DELIVERED', 'CANCELLED', 'FAILED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                filter === st ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* History List */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 font-bold text-xs animate-pulse">
          Loading delivery history...
        </div>
      ) : history.length > 0 ? (
        <div className="space-y-3">
          {history.map((del) => {
            const isDelivered = del.status === 'DELIVERED';
            const isCancelled = del.status === 'CANCELLED';

            return (
              <Card key={del.id} padding="md" className="bg-slate-900 border-slate-800 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-xs text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded-lg border border-emerald-800/40">
                      ORDER #{del.order?.orderNumber || del.id.substring(0, 8).toUpperCase()}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(del.updatedAt).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge variant={isDelivered ? 'success' : isCancelled ? 'danger' : 'warning'} size="sm">
                      {del.status}
                    </Badge>
                    <span className="text-xs font-black text-amber-400">
                      ₹{del.earnings || 85}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                  <div className="flex items-start gap-2 text-slate-300">
                    <Store className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-white block">
                        {del.order?.shop?.shopName || 'Agri Super Store'}
                      </span>
                      <span className="text-slate-400">
                        {del.order?.shop?.addressLine || 'Main Market, Guntur'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 text-slate-300">
                    <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-white block">
                        {del.order?.shippingAddress?.recipientName || 'Farmer Customer'}
                      </span>
                      <span className="text-slate-400">
                        {del.order?.shippingAddress
                          ? `${del.order.shippingAddress.villageTaluk}, ${del.order.shippingAddress.district}`
                          : 'District Village'}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card padding="lg" className="bg-slate-900 border-slate-800 text-center py-16 space-y-2">
          <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto text-2xl">
            📜
          </div>
          <h4 className="font-bold text-sm text-slate-300">
            {t('delivery.noHistoryRecords', 'No delivery history records found')}
          </h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {t('delivery.historyEmptyDesc', 'Completed and processed delivery records will appear here automatically.')}
          </p>
        </Card>
      )}
    </div>
  );
}
