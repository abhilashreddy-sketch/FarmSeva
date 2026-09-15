'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Phone, Mail, Lock, Eye, EyeOff, Truck, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

function DeliveryLoginForm() {
  const { loginPhone, loginEmail } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'PHONE' | 'EMAIL'>('PHONE');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    const result = activeTab === 'PHONE' 
      ? await loginPhone(identifier, password)
      : await loginEmail(identifier, password);

    setIsSubmitting(false);

    if (result.success) {
      router.push('/delivery');
    } else {
      setErrorMsg(result.error || 'Delivery partner login failed. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md space-y-4 text-center">
        <div className="w-16 h-16 bg-purple-100 text-purple-700 rounded-3xl flex items-center justify-center mx-auto shadow-md border border-purple-200">
          <Truck className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">FARM SEVA DELIVERY</h1>
        <p className="text-sm font-medium text-slate-600">
          District Last-Mile Logistics Application — Accept delivery assignments & track farm routes.
        </p>
      </div>

      <Card className="mt-6 sm:mx-auto sm:w-full sm:max-w-md p-6 sm:p-8 bg-white shadow-xl border border-slate-200/80 rounded-3xl space-y-6">
        {errorMsg && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-700">
            {errorMsg}
          </div>
        )}

        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => { setActiveTab('PHONE'); setIdentifier(''); setErrorMsg(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${activeTab === 'PHONE' ? 'bg-white text-purple-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Phone Login
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('EMAIL'); setIdentifier(''); setErrorMsg(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${activeTab === 'EMAIL' ? 'bg-white text-purple-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Email Login
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={activeTab === 'PHONE' ? 'Mobile Phone Number' : 'Email Address'}
            type={activeTab === 'PHONE' ? 'tel' : 'email'}
            placeholder={activeTab === 'PHONE' ? '9876543210' : 'driver@farmseva.com'}
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
            leftIcon={activeTab === 'PHONE' ? <Phone className="w-4 h-4 text-slate-400" /> : <Mail className="w-4 h-4 text-slate-400" />}
          />

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700">Password</label>
              <Link href="/forgot-password" className="text-xs font-semibold text-purple-700 hover:underline">
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

          <Button type="submit" variant="primary" size="lg" className="w-full font-bold shadow-md bg-purple-700 hover:bg-purple-800 border-purple-800" isLoading={isSubmitting}>
            Sign In to Delivery App
          </Button>
        </form>

        <p className="text-xs text-center font-semibold text-slate-600 pt-2 border-t border-slate-200">
          Want to become a delivery partner?{' '}
          <Link href="/delivery/register" className="text-purple-700 font-bold hover:underline">
            Register Driver Account
          </Link>
        </p>
      </Card>
    </div>
  );
}

export default function DeliveryLoginPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center font-bold text-slate-600">Loading Delivery App...</div>}>
      <DeliveryLoginForm />
    </Suspense>
  );
}
