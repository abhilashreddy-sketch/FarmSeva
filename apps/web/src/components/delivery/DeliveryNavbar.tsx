'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Truck,
  LayoutDashboard,
  PackageCheck,
  Wallet,
  History,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import LanguageSelector from '../LanguageSelector';

export default function DeliveryNavbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    {
      href: '/delivery',
      label: t('delivery.navDashboard', 'Dashboard'),
      icon: LayoutDashboard,
      active: pathname === '/delivery',
    },
    {
      href: '/delivery/deliveries',
      label: t('delivery.navDeliveries', 'Deliveries'),
      icon: PackageCheck,
      active: pathname.startsWith('/delivery/deliveries'),
    },
    {
      href: '/delivery/earnings',
      label: t('delivery.navEarnings', 'Earnings'),
      icon: Wallet,
      active: pathname.startsWith('/delivery/earnings'),
    },
    {
      href: '/delivery/history',
      label: t('delivery.navHistory', 'History'),
      icon: History,
      active: pathname.startsWith('/delivery/history'),
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Logistics Label */}
          <div className="flex items-center gap-3">
            <Link href="/delivery" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-emerald-600 group-hover:bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg transition">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <span className="font-black text-lg tracking-tight text-white flex items-center gap-1.5">
                  FARM SEVA
                </span>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block -mt-1">
                  Logistics Network
                </span>
              </div>
            </Link>

            <span className="hidden md:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-slate-800 text-emerald-400 border border-emerald-500/30 ml-2">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" />
              {t('delivery.badgePartner', 'Delivery Partner')}
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                    link.active
                      ? 'bg-emerald-600 text-white shadow'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Controls (Desktop) */}
          <div className="hidden md:flex items-center gap-3">
            <LanguageSelector variant="navbar" />

            <Link
              href="/delivery/notifications"
              className="relative p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition shadow-sm"
              title={t('delivery.notifications', 'Notifications')}
            >
              <Bell className="w-4 h-4" />
            </Link>

            <Link
              href="/delivery/profile"
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-xl border border-slate-700 text-xs font-bold text-white transition"
            >
              <User className="w-4 h-4 text-emerald-400" />
              <span>{user?.fullName?.split(' ')[0] || 'Partner'}</span>
            </Link>

            <button
              onClick={logout}
              className="p-2 text-slate-300 hover:text-white bg-rose-600/80 hover:bg-rose-600 rounded-xl transition shadow-sm"
              title={t('navbar.logout', 'Log Out')}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex items-center gap-2 md:hidden">
            <LanguageSelector variant="navbar" />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Top Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-4 space-y-2">
          <div className="flex items-center justify-between py-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-sm text-white">{user?.fullName}</span>
            </div>
            <span className="text-xs text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded font-mono">
              {user?.phone}
            </span>
          </div>

          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold ${
                  link.active ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                {link.label}
              </Link>
            );
          })}

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <Link
              href="/delivery/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs font-bold text-emerald-400 hover:underline"
            >
              {t('delivery.viewProfile', 'View Logistics Profile')}
            </Link>
            <button
              onClick={logout}
              className="text-xs font-bold text-rose-400 hover:underline flex items-center gap-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              {t('navbar.logout', 'Log Out')}
            </button>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar (Core Logistics Requirement) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900 border-t border-slate-800 px-2 py-1 flex items-center justify-around shadow-2xl">
        <Link
          href="/delivery"
          className={`flex flex-col items-center py-1 px-3 rounded-xl transition ${
            pathname === '/delivery' ? 'text-emerald-400 font-black' : 'text-slate-400 font-semibold'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">{t('delivery.mobHome', '🏠 Home')}</span>
        </Link>

        <Link
          href="/delivery/deliveries"
          className={`flex flex-col items-center py-1 px-3 rounded-xl transition ${
            pathname.startsWith('/delivery/deliveries') ? 'text-emerald-400 font-black' : 'text-slate-400 font-semibold'
          }`}
        >
          <PackageCheck className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">{t('delivery.mobDeliveries', '🚚 Deliveries')}</span>
        </Link>

        <Link
          href="/delivery/earnings"
          className={`flex flex-col items-center py-1 px-3 rounded-xl transition ${
            pathname.startsWith('/delivery/earnings') ? 'text-emerald-400 font-black' : 'text-slate-400 font-semibold'
          }`}
        >
          <Wallet className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">{t('delivery.mobEarnings', '💰 Earnings')}</span>
        </Link>

        <Link
          href="/delivery/profile"
          className={`flex flex-col items-center py-1 px-3 rounded-xl transition ${
            pathname.startsWith('/delivery/profile') ? 'text-emerald-400 font-black' : 'text-slate-400 font-semibold'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">{t('delivery.mobProfile', '👤 Profile')}</span>
        </Link>
      </nav>
    </header>
  );
}
