/**
 * FARM SEVA Portal Routing & Destination Configuration
 * 
 * Provides centralized environment-aware URLs for all 5 FARM SEVA role applications.
 * In development, provides localhost fallbacks.
 * In production, strictly requires NEXT_PUBLIC_*_URL environment variables.
 * Does NOT hardcode non-existent production domains or silently redirect to localhost in production.
 */

export interface PortalDestination {
  role: 'FARMER' | 'SELLER' | 'AGRICULTURAL_EXPERT' | 'DELIVERY_PARTNER' | 'ADMIN';
  envVar: string;
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
    envVar: 'N/A (Current Application)',
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
    envVar: 'NEXT_PUBLIC_SELLER_URL',
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
    envVar: 'NEXT_PUBLIC_EXPERT_URL',
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
    envVar: 'NEXT_PUBLIC_DELIVERY_URL',
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
    envVar: 'NEXT_PUBLIC_ADMIN_URL',
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
 * Determines whether the current runtime environment is explicitly local development.
 * In production builds, this returns false so production users are never redirected to localhost.
 */
export function isLocalDevelopment(): boolean {
  if (process.env.NODE_ENV === 'development') {
    return true;
  }
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const isLocalhostHost = hostname === 'localhost' || hostname === '127.0.0.1';
    // Only allow localhost fallback if NOT running in production mode
    if (process.env.NODE_ENV !== 'production' && isLocalhostHost) {
      return true;
    }
  }
  return false;
}

/**
 * Resolves the base URL for a given portal.
 * Returns the configured environment variable if set.
 * Falls back to localhost ONLY in explicit local development.
 * In production without environment variables, returns null (NOT localhost, NOT fake domains).
 */
export function getPortalBaseUrl(role: PortalDestination['role']): string | null {
  if (role === 'FARMER') {
    // Farmer portal is embedded in the current farmer-web Next.js app
    return '';
  }

  const isDev = isLocalDevelopment();

  switch (role) {
    case 'SELLER':
      return process.env.NEXT_PUBLIC_SELLER_URL || (isDev ? 'http://localhost:3001' : null);
    case 'AGRICULTURAL_EXPERT':
      return process.env.NEXT_PUBLIC_EXPERT_URL || (isDev ? 'http://localhost:3002' : null);
    case 'DELIVERY_PARTNER':
      return process.env.NEXT_PUBLIC_DELIVERY_URL || (isDev ? 'http://localhost:3003' : null);
    case 'ADMIN':
      return process.env.NEXT_PUBLIC_ADMIN_URL || (isDev ? 'http://localhost:3004' : null);
  }
}

/**
 * Checks if the target portal URL is configured and available to launch.
 */
export function isPortalConfigured(role: PortalDestination['role']): boolean {
  if (role === 'FARMER') return true;
  return Boolean(getPortalBaseUrl(role));
}

/**
 * Builds the complete destination launch URL, or returns null if not configured in production.
 */
export function buildPortalLaunchUrl(role: PortalDestination['role'], token?: string | null): string | null {
  if (role === 'FARMER') {
    return '/dashboard';
  }

  const base = getPortalBaseUrl(role);
  if (!base) {
    return null;
  }

  const target = `${base}/dashboard`;
  if (token) {
    return `${target}?token=${encodeURIComponent(token)}`;
  }
  return target;
}
