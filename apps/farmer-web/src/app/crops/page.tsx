'use client';

import React, { useEffect, useState } from 'react';
import {
  Badge,
  Button,
  CardSkeleton,
  EmptyState,
  ErrorState,
  Modal,
  TextInput,
} from '@farm-seva/shared-ui';
import { Sprout, Plus, Calendar, MapPin, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiFetch, getAuthToken } from '../../lib/api-client';

export default function MyCropsPage() {
  const router = useRouter();
  const [crops, setCrops] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add Crop Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [sowingDate, setSowingDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadCrops = async () => {
    const token = getAuthToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    const res = await apiFetch<any[]>('/api/v1/farmer/crops');
    if (res.success && Array.isArray(res.data)) {
      setCrops(res.data);
    } else if (!res.success) {
      setError(res.error || 'Unable to load registered crop sowings.');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadCrops();
  }, []);

  const handleAddCrop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    const res = await apiFetch('/api/v1/farmer/crops', {
      method: 'POST',
      body: JSON.stringify({ name, sowingDate }),
    });

    setIsSubmitting(false);
    if (res.success) {
      setIsModalOpen(false);
      setName('');
      setSowingDate('');
      loadCrops();
    } else {
      setError(res.error || 'Failed to register crop sowing.');
    }
  };

  if (!getAuthToken()) {
    return (
      <div className="max-w-md mx-auto py-12 text-center space-y-4">
        <EmptyState
          title="Sign In Required"
          description="Please sign in to register and track your farm crop sowings."
          actionLabel="Sign In Now"
          onAction={() => router.push('/login')}
        />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-4 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <Badge status="active">Farm Sowing Manager</Badge>
          <h1 className="text-2xl font-black text-slate-900">My Registered Crops</h1>
          <p className="text-xs text-slate-500">
            Track growth stages, soil advisory alerts, and disease diagnostics for active crops.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => setIsModalOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
          className="bg-emerald-700 hover:bg-emerald-800"
        >
          Add Crop Sowing
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <CardSkeleton /><CardSkeleton />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={loadCrops} />
      ) : crops.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {crops.map((crop) => (
            <div
              key={crop.id}
              className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm hover:border-emerald-500 transition space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl font-bold text-base">
                    🌾
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{crop.name || crop.cropName}</h3>
                    <p className="text-[11px] text-slate-500">{crop.fieldName || 'Registered Plot'}</p>
                  </div>
                </div>
                <Badge status="active">{crop.stage || 'ACTIVE'}</Badge>
              </div>

              <div className="text-xs text-slate-600 space-y-1 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Sown: {crop.sowingDate ? new Date(crop.sowingDate).toLocaleDateString() : 'Recorded'}</span>
                </div>
              </div>

              <div className="pt-2">
                <Link href={`/crops/${crop.id}`}>
                  <Button variant="outline" size="sm" className="w-full" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    View Crop Advisory
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No Crops Registered Yet"
          description="Add your first crop sowing to receive personalized fertilizer dosage schedules and disease alerts."
          actionLabel="Add Crop Sowing"
          onAction={() => setIsModalOpen(true)}
        />
      )}

      {/* Add Crop Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="🌱 Add Crop Sowing"
        subtitle="Register crop variety and sowing date"
      >
        <form onSubmit={handleAddCrop} className="space-y-4">
          <TextInput
            label="Crop Name / Variety"
            required
            placeholder="e.g. Paddy (BPT 5204) or Cotton or Maize"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <TextInput
            label="Sowing Date (Optional)"
            type="date"
            value={sowingDate}
            onChange={(e) => setSowingDate(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Register Crop
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
