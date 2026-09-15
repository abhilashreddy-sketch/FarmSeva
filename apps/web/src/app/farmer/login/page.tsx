'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Phone, Mail, Lock, Eye, EyeOff, KeyRound, Sprout, ArrowRight, ShieldCheck } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { OtpInput } from '@/components/ui/OtpInput';
import { Card } from '@/components/ui/Card';
import { GoogleButton } from '@/components/ui/GoogleButton';

function FarmerLoginForm() {
  const { t } = useLanguage();
  const { loginPhone, loginEmail, sendOtp, initiateGoogleAuth } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'PHONE' | 'EMAIL'>('EMAIL');
  const [authMethod, setAuthMethod] = useState<'PASSWORD' | 'OTP'>('PASSWORD');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleSendOtp = async () => {
    setErrorMsg('');
    const target = activeTab === 'PHONE' ? phone : email;
    if (!target) {
      setErrorMsg(activeTab === 'PHONE' ? 'Please enter your mobile phone number' : 'Please enter your email address');
      return;
    }
    setIsSendingOtp(true);
    const result = await sendOtp(target, 'LOGIN');
    setIsSendingOtp(false);
    if (result.success) setOtpSent(true);
    else setErrorMsg(result.error || 'Failed to send OTP code');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);
    let result: any;

    if (activeTab === 'PHONE') {
      if (!phone) { setErrorMsg('Please enter your phone number'); setIsSubmitting(false); return; }
      result = authMethod === 'OTP' ? await loginPhone(phone, undefined, otp) : await loginPhone(phone, password);
    } else {
      if (!email) { setErrorMsg('Please enter your email address'); setIsSubmitting(false); return; }
      result = authMethod === 'OTP' ? await loginEmail(email, undefined, otp) : await loginEmail(email, password);
    }

    setIsSubmitting(false);
    if (result.success) {
      router.push('/farmer');
    } else {
      setErrorMsg(result.error || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md space-y-4 text-center">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-3xl flex items-center justify-center mx-auto shadow-md border border-emerald-200">
          <Sprout className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">FARM SEVA FARMER</h1>
        <p className="text-sm font-medium text-slate-600">
          Sign in to your farmer account to buy verified inputs, track crops, and get AI crop advice.
        </p>
      </div>

      <Card className="mt-6 sm:mx-auto sm:w-full sm:max-w-md p-6 sm:p-8 bg-white shadow-xl border border-slate-200/80 rounded-3xl space-y-6">
        {errorMsg && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-700">
            {errorMsg}
          </div>
        )}

        {/* Tab & Auth Method Controls */}
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => { setActiveTab('EMAIL'); setErrorMsg(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${activeTab === 'EMAIL' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Email Login
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('PHONE'); setErrorMsg(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${activeTab === 'PHONE' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Phone Login
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {activeTab === 'EMAIL' ? (
            <Input
              label="Email Address"
              type="email"
              placeholder="farmer@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
            />
          ) : (
            <Input
              label="Phone Number"
              type="tel"
              placeholder="9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              leftIcon={<Phone className="w-4 h-4 text-slate-400" />}
            />
          )}

          {authMethod === 'PASSWORD' ? (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">Password</label>
                <Link href="/forgot-password" className="text-xs font-semibold text-emerald-600 hover:underline">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700">Enter 6-Digit OTP</label>
              <OtpInput value={otp} onChange={setOtp} />
              {!otpSent ? (
                <Button type="button" variant="outline" size="sm" className="w-full" onClick={handleSendOtp} isLoading={isSendingOtp}>
                  Send Verification OTP Code
                </Button>
              ) : (
                <p className="text-xs text-center font-medium text-emerald-600">OTP code sent to your {activeTab.toLowerCase()}</p>
              )}
            </div>
          )}

          <div className="flex justify-between items-center text-xs pt-1">
            <button
              type="button"
              onClick={() => { setAuthMethod(authMethod === 'PASSWORD' ? 'OTP' : 'PASSWORD'); setErrorMsg(''); }}
              className="font-bold text-emerald-700 hover:underline flex items-center gap-1"
            >
              <KeyRound className="w-3.5 h-3.5" />
              Use {authMethod === 'PASSWORD' ? 'OTP Login' : 'Password Login'}
            </button>
          </div>

          <Button type="submit" variant="harvest" size="lg" className="w-full font-bold shadow-md" isLoading={isSubmitting}>
            Sign In to Farmer Portal
          </Button>
        </form>

        <div className="relative border-t border-slate-200 pt-4">
          <GoogleButton onClick={() => { setIsGoogleLoading(true); initiateGoogleAuth(); }} isLoading={isGoogleLoading} />
        </div>

        <p className="text-xs text-center font-semibold text-slate-600 pt-2">
          New to FARM SEVA?{' '}
          <Link href="/farmer/register" className="text-emerald-700 font-bold hover:underline">
            Register as a Farmer
          </Link>
        </p>
      </Card>
    </div>
  );
}

export default function FarmerLoginPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center font-bold text-slate-600">Loading Farmer Portal...</div>}>
      <FarmerLoginForm />
    </Suspense>
  );
}
