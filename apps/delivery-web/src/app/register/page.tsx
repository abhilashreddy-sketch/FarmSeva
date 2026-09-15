'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { API_BASE_URL } from '../../config/api';

export default function DeliveryRegisterPage() {
  const [fullName, setFullName] = useState('');
  const [vehicleType, setVehicleType] = useState('Bike');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [activeDistrict, setActiveDistrict] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Submitting driver registration...');
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/register/delivery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, vehicleType, vehicleNumber, activeDistrict, phone, password }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus(`Driver registered successfully for ${fullName}`);
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
        <h1 className="text-2xl font-black text-white">Delivery Driver Registration</h1>
        <p className="text-xs text-slate-400 font-medium">Join district last-mile logistics on FARM SEVA DELIVERY</p>
      </div>

      <form onSubmit={handleRegister} className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 shadow-xl text-slate-200">
        {status && (
          <div className="p-3 bg-purple-950 text-purple-200 text-xs font-semibold rounded-xl border border-purple-800">
            {status}
          </div>
        )}

        <div>
          <label className="text-xs font-bold text-slate-300 block mb-1">Driver Full Name</label>
          <input
            type="text"
            placeholder="Suresh Reddy"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-700 bg-slate-950 rounded-xl text-white"
            required
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-300 block mb-1">Vehicle Type</label>
          <select
            value={vehicleType}
            onChange={(e) => setVehicleType(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-700 bg-slate-950 rounded-xl text-white"
          >
            <option value="Bike">Motorcycle / Scooter</option>
            <option value="Auto">Auto Rickshaw / Cargo Three Wheeler</option>
            <option value="Pickup Truck">Pickup Truck / Tata Ace</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-300 block mb-1">Vehicle Reg. Number</label>
          <input
            type="text"
            placeholder="AP 39 AB 1234"
            value={vehicleNumber}
            onChange={(e) => setVehicleNumber(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-700 bg-slate-950 rounded-xl text-white"
            required
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-300 block mb-1">Active District</label>
          <input
            type="text"
            placeholder="Warangal, Guntur, Nashik..."
            value={activeDistrict}
            onChange={(e) => setActiveDistrict(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-700 bg-slate-950 rounded-xl text-white"
            required
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-300 block mb-1">Phone Number</label>
          <input
            type="tel"
            placeholder="9876543210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
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
          Register Driver Profile
        </button>
      </form>

      <p className="text-xs text-center text-slate-400">
        Already registered? <Link href="/login" className="text-purple-400 font-bold hover:underline">Sign In</Link>
      </p>
    </div>
  );
}
