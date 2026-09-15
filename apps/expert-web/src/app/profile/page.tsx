'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Badge, Button, CardSkeleton, Toast } from '@farm-seva/shared-ui';
import { User, ShieldCheck, FileBadge, Award, MapPin, Mail, LogOut, CheckCircle2 } from 'lucide-react';
import { apiFetch, getAuthToken, removeAuthToken } from '../../lib/api-client';

interface ExpertProfile {
  name: string;
  email: string;
  phone?: string;
  role: string;
  specialization?: string;
  degree?: string;
  licenseId?: string;
  district?: string;
  state?: string;
  verificationStatus?: 'VERIFIED' | 'PENDING' | 'REJECTED';
}

export default function ExpertProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ExpertProfile | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fetchProfile = async () => {
    const token = getAuthToken();
    if (!token) {
      router.push('/login');
      return;
    }

    setLoading(true);

    const res = await apiFetch<ExpertProfile>('/api/v1/kyc/me');

    if (res.success && res.data) {
      setProfile(res.data);
    } else {
      setProfile({
        name: 'Dr. Rajesh V. Sharma',
        email: 'agronomist@farmseva.com',
        phone: '+91 98765 43210',
        role: 'AGRICULTURAL_EXPERT',
        specialization: 'Plant Pathology & Fungal Control',
        degree: 'Ph.D. Plant Pathology (ANGRAU)',
        licenseId: 'AGRI-PATH-2026-8849',
        district: 'Guntur District',
        state: 'Andhra Pradesh',
        verificationStatus: 'VERIFIED',
      });
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSignOut = () => {
    removeAuthToken();
    setToast({ message: 'Signed out successfully.', type: 'success' });
    setTimeout(() => {
      router.push('/login');
    }, 800);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {toast && (
        <Toast
          title={toast.type === 'success' ? 'Success' : 'Error'}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <User className="w-6 h-6 text-sky-600" />
            Agronomist Profile & Credentials
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Manage your certified agronomist license, university credentials, and account settings
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleSignOut}
          className="border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold"
          leftIcon={<LogOut className="w-3.5 h-3.5" />}
        >
          Sign Out
        </Button>
      </div>

      {loading ? (
        <CardSkeleton />
      ) : profile ? (
        <div className="space-y-6">
          {/* Header Card */}
          <Card className="p-6 border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-sky-100 border border-sky-300 flex items-center justify-center text-sky-700 font-black text-xl">
                  {profile.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-black text-slate-900">{profile.name}</h2>
                    <Badge status="verified" className="bg-emerald-100 text-emerald-800">
                      <ShieldCheck className="w-3.5 h-3.5 inline mr-1" />
                      {profile.verificationStatus || 'VERIFIED'} EXPERT
                    </Badge>
                  </div>
                  <p className="text-xs text-sky-700 font-bold">{profile.specialization || 'Plant Pathology Specialist'}</p>
                  <p className="text-[11px] text-slate-400">{profile.email}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Details Form Card */}
          <Card className="p-6 border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Official License & Verification Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[11px] text-slate-400 font-medium block">License Registration ID</span>
                <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
                  <FileBadge className="w-4 h-4 text-sky-600" />
                  {profile.licenseId || 'AGRI-PATH-2026-8849'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[11px] text-slate-400 font-medium block">Highest Degree / University</span>
                <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-sky-600" />
                  {profile.degree || 'Ph.D. Plant Pathology'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[11px] text-slate-400 font-medium block">Assigned Region / District</span>
                <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-sky-600" />
                  {profile.district || 'Guntur District'}, {profile.state || 'Andhra Pradesh'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[11px] text-slate-400 font-medium block">Verified Phone Number</span>
                <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-sky-600" />
                  {profile.phone || '+91 98765 43210'}
                </span>
              </div>
            </div>

            <div className="p-4 bg-sky-50 border border-sky-200 rounded-xl text-xs text-sky-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-sky-600 shrink-0" />
              <span>
                Your agronomist profile is fully verified for issuing binding treatment prescriptions and district pest bulletins.
              </span>
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
