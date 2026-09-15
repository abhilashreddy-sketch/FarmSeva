'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Badge, Button, CardSkeleton, EmptyState, Toast } from '@farm-seva/shared-ui';
import { Bell, RefreshCw, Check } from 'lucide-react';
import { apiFetch, getAuthToken } from '../../lib/api-client';

interface DeliveryNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export default function DeliveryNotificationsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<DeliveryNotification[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fetchNotifications = async () => {
    const token = getAuthToken();
    if (!token) {
      router.push('/login');
      return;
    }

    setLoading(true);

    const res = await apiFetch<DeliveryNotification[]>('/api/v1/notifications');

    if (res.success && Array.isArray(res.data)) {
      setNotifications(res.data);
    } else {
      setNotifications([]);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id: string) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    await apiFetch(`/api/v1/notifications/${id}/read`, { method: 'PATCH' });
    setToast({ message: 'Notification marked as read', type: 'success' });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {toast && (
        <Toast
          title={toast.type === 'success' ? 'Success' : 'Error'}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Bell className="w-6 h-6 text-purple-600" />
            Partner Alerts Inbox
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Order dispatch assignments, pickup reminders, and payout updates
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchNotifications}
          className="border-slate-300 text-slate-700 hover:bg-slate-100 text-xs"
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Refresh Alerts
        </Button>
      </div>

      <Card className="p-4 border-slate-200 space-y-3">
        {loading ? (
          <CardSkeleton />
        ) : notifications.length === 0 ? (
          <EmptyState
            icon={<Bell className="w-12 h-12 text-slate-400" />}
            title="No Delivery Alerts"
            description="You are all caught up! New order dispatch notifications will appear here."
          />
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`p-4 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  n.isRead ? 'bg-slate-50 border-slate-200' : 'bg-purple-50/60 border-purple-200'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{n.title}</span>
                    {!n.isRead && <Badge status="processing">NEW</Badge>}
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">{n.message}</p>
                  <span className="text-[11px] text-slate-400 block">{new Date(n.createdAt || Date.now()).toLocaleDateString()}</span>
                </div>

                {!n.isRead && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => markAsRead(n.id)}
                    className="border-purple-300 text-purple-700 hover:bg-purple-100 text-xs shrink-0 self-start sm:self-auto"
                    leftIcon={<Check className="w-3.5 h-3.5" />}
                  >
                    Mark Read
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
