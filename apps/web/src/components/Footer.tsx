'use client';

import React from 'react';
import Link from 'next/link';
import { PhoneCall, ShieldCheck, Truck, Headphones, Sprout } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t-4 border-emerald-600 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Value Proposition Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-10 border-b border-slate-800">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-800/50 border border-slate-800">
            <div className="p-3 bg-emerald-900/60 text-emerald-400 rounded-xl">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-white text-sm">{t('cropDoctor.consultExpert', 'Certified Agronomists')}</h4>
              <p className="text-xs text-slate-400">{t('cropDoctor.subtitle', 'Direct crop diagnostics & guidance')}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-800/50 border border-slate-800">
            <div className="p-3 bg-amber-900/60 text-amber-400 rounded-xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-white text-sm">{t('marketplace.cibCertified', 'Genuine Agri Inputs')}</h4>
              <p className="text-xs text-slate-400">{t('marketplace.cibCertified', '100% verified dealer supply')}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-800/50 border border-slate-800">
            <div className="p-3 bg-sky-900/60 text-sky-400 rounded-xl">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-white text-sm">{t('delivery.dashboard', 'District Delivery')}</h4>
              <p className="text-xs text-slate-400">{t('orders.trackOrder', 'Farm-gate OTP drop-off')}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-800/50 border border-slate-800">
            <div className="p-3 bg-purple-900/60 text-purple-400 rounded-xl">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-white text-sm">{t('navbar.callCenter', 'IVR & Call-Center')}</h4>
              <p className="text-xs text-slate-400">{t('app.callSupport', 'Voice support for low literacy')}</p>
            </div>
          </div>
        </div>

        {/* Footer Navigation Columns */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center font-black text-xl text-white shadow">
                🌾
              </div>
              <span className="font-black text-xl text-white tracking-tight">{t('app.name', 'FARM SEVA')}</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t('app.footerDesc', 'India Multi-Channel Agricultural Marketplace & Certified Crop Diagnostics Platform.')}
            </p>
          </div>

          <div className="space-y-3">
            <h5 className="font-black text-white text-sm uppercase tracking-wider">{t('navbar.marketplace', 'Marketplace')}</h5>
            <ul className="space-y-2 text-xs font-semibold">
              <li><Link href="/farmer/marketplace" className="hover:text-emerald-400 transition">{t('marketplace.categories', 'Seeds & Varieties')}</Link></li>
              <li><Link href="/farmer/marketplace" className="hover:text-emerald-400 transition">{t('marketplace.allInputs', 'Crop Protection & Fungicides')}</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h5 className="font-black text-white text-sm uppercase tracking-wider">{t('footer.quickLinks', 'Quick Links')}</h5>
            <ul className="space-y-2 text-xs font-semibold">
              <li><Link href="/register?role=FARMER" className="hover:text-emerald-400 transition">{t('auth.registerAsFarmer', 'Farmer Registration')}</Link></li>
              <li><Link href="/register?role=SELLER" className="hover:text-emerald-400 transition">{t('auth.registerAsSeller', 'Agri Dealer Shop Onboarding')}</Link></li>
            </ul>
          </div>

          <div className="space-y-3 bg-slate-800/80 p-5 rounded-2xl border border-slate-700">
            <h5 className="font-black text-amber-400 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <PhoneCall className="w-4 h-4" /> {t('footer.helpSupport', 'Toll-Free Helpline')}
            </h5>
            <p className="text-xs text-slate-300">{t('app.callSupport', 'Call to order inputs or report crop pests')}</p>
            <a
              href="tel:180032767382"
              className="block bg-amber-500 hover:bg-amber-400 text-emerald-950 font-black text-center text-sm py-2.5 rounded-xl shadow transition"
            >
              1800-FARM-SEVA
            </a>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>{t('app.copyright', '© 2026 FARM SEVA. All rights reserved.')}</p>
          <div className="flex items-center gap-4 font-medium">
            <span>{t('footer.privacyPolicy', 'Privacy Policy')}</span>
            <span>•</span>
            <span>{t('footer.termsService', 'Terms of Service')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
