'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, TextInput, Button, Toast } from '@farm-seva/shared-ui';
import { Stethoscope, User, Mail, Lock, Award, FileBadge, MapPin, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { apiFetch, setAuthToken } from '../../lib/api-client';

export default function ExpertRegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    specialization: 'Plant Pathology',
    degree: 'M.Sc. Agriculture',
    licenseId: '',
    district: '',
    state: '',
  });

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password || !formData.licenseId) {
      setToast({ message: 'Please fill in all required fields including your License ID', type: 'error' });
      return;
    }

    setLoading(true);
    setToast(null);

    const res = await apiFetch<{ token: string; user: any }>('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        ...formData,
        role: 'AGRICULTURAL_EXPERT',
      }),
    });

    setLoading(false);

    if (res.success && res.data?.token) {
      setAuthToken(res.data.token);
      setToast({ message: 'Registration successful! Redirecting to workstation...', type: 'success' });
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    } else {
      setToast({ message: res.error || 'Registration failed. Please verify submitted details.', type: 'error' });
    }
  };

  return (
    <div className="max-w-lg mx-auto py-6 space-y-6">
      {toast && (
        <Toast
          title={toast.type === 'success' ? 'Success' : 'Error'}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center p-3 bg-sky-100 rounded-2xl text-sky-700 mb-2">
          <Stethoscope className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black text-slate-900">Agronomist License Registration</h1>
        <p className="text-xs text-slate-500 font-medium">
          Create an official FARM SEVA Expert account to diagnose crop pathology and issue treatment guidance
        </p>
      </div>

      <Card className="p-6 border-slate-200">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <TextInput
              label="Full Professional Name"
              name="name"
              type="text"
              placeholder="Dr. Rajesh V. Sharma"
              value={formData.name}
              onChange={handleChange}
              leftIcon={<User className="w-4 h-4 text-slate-400" />}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <TextInput
                label="Email Address"
                name="email"
                type="email"
                placeholder="agronomist@farmseva.com"
                value={formData.email}
                onChange={handleChange}
                leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
                required
              />
            </div>
            <div>
              <TextInput
                label="Phone Number"
                name="phone"
                type="tel"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <TextInput
              label="Password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Primary Specialization *</label>
              <select
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs font-medium border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
              >
                <option value="Plant Pathology">Plant Pathology</option>
                <option value="Entomology & Pest Control">Entomology & Pest Control</option>
                <option value="Agronomy & Crop Management">Agronomy & Crop Management</option>
                <option value="Soil Science & Nutrition">Soil Science & Nutrition</option>
                <option value="Horticulture">Horticulture</option>
              </select>
            </div>
            <div>
              <TextInput
                label="Highest Qualification"
                name="degree"
                type="text"
                placeholder="Ph.D. / M.Sc. Agronomy"
                value={formData.degree}
                onChange={handleChange}
                leftIcon={<Award className="w-4 h-4 text-slate-400" />}
                required
              />
            </div>
          </div>

          <div>
            <TextInput
              label="Agronomist License / Reg. ID"
              name="licenseId"
              type="text"
              placeholder="AGRI-PATH-2026-8849"
              value={formData.licenseId}
              onChange={handleChange}
              leftIcon={<FileBadge className="w-4 h-4 text-slate-400" />}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <TextInput
                label="Assigned District"
                name="district"
                type="text"
                placeholder="Guntur"
                value={formData.district}
                onChange={handleChange}
                leftIcon={<MapPin className="w-4 h-4 text-slate-400" />}
              />
            </div>
            <div>
              <TextInput
                label="State"
                name="state"
                type="text"
                placeholder="Andhra Pradesh"
                value={formData.state}
                onChange={handleChange}
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold"
            isLoading={loading}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Submit Agronomist Registration
          </Button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-600">
            Already registered as an Expert?{' '}
            <Link href="/login" className="font-bold text-sky-600 hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
