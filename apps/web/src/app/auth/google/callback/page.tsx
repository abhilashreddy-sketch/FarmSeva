'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../../context/AuthContext';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { API_BASE_URL } from '@/config/api';

function CallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { loginGoogle, setSession, getRoleDashboardPath } = useAuth();
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    async function processOAuthCallback() {
      const code = searchParams.get('code');
      const token = searchParams.get('token');
      const error = searchParams.get('error');

      if (error) {
        setErrorMsg(`Google login was cancelled or denied: ${error}`);
        setIsProcessing(false);
        return;
      }

      // Option A: Backend redirected with token directly
      if (token) {
        try {
          const res = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          if (data.success) {
            setSession(token, data.data);
            const targetPath = getRoleDashboardPath(data.data.role, data.data.status);
            router.push(targetPath);
            return;
          }
        } catch (e) {
          console.error('Failed to verify session token:', e);
        }
      }

      // Option B: Authorization code exchange
      if (code) {
        const redirectUri = `${window.location.origin}/auth/google/callback`;
        const result = await loginGoogle({ code, redirectUri });
        if (result.success) {
          return;
        } else {
          setErrorMsg(result.error || 'Failed to authenticate with Google');
          setIsProcessing(false);
          return;
        }
      }

      setErrorMsg('No Google authorization code or token was provided.');
      setIsProcessing(false);
    }

    processOAuthCallback();
  }, [searchParams]);

  return (
    <Card className="p-8 text-center space-y-6 border border-slate-200/80 shadow-elevated">
      {isProcessing ? (
        <div className="space-y-4 py-6">
          <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto" />
          <h2 className="text-xl font-black text-slate-900">Authenticating with Google...</h2>
          <p className="text-xs font-semibold text-slate-500">
            Establishing secure FARM SEVA session. Please wait.
          </p>
        </div>
      ) : (
        <div className="space-y-4 py-4">
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto font-black text-xl">
            ✕
          </div>
          <h2 className="text-xl font-black text-slate-900">Authentication Failed</h2>
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl text-xs font-bold">
            ⚠️ {errorMsg}
          </div>
          <Button
            type="button"
            variant="primary"
            size="md"
            className="w-full mt-4"
            onClick={() => router.push('/login')}
          >
            Return to Login
          </Button>
        </div>
      )}
    </Card>
  );
}

export default function GoogleCallbackPage() {
  return (
    <div className="max-w-md mx-auto py-12 px-4 space-y-6">
      <Suspense
        fallback={
          <Card className="p-8 text-center space-y-4 border border-slate-200/80 shadow-elevated">
            <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto" />
            <h2 className="text-xl font-black text-slate-900">Loading OAuth Session...</h2>
          </Card>
        }
      >
        <CallbackContent />
      </Suspense>
    </div>
  );
}
