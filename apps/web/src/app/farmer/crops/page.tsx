'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';

import { API_BASE_URL } from '@/config/api';

export default function CropsListPage() {
  const { user, token, isLoading } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  const [crops, setCrops] = useState<any[]>([]);
  const [farms, setFarms] = useState<any[]>([]);
  const [masterCrops, setMasterCrops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Add Crop Form State
  const [fieldId, setFieldId] = useState('');
  const [cropName, setCropName] = useState('Chilli');
  const [variety, setVariety] = useState('');
  const [sowingDate, setSowingDate] = useState(new Date().toISOString().split('T')[0]);
  const [harvestDate, setHarvestDate] = useState('');
  const [areaPlanted, setAreaPlanted] = useState('');
  const [status, setStatus] = useState('GROWING');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

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
      const [cropsRes, farmsRes, masterRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/v1/farmer/crops`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/api/v1/farmer/farms`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/api/v1/farmer/crop-master-data`),
      ]);

      const cropsJson = await cropsRes.json();
      const farmsJson = await farmsRes.json();
      const masterJson = await masterRes.json();

      if (cropsJson.success) setCrops(cropsJson.data);
      if (farmsJson.success) setFarms(farmsJson.data);
      if (masterJson.success) setMasterCrops(masterJson.data);
    } catch (e) {
      console.error('Error loading crop records:', e);
    }
    setLoading(false);
  };

  const handleAddCrop = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fieldId) {
      setErrorMsg('Please select a field to assign this crop');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/farmer/crops`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fieldId,
          cropName,
          variety: variety || undefined,
          sowingDate,
          expectedHarvestDate: harvestDate || undefined,
          areaPlantedAcres: parseFloat(areaPlanted),
          status,
          notes: notes || undefined,
        }),
      });

      const data = await res.json();
      setSubmitting(false);

      if (data.success) {
        setShowAddModal(false);
        setVariety('');
        setAreaPlanted('');
        setNotes('');
        loadData();
      } else {
        setErrorMsg(data.error?.message || 'Failed to add crop record');
      }
    } catch (e) {
      setSubmitting(false);
      setErrorMsg('Network error adding crop');
    }
  };

  const handleUpdateStatus = async (cropId: string, newStatus: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/farmer/crops/${cropId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) loadData();
    } catch (e) {
      alert('Error updating status');
    }
  };

  const handleDeleteCrop = async (cropId: string) => {
    if (!confirm('Are you sure you want to delete this crop record?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/farmer/crops/${cropId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) loadData();
    } catch (e) {
      alert('Error deleting crop');
    }
  };

  const getCropIcon = (name: string) => {
    if (name.includes('Chilli')) return '🌶️';
    if (name.includes('Tomato')) return '🍅';
    if (name.includes('Rice') || name.includes('Paddy')) return '🌾';
    if (name.includes('Wheat')) return '🌾';
    if (name.includes('Maize')) return '🌽';
    if (name.includes('Cotton')) return '☁️';
    if (name.includes('Potato')) return '🥔';
    if (name.includes('Onion')) return '🧅';
    if (name.includes('Groundnut')) return '🥜';
    if (name.includes('Sugarcane')) return '🎋';
    return '🌱';
  };

  // Flatten fields from all farms for selection
  const allFields = farms.flatMap((f: any) =>
    (f.fields || []).map((field: any) => ({
      id: field.id,
      label: `${f.name} → ${field.name} (${field.areaAcres} Acres)`,
    }))
  );

  if (isLoading) return <div className="p-8 text-center font-bold">Loading...</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-2">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 bg-white p-6 rounded-3xl shadow border border-gray-100">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-emerald-950">🌱 {t('myCrops')}</h1>
          <p className="text-xs font-semibold text-gray-500 mt-1">
            Digital crop records, varieties, sowing dates & harvest readiness
          </p>
        </div>
        <button
          onClick={() => {
            if (allFields.length > 0) setFieldId(allFields[0].id);
            setShowAddModal(true);
          }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm px-6 py-3 rounded-2xl shadow transition"
        >
          + {t('addCrop')}
        </button>
      </div>

      {/* Crops Cards Grid */}
      {loading ? (
        <div className="p-8 text-center font-bold text-gray-500">Loading crops list...</div>
      ) : crops.length === 0 ? (
        <div className="bg-white p-8 rounded-3xl text-center space-y-4 border-2 border-dashed border-gray-200">
          <div className="text-5xl">🌾</div>
          <h3 className="text-lg font-black text-gray-800">No Crops Recorded Yet</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Record the crops sown in your fields to receive crop protection guidance.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-emerald-600 text-white font-black text-sm px-6 py-3 rounded-xl shadow"
          >
            + Add First Crop Record
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {crops.map((c) => (
            <div key={c.id} className="bg-white p-6 rounded-3xl shadow border-2 border-green-100 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span
                    className={`font-extrabold text-[11px] px-3 py-1 rounded-full ${
                      c.status === 'GROWING'
                        ? 'bg-green-100 text-green-900'
                        : c.status === 'HARVEST_READY'
                        ? 'bg-amber-100 text-amber-900 font-black'
                        : c.status === 'HARVESTED'
                        ? 'bg-blue-100 text-blue-900'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    STATUS: {c.status}
                  </span>
                  <button
                    onClick={() => handleDeleteCrop(c.id)}
                    className="text-red-500 text-xs font-bold hover:underline"
                  >
                    Delete
                  </button>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-3xl shadow-sm">
                    {getCropIcon(c.cropName)}
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-gray-900">{c.cropName}</h2>
                    <p className="text-xs font-semibold text-gray-500">
                      Variety: <strong>{c.variety || 'Standard Local'}</strong>
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded-2xl text-xs font-semibold text-gray-700 space-y-1 mt-2">
                  <div>📍 Field: <strong>{c.field?.farm?.name || 'Farm'} → {c.field?.name || 'Field'}</strong></div>
                  <div>📏 Planted Area: <strong>{c.areaPlantedAcres} Acres</strong></div>
                  <div>📅 Sowing Date: <strong>{new Date(c.sowingDate).toLocaleDateString()}</strong></div>
                  {c.expectedHarvestDate && (
                    <div>🌾 Harvest Date: <strong>{new Date(c.expectedHarvestDate).toLocaleDateString()}</strong></div>
                  )}
                  {c.notes && <div className="text-gray-500 italic mt-1 font-normal">"{c.notes}"</div>}
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="font-extrabold text-gray-500">Update Status:</span>
                <select
                  value={c.status}
                  onChange={(e) => handleUpdateStatus(c.id, e.target.value)}
                  className="bg-gray-100 font-bold px-3 py-1 rounded-lg text-gray-800 focus:outline-none"
                >
                  <option value="PLANTED">PLANTED</option>
                  <option value="GROWING">GROWING</option>
                  <option value="HARVEST_READY">HARVEST READY</option>
                  <option value="HARVESTED">HARVESTED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Crop Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-3xl max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-xl font-black text-emerald-950">Add Crop Record (పంట నమోదు)</h3>
            {errorMsg && <div className="bg-red-50 text-red-700 text-xs font-bold p-3 rounded-xl">⚠️ {errorMsg}</div>}

            <form onSubmit={handleAddCrop} className="space-y-3">
              <div>
                <label className="block text-xs font-extrabold text-gray-700 mb-1">Select Field *</label>
                {allFields.length === 0 ? (
                  <p className="text-xs text-red-600 font-bold">Please create a Farm and Field first in My Farms!</p>
                ) : (
                  <select
                    value={fieldId}
                    onChange={(e) => setFieldId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border-2 border-gray-200 font-bold text-xs bg-white"
                    required
                  >
                    {allFields.map((f) => (
                      <option key={f.id} value={f.id}>{f.label}</option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-extrabold text-gray-700 mb-1">Crop Name *</label>
                  <select
                    value={cropName}
                    onChange={(e) => setCropName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border-2 border-gray-200 font-bold text-xs bg-white"
                  >
                    {masterCrops.map((mc: any) => (
                      <option key={mc.name} value={mc.name}>{mc.icon} {mc.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-gray-700 mb-1">Variety</label>
                  <input
                    type="text"
                    value={variety}
                    onChange={(e) => setVariety(e.target.value)}
                    placeholder="e.g. Teja 44"
                    className="w-full p-2.5 rounded-xl border-2 border-gray-200 font-bold text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-extrabold text-gray-700 mb-1">Planted Area (Acres) *</label>
                  <input
                    type="number"
                    step="0.5"
                    value={areaPlanted}
                    onChange={(e) => setAreaPlanted(e.target.value)}
                    placeholder="e.g. 2.0"
                    className="w-full p-2.5 rounded-xl border-2 border-gray-200 font-bold text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-gray-700 mb-1">Crop Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full p-2.5 rounded-xl border-2 border-gray-200 font-bold text-xs bg-white"
                  >
                    <option value="PLANTED">PLANTED</option>
                    <option value="GROWING">GROWING</option>
                    <option value="HARVEST_READY">HARVEST READY</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-extrabold text-gray-700 mb-1">Sowing Date *</label>
                  <input
                    type="date"
                    value={sowingDate}
                    onChange={(e) => setSowingDate(e.target.value)}
                    className="w-full p-2 rounded-xl border-2 border-gray-200 font-bold text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-gray-700 mb-1">Harvest Date</label>
                  <input
                    type="date"
                    value={harvestDate}
                    onChange={(e) => setHarvestDate(e.target.value)}
                    className="w-full p-2 rounded-xl border-2 border-gray-200 font-bold text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-gray-200 font-extrabold text-gray-700 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || allFields.length === 0}
                  className="px-5 py-2 bg-emerald-600 font-black text-white rounded-xl text-xs shadow disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Crop'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
