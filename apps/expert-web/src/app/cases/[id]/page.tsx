'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Card,
  Badge,
  Button,
  TextInput,
  Toast,
  CardSkeleton,
  ErrorState,
} from '@farm-seva/shared-ui';
import {
  Stethoscope,
  ArrowLeft,
  FileText,
  Send,
  User,
  MapPin,
  Calendar,
  Sparkles,
  ShieldCheck,
  ImageIcon,
} from 'lucide-react';
import Link from 'next/link';
import { apiFetch, getAuthToken } from '../../../lib/api-client';

interface CaseDetail {
  id: string;
  cropName?: string;
  crop?: string;
  problemTitle?: string;
  farmerNotes?: string;
  description?: string;
  problemLocation?: string;
  problemDuration?: string;
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'PENDING_REVIEW' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'PENDING';
  createdAt: string;
  farmerName?: string;
  farmerPhone?: string;
  district?: string;
  images?: string[];
  aiAnalysis?: {
    diagnosis?: string;
    confidence?: number;
    recommendedActions?: string[];
    riskLevel?: string;
  };
  expertGuidance?: {
    diagnosisSummary?: string;
    chemicalTreatment?: string;
    organicAlternative?: string;
    dosageInstructions?: string;
    safetyPeriodDays?: number;
    submittedAt?: string;
  };
}

