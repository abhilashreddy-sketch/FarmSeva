import crypto from 'crypto';
import { env } from '../../config/env';
import { logAuditEvent } from '../../utils/audit-logger';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96-bit IV recommended for GCM
const TAG_LENGTH = 16; // 128-bit authentication tag

/**
 * Derives a 32-byte key buffer from environment configuration.
 * ENCRYPTION_SECRET must be a 32-byte key or passphrase.
 */
function getEncryptionKey(): Buffer {
  const secret = process.env.ENCRYPTION_SECRET || env.JWT_SECRET || 'farm_seva_default_32byte_secure_encryption_key_2026!';
  return crypto.createHash('sha256').update(secret).digest();
}

export class EncryptionService {
  /**
   * Encrypts plaintext string using AES-256-GCM authenticated encryption.
   * Returns formatted payload: "iv:authTag:encryptedData"
   */
  static encrypt(text: string): string {
    if (!text) return text;
    const iv = crypto.randomBytes(IV_LENGTH);
    const key = getEncryptionKey();
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');

    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  }

  /**
   * Decrypts AES-256-GCM formatted payload ("iv:authTag:encryptedData").
   * Triggers audit log if requested by a user context.
   */
  static decrypt(encryptedPayload: string, requestingUserId?: string): string {
    if (!encryptedPayload || !encryptedPayload.includes(':')) {
      return encryptedPayload;
    }

    try {
      const parts = encryptedPayload.split(':');
      if (parts.length !== 3) return encryptedPayload;

      const [ivHex, tagHex, encryptedText] = parts;
      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(tagHex, 'hex');
      const key = getEncryptionKey();

      const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      if (requestingUserId) {
        logAuditEvent({
          userId: requestingUserId,
          action: 'DECRYPT_SENSITIVE_PAYOUT_DATA',
          entityName: 'BankCredential',
          entityId: 'MASKED_ACCESS',
          changesJson: { accessTimestamp: new Date().toISOString() },
        }).catch(() => {});
      }

      return decrypted;
    } catch (error) {
      console.error('EncryptionService: Decryption failed, returning masked fallback');
      return 'XXXX-XXXX-MASKED';
    }
  }

  /**
   * Safely masks a bank account number for public/seller UI responses.
   * Example: "123456789012" -> "XXXX-XXXX-9012"
   */
  static maskBankAccount(accountNo: string | null | undefined): string {
    if (!accountNo) return 'XXXX-XXXX-0000';
    const plain = accountNo.includes(':') ? EncryptionService.decrypt(accountNo) : accountNo;
    const clean = plain.replace(/\s+/g, '');
    if (clean.length <= 4) return `XXXX-${clean}`;
    const last4 = clean.slice(-4);
    return `XXXX-XXXX-${last4}`;
  }

  /**
   * Safely masks an IFSC code.
   * Example: "SBIN0001234" -> "SBIN0***234"
   */
  static maskIfscCode(ifsc: string | null | undefined): string {
    if (!ifsc) return 'XXXX0000000';
    const plain = ifsc.includes(':') ? EncryptionService.decrypt(ifsc) : ifsc;
    if (plain.length < 5) return 'XXXX***';
    return `${plain.slice(0, 4)}***${plain.slice(-3)}`;
  }
}
