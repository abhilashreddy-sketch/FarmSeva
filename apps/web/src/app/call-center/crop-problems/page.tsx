'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';

import { API_BASE_URL } from '@/config/api';

export default function CallCenterCropProblemsPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();

  const [farmerPhone, setFarmerPhone] = useState('9888800001');
  const [farms, setFarms] = useState<any[]>([]);
  const [loadingFarms, setLoadingFarms] = useState(false);

  // Form State
  const [farmerId, setFarmerId] = useState('');
  const [farmId, setFarmId] = useState('');
  const [fieldId, setFieldId] = useState('');
  const [cropId, setCropId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('MODERATE');
  const [callerNotes, setCallerNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (!isLoading) {
      if (!user) router.push('/login');
    }
  }, [user, isLoading, router]);

  const handleLookupFarmer = async () => {
    if (!token || !farmerPhone) return;
    setLoadingFarms(true);
    setErrorMsg('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/call-center/farmer-farms?phone=${farmerPhone}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      setLoadingFarms(false);
      if (json.success) {
        setFarms(json.data.farms || []);
        setFarmerId(json.data.farmerId || '');
      } else {
        setErrorMsg(json.error?.message || 'Farmer lookup failed.');
      }
    } catch (e) {
      setLoadingFarms(false);
      setErrorMsg('Error looking up farmer.');
    }
  };

  const selectedFarm = farms.find((f) => f.id === farmId);
  const fields = selectedFarm?.fields || [];
  const selectedField = fields.find((f: any) => f.id === fieldId);
  const crops = selectedField?.crops || [];

  const handleSubmitAssistedProblem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmerId || !farmId || !fieldId || !cropId) {
      setErrorMsg('Please select Farm, Field, and Crop for farmer.');
      return;
    }
    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/call-center/crop-problems`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          farmerId,
          farmId,
          fieldId,
          cropId,
          title: title || 'Call-Center Logged Crop Problem',
          description,
          severity,
          callerNotes,
        }),
      });

      const json = await res.json();
      setSubmitting(false);
      if (json.success) {
        setSuccessMsg(`Crop problem successfully logged! Ticket ID: ${json.data.id}`);
        setTitle('');
        setDescription('');
        setCallerNotes('');
      } else {
        setErrorMsg(json.error?.message || 'Failed to log problem.');
      }
    } catch (e) {
      setSubmitting(false);
      setErrorMsg('Error logging problem.');
    }
  };

  return (
    <div className="min-h-screen bg-blue-50/40 p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-blue-900 text-white p-6 rounded-2xl shadow-md flex justify-between items-center">
        <div>
          <span className="text-xs font-bold text-blue-300 uppercase tracking-widest">Call Center Agent Workstation</span>
          <h1 className="text-2xl font-black mt-1">Assisted Farmer Crop Problem Logging</h1>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-50 text-red-800 p-4 rounded-xl border border-red-200 text-sm font-semibold">
          ⚠️ {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl border border-emerald-200 text-sm font-semibold">
          ✅ {successMsg}
        </div>
      )}

      {/* Step 1: Farmer Lookup */}
      <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-gray-900 border-b pb-2">1. Search Farmer Account</h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter Farmer Phone (e.g. 9888800001)"
            value={farmerPhone}
            onChange={(e) => setFarmerPhone(e.target.value)}
            className="flex-1 border p-3 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <button
            onClick={handleLookupFarmer}
            disabled={loadingFarms}
            className="bg-blue-800 hover:bg-blue-900 text-white font-bold px-6 py-3 rounded-xl text-sm disabled:opacity-50"
          >
            {loadingFarms ? 'Searching...' : 'Lookup Farmer'}
          </button>
        </div>
      </div>

      {/* Step 2: Form */}
      {farms.length > 0 && (
        <form onSubmit={handleSubmitAssistedProblem} className="bg-white p-6 rounded-2xl border shadow-sm space-y-5">
          <h2 className="text-lg font-bold text-gray-900 border-b pb-2">2. Log Crop Problem Details</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Select Farm *</label>
              <select
                value={farmId}
                onChange={(e) => {
                  setFarmId(e.target.value);
                  setFieldId('');
                  setCropId('');
                }}
                className="w-full border p-3 rounded-xl text-sm"
              >
                <option value="">Select Farm</option>
                {farms.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Select Field *</label>
              <select
                value={fieldId}
                onChange={(e) => {
                  setFieldId(e.target.value);
                  setCropId('');
                }}
                className="w-full border p-3 rounded-xl text-sm"
              >
                <option value="">Select Field</option>
                {fields.map((f: any) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Select Crop *</label>
              <select
                value={cropId}
                onChange={(e) => setCropId(e.target.value)}
                className="w-full border p-3 rounded-xl text-sm"
              >
                <option value="">Select Crop</option>
                {crops.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.cropName}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Farmer reported stem borer attack"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border p-3 rounded-xl text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Symptoms Reported by Farmer *</label>
            <textarea
              rows={3}
              required
              placeholder="Details spoken by farmer over call..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border p-3 rounded-xl text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Agent Call Notes (Audit)</label>
            <input
              type="text"
              placeholder="e.g. Caller spoke in Telugu. Advised farmer that expert will review."
              value={callerNotes}
              onChange={(e) => setCallerNotes(e.target.value)}
              className="w-full border p-3 rounded-xl text-sm"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-800 hover:bg-blue-900 text-white font-black px-8 py-3 rounded-xl shadow-md text-sm disabled:opacity-50"
            >
              {submitting ? 'Logging Problem...' : 'Submit Assisted Problem Report'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
