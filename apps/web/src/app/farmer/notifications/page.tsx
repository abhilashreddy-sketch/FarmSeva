'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';

import { API_BASE_URL } from '@/config/api';

export default function FarmerNotificationsPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();

  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterUnread, setFilterUnread] = useState<boolean>(false);
  const [msg, setMsg] = useState<string>('');

  useEffect(() => {
    if (!isLoading) {
      if (!user) router.push('/login');
      else loadNotifications();
    }
  }, [user, isLoading, token, router, filterUnread]);

  const loadNotifications = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const url = `${API_BASE_URL}/api/v1/notifications?unreadOnly=${filterUnread}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setNotifications(data.data.notifications || []);
        setUnreadCount(data.data.unreadCount || 0);
      }
    } catch (e) {
      console.error('Failed to load notifications:', e);
    }
    setLoading(false);
  };

  const handleMarkAsRead = async (id: string) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        loadNotifications();
      }
    } catch (e) {
      console.error('Failed to mark notification as read:', e);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/notifications/read-all`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setMsg('All notifications marked as read.');
        loadNotifications();
      }
    } catch (e) {
      console.error('Failed to mark all as read:', e);
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'ORDER_UPDATE':
        return <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-1 rounded-full font-bold">📦 Order</span>;
      case 'DELIVERY_UPDATE':
        return <span className="bg-purple-100 text-purple-800 text-xs px-2.5 py-1 rounded-full font-bold">🚚 Delivery</span>;
      case 'CONSULTATION_UPDATE':
        return <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-1 rounded-full font-bold">🌿 Expert Advisory</span>;
      case 'EMERGENCY_BROADCAST':
        return <span className="bg-red-100 text-red-800 text-xs px-2.5 py-1 rounded-full font-bold animate-pulse">🚨 Emergency</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 text-xs px-2.5 py-1 rounded-full font-bold">📢 Notice</span>;
    }
  };

  if (isLoading || loading) return <div className="p-8 text-center font-bold">Loading Notifications...</div>;

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-6">
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl border border-emerald-100 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div>
            <h1 className="text-2xl font-black text-emerald-950 flex items-center gap-2">
              🔔 Notifications & Advisories
              {unreadCount > 0 && (
                <span className="bg-emerald-600 text-white text-xs px-2.5 py-0.5 rounded-full font-extrabold">
                  {unreadCount} New
                </span>
              )}
            </h1>
            <p className="text-xs font-semibold text-gray-500">
              Multi-channel agricultural alerts, order updates, and expert guidance.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setFilterUnread(!filterUnread)}
              className={`px-4 py-2 text-xs font-bold rounded-xl border transition ${
                filterUnread
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-500'
              }`}
            >
              {filterUnread ? 'Showing Unread Only' : 'Show All'}
            </button>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="px-4 py-2 text-xs font-bold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded-xl transition"
              >
                Mark All Read
              </button>
            )}
          </div>
        </div>

        {msg && (
          <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200">
            {msg}
          </div>
        )}

        {notifications.length === 0 ? (
          <div className="py-12 text-center text-gray-500 font-bold space-y-2">
            <div className="text-4xl">📭</div>
            <p>No notifications found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`p-4 md:p-5 rounded-2xl border transition ${
                  !n.isRead
                    ? 'bg-emerald-50/50 border-emerald-200 shadow-sm'
                    : 'bg-white border-gray-100 hover:border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {getTypeBadge(n.type)}
                      <h3 className={`text-sm font-bold ${!n.isRead ? 'text-emerald-950 font-black' : 'text-gray-800'}`}>
                        {n.title}
                      </h3>
                    </div>
                    <p className="text-xs font-semibold text-gray-600 leading-relaxed">{n.message}</p>
                    <div className="flex items-center gap-4 text-[11px] text-gray-400 font-medium pt-1">
                      <span>🕒 {new Date(n.createdAt).toLocaleString()}</span>
                      {n.deliveries && n.deliveries.length > 0 && (
                        <span>
                          📡 Channels: {n.deliveries.map((d: any) => d.channel).join(', ')}
                        </span>
                      )}
                    </div>
                  </div>

                  {!n.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(n.id)}
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-900 bg-white px-3 py-1.5 rounded-lg border border-emerald-200 shadow-sm whitespace-nowrap"
                    >
                      Mark Read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
