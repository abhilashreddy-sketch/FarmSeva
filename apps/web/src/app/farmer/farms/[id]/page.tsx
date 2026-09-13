'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../../context/AuthContext';

import { API_BASE_URL } from '@/config/api';

export default function FarmDetailsPage() {
  const params = useParams();
  const farmId = params.id as string;
  const router = useRouter();
  const { token, isLoading } = useAuth();

  const [farm, setFarm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAddFieldModal, setShowAddFieldModal] = useState(false);

  // Add Field Form State
  const [fieldName, setFieldName] = useState('');
  const [fieldArea, setFieldArea] = useState('');
  const [soilType, setSoilType] = useState('Black Cotton Soil');
  const [irrigationType, setIrrigationType] = useState('Borewell');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && farmId) {
      loadFarmDetails();
    }
  }, [isLoading, farmId, token]);

  const loadFarmDetails = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/farmer/farms/${farmId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setFarm(data.data);
      } else if (res.status === 403) {
        router.push('/unauthorized');
      }
    } catch (e) {
      console.error('Failed to load farm details:', e);
    }
    setLoading(false);
  };

  const handleAddField = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/farmer/farms/${farmId}/fields`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: fieldName,
          areaAcres: parseFloat(fieldArea),
          soilType,
          irrigationType,
        }),
      });
      const data = await res.json();
      setSubmitting(false);

      if (data.success) {
        setShowAddFieldModal(false);
        setFieldName('');
        setFieldArea('');
        loadFarmDetails();
      } else {
        alert(data.error?.message || 'Failed to add field');
      }
    } catch (e) {
      setSubmitting(false);
      alert('Error creating field');
    }
  };

  const handleDeleteField = async (fieldId: string) => {
    if (!confirm('Are you sure you want to delete this field?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/farmer/fields/${fieldId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) loadFarmDetails();
    } catch (e) {
      alert('Error deleting field');
    }
  };

  if (loading) return <div className="p-8 text-center font-bold">Loading Farm Details...</div>;
  if (!farm) return <div className="p-8 text-center font-bold text-red-600">Farm not found or access denied</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-2">
      {/* Back Link */}
      <Link href="/farmer/farms" className="text-xs font-black text-emerald-700 hover:underline">
        ← Back to Farms List
      </Link>

      {/* Farm Overview Header */}
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow border-2 border-emerald-100 space-y-4">
        <div className="flex justify-between items-start flex-wrap gap-2">
          <div>
            <span className="bg-emerald-100 text-emerald-900 text-xs font-extrabold px-3 py-1 rounded-full uppercase">
              {farm.totalAreaAcres} {farm.areaUnit || 'Acres'} TOTAL
            </span>
            <h1 className="text-2xl md:text-3xl font-black text-emerald-950 mt-2">{farm.name}</h1>
            <p className="text-xs font-semibold text-gray-600 mt-1">
              📍 {farm.locationVillage ? `${farm.locationVillage}, ` : ''}{farm.locationDistrict}, {farm.locationState} {farm.locationPincode ? `- ${farm.locationPincode}` : ''}
            </p>
          </div>

          <button
            onClick={() => setShowAddFieldModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-5 py-3 rounded-2xl shadow"
          >
            + Add Field (పొలం విభాగం)
          </button>
        </div>
      </div>

      {/* Fields List */}
      <div className="space-y-4">
        <h2 className="text-lg font-black text-emerald-950">FARM FIELDS ({farm.fields?.length || 0})</h2>

        {!farm.fields || farm.fields.length === 0 ? (
          <div className="bg-white p-8 rounded-3xl text-center space-y-3 border-2 border-dashed border-gray-200">
            <div className="text-4xl">🌱</div>
            <h3 className="font-extrabold text-gray-800">No Fields Added to this Farm Yet</h3>
            <p className="text-xs text-gray-500">Divide your farm into fields (e.g. North Plot, Field A) to track crops.</p>
            <button
              onClick={() => setShowAddFieldModal(true)}
              className="bg-emerald-600 text-white text-xs font-black px-4 py-2.5 rounded-xl shadow"
            >
              + Create Field
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {farm.fields.map((f: any) => (
              <div key={f.id} className="bg-white p-5 rounded-2xl shadow border border-gray-200 space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-black text-lg text-gray-900">{f.name}</h3>
                  <button
                    onClick={() => handleDeleteField(f.id)}
                    className="text-red-500 text-xs font-bold hover:underline"
                  >
                    Delete
                  </button>
                </div>
                <div className="text-xs font-semibold text-gray-600 space-y-1">
                  <div>📏 Area: <strong>{f.areaAcres} Acres</strong></div>
                  <div>🌱 Soil: {f.soilType || 'Black Soil'}</div>
                  <div>💧 Irrigation: {f.irrigationType || 'Borewell'}</div>
                </div>

                {/* Crops under field */}
                <div className="pt-2 border-t border-gray-100">
                  <div className="text-[11px] font-extrabold text-gray-500 mb-1">Active Crops in Field:</div>
                  {f.crops && f.crops.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {f.crops.map((c: any) => (
                        <span key={c.id} className="bg-green-100 text-green-900 font-extrabold text-[11px] px-2.5 py-1 rounded-full">
                          🌶️ {c.cropName} ({c.variety || 'Standard'}) - {c.status}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[11px] text-gray-400 font-semibold italic">No active crops. Add crop in Crops tab.</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Field Modal */}
      {showAddFieldModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-3xl max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-xl font-black text-emerald-950">Add Field to Farm</h3>
            <form onSubmit={handleAddField} className="space-y-3">
              <div>
                <label className="block text-xs font-extrabold text-gray-700 mb-1">Field Name *</label>
                <input
                  type="text"
                  value={fieldName}
                  onChange={(e) => setFieldName(e.target.value)}
                  placeholder="e.g. Field A / North Plot"
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-gray-200 font-bold"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-extrabold text-gray-700 mb-1">Area (Acres) *</label>
                <input
                  type="number"
                  step="0.5"
                  value={fieldArea}
                  onChange={(e) => setFieldArea(e.target.value)}
                  placeholder="e.g. 2.5"
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-gray-200 font-bold"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-extrabold text-gray-700 mb-1">Soil Type</label>
                  <select
                    value={soilType}
                    onChange={(e) => setSoilType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 font-bold bg-white text-xs"
                  >
                    <option value="Black Cotton Soil">Black Cotton Soil</option>
                    <option value="Red Soil">Red Soil</option>
                    <option value="Alluvial Soil">Alluvial Soil</option>
                    <option value="Sandy Loam">Sandy Loam</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-gray-700 mb-1">Irrigation Type</label>
                  <select
                    value={irrigationType}
                    onChange={(e) => setIrrigationType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 font-bold bg-white text-xs"
                  >
                    <option value="Borewell">Borewell</option>
                    <option value="Canal">Canal</option>
                    <option value="Drip">Drip Irrigation</option>
                    <option value="Rainfed">Rainfed</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddFieldModal(false)}
                  className="px-4 py-2 bg-gray-200 font-extrabold text-gray-700 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-emerald-600 font-black text-white rounded-xl text-xs shadow"
                >
                  {submitting ? 'Saving...' : 'Save Field'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
