'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { API_BASE_URL } from '../../config/api';

export default function FarmerRegisterPage() {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Submitting registration to shared API...');
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/register/farmer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, phone, password }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus(`Account registered successfully for ${data.data.user.fullName}`);
      } else {
        setStatus(`Registration Error: ${data.error?.message || 'Failed'}`);
      }
    } catch (err: any) {
      setStatus('Unable to connect to shared Express REST API');
    }
  };

  return (
    <div className="max-w-md mx-auto py-10 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-black text-slate-900">Farmer Registration</h1>
        <p className="text-xs text-slate-600 font-medium">Create your free FARM SEVA farmer profile</p>
      </div>

      <form onSubmit={handleRegister} className="p-6 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-sm">
        {status && (
          <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-xl border border-emerald-200">
            {status}
          </div>
        )}

        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Full Name</label>
          <input
            type="text"
            placeholder="Ramesh Kumar"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
            required
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Mobile Phone Number</label>
          <input
            type="tel"
            placeholder="9876543210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
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
          Register Farmer Account
        </button>
      </form>

      <p className="text-xs text-center text-slate-600">
        Already registered? <Link href="/login" className="text-emerald-700 font-bold hover:underline">Sign In</Link>
      </p>
    </div>
  );
}
