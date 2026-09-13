'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';

import { API_BASE_URL } from '@/config/api';

export default function AdminCropProblemsPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();

  const [problems, setProblems] = useState<any[]>([]);
  const [experts, setExperts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reassigningId, setReassigningId] = useState('');
  const [selectedExpertId, setSelectedExpertId] = useState('');

  useEffect(() => {
    if (!isLoading) {
      if (!user) router.push('/login');
      else loadData();
    }
  }, [user, isLoading, token, router]);

  const loadData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [probRes, expRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/v1/admin/crop-problems`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/api/v1/admin/experts`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const probJson = await probRes.json();
      const expJson = await expRes.json();
      if (probJson.success) setProblems(probJson.data);
      if (expJson.success) setExperts(expJson.data);
    } catch (e) {
      console.error('Error loading admin crop problem data:', e);
    }
    setLoading(false);
  };

  const handleAssign = async (problemId: string) => {
    if (!token || !selectedExpertId) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/admin/crop-problems/${problemId}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ expertId: selectedExpertId }),
      });
      const json = await res.json();
      if (json.success) {
        setReassigningId('');
        setSelectedExpertId('');
        loadData();
      }
    } catch (e) {
      console.error('Error assigning expert:', e);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gray-900 text-white p-6 rounded-2xl shadow-md flex justify-between items-center">
        <div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Admin Control Panel</span>
          <h1 className="text-2xl font-black mt-1">Platform Crop Problem Audit</h1>
        </div>
        <button onClick={() => router.push('/admin/experts')} className="bg-amber-400 text-gray-950 font-bold px-4 py-2 rounded-xl text-xs">
          Manage Experts ➔
        </button>
      </div>

      {loading ? (
        <div className="bg-white p-12 text-center rounded-2xl border text-gray-500">Loading platform reports...</div>
      ) : (
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 text-xs font-bold text-gray-600 uppercase border-b">
                <th className="p-4">Report ID</th>
                <th className="p-4">Farmer</th>
                <th className="p-4">Problem & Crop</th>
                <th className="p-4">Severity</th>
                <th className="p-4">Status</th>
                <th className="p-4">Assigned Expert</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm">
              {problems.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/80">
                  <td className="p-4 font-mono text-xs text-gray-500">{p.id.slice(0, 8)}</td>
                  <td className="p-4 font-semibold text-gray-900">
                    {p.farmer?.user?.fullName || 'Farmer'}
                    <div className="text-xs text-gray-400">{p.farmer?.user?.phone}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-gray-900">{p.title}</div>
                    <div className="text-xs text-gray-500">Crop: {p.crop?.cropName} • Farm: {p.farm?.name}</div>
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-red-100 text-red-800">
                      {p.severity}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-900">
                      {p.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4 text-xs font-bold text-gray-700">
                    {p.expert?.user?.fullName || <span className="text-amber-600 italic">Unassigned</span>}
                  </td>
                  <td className="p-4 text-right">
                    {reassigningId === p.id ? (
                      <div className="flex items-center gap-2 justify-end">
                        <select
                          value={selectedExpertId}
                          onChange={(e) => setSelectedExpertId(e.target.value)}
                          className="border text-xs p-2 rounded-xl"
                        >
                          <option value="">Select Expert</option>
                          {experts.map((exp) => (
                            <option key={exp.id} value={exp.id}>
                              {exp.user?.fullName} ({exp.specialization})
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleAssign(p.id)}
                          className="bg-emerald-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setReassigningId('')}
                          className="bg-gray-200 text-gray-700 px-2 py-1.5 rounded-xl text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setReassigningId(p.id);
                          setSelectedExpertId(p.expertId || '');
                        }}
                        className="text-xs font-bold text-emerald-700 hover:underline"
                      >
                        {p.expertId ? 'Reassign Expert' : 'Assign Expert'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
