'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';

import { API_BASE_URL } from '@/config/api';

export default function FarmerCropProblemsPage() {
  const { user, token, isLoading } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  const [problems, setProblems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    if (!isLoading) {
      if (!user) router.push('/login');
      else loadProblems();
    }
  }, [user, isLoading, token, statusFilter, router]);

  const loadProblems = async () => {
    if (!token) return;
    setLoading(true);
    try {
      let url = `${API_BASE_URL}/api/v1/farmer/crop-problems`;
      if (statusFilter) url += `?status=${statusFilter}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      if (json.success) {
        setProblems(json.data);
      }
    } catch (e) {
      console.error('Error loading crop problems:', e);
    }
    setLoading(false);
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-800 font-bold border-red-300';
      case 'SEVERE':
        return 'bg-amber-100 text-amber-800 font-semibold border-amber-300';
      case 'MODERATE':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-green-100 text-green-800 border-green-300';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'REPORTED':
        return 'bg-blue-100 text-blue-800';
      case 'EXPERT_ASSIGNED':
        return 'bg-purple-100 text-purple-800';
      case 'IN_CONSULTATION':
        return 'bg-indigo-100 text-indigo-800';
      case 'RESOLVED':
        return 'bg-emerald-100 text-emerald-800';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-emerald-50/30 p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-emerald-800 text-white p-6 rounded-2xl shadow-md mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold flex items-center gap-2">
            <span>🔍</span> Crop Problem Reports & Advisory
          </h1>
          <p className="text-emerald-100 text-sm mt-1">
            Report disease/pest symptoms, get verified expert diagnosis, and track solutions.
          </p>
        </div>
        <button
          onClick={() => router.push('/farmer/crop-problems/new')}
          className="bg-amber-400 hover:bg-amber-500 text-emerald-950 font-bold px-5 py-3 rounded-xl shadow-lg transition flex items-center gap-2 text-base"
        >
          <span>➕</span> Report New Crop Problem
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { label: 'All Reports', value: '' },
          { label: 'Pending / In Progress', value: 'IN_CONSULTATION' },
          { label: 'Reported', value: 'REPORTED' },
          { label: 'Resolved', value: 'RESOLVED' },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
              statusFilter === tab.value
                ? 'bg-emerald-700 text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content List */}
      {loading ? (
        <div className="bg-white p-12 text-center rounded-2xl shadow-sm border border-emerald-100 text-gray-500">
          Loading crop problem history...
        </div>
      ) : problems.length === 0 ? (
        <div className="bg-white p-10 text-center rounded-2xl shadow-sm border border-emerald-100 max-w-xl mx-auto">
          <div className="text-5xl mb-3">🌱</div>
          <h3 className="text-lg font-bold text-gray-800">No Crop Problems Reported Yet</h3>
          <p className="text-sm text-gray-600 mt-1 mb-6">
            If your crop is showing yellow leaves, pest attack, or disease symptoms, report it for expert advice.
          </p>
          <button
            onClick={() => router.push('/farmer/crop-problems/new')}
            className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-emerald-700 shadow-md"
          >
            Report Problem Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {problems.map((p) => (
            <div
              key={p.id}
              onClick={() => router.push(`/farmer/crop-problems/${p.id}`)}
              className="bg-white p-5 rounded-2xl shadow-sm border border-emerald-100 hover:shadow-md transition cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-3 gap-2">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${getSeverityBadge(p.severity)}`}>
                    {p.severity}
                  </span>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${getStatusBadge(p.status)}`}>
                    {p.status.replace('_', ' ')}
                  </span>
                </div>

                <h3 className="font-bold text-gray-900 text-lg line-clamp-1 mb-1">
                  {p.title || `${p.crop?.cropName || 'Crop'} Health Issue`}
                </h3>

                <p className="text-sm text-gray-600 line-clamp-2 mb-4">{p.description}</p>

                <div className="bg-emerald-50/50 p-3 rounded-xl text-xs space-y-1 text-gray-700 border border-emerald-100/60 mb-4">
                  <div>📍 <strong>Farm:</strong> {p.farm?.name || 'N/A'}</div>
                  <div>🌾 <strong>Crop:</strong> {p.crop?.cropName || 'N/A'} ({p.crop?.variety || 'Standard'})</div>
                  <div>🗓️ <strong>Reported:</strong> {new Date(p.createdAt).toLocaleDateString()}</div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-gray-100 text-sm font-bold text-emerald-700">
                <span>View Details & Guidance</span>
                <span>➔</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
