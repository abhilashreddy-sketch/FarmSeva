'use client';

import React, { useState } from 'react';
import { Sprout, X, Upload, Send, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button, Modal, Badge } from '@farm-seva/shared-ui';
import { apiFetch } from '../lib/api-client';
import { API_BASE_URL } from '../config/api';

export const CropDoctorModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile && !notes.trim()) {
      setError('Please upload a plant photo or enter symptom details.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    // Call Crop Doctor Endpoint
    const formData = new FormData();
    if (selectedFile) formData.append('photos', selectedFile);
    if (notes) formData.append('notes', notes);

    const token = localStorage.getItem('farm_seva_token');
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/crop-doctor/analyze`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error?.message || 'AI Crop Doctor diagnosis service returned an error or requires login.');
      } else {
        setResult(json.data);
      }
    } catch (err: any) {
      setError('Unable to reach AI Crop Doctor service. Ensure Express API is active.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Persistent Floating Bottom-Right Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 bg-emerald-700 text-white font-extrabold text-xs sm:text-sm px-4 py-3 rounded-full shadow-lg hover:bg-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-400/50 flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95 border-2 border-emerald-400"
        aria-label="Open AI Crop Doctor"
      >
        <span className="p-1 bg-amber-400 text-emerald-950 rounded-full">🌱</span>
        <span>AI Crop Doctor</span>
      </button>

      {/* Assistant Modal */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="🌱 AI Crop Doctor Assistant"
        subtitle="Multimodal plant disease analysis & treatment prescription"
        size="md"
      >
        <div className="space-y-4 text-slate-800">
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-900">
            <Badge status="active">Gemini AI Engine</Badge>
            <span className="font-medium">Upload crop leave/stem photo for diagnosis</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Crop Leaf / Stem Image
              </label>
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:bg-slate-50 transition cursor-pointer relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <Upload className="w-6 h-6 mx-auto text-slate-400 mb-1" />
                <p className="text-xs font-bold text-slate-700">
                  {selectedFile ? selectedFile.name : 'Click to take photo or select image'}
                </p>
                <p className="text-[11px] text-slate-400">JPG, PNG up to 5MB</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Observed Crop Symptoms (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Yellow spots on leaves, stunted growth, paddy rust..."
                className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                rows={3}
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {result && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl space-y-2 text-xs text-green-950">
                <div className="flex items-center gap-1.5 font-bold text-green-900">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span>Diagnosis Result</span>
                </div>
                <p className="font-bold text-sm text-green-900">{result.diseaseName || result.diagnosis || 'Analysis Completed'}</p>
                <p className="text-slate-700 leading-relaxed">{result.treatment || result.prescription || JSON.stringify(result)}</p>
              </div>
            )}

            <div className="flex gap-2 justify-end pt-2">
              <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
                Close
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={isLoading}
                leftIcon={<Send className="w-4 h-4" />}
              >
                Analyze Crop Health
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
};
