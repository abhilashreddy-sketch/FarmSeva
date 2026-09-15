'use client';

import React, { useState } from 'react';
import { API_BASE_URL } from '../../config/api';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Authenticating administrator credentials...');
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success && data.data?.user?.role === 'ADMIN') {
        setStatus(`Administrator authenticated successfully as ${data.data.user.fullName}`);
      } else if (data.success) {
        setStatus(`Access Denied: Account role '${data.data.user.role}' is not an Administrator.`);
      } else {
        setStatus(`Auth Error: ${data.error?.message || 'Authentication failed'}`);
      }
    } catch (err: any) {
      setStatus('Unable to connect to shared Express REST API');
    }
  };

  return (
    <div className="max-w-md mx-auto py-10 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-black text-slate-900">Protected Admin Login</h1>
        <p className="text-xs text-slate-600 font-medium">Operations & Governance Desk Authentication</p>
      </div>

      <form onSubmit={handleLogin} className="p-6 bg-white border border-slate-300 rounded-2xl space-y-4 shadow-xl">
        {status && (
          <div className="p-3 bg-slate-900 text-amber-400 text-xs font-semibold rounded-xl border border-slate-700">
            {status}
          </div>
        )}

        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Administrator Email</label>
          <input
            type="email"
            placeholder="admin@farmseva.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
            required
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Master Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
            required
          />
        </div>

        <button type="submit" className="w-full py-2.5 bg-slate-900 text-amber-400 font-bold text-xs rounded-xl hover:bg-slate-800">
          Authenticate System Administrator
        </button>
      </form>
    </div>
  );
}