export default function CaseEvaluationDeskPage() {
  const params = useParams();
  const router = useRouter();
  const caseId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [caseDetail, setCaseDetail] = useState<CaseDetail | null>(null);

  // Form State
  const [diagnosisSummary, setDiagnosisSummary] = useState('');
  const [chemicalTreatment, setChemicalTreatment] = useState('');
  const [organicAlternative, setOrganicAlternative] = useState('');
  const [dosageInstructions, setDosageInstructions] = useState('');
  const [safetyPeriodDays, setSafetyPeriodDays] = useState('7');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fetchCaseDetail = async () => {
    const token = getAuthToken();
    if (!token) {
      router.push('/login');
      return;
    }

    setLoading(true);
    setError(null);

    const res = await apiFetch<CaseDetail>(`/api/v1/expert/crop-problems/${caseId}`);

    if (!res.success) {
      const cdRes = await apiFetch<CaseDetail>(`/api/v1/crop-doctor/${caseId}`);
      if (cdRes.success && cdRes.data) {
        setCaseDetail(cdRes.data);
        populateForm(cdRes.data);
      } else {
        setError(res.error || cdRes.error || `Failed to fetch case #${caseId} details.`);
      }
    } else if (res.data) {
      setCaseDetail(res.data);
      populateForm(res.data);
    }

    setLoading(false);
  };

  const populateForm = (data: CaseDetail) => {
    if (data.expertGuidance) {
      setDiagnosisSummary(data.expertGuidance.diagnosisSummary || '');
      setChemicalTreatment(data.expertGuidance.chemicalTreatment || '');
      setOrganicAlternative(data.expertGuidance.organicAlternative || '');
      setDosageInstructions(data.expertGuidance.dosageInstructions || '');
      setSafetyPeriodDays(data.expertGuidance.safetyPeriodDays?.toString() || '7');
    }
  };

  useEffect(() => {
    if (caseId) {
      fetchCaseDetail();
    }
  }, [caseId]);

  const handleSubmitGuidance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!diagnosisSummary || !chemicalTreatment) {
      setToast({ message: 'Diagnosis Summary and Chemical Treatment fields are required.', type: 'error' });
      return;
    }

    setSubmitting(true);
    setToast(null);

    const res = await apiFetch(`/api/v1/expert/crop-problems/${caseId}/guidance`, {
      method: 'POST',
      body: JSON.stringify({
        diagnosisSummary,
        chemicalTreatment,
        organicAlternative,
        dosageInstructions,
        safetyPeriodDays: parseInt(safetyPeriodDays, 10) || 7,
      }),
    });

    setSubmitting(false);

    if (res.success) {
      setToast({ message: 'Expert Agronomist Guidance submitted successfully!', type: 'success' });
      fetchCaseDetail();
    } else {
      setToast({ message: res.error || 'Failed to submit guidance. Please try again.', type: 'error' });
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {toast && (
        <Toast title={toast.type === 'success' ? 'Success' : 'Error'} message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      {/* Back Header */}
      <div className="flex items-center gap-3">
        <Link href="/cases">
          <Button variant="outline" size="sm" className="border-slate-300 text-slate-700" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Cases Queue
          </Button>
        </Link>
        <span className="text-xs font-bold text-slate-400">• Case Evaluation Desk</span>
      </div>

      {loading ? (
        <CardSkeleton />
      ) : error ? (
        <ErrorState title="Case Not Found" message={error} onRetry={fetchCaseDetail} />
      ) : !caseDetail ? (
        <ErrorState title="Record Unavailable" message="Case details could not be parsed." />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Case Information & Photos */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="p-5 border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <Badge
                  status={
                    caseDetail.status === 'RESOLVED' || caseDetail.status === 'CLOSED'
                      ? 'success'
                      : caseDetail.status === 'IN_PROGRESS'
                      ? 'processing'
                      : 'pending'
                  }
                >
                  {caseDetail.status.replace('_', ' ')}
                </Badge>
                <span className="text-[10px] text-slate-400 font-mono">ID: #{caseDetail.id.slice(-6)}</span>
              </div>

              <div>
                <h1 className="text-lg font-black text-slate-900">
                  {caseDetail.cropName || caseDetail.crop || 'Crop Disease Submission'}
                </h1>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Reported location: {caseDetail.problemLocation || caseDetail.district || 'Field Location'}
                </p>
              </div>

              {/* Photos Gallery */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-sky-600" />
                  Field Crop Imagery ({caseDetail.images?.length || 0})
                </label>
                {caseDetail.images && caseDetail.images.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {caseDetail.images.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`Crop symptom ${idx + 1}`}
                        className="w-full h-24 object-cover rounded-xl border border-slate-200"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center bg-slate-50">
                    <ImageIcon className="w-8 h-8 text-slate-300 mx-auto mb-1" />
                    <p className="text-[11px] text-slate-400 font-medium">No crop images uploaded</p>
                  </div>
                )}
              </div>

              {/* Farmer Meta */}
              <div className="space-y-2 text-xs pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2 text-slate-700">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-bold">Farmer:</span> {caseDetail.farmerName || 'Registered Farmer'}
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-bold">District:</span> {caseDetail.district || 'Agricultural Region'}
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-bold">Date:</span> {new Date(caseDetail.createdAt || Date.now()).toLocaleDateString()}
                </div>
              </div>
            </Card>

            {/* AI Pre-Screening Card */}
            {caseDetail.aiAnalysis && (
              <Card className="p-4 border-sky-200 bg-sky-50/50 space-y-2">
                <div className="flex items-center gap-2 text-sky-900 font-bold text-xs">
                  <Sparkles className="w-4 h-4 text-sky-600" />
                  AI Vision Pre-Screening Analysis
                </div>
                <p className="text-xs text-sky-800">
                  <strong>Suspected Disease:</strong> {caseDetail.aiAnalysis.diagnosis || 'Unspecified Pathology'}
                </p>
                {caseDetail.aiAnalysis.confidence && (
                  <p className="text-[11px] text-sky-700">
                    Confidence Level: {(caseDetail.aiAnalysis.confidence * 100).toFixed(0)}%
                  </p>
                )}
              </Card>
            )}
          </div>

          {/* Right Column: Case Symptoms & Agronomist Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Symptom Description */}
            <Card className="p-6 border-slate-200 space-y-3">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-sky-600" />
                Reported Symptoms & Notes
              </h2>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
                {caseDetail.problemTitle || caseDetail.farmerNotes || caseDetail.description || 'Farmer reported leaf spots, discoloration, and stem degradation.'}
              </div>
            </Card>

            {/* Agronomist Guidance Form */}
            <Card className="p-6 border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-sky-600" />
                  Official Agronomist Treatment Guidance
                </h2>
                <Badge status="processing" className="bg-sky-100 text-sky-800">
                  Advisory Form
                </Badge>
              </div>

              <form onSubmit={handleSubmitGuidance} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Disease Assessment Summary *
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter assessment (e.g. Cercospora Leaf Spot caused by fungal spores...)"
                    value={diagnosisSummary}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDiagnosisSummary(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-medium border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Recommended Treatment & Active Ingredient *
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Specify fungicide/pesticide name (e.g. Mancozeb 75% WP @ 2g per liter of water)"
                    value={chemicalTreatment}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setChemicalTreatment(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-medium border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Organic / Biological Alternative
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Biological alternative (e.g. Neem Oil 10,000 PPM or Trichoderma viride application)"
                    value={organicAlternative}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setOrganicAlternative(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-medium border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <TextInput
                      label="Dosage & Application Frequency"
                      placeholder="Foliar spray twice at 10-day interval"
                      value={dosageInstructions}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDosageInstructions(e.target.value)}
                    />
                  </div>
                  <div>
                    <TextInput
                      label="Pre-Harvest Interval / Safety Days"
                      type="number"
                      placeholder="7"
                      value={safetyPeriodDays}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSafetyPeriodDays(e.target.value)}
                    />
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-500 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Submitting this recommendation records your agronomist credentials against case #{caseDetail.id.slice(-6)} and dispatches guidance to the farmer.
                  </span>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold"
                  isLoading={submitting}
                  rightIcon={<Send className="w-4 h-4" />}
                >
                  Publish Agronomist Guidance & Resolve Case
                </Button>
              </form>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
