'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  Smartphone,
  Sprout,
  Store,
  Stethoscope,
  Truck,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { OtpInput } from '../../components/ui/OtpInput';
import { Card } from '../../components/ui/Card';
import { GoogleButton } from '../../components/ui/GoogleButton';
import { LanguageSelector } from '../../components/LanguageSelector';

export type LoginRoleType = 'FARMER' | 'SELLER' | 'EXPERT' | 'DELIVERY';

function LoginFormContent() {
  const { t } = useLanguage();
  const { loginPhone, loginEmail, sendOtp, initiateGoogleAuth } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Role Selection State
  const initialRoleParam = (searchParams.get('role') || 'FARMER').toUpperCase() as LoginRoleType;
  const [selectedRole, setSelectedRole] = useState<LoginRoleType | null>(initialRoleParam);

  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'PHONE' | 'EMAIL'>('EMAIL');
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

  const handleGoogleClick = async () => {
    setIsGoogleLoading(true);
    await initiateGoogleAuth();
    setIsGoogleLoading(false);
  };

  const handleSendOtp = async () => {
    setErrorMsg('');
    const target = activeTab === 'PHONE' ? phone : email;
    if (!target) {
      setErrorMsg(
        activeTab === 'PHONE'
          ? t('validation.phoneRequired', 'Please enter your mobile phone number')
          : t('validation.emailRequired', 'Please enter your email address')
      );
      return;
    }

    setIsSendingOtp(true);
    const result = await sendOtp(target, 'LOGIN');
    setIsSendingOtp(false);

    if (result.success) {
      setOtpSent(true);
    } else {
      setErrorMsg(result.error || t('errors.otpSendFailed', 'Failed to send OTP code'));
    }
  };

  // Centralized DB-Authoritative Role Router
  const handleAuthSuccessRedirect = (userRole: string) => {
    const roleUpper = (userRole || '').toUpperCase();
    if (roleUpper === 'ADMIN') {
      router.push('/admin');
    } else if (roleUpper === 'SELLER') {
      router.push('/seller');
    } else if (roleUpper === 'EXPERT' || roleUpper === 'AGRICULTURAL_EXPERT') {
      router.push('/expert');
    } else if (roleUpper === 'DELIVERY' || roleUpper === 'DELIVERY_PARTNER') {
      router.push('/delivery');
    } else {
      router.push('/farmer');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);
    let result: any;

    if (activeTab === 'PHONE') {
      if (!phone) {
        setErrorMsg(t('validation.phoneRequired', 'Please enter your phone number'));
        setIsSubmitting(false);
        return;
      }
      if (authMethod === 'OTP') {
        if (!otp || otp.length < 6) {
          setErrorMsg(t('validation.otpRequired', 'Please enter the 6-digit OTP code'));
          setIsSubmitting(false);
          return;
        }
        result = await loginPhone(phone, undefined, otp);
      } else {
        if (!password) {
          setErrorMsg(t('validation.passwordRequired', 'Please enter your password'));
          setIsSubmitting(false);
          return;
        }
        result = await loginPhone(phone, password);
      }
    } else {
      if (!email) {
        setErrorMsg(t('validation.emailRequired', 'Please enter your email address'));
        setIsSubmitting(false);
        return;
      }
      if (authMethod === 'OTP') {
        if (!otp || otp.length < 6) {
          setErrorMsg(t('validation.otpRequired', 'Please enter the 6-digit OTP code'));
          setIsSubmitting(false);
          return;
        }
        result = await loginEmail(email, undefined, otp);
      } else {
        if (!password) {
          setErrorMsg(t('validation.passwordRequired', 'Please enter your password'));
          setIsSubmitting(false);
          return;
        }
        result = await loginEmail(email, password);
      }
    }

    setIsSubmitting(false);

    if (result && result.success && result.user) {
      handleAuthSuccessRedirect(result.user.role);
    } else {
      setErrorMsg(result?.error || t('errors.loginFailed', 'Authentication failed. Please check your credentials.'));
    }
  };

  const ROLE_CARDS = [
    {
      id: 'FARMER' as LoginRoleType,
      title: t('auth.farmerRole', 'FARMER'),
      description: t('auth.farmerRoleDesc', 'Farmer marketplace & crop support workspace'),
      icon: <Sprout className="w-6 h-6 text-emerald-600" />,
      bgActive: 'border-emerald-500 bg-emerald-50/80 shadow-md',
      badge: '👨‍🌾 Farmer',
    },
    {
      id: 'SELLER' as LoginRoleType,
      title: t('auth.sellerRole', 'AGRI DEALER / SELLER'),
      description: t('auth.sellerRoleDesc', 'Shop, inventory & seller orders management'),
      icon: <Store className="w-6 h-6 text-amber-600" />,
      bgActive: 'border-amber-500 bg-amber-50/80 shadow-md',
      badge: '🏪 Dealer',
    },
    {
      id: 'EXPERT' as LoginRoleType,
      title: t('auth.expertRole', 'CROP EXPERT'),
      description: t('auth.expertRoleDesc', 'Crop diagnosis & farmer advisory station'),
      icon: <Stethoscope className="w-6 h-6 text-sky-600" />,
      bgActive: 'border-sky-500 bg-sky-50/80 shadow-md',
      badge: '🔬 Expert',
    },
    {
      id: 'DELIVERY' as LoginRoleType,
      title: t('auth.deliveryRole', 'DELIVERY PARTNER'),
      description: t('auth.deliveryRoleDesc', 'Delivery assignments & payout console'),
      icon: <Truck className="w-6 h-6 text-purple-600" />,
      bgActive: 'border-purple-500 bg-purple-50/80 shadow-md',
      badge: '🚚 Delivery',
    },
  ];

  const activeRoleCard = ROLE_CARDS.find((r) => r.id === selectedRole) || ROLE_CARDS[0];

  return (
    <div className="max-w-xl mx-auto py-8 px-4 space-y-6">
      
      {/* Header & Language Switcher Bar */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-600 text-white rounded-lg flex items-center justify-center font-black">
            🌾
          </div>
          <span className="font-black text-slate-900 text-sm tracking-tight">FARM SEVA</span>
        </div>
        <LanguageSelector variant="login" />
      </div>

      <Card className="p-6 md:p-8 space-y-6 border border-slate-200 shadow-elevated">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <KeyRound className="w-7 h-7 text-emerald-700" />
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            {t('auth.selectRoleTitle', 'FARM SEVA LOGIN')}
          </h1>
          <p className="text-xs font-semibold text-slate-500">
            {t('auth.selectRoleDesc', 'Select your role to continue to your workspace')}
          </p>
        </div>

        {/* 4 PRIMARY ROLE SELECTION CARDS */}
        <div className="space-y-2">
          <label className="block text-xs font-black text-slate-400 uppercase tracking-wider">
            1. Select Your Role
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ROLE_CARDS.map((card) => {
              const isSelected = selectedRole === card.id;
              return (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => {
                    setSelectedRole(card.id);
                    setErrorMsg('');
                  }}
                  className={`p-4 rounded-2xl border-2 text-left transition-all duration-200 flex flex-col justify-between cursor-pointer ${
                    isSelected
                      ? card.bgActive
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                  aria-pressed={isSelected}
                >
                  <div className="flex items-start justify-between w-full mb-2">
                    <div className="p-2.5 rounded-xl bg-white shadow-xs border border-slate-100">
                      {card.icon}
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-1" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 tracking-tight">
                      {card.title}
                    </h3>
                    <p className="text-[11px] font-medium text-slate-500 mt-1 leading-snug">
                      {card.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* AUTHENTICATION PANEL (Shown when role is selected) */}
        {selectedRole && (
          <div className="space-y-6 pt-4 border-t border-slate-100 animate-fadeIn">
            
            {/* Context Badge Banner */}
            <div className="bg-emerald-900 text-white p-3.5 rounded-2xl flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-xs font-extrabold tracking-wide">
                  {t('auth.loginAs', 'Login as')} <span className="text-amber-300 underline font-black">{activeRoleCard.title}</span>
                </span>
              </div>
              <span className="text-[10px] font-bold bg-emerald-950 text-amber-300 px-2.5 py-0.5 rounded-full border border-emerald-700">
                {activeRoleCard.badge}
              </span>
            </div>

            {/* PROMINENT GOOGLE OAUTH BUTTON */}
            <div className="space-y-3">
              <GoogleButton
                onClick={handleGoogleClick}
                isLoading={isGoogleLoading}
                text={t('auth.continueGoogle', 'Continue with Google')}
              />

              <div className="relative flex items-center justify-center my-4">
                <div className="border-t border-slate-200 w-full" />
                <span className="bg-white px-3 text-xs font-bold text-slate-400 uppercase tracking-wider absolute">
                  {t('auth.orSeparator', 'OR')}
                </span>
              </div>
            </div>

            {/* LOGIN METHOD TABS (Phone vs Email) */}
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-2xl font-extrabold text-xs">
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
                {t('auth.phoneTab', 'Phone Number')}
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
                {t('auth.emailTab', 'Email Address')}
              </button>
            </div>

            {/* AUTHENTICATION TYPE SELECTOR (Password vs OTP) */}
            <div className="flex items-center justify-between px-1 text-xs font-bold text-slate-600">
              <span>{t('auth.loginUsing', 'Login using:')}</span>
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
                  {t('auth.passwordTab', 'Password')}
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
                  {t('auth.otpTab', 'SMS / Email OTP')}
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
                  label={t('auth.phoneLabel', 'Mobile Phone Number')}
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  leftIcon={<Phone className="w-4 h-4 text-slate-400" />}
                  required
                />
              ) : (
                <Input
                  label={t('auth.emailLabel', 'Email Address')}
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
                      {t('auth.passwordLabel', 'Password')} <span className="text-rose-500">*</span>
                    </label>
                    <Link href="/forgot-password" className="text-xs font-bold text-emerald-600 hover:underline">
                      {t('auth.forgotPassword', 'Forgot Password?')}
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
                      {t('auth.sendOtp', 'Send OTP Code')}
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="block text-xs font-bold text-slate-700">
                          {t('auth.otpLabel', 'Enter 6-Digit OTP')}
                        </label>
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          className="text-xs font-bold text-emerald-600 hover:underline"
                        >
                          {t('auth.resendOtp', 'Resend OTP')}
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
                {authMethod === 'OTP' ? t('auth.loginOtpBtn', 'Login with OTP') : t('auth.loginBtn', 'Login to FARM SEVA')}
              </Button>
            </form>

            <div className="text-center pt-4 border-t border-slate-100">
              <p className="text-xs font-medium text-slate-600">
                {t('auth.noAccountYet', "Don't have an account yet?")}{' '}
                <Link
                  href={`/register?role=${selectedRole}`}
                  className="font-extrabold text-emerald-600 hover:underline inline-flex items-center gap-1"
                >
                  {t('auth.createAccount', 'Create New Account')} <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </p>
            </div>

            <p className="text-[10px] text-slate-400 text-center leading-relaxed">
              🔒 {t('auth.securityRuleDisclaimer', 'Account access and permissions are governed strictly by your verified database role.')}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center font-bold text-slate-500">Loading Login...</div>}>
      <LoginFormContent />
    </Suspense>
  );
}
