'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, FileCheck, CheckCircle2, AlertCircle, UploadCloud, Lock, FileText, Smartphone, CreditCard, Building, Truck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

import { API_BASE_URL } from '@/config/api';

export default function KycPage() {
  const { user, token } = useAuth();
  const router = useRouter();

  // KYC Checklist State
  const [kycStatus, setKycStatus] = useState<'NOT_SUBMITTED' | 'PENDING' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED' | 'NEEDS_INFO'>('NOT_SUBMITTED');
  const [maskedPan, setMaskedPan] = useState<string | null>(null);
  const [maskedAadhaar, setMaskedAadhaar] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);

  // Verification Input Forms
  const [rawPanInput, setRawPanInput] = useState('');
  const [isVerifyingPan, setIsVerifyingPan] = useState(false);

  const [rawAadhaarInput, setRawAadhaarInput] = useState('');
  const [aadhaarConsent, setAadhaarConsent] = useState(false);
  const [isVerifyingAadhaar, setIsVerifyingAadhaar] = useState(false);

  // Form Details
  const [drivingLicenseNo, setDrivingLicenseNo] = useState('');
  const [vehicleType, setVehicleType] = useState('Bike');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [bankAccountNo, setBankAccountNo] = useState('');
  const [bankIfsc, setBankIfsc] = useState('');

  // Uploaded Docs State
  const [uploadedDocs, setUploadedDocs] = useState<Array<{ id: string; documentType: string; fileName: string; status: string }>>([]);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch initial KYC state
  useEffect(() => {
    async function fetchKyc() {
      if (!token) return;
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/kyc/status`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          setKycStatus(data.data.kycStatus || 'NOT_SUBMITTED');
          setMaskedPan(data.data.maskedPan);
          setMaskedAadhaar(data.data.maskedAadhaar);
          setDrivingLicenseNo(data.data.drivingLicenseNo || '');
          setVehicleType(data.data.vehicleType || 'Bike');
          setVehicleNumber(data.data.vehicleNumber || '');
          setBankAccountNo(data.data.bankAccountNo || '');
          setBankIfsc(data.data.bankIfsc || '');
          setRejectionReason(data.data.rejectionReason);
          setUploadedDocs(data.data.documents || []);
        }
      } catch (e) {
        console.error('Failed to load KYC status:', e);
      }
    }
    fetchKyc();
  }, [token]);

  // Handle PAN Verification Call
  const handleVerifyPan = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    if (!rawPanInput) {
      setErrorMsg('Please enter a 10-character PAN number (e.g. ABCDE1234F)');
      return;
    }

    setIsVerifyingPan(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/kyc/verify-pan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ panNumber: rawPanInput }),
      });

      const data = await res.json();
      setIsVerifyingPan(false);

      if (!data.success) {
        setErrorMsg(data.error?.message || 'PAN verification failed.');
      } else {
        setMaskedPan(data.data.maskedPan);
        setSuccessMsg('PAN validated and encrypted successfully.');
        setRawPanInput('');
      }
    } catch (e) {
      setIsVerifyingPan(false);
      setErrorMsg('Network error connecting to KYC server.');
    }
  };

  // Handle Aadhaar Verification Call
  const handleVerifyAadhaar = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    if (!rawAadhaarInput) {
      setErrorMsg('Please enter a 12-digit Aadhaar number.');
      return;
    }
    if (!aadhaarConsent) {
      setErrorMsg('Consent check is mandatory for Aadhaar identity tokenization.');
      return;
    }

    setIsVerifyingAadhaar(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/kyc/verify-aadhaar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ aadhaarNumber: rawAadhaarInput, consent: aadhaarConsent }),
      });

      const data = await res.json();
      setIsVerifyingAadhaar(false);

      if (!data.success) {
        setErrorMsg(data.error?.message || 'Aadhaar verification failed.');
      } else {
        setMaskedAadhaar(data.data.maskedAadhaar);
        setSuccessMsg('Aadhaar consent token generated. Raw number is discarded.');
        setRawAadhaarInput('');
      }
    } catch (e) {
      setIsVerifyingAadhaar(false);
      setErrorMsg('Network error connecting to KYC server.');
    }
  };

  // Upload Document Simulation
  const handleSimulateUpload = async (docType: string) => {
    if (!token) return;
    setErrorMsg('');
    const sampleFileName = `${docType.toLowerCase()}_copy_${Date.now()}.pdf`;

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/kyc/documents/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          documentType: docType,
          fileName: sampleFileName,
          fileUrl: `/uploads/kyc/${sampleFileName}`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setUploadedDocs((prev) => [...prev, data.data]);
        setSuccessMsg(`Document (${docType}) uploaded securely.`);
      }
    } catch (e) {
      setErrorMsg('Failed to upload document.');
    }
  };

  // Submit Final KYC Package
  const handleSubmitKyc = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/kyc/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          drivingLicenseNo,
          vehicleType,
          vehicleNumber,
          bankAccountNo,
          bankIfsc,
        }),
      });

      const data = await res.json();
      setIsSubmitting(false);

      if (!data.success) {
        setErrorMsg(data.error?.message || 'KYC submission failed.');
      } else {
        setKycStatus('UNDER_REVIEW');
        setSuccessMsg('KYC application submitted! Status: UNDER_REVIEW.');
      }
    } catch (e) {
      setIsSubmitting(false);
      setErrorMsg('Network error submitting KYC.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6">
      {/* HEADER BANNER */}
      <Card className="p-6 md:p-8 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white shadow-elevated rounded-3xl relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-400/30 rounded-full text-emerald-300 text-xs font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            SECURE KYC & IDENTITY VERIFICATION CENTER
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">
            Delivery Partner & Role Identity Verification
          </h1>
          <p className="text-xs text-slate-300 max-w-2xl font-medium leading-relaxed">
            Identity verification is required to protect farmers, sellers, delivery partners, and FARM SEVA. Your documents are processed in encrypted memory according to Indian data protection laws.
          </p>
        </div>
      </Card>

      {/* OVERALL STATUS TIMELINE */}
      <Card className="p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-emerald-600" /> KYC Verification Progress
          </h3>
          <Badge
            variant={
              kycStatus === 'VERIFIED'
                ? 'success'
                : kycStatus === 'REJECTED'
                ? 'danger'
                : kycStatus === 'UNDER_REVIEW'
                ? 'warning'
                : 'neutral'
            }
            size="md"
          >
            Status: {kycStatus.replace('_', ' ')}
          </Badge>
        </div>

        {rejectionReason && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl text-xs font-bold space-y-1">
            <div className="flex items-center gap-2 text-rose-700">
              <AlertCircle className="w-4 h-4" /> KYC Verification Rejected by Admin
            </div>
            <p className="text-slate-600 font-medium">Reason: {rejectionReason}</p>
            <p className="text-[11px] text-slate-500 font-semibold">Please update your identity details and re-submit.</p>
          </div>
        )}

        {/* STEPPERS */}
        <div className="grid grid-cols-4 gap-2 text-center text-xs font-bold text-slate-600 pt-2">
          <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200">
            ✓ Phone Verified
          </div>
          <div className={`p-3 rounded-xl border ${maskedPan ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-slate-100 border-slate-200'}`}>
            {maskedPan ? '✓ PAN Verified' : '2. PAN Check'}
          </div>
          <div className={`p-3 rounded-xl border ${maskedAadhaar ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-slate-100 border-slate-200'}`}>
            {maskedAadhaar ? '✓ Aadhaar Verified' : '3. Aadhaar Check'}
          </div>
          <div className={`p-3 rounded-xl border ${kycStatus === 'VERIFIED' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : kycStatus === 'UNDER_REVIEW' ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-slate-100 border-slate-200'}`}>
            {kycStatus === 'VERIFIED' ? '✓ Approved' : '4. Admin Review'}
          </div>
        </div>
      </Card>

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl text-xs font-bold flex items-center gap-2">
          ⚠️ {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. PAN VERIFICATION SECTION */}
        <Card className="p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-600" />
            <h3 className="font-extrabold text-slate-900 text-sm">PAN Verification</h3>
          </div>
          <p className="text-xs text-slate-500">
            Validates your 10-character Permanent Account Number for tax compliance.
          </p>

          {maskedPan ? (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
              <span className="font-extrabold text-slate-800 tracking-wider">PAN: {maskedPan}</span>
              <Badge variant="success" size="sm">✓ Verified</Badge>
            </div>
          ) : (
            <div className="space-y-3">
              <Input
                label="PAN Number"
                type="text"
                value={rawPanInput}
                onChange={(e) => setRawPanInput(e.target.value.toUpperCase())}
                placeholder="e.g. ABCDE1234F"
                maxLength={10}
              />
              <Button
                type="button"
                variant="secondary"
                size="md"
                className="w-full"
                isLoading={isVerifyingPan}
                onClick={handleVerifyPan}
              >
                Verify PAN Format →
              </Button>
            </div>
          )}
        </Card>

        {/* 2. AADHAAR CONSENT VERIFICATION SECTION */}
        <Card className="p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-emerald-600" />
            <h3 className="font-extrabold text-slate-900 text-sm">Aadhaar Identity Tokenization</h3>
          </div>
          <p className="text-xs text-slate-500">
            Strict Data Privacy: Complete 12-digit number is never saved. Only masked last 4 digits are recorded.
          </p>

          {maskedAadhaar ? (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
              <span className="font-extrabold text-slate-800 tracking-wider">Aadhaar: {maskedAadhaar}</span>
              <Badge variant="success" size="sm">✓ Consent Verified</Badge>
            </div>
          ) : (
            <div className="space-y-3">
              <Input
                label="12-Digit Aadhaar Number"
                type="text"
                value={rawAadhaarInput}
                onChange={(e) => setRawAadhaarInput(e.target.value)}
                placeholder="e.g. 5432 8888 1234"
                maxLength={14}
              />
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="aadhaarConsent"
                  checked={aadhaarConsent}
                  onChange={(e) => setAadhaarConsent(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded text-emerald-600 border-slate-300"
                />
                <label htmlFor="aadhaarConsent" className="text-[11px] text-slate-600 font-medium">
                  I give consent to tokenized Aadhaar identity check under Indian IT Act.
                </label>
              </div>
              <Button
                type="button"
                variant="secondary"
                size="md"
                className="w-full"
                isLoading={isVerifyingAadhaar}
                onClick={handleVerifyAadhaar}
              >
                Tokenize & Verify Aadhaar →
              </Button>
            </div>
          )}
        </Card>
      </div>

      {/* 3. DOCUMENT UPLOADER */}
      <Card className="p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-emerald-600" />
            <h3 className="font-extrabold text-slate-900 text-sm">Upload Identity & License Documents</h3>
          </div>
          <span className="text-xs text-slate-400 font-bold">PNG, JPG or PDF (Max 5MB)</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {['AADHAAR_FRONT', 'PAN_CARD', 'DRIVING_LICENSE', 'VEHICLE_RC'].map((docType) => {
            const isUploaded = uploadedDocs.some((d) => d.documentType === docType);
            return (
              <div
                key={docType}
                className={`p-4 rounded-2xl border text-center space-y-2 transition ${
                  isUploaded
                    ? 'border-emerald-300 bg-emerald-50/50'
                    : 'border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100/80'
                }`}
              >
                <FileText className={`w-6 h-6 mx-auto ${isUploaded ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span className="block text-[11px] font-extrabold text-slate-800">
                  {docType.replace('_', ' ')}
                </span>
                {isUploaded ? (
                  <Badge variant="success" size="sm">✓ Uploaded</Badge>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSimulateUpload(docType)}
                    className="text-[11px] font-bold text-emerald-600 hover:underline"
                  >
                    + Upload File
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* 4. FINAL SUBMISSION FORM */}
      <Card className="p-6 border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="font-extrabold text-slate-900 text-sm">Vehicle & Payout Details</h3>

        <form onSubmit={handleSubmitKyc} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Driving License Number"
              type="text"
              value={drivingLicenseNo}
              onChange={(e) => setDrivingLicenseNo(e.target.value)}
              placeholder="e.g. TS0320240012345"
            />
            <Input
              label="Vehicle Registration No"
              type="text"
              value={vehicleNumber}
              onChange={(e) => setVehicleNumber(e.target.value)}
              placeholder="e.g. TS-03-AB-1234"
            />
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Vehicle Type</label>
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold bg-white"
              >
                <option value="Bike">Bike / Scooter</option>
                <option value="Auto">Cargo Auto</option>
                <option value="Pickup Truck">Pickup Truck</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Bank Account Number for Payouts"
              type="text"
              value={bankAccountNo}
              onChange={(e) => setBankAccountNo(e.target.value)}
              placeholder="e.g. 918237465012"
            />
            <Input
              label="Bank IFSC Code"
              type="text"
              value={bankIfsc}
              onChange={(e) => setBankIfsc(e.target.value)}
              placeholder="e.g. SBIN0001234"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full mt-4"
            isLoading={isSubmitting}
            disabled={kycStatus === 'UNDER_REVIEW' || kycStatus === 'VERIFIED'}
          >
            {kycStatus === 'VERIFIED'
              ? '✓ KYC Verified & Active'
              : kycStatus === 'UNDER_REVIEW'
              ? '⏳ KYC Application Under Review'
              : 'Submit Complete KYC for Admin Approval'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
