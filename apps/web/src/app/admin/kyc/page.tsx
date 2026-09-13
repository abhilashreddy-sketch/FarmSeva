'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, FileCheck, CheckCircle2, XCircle, HelpCircle, Eye, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';

import { API_BASE_URL } from '@/config/api';

interface KycApplication {
  id: string;
  userId: string;
  maskedAadhaar: string | null;
  maskedPan: string | null;
  drivingLicenseNo: string | null;
  vehicleType: string | null;
  vehicleNumber: string | null;
  bankAccountNo: string | null;
  bankIfsc: string | null;
  status: 'PENDING' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED' | 'NEEDS_INFO';
  rejectionReason: string | null;
  adminNotes: string | null;
  updatedAt: string;
  user: {
    id: string;
    fullName: string;
    phone: string;
    email: string | null;
    role: string;
    status: string;
    createdAt: string;
  };
  documents: Array<{
    id: string;
    documentType: string;
    fileName: string;
    fileUrl: string;
    status: string;
  }>;
}

export default function AdminKycPage() {
  const { token } = useAuth();

  const [applications, setApplications] = useState<KycApplication[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  // Modal Dialog Action States
  const [selectedApp, setSelectedApp] = useState<KycApplication | null>(null);
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT' | 'REQUEST_INFO' | null>(null);
  const [actionNotes, setActionNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [msg, setMsg] = useState('');

  const fetchApplications = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const url = `${API_BASE_URL}/api/v1/admin/kyc${selectedFilter !== 'ALL' ? `?status=${selectedFilter}` : ''}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setApplications(data.data.applications || []);
      }
    } catch (e) {
      console.error('Failed to fetch KYC applications:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [token, selectedFilter]);

  const handleExecuteAction = async () => {
    if (!token || !selectedApp || !actionType) return;
    setIsSubmitting(true);
    setMsg('');

    let endpoint = '';
    let body: any = {};

    if (actionType === 'APPROVE') {
      endpoint = `/api/v1/admin/kyc/${selectedApp.id}/approve`;
      body.notes = actionNotes || 'Approved by Admin';
    } else if (actionType === 'REJECT') {
      endpoint = `/api/v1/admin/kyc/${selectedApp.id}/reject`;
      body.rejectionReason = actionNotes;
    } else if (actionType === 'REQUEST_INFO') {
      endpoint = `/api/v1/admin/kyc/${selectedApp.id}/request-info`;
      body.notes = actionNotes;
    }

    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      setIsSubmitting(false);

      if (!data.success) {
        setMsg(`Error: ${data.error?.message || 'Operation failed'}`);
      } else {
        setMsg(`Successfully updated KYC application for ${selectedApp.user.fullName}.`);
        setSelectedApp(null);
        setActionType(null);
        setActionNotes('');
        fetchApplications();
      }
    } catch (e) {
      setIsSubmitting(false);
      setMsg('Network error executing admin action.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-6 space-y-6">
      {/* HEADER BANNER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Admin KYC & Identity Audit Console
            </h1>
          </div>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Review identity documents, PAN, Aadhaar tokens, and approve Delivery Partners, Sellers & Experts.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={fetchApplications}>
          <RefreshCw className="w-4 h-4 mr-1 text-slate-500" /> Refresh List
        </Button>
      </div>

      {msg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-xs font-bold flex items-center justify-between">
          <span>{msg}</span>
          <button onClick={() => setMsg('')} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>
      )}

      {/* STATUS FILTER TABS */}
      <div className="flex gap-2 overflow-x-auto pb-1 text-xs font-bold">
        {[
          { key: 'ALL', label: 'All Applications' },
          { key: 'UNDER_REVIEW', label: '⏳ Under Review / Pending' },
          { key: 'VERIFIED', label: '✓ Approved' },
          { key: 'REJECTED', label: '❌ Rejected' },
          { key: 'NEEDS_INFO', label: '❓ Needs Information' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSelectedFilter(tab.key)}
            className={`px-4 py-2 rounded-xl border transition shrink-0 ${
              selectedFilter === tab.key
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* APPLICATIONS LIST TABLE / CARDS */}
      {isLoading ? (
        <Card className="p-8 text-center text-xs font-bold text-slate-400">
          Loading KYC applications from database...
        </Card>
      ) : applications.length === 0 ? (
        <Card className="p-8 text-center space-y-2 border border-slate-200">
          <FileCheck className="w-8 h-8 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700">No KYC Applications Found</h3>
          <p className="text-xs text-slate-400 font-medium">No application records match the selected filter status.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <Card key={app.id} className="p-6 border border-slate-200/80 shadow-xs space-y-4 hover:border-slate-300 transition">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-slate-900 text-base">{app.user.fullName}</h3>
                    <Badge
                      variant={
                        app.user.role === 'DELIVERY_PARTNER'
                          ? 'harvest'
                          : app.user.role === 'SELLER'
                          ? 'warning'
                          : 'info'
                      }
                      size="sm"
                    >
                      {app.user.role}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Phone: <span className="font-bold text-slate-700">{app.user.phone}</span> | Email: {app.user.email || 'N/A'}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Badge
                    variant={
                      app.status === 'VERIFIED'
                        ? 'success'
                        : app.status === 'REJECTED'
                        ? 'danger'
                        : app.status === 'UNDER_REVIEW'
                        ? 'warning'
                        : 'neutral'
                    }
                    size="md"
                  >
                    Status: {app.status.replace('_', ' ')}
                  </Badge>

                  <div className="flex gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        setSelectedApp(app);
                        setActionType('APPROVE');
                        setActionNotes('');
                      }}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-rose-600 hover:bg-rose-50 border-rose-200"
                      onClick={() => {
                        setSelectedApp(app);
                        setActionType('REJECT');
                        setActionNotes('');
                      }}
                    >
                      <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedApp(app);
                        setActionType('REQUEST_INFO');
                        setActionNotes('');
                      }}
                    >
                      <HelpCircle className="w-3.5 h-3.5 mr-1" /> Request Info
                    </Button>
                  </div>
                </div>
              </div>

              {/* IDENTITY METRICS GRID */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="block text-[10px] text-slate-400 font-bold uppercase">Aadhaar Token</span>
                  <span className="font-extrabold text-slate-800">{app.maskedAadhaar || 'Not Tokenized'}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="block text-[10px] text-slate-400 font-bold uppercase">PAN Number</span>
                  <span className="font-extrabold text-slate-800">{app.maskedPan || 'Not Provided'}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="block text-[10px] text-slate-400 font-bold uppercase">Driving License</span>
                  <span className="font-extrabold text-slate-800">{app.drivingLicenseNo || 'N/A'}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="block text-[10px] text-slate-400 font-bold uppercase">Vehicle / Bank</span>
                  <span className="font-extrabold text-slate-800">
                    {app.vehicleType ? `${app.vehicleType} (${app.vehicleNumber})` : app.bankAccountNo ? `Bank: ${app.bankAccountNo}` : 'N/A'}
                  </span>
                </div>
              </div>

              {/* ATTACHED DOCUMENTS LIST */}
              {app.documents.length > 0 && (
                <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-xs">
                  <span className="font-extrabold text-slate-600">Documents ({app.documents.length}):</span>
                  {app.documents.map((doc) => (
                    <span key={doc.id} className="px-2.5 py-1 bg-slate-100 rounded-lg text-slate-700 font-bold">
                      📄 {doc.documentType} ({doc.fileName})
                    </span>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* ACTION DIALOG MODAL */}
      {selectedApp && actionType && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full p-6 space-y-4 bg-white border border-slate-200 shadow-2xl rounded-3xl">
            <h3 className="font-black text-lg text-slate-900">
              {actionType === 'APPROVE'
                ? 'Approve KYC Application'
                : actionType === 'REJECT'
                ? 'Reject KYC Application'
                : 'Request More Information'}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Applicant: <span className="font-bold text-slate-800">{selectedApp.user.fullName}</span> ({selectedApp.user.role})
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {actionType === 'REJECT'
                  ? 'Rejection Reason (Required)'
                  : actionType === 'REQUEST_INFO'
                  ? 'Instructions for Applicant (Required)'
                  : 'Approval Notes (Optional)'}
              </label>
              <textarea
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                placeholder={
                  actionType === 'REJECT'
                    ? 'e.g. License image is blurry or expired'
                    : 'Enter note for user...'
                }
                rows={3}
                className="w-full p-3 border border-slate-300 rounded-xl text-xs font-medium focus:ring-emerald-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedApp(null);
                  setActionType(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant={actionType === 'REJECT' ? 'danger' : 'primary'}
                size="sm"
                isLoading={isSubmitting}
                onClick={handleExecuteAction}
              >
                Confirm {actionType.replace('_', ' ')}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
