'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';

import { API_BASE_URL } from '@/config/api';

export default function AdminEmergencyBroadcastPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetState, setTargetState] = useState('');
  const [targetDistrict, setTargetDistrict] = useState('');
  const [targetCrop, setTargetCrop] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('');
  const [channels, setChannels] = useState<string[]>(['IN_APP', 'SMS', 'WHATSAPP', 'PUSH']);

  const [sending, setSending] = useState(false);
  const [resultMsg, setResultMsg] = useState('');

  useEffect(() => {
    if (!isLoading) {
      if (!user || user.role !== 'ADMIN') {
        router.push('/login');
      }
    }
  }, [user, isLoading, router]);

  const handleChannelToggle = (channel: string) => {
    if (channels.includes(channel)) {
      if (channels.length === 1) return; // Must keep at least one
      setChannels(channels.filter((c) => c !== channel));
    } else {
      setChannels([...channels, channel]);
    }
  };

  const handleDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setResultMsg('');
    setSending(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/communications/emergency-broadcast`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          message,
          targetState: targetState || undefined,
          targetDistrict: targetDistrict || undefined,
          targetCrop: targetCrop || undefined,
          targetLanguage: targetLanguage || undefined,
          channels,
        }),
      });

      const data = await res.json();
      setSending(false);

      if (data.success) {
        setResultMsg(`✅ Emergency broadcast dispatched to ${data.data.recipientCount} farmer(s)!`);
        setTitle('');
        setMessage('');
      } else {
        setResultMsg(`⚠️ ${data.error?.message || 'Failed to dispatch broadcast'}`);
      }
    } catch (e) {
      setSending(false);
      setResultMsg('⚠️ Network error dispatching emergency broadcast');
    }
  };

  if (isLoading) return <div className="p-8 text-center font-bold">Loading Admin Broadcast Portal...</div>;

  return (
    <div className="max-w-3xl mx-auto py-6 px-4 space-y-6">
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl border border-red-100 space-y-6">
        <div className="border-b border-gray-100 pb-4">
          <h1 className="text-2xl font-black text-red-950 flex items-center gap-2">
            🚨 Regional Emergency Broadcast Portal
          </h1>
          <p className="text-xs font-semibold text-gray-500">
            Dispatch urgent agricultural hazard alerts, pest outbreak warnings, or extreme weather notices directly to target farmers across SMS, WhatsApp, Push, and IVR.
          </p>
        </div>

        {resultMsg && (
          <div
            className={`p-4 rounded-2xl text-xs font-bold ${
              resultMsg.startsWith('⚠️') ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-800'
            }`}
          >
            {resultMsg}
          </div>
        )}

        <form onSubmit={handleDispatch} className="space-y-4">
          <div>
            <label className="block text-xs font-extrabold text-gray-800 mb-1">Broadcast Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Locust Outbreak Warning - Guntur District"
              className="w-full px-3.5 py-3 rounded-xl border-2 border-gray-200 font-bold"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-gray-800 mb-1">Alert Message Content *</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Provide actionable advisory instructions for farmers in target region..."
              rows={4}
              className="w-full px-3.5 py-3 rounded-xl border-2 border-gray-200 font-bold"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-gray-800 mb-1">Target State (Optional)</label>
              <input
                type="text"
                value={targetState}
                onChange={(e) => setTargetState(e.target.value)}
                placeholder="e.g. Andhra Pradesh"
                className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-extrabold text-gray-800 mb-1">Target District (Optional)</label>
              <input
                type="text"
                value={targetDistrict}
                onChange={(e) => setTargetDistrict(e.target.value)}
                placeholder="e.g. Guntur"
                className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-gray-800 mb-1">Target Crop (Optional)</label>
              <input
                type="text"
                value={targetCrop}
                onChange={(e) => setTargetCrop(e.target.value)}
                placeholder="e.g. Chilli"
                className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-extrabold text-gray-800 mb-1">Target Language (Optional)</label>
              <select
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 font-bold bg-white"
              >
                <option value="">All Languages</option>
                <option value="en">English</option>
                <option value="te">తెలుగు (Telugu)</option>
                <option value="kn">ಕನ್ನಡ (Kannada)</option>
                <option value="hi">हिन्दी (Hindi)</option>
                <option value="ta">தமிழ் (Tamil)</option>
                <option value="mr">मराठी (Marathi)</option>
              </select>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <label className="block text-xs font-extrabold text-gray-800">Dispatch Channels *</label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {['IN_APP', 'SMS', 'WHATSAPP', 'PUSH', 'IVR'].map((ch) => (
                <button
                  type="button"
                  key={ch}
                  onClick={() => handleChannelToggle(ch)}
                  className={`py-2 px-3 text-xs font-black rounded-xl border transition ${
                    channels.includes(ch)
                      ? 'bg-red-600 text-white border-red-600'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-red-400'
                  }`}
                >
                  {ch}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={sending}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-black text-base py-3.5 rounded-xl shadow-lg transition mt-6"
          >
            {sending ? 'Dispatching Broadcast...' : '🚀 Dispatch Emergency Broadcast Now'}
          </button>
        </form>
      </div>
    </div>
  );
}
