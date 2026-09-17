/**
 * Centralized identity normalization utilities for FARM SEVA.
 * Ensures consistent canonical formatting across registration, login, OTP, and account linking.
 */

export class IdentityValidationError extends Error {
  statusCode: number;
  code: string;

  constructor(code: string, message: string, statusCode = 400) {
    super(message);
    this.name = 'IdentityValidationError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

/**
 * Normalizes Indian phone numbers to canonical 10-digit format.
 * Safely handles:
 * - 9876543210
 * - +919876543210
 * - +91 9876543210
 * - +91-9876543210
 * - 09876543210
 * Validates that the 10-digit number starts with 6, 7, 8, or 9.
 */
export function normalizeIndianPhone(input: unknown): string {
  if (typeof input !== 'string' || !input.trim()) {
    throw new IdentityValidationError(
      'INVALID_PHONE',
      'Please enter a valid 10-digit Indian mobile number'
    );
  }

  // Strip whitespace, hyphens, parentheses, plus signs
  const cleaned = input.trim().replace(/[\s\-\(\)\+]/g, '');

  let tenDigit = cleaned;
  if (cleaned.startsWith('91') && cleaned.length === 12) {
    tenDigit = cleaned.slice(2);
  } else if (cleaned.startsWith('0') && cleaned.length === 11) {
    tenDigit = cleaned.slice(1);
  }

  if (!/^[6-9]\d{9}$/.test(tenDigit)) {
    throw new IdentityValidationError(
      'INVALID_PHONE',
      'Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9'
    );
  }

  return tenDigit;
}

/**
 * Normalizes email address by trimming whitespace and converting to lowercase.
 * Returns null if input is null, undefined, or empty string.
 */
export function normalizeEmail(input?: unknown): string | null {
  if (typeof input !== 'string') return null;
  const trimmed = input.trim().toLowerCase();
  return trimmed.length > 0 ? trimmed : null;
}

/**
 * Normalizes any login identifier (email or phone).
 * If it contains '@', normalizes as email.
 * Otherwise attempts Indian phone normalization.
 */
export function normalizeLoginIdentifier(input: unknown): {
  type: 'PHONE' | 'EMAIL';
  normalized: string;
} {
  if (typeof input !== 'string' || !input.trim()) {
    throw new IdentityValidationError(
      'INVALID_IDENTIFIER',
      'Phone number or email is required'
    );
  }

  const trimmed = input.trim();
  if (trimmed.includes('@')) {
    const email = normalizeEmail(trimmed);
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new IdentityValidationError('INVALID_EMAIL', 'Invalid email address format');
    }
    return { type: 'EMAIL', normalized: email };
  }

  const phone = normalizeIndianPhone(trimmed);
  return { type: 'PHONE', normalized: phone };
}
