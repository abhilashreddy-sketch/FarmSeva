import './globals.css';
import React from 'react';
import { BrandHeader, Navigation } from '@farm-seva/shared-ui';
import { LayoutDashboard, Users, ShoppingBag, Truck, UserCheck, Package, Layers, BarChart3, Bell, ShieldCheck } from 'lucide-react';

export const metadata = {
  title: 'FARM SEVA ADMIN — Operational Control Center',
  description: 'Administrator Control Desk for Platform Management & Operations',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const navItems = [
    { label: 'Control Desk', href: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: 'Users', href: '/users', icon: <Users className="w-5 h-5" /> },
    { label: 'Orders', href: '/orders', icon: <ShoppingBag className="w-5 h-5" /> },
    { label: 'Dispatch', href: '/deliveries', icon: <Truck className="w-5 h-5" /> },
    { label: 'KYC Moderation', href: '/kyc', icon: <UserCheck className="w-5 h-5" /> },
    { label: 'Products', href: '/products', icon: <Package className="w-5 h-5" /> },
    { label: 'Categories', href: '/categories', icon: <Layers className="w-5 h-5" /> },
    { label: 'Analytics', href: '/reports', icon: <BarChart3 className="w-5 h-5" /> },
    { label: 'Alerts', href: '/notifications', icon: <Bell className="w-5 h-5" /> },
    { label: 'Admin Profile', href: '/profile', icon: <ShieldCheck className="w-5 h-5" /> },
  ];

  return (
    <html lang="en" className="h-full">
      <body className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased">
        <BrandHeader role="ADMIN" />
        <Navigation role="ADMIN" items={navItems} />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 sm:py-8 pb-20 sm:pb-8">
          {children}
        </main>

        <footer className="bg-slate-900 text-slate-400 py-6 text-center text-xs border-t border-slate-800 hidden sm:block">
          <p>© 2026 FARM SEVA ADMIN Application • Operational Control Desk</p>
        </footer>
      </body>
    </html>
  );
}
