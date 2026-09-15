'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { API_BASE_URL } from '../../config/api';

export default function FarmerLoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Connecting to API...');
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: identifier, password }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus(`Logged in successfully as ${data.data.user.fullName} (${data.data.user.role})`);
      } else {
        setStatus(`Auth Error: ${data.error?.message || 'Login failed'}`);
      }
    } catch (err: any) {
      setStatus('Unable to connect to shared Express REST API');
    }
  };

  return (
    <div className="max-w-md mx-auto py-10 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-black text-slate-900">Farmer Sign In</h1>
        <p className="text-xs text-slate-600 font-medium">Access your FARM SEVA Customer Portal</p>
      </div>

      <form onSubmit={handleLogin} className="p-6 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-sm">
        {status && (
          <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-xl border border-emerald-200">
            {status}
          </div>
        )}

        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Email or Phone</label>
          <input
            type="text"
            placeholder="farmer@example.com"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
            required
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
            required
          />
        </div>

        <button type="submit" className="w-full py-2.5 bg-emerald-800 text-white font-bold text-xs rounded-xl hover:bg-emerald-700">
          Sign In to Farmer App
        </button>
      </form>

      <p className="text-xs text-center text-slate-600">
        New farmer? <Link href="/register" className="text-emerald-700 font-bold hover:underline">Create Account</Link>
      </p>
    </div>
  );
}
