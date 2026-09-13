'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../../context/AuthContext';

import { API_BASE_URL } from '@/config/api';

export default function CropDetailPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const cropId = params.id as string;

  const [crop, setCrop] = useState<any>(null);
  const [problems, setProblems] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!isLoading) {
      if (!user) router.push('/login');
      else loadCropDetails();
    }
  }, [user, isLoading, token, cropId]);

  const loadCropDetails = async () => {
    if (!token || !cropId) return;
    setLoading(true);
    try {
      const [cropsRes, problemsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/v1/farmer/crops`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/api/v1/farmer/crop-problems`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const cropsData = await cropsRes.json();
      const problemsData = await problemsRes.json();

      if (cropsData.success) {
        const found = cropsData.data.find((c: any) => c.id === cropId);
        setCrop(found || null);
      }

      if (problemsData.success) {
        const matching = (problemsData.data || []).filter((p: any) => p.cropId === cropId);
        setProblems(matching);
      }
    } catch (e) {
      console.error('Error loading crop details:', e);
    }
    setLoading(false);
  };

  if (isLoading || loading) return <div className="p-8 text-center font-bold">Loading Crop Hub...</div>;
  if (!crop) return <div className="p-8 text-center font-bold text-red-600">Crop not found.</div>;

  return (
    <div className="max-w-4xl mx-auto py-4 px-3 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-green-700 text-white p-6 rounded-3xl shadow-lg space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="bg-amber-400 text-emerald-950 text-xs font-black px-3 py-1 rounded-full uppercase">
            CROP MANAGEMENT HUB
          </span>
          <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">
            Stage: {crop.stage || 'Growing'}
          </span>
        </div>
        <h1 className="text-3xl font-black">{crop.cropName}</h1>
        <p className="text-emerald-100 text-xs font-semibold">
          Variety: <strong>{crop.variety || 'Standard'}</strong> • Sown: <strong>{new Date(crop.sowingDate).toLocaleDateString()}</strong> • Field: <strong>{crop.field?.name || 'Main Field'}</strong>
        </p>
      </div>

      {/* Quick Action Hub Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Report Crop Problem */}
        <Link
          href={`/farmer/crop-problems/new?cropId=${crop.id}`}
          className="bg-red-600 hover:bg-red-700 text-white p-5 rounded-2xl shadow-md transition flex items-center justify-between group"
        >
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded">
              Helpline / Support
            </span>
            <h3 className="text-lg font-black mt-1">🩺 Report Crop Problem</h3>
            <p className="text-xs text-red-100 font-medium">Upload leaf photos & get expert guidance</p>
          </div>
          <div className="text-3xl group-hover:scale-110 transition">📷</div>
        </Link>

        {/* Crop-Aware Product Discovery */}
        <Link
          href={`/farmer/marketplace?crop=${encodeURIComponent(crop.cropName)}`}
          className="bg-emerald-600 hover:bg-emerald-700 text-white p-5 rounded-2xl shadow-md transition flex items-center justify-between group"
        >
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded">
              Crop-Aware Discovery
            </span>
            <h3 className="text-lg font-black mt-1">🧪 Discover Protection Products</h3>
            <p className="text-xs text-emerald-100 font-medium">Browse products for {crop.cropName}</p>
          </div>
          <div className="text-3xl group-hover:scale-110 transition">🛒</div>
        </Link>
      </div>

      {/* Reported Crop Problems & Consultations for this Crop */}
      <div className="bg-white p-6 rounded-3xl shadow-md border border-gray-200 space-y-4">
        <h3 className="text-lg font-black text-emerald-950 flex items-center justify-between">
          <span>📋 Reported Issues for {crop.cropName}</span>
          <span className="text-xs text-gray-500 font-bold">{problems.length} Total</span>
        </h3>

        {problems.length === 0 ? (
          <div className="p-6 text-center text-gray-500 font-bold bg-gray-50 rounded-2xl">
            No crop health problems reported for this crop yet.
          </div>
        ) : (
          <div className="space-y-3">
            {problems.map((p) => (
              <div key={p.id} className="p-4 rounded-2xl border border-gray-100 bg-gray-50 flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-gray-900">{p.title}</h4>
                  <p className="text-xs text-gray-500 font-medium line-clamp-1">{p.description}</p>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 inline-block mt-1">
                    Status: {p.status}
                  </span>
                </div>
                <Link
                  href={`/farmer/crop-problems/${p.id}`}
                  className="px-3.5 py-2 text-xs font-bold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition whitespace-nowrap"
                >
                  View Advisory →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
