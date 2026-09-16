'use client';

import React, { useState } from 'react';
import { TextInput, Button, ErrorState, Badge } from '@farm-seva/shared-ui';
import { User, Phone, Lock, MapPin, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { setAuthToken } from '../../lib/api-client';
import { API_BASE_URL } from '../../config/api';

export default function FarmerRegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [district, setDistrict] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !password.trim()) {
      setError('Please provide full name, phone number, and password.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          password,
          role: 'FARMER',
          district,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error?.message || 'Registration failed. Check phone number availability.');
      } else {
        const token = json.data?.token || json.token;
        if (token) {
          setAuthToken(token);
          router.push('/dashboard');
        } else {
          router.push('/login');
        }
      }
    } catch (err: any) {
      setError('Unable to connect to registration service.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-6 sm:py-12 space-y-6">
      <div className="text-center space-y-2">
        <Badge status="active">Customer Registration</Badge>
        <h1 className="text-2xl font-black text-slate-900">Create Farmer Account</h1>
        <p className="text-xs text-slate-500">
          Register to buy certified district inputs and get AI crop health advice.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        {error && <ErrorState type="inline" message={error} />}

        <form onSubmit={handleSubmit} className="space-y-4">
          <TextInput
            label="Full Name"
            required
            leftIcon={<User className="w-4 h-4" />}
            placeholder="e.g. Ramesh Kumar"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <TextInput
            label="Phone Number"
            required
            leftIcon={<Phone className="w-4 h-4" />}
            placeholder="e.g. 9876543210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <TextInput
            label="District / Location (Optional)"
            leftIcon={<MapPin className="w-4 h-4" />}
            placeholder="e.g. Guntur, Andhra Pradesh"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
          />

          <TextInput
            label="Set Password"
            type="password"
            required
            leftIcon={<Lock className="w-4 h-4" />}
            placeholder="Minimum 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className="w-full bg-emerald-700 hover:bg-emerald-800"
            leftIcon={<UserPlus className="w-4 h-4" />}
          >
            Create Farmer Account
          </Button>
        </form>

        <div className="pt-4 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-600">
            Already have an account?{' '}
            <Link href="/login" className="font-bold text-emerald-700 hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
