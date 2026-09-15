'use client';

import React, { useEffect, useState } from 'react';
import {
  Badge,
  CardSkeleton,
  EmptyState,
} from '@farm-seva/shared-ui';
import { Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { apiFetch, getAuthToken } from '../../lib/api-client';

export default function SellerNotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadNotifications() {
      const token = getAuthToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const res = await apiFetch<any[]>('/api/v1/notifications');
      if (res.success && Array.isArray(res.data)) {
        setNotifications(res.data);
      }
      setIsLoading(false);
    }
    loadNotifications();
  }, []);

  if (!getAuthToken()) {
    return (
      <div className="max-w-md mx-auto py-12 text-center space-y-4">
        <EmptyState
          title="Sign In Required"
          description="Please sign in to view your merchant notifications."
          actionLabel="Sign In Now"
          onAction={() => router.push('/login')}
        />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-4 space-y-6">
      <div className="space-y-1">
        <Badge status="pending">Merchant Notifications</Badge>
        <h1 className="text-2xl font-black text-slate-900">Notifications & Alerts</h1>
        <p className="text-xs text-slate-500">
          Incoming order alerts, inventory stock warnings, and trade license KYC updates.
        </p>
      </div>

      {isLoading ? (
        <CardSkeleton />
      ) : notifications.length > 0 ? (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 bg-white border rounded-2xl flex items-start gap-3 shadow-xs ${
                n.read ? 'border-slate-200 opacity-80' : 'border-amber-300 bg-amber-50/30'
              }`}
            >
              <Bell className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="space-y-1 flex-1">
                <h4 className="font-bold text-slate-900 text-sm">{n.title || n.subject || 'Merchant Alert'}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{n.message || n.body}</p>
                <p className="text-[10px] text-slate-400">
                  {n.createdAt ? new Date(n.createdAt).toLocaleString() : 'Just now'}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No Notifications Yet"
          description="You're all caught up! Order alerts and KYC moderation notices will appear here."
        />
      )}
    </div>
  );
}
