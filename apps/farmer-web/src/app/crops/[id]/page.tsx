'use client';

import React, { useEffect, useState } from 'react';
import {
  Badge,
  Button,
  CardSkeleton,
  ErrorState,
} from '@farm-seva/shared-ui';
import { ArrowLeft, Calendar, Sprout, ShieldCheck, Stethoscope } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { apiFetch, getAuthToken } from '../../../lib/api-client';

export default function CropDetailPage() {
  const params = useParams();
  const router = useRouter();
  const cropId = params.id as string;

  const [crop, setCrop] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCrop() {
      const token = getAuthToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      const res = await apiFetch<any>(`/api/v1/farmer/crops/${cropId}`);
      if (res.success && res.data) {
        setCrop(res.data);
      } else {
        // Fallback: search in list if direct GET endpoint returns alternative format
        const listRes = await apiFetch<any[]>('/api/v1/farmer/crops');
        if (listRes.success && Array.isArray(listRes.data)) {
          const match = listRes.data.find((c: any) => c.id === cropId);
          if (match) setCrop(match);
          else setError('Crop record not found.');
        } else {
          setError(res.error || 'Unable to load crop detail.');
        }
      }
      setIsLoading(false);
    }
    if (cropId) loadCrop();
  }, [cropId]);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto py-8 space-y-4">
        <CardSkeleton />
      </div>
    );
  }

  if (error || !crop) {
    return (
      <div className="max-w-3xl mx-auto py-8">
        <ErrorState
          type="404"
          title="Crop Sowing Record Not Found"
          message={error || 'The requested crop details could not be loaded.'}
          onRetry={() => router.push('/crops')}
        />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-4 space-y-6">
      <Link href="/crops" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to My Crops</span>
      </Link>

      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-100 text-emerald-900 rounded-2xl font-black text-xl">
              🌾
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900">{crop.name || crop.cropName}</h1>
              <p className="text-xs text-slate-500">{crop.fieldName || 'Registered Farm Plot'}</p>
            </div>
          </div>
          <Badge status="active">{crop.stage || 'ACTIVE SOWING'}</Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs">
          <div>
            <span className="text-slate-400 font-medium">Sowing Date</span>
            <p className="font-bold text-slate-900">{crop.sowingDate ? new Date(crop.sowingDate).toLocaleDateString() : 'N/A'}</p>
          </div>
          <div>
            <span className="text-slate-400 font-medium">Current Stage</span>
            <p className="font-bold text-slate-900">{crop.stage || 'Vegetative Growth'}</p>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="font-bold text-slate-900 text-sm">Crop Advisory & Protection Guidelines</h3>
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2 text-xs text-emerald-950">
            <p className="font-bold text-emerald-900">Recommended Next Step</p>
            <p className="text-slate-700 leading-relaxed">
              Ensure balanced nitrogen application and monitor leaves for stem borer or leaf blast symptoms. If spots appear, open AI Crop Doctor.
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-3">
          <Link href="/advisory" className="flex-1">
            <Button variant="primary" size="md" className="w-full bg-emerald-700 hover:bg-emerald-800" leftIcon={<Stethoscope className="w-4 h-4" />}>
              Get Crop Advisory
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
