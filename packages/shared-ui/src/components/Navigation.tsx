import React from 'react';
import { ApplicationRole } from '../tokens';
import {
  ShoppingBag,
  Sprout,
  Stethoscope,
  Truck,
  LayoutDashboard,
  Package,
  FileText,
  UserCheck,
  Settings,
  Home,
  Navigation as NavIcon,
} from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  active?: boolean;
}

export interface NavigationProps {
  role: ApplicationRole;
  currentPath?: string;
  items?: NavItem[];
}

export const Navigation: React.FC<NavigationProps> = ({ role, currentPath = '/', items }) => {
  const getDefaultItems = (): NavItem[] => {
    switch (role) {
      case 'FARMER':
        return [
          { label: 'Home', href: '/', icon: <Home className="w-5 h-5" />, active: currentPath === '/' },
          { label: 'Market', href: '/dashboard', icon: <ShoppingBag className="w-5 h-5" />, active: currentPath.includes('/dashboard') },
          { label: 'Crop Care', href: '/dashboard', icon: <Sprout className="w-5 h-5" />, active: currentPath.includes('/crop') },
        ];
      case 'SELLER':
        return [
          { label: 'Console', href: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" />, active: currentPath === '/dashboard' },
          { label: 'Products', href: '/dashboard', icon: <Package className="w-5 h-5" />, active: currentPath.includes('/products') },
          { label: 'Orders', href: '/dashboard', icon: <FileText className="w-5 h-5" />, active: currentPath.includes('/orders') },
        ];
      case 'EXPERT':
        return [
          { label: 'Workstation', href: '/dashboard', icon: <Stethoscope className="w-5 h-5" />, active: currentPath === '/dashboard' },
          { label: 'Advisories', href: '/dashboard', icon: <FileText className="w-5 h-5" />, active: currentPath.includes('/advisory') },
        ];
      case 'DELIVERY':
        return [
          { label: 'Deliveries', href: '/dashboard', icon: <Truck className="w-5 h-5" />, active: currentPath === '/dashboard' },
          { label: 'Navigation', href: '/dashboard', icon: <NavIcon className="w-5 h-5" />, active: currentPath.includes('/route') },
        ];
      case 'ADMIN':
        return [
          { label: 'Control Desk', href: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" />, active: currentPath === '/dashboard' },
          { label: 'KYC Moderation', href: '/dashboard', icon: <UserCheck className="w-5 h-5" />, active: currentPath.includes('/kyc') },
          { label: 'Settings', href: '/dashboard', icon: <Settings className="w-5 h-5" />, active: currentPath.includes('/settings') },
        ];
    }
  };

  const navItems = items || getDefaultItems();

  // Mobile Bottom Bar for Farmer & Delivery
  if (role === 'FARMER' || role === 'DELIVERY') {
    return (
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 px-4 py-2 sm:hidden shadow-lg">
        <div className="flex items-center justify-around">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center gap-1 text-[11px] font-bold py-1 px-3 rounded-xl transition ${
                item.active ? 'text-emerald-700 bg-emerald-50' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </a>
          ))}
        </div>
      </nav>
    );
  }

  // Desktop / Tablet Top Navigation Bar
  return (
    <nav className="bg-white border-b border-slate-200 px-4 py-2 hidden sm:block">
      <div className="max-w-7xl mx-auto flex items-center gap-2">
        {navItems.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className={`flex items-center gap-2 text-xs font-bold px-3.5 py-2 rounded-xl transition ${
              item.active
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </a>
        ))}
      </div>
    </nav>
  );
};
