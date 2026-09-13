'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../../../context/AuthContext';

import { API_BASE_URL } from '@/config/api';

export default function FarmerConsultationChatPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const consultationId = params?.id as string;

  const [consultation, setConsultation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!isLoading) {
      if (!user) router.push('/login');
      else loadConsultation();
    }
  }, [user, isLoading, token, consultationId, router]);

  const loadConsultation = async () => {
    if (!token || !consultationId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/farmer/consultations/${consultationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) setConsultation(json.data);
    } catch (e) {
      console.error('Error loading consultation chat:', e);
    }
    setLoading(false);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !token || !consultationId) return;
    setSending(true);
    setErrorMsg('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/farmer/consultations/${consultationId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ messageText }),
      });
      const json = await res.json();
      setSending(false);
      if (json.success) {
        setMessageText('');
        loadConsultation();
      } else {
        setErrorMsg(json.error?.message || 'Failed to send message.');
      }
    } catch (e) {
      setSending(false);
      setErrorMsg('Error sending message.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-emerald-50/40 p-6 flex justify-center items-center text-gray-600 font-medium">
        Loading consultation chat...
      </div>
    );
  }

  if (!consultation) {
    return (
      <div className="min-h-screen bg-emerald-50/40 p-6 flex flex-col justify-center items-center">
        <div className="text-4xl mb-2">💬</div>
        <h2 className="text-xl font-bold text-gray-800">Consultation Session Not Found</h2>
        <button onClick={() => router.push('/farmer/crop-problems')} className="mt-4 text-emerald-700 font-bold hover:underline">
          ⬅ Return to Crop Reports
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-emerald-50/30 p-4 md:p-6 max-w-4xl mx-auto flex flex-col h-[calc(100vh-2rem)]">
      {/* Header */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-emerald-100 flex justify-between items-center mb-4">
        <div>
          <button onClick={() => router.push(`/farmer/crop-problems/${consultation.cropProblemId}`)} className="text-xs font-bold text-emerald-700 hover:underline">
            ⬅ View Problem Report
          </button>
          <h1 className="text-lg font-black text-gray-900 mt-0.5">
            👨‍🌾 Expert Consultation: {consultation.expert?.user?.fullName || 'Assigned Agronomist'}
          </h1>
          <p className="text-xs text-gray-500">
            {consultation.expert?.specialization || 'Crop Protection Specialist'} • Status: <span className="font-bold text-emerald-800">{consultation.status}</span>
          </p>
        </div>
        <span className="text-xs font-bold px-3 py-1 bg-emerald-100 text-emerald-900 rounded-full">
          Live Chat
        </span>
      </div>

      {errorMsg && (
        <div className="bg-red-50 text-red-800 p-3 rounded-xl border border-red-200 text-xs font-semibold mb-3">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Guidance Card (If present) */}
      {consultation.guidance && (
        <div className="bg-emerald-800 text-white p-4 rounded-2xl shadow-md mb-4 text-xs space-y-2 shrink-0">
          <div className="font-extrabold text-sm flex items-center gap-2">
            <span>🩺</span> Official Expert Advisory Issued
          </div>
          <div><strong>Diagnosis:</strong> {consultation.guidance.diagnosis}</div>
          {consultation.guidance.remediationSteps && (
            <div><strong>Remediation:</strong> {consultation.guidance.remediationSteps}</div>
          )}
        </div>
      )}

      {/* Chat Messages */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-emerald-100 flex-1 overflow-y-auto space-y-4 mb-4">
        {consultation.messages?.length === 0 ? (
          <div className="text-center text-gray-400 py-12 text-sm">
            No messages yet. Ask your agricultural expert any question about your crop!
          </div>
        ) : (
          consultation.messages?.map((msg: any) => {
            const isMe = msg.senderUserId === user?.id;
            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div
                  className={`max-w-md p-3.5 rounded-2xl text-sm leading-relaxed ${
                    isMe
                      ? 'bg-emerald-700 text-white rounded-br-none shadow-sm'
                      : 'bg-emerald-50 text-gray-900 border border-emerald-100 rounded-bl-none'
                  }`}
                >
                  <div className="text-[10px] font-bold mb-1 opacity-80">
                    {msg.sender?.fullName || (isMe ? 'You' : 'Expert')} ({msg.senderRole?.replace('_', ' ')})
                  </div>
                  <p>{msg.messageText}</p>
                  <div className="text-[9px] text-right mt-1 opacity-70">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Reply Input Box */}
      <form onSubmit={handleSendMessage} className="bg-white p-3 rounded-2xl shadow-sm border border-emerald-100 flex items-center gap-2 shrink-0">
        <input
          type="text"
          placeholder="Type your message to the expert..."
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          className="flex-1 border border-gray-200 p-3 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
        />
        <button
          type="submit"
          disabled={sending || !messageText.trim()}
          className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-6 py-3 rounded-xl shadow-md disabled:opacity-50 text-sm"
        >
          {sending ? 'Sending...' : 'Send ➔'}
        </button>
      </form>
    </div>
  );
}
