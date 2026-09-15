'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingBag, Sprout, ShoppingCart, HelpCircle, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export function MobileBottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { t } = useLanguage();

  // Show bottom navigation primarily on farmer routes and public home/marketplace
  if (user && user.role !== 'FARMER') return null;

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 z-40 px-2 py-1.5 flex items-center justify-around shadow-lg">
      <Link
        href={user ? '/farmer' : '/'}
        className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition ${
          isActive('/farmer') || isActive('/') ? 'text-emerald-700 font-extrabold' : 'text-slate-500 font-medium'
        }`}
      >
        <Home className="w-5 h-5" />
        <span className="text-[10px]">{t('mobileNav.home', 'Home')}</span>
      </Link>

      <Link
        href="/farmer/marketplace"
        className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition ${
          isActive('/farmer/marketplace') ? 'text-emerald-700 font-extrabold' : 'text-slate-500 font-medium'
        }`}
      >
        <ShoppingBag className="w-5 h-5" />
        <span className="text-[10px]">{t('mobileNav.buy', 'Buy')}</span>
      </Link>

      <Link
        href="/farmer/crops"
        className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition ${
          isActive('/farmer/crops') ? 'text-emerald-700 font-extrabold' : 'text-slate-500 font-medium'
        }`}
      >
        <Sprout className="w-5 h-5" />
        <span className="text-[10px]">{t('mobileNav.crops', 'Crops')}</span>
      </Link>

      <Link
        href="/farmer/orders"
        className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition ${
          isActive('/farmer/orders') ? 'text-emerald-700 font-extrabold' : 'text-slate-500 font-medium'
        }`}
      >
        <ShoppingCart className="w-5 h-5" />
        <span className="text-[10px]">{t('mobileNav.orders', 'Orders')}</span>
      </Link>

      <Link
        href="/farmer/crop-problems"
        className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition ${
          isActive('/farmer/crop-problems') ? 'text-emerald-700 font-extrabold' : 'text-slate-500 font-medium'
        }`}
      >
        <HelpCircle className="w-5 h-5" />
        <span className="text-[10px]">{t('mobileNav.advisory', 'Advisory')}</span>
      </Link>
    </nav>
  );
}
