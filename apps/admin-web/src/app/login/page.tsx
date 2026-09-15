'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, TextInput, Button, Toast } from '@farm-seva/shared-ui';
import { ShieldCheck, Lock, Mail, ArrowRight } from 'lucide-react';
import { apiFetch, setAuthToken } from '../../lib/api-client';

export default function AdminLoginPage() {
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
      setToast({ message: 'Authentication successful! Redirecting to Control Desk...', type: 'success' });
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    } else {
      setToast({ message: res.error || 'Login failed. Please verify admin credentials.', type: 'error' });
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
        <div className="inline-flex items-center justify-center p-3 bg-slate-900 rounded-2xl text-emerald-400 mb-2 border border-slate-800">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black text-slate-900">Administrator Sign In</h1>
        <p className="text-xs text-slate-500 font-medium">
          Privileged access to FARM SEVA operational control center
        </p>
      </div>

      <Card className="p-6 border-slate-200 shadow-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <TextInput
              label="Admin Email Address"
              type="email"
              placeholder="admin@farmseva.com"
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
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold"
            isLoading={loading}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Authenticate & Open Control Desk
          </Button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-400 font-medium">
            FARM SEVA Platform RBAC Enforcement • Authorized Access Only
          </p>
        </div>
      </Card>
    </div>
  );
}
