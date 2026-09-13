'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../context/AuthContext';
import { useLanguage } from '../../../../context/LanguageContext';

import { API_BASE_URL } from '@/config/api';

export default function NewCropProblemPage() {
  const { user, token, isLoading } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [farms, setFarms] = useState<any[]>([]);
  const [loadingFarms, setLoadingFarms] = useState(true);

  // Form State
  const [farmId, setFarmId] = useState('');
  const [fieldId, setFieldId] = useState('');
  const [cropId, setCropId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [affectedAreaPercentage, setAffectedAreaPercentage] = useState(25);
  const [severity, setSeverity] = useState('MODERATE');

  // Observations
  const [leafColor, setLeafColor] = useState('Yellowing');
  const [leafCondition, setLeafCondition] = useState('Spots / Blight');
  const [plantCondition, setPlantCondition] = useState('Wilting');
  const [pestObservation, setPestObservation] = useState('Visible Bugs');

  // Photo
  const [imageUrl, setImageUrl] = useState('');
  const [imageCaption, setImageCaption] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!isLoading) {
      if (!user) router.push('/login');
      else fetchFarms();
    }
  }, [user, isLoading, token, router]);

  const fetchFarms = async () => {
    if (!token) return;
    setLoadingFarms(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/farmer/farms`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) setFarms(json.data);
    } catch (e) {
      console.error('Error loading farms:', e);
    }
    setLoadingFarms(false);
  };

  const selectedFarm = farms.find((f) => f.id === farmId);
  const fields = selectedFarm?.fields || [];
  const selectedField = fields.find((f: any) => f.id === fieldId);
  const crops = selectedField?.crops || [];
  const selectedCrop = crops.find((c: any) => c.id === cropId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmId || !fieldId || !cropId) {
      setErrorMsg('Please select your Farm, Field, and Crop.');
      return;
    }
    setErrorMsg('');
    setSubmitting(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/farmer/crop-problems`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          farmId,
          fieldId,
          cropId,
          title: title || `${selectedCrop?.cropName || 'Crop'} Health Issue`,
          description: description || `Noticed ${leafColor.toLowerCase()} and ${plantCondition.toLowerCase()} on ${selectedCrop?.cropName}.`,
          affectedAreaPercentage: Number(affectedAreaPercentage),
          severity,
          observations: {
            leafColor,
            leafCondition,
            plantCondition,
            pestObservation,
          },
          images: imageUrl ? [{ imageUrl, caption: imageCaption || 'Symptom photo' }] : [],
        }),
      });

      const json = await res.json();
      setSubmitting(false);

      if (json.success) {
        router.push(`/farmer/crop-problems/${json.data.id}`);
      } else {
        setErrorMsg(json.error?.message || 'Failed to submit crop problem.');
      }
    } catch (err: any) {
      setSubmitting(false);
      setErrorMsg('Network error. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-emerald-50/40 p-4 md:p-8 max-w-4xl mx-auto">
      {/* Step Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-100 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl md:text-2xl font-black text-emerald-950 flex items-center gap-2">
            <span>🚨</span> Report Crop Health Problem
          </h1>
          <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
            Step {step} of 4
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-emerald-600 h-full transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-50 text-red-800 p-4 rounded-xl mb-6 border border-red-200 text-sm font-semibold">
          ⚠️ {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-emerald-100 space-y-6">
        {/* STEP 1: Farm, Field & Crop Selection */}
        {step === 1 && (
          <div className="space-y-5">
            <h2 className="text-lg font-bold text-gray-900 border-b pb-2">1. Select Affected Location & Crop</h2>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Select Farm *</label>
              {loadingFarms ? (
                <div className="text-sm text-gray-500">Loading your farms...</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {farms.map((f) => (
                    <div
                      key={f.id}
                      onClick={() => {
                        setFarmId(f.id);
                        setFieldId('');
                        setCropId('');
                      }}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition ${
                        farmId === f.id ? 'border-emerald-600 bg-emerald-50/50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-bold text-gray-900">🏡 {f.name}</div>
                      <div className="text-xs text-gray-600 mt-1">
                        {f.locationDistrict}, {f.locationState} ({f.totalAreaAcres} Acres)
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {farmId && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Select Field *</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {fields.map((field: any) => (
                    <div
                      key={field.id}
                      onClick={() => {
                        setFieldId(field.id);
                        setCropId('');
                      }}
                      className={`p-3.5 rounded-xl border-2 cursor-pointer transition ${
                        fieldId === field.id ? 'border-emerald-600 bg-emerald-50/50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-bold text-gray-800 text-sm">📍 {field.name}</div>
                      <div className="text-xs text-gray-500">{field.soilType || 'Field'} • {field.areaAcres} Acres</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {fieldId && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Select Growing Crop *</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {crops.map((c: any) => (
                    <div
                      key={c.id}
                      onClick={() => setCropId(c.id)}
                      className={`p-3.5 rounded-xl border-2 cursor-pointer transition ${
                        cropId === c.id ? 'border-emerald-600 bg-emerald-50/50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-bold text-gray-900 text-sm">🌾 {c.cropName}</div>
                      <div className="text-xs text-gray-500">Variety: {c.variety || 'Standard'}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                disabled={!farmId || !fieldId || !cropId}
                onClick={() => setStep(2)}
                className="bg-emerald-600 text-white font-bold px-6 py-2.5 rounded-xl shadow-md disabled:opacity-50 hover:bg-emerald-700"
              >
                Next Step ➔
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Symptoms & Visual Observation Checklist */}
        {step === 2 && (
          <div className="space-y-5">
            <h2 className="text-lg font-bold text-gray-900 border-b pb-2">2. What Symptoms Do You See?</h2>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Leaf Discoloration</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {['Yellowing', 'Browning / Drying', 'Red/Purple Tints', 'Pale / White Spots'].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setLeafColor(opt)}
                    className={`p-3 text-xs font-bold rounded-xl border transition text-center ${
                      leafColor === opt ? 'border-emerald-600 bg-emerald-100 text-emerald-900' : 'border-gray-200 text-gray-700'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Plant Growth Condition</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {['Wilting', 'Stunted Growth', 'Stem Rot', 'Normal Height'].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setPlantCondition(opt)}
                    className={`p-3 text-xs font-bold rounded-xl border transition text-center ${
                      plantCondition === opt ? 'border-emerald-600 bg-emerald-100 text-emerald-900' : 'border-gray-200 text-gray-700'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Pest / Bug Presence</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {['Visible Bugs', 'Leaf Holes / Chewed', 'Caterpillars / Worms', 'No Bugs Seen'].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setPestObservation(opt)}
                    className={`p-3 text-xs font-bold rounded-xl border transition text-center ${
                      pestObservation === opt ? 'border-emerald-600 bg-emerald-100 text-emerald-900' : 'border-gray-200 text-gray-700'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="bg-gray-100 text-gray-700 font-bold px-5 py-2.5 rounded-xl border"
              >
                ⬅ Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="bg-emerald-600 text-white font-bold px-6 py-2.5 rounded-xl shadow-md hover:bg-emerald-700"
              >
                Next Step ➔
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Severity & Photo Upload */}
        {step === 3 && (
          <div className="space-y-5">
            <h2 className="text-lg font-bold text-gray-900 border-b pb-2">3. Severity & Photo Attachment</h2>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Severity Level *</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { key: 'LOW', label: '🟢 Low', desc: 'Mild symptoms' },
                  { key: 'MODERATE', label: '🟡 Moderate', desc: 'Noticeable spread' },
                  { key: 'SEVERE', label: '🟠 Severe', desc: 'Rapid damaging' },
                  { key: 'CRITICAL', label: '🔴 Critical', desc: 'Crop destruction risk' },
                ].map((s) => (
                  <div
                    key={s.key}
                    onClick={() => setSeverity(s.key)}
                    className={`p-3.5 rounded-xl border-2 cursor-pointer transition text-center ${
                      severity === s.key ? 'border-emerald-600 bg-emerald-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="font-bold text-sm text-gray-900">{s.label}</div>
                    <div className="text-xs text-gray-500 mt-1">{s.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Estimated Affected Area: {affectedAreaPercentage}%
              </label>
              <input
                type="range"
                min="5"
                max="100"
                step="5"
                value={affectedAreaPercentage}
                onChange={(e) => setAffectedAreaPercentage(Number(e.target.value))}
                className="w-full text-emerald-600 accent-emerald-600"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Upload / Paste Photo URL (Optional)</label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/photo-..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full border border-gray-300 p-3 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Attach a clear photo of the leaf or stem symptoms for faster expert diagnosis.
              </p>
            </div>

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="bg-gray-100 text-gray-700 font-bold px-5 py-2.5 rounded-xl border"
              >
                ⬅ Back
              </button>
              <button
                type="button"
                onClick={() => setStep(4)}
                className="bg-emerald-600 text-white font-bold px-6 py-2.5 rounded-xl shadow-md hover:bg-emerald-700"
              >
                Review & Submit ➔
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Problem Title & Review */}
        {step === 4 && (
          <div className="space-y-5">
            <h2 className="text-lg font-bold text-gray-900 border-b pb-2">4. Problem Summary & Notes</h2>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Report Title</label>
              <input
                type="text"
                placeholder="e.g. Yellow leaves and spots on chilli plants"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-gray-300 p-3 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none font-semibold"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Detailed Observations / Additional Information</label>
              <textarea
                rows={3}
                placeholder="Describe when symptoms started, recent weather, fertilizers sprayed, etc."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border border-gray-300 p-3 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div className="bg-emerald-50/70 p-4 rounded-xl text-sm space-y-2 border border-emerald-200">
              <div className="font-bold text-emerald-950 text-base">Summary Review</div>
              <div>📍 <strong>Farm:</strong> {selectedFarm?.name}</div>
              <div>🌾 <strong>Crop:</strong> {selectedCrop?.cropName}</div>
              <div>⚡ <strong>Severity:</strong> {severity} ({affectedAreaPercentage}% affected)</div>
              <div>🔍 <strong>Symptoms:</strong> {leafColor}, {plantCondition}, {pestObservation}</div>
            </div>

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="bg-gray-100 text-gray-700 font-bold px-5 py-2.5 rounded-xl border"
              >
                ⬅ Back
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="bg-amber-400 hover:bg-amber-500 text-emerald-950 font-extrabold px-8 py-3 rounded-xl shadow-lg transition text-base disabled:opacity-50"
              >
                {submitting ? 'Submitting Report...' : '🚀 Submit Report To Expert'}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
