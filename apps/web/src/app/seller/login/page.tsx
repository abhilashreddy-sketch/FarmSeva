'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, Store, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

function SellerLoginForm() {
  const { loginEmail } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    const result = await loginEmail(email, password);
    setIsSubmitting(false);

    if (result.success) {
      router.push('/seller');
    } else {
      setErrorMsg(result.error || 'Seller login failed. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md space-y-4 text-center">
        <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-3xl flex items-center justify-center mx-auto shadow-md border border-amber-200">
          <Store className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">FARM SEVA SELLER</h1>
        <p className="text-sm font-medium text-slate-600">
          Agri Dealer & Retail Shop Portal — Manage stock inventory and process local farmer orders.
        </p>
      </div>

      <Card className="mt-6 sm:mx-auto sm:w-full sm:max-w-md p-6 sm:p-8 bg-white shadow-xl border border-slate-200/80 rounded-3xl space-y-6">
        {errorMsg && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-700">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Shop Email Address"
            type="email"
            placeholder="dealer@farmseva.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
          />

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700">Password</label>
              <Link href="/forgot-password" className="text-xs font-semibold text-amber-700 hover:underline">
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

          <Button type="submit" variant="harvest" size="lg" className="w-full font-bold shadow-md bg-amber-600 hover:bg-amber-700 border-amber-700" isLoading={isSubmitting}>
            Sign In to Seller Portal
          </Button>
        </form>

        <p className="text-xs text-center font-semibold text-slate-600 pt-2 border-t border-slate-200">
          Want to sell agricultural inputs?{' '}
          <Link href="/seller/register" className="text-amber-700 font-bold hover:underline">
            Register Agri Shop
          </Link>
        </p>
      </Card>
    </div>
  );
}

export default function SellerLoginPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center font-bold text-slate-600">Loading Seller Portal...</div>}>
      <SellerLoginForm />
    </Suspense>
  );
}
