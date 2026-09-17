'use client';

import React, { useState } from 'react';
import { TextInput, Button, ErrorState, Badge } from '@farm-seva/shared-ui';
import { Phone, Lock, LogIn, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { setAuthToken } from '../../lib/api-client';
import { API_BASE_URL } from '../../config/api';
import { buildPortalLaunchUrl } from '../../config/portal';

export default function LoginPage() {
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
        setError(json.error?.message || 'Invalid credentials or login failed.');
      } else {
        const token = json.data?.token || json.token;
        const user = json.data?.user || json.user;

        if (token) {
          setAuthToken(token);
        }
        if (user && typeof window !== 'undefined') {
          localStorage.setItem('farm_seva_user', JSON.stringify(user));
        }

        // Intelligent Role Routing
        const userRole = user?.role;
        if (userRole === 'FARMER') {
          router.push('/dashboard');
        } else if (userRole === 'ADMIN') {
          // Administrators can manage the full platform or visit any portal
          router.push('/portal');
        } else if (userRole === 'SELLER') {
          window.location.href = buildPortalLaunchUrl('SELLER', token);
        } else if (userRole === 'AGRICULTURAL_EXPERT') {
          window.location.href = buildPortalLaunchUrl('AGRICULTURAL_EXPERT', token);
        } else if (userRole === 'DELIVERY_PARTNER') {
          window.location.href = buildPortalLaunchUrl('DELIVERY_PARTNER', token);
        } else {
          router.push('/portal');
        }
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
        <Badge status="active">Unified Ecosystem Authentication</Badge>
        <h1 className="text-2xl font-black text-slate-900">Sign In to FARM SEVA</h1>
        <p className="text-xs text-slate-500">
          Enter your credentials to access your authorized platform portal.
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
            Sign In to FARM SEVA
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
