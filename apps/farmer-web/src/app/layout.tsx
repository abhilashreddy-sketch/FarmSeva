import './globals.css';
import React from 'react';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { BrandHeader, Navigation } from '@farm-seva/shared-ui';
import { CropDoctorModal } from '../components/CropDoctorModal';
import { AppLayoutShell } from '../components/AppLayoutShell';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta',
});

export const metadata = {
  title: 'FARM SEVA — Smart Farming, Trusted Marketplace & Expert Support',
  description: "India's Modern AgriTech Platform: Farm Management, AI Crop Diagnostics, Accredited Agronomists & Secured Rural Input Delivery",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`h-full ${plusJakartaSans.variable}`}>
      <body className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased font-sans">
        <AppLayoutShell>
          {children}
        </AppLayoutShell>
        <CropDoctorModal />
      </body>
    </html>
  );
}

