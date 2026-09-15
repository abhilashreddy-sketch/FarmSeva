'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Store, User as UserIcon, Phone, Mail, Lock, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { API_BASE_URL } from '@/config/api';

export default function SellerRegisterPage() {
  const { setSession } = useAuth();
  const router = useRouter();

  const [businessName, setBusinessName] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pesticideLicenseNo, setPesticideLicenseNo] = useState('');
  const [gstin, setGstin] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/register/seller`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName,
          fullName,
          phone,
          email,
          password,
          pesticideLicenseNo,
          gstin: gstin || undefined,
        }),
      });

      const data = await res.json();
      setIsSubmitting(false);

      if (data.success && data.data?.accessToken) {
        setSession(data.data.accessToken, data.data.user);
        router.push('/seller');
      } else {
        setErrorMsg(data.error?.message || 'Seller registration failed. Please check license details.');
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg('Unable to connect to FARM SEVA server.');
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md space-y-4 text-center">
        <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-3xl flex items-center justify-center mx-auto shadow-md border border-amber-200">
          <Store className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">AGRI DEALER REGISTRATION</h1>
        <p className="text-sm font-medium text-slate-600">
          Register your licensed retail shop to reach local district farmers and manage stock orders.
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
            label="Shop / Business Name"
            type="text"
            placeholder="Kisan Krishi Kendra"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            required
            leftIcon={<Store className="w-4 h-4 text-slate-400" />}
          />

          <Input
            label="Proprietor Full Name"
            type="text"
            placeholder="Vijay Sharma"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            leftIcon={<UserIcon className="w-4 h-4 text-slate-400" />}
          />

          <Input
            label="Pesticide License Number"
            type="text"
            placeholder="LIC/DL/2026/8892"
            value={pesticideLicenseNo}
            onChange={(e) => setPesticideLicenseNo(e.target.value)}
            required
            leftIcon={<ShieldCheck className="w-4 h-4 text-slate-400" />}
          />

          <Input
            label="GSTIN (Optional)"
            type="text"
            placeholder="36AAAAA0000A1Z5"
            value={gstin}
            onChange={(e) => setGstin(e.target.value)}
          />

          <Input
            label="Contact Mobile Phone"
            type="tel"
            placeholder="9876543210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            leftIcon={<Phone className="w-4 h-4 text-slate-400" />}
          />

          <Input
            label="Business Email Address"
            type="email"
            placeholder="dealer@farmseva.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
          />

          <Button type="submit" variant="harvest" size="lg" className="w-full font-bold shadow-md bg-amber-600 hover:bg-amber-700 border-amber-700" isLoading={isSubmitting}>
            Register Agri Shop
          </Button>
        </form>

        <p className="text-xs text-center font-semibold text-slate-600 pt-2 border-t border-slate-200">
          Already have a seller account?{' '}
          <Link href="/seller/login" className="text-amber-700 font-bold hover:underline">
            Sign In Here
          </Link>
        </p>
      </Card>
    </div>
  );
}
