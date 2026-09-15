'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Card,
  Badge,
  Button,
  CardSkeleton,
  ErrorState,
  Toast,
} from '@farm-seva/shared-ui';
import {
  User,
  Phone,
  Mail,
  Calendar,
  Shield,
  MapPin,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';
import { apiFetch, getAuthToken } from '../../../lib/api-client';

interface UserDetail {
  id: string;
  phone: string;
  email?: string;
  fullName: string;
  role: string;
  status: string;
  preferredLanguage?: string;
  createdAt: string;
  updatedAt: string;
  farmerProfile?: any;
  sellerProfile?: any;
  expertProfile?: any;
  deliveryProfile?: any;
}

export default function AdminUserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<UserDetail | null>(null);

  const [toast, setToast] = useState<{ title: string; message: string; type: 'success' | 'error' } | null>(null);

  const fetchUserDetail = async () => {
    const token = getAuthToken();
    if (!token) {
      router.push('/login');
      return;
    }

    setLoading(true);
    setError(null);

    // Fetch from user list endpoint filtered or find user
    const res = await apiFetch<UserDetail[]>(`/api/v1/admin/users?limit=100`);

    if (res.success && Array.isArray(res.data)) {
      const found = res.data.find((u) => u.id === userId);
      if (found) {
        setUser(found);
      } else {
        setError('Target user profile not found');
      }
    } else {
      setError(res.error || 'Failed to fetch user profile detail');
    }

    setLoading(false);
  };

  useEffect(() => {
    if (userId) fetchUserDetail();
  }, [userId]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {toast && (
        <Toast
          title={toast.title}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div>
        <Link href="/users" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 mb-2 font-semibold">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to User Directory
        </Link>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
          <User className="w-6 h-6 text-emerald-600" />
          User Account Audit Profile
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          Comprehensive administrative view of account status, credentials, and profile specifications.
        </p>
      </div>

      {loading ? (
        <CardSkeleton />
      ) : error ? (
        <ErrorState title="User Record Unavailable" message={error} onRetry={fetchUserDetail} />
      ) : !user ? (
        <ErrorState title="User Not Found" message="The requested user account does not exist." />
      ) : (
        <div className="space-y-6">
          {/* Summary Card */}
          <Card className="p-6 border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge status="processing" className="font-mono">{user.role}</Badge>
                  <Badge status={user.status === 'ACTIVE' ? 'success' : 'rejected'}>{user.status}</Badge>
                </div>
                <h2 className="text-lg font-bold text-slate-900">{user.fullName}</h2>
                <div className="text-xs text-slate-400 font-mono">User ID: {user.id}</div>
              </div>

              <div className="text-xs text-slate-500 space-y-1 sm:text-right">
                <div>Joined: {new Date(user.createdAt).toLocaleDateString()}</div>
                <div>Last Updated: {new Date(user.updatedAt).toLocaleDateString()}</div>
              </div>
            </div>

            {/* Core Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <div className="text-slate-400 font-medium flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-600" /> Phone Number
                </div>
                <div className="font-semibold text-slate-900">{user.phone}</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <div className="text-slate-400 font-medium flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-600" /> Email Address
                </div>
                <div className="font-semibold text-slate-900">{user.email || 'Not Provided'}</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <div className="text-slate-400 font-medium flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-slate-600" /> Preferred Language
                </div>
                <div className="font-semibold text-slate-900">{user.preferredLanguage || 'English'}</div>
              </div>
            </div>
          </Card>

          {/* Linked Role Specific Profiles */}
          {user.farmerProfile && (
            <Card className="p-6 border-slate-200 space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Farmer Profile Specification
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-4 rounded-xl">
                <div><span className="text-slate-400">Land Area:</span> <span className="font-semibold">{user.farmerProfile.landSizeAcres ?? 'N/A'} Acres</span></div>
                <div><span className="text-slate-400">Soil Type:</span> <span className="font-semibold">{user.farmerProfile.soilType ?? 'N/A'}</span></div>
                <div><span className="text-slate-400">Irrigation:</span> <span className="font-semibold">{user.farmerProfile.irrigationSource ?? 'N/A'}</span></div>
                <div className="col-span-2"><span className="text-slate-400">Primary Crops:</span> <span className="font-semibold">{Array.isArray(user.farmerProfile.crops) ? user.farmerProfile.crops.join(', ') : 'None specified'}</span></div>
              </div>
            </Card>
          )}

          {user.sellerProfile && (
            <Card className="p-6 border-slate-200 space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                Agri Seller Profile Specification
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-4 rounded-xl">
                <div><span className="text-slate-400">Shop Name:</span> <span className="font-semibold">{user.sellerProfile.businessName ?? user.sellerProfile.shopName ?? 'N/A'}</span></div>
                <div><span className="text-slate-400">GSTIN:</span> <span className="font-mono font-semibold">{user.sellerProfile.gstin ?? 'N/A'}</span></div>
                <div><span className="text-slate-400">Trade License:</span> <span className="font-mono font-semibold">{user.sellerProfile.licenseNumber ?? 'N/A'}</span></div>
                <div><span className="text-slate-400">Verification Status:</span> <Badge status="active">{user.sellerProfile.verificationStatus ?? 'N/A'}</Badge></div>
              </div>
            </Card>
          )}

          {user.expertProfile && (
            <Card className="p-6 border-slate-200 space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-sky-600" />
                Agronomist Expert Profile Specification
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-4 rounded-xl">
                <div><span className="text-slate-400">Specialization:</span> <span className="font-semibold">{user.expertProfile.specialization ?? 'Agronomy'}</span></div>
                <div><span className="text-slate-400">License No:</span> <span className="font-mono font-semibold">{user.expertProfile.qualificationNumber ?? 'N/A'}</span></div>
                <div><span className="text-slate-400">Verification Status:</span> <Badge status="active">{user.expertProfile.verificationStatus ?? 'N/A'}</Badge></div>
              </div>
            </Card>
          )}

          {user.deliveryProfile && (
            <Card className="p-6 border-slate-200 space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                Delivery Logistics Profile Specification
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-4 rounded-xl">
                <div><span className="text-slate-400">Vehicle Type:</span> <span className="font-semibold">{user.deliveryProfile.vehicleType ?? 'N/A'}</span></div>
                <div><span className="text-slate-400">Vehicle Reg No:</span> <span className="font-mono font-semibold">{user.deliveryProfile.vehicleNumber ?? 'N/A'}</span></div>
                <div><span className="text-slate-400">Operating Status:</span> <Badge status="active">{user.deliveryProfile.status ?? 'N/A'}</Badge></div>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
