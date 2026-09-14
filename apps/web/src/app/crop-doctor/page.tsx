'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Camera,
  Upload,
  X,
  Sparkles,
  AlertTriangle,
  Stethoscope,
  ChevronRight,
  History,
  FileImage,
  Info,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { API_BASE_URL } from '@/config/api';

const POPULAR_CROPS = [
  'Rice (వరి / धान)',
  'Cotton (ప్రత్తి / कपास)',
  'Chilli (మిర్చి / मिर्च)',
  'Tomato (టమాటా / टमाटर)',
  'Potato (బంగాళాదుంప / आलू)',
  'Maize (జొన్న / मक्का)',
  'Groundnut (వేరుశనగ / मूंगफली)',
  'Wheat (గోధుమ / गेहूं)',
  'Sugarcane (చెరకు / गन्ना)',
  'Other',
];

const PROBLEM_LOCATIONS = [
  { id: 'Leaf', label: 'Leaf (ఆకు / पत्ता)' },
  { id: 'Stem', label: 'Stem / Branch (కాండం / तना)' },
  { id: 'Root', label: 'Root / Soil (వేరు / जड़)' },
  { id: 'Fruit', label: 'Fruit / Flower (పండు / फल / फूल)' },
  { id: 'Whole plant', label: 'Whole Plant (మొత్తం మొక్క / पूरा पौधा)' },
  { id: 'Unknown', label: 'Unknown / Not sure' },
];

const PROBLEM_DURATIONS = [
  { id: 'Today', label: 'Observed Today' },
  { id: 'Few days', label: '2 - 3 Days ago' },
  { id: '1–2 weeks', label: '1 - 2 Weeks ago' },
  { id: 'More than 2 weeks', label: 'More than 2 Weeks ago' },
  { id: 'Unknown', label: 'Unknown' },
];

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'te', name: 'తెలుగు (Telugu)' },
  { code: 'hi', name: 'हिंदी (Hindi)' },
  { code: 'kn', name: 'ಕನ್ನಡ (Kannada)' },
  { code: 'ta', name: 'தமிழ் (Tamil)' },
  { code: 'ml', name: 'മലയാളം (Malayalam)' },
  { code: 'mr', name: 'మరాఠీ (Marathi)' },
  { code: 'bn', name: 'বাংলা (Bengali)' },
];

