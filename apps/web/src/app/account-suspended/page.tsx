'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '../../context/LanguageContext';

export default function AccountSuspendedPage() {
  const { t } = useLanguage();

  return (
    <div className="max-w-md mx-auto py-12 text-center space-y-6">
      <div className="bg-white p-8 rounded-3xl shadow-xl border-2 border-red-200 space-y-4">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center text-5xl mx-auto text-red-600">
          ⚠️
        </div>
        <h1 className="text-2xl font-black text-red-950">{t('accountSuspendedTitle')}</h1>
        <p className="text-sm font-semibold text-gray-700 leading-relaxed">
          {t('accountSuspendedMsg')}
        </p>
        <div className="bg-red-50 p-4 rounded-2xl border border-red-200 text-xs font-semibold text-red-900">
          Your access has been temporarily blocked by platform administration.
        </div>
        <div className="pt-2 flex flex-col gap-2">
          <a
            href="tel:180032767382"
            className="bg-red-600 hover:bg-red-700 text-white font-black text-sm py-3 rounded-xl shadow transition"
          >
            Contact Support (1800-FARM-SEVA)
          </a>
          <Link href="/login" className="text-xs font-bold text-gray-600 hover:underline pt-2">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
