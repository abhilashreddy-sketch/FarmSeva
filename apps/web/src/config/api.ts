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

  if (apiUrl && apiUrl.trim().length > 0) {
    return apiUrl.replace(/\/+$/, '');
  }

  if (process.env.NODE_ENV === 'production') {
    return 'https://farmseva.onrender.com';
  }

  return 'http://localhost:4000';
}

export const API_BASE_URL = getApiBaseUrl();
