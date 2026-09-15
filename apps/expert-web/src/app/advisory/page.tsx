'use client';

import React, { useState } from 'react';
import { Card, Button, TextInput, Badge, Toast } from '@farm-seva/shared-ui';
import { AlertTriangle, Send, MapPin, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface AdvisoryBulletin {
  id: string;
  title: string;
  district: string;
  crop: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  content: string;
  createdAt: string;
}

export default function AdvisoryDeskPage() {
  const [advisories, setAdvisories] = useState<AdvisoryBulletin[]>([
    {
      id: 'ADV-01',
      title: 'Monsoon Yellow Rust Pest Alert for Wheat',
      district: 'Guntur / Krishna Hub',
      crop: 'Wheat / Paddy',
      severity: 'HIGH',
      content: 'Cool humid temperatures increase yellow rust fungal risk. Farmers are advised to spray Propiconazole 25% EC at 1ml/L.',
      createdAt: new Date().toLocaleDateString(),
    },
    {
      id: 'ADV-02',
      title: 'Cotton Pink Bollworm Advisory',
      district: 'Warangal / Khammam',
      crop: 'Cotton',
      severity: 'MEDIUM',
      content: 'Install Pheromone traps @ 5 per acre to monitor adult moth populations before egg laying.',
      createdAt: new Date(Date.now() - 86400000).toLocaleDateString(),
    },
  ]);

  const [title, setTitle] = useState('');
  const [district, setDistrict] = useState('');
  const [crop, setCrop] = useState('Paddy');
  const [severity, setSeverity] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('MEDIUM');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handlePostAdvisory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !district || !content) {
      setToast({ message: 'Please fill in bulletin title, district, and advisory content.', type: 'error' });
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      const newAdv: AdvisoryBulletin = {
        id: `ADV-${Date.now().toString().slice(-4)}`,
        title,
        district,
        crop,
        severity,
        content,
        createdAt: new Date().toLocaleDateString(),
      };

      setAdvisories([newAdv, ...advisories]);
      setTitle('');
      setDistrict('');
      setContent('');
      setSubmitting(false);
      setToast({ message: 'Regional agricultural advisory published successfully to district farmers!', type: 'success' });
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {toast && (
        <Toast
          title={toast.type === 'success' ? 'Success' : 'Error'}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-amber-500" />
            Regional Agricultural Advisories
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Publish district-level crop bulletins and pest outbreak warnings to protect farmer yields
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Post Form */}
        <div className="lg:col-span-1">
          <Card className="p-5 border-slate-200 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              Publish District Advisory
            </h2>

            <form onSubmit={handlePostAdvisory} className="space-y-3">
              <div>
                <TextInput
                  label="Bulletin Title"
                  placeholder="e.g. Stem Borer Outbreak Warning"
                  value={title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <TextInput
                  label="Target District"
                  placeholder="e.g. Guntur District"
                  value={district}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDistrict(e.target.value)}
                  leftIcon={<MapPin className="w-3.5 h-3.5 text-slate-400" />}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <TextInput
                    label="Target Crop"
                    placeholder="Paddy"
                    value={crop}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCrop(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Alert Level</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as any)}
                    className="w-full px-2.5 py-2.5 text-xs font-medium border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                  >
                    <option value="LOW">Low Alert</option>
                    <option value="MEDIUM">Medium Warning</option>
                    <option value="HIGH">High Alert</option>
                    <option value="CRITICAL">Critical Outbreak</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Advisory Guidelines & Preventive Action *</label>
                <textarea
                  rows={4}
                  placeholder="Enter specific chemical or organic measures farmers should take..."
                  value={content}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-medium border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                  required
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs"
                isLoading={submitting}
                rightIcon={<Send className="w-3.5 h-3.5" />}
              >
                Dispatch District Advisory Bulletin
              </Button>
            </form>
          </Card>
        </div>

        {/* Bulletins List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center justify-between">
            <span>Active District Bulletins ({advisories.length})</span>
            <span className="text-xs text-slate-400 font-normal">Updated Live</span>
          </h2>

          <div className="space-y-3">
            {advisories.map((adv) => (
              <Card key={adv.id} className="p-5 border-slate-200 hover:border-amber-300 transition space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge
                      status={
                        adv.severity === 'CRITICAL' || adv.severity === 'HIGH'
                          ? 'rejected'
                          : adv.severity === 'MEDIUM'
                          ? 'warning'
                          : 'active'
                      }
                    >
                      {adv.severity} ALERT
                    </Badge>
                    <span className="text-xs font-bold text-slate-500">• {adv.district}</span>
                  </div>
                  <span className="text-[11px] text-slate-400">{adv.createdAt}</span>
                </div>

                <h3 className="text-base font-black text-slate-900">{adv.title}</h3>
                <p className="text-xs text-slate-700 leading-relaxed bg-amber-50/50 p-3 rounded-xl border border-amber-100">
                  {adv.content}
                </p>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>Target Crop: {adv.crop}</span>
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Dispatched to District Farmers
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
