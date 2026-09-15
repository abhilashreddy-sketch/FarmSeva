'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, TextInput, Button, Toast } from '@farm-seva/shared-ui';
import { Truck, Lock, Mail, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { apiFetch, setAuthToken } from '../../lib/api-client';

export default function DeliveryLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setToast({ message: 'Please enter both email and password', type: 'error' });
      return;
    }

    setLoading(true);
    setToast(null);

    const res = await apiFetch<{ token: string; user: { id: string; role: string; name: string } }>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    setLoading(false);

    if (res.success && res.data?.token) {
      setAuthToken(res.data.token);
      setToast({ message: 'Login successful! Redirecting to delivery console...', type: 'success' });
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    } else {
      setToast({ message: res.error || 'Login failed. Please verify credentials.', type: 'error' });
    }
  };

  return (
    <div className="max-w-md mx-auto py-8 space-y-6">
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
        <h1 className="text-2xl font-black text-slate-900">Delivery Partner Sign In</h1>
        <p className="text-xs text-slate-500 font-medium">
          Access your assigned agricultural order deliveries and pickup desk
        </p>
      </div>

      <Card className="p-6 border-slate-200">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <TextInput
              label="Partner Email Address"
              type="email"
              placeholder="delivery@farmseva.com"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
              required
            />
          </div>

          <div>
            <TextInput
              label="Account Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
              required
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold"
            isLoading={loading}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Sign In to Logistics Console
          </Button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-600">
            Need a delivery partner account?{' '}
            <Link href="/register" className="font-bold text-purple-600 hover:underline">
              Register Vehicle Profile
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
