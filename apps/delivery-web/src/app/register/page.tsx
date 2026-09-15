'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, TextInput, Button, Toast } from '@farm-seva/shared-ui';
import { Truck, User, Mail, Lock, Phone, FileBadge, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { apiFetch, setAuthToken } from '../../lib/api-client';

export default function DeliveryRegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    vehicleType: 'Two-Wheeler (Motorcycle)',
    vehicleNumber: '',
    licenseNumber: '',
  });

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password || !formData.phone) {
      setToast({ message: 'Please fill in all required fields.', type: 'error' });
      return;
    }

    setLoading(true);
    setToast(null);

    const res = await apiFetch<{ token: string; user: any }>('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        ...formData,
        role: 'DELIVERY_PARTNER',
      }),
    });

    setLoading(false);

    if (res.success && res.data?.token) {
      setAuthToken(res.data.token);
      setToast({ message: 'Registration successful! Redirecting to delivery console...', type: 'success' });
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    } else {
      setToast({ message: res.error || 'Registration failed. Please check submitted details.', type: 'error' });
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
        <div className="inline-flex items-center justify-center p-3 bg-purple-100 rounded-2xl text-purple-700 mb-2">
          <Truck className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black text-slate-900">Delivery Partner Registration</h1>
        <p className="text-xs text-slate-500 font-medium">
          Create an official FARM SEVA Delivery Partner account to collect and deliver agricultural orders
        </p>
      </div>

      <Card className="p-6 border-slate-200">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <TextInput
              label="Full Legal Name"
              name="name"
              type="text"
              placeholder="Ramesh Kumar"
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
                placeholder="delivery@farmseva.com"
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
                leftIcon={<Phone className="w-4 h-4 text-slate-400" />}
                required
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

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Vehicle Type</label>
            <select
              name="vehicleType"
              value={formData.vehicleType}
              onChange={handleChange}
              className="w-full px-3 py-2.5 text-sm font-medium border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
            >
              <option value="Two-Wheeler (Motorcycle)">Two-Wheeler (Motorcycle)</option>
              <option value="Three-Wheeler (Cargo Auto)">Three-Wheeler (Cargo Auto)</option>
              <option value="Four-Wheeler (Mini Pickup Truck)">Four-Wheeler (Mini Pickup Truck)</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <TextInput
                label="Vehicle Reg. Number"
                name="vehicleNumber"
                type="text"
                placeholder="AP 07 AB 1234"
                value={formData.vehicleNumber}
                onChange={handleChange}
                leftIcon={<Truck className="w-4 h-4 text-slate-400" />}
              />
            </div>
            <div>
              <TextInput
                label="Driving License ID"
                name="licenseNumber"
                type="text"
                placeholder="DL-2026-88741"
                value={formData.licenseNumber}
                onChange={handleChange}
                leftIcon={<FileBadge className="w-4 h-4 text-slate-400" />}
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold"
            isLoading={loading}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Submit Partner Registration
          </Button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-600">
            Already registered as a Delivery Partner?{' '}
            <Link href="/login" className="font-bold text-purple-600 hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
