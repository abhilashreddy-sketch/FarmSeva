'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

export default function AccountPendingPage() {
  const { t } = useLanguage();
  const { user } = useAuth();

  return (
    <div className="max-w-md mx-auto py-12 text-center space-y-6">
      <div className="bg-white p-8 rounded-3xl shadow-xl border-2 border-amber-200 space-y-4">
        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center text-5xl mx-auto text-amber-600">
          ⏳
        </div>
        <h1 className="text-2xl font-black text-amber-950">{t('accountPendingTitle')}</h1>
        <p className="text-sm font-semibold text-gray-700 leading-relaxed">
          {t('accountPendingMsg')}
        </p>

        {user && (
          <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 text-left text-xs font-semibold space-y-1">
            <div>Account Name: <strong>{user.fullName}</strong></div>
            <div>Registered Mobile: <strong>{user.phone}</strong></div>
            <div>Requested Role: <strong>{user.role}</strong></div>
            <div>Status: <span className="font-extrabold text-amber-800">PENDING_VERIFICATION</span></div>
          </div>
        )}

        <div className="pt-2 flex flex-col gap-2">
          <a
            href="tel:180032767382"
            className="bg-amber-500 hover:bg-amber-600 text-emerald-950 font-black text-sm py-3 rounded-xl shadow transition"
          >
            Call Support Helpline (1800-FARM-SEVA)
          </a>
          <Link href="/login" className="text-xs font-bold text-emerald-700 hover:underline pt-2">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
