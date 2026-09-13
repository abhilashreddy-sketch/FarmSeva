'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '../../context/LanguageContext';

import { API_BASE_URL } from '@/config/api';

export default function ForgotPasswordPage() {
  const { t } = useLanguage();
  const [phone, setPhone] = useState('');
  const [msg, setMsg] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMsg('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      setIsSubmitting(false);

      if (data.success) {
        setMsg('Password reset instructions generated.');
        if (data.data?.resetToken) {
          setResetToken(data.data.resetToken);
        }
      } else {
        setMsg(data.error?.message || 'Failed to process request');
      }
    } catch (err) {
      setIsSubmitting(false);
      setMsg('Network error requesting password reset');
    }
  };

  return (
    <div className="max-w-md mx-auto py-8 space-y-6">
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl border border-emerald-100 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center text-3xl mx-auto">
            🔐
          </div>
          <h1 className="text-2xl font-black text-emerald-950">{t('forgotPassword')}</h1>
          <p className="text-xs font-semibold text-gray-500">
            Enter your mobile number to receive a reset token
          </p>
        </div>

        {msg && (
          <div className="bg-emerald-50 border-2 border-emerald-300 text-emerald-800 p-4 rounded-2xl text-xs font-bold space-y-2">
            <p>{msg}</p>
            {resetToken && (
              <div className="bg-amber-100 p-3 rounded-xl border border-amber-300">
                <span className="block text-[10px] text-amber-900 uppercase">Development Mode Reset Token:</span>
                <code className="text-xs font-mono font-black text-amber-950 break-all">{resetToken}</code>
                <Link
                  href={`/reset-password?token=${resetToken}`}
                  className="block mt-2 bg-amber-500 text-emerald-950 text-center py-2 rounded-lg font-black text-xs hover:bg-amber-400"
                >
                  Proceed to Reset Password →
                </Link>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-extrabold text-gray-700 mb-1">
              Mobile Phone Number
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="9876543210"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 font-bold"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base py-3.5 rounded-xl shadow transition"
          >
            {isSubmitting ? 'Sending Request...' : 'Send Reset Instructions'}
          </button>
        </form>

        <div className="text-center pt-2">
          <Link href="/login" className="text-xs font-extrabold text-emerald-700 hover:underline">
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
