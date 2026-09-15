'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sprout,
  ShoppingCart,
  User,
  LogOut,
  Menu,
  X,
  Search,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { LanguageSelector } from './LanguageSelector';

export default function Navbar() {
  const { t } = useLanguage();
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  return (
    <header className="glass-nav text-white sticky top-0 z-50 shadow-md border-b border-emerald-600/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            <div className="w-10 h-10 bg-amber-400 text-emerald-950 rounded-xl flex items-center justify-center font-black text-2xl shadow-md group-hover:scale-105 transition-transform">
              🌾
            </div>
            <div>
              <span className="font-black text-xl tracking-tight text-white group-hover:text-amber-300 transition">
                {t('app.name', 'FARM SEVA')}
              </span>
              <span className="hidden sm:block text-[10px] font-bold tracking-wider text-emerald-200 uppercase">
                {t('app.tagline', 'Agri Marketplace & Advisory')}
              </span>
            </div>
          </Link>

          {/* Search Bar (Desktop) */}
          <div className="hidden lg:flex items-center flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <input
                type="text"
                placeholder={t('navbar.searchPlaceholder', 'Search products, crops, pests or dealers...')}
                className="w-full bg-emerald-900/60 border border-emerald-500/60 rounded-xl pl-9 pr-4 py-1.5 text-xs text-white placeholder-emerald-200/70 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-emerald-950/80 transition"
              />
              <Search className="w-4 h-4 text-emerald-300 absolute left-3 top-2.5" />
            </div>
          </div>

          {/* Desktop Role Navigation Links */}
          {user && (
            <nav className="hidden md:flex items-center gap-1 text-xs font-bold">
              {user.role === 'FARMER' && (
                <>
                  <Link
                    href="/farmer"
                    className={`px-3 py-2 rounded-xl transition ${
                      isActive('/farmer') ? 'bg-emerald-800 text-amber-300 shadow-inner' : 'hover:bg-emerald-800/60 text-emerald-100'
                    }`}
                  >
                    {t('navbar.dashboard', 'Dashboard')}
                  </Link>
                  <Link
                    href="/farmer/marketplace"
                    className={`px-3 py-2 rounded-xl transition ${
                      isActive('/farmer/marketplace') ? 'bg-amber-500 text-emerald-950 font-black shadow' : 'hover:bg-emerald-800/60 text-emerald-100'
                    }`}
                  >
                    {t('navbar.marketplace', 'Marketplace')}
                  </Link>
                  <Link
                    href="/farmer/crops"
                    className={`px-3 py-2 rounded-xl transition ${
                      isActive('/farmer/crops') ? 'bg-emerald-800 text-amber-300' : 'hover:bg-emerald-800/60 text-emerald-100'
                    }`}
                  >
                    {t('navbar.myCrops', 'My Crops')}
                  </Link>
                  <Link
                    href="/crop-doctor"
                    className={`px-3 py-2 rounded-xl transition ${
                      isActive('/crop-doctor') ? 'bg-amber-400 text-emerald-950 font-black shadow' : 'bg-emerald-800/80 hover:bg-emerald-800 text-amber-300'
                    }`}
                  >
                    🌱 {t('navbar.cropDoctor', 'AI Crop Doctor')}
                  </Link>
                  <Link
                    href="/farmer/crop-problems"
                    className={`px-3 py-2 rounded-xl transition ${
                      isActive('/farmer/crop-problems') ? 'bg-emerald-800 text-amber-300' : 'hover:bg-emerald-800/60 text-emerald-100'
                    }`}
                  >
                    {t('navbar.cropAdvisory', 'Crop Advisory')}
                  </Link>
                </>
              )}

              {user.role === 'SELLER' && (
                <>
                  <Link
                    href="/seller"
                    className={`px-3 py-2 rounded-xl transition ${
                      isActive('/seller') ? 'bg-emerald-800 text-amber-300 shadow-inner' : 'hover:bg-emerald-800/60 text-emerald-100'
                    }`}
                  >
                    {t('navbar.sellerDashboard', 'Dealer Console')}
                  </Link>
                  <Link
                    href="/seller/marketplace"
                    className={`px-3 py-2 rounded-xl transition ${
                      isActive('/seller/marketplace') ? 'bg-amber-500 text-emerald-950 font-black' : 'hover:bg-emerald-800/60 text-emerald-100'
                    }`}
                  >
                    {t('seller.productCatalog', 'Product Catalog')}
                  </Link>
                  <Link
                    href="/seller/orders"
                    className={`px-3 py-2 rounded-xl transition ${
                      isActive('/seller/orders') ? 'bg-emerald-800 text-amber-300' : 'hover:bg-emerald-800/60 text-emerald-100'
                    }`}
                  >
                    {t('navbar.orders', 'Orders')}
                  </Link>
                </>
              )}

              {((user.role as string) === 'AGRICULTURAL_EXPERT' || (user.role as string) === 'EXPERT') && (
                <>
                  <Link
                    href="/expert"
                    className={`px-3 py-2 rounded-xl transition ${
                      isActive('/expert') ? 'bg-emerald-800 text-amber-300' : 'hover:bg-emerald-800/60 text-emerald-100'
                    }`}
                  >
                    {t('navbar.expertDashboard', 'Expert Station')}
                  </Link>
                </>
              )}

              {((user.role as string) === 'DELIVERY_PARTNER' || (user.role as string) === 'DELIVERY') && (
                <>
                  <Link
                    href="/delivery"
                    className={`px-3 py-2 rounded-xl transition ${
                      isActive('/delivery') ? 'bg-emerald-800 text-amber-300' : 'hover:bg-emerald-800/60 text-emerald-100'
                    }`}
                  >
                    {t('navbar.deliveryDashboard', 'Delivery Console')}
                  </Link>
                </>
              )}

              {user.role === 'ADMIN' && (
                <>
                  <Link
                    href="/admin"
                    className={`px-3 py-2 rounded-xl transition ${
                      isActive('/admin') ? 'bg-emerald-800 text-amber-300' : 'hover:bg-emerald-800/60 text-emerald-100'
                    }`}
                  >
                    {t('navbar.adminDashboard', 'Admin Center')}
                  </Link>
                  <Link
                    href="/admin/marketplace"
                    className={`px-3 py-2 rounded-xl transition ${
                      isActive('/admin/marketplace') ? 'bg-amber-500 text-emerald-950 font-black' : 'hover:bg-emerald-800/60 text-emerald-100'
                    }`}
                  >
                    {t('admin.productApprovals', 'Catalog')}
                  </Link>
                </>
              )}
            </nav>
          )}

          {/* Right Action Controls */}
          <div className="flex items-center gap-3">
            
            {/* Reusable 8-Locale Language Selector */}
            <LanguageSelector variant="navbar" />

            {/* Farmer Cart Icon (If Farmer) */}
            {user && user.role === 'FARMER' && (
              <Link
                href="/farmer/cart"
                className="relative p-2 text-emerald-100 hover:text-amber-300 bg-emerald-800/50 hover:bg-emerald-800 rounded-xl transition shadow-sm"
                title={t('navbar.cart', 'Cart')}
              >
                <ShoppingCart className="w-4 h-4" />
              </Link>
            )}

            {/* User Account / Auth Actions */}
            {user ? (
              <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-emerald-600/60">
                <div className="text-right">
                  <span className="block text-xs font-black text-white truncate max-w-[120px]">
                    {user.fullName}
                  </span>
                  <span className="inline-block text-[9px] bg-emerald-950 text-amber-300 font-extrabold px-2 py-0.2 rounded-full uppercase tracking-wider">
                    {user.role.replace(/_/g, ' ')}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="p-2 text-emerald-200 hover:text-white bg-rose-600/80 hover:bg-rose-600 rounded-xl transition shadow-sm"
                  title={t('navbar.logout', 'Logout')}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  href="/login"
                  className="text-xs font-extrabold text-white hover:text-emerald-200 px-3 py-2 rounded-xl transition"
                >
                  {t('navbar.login', 'Log In')}
                </Link>
                <Link
                  href="/register"
                  className="bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-xs px-4 py-2 rounded-xl shadow transition"
                >
                  {t('navbar.register', 'Register')}
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-white hover:bg-emerald-800 rounded-xl transition"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-emerald-900 border-t border-emerald-700 px-4 pt-3 pb-6 space-y-4 shadow-xl">
          <div className="relative w-full mb-3">
            <input
              type="text"
              placeholder={t('navbar.searchPlaceholder', 'Search products or crops...')}
              className="w-full bg-emerald-950 border border-emerald-600 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-emerald-300"
            />
            <Search className="w-4 h-4 text-emerald-300 absolute left-3 top-2.5" />
          </div>

          {user ? (
            <div className="space-y-3">
              <div className="p-3 bg-emerald-950/80 rounded-xl border border-emerald-700 flex items-center justify-between">
                <div>
                  <p className="font-extrabold text-sm text-white">{user.fullName}</p>
                  <p className="text-xs text-amber-300 font-bold uppercase">{user.role.replace(/_/g, ' ')}</p>
                </div>
                <button
                  onClick={logout}
                  className="bg-rose-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg"
                >
                  {t('navbar.logout', 'Logout')}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-bold pt-2">
                <Link
                  href={user.role === 'FARMER' ? '/farmer' : user.role === 'SELLER' ? '/seller' : user.role === 'ADMIN' ? '/admin' : '/'}
                  onClick={() => setMobileMenuOpen(false)}
                  className="bg-emerald-800 p-2.5 rounded-xl text-center"
                >
                  🏠 {t('navbar.dashboard', 'Dashboard')}
                </Link>
                <Link
                  href="/farmer/marketplace"
                  onClick={() => setMobileMenuOpen(false)}
                  className="bg-amber-500 text-emerald-950 font-black p-2.5 rounded-xl text-center"
                >
                  🛒 {t('navbar.marketplace', 'Marketplace')}
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="bg-emerald-800 text-white text-center py-2.5 rounded-xl font-bold text-sm"
              >
                {t('navbar.login', 'Log In')}
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="bg-amber-400 text-emerald-950 text-center py-2.5 rounded-xl font-black text-sm"
              >
                {t('navbar.register', 'Register')}
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
