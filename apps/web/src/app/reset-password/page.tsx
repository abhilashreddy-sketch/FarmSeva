'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

import { API_BASE_URL } from '@/config/api';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) setToken(tokenParam);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMsg('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json();
      setIsSubmitting(false);

      if (data.success) {
        setIsSuccess(true);
        setMsg('Password reset successfully! Redirecting to login...');
        setTimeout(() => router.push('/login'), 2000);
      } else {
        setMsg(data.error?.message || 'Failed to reset password');
      }
    } catch (err) {
      setIsSubmitting(false);
      setMsg('Network error completing password reset');
    }
  };

  return (
    <div className="max-w-md mx-auto py-8 space-y-6">
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl border border-emerald-100 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center text-3xl mx-auto">
            🔑
          </div>
          <h1 className="text-2xl font-black text-emerald-950">Reset Password</h1>
          <p className="text-xs font-semibold text-gray-500">
            Enter your reset token and your new password
          </p>
        </div>

        {msg && (
          <div
            className={`p-4 rounded-2xl text-xs font-bold ${
              isSuccess
                ? 'bg-emerald-50 border-2 border-emerald-300 text-emerald-800'
                : 'bg-red-50 border-2 border-red-300 text-red-700'
            }`}
          >
            {msg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-extrabold text-gray-700 mb-1">
              Reset Token *
            </label>
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste token here"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 font-mono text-xs font-bold"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-gray-700 mb-1">
              New Password *
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 font-bold"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base py-3.5 rounded-xl shadow transition"
          >
            {isSubmitting ? 'Updating Password...' : 'Set New Password'}
          </button>
        </form>
      </div>
    </div>
  );
}


export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center font-bold text-gray-600">Loading Reset Password...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
