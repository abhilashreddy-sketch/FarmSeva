'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Stethoscope,
  Volume2,
  VolumeX,
  AlertTriangle,
  UserCheck,
  CheckCircle2,
  ArrowLeft,
  Share2,
  ShieldAlert,
  Sparkles,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { API_BASE_URL } from '@/config/api';

export default function DiagnosisResultPage() {
  const { id } = useParams();
  const { token } = useAuth();
  const router = useRouter();

  const [diagnosis, setDiagnosis] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Audio / Speech State
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioObj, setAudioObj] = useState<HTMLAudioElement | null>(null);
  const [speechSynthesisAvailable, setSpeechSynthesisAvailable] = useState(false);

  // Escalation State
  const [isEscalating, setIsEscalating] = useState(false);
  const [escalationSuccess, setEscalationSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSpeechSynthesisAvailable(true);
    }
  }, []);

  // Fetch Diagnosis Record
  useEffect(() => {
    async function fetchDiagnosis() {
      if (!token || !id) return;
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/crop-doctor/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          setDiagnosis(data.data);
        } else {
          setErrorMsg(data.error?.message || 'Diagnosis record not found');
        }
      } catch (err) {
        setErrorMsg('Network error fetching diagnosis details');
      } finally {
        setIsLoading(false);
      }
    }
    fetchDiagnosis();
  }, [token, id]);

  // Audio Playback Handler
  const toggleAudioSpeech = () => {
    if (!diagnosis) return;

    if (isPlayingAudio) {
      if (audioObj) {
        audioObj.pause();
      }
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsPlayingAudio(false);
      return;
    }

    // Play server generated audio URL if available
    if (diagnosis.audioUrl) {
      const audio = new Audio(`${API_BASE_URL}${diagnosis.audioUrl}`);
      setAudioObj(audio);
      audio.play();
      setIsPlayingAudio(true);
      audio.onended = () => setIsPlayingAudio(false);
      audio.onerror = () => {
        setIsPlayingAudio(false);
        fallbackWebSpeech();
      };
      return;
    }

    // Fallback to Web Speech API in selected language
    fallbackWebSpeech();
  };

  const fallbackWebSpeech = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const summaryText = `${diagnosis.cropName}. Possible problem: ${diagnosis.primaryProblem}. What you can do: ${diagnosis.recommendedActions.join('. ')}`;
      const utterance = new SpeechSynthesisUtterance(summaryText);
      utterance.lang = diagnosis.selectedLanguage === 'te' ? 'te-IN' : diagnosis.selectedLanguage === 'hi' ? 'hi-IN' : 'en-IN';
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
      setIsPlayingAudio(true);
    }
  };

  // Handle Escalation to Expert
  const handleEscalate = async () => {
    if (!token || !id) return;
    setIsEscalating(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/crop-doctor/${id}/escalate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          farmerNotes: 'Farmer requested expert agronomist consultation from AI Crop Doctor result page.',
        }),
      });

      const data = await res.json();
      setIsEscalating(false);

      if (data.success) {
        setEscalationSuccess('Submitted to FARM SEVA Agricultural Experts! Redirecting to consultation queue...');
        setTimeout(() => {
          router.push('/farmer/crop-problems');
        }, 2000);
      } else {
        setErrorMsg(data.error?.message || 'Failed to submit expert consultation request');
      }
    } catch (err) {
      setIsEscalating(false);
      setErrorMsg('Network error submitting consultation request');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs font-bold text-slate-600">Retrieving AI Crop Diagnosis Record...</p>
      </div>
    );
  }

  if (errorMsg || !diagnosis) {
    return (
      <div className="max-w-md mx-auto py-12 space-y-4 px-3 text-center">
        <Card padding="md" className="bg-rose-50 border border-rose-200 space-y-3">
          <AlertTriangle className="w-8 h-8 text-rose-600 mx-auto" />
          <h2 className="text-base font-black text-rose-900">Diagnosis Unavailable</h2>
          <p className="text-xs text-rose-700 font-semibold">{errorMsg || 'Could not load requested diagnosis'}</p>
          <Button variant="outline" onClick={() => router.push('/crop-doctor')} className="mt-2">
            ← Back to AI Crop Doctor
          </Button>
        </Card>
      </div>
    );
  }

  const isLowConfidence = diagnosis.confidence < 70 || diagnosis.needsExpert;

  return (
    <div className="max-w-3xl mx-auto py-6 space-y-6 px-3">
      {/* NAVIGATION HEADER */}
      <div className="flex items-center justify-between text-xs">
        <Link href="/crop-doctor" className="font-extrabold text-emerald-700 hover:underline flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to Crop Doctor
        </Link>
        <span className="text-slate-400 font-bold">Diagnosis ID: {diagnosis.id.substring(0, 8)}</span>
      </div>

      {/* RESULT HERO CARD */}
      <Card className="p-6 md:p-8 space-y-6 border border-slate-200/80 shadow-elevated">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="harvest" size="sm" className="bg-emerald-100 text-emerald-800 font-black">
                🌱 {diagnosis.cropName}
              </Badge>
              <Badge
                variant={diagnosis.confidence >= 75 ? 'success' : diagnosis.confidence >= 50 ? 'warning' : 'danger'}
                size="sm"
                className="font-black"
              >
                AI Confidence: {diagnosis.confidence}%
              </Badge>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 mt-2 tracking-tight">
              {diagnosis.primaryProblem}
            </h1>
            <p className="text-xs font-bold text-slate-500 mt-0.5">
              Category: <span className="text-slate-700">{diagnosis.problemType}</span>
            </p>
          </div>

          {/* LISTEN AUDIO BUTTON */}
          <Button
            type="button"
            variant={isPlayingAudio ? 'danger' : 'secondary'}
            size="md"
            onClick={toggleAudioSpeech}
            className="flex items-center gap-2 font-black shadow-xs shrink-0"
          >
            {isPlayingAudio ? (
              <>
                <VolumeX className="w-4 h-4 text-rose-600 animate-pulse" /> Stop Voice
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-emerald-600" /> Listen to Solution (🔊)
              </>
            )}
          </Button>
        </div>

        {/* LOW CONFIDENCE / EXPERT WARNING BANNER */}
        {isLowConfidence && (
          <div className="bg-amber-50 border-2 border-amber-300 p-4 rounded-2xl space-y-3 shadow-xs">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-black text-amber-900">
                  AI Confidence Rating Below Threshold ({diagnosis.confidence}%)
                </h3>
                <p className="text-xs text-amber-800 font-medium mt-0.5">
                  {diagnosis.expertReason ||
                    'The visible symptoms are ambiguous or complex. We recommend consulting a certified agronomist.'}
                </p>
              </div>
            </div>

            {escalationSuccess ? (
              <div className="bg-emerald-100 border border-emerald-300 text-emerald-900 p-3 rounded-xl text-xs font-black text-center">
                ✓ {escalationSuccess}
              </div>
            ) : (
              <Button
                type="button"
                variant="primary"
                size="md"
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-black py-2.5"
                isLoading={isEscalating}
                onClick={handleEscalate}
              >
                <UserCheck className="w-4 h-4 mr-1.5" /> Talk to FARM SEVA Agricultural Expert →
              </Button>
            )}
          </div>
        )}

        {/* UPLOADED CROP IMAGES GALLERY */}
        {diagnosis.images && diagnosis.images.length > 0 && (
          <div className="space-y-2">
            <label className="block text-xs font-extrabold text-slate-700">Analyzed Crop Photos</label>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {diagnosis.images.map((img: any) => (
                <a
                  key={img.id}
                  href={`${API_BASE_URL}${img.imageUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 aspect-square w-24 h-24 rounded-xl overflow-hidden border border-slate-200 shadow-xs hover:opacity-95 transition"
                >
                  <img src={`${API_BASE_URL}${img.imageUrl}`} alt="Crop detail" className="w-full h-full object-cover" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* DIAGNOSIS SECTIONS */}
        <div className="space-y-6 pt-2">
          {/* OBSERVATIONS / SYMPTOMS */}
          {diagnosis.observations && diagnosis.observations.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Visible Symptoms Observed
              </h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-semibold text-slate-700 pl-2">
                {diagnosis.observations.map((obs: string, idx: number) => (
                  <li key={idx} className="bg-slate-50 border border-slate-200/80 p-2.5 rounded-xl flex items-start gap-2">
                    <span className="text-emerald-600 font-extrabold">•</span> {obs}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* RECOMMENDED ACTIONS */}
          {diagnosis.recommendedActions && diagnosis.recommendedActions.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" /> Immediate Actions Required
              </h3>
              <div className="space-y-2">
                {diagnosis.recommendedActions.map((act: string, idx: number) => (
                  <div key={idx} className="bg-emerald-50/60 border border-emerald-200/80 p-3 rounded-xl text-xs font-bold text-slate-800 flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 font-extrabold text-[11px]">
                      {idx + 1}
                    </span>
                    <span className="mt-0.5">{act}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PREVENTIVE MEASURES */}
          {diagnosis.prevention && diagnosis.prevention.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-black text-slate-900">Preventive Measures & Future Control</h3>
              <ul className="text-xs font-medium text-slate-700 space-y-1.5 list-disc pl-5">
                {diagnosis.prevention.map((prev: string, idx: number) => (
                  <li key={idx}>{prev}</li>
                ))}
              </ul>
            </div>
          )}

          {/* SAFE MEDICINE GUIDANCE */}
          {diagnosis.medicineGuidance && diagnosis.medicineGuidance.length > 0 && (
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2 text-xs">
              <h3 className="font-extrabold text-slate-900 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-emerald-700" /> Safe Treatment Guidance Notice
              </h3>
              <div className="text-slate-600 space-y-1 font-medium text-[11px]">
                {diagnosis.medicineGuidance.map((g: string, idx: number) => (
                  <p key={idx}>• {g}</p>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* AI DISCLAIMER BANNER */}
        <div className="bg-slate-100/80 border border-slate-200 p-4 rounded-xl text-[11px] text-slate-500 font-semibold space-y-1">
          <p className="font-extrabold text-slate-700">⚠️ Mandatory Regulatory Safety Notice:</p>
          <p>
            This diagnosis is an AI-assisted computer vision assessment and does not replace professional agricultural field advice or CIB-approved label instructions. Always follow certified agronomist advice before applying chemical treatments.
          </p>
        </div>
      </Card>
    </div>
  );
}
