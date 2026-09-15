'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import DeliveryNavbar from '../../components/delivery/DeliveryNavbar';

export default function DeliveryLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login');
      } else if (user.status === 'SUSPENDED') {
        router.push('/account-suspended');
      } else if (user.role !== 'DELIVERY_PARTNER' && user.role !== 'ADMIN') {
        router.push('/unauthorized');
      }
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="font-extrabold text-sm text-slate-300">Authenticating Logistics Console...</span>
        </div>
      </div>
    );
  }

  if (!user || (user.role !== 'DELIVERY_PARTNER' && user.role !== 'ADMIN')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <DeliveryNavbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-8">
        {children}
      </main>
    </div>
  );
}
