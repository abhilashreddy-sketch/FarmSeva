'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { API_BASE_URL } from '../../config/api';

export default function SellerRegisterPage() {
  const [businessName, setBusinessName] = useState('');
  const [fullName, setFullName] = useState('');
  const [pesticideLicenseNo, setPesticideLicenseNo] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Submitting dealer registration...');
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/register/seller`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessName, fullName, pesticideLicenseNo, phone, email, password }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus(`Agri shop registered successfully for ${businessName}`);
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
        <h1 className="text-2xl font-black text-slate-900">Agri Shop Registration</h1>
        <p className="text-xs text-slate-600 font-medium">Register your retail shop on FARM SEVA SELLER</p>
      </div>

      <form onSubmit={handleRegister} className="p-6 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-sm">
        {status && (
          <div className="p-3 bg-amber-50 text-amber-900 text-xs font-semibold rounded-xl border border-amber-200">
            {status}
          </div>
        )}

        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Shop / Business Name</label>
          <input
            type="text"
            placeholder="Kisan Krishi Kendra"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
            required
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Proprietor Name</label>
          <input
            type="text"
            placeholder="Vijay Sharma"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
            required
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Pesticide License No.</label>
          <input
            type="text"
            placeholder="LIC/DL/2026/8892"
            value={pesticideLicenseNo}
            onChange={(e) => setPesticideLicenseNo(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
            required
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Phone Number</label>
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
          <label className="text-xs font-bold text-slate-700 block mb-1">Email Address</label>
          <input
            type="email"
            placeholder="dealer@farmseva.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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

        <button type="submit" className="w-full py-2.5 bg-amber-600 text-white font-bold text-xs rounded-xl hover:bg-amber-700">
          Register Agri Shop
        </button>
      </form>

      <p className="text-xs text-center text-slate-600">
        Already registered? <Link href="/login" className="text-amber-700 font-bold hover:underline">Sign In</Link>
      </p>
    </div>
  );
}
