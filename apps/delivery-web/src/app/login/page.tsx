'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { API_BASE_URL } from '../../config/api';

export default function DeliveryLoginPage() {
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
        setStatus(`Driver logged in successfully as ${data.data.user.fullName}`);
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
        <h1 className="text-2xl font-black text-white">Driver Sign In</h1>
        <p className="text-xs text-slate-400 font-medium">Access your Logistics Driver Console</p>
      </div>

      <form onSubmit={handleLogin} className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 shadow-xl text-slate-200">
        {status && (
          <div className="p-3 bg-purple-950 text-purple-200 text-xs font-semibold rounded-xl border border-purple-800">
            {status}
          </div>
        )}

        <div>
          <label className="text-xs font-bold text-slate-300 block mb-1">Phone or Email</label>
          <input
            type="text"
            placeholder="9876543210 or driver@farmseva.com"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-700 bg-slate-950 rounded-xl text-white"
            required
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-300 block mb-1">Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-700 bg-slate-950 rounded-xl text-white"
            required
          />
        </div>

        <button type="submit" className="w-full py-2.5 bg-purple-600 text-white font-bold text-xs rounded-xl hover:bg-purple-500">
          Sign In to Delivery App
        </button>
      </form>

      <p className="text-xs text-center text-slate-400">
        New driver? <Link href="/register" className="text-purple-400 font-bold hover:underline">Register Account</Link>
      </p>
    </div>
  );
}
