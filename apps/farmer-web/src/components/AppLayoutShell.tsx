'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { BrandHeader, Navigation } from '@farm-seva/shared-ui';

interface AppLayoutShellProps {
  children: React.ReactNode;
}

export function AppLayoutShell({ children }: AppLayoutShellProps) {
  const pathname = usePathname();
  const isStandalonePage = pathname === '/' || pathname === '/portal';

  if (isStandalonePage) {
    return (
      <div className="flex-1 w-full min-h-screen">
        {children}
      </div>
    );
  }

  return (
    <>
      <BrandHeader role="FARMER" />
      <Navigation role="FARMER" currentPath={pathname || '/'} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 sm:py-8 pb-24 sm:pb-8">
        {children}
      </main>

      <footer className="bg-slate-900 text-slate-400 py-6 text-center text-xs border-t border-slate-800 hidden sm:block">
        <p>© 2026 FARM SEVA FARMER Application • Connected to Central REST API</p>
      </footer>
    </>
  );
}
