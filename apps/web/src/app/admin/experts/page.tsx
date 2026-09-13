'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';

import { API_BASE_URL } from '@/config/api';

export default function AdminExpertsPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();

  const [experts, setExperts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState('');

  useEffect(() => {
    if (!isLoading) {
      if (!user) router.push('/login');
      else loadExperts();
    }
  }, [user, isLoading, token, router]);

  const loadExperts = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/admin/experts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) setExperts(json.data);
    } catch (e) {
      console.error('Error loading experts:', e);
    }
    setLoading(false);
  };

  const handleUpdateStatus = async (expertId: string, status: 'VERIFIED' | 'SUSPENDED' | 'REJECTED') => {
    if (!token) return;
    setUpdatingId(expertId);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/admin/experts/${expertId}/verify`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      setUpdatingId('');
      if (json.success) loadExperts();
    } catch (e) {
      setUpdatingId('');
      console.error('Error updating expert status:', e);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gray-900 text-white p-6 rounded-2xl shadow-md flex justify-between items-center">
        <div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Admin Control Panel</span>
          <h1 className="text-2xl font-black mt-1">Agricultural Experts Verification</h1>
        </div>
        <button onClick={() => router.push('/admin/crop-problems')} className="bg-gray-800 text-amber-400 font-bold px-4 py-2 rounded-xl text-xs">
          ⬅ Crop Reports Audit
        </button>
      </div>

      {loading ? (
        <div className="bg-white p-12 text-center rounded-2xl border text-gray-500">Loading expert accounts...</div>
      ) : (
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 text-xs font-bold text-gray-600 uppercase border-b">
                <th className="p-4">Expert Name</th>
                <th className="p-4">Specialization</th>
                <th className="p-4">Qualification</th>
                <th className="p-4">Experience</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm">
              {experts.map((exp) => (
                <tr key={exp.id} className="hover:bg-gray-50/80">
                  <td className="p-4 font-bold text-gray-900">
                    {exp.user?.fullName}
                    <div className="text-xs text-gray-500 font-normal">{exp.user?.phone} • {exp.user?.email}</div>
                  </td>
                  <td className="p-4 text-gray-800 font-semibold">{exp.specialization}</td>
                  <td className="p-4 text-xs text-gray-600">{exp.qualification}</td>
                  <td className="p-4 text-xs font-bold text-gray-700">{exp.yearsExperience} Years</td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                        exp.verificationStatus === 'VERIFIED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : exp.verificationStatus === 'PENDING_VERIFICATION'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {exp.verificationStatus}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    {exp.verificationStatus !== 'VERIFIED' && (
                      <button
                        onClick={() => handleUpdateStatus(exp.id, 'VERIFIED')}
                        disabled={updatingId === exp.id}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl"
                      >
                        ✓ Verify
                      </button>
                    )}
                    {exp.verificationStatus !== 'SUSPENDED' && (
                      <button
                        onClick={() => handleUpdateStatus(exp.id, 'SUSPENDED')}
                        disabled={updatingId === exp.id}
                        className="bg-red-100 hover:bg-red-200 text-red-800 text-xs font-bold px-3 py-1.5 rounded-xl"
                      >
                        Suspend
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
