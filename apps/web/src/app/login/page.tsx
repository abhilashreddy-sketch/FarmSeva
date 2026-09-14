'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Phone, Mail, Lock, Eye, EyeOff, KeyRound, Smartphone } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { OtpInput } from '../../components/ui/OtpInput';
import { Card } from '../../components/ui/Card';

export default function LoginPage() {
  const { t } = useLanguage();
  const { loginPhone, loginEmail, sendOtp } = useAuth();

  const [activeTab, setActiveTab] = useState<'PHONE' | 'EMAIL'>('PHONE');
  const [authMethod, setAuthMethod] = useState<'PASSWORD' | 'OTP'>('PASSWORD');

  // Form Fields
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // States
  const [otpSent, setOtpSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  const handleSendOtp = async () => {
    setErrorMsg('');
    const target = activeTab === 'PHONE' ? phone : email;
    if (!target) {
      setErrorMsg(`Please enter your ${activeTab === 'PHONE' ? 'mobile phone number' : 'email address'}`);
      return;
    }

    setIsSendingOtp(true);
    const result = await sendOtp(target, 'LOGIN');
    setIsSendingOtp(false);

    if (result.success) {
      setOtpSent(true);
    } else {
      setErrorMsg(result.error || 'Failed to send OTP');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    setIsSubmitting(true);
    let result;

    if (activeTab === 'PHONE') {
      if (!phone) {
        setErrorMsg('Please enter your phone number');
        setIsSubmitting(false);
        return;
      }
      if (authMethod === 'OTP') {
        if (!otp || otp.length < 6) {
          setErrorMsg('Please enter the 6-digit OTP code sent to your phone');
          setIsSubmitting(false);
          return;
        }
        result = await loginPhone(phone, undefined, otp);
      } else {
        if (!password) {
          setErrorMsg('Please enter your password');
          setIsSubmitting(false);
          return;
        }
        result = await loginPhone(phone, password);
      }
    } else {
      if (!email) {
        setErrorMsg('Please enter your email address');
        setIsSubmitting(false);
        return;
      }
      if (authMethod === 'OTP') {
        if (!otp || otp.length < 6) {
          setErrorMsg('Please enter the 6-digit OTP code sent to your email');
          setIsSubmitting(false);
          return;
        }
        result = await loginEmail(email, undefined, otp);
      } else {
        if (!password) {
          setErrorMsg('Please enter your password');
          setIsSubmitting(false);
          return;
        }
        result = await loginEmail(email, password);
      }
    }

    setIsSubmitting(false);

    if (!result.success) {
      setErrorMsg(result.error || 'Authentication failed');
    }
  };

  return (
    <div className="max-w-md mx-auto py-6 space-y-6">
      <Card className="p-6 md:p-8 space-y-6 border border-slate-200/80 shadow-elevated">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <KeyRound className="w-7 h-7 text-emerald-600" />
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            Welcome to FARM SEVA
          </h1>
          <p className="text-xs font-semibold text-slate-500">
            Select your preferred login option to access your account
          </p>
        </div>

        {/* LOGIN METHOD TABS (Phone vs Email) */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100/90 rounded-2xl font-extrabold text-xs">
          <button
            type="button"
            onClick={() => {
              setActiveTab('PHONE');
              setErrorMsg('');
              setOtpSent(false);
            }}
            className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition ${
              activeTab === 'PHONE'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-4 h-4 text-emerald-600" />
            Phone Number
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('EMAIL');
              setErrorMsg('');
              setOtpSent(false);
            }}
            className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition ${
              activeTab === 'EMAIL'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Mail className="w-4 h-4 text-emerald-600" />
            Email Address
          </button>
        </div>

        {/* AUTHENTICATION TYPE SELECTOR (Password vs OTP) */}
        <div className="flex items-center justify-between px-1 text-xs font-bold text-slate-600">
          <span>Login using:</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setAuthMethod('PASSWORD');
                setErrorMsg('');
              }}
              className={`px-3 py-1 rounded-lg text-[11px] transition ${
                authMethod === 'PASSWORD'
                  ? 'bg-emerald-100 text-emerald-800 font-extrabold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Password
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMethod('OTP');
                setErrorMsg('');
              }}
              className={`px-3 py-1 rounded-lg text-[11px] transition ${
                authMethod === 'OTP'
                  ? 'bg-emerald-100 text-emerald-800 font-extrabold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              SMS / Email OTP
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl text-xs font-bold flex items-center gap-2">
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {activeTab === 'PHONE' ? (
            <Input
              label="Mobile Phone Number"
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 9876543210"
              leftIcon={<Phone className="w-4 h-4 text-slate-400" />}
              required
            />
          ) : (
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. farmer@example.com"
              leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
              required
            />
          )}

          {authMethod === 'PASSWORD' ? (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-bold text-slate-700">
                  Password <span className="text-rose-500">*</span>
                </label>
                <Link href="/forgot-password" className="text-xs font-bold text-emerald-600 hover:underline">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {!otpSent ? (
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  className="w-full"
                  isLoading={isSendingOtp}
                  onClick={handleSendOtp}
                >
                  Send OTP Code
                </Button>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="block text-xs font-bold text-slate-700">Enter 6-Digit OTP</label>
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="text-xs font-bold text-emerald-600 hover:underline"
                    >
                      Resend OTP
                    </button>
                  </div>
                  <OtpInput length={6} value={otp} onChange={setOtp} />
                </div>
              )}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full mt-2"
            isLoading={isSubmitting}
          >
            {authMethod === 'OTP' ? 'Login with OTP' : 'Login to FARM SEVA'}
          </Button>
        </form>

        <div className="text-center pt-4 border-t border-slate-100">
          <p className="text-xs font-medium text-slate-600">
            Don't have an account yet?{' '}
            <Link href="/register" className="font-extrabold text-emerald-600 hover:underline">
              Create New Account
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
