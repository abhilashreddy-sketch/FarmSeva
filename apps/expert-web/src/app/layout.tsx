import './globals.css';
import React from 'react';
import { BrandHeader, Navigation } from '@farm-seva/shared-ui';
import { Stethoscope, FileText, Activity, AlertTriangle, Archive, Bell, User } from 'lucide-react';

export const metadata = {
  title: 'FARM SEVA EXPERT — Agronomist Workstation',
  description: 'Certified Agronomist & Crop Pathology Workstation',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const navItems = [
    { label: 'Workstation', href: '/dashboard', icon: <Stethoscope className="w-5 h-5" /> },
    { label: 'Cases Queue', href: '/cases', icon: <FileText className="w-5 h-5" /> },
    { label: 'AI Diagnosis', href: '/diagnosis', icon: <Activity className="w-5 h-5" /> },
    { label: 'Advisories', href: '/advisory', icon: <AlertTriangle className="w-5 h-5" /> },
    { label: 'History Archive', href: '/history', icon: <Archive className="w-5 h-5" /> },
    { label: 'Notifications', href: '/notifications', icon: <Bell className="w-5 h-5" /> },
    { label: 'Profile', href: '/profile', icon: <User className="w-5 h-5" /> },
  ];

  return (
    <html lang="en" className="h-full">
      <body className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased">
        <BrandHeader role="EXPERT" />
        <Navigation role="EXPERT" items={navItems} />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 sm:py-8 pb-20 sm:pb-8">
          {children}
        </main>

        <footer className="bg-slate-900 text-slate-400 py-6 text-center text-xs border-t border-slate-800">
          <p>© 2026 FARM SEVA EXPERT Application • Certified Agronomist & Pathology Workstation</p>
        </footer>
      </body>
    </html>
  );
}
