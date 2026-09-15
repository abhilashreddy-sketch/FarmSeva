'use client';

import React, { useEffect, useState } from 'react';
import {
  Badge,
  Button,
  CardSkeleton,
  EmptyState,
  InformationCard,
} from '@farm-seva/shared-ui';
import { Stethoscope, Sprout, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { apiFetch, getAuthToken } from '../../lib/api-client';

export default function AdvisoryPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      const token = getAuthToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const res = await apiFetch<any[]>('/api/v1/crop-doctor/history');
      if (res.success && Array.isArray(res.data)) {
        setHistory(res.data);
      }
      setIsLoading(false);
    }
    loadHistory();
  }, []);

  return (
    <div className="max-w-3xl mx-auto py-4 space-y-6">
      <div className="space-y-1">
        <Badge status="processing">Crop Health Advisory Hub</Badge>
        <h1 className="text-2xl font-black text-slate-900">Crop Care & Plant Pathology</h1>
        <p className="text-xs text-slate-500">
          Access AI Crop Doctor diagnostics, expert agronomist recommendations, and disease history.
        </p>
      </div>

      {/* Main Advisory Entry Points */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InformationCard
          badgeText="AI DIAGNOSTICS"
          title="Gemini AI Crop Doctor"
          description="Instant multimodal analysis of leaf spots, stem borer, paddy blast, and nutrient deficiency from photo uploads."
          icon={<Sprout className="w-6 h-6 text-emerald-700" />}
          action={
            <Button
              variant="primary"
              size="sm"
              className="bg-emerald-700 hover:bg-emerald-800"
              onClick={() => {
                // Open Crop Doctor modal via trigger
                const btn = document.querySelector('button[aria-label="Open AI Crop Doctor"]') as HTMLButtonElement;
                if (btn) btn.click();
              }}
            >
              Open AI Crop Doctor
            </Button>
          }
        />

        <InformationCard
          badgeText="EXPERT ADVISORY"
          title="Agronomist Workstation"
          description="Escalate complex plant pathology cases to certified university & ICAR agronomists for verified prescription."
          icon={<Stethoscope className="w-6 h-6 text-sky-700" />}
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => alert('Connects to Expert Advisory Queue when case is opened.')}
            >
              Consult Expert
            </Button>
          }
        />
      </div>

      {/* Pathology Case History */}
      <div className="space-y-3">
        <h2 className="text-base font-black text-slate-900">Previous Diagnosis History</h2>

        {isLoading ? (
          <CardSkeleton />
        ) : history.length > 0 ? (
          <div className="space-y-3">
            {history.map((h) => (
              <div key={h.id} className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{h.diseaseName || 'Crop Inspection'}</span>
                    <Badge status="success">COMPLETED</Badge>
                  </div>
                  <p className="text-xs text-slate-500">{h.createdAt ? new Date(h.createdAt).toLocaleDateString() : 'Recorded'}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No Previous Diagnostics"
            description="You have no recorded crop disease consultations. Use the AI Crop Doctor button anytime to analyze plant health."
          />
        )}
      </div>
    </div>
  );
}
