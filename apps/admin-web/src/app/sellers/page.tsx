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
import { Store, Search, CheckCircle2, XCircle, RefreshCw, Eye, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { apiFetch, getAuthToken } from '../../lib/api-client';

interface SellerUser {
  id: string;
  phone: string;
  email?: string;
  fullName: string;
  status: string;
  createdAt: string;
  sellerProfile?: {
    id: string;
    businessName?: string;
    shopName?: string;
    gstin?: string;
    licenseNumber?: string;
    verificationStatus: string;
    rejectionReason?: string;
  };
}

export default function AdminSellersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sellers, setSellers] = useState<SellerUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Seller Action Modal State
  const [selectedSeller, setSelectedSeller] = useState<SellerUser | null>(null);
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT'>('APPROVE');
  const [reason, setReason] = useState('');
  const [processing, setProcessing] = useState(false);

  const [toast, setToast] = useState<{ title: string; message: string; type: 'success' | 'error' } | null>(null);

  const fetchSellers = async () => {
    const token = getAuthToken();
    if (!token) {
      router.push('/login');
      return;
    }

    setLoading(true);
    setError(null);

    const res = await apiFetch<SellerUser[]>('/api/v1/admin/users?role=SELLER&limit=50');

    if (res.success && Array.isArray(res.data)) {
      setSellers(res.data);
    } else {
      setError(res.error || 'Failed to fetch seller directory');
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchSellers();
  }, []);

  const handleVerifySeller = async () => {
    if (!selectedSeller || !selectedSeller.sellerProfile) return;
    setProcessing(true);

    const res = await apiFetch(`/api/v1/admin/sellers/${selectedSeller.sellerProfile.id}/verify`, {
      method: 'PATCH',
      body: JSON.stringify({
        action: actionType,
        reason: actionType === 'REJECT' ? reason : undefined,
      }),
    });

    if (res.success) {
      setToast({
        title: actionType === 'APPROVE' ? 'Seller Verified' : 'Seller Rejected',
        message: `Seller profile ${selectedSeller.fullName} updated successfully`,
        type: 'success',
      });
      setSelectedSeller(null);
      setReason('');
      fetchSellers();
    } else {
      setToast({
        title: 'Action Failed',
        message: res.error || 'Failed to update seller verification status',
        type: 'error',
      });
    }

    setProcessing(false);
  };

  const filteredSellers = sellers.filter((s) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const profile = s.sellerProfile;
    return (
      s.fullName.toLowerCase().includes(q) ||
      s.phone.includes(q) ||
      (profile?.businessName && profile.businessName.toLowerCase().includes(q)) ||
      (profile?.gstin && profile.gstin.toLowerCase().includes(q))
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
            <Store className="w-6 h-6 text-amber-600" />
            Licensed Agri Dealers Directory & Moderation
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Verify trade licenses, GSTIN compliance, and approve marketplace selling authorization.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchSellers}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Refresh Sellers
        </Button>
      </div>

      <Card className="p-4 border-slate-200">
        <TextInput
          label="Search Dealers & Shops"
          placeholder="Search business name, contact person, phone, or GSTIN..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </Card>

      {loading ? (
        <CardSkeleton />
      ) : error ? (
        <ErrorState title="Sellers Directory Unavailable" message={error} onRetry={fetchSellers} />
      ) : filteredSellers.length === 0 ? (
        <EmptyState
          title="No Sellers Found"
          description="No agri dealer accounts matched your query."
          icon={<Store className="w-8 h-8 text-slate-400" />}
        />
      ) : (
        <Card className="overflow-hidden border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Business / Owner</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">GSTIN / License</th>
                  <th className="px-4 py-3">Verification</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredSellers.map((seller) => {
                  const profile = seller.sellerProfile;
                  const vStatus = profile?.verificationStatus || 'SUBMITTED';
                  return (
                    <tr key={seller.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        <div>{profile?.businessName || profile?.shopName || seller.fullName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">Owner: {seller.fullName}</div>
                      </td>
                      <td className="px-4 py-3">{seller.phone}</td>
                      <td className="px-4 py-3 font-mono">
                        <div>GSTIN: {profile?.gstin || 'N/A'}</div>
                        <div className="text-[10px] text-slate-400">Lic: {profile?.licenseNumber || 'N/A'}</div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          status={
                            vStatus === 'APPROVED' ? 'success' : vStatus === 'REJECTED' ? 'rejected' : 'warning'
                          }
                        >
                          {vStatus}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        {profile && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setSelectedSeller(seller);
                              setActionType('APPROVE');
                            }}
                          >
                            Verify License
                          </Button>
                        )}
                        <Link href={`/users/${seller.id}`}>
                          <Button variant="outline" size="sm" leftIcon={<Eye className="w-3 h-3" />}>
                            Audit
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Seller Verification Modal */}
      {selectedSeller && selectedSeller.sellerProfile && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-600" />
              Verify Agri Dealer Credentials
            </h3>
            <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl space-y-1">
              <div><span className="font-semibold text-slate-800">Shop / Business:</span> {selectedSeller.sellerProfile.businessName || selectedSeller.sellerProfile.shopName}</div>
              <div><span className="font-semibold text-slate-800">Owner Name:</span> {selectedSeller.fullName}</div>
              <div><span className="font-semibold text-slate-800">GSTIN:</span> {selectedSeller.sellerProfile.gstin || 'Not Provided'}</div>
              <div><span className="font-semibold text-slate-800">Trade License:</span> {selectedSeller.sellerProfile.licenseNumber || 'Not Provided'}</div>
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
                  Approve Dealer
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
                  Reject Credentials
                </button>
              </div>
            </div>

            {actionType === 'REJECT' && (
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Rejection Reason</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Specify license document issues..."
                  rows={3}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setSelectedSeller(null)}>
                Cancel
              </Button>
              <Button
                size="sm"
                className={actionType === 'APPROVE' ? 'bg-emerald-600 hover:bg-emerald-700 text-white font-bold' : 'bg-rose-600 hover:bg-rose-700 text-white font-bold'}
                onClick={handleVerifySeller}
                disabled={processing}
              >
                {processing ? 'Processing...' : actionType === 'APPROVE' ? 'Approve Seller' : 'Reject Seller'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
