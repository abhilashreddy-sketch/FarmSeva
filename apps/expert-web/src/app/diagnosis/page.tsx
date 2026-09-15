'use client';

import React, { useState } from 'react';
import { Card, Button, TextInput, Badge, Toast } from '@farm-seva/shared-ui';
import { Activity, Upload, Sparkles, Stethoscope } from 'lucide-react';

export default function DiagnosisToolPage() {
  const [crop, setCrop] = useState('Paddy (Rice)');
  const [farmerNotes, setFarmerNotes] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
    }
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setToast({ message: 'Please upload a plant leaf photo for AI pathology analysis', type: 'error' });
      return;
    }

    setLoading(true);
    setToast(null);
    setResult(null);

    const formData = new FormData();
    formData.append('photos', file);
    formData.append('crop', crop);
    formData.append('farmerNotes', farmerNotes);

    try {
      const res = await fetch('http://localhost:4000/api/v1/crop-doctor/analyze', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('farm_seva_token') || ''}`,
        },
        body: formData,
      });

      const json = await res.json();

      setLoading(false);

      if (json.success && json.data) {
        setResult(json.data);
        setToast({ message: 'AI Vision pathology analysis complete!', type: 'success' });
      } else {
        setToast({ message: json.error?.message || 'AI diagnosis failed. Please retry.', type: 'error' });
      }
    } catch (err: any) {
      setLoading(false);
      setToast({ message: err.message || 'Network error analyzing image.', type: 'error' });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {toast && (
        <Toast
          title={toast.type === 'success' ? 'Success' : 'Error'}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center p-3 bg-sky-100 rounded-2xl text-sky-700 mb-2">
          <Activity className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black text-slate-900">AI Pathology Inspector</h1>
        <p className="text-xs text-slate-500 font-medium">
          Upload plant pathology imagery to cross-verify AI Vision disease model confidence against expert diagnosis
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upload Form */}
        <Card className="p-6 border-slate-200 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Upload className="w-4 h-4 text-sky-600" />
            Upload Crop Specimen
          </h2>

          <form onSubmit={handleAnalyze} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Crop Type</label>
              <select
                value={crop}
                onChange={(e) => setCrop(e.target.value)}
                className="w-full px-3 py-2 text-xs font-medium border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
              >
                <option value="Paddy (Rice)">Paddy (Rice)</option>
                <option value="Cotton">Cotton</option>
                <option value="Chilli">Chilli</option>
                <option value="Tomato">Tomato</option>
                <option value="Maize / Corn">Maize / Corn</option>
                <option value="Groundnut">Groundnut</option>
              </select>
            </div>

            <div>
              <TextInput
                label="Observed Field Symptoms"
                placeholder="e.g. Yellow leaf halos, brown spots, leaf curl"
                value={farmerNotes}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFarmerNotes(e.target.value)}
              />
            </div>

            {/* Photo Upload Area */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Specimen Photo *</label>
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center hover:border-sky-400 transition bg-slate-50 relative">
                {previewUrl ? (
                  <div className="space-y-2">
                    <img src={previewUrl} alt="Specimen preview" className="h-32 object-cover rounded-xl mx-auto border border-slate-200" />
                    <p className="text-[11px] text-slate-500">{file?.name}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="text-xs font-bold text-slate-700">Click or Drag Leaf Specimen Image</p>
                    <p className="text-[10px] text-slate-400">Supports JPG, PNG up to 5MB</p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold"
              isLoading={loading}
              rightIcon={<Sparkles className="w-4 h-4" />}
            >
              Run AI Pathology Vision Test
            </Button>
          </form>
        </Card>

        {/* Results Panel */}
        <Card className="p-6 border-slate-200 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-sky-600" />
            AI Diagnostic Confidence Output
          </h2>

          {!result && !loading && (
            <div className="p-8 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50 space-y-2">
              <Stethoscope className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-500 font-medium">
                Upload a plant photo and run analysis to view AI Vision model diagnosis and confidence metrics.
              </p>
            </div>
          )}

          {loading && (
            <div className="p-8 text-center space-y-3">
              <div className="w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-bold text-slate-700">Evaluating Multimodal Vision Model...</p>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-sky-900">Detected Pathology:</span>
                  <Badge status="processing" className="bg-sky-200 text-sky-900">
                    AI Vision Model
                  </Badge>
                </div>
                <h3 className="text-lg font-black text-sky-950">{result.diseaseName || result.diagnosis || 'Bacterial Leaf Blight'}</h3>
                <p className="text-xs text-sky-800 leading-relaxed">{result.description || result.summary}</p>
              </div>

              {result.confidenceScore && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">Confidence Metric:</span>
                  <span className="font-black text-sky-700">{(result.confidenceScore * 100).toFixed(1)}%</span>
                </div>
              )}

              {result.recommendedTreatment && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-900">AI Suggested Pre-Prescription:</h4>
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 leading-relaxed">
                    {result.recommendedTreatment}
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
