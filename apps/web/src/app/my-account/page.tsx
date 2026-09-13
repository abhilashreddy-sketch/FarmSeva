'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { User, ShieldCheck, Phone, Mail, MapPin, KeyRound, CheckCircle2, AlertCircle, FileText, Globe, Bell, Lock, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

import { API_BASE_URL } from '@/config/api';

export default function MyAccountPage() {
  const { user, token, logout } = useAuth();
  const { t, locale, setLocale } = useLanguage();

  const [activeTab, setActiveTab] = useState<'PROFILE' | 'VERIFICATION' | 'SECURITY' | 'SETTINGS'>('PROFILE');
  const [kycData, setKycData] = useState<any>(null);
  const [isLoadingKyc, setIsLoadingKyc] = useState(false);

  useEffect(() => {
    async function fetchKyc() {
      if (!token) return;
      setIsLoadingKyc(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/kyc/status`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          setKycData(data.data);
        }
      } catch (e) {
        console.error('Failed to load KYC info:', e);
      } finally {
        setIsLoadingKyc(false);
      }
    }
    fetchKyc();
  }, [token]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-12 text-center space-y-4">
        <p className="text-slate-600 font-semibold text-sm">Please log in to view your account details.</p>
        <Link href="/login">
          <Button variant="primary">Log In</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6">
      {/* USER PROFILE HEADER CARD */}
      <Card className="p-6 md:p-8 bg-white border border-slate-200/80 shadow-elevated flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-2xl shadow-inner shrink-0">
            {user.fullName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-black text-slate-900">{user.fullName}</h1>
              <Badge variant={user.status === 'ACTIVE' ? 'success' : 'warning'} size="sm">
                {user.status}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 font-semibold mt-1">
              Role: <span className="font-extrabold text-slate-700">{user.role}</span> | Phone: {user.phone}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/kyc">
            <Button variant="outline" size="sm">
              <ShieldCheck className="w-4 h-4 mr-1 text-emerald-600" /> KYC Status
            </Button>
          </Link>
          <Button variant="ghost" size="sm" onClick={logout} className="text-rose-600 hover:bg-rose-50">
            <LogOut className="w-4 h-4 mr-1" /> Logout
          </Button>
        </div>
      </Card>

      {/* ACCOUNT NAVIGATION TABS */}
      <div className="flex gap-2 border-b border-slate-200 overflow-x-auto pb-1 text-xs font-bold">
        <button
          onClick={() => setActiveTab('PROFILE')}
          className={`pb-2 px-3 border-b-2 transition ${
            activeTab === 'PROFILE'
              ? 'border-emerald-600 text-emerald-700 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          👤 Profile Details
        </button>
        <button
          onClick={() => setActiveTab('VERIFICATION')}
          className={`pb-2 px-3 border-b-2 transition flex items-center gap-1.5 ${
            activeTab === 'VERIFICATION'
              ? 'border-emerald-600 text-emerald-700 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" /> Verification Center
        </button>
        <button
          onClick={() => setActiveTab('SECURITY')}
          className={`pb-2 px-3 border-b-2 transition ${
            activeTab === 'SECURITY'
              ? 'border-emerald-600 text-emerald-700 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          🔒 Security & Password
        </button>
        <button
          onClick={() => setActiveTab('SETTINGS')}
          className={`pb-2 px-3 border-b-2 transition ${
            activeTab === 'SETTINGS'
              ? 'border-emerald-600 text-emerald-700 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          ⚙️ Language & Preferences
        </button>
      </div>

      {/* TAB 1: PROFILE DETAILS */}
      {activeTab === 'PROFILE' && (
        <Card className="p-6 border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-extrabold text-slate-900 text-sm">Account Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="block text-slate-400 font-bold">Full Name</span>
              <span className="font-extrabold text-slate-800 text-sm">{user.fullName}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="block text-slate-400 font-bold">Mobile Phone</span>
              <span className="font-extrabold text-slate-800 text-sm">{user.phone}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="block text-slate-400 font-bold">Email Address</span>
              <span className="font-extrabold text-slate-800 text-sm">{user.email || 'Not provided'}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="block text-slate-400 font-bold">Preferred Language</span>
              <span className="font-extrabold text-slate-800 text-sm">{user.preferredLanguage.toUpperCase()}</span>
            </div>
          </div>
        </Card>
      )}

      {/* TAB 2: VERIFICATION CENTER */}
      {activeTab === 'VERIFICATION' && (
        <Card className="p-6 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Account Verification Center
              </h3>
              <p className="text-xs text-slate-500">
                Official verification status of your identity and credentials on FARM SEVA
              </p>
            </div>
            <Link href="/kyc">
              <Button variant="primary" size="sm">
                Update KYC Details →
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* PHONE VERIFICATION */}
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-emerald-700" />
                <div>
                  <h4 className="font-extrabold text-slate-900 text-xs">Phone Verification</h4>
                  <p className="text-[11px] text-slate-500 font-medium">{user.phone}</p>
                </div>
              </div>
              <Badge variant="success" size="sm">✓ Verified</Badge>
            </div>

            {/* EMAIL VERIFICATION */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-slate-600" />
                <div>
                  <h4 className="font-extrabold text-slate-900 text-xs">Email Verification</h4>
                  <p className="text-[11px] text-slate-500 font-medium">{user.email || 'No email added'}</p>
                </div>
              </div>
              <Badge variant={user.email ? 'success' : 'neutral'} size="sm">
                {user.email ? '✓ Verified' : 'Pending'}
              </Badge>
            </div>

            {/* AADHAAR TOKEN STATUS */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-slate-600" />
                <div>
                  <h4 className="font-extrabold text-slate-900 text-xs">Aadhaar Identity Consent</h4>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {kycData?.maskedAadhaar ? kycData.maskedAadhaar : 'Not Tokenized'}
                  </p>
                </div>
              </div>
              <Badge variant={kycData?.maskedAadhaar ? 'success' : 'neutral'} size="sm">
                {kycData?.maskedAadhaar ? '✓ Tokenized' : 'Pending'}
              </Badge>
            </div>

            {/* PAN VERIFICATION STATUS */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-slate-600" />
                <div>
                  <h4 className="font-extrabold text-slate-900 text-xs">PAN Card Verification</h4>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {kycData?.maskedPan ? kycData.maskedPan : 'Not Verified'}
                  </p>
                </div>
              </div>
              <Badge variant={kycData?.maskedPan ? 'success' : 'neutral'} size="sm">
                {kycData?.maskedPan ? '✓ Verified' : 'Pending'}
              </Badge>
            </div>
          </div>
        </Card>
      )}

      {/* TAB 3: SECURITY */}
      {activeTab === 'SECURITY' && (
        <Card className="p-6 border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-extrabold text-slate-900 text-sm">Security & Password Management</h3>
          <p className="text-xs text-slate-500 font-medium">
            Manage active login sessions and password recovery.
          </p>
          <div className="pt-2">
            <Link href="/forgot-password">
              <Button variant="outline" size="sm">
                Reset Password via OTP
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* TAB 4: SETTINGS */}
      {activeTab === 'SETTINGS' && (
        <Card className="p-6 border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-extrabold text-slate-900 text-sm">App Language</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { code: 'en', name: 'English' },
              { code: 'te', name: 'తెలుగు (Telugu)' },
              { code: 'hi', name: 'हिंदी (Hindi)' },
              { code: 'kn', name: 'ಕನ್ನಡ (Kannada)' },
              { code: 'ta', name: 'தமிழ் (Tamil)' },
              { code: 'mr', name: 'मराठी (Marathi)' },
            ].map((lang) => (
              <button
                key={lang.code}
                onClick={() => setLocale(lang.code as any)}
                className={`p-3 rounded-xl border font-bold text-xs transition ${
                  locale === lang.code
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                {lang.name}
              </button>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
