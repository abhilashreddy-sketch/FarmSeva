'use client';

import React, { useState } from 'react';
import { TextInput, Button, ErrorState, Badge } from '@farm-seva/shared-ui';
import { Phone, Lock, LogIn, ArrowRight, Store } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { setAuthToken } from '../../lib/api-client';
import { API_BASE_URL } from '../../config/api';

export default function SellerLoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      setError('Please provide phone number / email and password.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error?.message || 'Invalid credentials or seller account error.');
      } else {
        const token = json.data?.token || json.token;
        const user = json.data?.user || json.user;

        if (user && user.role !== 'SELLER' && user.role !== 'ADMIN') {
          setError(`Access restricted. Account role '${user.role}' belongs to the ${user.role.toLowerCase()} application.`);
          return;
        }

        setAuthToken(token);
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError('Unable to connect to seller authentication service.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-6 sm:py-12 space-y-6">
      <div className="text-center space-y-2">
        <Badge status="pending">Merchant Console</Badge>
        <h1 className="text-2xl font-black text-slate-900">Agri Dealer Sign In</h1>
        <p className="text-xs text-slate-500">
          Access your digital shop inventory, process district orders, and view settlements.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        {error && <ErrorState type="inline" message={error} />}

        <form onSubmit={handleSubmit} className="space-y-4">
          <TextInput
            label="Phone Number or Email"
            required
            leftIcon={<Phone className="w-4 h-4" />}
            placeholder="e.g. dealer@farmseva.com or 9876543210"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
          />

          <TextInput
            label="Password"
            type="password"
            required
            leftIcon={<Lock className="w-4 h-4" />}
            placeholder="Enter merchant password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold"
            leftIcon={<LogIn className="w-4 h-4" />}
          >
            Sign In to Dealer Console
          </Button>
        </form>

        <div className="pt-4 border-t border-slate-100 text-center space-y-2">
          <p className="text-xs text-slate-600">
            Need to register a licensed Agri Shop?
          </p>
          <Link href="/register">
            <Button variant="outline" size="sm" className="w-full" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Register New Agri Dealer Shop
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