export default function CropDoctorPage() {
  const { user, token } = useAuth();
  const router = useRouter();

  // Photo Upload State
  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  // Form Fields
  const [crop, setCrop] = useState('Rice (వరి / धान)');
  const [customCrop, setCustomCrop] = useState('');
  const [problemLocation, setProblemLocation] = useState('Leaf');
  const [problemDuration, setProblemDuration] = useState('Few days');
  const [farmerNotes, setFarmerNotes] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState(user?.preferredLanguage || 'en');

  // Diagnosis History & UI States
  const [history, setHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState('');

  // Hydrate user history
  useEffect(() => {
    async function fetchHistory() {
      if (!token) return;
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/crop-doctor/history`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          setHistory(data.data || []);
        }
      } catch (err) {
        console.error('Failed to load diagnosis history:', err);
      } finally {
        setIsLoadingHistory(false);
      }
    }
    fetchHistory();
  }, [token]);

  // Handle Photo Selection
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setErrorMsg('');

    const newFiles = Array.from(e.target.files);
    const combinedFiles = [...selectedPhotos, ...newFiles];

    if (combinedFiles.length > 5) {
      setErrorMsg('Maximum 5 photos allowed per diagnosis');
      return;
    }

    // Validate size & format
    for (const f of newFiles) {
      if (f.size > 5 * 1024 * 1024) {
        setErrorMsg(`Photo "${f.name}" exceeds maximum allowed size of 5MB`);
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(f.type)) {
        setErrorMsg(`File format "${f.type}" is not supported. Upload JPG, PNG, or WEBP.`);
        return;
      }
    }

    setSelectedPhotos(combinedFiles);

    // Create object URLs for preview
    const newUrls = newFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls((prev) => [...prev, ...newUrls]);
  };

  const removePhoto = (index: number) => {
    URL.revokeObjectURL(previewUrls[index]);
    setSelectedPhotos((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit Photo for Real AI Analysis
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (selectedPhotos.length === 0) {
      setErrorMsg('Please attach or take at least 1 photo of your crop problem');
      return;
    }

    if (!token) {
      router.push('/login');
      return;
    }

    setIsSubmitting(true);
    setLoadingStep('Uploading crop photos...');

    try {
      const formData = new FormData();
      selectedPhotos.forEach((file) => {
        formData.append('photos', file);
      });
      formData.append('crop', crop === 'Other' ? customCrop : crop);
      formData.append('problemLocation', problemLocation);
      formData.append('problemDuration', problemDuration);
      formData.append('farmerNotes', farmerNotes);
      formData.append('preferredLanguage', preferredLanguage);

      setLoadingStep('Analyzing photo with AI Crop Doctor...');

      const res = await fetch(`${API_BASE_URL}/api/v1/crop-doctor/analyze`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      setIsSubmitting(false);

      if (!data.success) {
        if (res.status === 503 || data.error?.code === 'SERVICE_NOT_CONFIGURED') {
          setErrorMsg('AI Crop Doctor vision service is currently not configured on this server. Please set GEMINI_API_KEY.');
        } else {
          setErrorMsg(data.error?.message || 'Failed to complete crop diagnosis');
        }
        return;
      }

      // Redirect to diagnosis result page
      router.push(`/crop-doctor/${data.data.id}`);
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg('Network error connecting to FARM SEVA AI Crop Doctor service.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6 px-3">
      {/* HEADER BANNER */}
      <Card className="p-6 bg-gradient-to-r from-emerald-800 to-teal-900 text-white shadow-elevated border-none">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-emerald-700/80 rounded-2xl flex items-center justify-center shrink-0 border border-emerald-500/30 shadow-inner">
            <Stethoscope className="w-8 h-8 text-emerald-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-black tracking-tight">AI Crop Doctor</h1>
              <Badge variant="harvest" size="sm" className="bg-amber-400 text-amber-950 font-black">
                <Sparkles className="w-3 h-3 mr-1" /> Multimodal Vision
              </Badge>
            </div>
            <p className="text-xs md:text-sm text-emerald-100/90 font-medium mt-1">
              Take photos of affected leaves, stems, or pests for immediate diagnostic guidance in your language.
            </p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* MAIN UPLOAD & FORM SECTION */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 border border-slate-200/80 space-y-6 shadow-sm">
            {errorMsg && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl text-xs font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* PHOTO UPLOAD BOX */}
              <div className="space-y-3">
                <label className="block text-sm font-extrabold text-slate-800 flex justify-between items-center">
                  <span>
                    Crop Photographs <span className="text-rose-500">*</span>
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    {selectedPhotos.length}/5 Photos
                  </span>
                </label>

                {/* DROP/CAPTURE TARGET */}
                <div className="border-2 border-dashed border-emerald-300/80 bg-emerald-50/40 rounded-2xl p-6 text-center space-y-4 hover:border-emerald-500 transition">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                    <Camera className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-slate-800">
                      Take or upload photos of your affected crop
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Clear close-ups of leaves, stems, or spots give the best AI result (Max 5MB each)
                    </p>
                  </div>

                  <div className="flex justify-center gap-3 pt-2">
                    <label className="cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold px-4 py-2.5 rounded-xl shadow-xs inline-flex items-center gap-2 transition">
                      <Camera className="w-4 h-4" /> Take / Choose Photos
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        onChange={handlePhotoSelect}
                        className="hidden"
                        disabled={selectedPhotos.length >= 5 || isSubmitting}
                      />
                    </label>
                  </div>
                </div>

                {/* THUMBNAIL PREVIEWS */}
                {previewUrls.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 pt-2">
                    {previewUrls.map((url, idx) => (
                      <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-300 group shadow-xs">
                        <img src={url} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removePhoto(idx)}
                          className="absolute top-1 right-1 bg-slate-900/80 hover:bg-rose-600 text-white p-1 rounded-full transition shadow-md"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* FARMER CONTEXT SELECTORS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                {/* CROP NAME */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Crop Name</label>
                  <select
                    value={crop}
                    onChange={(e) => setCrop(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-xs font-bold bg-white text-slate-800 focus:ring-2 focus:ring-emerald-500"
                  >
                    {POPULAR_CROPS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {crop === 'Other' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Enter Crop Name</label>
                    <input
                      type="text"
                      value={customCrop}
                      onChange={(e) => setCustomCrop(e.target.value)}
                      placeholder="e.g. Groundnut / Mustard"
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-xs font-bold bg-white text-slate-800"
                      required
                    />
                  </div>
                )}

                {/* PROBLEM LOCATION */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Problem Location</label>
                  <select
                    value={problemLocation}
                    onChange={(e) => setProblemLocation(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-xs font-bold bg-white text-slate-800"
                  >
                    {PROBLEM_LOCATIONS.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* DURATION */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Problem Duration</label>
                  <select
                    value={problemDuration}
                    onChange={(e) => setProblemDuration(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-xs font-bold bg-white text-slate-800"
                  >
                    {PROBLEM_DURATIONS.map((dur) => (
                      <option key={dur.id} value={dur.id}>
                        {dur.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* PREFERRED RESPONSE LANGUAGE */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Result Language</label>
                  <select
                    value={preferredLanguage}
                    onChange={(e) => setPreferredLanguage(e.target.value)}
                    className="w-full px-3 py-2.5 border border-emerald-400 bg-emerald-50/50 rounded-xl text-xs font-extrabold text-emerald-900"
                  >
                    {LANGUAGES.map((l) => (
                      <option key={l.code} value={l.code}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* FARMER NOTES */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Additional Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={farmerNotes}
                  onChange={(e) => setFarmerNotes(e.target.value)}
                  placeholder="e.g. Yellowing started on lower leaves after heavy rainfall last week..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium bg-white text-slate-800 focus:ring-2 focus:ring-emerald-500"
                ></textarea>
              </div>

              {/* SUBMIT BUTTON */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full py-3 text-sm font-black shadow-md"
                isLoading={isSubmitting}
              >
                {isSubmitting ? loadingStep : 'Run AI Photo Diagnosis →'}
              </Button>
            </form>
          </Card>
        </div>

        {/* SIDEBAR: TIPS & DIAGNOSIS HISTORY */}
        <div className="space-y-6">
          {/* PHOTO TIPS CARD */}
          <Card padding="md" className="bg-amber-50/70 border border-amber-200 space-y-3">
            <div className="flex items-center gap-2 text-amber-900 font-extrabold text-xs">
              <Info className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Recommended Photos for Accurate AI Diagnosis</span>
            </div>
            <ul className="text-[11px] text-amber-900/90 space-y-1.5 list-disc pl-4 font-medium">
              <li>Photo 1: Whole plant view</li>
              <li>Photo 2: Upper side of affected leaf</li>
              <li>Photo 3: Lower side of leaf (check for pests/fungus)</li>
              <li>Photo 4: Stem, fruit, or root area if affected</li>
            </ul>
          </Card>

          {/* DIAGNOSIS HISTORY */}
          <Card padding="md" className="space-y-4 border border-slate-200/80">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <History className="w-4 h-4 text-emerald-600" /> Recent Diagnoses
              </h3>
              <Badge variant="neutral" size="sm">
                {history.length} Saved
              </Badge>
            </div>

            {isLoadingHistory ? (
              <div className="text-xs text-slate-400 font-medium py-4 text-center">Loading history...</div>
            ) : history.length === 0 ? (
              <div className="text-xs text-slate-500 font-medium py-4 text-center">
                No past AI diagnoses found. Upload your first crop photo!
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {history.map((diag) => (
                  <Link
                    key={diag.id}
                    href={`/crop-doctor/${diag.id}`}
                    className="block p-3 rounded-xl border border-slate-200 hover:border-emerald-400 bg-white hover:bg-emerald-50/30 transition shadow-2xs group"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xs font-black text-slate-900 group-hover:text-emerald-700">
                          {diag.cropName}
                        </h4>
                        <p className="text-[11px] font-bold text-slate-600 mt-0.5">{diag.primaryProblem}</p>
                      </div>
                      <Badge
                        variant={diag.confidence >= 75 ? 'success' : diag.confidence >= 50 ? 'warning' : 'danger'}
                        size="sm"
                      >
                        {diag.confidence}%
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center mt-2 text-[10px] text-slate-400 font-semibold">
                      <span>{new Date(diag.createdAt).toLocaleDateString()}</span>
                      <span className="text-emerald-600 font-bold group-hover:underline flex items-center gap-0.5">
                        View <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
