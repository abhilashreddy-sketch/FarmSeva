'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';

import { API_BASE_URL } from '@/config/api';

export default function FarmsListPage() {
  const { user, token, isLoading } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  const [farms, setFarms] = useState<any[]>([]);
  const [loadingFarms, setLoadingFarms] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Add Farm Form State
  const [name, setName] = useState('');
  const [village, setVillage] = useState('');
  const [district, setDistrict] = useState('');
  const [state, setState] = useState('Andhra Pradesh');
  const [pincode, setPincode] = useState('');
  const [areaAcres, setAreaAcres] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!isLoading) {
      if (!user) router.push('/login');
      else loadFarms();
    }
  }, [user, isLoading, token, router]);

  const loadFarms = async () => {
    if (!token) return;
    setLoadingFarms(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/farmer/farms`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setFarms(data.data);
      }
    } catch (e) {
      console.error('Failed to load farms list:', e);
    }
    setLoadingFarms(false);
  };

  const handleCreateFarm = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/farmer/farms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          locationVillage: village || undefined,
          locationDistrict: district,
          locationState: state,
          locationPincode: pincode || undefined,
          totalAreaAcres: parseFloat(areaAcres),
        }),
      });

      const data = await res.json();
      setSubmitting(false);

      if (data.success) {
        setShowAddModal(false);
        setName('');
        setVillage('');
        setDistrict('');
        setPincode('');
        setAreaAcres('');
        loadFarms();
      } else {
        setErrorMsg(data.error?.message || 'Failed to create farm');
      }
    } catch (err) {
      setSubmitting(false);
      setErrorMsg('Network error creating farm');
    }
  };

  const handleDeleteFarm = async (farmId: string) => {
    if (!confirm('Are you sure you want to delete this farm and all its fields?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/farmer/farms/${farmId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        loadFarms();
      } else {
        alert(data.error?.message || 'Failed to delete farm');
      }
    } catch (e) {
      alert('Error deleting farm');
    }
  };

  if (isLoading) return <div className="p-8 text-center font-bold">Loading...</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-2">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 bg-white p-6 rounded-3xl shadow border border-gray-100">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-emerald-950">🏡 {t('myFarm')}</h1>
          <p className="text-xs font-semibold text-gray-500 mt-1">
            Manage your digital land records, total acres, and fields
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm px-6 py-3 rounded-2xl shadow transition"
        >
          + {t('addFarm')}
        </button>
      </div>

      {/* Farms Cards Grid */}
      {loadingFarms ? (
        <div className="p-8 text-center font-bold text-gray-500">Loading farms...</div>
      ) : farms.length === 0 ? (
        <div className="bg-white p-8 rounded-3xl text-center space-y-4 border-2 border-dashed border-gray-200">
          <div className="text-5xl">🏡</div>
          <h3 className="text-lg font-black text-gray-800">No Farms Registered Yet</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Add your main farm or village land to start tracking fields and crops.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-emerald-600 text-white font-black text-sm px-6 py-3 rounded-xl shadow"
          >
            + Create First Farm
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {farms.map((farm) => (
            <div key={farm.id} className="bg-white p-6 rounded-3xl shadow border-2 border-emerald-100 space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="bg-emerald-100 text-emerald-900 font-extrabold text-xs px-3 py-1 rounded-full">
                    {farm.totalAreaAcres} {farm.areaUnit || 'Acres'}
                  </span>
                  <button
                    onClick={() => handleDeleteFarm(farm.id)}
                    className="text-red-500 text-xs font-bold hover:underline"
                  >
                    Delete
                  </button>
                </div>
                <h2 className="text-xl font-black text-emerald-950">{farm.name}</h2>
                <p className="text-xs font-semibold text-gray-600">
                  📍 {farm.locationVillage ? `${farm.locationVillage}, ` : ''}{farm.locationDistrict}, {farm.locationState}
                </p>
                <div className="pt-2 text-xs font-bold text-gray-500 flex gap-4">
                  <span>🌾 Fields: {farm.fields?.length || 0}</span>
                  <span>🌱 Active Crops: {farm.fields?.reduce((acc: number, f: any) => acc + (f.crops?.length || 0), 0)}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end">
                <Link
                  href={`/farmer/farms/${farm.id}`}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-4 py-2.5 rounded-xl shadow transition"
                >
                  View Farm Details & Fields →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Farm Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 md:p-8 rounded-3xl max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-xl font-black text-emerald-950">Add New Farm (కొత్త పొలం)</h3>
            {errorMsg && <div className="bg-red-50 text-red-700 text-xs font-bold p-3 rounded-xl">⚠️ {errorMsg}</div>}
            <form onSubmit={handleCreateFarm} className="space-y-3">
              <div>
                <label className="block text-xs font-extrabold text-gray-700 mb-1">Farm Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Main Canal Farm"
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-gray-200 font-bold"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-extrabold text-gray-700 mb-1">Total Acres *</label>
                  <input
                    type="number"
                    step="0.5"
                    value={areaAcres}
                    onChange={(e) => setAreaAcres(e.target.value)}
                    placeholder="e.g. 5.5"
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-gray-200 font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-gray-700 mb-1">Village</label>
                  <input
                    type="text"
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    placeholder="e.g. Kaza"
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-gray-200 font-bold"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-extrabold text-gray-700 mb-1">District *</label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="e.g. Guntur"
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-gray-200 font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-gray-700 mb-1">State *</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-gray-200 font-bold"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 bg-gray-200 font-extrabold text-gray-700 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-emerald-600 font-black text-white rounded-xl text-xs shadow"
                >
                  {submitting ? 'Saving...' : 'Save Farm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
