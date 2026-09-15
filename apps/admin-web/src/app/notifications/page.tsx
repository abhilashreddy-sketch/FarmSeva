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
  Toast,
} from '@farm-seva/shared-ui';
import { Bell, Radio, Send, RefreshCw, AlertTriangle, ShieldCheck } from 'lucide-react';
import { apiFetch, getAuthToken } from '../../lib/api-client';

interface AdminNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export default function AdminNotificationsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);

  // Emergency Broadcast Form State
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [targetAudience, setTargetAudience] = useState('ALL');
  const [sendingBroadcast, setSendingBroadcast] = useState(false);

  const [toast, setToast] = useState<{ title: string; message: string; type: 'success' | 'error' } | null>(null);

  const fetchNotifications = async () => {
    const token = getAuthToken();
    if (!token) {
      router.push('/login');
      return;
    }

    setLoading(true);
    setError(null);

    const res = await apiFetch<AdminNotification[]>('/api/v1/notifications');

    if (res.success && Array.isArray(res.data)) {
      setNotifications(res.data);
    } else {
      setError(res.error || 'Failed to fetch admin notifications log');
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendingBroadcast(true);

    const res = await apiFetch('/api/v1/communications/emergency-broadcast', {
      method: 'POST',
      body: JSON.stringify({
        title: broadcastTitle,
        message: broadcastMessage,
        targetAudience,
      }),
    });

    if (res.success) {
      setToast({
        title: 'Broadcast Dispatched',
        message: 'Emergency platform notification dispatched successfully',
        type: 'success',
      });
      setShowBroadcastModal(false);
      setBroadcastTitle('');
      setBroadcastMessage('');
      fetchNotifications();
    } else {
      setToast({
        title: 'Dispatch Failed',
        message: res.error || 'Failed to send emergency broadcast',
        type: 'error',
      });
    }

    setSendingBroadcast(false);
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
            <Bell className="w-6 h-6 text-slate-800" />
            Admin Operational Alerts & System Log Inbox
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Inspect operational alerts, system notifications, and trigger emergency broadcasts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchNotifications}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh Alerts
          </Button>
          <Button
            size="sm"
            onClick={() => setShowBroadcastModal(true)}
            className="bg-rose-600 hover:bg-rose-700 text-white font-bold"
            leftIcon={<Radio className="w-3.5 h-3.5" />}
          >
            Emergency Broadcast
          </Button>
        </div>
      </div>

      {loading ? (
        <CardSkeleton />
      ) : error ? (
        <ErrorState title="Alerts Log Unavailable" message={error} onRetry={fetchNotifications} />
      ) : notifications.length === 0 ? (
        <EmptyState
          title="No Operational Alerts"
          description="Your administrative notification log is clean with no pending alerts."
          icon={<Bell className="w-8 h-8 text-slate-400" />}
        />
      ) : (
        <Card className="divide-y divide-slate-200 border-slate-200">
          {notifications.map((n) => (
            <div key={n.id} className="p-4 hover:bg-slate-50 transition space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  {n.title}
                </span>
                <span className="text-[10px] text-slate-400">
                  {new Date(n.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-slate-600">{n.message}</p>
            </div>
          ))}
        </Card>
      )}

      {/* Emergency Broadcast Modal */}
      {showBroadcastModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form onSubmit={handleSendBroadcast} className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Radio className="w-5 h-5 text-rose-600" />
              Dispatch Platform Emergency Broadcast
            </h3>
            <p className="text-xs text-slate-500">
              Send immediate push alerts & SMS notifications to target platform user groups.
            </p>

            <TextInput
              label="Alert Title"
              required
              placeholder="e.g. Extreme Weather Advisory"
              value={broadcastTitle}
              onChange={(e) => setBroadcastTitle(e.target.value)}
            />

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Target Audience</label>
              <select
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="ALL">All Platform Users</option>
                <option value="FARMER">Farmers Only</option>
                <option value="SELLER">Sellers Only</option>
                <option value="DELIVERY_PARTNER">Delivery Partners Only</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Broadcast Message Body</label>
              <textarea
                required
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                placeholder="Write urgent operational alert message..."
                rows={4}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" type="button" onClick={() => setShowBroadcastModal(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                type="submit"
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold"
                disabled={sendingBroadcast}
              >
                {sendingBroadcast ? 'Dispatching...' : 'Send Broadcast'}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
