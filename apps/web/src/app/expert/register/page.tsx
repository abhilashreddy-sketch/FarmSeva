'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Stethoscope, User as UserIcon, Phone, Mail, Lock, Award, BookOpen } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { API_BASE_URL } from '@/config/api';

export default function ExpertRegisterPage() {
  const { setSession } = useAuth();
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [specialization, setSpecialization] = useState('Pathology');
  const [qualification, setQualification] = useState('M.Sc. Agronomy');
  const [certificationNo, setCertificationNo] = useState('');
  const [yearsExperience, setYearsExperience] = useState('5');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/register/expert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          specialization,
          qualification,
          certificationNo: certificationNo || undefined,
          yearsExperience: parseInt(yearsExperience, 10),
          phone,
          email,
          password,
        }),
      });

      const data = await res.json();
      setIsSubmitting(false);

      if (data.success && data.data?.accessToken) {
        setSession(data.data.accessToken, data.data.user);
        router.push('/expert');
      } else {
        setErrorMsg(data.error?.message || 'Expert registration failed.');
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg('Unable to connect to FARM SEVA server.');
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md space-y-4 text-center">
        <div className="w-16 h-16 bg-sky-100 text-sky-700 rounded-3xl flex items-center justify-center mx-auto shadow-md border border-sky-200">
          <Stethoscope className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">CROP EXPERT REGISTRATION</h1>
        <p className="text-sm font-medium text-slate-600">
          Join India's certified agronomist network to review plant health cases and issue formal farmer advice.
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
            label="Full Name (Dr. / Prof.)"
            type="text"
            placeholder="Dr. K. Srinivas"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            leftIcon={<UserIcon className="w-4 h-4 text-slate-400" />}
          />

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Specialization</label>
            <select
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-sky-500"
            >
              <option value="Pathology">Plant Pathology</option>
              <option value="Entomology">Entomology (Pests)</option>
              <option value="Agronomy">Agronomy & Crop Management</option>
              <option value="Soil Science">Soil Science & Fertilizers</option>
            </select>
          </div>

          <Input
            label="Academic Qualification"
            type="text"
            placeholder="Ph.D. Plant Pathology / M.Sc. Agronomy"
            value={qualification}
            onChange={(e) => setQualification(e.target.value)}
            required
            leftIcon={<BookOpen className="w-4 h-4 text-slate-400" />}
          />

          <Input
            label="Certification / Council Reg. No."
            type="text"
            placeholder="ICAR/REG/2024/442"
            value={certificationNo}
            onChange={(e) => setCertificationNo(e.target.value)}
            leftIcon={<Award className="w-4 h-4 text-slate-400" />}
          />

          <Input
            label="Years of Agronomic Experience"
            type="number"
            value={yearsExperience}
            onChange={(e) => setYearsExperience(e.target.value)}
            required
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
            label="Email Address"
            type="email"
            placeholder="expert@farmseva.com"
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

          <Button type="submit" variant="primary" size="lg" className="w-full font-bold shadow-md bg-sky-600 hover:bg-sky-700 border-sky-700" isLoading={isSubmitting}>
            Register Expert Account
          </Button>
        </form>

        <p className="text-xs text-center font-semibold text-slate-600 pt-2 border-t border-slate-200">
          Already registered?{' '}
          <Link href="/expert/login" className="text-sky-700 font-bold hover:underline">
            Sign In Here
          </Link>
        </p>
      </Card>
    </div>
  );
}
