import React from 'react';
import { Sprout, Store, Stethoscope, Truck, ShieldCheck } from 'lucide-react';
import { ApplicationRole, DESIGN_TOKENS } from '../tokens';

export interface BrandHeaderProps {
  role: ApplicationRole;
  currentPath?: string;
  onLogout?: () => void;
  userEmail?: string;
  userName?: string;
}

export const BrandHeader: React.FC<BrandHeaderProps> = ({
  role,
  currentPath = '/',
  onLogout,
  userEmail,
  userName,
}) => {
  const roleConfig = DESIGN_TOKENS.roles[role.toLowerCase() as keyof typeof DESIGN_TOKENS.roles];

  const renderRoleIcon = () => {
    switch (role) {
      case 'FARMER':
        return <Sprout className="w-6 h-6 text-emerald-400" aria-hidden="true" />;
      case 'SELLER':
        return <Store className="w-6 h-6 text-amber-400" aria-hidden="true" />;
      case 'EXPERT':
        return <Stethoscope className="w-6 h-6 text-sky-400" aria-hidden="true" />;
      case 'DELIVERY':
        return <Truck className="w-6 h-6 text-purple-400" aria-hidden="true" />;
      case 'ADMIN':
        return <ShieldCheck className="w-6 h-6 text-amber-400" aria-hidden="true" />;
    }
  };

  const getHeaderBg = () => {
    switch (role) {
      case 'FARMER':
        return 'bg-emerald-900 border-b border-emerald-800 text-white';
      case 'SELLER':
        return 'bg-amber-900 border-b border-amber-800 text-white';
      case 'EXPERT':
        return 'bg-sky-950 border-b border-sky-800 text-white';
      case 'DELIVERY':
        return 'bg-purple-950 border-b border-purple-800 text-white';
      case 'ADMIN':
        return 'bg-slate-900 border-b border-slate-800 text-white';
    }
  };

  return (
    <header className={`sticky top-0 z-50 shadow-sm ${getHeaderBg()}`}>
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <a href="/" className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-amber-400 rounded-lg p-1">
          <div className="p-2 rounded-xl bg-white/10 backdrop-blur-sm group-hover:bg-white/20 transition-all">
            {renderRoleIcon()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-lg tracking-tight">{roleConfig.name}</span>
              <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-white/10 border border-white/20">
                {roleConfig.role}
              </span>
            </div>
            <p className="text-xs text-white/70 font-medium hidden sm:block">
              FARM SEVA Platform • {roleConfig.navLabel}
            </p>
          </div>
        </a>

        <div className="flex items-center gap-3">
          {userName || userEmail ? (
            <div className="text-right text-xs">
              <p className="font-bold text-white">{userName || 'Authenticated User'}</p>
              <p className="text-white/70 text-[11px] truncate max-w-[150px]">{userEmail}</p>
            </div>
          ) : null}

          {onLogout ? (
            <button
              onClick={onLogout}
              className="min-h-[44px] min-w-[44px] px-3.5 py-2 text-xs font-bold bg-white/10 hover:bg-white/20 rounded-xl transition text-white focus:outline-none focus:ring-2 focus:ring-amber-400 flex items-center justify-center"
              aria-label="Sign Out"
            >
              Sign Out
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
};
