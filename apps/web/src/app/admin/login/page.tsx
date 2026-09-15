'use client';

import React, { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, LockKeyhole } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

function AdminLoginForm() {
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
      router.push('/admin');
    } else {
      setErrorMsg(result.error || 'Admin login failed. Unauthorized credentials.');
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md space-y-4 text-center">
        <div className="w-16 h-16 bg-slate-900 text-amber-400 rounded-3xl flex items-center justify-center mx-auto shadow-xl border border-slate-700">
          <ShieldCheck className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">FARM SEVA ADMIN</h1>
        <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
          Protected Platform Operations & Governance Desk
        </p>
      </div>

      <Card className="mt-6 sm:mx-auto sm:w-full sm:max-w-md p-6 sm:p-8 bg-white shadow-2xl border border-slate-300 rounded-3xl space-y-6">
        {errorMsg && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-700 flex items-center gap-2">
            <LockKeyhole className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Administrator Email"
            type="email"
            placeholder="admin@farmseva.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
          />

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Master Password</label>
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

          <Button type="submit" variant="primary" size="lg" className="w-full font-bold shadow-md bg-slate-900 hover:bg-slate-800 text-amber-400 border-slate-900" isLoading={isSubmitting}>
            Authenticate System Administrator
          </Button>
        </form>
      </Card>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center font-bold text-slate-600">Loading Admin Workstation...</div>}>
      <AdminLoginForm />
    </Suspense>
  );
}
