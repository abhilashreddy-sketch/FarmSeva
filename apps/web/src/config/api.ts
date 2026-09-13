/**
 * 🚜 FARM SEVA — PRODUCTION HARDENED API CONFIGURATION
 * 
 * Centralized API base URL resolver for the frontend application.
 * 
 * Behavior:
 * 1. Development Mode (NODE_ENV !== 'production'):
 *    - Uses NEXT_PUBLIC_API_URL if defined.
 *    - Defaults to 'http://localhost:4000' for seamless local development.
 * 
 * 2. Production Mode (NODE_ENV === 'production'):
 *    - REQUIRES NEXT_PUBLIC_API_URL to be set to a valid non-empty string.
 *    - Throws an actionable error if NEXT_PUBLIC_API_URL is missing.
 *    - Silent fallback to localhost in production is strictly prohibited.
 */

export function getApiBaseUrl(): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const isProduction = process.env.NODE_ENV === 'production';

  if (apiUrl && apiUrl.trim().length > 0) {
    return apiUrl.replace(/\/+$/, '');
  }

  if (isProduction) {
    throw new Error(
      '🚨 [FARM SEVA FATAL CONFIG ERROR] Mandatory environment variable "NEXT_PUBLIC_API_URL" is missing in production!\n' +
      'Production deployment requires NEXT_PUBLIC_API_URL to be set (e.g. NEXT_PUBLIC_API_URL="https://api.your-domain.com").\n' +
      'Silent fallback to http://localhost:4000 is strictly prohibited in production.'
    );
  }

  return 'http://localhost:4000';
}

export const API_BASE_URL = getApiBaseUrl();
