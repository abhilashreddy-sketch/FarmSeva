/**
 * FARM SEVA Portal Routing & Destination Configuration
 * 
 * Provides centralized environment-aware URLs for all 5 FARM SEVA role applications.
 * Handles both local development ports and production domains.
 */

export interface PortalDestination {
  role: 'FARMER' | 'SELLER' | 'AGRICULTURAL_EXPERT' | 'DELIVERY_PARTNER' | 'ADMIN';
  name: string;
  badge: string;
  tagline: string;
  description: string;
  icon: string;
  theme: {
    primary: string;
    badgeBg: string;
    badgeText: string;
    border: string;
    glow: string;
  };
}

export const PORTAL_DEFINITIONS: PortalDestination[] = [
  {
    role: 'FARMER',
    name: 'FARMER',
    badge: 'Cultivation & Market',
    tagline: 'Farm Management & Agri-Inputs',
    description: 'Manage your farm, crops, agricultural needs and purchases.',
    icon: '🌾',
    theme: {
      primary: 'bg-emerald-700 hover:bg-emerald-800 text-white',
      badgeBg: 'bg-emerald-50 border-emerald-200',
      badgeText: 'text-emerald-800',
      border: 'hover:border-emerald-500',
      glow: 'hover:shadow-emerald-900/10',
    },
  },
  {
    role: 'SELLER',
    name: 'SELLER',
    badge: 'Merchant Console',
    tagline: 'Agricultural Input Retail',
    description: 'Manage products, inventory, listings and farmer orders.',
    icon: '🏪',
    theme: {
      primary: 'bg-amber-700 hover:bg-amber-800 text-white',
      badgeBg: 'bg-amber-50 border-amber-200',
      badgeText: 'text-amber-800',
      border: 'hover:border-amber-500',
      glow: 'hover:shadow-amber-900/10',
    },
  },
  {
    role: 'AGRICULTURAL_EXPERT',
    name: 'AGRICULTURAL EXPERT',
    badge: 'Agronomy Workstation',
    tagline: 'Pathology & Scientific Guidance',
    description: 'Manage crop-support cases and assist farmers.',
    icon: '🔬',
    theme: {
      primary: 'bg-sky-700 hover:bg-sky-800 text-white',
      badgeBg: 'bg-sky-50 border-sky-200',
      badgeText: 'text-sky-800',
      border: 'hover:border-sky-500',
      glow: 'hover:shadow-sky-900/10',
    },
  },
  {
    role: 'DELIVERY_PARTNER',
    name: 'DELIVERY PARTNER',
    badge: 'Fulfillment Logistics',
    tagline: 'Last-Mile Transport & Dispatch',
    description: 'Manage assigned deliveries and fulfillment.',
    icon: '🚚',
    theme: {
      primary: 'bg-purple-700 hover:bg-purple-800 text-white',
      badgeBg: 'bg-purple-50 border-purple-200',
      badgeText: 'text-purple-800',
      border: 'hover:border-purple-500',
      glow: 'hover:shadow-purple-900/10',
    },
  },
  {
    role: 'ADMIN',
    name: 'ADMIN / OPERATIONS',
    badge: 'Platform Operations',
    tagline: 'Governance, KYC & Marketplace',
    description: 'Manage platform operations, marketplace and users.',
    icon: '🛡️',
    theme: {
      primary: 'bg-slate-900 hover:bg-slate-800 text-white',
      badgeBg: 'bg-slate-100 border-slate-300',
      badgeText: 'text-slate-800',
      border: 'hover:border-slate-500',
      glow: 'hover:shadow-slate-900/10',
    },
  },
];

/**
 * Resolves the base URL for a given portal based on environment and hosting setup.
 */
export function getPortalBaseUrl(role: PortalDestination['role']): string {
  const isBrowser = typeof window !== 'undefined';
  const isLocalhost = isBrowser && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  switch (role) {
    case 'FARMER':
      // Farmer portal is embedded in the current farmer-web application
      return '';
    case 'SELLER':
      return process.env.NEXT_PUBLIC_SELLER_URL || (isLocalhost ? 'http://localhost:3001' : 'https://seller.farmseva.com');
    case 'AGRICULTURAL_EXPERT':
      return process.env.NEXT_PUBLIC_EXPERT_URL || (isLocalhost ? 'http://localhost:3002' : 'https://expert.farmseva.com');
    case 'DELIVERY_PARTNER':
      return process.env.NEXT_PUBLIC_DELIVERY_URL || (isLocalhost ? 'http://localhost:3003' : 'https://delivery.farmseva.com');
    case 'ADMIN':
      return process.env.NEXT_PUBLIC_ADMIN_URL || (isLocalhost ? 'http://localhost:3004' : 'https://admin.farmseva.com');
  }
}

/**
 * Builds the complete destination launch URL, appending session token for cross-origin SSO handoff.
 */
export function buildPortalLaunchUrl(role: PortalDestination['role'], token?: string | null): string {
  if (role === 'FARMER') {
    return '/dashboard';
  }

  const base = getPortalBaseUrl(role);
  const target = `${base}/dashboard`;
  if (token) {
    return `${target}?token=${encodeURIComponent(token)}`;
  }
  return target;
}
