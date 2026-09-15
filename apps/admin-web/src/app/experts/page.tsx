'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  Badge,
  Button,
  TextInput,
  CardSkeleton,
  EmptyState,
  ErrorState,
  Toast,
} from '@farm-seva/shared-ui';
import { ShieldCheck, Search, CheckCircle2, XCircle, RefreshCw, Eye } from 'lucide-react';
import Link from 'next/link';
import { apiFetch, getAuthToken } from '../../lib/api-client';

interface ExpertRecord {
  id: string;
  specialization: string;
  qualificationNumber: string;
  yearsExperience: number;
  verificationStatus: string;
  user?: {
    id: string;
    fullName: string;
    phone: string;
    email?: string;
  };
}

export default function AdminExpertsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [experts, setExperts] = useState<ExpertRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Moderation Modal State
  const [selectedExpert, setSelectedExpert] = useState<ExpertRecord | null>(null);
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT'>('APPROVE');
  const [reason, setReason] = useState('');
  const [processing, setProcessing] = useState(false);

  const [toast, setToast] = useState<{ title: string; message: string; type: 'success' | 'error' } | null>(null);

  const fetchExperts = async () => {
    const token = getAuthToken();
    if (!token) {
      router.push('/login');
      return;
    }

    setLoading(true);
    setError(null);

    const res = await apiFetch<ExpertRecord[]>('/api/v1/admin/experts');

    if (res.success && Array.isArray(res.data)) {
      setExperts(res.data);
    } else {
      setError(res.error || 'Failed to fetch agronomist experts directory');
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchExperts();
  }, []);

  const handleVerifyExpert = async () => {
    if (!selectedExpert) return;
    setProcessing(true);

    const res = await apiFetch(`/api/v1/admin/experts/${selectedExpert.id}/verify`, {
      method: 'PATCH',
      body: JSON.stringify({
        status: actionType === 'APPROVE' ? 'VERIFIED' : 'REJECTED',
        reason: actionType === 'REJECT' ? reason : undefined,
      }),
    });

    if (res.success) {
      setToast({
        title: actionType === 'APPROVE' ? 'Agronomist Verified' : 'Agronomist Rejected',
        message: `Agronomist license verification status updated`,
        type: 'success',
      });
      setSelectedExpert(null);
      setReason('');
      fetchExperts();
    } else {
      setToast({
        title: 'Action Failed',
        message: res.error || 'Failed to verify expert',
        type: 'error',
      });
    }

    setProcessing(false);
  };

  const filteredExperts = experts.filter((e) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const name = e.user?.fullName || '';
    const phone = e.user?.phone || '';
    return (
      name.toLowerCase().includes(q) ||
      phone.includes(q) ||
      e.specialization.toLowerCase().includes(q) ||
      e.qualificationNumber.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {toast && (
        <Toast
          title={toast.title}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-sky-600" />
            Agronomist & Expert Advisory Directory
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Verify agronomist degree licenses, certifications, and advisory credentials.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchExperts}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Refresh Experts
        </Button>
      </div>

      <Card className="p-4 border-slate-200">
        <TextInput
          label="Search Experts"
          placeholder="Search agronomist name, specialization, or license number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </Card>

      {loading ? (
        <CardSkeleton />
      ) : error ? (
        <ErrorState title="Experts Directory Unavailable" message={error} onRetry={fetchExperts} />
      ) : filteredExperts.length === 0 ? (
        <EmptyState
          title="No Agronomist Experts Found"
          description="No expert advisory accounts matched your query."
          icon={<ShieldCheck className="w-8 h-8 text-slate-400" />}
        />
      ) : (
        <Card className="overflow-hidden border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Agronomist Name</th>
                  <th className="px-4 py-3">Specialization</th>
                  <th className="px-4 py-3">License No / Exp</th>
                  <th className="px-4 py-3">Verification</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredExperts.map((exp) => {
                  const status = exp.verificationStatus;
                  return (
                    <tr key={exp.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        <div>{exp.user?.fullName || 'Certified Expert'}</div>
                        <div className="text-[10px] text-slate-400">{exp.user?.phone}</div>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800">{exp.specialization}</td>
                      <td className="px-4 py-3 font-mono">
                        <div>Lic: {exp.qualificationNumber}</div>
                        <div className="text-[10px] text-slate-400">{exp.yearsExperience} Yrs Experience</div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          status={
                            status === 'VERIFIED' ? 'success' : status === 'REJECTED' ? 'rejected' : 'warning'
                          }
                        >
                          {status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setSelectedExpert(exp);
                            setActionType('APPROVE');
                          }}
                        >
                          Verify Credentials
                        </Button>
                        {exp.user?.id && (
                          <Link href={`/users/${exp.user.id}`}>
                            <Button variant="outline" size="sm" leftIcon={<Eye className="w-3 h-3" />}>
                              Audit
                            </Button>
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Expert Verification Modal */}
      {selectedExpert && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-sky-600" />
              Verify Agronomist Credentials
            </h3>
            <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl space-y-1">
              <div><span className="font-semibold text-slate-800">Agronomist Name:</span> {selectedExpert.user?.fullName || 'Expert'}</div>
              <div><span className="font-semibold text-slate-800">Specialization:</span> {selectedExpert.specialization}</div>
              <div><span className="font-semibold text-slate-800">License No:</span> {selectedExpert.qualificationNumber}</div>
              <div><span className="font-semibold text-slate-800">Experience:</span> {selectedExpert.yearsExperience} Years</div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Administrative Action</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setActionType('APPROVE')}
                  className={`p-2.5 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 ${
                    actionType === 'APPROVE'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-700 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 bg-white text-slate-600'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Approve Agronomist
                </button>
                <button
                  type="button"
                  onClick={() => setActionType('REJECT')}
                  className={`p-2.5 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 ${
                    actionType === 'REJECT'
                      ? 'bg-rose-50 border-rose-500 text-rose-700 ring-2 ring-rose-500/20'
                      : 'border-slate-200 bg-white text-slate-600'
                  }`}
                >
                  <XCircle className="w-4 h-4 text-rose-600" />
                  Reject Agronomist
                </button>
              </div>
            </div>

            {actionType === 'REJECT' && (
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Rejection Reason</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Specify qualification/license discrepancy..."
                  rows={3}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setSelectedExpert(null)}>
                Cancel
              </Button>
              <Button
                size="sm"
                className={actionType === 'APPROVE' ? 'bg-emerald-600 hover:bg-emerald-700 text-white font-bold' : 'bg-rose-600 hover:bg-rose-700 text-white font-bold'}
                onClick={handleVerifyExpert}
                disabled={processing}
              >
                {processing ? 'Processing...' : actionType === 'APPROVE' ? 'Verify Agronomist' : 'Reject Expert'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
