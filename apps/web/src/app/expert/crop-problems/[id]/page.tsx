'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../../../context/AuthContext';

import { API_BASE_URL } from '@/config/api';

export default function ExpertCropProblemWorkstationPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const problemId = params?.id as string;

  const [problem, setProblem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submittingGuidance, setSubmittingGuidance] = useState(false);
  const [submittingNote, setSubmittingNote] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState<'guidance' | 'notes'>('guidance');

  // Guidance Form
  const [diagnosis, setDiagnosis] = useState('');
  const [cause, setCause] = useState('');
  const [remediationSteps, setRemediationSteps] = useState('');
  const [preventiveAdvice, setPreventiveAdvice] = useState('');
  const [safetyPrecautions, setSafetyPrecautions] = useState('');

  // Internal Note Form
  const [noteContent, setNoteContent] = useState('');

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
      const res = await fetch(`${API_BASE_URL}/api/v1/expert/crop-problems/${problemId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) {
        setProblem(json.data);
        if (json.data.consultation?.guidance) {
          const g = json.data.consultation.guidance;
          setDiagnosis(g.diagnosis || '');
          setCause(g.cause || '');
          setRemediationSteps(g.remediationSteps || '');
          setPreventiveAdvice(g.preventiveAdvice || '');
          setSafetyPrecautions(g.safetyPrecautions || '');
        }
      }
    } catch (e) {
      console.error('Error fetching expert case:', e);
    }
    setLoading(false);
  };

  const handleAssignToMe = async () => {
    if (!token || !problemId) return;
    setAssigning(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/expert/crop-problems/${problemId}/assign`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      setAssigning(false);
      if (json.success) {
        loadDetail();
      } else {
        setErrorMsg(json.error?.message || 'Assignment failed.');
      }
    } catch (e) {
      setAssigning(false);
      setErrorMsg('Error assigning case.');
    }
  };

  const handleSubmitGuidance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consultationId) {
      setErrorMsg('No consultation active for this case.');
      return;
    }
    setSubmittingGuidance(true);
    setErrorMsg('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/expert/consultations/${consultationId}/guidance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          diagnosis,
          cause: cause || undefined,
          remediationSteps,
          preventiveAdvice: preventiveAdvice || undefined,
          safetyPrecautions: safetyPrecautions || undefined,
        }),
      });
      const json = await res.json();
      setSubmittingGuidance(false);
      if (json.success) {
        loadDetail();
      } else {
        setErrorMsg(json.error?.message || 'Failed to submit advisory.');
      }
    } catch (e) {
      setSubmittingGuidance(false);
      setErrorMsg('Error submitting advisory.');
    }
  };

  const handleAddInternalNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim() || !consultationId) return;
    setSubmittingNote(true);
    setErrorMsg('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/expert/consultations/${consultationId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          messageText: noteContent,
          isInternalNote: true,
          visibility: 'INTERNAL',
        }),
      });
      const json = await res.json();
      setSubmittingNote(false);
      if (json.success) {
        setNoteContent('');
        loadDetail();
      } else {
        setErrorMsg(json.error?.message || 'Failed to record internal note.');
      }
    } catch (e) {
      setSubmittingNote(false);
      setErrorMsg('Error recording note.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex justify-center items-center text-slate-600 font-medium">
        Loading expert workstation case...
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex flex-col justify-center items-center">
        <h2 className="text-xl font-bold text-slate-800">Case Not Found</h2>
        <button onClick={() => router.push('/expert')} className="mt-4 text-emerald-700 font-bold hover:underline">
          ⬅ Return to Workstation Dashboard
        </button>
      </div>
    );
  }

  const consultationId = problem.consultation?.id;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <button onClick={() => router.push('/expert')} className="text-sm font-bold text-slate-700 hover:underline">
        ⬅ Back to Workstation Dashboard
      </button>

      {errorMsg && (
        <div className="bg-red-50 text-red-800 p-4 rounded-xl border border-red-200 text-sm font-semibold">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Case ID: {problem.id.slice(0, 8)}</span>
          <h1 className="text-2xl font-black mt-1">{problem.title}</h1>
          <p className="text-slate-300 text-xs mt-1">
            Farmer: <strong>{problem.farmer?.user?.fullName}</strong> ({problem.farmer?.user?.phone}) • Farm: {problem.farm?.name} ({problem.farm?.locationDistrict})
          </p>
        </div>

        {!problem.expertId ? (
          <button
            onClick={handleAssignToMe}
            disabled={assigning}
            className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black px-6 py-3 rounded-xl shadow-lg transition text-sm disabled:opacity-50"
          >
            {assigning ? 'Assigning...' : '✋ Assign Case To Me'}
          </button>
        ) : (
          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-1.5 rounded-xl text-xs font-bold">
            ✓ Assigned to You
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Farmer Symptom Report & Photos */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-5 rounded-2xl border shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base border-b pb-2">Reported Symptoms</h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between border-b pb-1">
                <span className="text-slate-500">Crop Name:</span>
                <span className="font-bold text-slate-900">{problem.crop?.cropName}</span>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span className="text-slate-500">Variety:</span>
                <span className="font-bold text-slate-900">{problem.crop?.variety || 'Standard'}</span>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span className="text-slate-500">Severity:</span>
                <span className="font-bold text-red-700">{problem.severity}</span>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span className="text-slate-500">Affected Area:</span>
                <span className="font-bold text-slate-900">{problem.affectedAreaPercentage}%</span>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border text-xs space-y-1">
              <div>🌿 <strong>Leaf Color:</strong> {problem.observations?.leafColor || 'N/A'}</div>
              <div>🍂 <strong>Leaf Condition:</strong> {problem.observations?.leafCondition || 'N/A'}</div>
              <div>🥀 <strong>Plant Growth:</strong> {problem.observations?.plantCondition || 'N/A'}</div>
              <div>🐛 <strong>Pest Bugs:</strong> {problem.observations?.pestObservation || 'N/A'}</div>
            </div>

            <div>
              <span className="text-xs text-slate-500 font-bold">Description:</span>
              <p className="text-xs text-slate-800 bg-slate-50 p-3 rounded-xl border mt-1">{problem.description}</p>
            </div>
          </div>

          {/* Photos */}
          {problem.images?.length > 0 && (
            <div className="bg-white p-5 rounded-2xl border shadow-sm">
              <h3 className="font-bold text-slate-900 text-sm mb-3">Farmer Symptom Photos</h3>
              <div className="space-y-3">
                {problem.images.map((img: any) => (
                  <div key={img.id} className="border rounded-xl p-2 bg-slate-50">
                    <img src={img.imageUrl} alt="Symptom" className="w-full h-40 object-cover rounded-lg" />
                    {img.caption && <p className="text-xs text-slate-600 mt-1">{img.caption}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Expert Workstation Tabs (Formal Advisory & Internal Notes) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border shadow-sm">
            <div className="flex border-b mb-6 gap-4">
              <button
                onClick={() => setActiveTab('guidance')}
                className={`pb-2.5 text-sm font-extrabold border-b-2 transition ${
                  activeTab === 'guidance' ? 'border-emerald-700 text-emerald-950' : 'border-transparent text-slate-500'
                }`}
              >
                📝 Issue Farmer Formal Advisory
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                className={`pb-2.5 text-sm font-extrabold border-b-2 transition ${
                  activeTab === 'notes' ? 'border-emerald-700 text-emerald-950' : 'border-transparent text-slate-500'
                }`}
              >
                🔒 Internal Expert Notes ({problem?.consultation?.messages?.filter((m: any) => m.isInternalNote).length || 0})
              </button>
            </div>

            {/* TAB 1: FORMAL GUIDANCE */}
            {activeTab === 'guidance' && (
              <form onSubmit={handleSubmitGuidance} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Diagnostic Summary (Farmer Visible) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chilli Leaf Curl Disease / Thrips Infestation"
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    className="w-full border p-3 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Root Cause Analysis</label>
                  <input
                    type="text"
                    placeholder="e.g. High humidity causing fungal spore proliferation"
                    value={cause}
                    onChange={(e) => setCause(e.target.value)}
                    className="w-full border p-3 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Remediation & Action Plan *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Provide non-chemical cultural practices, pruning guidelines, or safe spray advisory..."
                    value={remediationSteps}
                    onChange={(e) => setRemediationSteps(e.target.value)}
                    className="w-full border p-3 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Safety Precautions & PPE Advice</label>
                  <input
                    type="text"
                    placeholder="e.g. Wear mask and gloves. Observe 7-day waiting period before harvest."
                    value={safetyPrecautions}
                    onChange={(e) => setSafetyPrecautions(e.target.value)}
                    className="w-full border p-3 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={submittingGuidance}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold px-6 py-3 rounded-xl shadow-md disabled:opacity-50 text-sm"
                  >
                    {submittingGuidance ? 'Publishing Advisory...' : 'Publish Formal Guidance'}
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: INTERNAL EXPERT NOTES */}
            {activeTab === 'notes' && (
              <div className="space-y-4">
                <div className="bg-slate-100 p-3 rounded-xl text-xs text-slate-600 border">
                  🔒 Internal expert notes are strictly visible to verified agronomists and administrators. Farmers cannot see these notes.
                </div>

                <form onSubmit={handleAddInternalNote} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Record internal diagnostic observations or clinical notes..."
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    className="flex-1 border p-3 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                  <button
                    type="submit"
                    disabled={submittingNote || !noteContent.trim()}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-3 rounded-xl shadow-md disabled:opacity-50 text-xs"
                  >
                    {submittingNote ? 'Saving...' : 'Add Private Note'}
                  </button>
                </form>

                {/* Display Notes List */}
                <div className="space-y-3 pt-2">
                  {problem?.consultation?.messages?.filter((m: any) => m.isInternalNote).length === 0 ? (
                    <div className="text-xs text-slate-400 text-center py-6">No internal expert notes recorded.</div>
                  ) : (
                    problem?.consultation?.messages
                      ?.filter((m: any) => m.isInternalNote)
                      .map((n: any) => (
                        <div key={n.id} className="bg-amber-50/70 border border-amber-200 p-3.5 rounded-xl text-xs space-y-1">
                          <div className="font-bold text-amber-950 flex justify-between">
                            <span>🔒 {n.sender?.fullName || 'Expert'}</span>
                            <span className="text-[10px] text-amber-800">{new Date(n.createdAt).toLocaleString()}</span>
                          </div>
                          <p className="text-slate-800 font-medium">{n.messageText}</p>
                        </div>
                      ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
