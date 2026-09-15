'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User as UserIcon, Phone, Mail, Lock, Sprout, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { API_BASE_URL } from '@/config/api';

export default function FarmerRegisterPage() {
  const { setSession } = useAuth();
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [district, setDistrict] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/register/farmer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          phone,
          email: email || undefined,
          password,
          district: district || undefined,
        }),
      });

      const data = await res.json();
      setIsSubmitting(false);

      if (data.success && data.data?.accessToken) {
        setSession(data.data.accessToken, data.data.user);
        router.push('/farmer');
      } else {
        setErrorMsg(data.error?.message || 'Registration failed. Please try again.');
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg('Unable to connect to FARM SEVA server.');
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md space-y-4 text-center">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-3xl flex items-center justify-center mx-auto shadow-md border border-emerald-200">
          <Sprout className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">FARMER REGISTRATION</h1>
        <p className="text-sm font-medium text-slate-600">
          Create your free farmer profile to buy genuine inputs, diagnose crops, and receive expert support.
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
            label="Full Name (किसान का पूरा नाम / పేరు)"
            type="text"
            placeholder="Ramesh Kumar"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            leftIcon={<UserIcon className="w-4 h-4 text-slate-400" />}
          />

          <Input
            label="Mobile Phone Number"
            type="tel"
            placeholder="9876543210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            leftIcon={<Phone className="w-4 h-4 text-slate-400" />}
          />

          <Input
            label="Email Address (Optional)"
            type="email"
            placeholder="farmer@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
          />

          <Input
            label="District (ज़िला / జిల్లా)"
            type="text"
            placeholder="Warangal, Guntur, Nashik..."
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
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

          <Button type="submit" variant="harvest" size="lg" className="w-full font-bold shadow-md" isLoading={isSubmitting}>
            Create Farmer Account
          </Button>
        </form>

        <p className="text-xs text-center font-semibold text-slate-600 pt-2 border-t border-slate-200">
          Already registered?{' '}
          <Link href="/farmer/login" className="text-emerald-700 font-bold hover:underline">
            Sign In Here
          </Link>
        </p>
      </Card>
    </div>
  );
}
