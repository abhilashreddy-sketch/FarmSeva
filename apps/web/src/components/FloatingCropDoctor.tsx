'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  X,
  Upload,
  Send,
  Bot,
  AlertTriangle,
  CheckCircle2,
  Lock,
  ArrowRight,
  RefreshCw,
  Image as ImageIcon
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Badge } from './ui/Badge';
import { API_BASE_URL } from '../config/api';

export function FloatingCropDoctor() {
  const { t, locale } = useLanguage();
  const { user, token } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [farmerNotes, setFarmerNotes] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Do not show floating assistant on delivery, seller, expert, or admin portals
  if (user && ['SELLER', 'AGRICULTURAL_EXPERT', 'DELIVERY_PARTNER', 'ADMIN'].includes(user.role)) {
    return null;
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedImage && !farmerNotes.trim()) {
      setErrorMsg(t('cropDoctor.inputRequired', 'Please select a crop photo or describe your crop issue'));
      return;
    }

    setErrorMsg('');
    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const formData = new FormData();
      if (selectedImage) formData.append('images', selectedImage);
      formData.append('farmerNotes', farmerNotes);
      formData.append('preferredLanguage', locale);

      const res = await fetch(`${API_BASE_URL}/api/v1/crop-doctor/analyze`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      const data = await res.json();
      setIsAnalyzing(false);

      if (data.success) {
        setAnalysisResult(data.data.analysis);
      } else {
        setErrorMsg(data.error?.message || t('cropDoctor.error', 'AI analysis failed. Please try again.'));
      }
    } catch (err: any) {
      setIsAnalyzing(false);
      setErrorMsg(t('cropDoctor.networkError', 'Network error connecting to FARM SEVA AI.'));
    }
  };

  const resetForm = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setFarmerNotes('');
    setAnalysisResult(null);
    setErrorMsg('');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white font-black text-xs uppercase tracking-wider rounded-full shadow-2xl hover:scale-105 transition-all border-2 border-emerald-400"
          aria-label="Open AI Crop Doctor Assistant"
        >
          <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
          <span>FARM SEVA AI</span>
        </button>
      )}

      {/* Floating Assistant Panel */}
      {isOpen && (
        <div className="w-[360px] sm:w-[420px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-emerald-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5">
          {/* Panel Header */}
          <div className="p-4 bg-gradient-to-r from-emerald-900 to-green-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-700/80 rounded-full flex items-center justify-center border border-emerald-500">
                <Bot className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <h3 className="text-sm font-black tracking-tight leading-none">FARM SEVA AI DOCTOR</h3>
                <p className="text-[10px] font-semibold text-emerald-200 mt-0.5">Gemini Diagnostic Vision</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full text-emerald-300 hover:text-white hover:bg-emerald-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Panel Body */}
          <div className="p-5 space-y-4 overflow-y-auto max-h-[calc(85vh-120px)] bg-slate-50/50">
            {/* Unauthenticated Guest Wall */}
            {!user ? (
              <div className="p-6 text-center space-y-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto">
                  <Lock className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-black text-slate-900">Sign in to use FARM SEVA AI</h4>
                  <p className="text-xs font-medium text-slate-600">
                    Get instant diagnostic assistance for your crops by logging in to your farmer account.
                  </p>
                </div>
                <div className="pt-2 space-y-2">
                  <Link href="/farmer/login" className="block w-full">
                    <Button variant="harvest" size="md" className="w-full font-bold">
                      Sign In to Use AI
                    </Button>
                  </Link>
                  <Link href="/farmer/register" className="block w-full">
                    <Button variant="outline" size="sm" className="w-full text-xs font-semibold">
                      Register Free Account
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              /* Authenticated AI Workflow */
              <>
                {errorMsg && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-700 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {!analysisResult ? (
                  <form onSubmit={handleAnalyze} className="space-y-4">
                    {/* Image Upload Area */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Upload Crop Leaf Photo
                      </label>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                      />

                      {imagePreview ? (
                        <div className="relative rounded-2xl overflow-hidden border border-slate-300 h-40 bg-slate-900">
                          <img src={imagePreview} alt="Crop Preview" className="w-full h-full object-contain" />
                          <button
                            type="button"
                            onClick={() => { setSelectedImage(null); setImagePreview(null); }}
                            className="absolute top-2 right-2 bg-slate-900/80 text-white p-1 rounded-full hover:bg-slate-900"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full h-32 border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/50 rounded-2xl flex flex-col items-center justify-center p-4 transition group"
                        >
                          <Upload className="w-8 h-8 text-emerald-600 group-hover:scale-110 transition-transform mb-1" />
                          <span className="text-xs font-bold text-emerald-800">Click to Select Leaf Photo</span>
                          <span className="text-[10px] text-slate-500 font-medium">JPEG, PNG up to 10MB</span>
                        </button>
                      )}
                    </div>

                    {/* Description Note Input */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Observed Symptoms (Optional)
                      </label>
                      <textarea
                        rows={2}
                        value={farmerNotes}
                        onChange={(e) => setFarmerNotes(e.target.value)}
                        placeholder="Yellowing spots on leaves, stem wilting..."
                        className="w-full p-2.5 text-xs font-medium border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <Button
                      type="submit"
                      variant="harvest"
                      size="md"
                      className="w-full font-bold shadow-md"
                      isLoading={isAnalyzing}
                      rightIcon={<Sparkles className="w-4 h-4" />}
                    >
                      {isAnalyzing ? 'Analyzing Crop Photo...' : 'Analyze Crop Health'}
                    </Button>
                  </form>
                ) : (
                  /* Analysis Result View */
                  <div className="space-y-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-xs">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <Badge variant="success" size="sm">DIAGNOSIS COMPLETE</Badge>
                      <button onClick={resetForm} className="text-slate-500 hover:text-slate-800 flex items-center gap-1 font-semibold">
                        <RefreshCw className="w-3 h-3" /> New Scan
                      </button>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Identified Crop</span>
                      <h4 className="text-sm font-black text-slate-900">{analysisResult.crop?.name || 'Unknown Crop'}</h4>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Primary Issue</span>
                      <p className="text-xs font-bold text-emerald-700">{analysisResult.assessment?.primaryProblem}</p>
                    </div>

                    {analysisResult.recommendedActions?.length > 0 && (
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Recommended Actions</span>
                        <ul className="mt-1 space-y-1 font-medium text-slate-700">
                          {analysisResult.recommendedActions.map((act: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                              <span>{act}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-semibold text-slate-500">
                      <span>Confidence: {analysisResult.assessment?.confidence || 85}%</span>
                      <Link href="/farmer/consultations/new" className="text-emerald-700 font-bold hover:underline">
                        Escalate to Human Expert →
                      </Link>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
