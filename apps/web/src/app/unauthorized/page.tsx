'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '../../context/LanguageContext';

export default function UnauthorizedPage() {
  const { t } = useLanguage();

  return (
    <div className="max-w-md mx-auto py-12 text-center space-y-6">
      <div className="bg-white p-8 rounded-3xl shadow-xl border-2 border-red-100 space-y-4">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center text-5xl mx-auto text-red-600">
          🚫
        </div>
        <h1 className="text-2xl font-black text-red-950">{t('unauthorizedTitle')}</h1>
        <p className="text-sm font-semibold text-gray-600 leading-relaxed">
          {t('unauthorizedMsg')}
        </p>
        <div className="pt-4">
          <Link
            href="/"
            className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base px-6 py-3 rounded-2xl shadow transition"
          >
            ← Return to Farm Seva Home
          </Link>
        </div>
      </div>
    </div>
  );
}
