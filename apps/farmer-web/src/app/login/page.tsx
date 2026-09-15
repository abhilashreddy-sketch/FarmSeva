'use client';

import React, { useState } from 'react';
import { TextInput, Button, ErrorState, Badge } from '@farm-seva/shared-ui';
import { Phone, Lock, LogIn, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { setAuthToken } from '../../lib/api-client';

export default function FarmerLoginPage() {
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
      const res = await fetch('http://localhost:4000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error?.message || 'Invalid credentials or login failed.');
      } else {
        const token = json.data?.token || json.token;
        const user = json.data?.user || json.user;

        if (user && user.role !== 'FARMER' && user.role !== 'ADMIN') {
          setError(`Access restricted. Account role '${user.role}' belongs to the ${user.role.toLowerCase()} portal.`);
          return;
        }

        setAuthToken(token);
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError('Unable to connect to authentication service.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-6 sm:py-12 space-y-6">
      <div className="text-center space-y-2">
        <Badge status="active">Customer Application</Badge>
        <h1 className="text-2xl font-black text-slate-900">Farmer Sign In</h1>
        <p className="text-xs text-slate-500">
          Access your agricultural orders, registered crops, and disease diagnostics.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        {error && <ErrorState type="inline" message={error} />}

        <form onSubmit={handleSubmit} className="space-y-4">
          <TextInput
            label="Phone Number or Email"
            required
            leftIcon={<Phone className="w-4 h-4" />}
            placeholder="e.g. 9876543210 or farmer@farmseva.com"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
          />

          <TextInput
            label="Password"
            type="password"
            required
            leftIcon={<Lock className="w-4 h-4" />}
            placeholder="Enter your account password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className="w-full bg-emerald-700 hover:bg-emerald-800"
            leftIcon={<LogIn className="w-4 h-4" />}
          >
            Sign In to Farmer Portal
          </Button>
        </form>

        <div className="pt-4 border-t border-slate-100 text-center space-y-2">
          <p className="text-xs text-slate-600">
            Don't have a Farmer account yet?
          </p>
          <Link href="/register">
            <Button variant="outline" size="sm" className="w-full" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Register New Farmer Account
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
