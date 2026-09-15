import './globals.css';
import React from 'react';
import { BrandHeader, Navigation } from '@farm-seva/shared-ui';
import { Truck, Package, Navigation as NavIcon, DollarSign, History, Bell, User } from 'lucide-react';

export const metadata = {
  title: 'FARM SEVA DELIVERY — Partner Logistics Console',
  description: 'Delivery Partner Console for Agricultural Product Fulfillment',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const navItems = [
    { label: 'Console', href: '/dashboard', icon: <Truck className="w-5 h-5" /> },
    { label: 'Deliveries', href: '/deliveries', icon: <Package className="w-5 h-5" /> },
    { label: 'Active Order', href: '/active', icon: <NavIcon className="w-5 h-5" /> },
    { label: 'Earnings', href: '/earnings', icon: <DollarSign className="w-5 h-5" /> },
    { label: 'History', href: '/history', icon: <History className="w-5 h-5" /> },
    { label: 'Alerts', href: '/notifications', icon: <Bell className="w-5 h-5" /> },
    { label: 'Profile', href: '/profile', icon: <User className="w-5 h-5" /> },
  ];

  return (
    <html lang="en" className="h-full">
      <body className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased">
        <BrandHeader role="DELIVERY" />
        <Navigation role="DELIVERY" items={navItems} />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 sm:py-8 pb-20 sm:pb-8">
          {children}
        </main>

        <footer className="bg-slate-900 text-slate-400 py-6 text-center text-xs border-t border-slate-800 hidden sm:block">
          <p>© 2026 FARM SEVA DELIVERY Application • Partner Logistics Console</p>
        </footer>
      </body>
    </html>
  );
}
