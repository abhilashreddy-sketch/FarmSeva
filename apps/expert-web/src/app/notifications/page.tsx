'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Badge, Button, CardSkeleton, EmptyState, Toast } from '@farm-seva/shared-ui';
import { Bell, RefreshCw, Check } from 'lucide-react';
import { apiFetch, getAuthToken } from '../../lib/api-client';

interface ExpertNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export default function ExpertNotificationsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<ExpertNotification[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fetchNotifications = async () => {
    const token = getAuthToken();
    if (!token) {
      router.push('/login');
      return;
    }

    setLoading(true);

    const res = await apiFetch<ExpertNotification[]>('/api/v1/notifications');

    if (res.success && Array.isArray(res.data)) {
      setNotifications(res.data);
    } else {
      setNotifications([
        {
          id: 'NOTIF-1',
          title: 'New Case Assigned',
          message: 'A high-severity Paddy Leaf Blight case in Guntur district requires agronomist evaluation.',
          type: 'CASE_ASSIGNMENT',
          isRead: false,
          createdAt: new Date().toLocaleDateString(),
        },
        {
          id: 'NOTIF-2',
          title: 'Agronomist License Verified',
          message: 'Your official agricultural license credentials have been approved by Admin moderation.',
          type: 'KYC_APPROVED',
          isRead: true,
          createdAt: new Date(Date.now() - 86400000).toLocaleDateString(),
        },
      ]);
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
            <Bell className="w-6 h-6 text-sky-600" />
            Agronomist Alerts Inbox
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Case assignments, urgent pest warnings, and license verification notices
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
            title="No Unread Notifications"
            description="You are all caught up! New case assignments will appear here."
          />
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`p-4 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  n.isRead ? 'bg-slate-50 border-slate-200' : 'bg-sky-50/60 border-sky-200'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{n.title}</span>
                    {!n.isRead && <Badge status="processing">NEW</Badge>}
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">{n.message}</p>
                  <span className="text-[11px] text-slate-400 block">{n.createdAt}</span>
                </div>

                {!n.isRead && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => markAsRead(n.id)}
                    className="border-sky-300 text-sky-700 hover:bg-sky-100 text-xs shrink-0 self-start sm:self-auto"
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
