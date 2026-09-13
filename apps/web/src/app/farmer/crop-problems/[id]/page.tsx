'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../../../context/AuthContext';

import { API_BASE_URL } from '@/config/api';

export default function CropProblemDetailPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const problemId = params?.id as string;

  const [problem, setProblem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState(false);
  const [consulting, setConsulting] = useState(false);
  const [feedbackNotes, setFeedbackNotes] = useState('');
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!isLoading) {
      if (!user) router.push('/login');
      else loadDetail();
    }
  }, [user, isLoading, token, problemId, router]);

  const loadDetail = async () => {
    if (!token || !problemId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/farmer/crop-problems/${problemId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) setProblem(json.data);
    } catch (e) {
      console.error('Error fetching problem details:', e);
    }
    setLoading(false);
  };

  const handleRequestConsultation = async () => {
    if (!token || !problemId) return;
    setConsulting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/farmer/crop-problems/${problemId}/consultation`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      setConsulting(false);
      if (json.success) {
        router.push(`/farmer/consultations/${json.data.id}`);
      } else {
        setErrorMsg(json.error?.message || 'Consultation request failed.');
      }
    } catch (e) {
      setConsulting(false);
      setErrorMsg('Error requesting consultation.');
    }
  };

  const handleResolveProblem = async () => {
    if (!token || !problemId) return;
    setResolving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/farmer/crop-problems/${problemId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'RESOLVED', resolutionNotes: feedbackNotes }),
      });
      const json = await res.json();
      setResolving(false);
      if (json.success) {
        setShowResolveModal(false);
        loadDetail();
      } else {
        setErrorMsg(json.error?.message || 'Resolution update failed.');
      }
    } catch (e) {
      setResolving(false);
      setErrorMsg('Error updating resolution.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-emerald-50/40 p-6 flex justify-center items-center text-gray-600 font-medium">
        Loading problem report details...
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="min-h-screen bg-emerald-50/40 p-6 flex flex-col justify-center items-center">
        <div className="text-4xl mb-2">⚠️</div>
        <h2 className="text-xl font-bold text-gray-800">Crop Problem Report Not Found</h2>
        <button onClick={() => router.push('/farmer/crop-problems')} className="mt-4 text-emerald-700 font-bold hover:underline">
          ⬅ Return to Reports
        </button>
      </div>
    );
  }

  const steps = ['REPORTED', 'EXPERT_ASSIGNED', 'IN_CONSULTATION', 'RESOLVED'];
  const currentStepIndex = steps.indexOf(problem.status) >= 0 ? steps.indexOf(problem.status) : 0;

  return (
    <div className="min-h-screen bg-emerald-50/30 p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      {/* Back Button */}
      <button onClick={() => router.push('/farmer/crop-problems')} className="text-sm font-bold text-emerald-800 hover:underline flex items-center gap-1">
        ⬅ Back to Crop Reports
      </button>

      {errorMsg && (
        <div className="bg-red-50 text-red-800 p-4 rounded-xl border border-red-200 text-sm font-semibold">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Main Card */}
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-emerald-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-4 mb-6">
          <div>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Report ID: {problem.id.slice(0, 8)}</span>
            <h1 className="text-2xl font-black text-gray-900 mt-1">{problem.title}</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-red-100 text-red-800 font-bold text-xs rounded-full border border-red-200">
              Severity: {problem.severity}
            </span>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-900 font-extrabold text-xs rounded-full">
              {problem.status.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Status Tracker */}
        <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-100 mb-6">
          <div className="text-xs font-bold text-emerald-900 mb-3">Resolution Progress</div>
          <div className="grid grid-cols-4 gap-2 text-center text-xs font-bold">
            {steps.map((s, idx) => (
              <div key={s} className="space-y-1">
                <div className={`h-2 rounded-full ${idx <= currentStepIndex ? 'bg-emerald-600' : 'bg-gray-200'}`} />
                <div className={idx <= currentStepIndex ? 'text-emerald-900 font-extrabold' : 'text-gray-400'}>
                  {s.replace('_', ' ')}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Crop & Location Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-xl border">
            <div className="text-xs text-gray-500 font-bold uppercase">Farm Location</div>
            <div className="font-bold text-gray-900 text-sm mt-0.5">{problem.farm?.name}</div>
            <div className="text-xs text-gray-600">{problem.farm?.locationDistrict}, {problem.farm?.locationState}</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl border">
            <div className="text-xs text-gray-500 font-bold uppercase">Affected Crop & Field</div>
            <div className="font-bold text-gray-900 text-sm mt-0.5">{problem.crop?.cropName} ({problem.crop?.variety || 'Standard'})</div>
            <div className="text-xs text-gray-600">Field: {problem.field?.name}</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl border">
            <div className="text-xs text-gray-500 font-bold uppercase">Affected Area</div>
            <div className="font-bold text-emerald-800 text-sm mt-0.5">{problem.affectedAreaPercentage}% of field area</div>
            <div className="text-xs text-gray-600">Reported on {new Date(problem.createdAt).toLocaleDateString()}</div>
          </div>
        </div>

        {/* Symptoms & Observations */}
        <div className="mb-6">
          <h3 className="font-bold text-gray-900 text-base mb-2">Structured Symptom Observations</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-amber-50 p-3 rounded-xl border border-amber-200">
              <div className="text-amber-800 font-bold">Leaf Color</div>
              <div className="text-gray-800 mt-1 font-semibold">{problem.observations?.leafColor || 'Not specified'}</div>
            </div>
            <div className="bg-amber-50 p-3 rounded-xl border border-amber-200">
              <div className="text-amber-800 font-bold">Leaf Condition</div>
              <div className="text-gray-800 mt-1 font-semibold">{problem.observations?.leafCondition || 'Not specified'}</div>
            </div>
            <div className="bg-amber-50 p-3 rounded-xl border border-amber-200">
              <div className="text-amber-800 font-bold">Plant Condition</div>
              <div className="text-gray-800 mt-1 font-semibold">{problem.observations?.plantCondition || 'Not specified'}</div>
            </div>
            <div className="bg-amber-50 p-3 rounded-xl border border-amber-200">
              <div className="text-amber-800 font-bold">Pest Presence</div>
              <div className="text-gray-800 mt-1 font-semibold">{problem.observations?.pestObservation || 'Not specified'}</div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mb-6">
          <h3 className="font-bold text-gray-900 text-base mb-1">Detailed Description</h3>
          <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-xl border leading-relaxed">{problem.description}</p>
        </div>

        {/* Photos */}
        {problem.images && problem.images.length > 0 && (
          <div className="mb-6">
            <h3 className="font-bold text-gray-900 text-base mb-3">Symptom Photos</h3>
            <div className="flex flex-wrap gap-4">
              {problem.images.map((img: any) => (
                <div key={img.id} className="border p-2 rounded-xl bg-gray-50 max-w-xs">
                  <img src={img.imageUrl} alt={img.caption || 'Crop photo'} className="w-full h-44 object-cover rounded-lg" />
                  {img.caption && <p className="text-xs text-gray-600 mt-1.5 font-medium">{img.caption}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Expert Guidance Timeline */}
        {problem.consultation?.guidance ? (
          <div className="bg-emerald-50 p-6 rounded-2xl border-2 border-emerald-200 mb-6 space-y-4">
            <div className="flex justify-between items-center border-b border-emerald-200 pb-3">
              <h3 className="font-black text-emerald-950 text-lg flex items-center gap-2">
                <span>🩺</span> Official Agricultural Expert Advisory
              </h3>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                Verified Advisory
              </span>
            </div>

            <div className="space-y-3 text-sm text-emerald-950">
              <div>
                <strong className="block text-xs uppercase text-emerald-800 font-extrabold">Diagnostic Summary</strong>
                <p className="font-bold text-base mt-0.5">{problem.consultation.guidance.diagnosis}</p>
              </div>

              {problem.consultation.guidance.remediationSteps && (
                <div>
                  <strong className="block text-xs uppercase text-emerald-800 font-extrabold">Remediation Steps</strong>
                  <p className="mt-0.5 whitespace-pre-line bg-white/80 p-3 rounded-xl border border-emerald-200 text-gray-800">
                    {problem.consultation.guidance.remediationSteps}
                  </p>
                </div>
              )}

              {problem.consultation.guidance.safetyPrecautions && (
                <div className="bg-amber-100/70 p-3 rounded-xl border border-amber-300 text-amber-950">
                  <strong className="block text-xs uppercase font-extrabold">⚠️ Safety Advice</strong>
                  <p className="mt-0.5 text-xs font-semibold">{problem.consultation.guidance.safetyPrecautions}</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-amber-50 p-5 rounded-2xl border border-amber-200 text-sm text-amber-900 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h4 className="font-bold text-base">Expert Advisory Pending</h4>
              <p className="text-xs text-amber-800 mt-0.5">
                Our verified agronomists are reviewing your symptom photos. You can chat directly with your assigned expert.
              </p>
            </div>
          </div>
        )}

        {/* Actions Footer */}
        <div className="pt-4 border-t flex flex-wrap justify-between items-center gap-3">
          {problem.consultation ? (
            <button
              onClick={() => router.push(`/farmer/consultations/${problem.consultation.id}`)}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-6 py-3 rounded-xl shadow-md flex items-center gap-2 text-sm"
            >
              <span>💬</span> Chat With Assigned Expert
            </button>
          ) : (
            <button
              onClick={handleRequestConsultation}
              disabled={consulting}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-6 py-3 rounded-xl shadow-md flex items-center gap-2 text-sm disabled:opacity-50"
            >
              <span>💬</span> Request Expert Consultation
            </button>
          )}

          {problem.status !== 'RESOLVED' && problem.status !== 'CLOSED' && (
            <button
              onClick={() => setShowResolveModal(true)}
              className="bg-emerald-100 text-emerald-900 hover:bg-emerald-200 font-bold px-5 py-3 rounded-xl text-sm transition"
            >
              ✓ Mark Problem as Resolved
            </button>
          )}
        </div>
      </div>

      {/* Resolution Confirmation Modal */}
      {showResolveModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center p-4 z-50">
          <div className="bg-white p-6 rounded-2xl max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-extrabold text-gray-900">Mark Problem as Resolved?</h3>
            <p className="text-xs text-gray-600">
              Confirming resolution indicates that the advisory worked and your crop health has stabilized.
            </p>
            <textarea
              rows={3}
              placeholder="Optional feedback / outcome notes for expert..."
              value={feedbackNotes}
              onChange={(e) => setFeedbackNotes(e.target.value)}
              className="w-full border p-3 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            />
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowResolveModal(false)}
                className="px-4 py-2 text-sm font-bold text-gray-600 bg-gray-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleResolveProblem}
                disabled={resolving}
                className="px-5 py-2 text-sm font-bold text-white bg-emerald-700 rounded-xl shadow-md hover:bg-emerald-800 disabled:opacity-50"
              >
                {resolving ? 'Updating...' : 'Confirm Resolved'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
