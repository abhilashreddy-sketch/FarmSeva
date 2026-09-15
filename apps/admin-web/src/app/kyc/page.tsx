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
import { UserCheck, CheckCircle2, XCircle, HelpCircle, RefreshCw, Eye, FileText } from 'lucide-react';
import { apiFetch, getAuthToken } from '../../lib/api-client';

interface KycApplication {
  id: string;
  userId: string;
  documentType: string;
  documentNumber: string;
  documentUrl?: string;
  status: string;
  notes?: string;
  createdAt: string;
  user?: {
    fullName: string;
    phone: string;
    role: string;
  };
}

export default function AdminKycPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applications, setApplications] = useState<KycApplication[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Action Modal State
  const [selectedKyc, setSelectedKyc] = useState<KycApplication | null>(null);
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT' | 'REQUEST_INFO'>('APPROVE');
  const [notes, setNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  const [toast, setToast] = useState<{ title: string; message: string; type: 'success' | 'error' } | null>(null);

  const fetchKycApplications = async () => {
    const token = getAuthToken();
    if (!token) {
      router.push('/login');
      return;
    }

    setLoading(true);
    setError(null);

    let url = '/api/v1/admin/kyc';
    if (statusFilter) url += `?status=${statusFilter}`;

    const res = await apiFetch<{ applications: KycApplication[] }>(url);

    if (res.success && res.data?.applications) {
      setApplications(res.data.applications);
    } else if (res.success && Array.isArray(res.data)) {
      setApplications(res.data as any);
    } else {
      setError(res.error || 'Failed to fetch KYC moderation applications');
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchKycApplications();
  }, [statusFilter]);

  const handleKycAction = async () => {
    if (!selectedKyc) return;
    setProcessing(true);

    let endpoint = `/api/v1/admin/kyc/${selectedKyc.id}/approve`;
    let body: any = { notes: notes || 'Admin verified' };

    if (actionType === 'REJECT') {
      endpoint = `/api/v1/admin/kyc/${selectedKyc.id}/reject`;
      body = { rejectionReason: notes || 'Documents unreadable or incomplete' };
    } else if (actionType === 'REQUEST_INFO') {
      endpoint = `/api/v1/admin/kyc/${selectedKyc.id}/request-info`;
      body = { notes: notes || 'Please upload a clearer document scan' };
    }

    const res = await apiFetch(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });

    if (res.success) {
      setToast({
        title: 'KYC Action Complete',
        message: `Application ${actionType.toLowerCase()}d successfully`,
        type: 'success',
      });
      setSelectedKyc(null);
      setNotes('');
      fetchKycApplications();
    } else {
      setToast({
        title: 'Action Failed',
        message: res.error || 'Failed to process KYC application',
        type: 'error',
      });
    }

    setProcessing(false);
  };

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
            <UserCheck className="w-6 h-6 text-amber-600" />
            Platform KYC Verification Desk
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Moderate Aadhaar, PAN, Trade Licenses, and Agronomist verification documents.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchKycApplications}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Refresh Desk
        </Button>
      </div>

      <Card className="p-4 border-slate-200">
        <div className="flex items-center gap-4 text-xs">
          <label className="font-medium text-slate-700">Filter by Verification Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          >
            <option value="">All Applications</option>
            <option value="SUBMITTED">SUBMITTED (Pending Audit)</option>
            <option value="APPROVED">APPROVED</option>
            <option value="REJECTED">REJECTED</option>
            <option value="MORE_INFO_REQUESTED">MORE INFO REQUESTED</option>
          </select>
        </div>
      </Card>

      {loading ? (
        <CardSkeleton />
      ) : error ? (
        <ErrorState title="KYC Desk Unavailable" message={error} onRetry={fetchKycApplications} />
      ) : applications.length === 0 ? (
        <EmptyState
          title="No Pending KYC Submissions"
          description="There are currently no platform KYC documents waiting for moderation."
          icon={<UserCheck className="w-8 h-8 text-slate-400" />}
        />
      ) : (
        <Card className="overflow-hidden border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Applicant Name</th>
                  <th className="px-4 py-3">User Role</th>
                  <th className="px-4 py-3">Document Type</th>
                  <th className="px-4 py-3">Doc Number</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {applications.map((kyc) => (
                  <tr key={kyc.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      <div>{kyc.user?.fullName || 'Applicant'}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{kyc.user?.phone}</div>
                    </td>
                    <td className="px-4 py-3 font-mono font-medium">{kyc.user?.role || 'USER'}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{kyc.documentType}</td>
                    <td className="px-4 py-3 font-mono">{kyc.documentNumber}</td>
                    <td className="px-4 py-3">
                      <Badge
                        status={
                          kyc.status === 'APPROVED'
                            ? 'success'
                            : kyc.status === 'REJECTED'
                            ? 'rejected'
                            : 'warning'
                        }
                      >
                        {kyc.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setSelectedKyc(kyc);
                          setActionType('APPROVE');
                        }}
                      >
                        Audit KYC
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Audit Modal */}
      {selectedKyc && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-amber-600" />
              Audit KYC Document Submission
            </h3>
            <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl space-y-1">
              <div><span className="font-semibold text-slate-800">Applicant:</span> {selectedKyc.user?.fullName} ({selectedKyc.user?.role})</div>
              <div><span className="font-semibold text-slate-800">Document Type:</span> {selectedKyc.documentType}</div>
              <div><span className="font-semibold text-slate-800">Doc Number:</span> {selectedKyc.documentNumber}</div>
              {selectedKyc.documentUrl && (
                <div><span className="font-semibold text-slate-800">Doc Scan URL:</span> <a href={selectedKyc.documentUrl} target="_blank" rel="noreferrer" className="text-emerald-600 underline font-mono">View Document</a></div>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Decision Action</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setActionType('APPROVE')}
                  className={`p-2 text-xs font-bold rounded-xl border flex flex-col items-center justify-center gap-1 ${
                    actionType === 'APPROVE'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-700 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 bg-white text-slate-600'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Approve
                </button>

                <button
                  type="button"
                  onClick={() => setActionType('REJECT')}
                  className={`p-2 text-xs font-bold rounded-xl border flex flex-col items-center justify-center gap-1 ${
                    actionType === 'REJECT'
                      ? 'bg-rose-50 border-rose-500 text-rose-700 ring-2 ring-rose-500/20'
                      : 'border-slate-200 bg-white text-slate-600'
                  }`}
                >
                  <XCircle className="w-4 h-4 text-rose-600" />
                  Reject
                </button>

                <button
                  type="button"
                  onClick={() => setActionType('REQUEST_INFO')}
                  className={`p-2 text-xs font-bold rounded-xl border flex flex-col items-center justify-center gap-1 ${
                    actionType === 'REQUEST_INFO'
                      ? 'bg-amber-50 border-amber-500 text-amber-700 ring-2 ring-amber-500/20'
                      : 'border-slate-200 bg-white text-slate-600'
                  }`}
                >
                  <HelpCircle className="w-4 h-4 text-amber-600" />
                  Request Info
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Moderator Notes & Instructions</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter audit remarks or requested missing documents..."
                rows={3}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setSelectedKyc(null)}>
                Cancel
              </Button>
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                onClick={handleKycAction}
                disabled={processing}
              >
                {processing ? 'Saving...' : 'Submit Decision'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
