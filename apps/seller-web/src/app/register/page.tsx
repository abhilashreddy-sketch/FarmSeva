'use client';

import React, { useState } from 'react';
import { TextInput, Button, ErrorState, Badge } from '@farm-seva/shared-ui';
import { User, Phone, Lock, Store, FileText, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { setAuthToken } from '../../lib/api-client';
import { API_BASE_URL } from '../../config/api';

export default function SellerRegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [gstin, setGstin] = useState('');
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
          role: 'SELLER',
          businessName,
          gstin,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error?.message || 'Merchant registration failed. Check phone availability.');
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
        <Badge status="pending">Merchant Registration</Badge>
        <h1 className="text-2xl font-black text-slate-900">Register Agri Shop</h1>
        <p className="text-xs text-slate-500">
          Register your licensed retail shop to sell agricultural inputs on FARM SEVA.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        {error && <ErrorState type="inline" message={error} />}

        <form onSubmit={handleSubmit} className="space-y-4">
          <TextInput
            label="Proprietor / Contact Name"
            required
            leftIcon={<User className="w-4 h-4" />}
            placeholder="e.g. Suresh Patel"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <TextInput
            label="Shop / Business Name"
            leftIcon={<Store className="w-4 h-4" />}
            placeholder="e.g. Patel Krishi Seva Kendra"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
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
            label="Trade License / GSTIN (Optional)"
            leftIcon={<FileText className="w-4 h-4" />}
            placeholder="e.g. 36AAAAA0000A1Z5"
            value={gstin}
            onChange={(e) => setGstin(e.target.value)}
          />

          <TextInput
            label="Set Account Password"
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
            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold"
            leftIcon={<UserPlus className="w-4 h-4" />}
          >
            Register Merchant Account
          </Button>
        </form>

        <div className="pt-4 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-600">
            Already have a merchant account?{' '}
            <Link href="/login" className="font-bold text-amber-700 hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
