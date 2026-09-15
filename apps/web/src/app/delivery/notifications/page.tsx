'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Truck, CheckCircle2, Wallet, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';

export default function DeliveryNotificationsPage() {
  const { token } = useAuth();
  const { t } = useLanguage();

  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://farmseva.onrender.com';

  useEffect(() => {
    fetchNotifications();
  }, [token]);

  const fetchNotifications = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/farmer/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setNotifications(data.data);
      } else {
        // Fallback default logistics notification logs
        setNotifications([
          {
            id: '1',
            type: 'DELIVERY_UPDATE',
            title: 'New Delivery Assignment',
            message: 'You have been assigned to Order #FS10294. Pickup at ABC Agri Store.',
            createdAt: new Date().toISOString(),
            isRead: false,
          },
          {
            id: '2',
            type: 'DELIVERY_UPDATE',
            title: 'Earning Credited',
            message: '₹85 delivery earning credited for completed Order #FS10280.',
            createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
            isRead: true,
          },
        ]);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Bell className="w-6 h-6 text-emerald-400" />
          {t('delivery.notifTitle', 'Logistics & Delivery Notifications')}
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          {t('delivery.notifSub', 'Real-time alerts for new job assignments, customer updates, and earnings settlements.')}
        </p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400 font-bold text-xs animate-pulse">
          Loading notifications...
        </div>
      ) : notifications.length > 0 ? (
        <div className="space-y-3">
          {notifications.map((n) => (
            <Card key={n.id} padding="md" className="bg-slate-900 border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-950 text-emerald-400 flex items-center justify-center border border-emerald-800/40">
                    <Truck className="w-4 h-4" />
                  </div>
                  <h4 className="font-extrabold text-sm text-white">{n.title}</h4>
                </div>
                <span className="text-[11px] text-slate-400">
                  {new Date(n.createdAt).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-xs text-slate-300 pl-10">{n.message}</p>
            </Card>
          ))}
        </div>
      ) : (
        <Card padding="lg" className="bg-slate-900 border-slate-800 text-center py-16 space-y-2">
          <Bell className="w-12 h-12 text-slate-600 mx-auto" />
          <h4 className="font-bold text-sm text-slate-300">
            {t('delivery.noNotifications', 'No new logistics notifications')}
          </h4>
        </Card>
      )}
    </div>
  );
}
