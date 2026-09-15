'use client';

import React, { useEffect, useState } from 'react';
import {
  Badge,
  Button,
  CardSkeleton,
  EmptyState,
  TextInput,
} from '@farm-seva/shared-ui';
import { Store, ShieldCheck, MapPin, Phone, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { apiFetch, getAuthToken } from '../../lib/api-client';

export default function ShopPage() {
  const router = useRouter();
  const [shop, setShop] = useState<any>(null);
  const [kyc, setKyc] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadShopData() {
      const token = getAuthToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const [analyticsRes, kycRes] = await Promise.all([
        apiFetch<any>('/api/v1/seller/analytics/dashboard'),
        apiFetch<any>('/api/v1/kyc/me'),
      ]);

      if (analyticsRes.success) setShop(analyticsRes.data);
      if (kycRes.success) setKyc(kycRes.data);
      setIsLoading(false);
    }
    loadShopData();
  }, []);

  if (!getAuthToken()) {
    return (
      <div className="max-w-md mx-auto py-12 text-center space-y-4">
        <EmptyState
          title="Sign In Required"
          description="Please sign in to access your digital shop profile."
          actionLabel="Sign In Now"
          onAction={() => router.push('/login')}
        />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-4 space-y-6">
      <div className="space-y-1">
        <Badge status="pending">Digital Shop Profile</Badge>
        <h1 className="text-2xl font-black text-slate-900">Agri Retail Store Profile</h1>
        <p className="text-xs text-slate-500">
          Trade license verification, retail store details, and catalog status.
        </p>
      </div>

      {isLoading ? (
        <CardSkeleton />
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center font-black text-2xl">
                🏬
              </div>
              <div className="space-y-0.5">
                <h2 className="text-xl font-black text-slate-900">{shop?.shopName || shop?.user?.name || 'Agri Shop'}</h2>
                <p className="text-xs font-bold text-slate-500">Licensed Agricultural Retail Store</p>
              </div>
            </div>

            <Badge status={kyc?.status === 'APPROVED' ? 'verified' : 'warning'}>
              {kyc?.status || 'KYC VERIFIED'}
            </Badge>
          </div>

          <div className="space-y-4">
            <TextInput
              label="Shop / Business Name"
              disabled
              leftIcon={<Store className="w-4 h-4" />}
              value={shop?.shopName || shop?.user?.name || ''}
            />

            <TextInput
              label="Merchant Contact Phone"
              disabled
              leftIcon={<Phone className="w-4 h-4" />}
              value={shop?.phone || shop?.user?.phone || ''}
            />

            <TextInput
              label="Trade License / GSTIN Registration"
              disabled
              leftIcon={<FileText className="w-4 h-4" />}
              value={kyc?.gstin || kyc?.tradeLicenseNo || 'Licensed District Retail Dealer'}
            />
          </div>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-1 text-xs text-amber-950">
            <div className="flex items-center gap-1.5 font-bold text-amber-900">
              <ShieldCheck className="w-4 h-4 text-amber-700" />
              <span>District Compliance & Moderation</span>
            </div>
            <p className="text-[11px] text-amber-800">
              Approved shops have verified trade credentials allowing direct product listing on the FARM SEVA marketplace.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
