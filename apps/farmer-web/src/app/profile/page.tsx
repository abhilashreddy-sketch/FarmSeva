'use client';

import React, { useEffect, useState } from 'react';
import {
  Badge,
  Button,
  CardSkeleton,
  EmptyState,
  TextInput,
} from '@farm-seva/shared-ui';
import { User, Phone, MapPin, LogOut, ShieldCheck, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { apiFetch, getAuthToken, removeAuthToken } from '../../lib/api-client';

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      const token = getAuthToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const res = await apiFetch<any>('/api/v1/farmer/profile');
      if (res.success) {
        setProfile(res.data);
      }
      setIsLoading(false);
    }
    loadProfile();
  }, []);

  const handleLogout = () => {
    removeAuthToken();
    router.push('/login');
  };

  if (!getAuthToken()) {
    return (
      <div className="max-w-md mx-auto py-12 text-center space-y-4">
        <EmptyState
          title="Sign In Required"
          description="Please sign in to view your profile settings and farm addresses."
          actionLabel="Sign In Now"
          onAction={() => router.push('/login')}
        />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-4 space-y-6">
      <div className="space-y-1">
        <Badge status="verified">Farmer Account Settings</Badge>
        <h1 className="text-2xl font-black text-slate-900">Account & Profile</h1>
        <p className="text-xs text-slate-500">
          Manage personal details, registered phone number, and district location.
        </p>
      </div>

      {isLoading ? (
        <CardSkeleton />
      ) : (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-2xl">
                🌾
              </div>
              <div className="space-y-0.5">
                <h2 className="text-xl font-black text-slate-900">{profile?.name || profile?.user?.name || 'Farmer'}</h2>
                <p className="text-xs font-bold text-slate-500">Role: FARMER • Status: Active</p>
              </div>
            </div>

            <div className="space-y-4">
              <TextInput
                label="Full Name"
                disabled
                leftIcon={<User className="w-4 h-4" />}
                value={profile?.name || profile?.user?.name || ''}
              />

              <TextInput
                label="Registered Phone Number"
                disabled
                leftIcon={<Phone className="w-4 h-4" />}
                value={profile?.phone || profile?.user?.phone || ''}
              />

              <TextInput
                label="District / Location"
                disabled
                leftIcon={<MapPin className="w-4 h-4" />}
                value={profile?.district || profile?.address || 'District Location Active'}
              />
            </div>

            <div className="pt-4 border-t border-slate-100">
              <Button
                variant="danger"
                size="md"
                onClick={handleLogout}
                className="w-full sm:w-auto"
                leftIcon={<LogOut className="w-4 h-4" />}
              >
                Sign Out of Account
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
