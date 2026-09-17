'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sprout,
  Store,
  Stethoscope,
  Truck,
  ShieldCheck,
  ArrowRight,
  LogOut,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { getAuthToken, removeAuthToken } from '../../lib/api-client';
import { PORTAL_DEFINITIONS, buildPortalLaunchUrl, isPortalConfigured, PortalDestination } from '../../config/portal';

export default function PortalSelectionPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const activeToken = getAuthToken();
    if (!activeToken) {
      router.push('/login');
      return;
    }

    setToken(activeToken);

    // Retrieve cached user profile
    if (typeof window !== 'undefined') {
      try {
        const storedUser = localStorage.getItem('farm_seva_user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (e) {
        console.error('Failed to parse cached user:', e);
      }
    }

    setIsLoading(false);
  }, [router]);

  const handleSignOut = () => {
    removeAuthToken();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('farm_seva_user');
    }
    router.push('/login');
  };

  const handlePortalLaunch = (dest: PortalDestination) => {
    const url = buildPortalLaunchUrl(dest.role, token);
    if (!url) {
      alert(`The portal URL for ${dest.name} is not configured yet in this environment (${dest.envVar}).`);
      return;
    }
    if (dest.role === 'FARMER') {
      router.push(url);
    } else {
      window.location.href = url;
    }
  };

  const isRoleAuthorized = (role: PortalDestination['role']) => {
    if (!user) return true; // Default allow launch attempts protected by backend RBAC
    if (user.role === 'ADMIN') return true; // Platform administrators have multi-console access
    return user.role === role;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fafaf9] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-emerald-700 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Loading FARM SEVA Ecosystem...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafaf9] text-stone-900 flex flex-col font-sans">
      
      {/* Top Console Navigation Bar */}
      <header className="bg-[#063828] text-white border-b border-emerald-800/60 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 text-emerald-950 flex items-center justify-center font-black text-xl shadow-md">
              <Sprout className="w-6 h-6 text-emerald-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg sm:text-xl tracking-tight text-white">FARM SEVA</span>
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-800/80 text-emerald-200 border border-emerald-600/50 px-2 py-0.5 rounded-full">
                  Portal Console
                </span>
              </div>
              <p className="text-[11px] text-emerald-200/80 hidden sm:block">Intelligent Agricultural Ecosystem</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {user && (
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-bold text-white">{user.fullName || user.phone || 'Authenticated User'}</span>
                <span className="text-[10px] font-semibold text-emerald-300 uppercase tracking-wider">
                  Role: {user.role || 'USER'}
                </span>
              </div>
            )}
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-100 hover:text-white bg-emerald-900/60 hover:bg-emerald-800/80 border border-emerald-700/60 transition"
              title="Sign Out of Session"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Experience Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
        
        {/* Header Section */}
        <div className="text-center max-w-2xl mx-auto space-y-3 animate-fadeIn">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-100/80 text-emerald-900 border border-emerald-200">
            <span>🌾 Connected AgriTech Architecture</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
            Welcome to FARM SEVA
          </h1>
          <p className="text-sm sm:text-base text-slate-600 font-medium">
            Choose the FARM SEVA experience you want to continue with.
          </p>
        </div>

        {/* 5 Portal Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {PORTAL_DEFINITIONS.map((portal) => {
            const authorized = isRoleAuthorized(portal.role);
            const configured = isPortalConfigured(portal.role);
            const isUserPrimaryRole = user?.role === portal.role;
            const isAdminBypass = user?.role === 'ADMIN' && portal.role !== 'ADMIN';

            return (
              <div
                key={portal.role}
                className={`bg-white rounded-3xl p-6 sm:p-8 border transition-all duration-300 flex flex-col justify-between shadow-xs hover:shadow-xl ${portal.theme.border} ${
                  isUserPrimaryRole
                    ? 'ring-2 ring-emerald-600/40 border-emerald-500/60'
                    : 'border-slate-200/90'
                }`}
              >
                <div className="space-y-5">
                  {/* Top Badge & Icon */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-stone-100 flex items-center justify-center text-3xl shadow-inner shrink-0">
                      {portal.icon}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${portal.theme.badgeBg} ${portal.theme.badgeText}`}>
                        {portal.badge}
                      </span>
                      {isUserPrimaryRole && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Primary Account
                        </span>
                      )}
                      {isAdminBypass && (
                        <span className="text-[10px] font-semibold text-slate-500">
                          Admin Management
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title & Tagline */}
                  <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">
                      {portal.name}
                    </h2>
                    <p className="text-xs font-bold text-slate-500 mt-0.5">
                      {portal.tagline}
                    </p>
                  </div>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {portal.description}
                  </p>
                </div>

                {/* Card Action Button */}
                <div className="pt-6 mt-6 border-t border-slate-100">
                  {authorized ? (
                    configured ? (
                      <button
                        onClick={() => handlePortalLaunch(portal)}
                        className={`w-full py-3.5 px-5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm ${portal.theme.primary}`}
                      >
                        <span>Continue to {portal.role === 'ADMIN' ? 'Console' : 'Portal'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs space-y-1">
                        <div className="flex items-center justify-between font-bold">
                          <span className="flex items-center gap-1.5 text-[11px] text-amber-800">
                            <span>⚠️</span> Portal Not Configured Yet
                          </span>
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-100 text-amber-900">
                            Pending URL
                          </span>
                        </div>
                        <p className="text-[10px] text-amber-700/90 leading-tight">
                          Live deployment URL ({portal.envVar}) is not configured in this environment.
                        </p>
                      </div>
                    )
                  ) : (
                    <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-slate-500 text-xs">
                      <div className="flex items-center gap-2">
                        <Lock className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-semibold text-[11px]">Requires {portal.role} account</span>
                      </div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Restricted</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Security & RBAC Disclaimer */}
        <div className="p-6 rounded-3xl bg-emerald-950 text-emerald-200/90 text-center space-y-2 border border-emerald-900 shadow-sm max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-2 font-bold text-xs text-white">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Production Role-Based Access Control (RBAC) Governed</span>
          </div>
          <p className="text-[11px] text-emerald-300/80 leading-relaxed max-w-2xl mx-auto">
            All portal sessions are signed with central cryptographic tokens. Backend access control rigorously verifies role permissions on every API request.
          </p>
        </div>

      </main>

      {/* Console Footer */}
      <footer className="bg-slate-900 text-slate-400 py-6 border-t border-slate-800 text-center text-xs">
        <p>© 2026 FARM SEVA • Intelligent Agricultural Platform • Central REST API</p>
      </footer>

    </div>
  );
}
