# 🔒 FARM SEVA — PHASE 11 SECURITY & PRIVACY HARDENING REPORT

## Executive Summary
This report details the end-to-end security architecture, cryptographic protections, RBAC enforcement, horizontal privilege escalation prevention, data privacy controls, and security audit results across FARM SEVA.

---

## 1. Authentication & Session Security

- **Password Hashing:** Bcrypt with 12 salt rounds (`BCRYPT_SALT_ROUNDS=12`).
- **JWT Protection:** Access tokens signed with HS256, 15-minute expiration (`JWT_EXPIRES_IN=15m`).
- **Refresh Token Rotation:** Refresh tokens expire in 7 days (`7d`) and are stored in database with single-use rotation. Reused refresh tokens immediately revoke all sessions for that account.
- **Rate Limiting:** Auth endpoints enforce 10 requests per 15-minute window (`authLimiter`), returning `429 Too Many Requests` on violation.

---

## 2. Authorization & Horizontal Privilege Escalation Prevention

- **Strict RBAC Middleware (`role-middleware.ts`):** 6 User Roles enforced across all endpoints (`FARMER`, `SELLER`, `AGRICULTURAL_EXPERT`, `DELIVERY_PARTNER`, `CALL_CENTER_AGENT`, `ADMIN`).
- **Ownership Verification Checks:** Every sensitive resource request verifies that the authenticated user owns the target record:
  - Farmer A cannot access Farmer B's farms, fields, crops, cart, addresses, orders, or consultations (403 `AUTH_OWNERSHIP_DENIED`).
  - Seller A cannot view Seller B's inventory, earnings, or payout credentials (403 `AUTH_OWNERSHIP_DENIED`).
  - Unassigned Expert B cannot access Farmer A's consultation or diagnostic chat (403 `AUTH_OWNERSHIP_DENIED`).

---

## 3. Financial & Sensitive Data Cryptography

- **AES-256-GCM Bank Encryption (`EncryptionService`):** Plaintext bank account numbers, IFSC codes, and UPI IDs are encrypted using a 32-byte production `ENCRYPTION_SECRET`.
- **API Credential Masking:** Payout accounts returned via API are formatted as `XXXX-XXXX-1234`. Plaintext details are NEVER logged or cached.
- **Double-Entry Accounting Invariant:** Financial ledger enforces $\sum \text{Debits} = \sum \text{Credits}$. Balances are dynamically derived. Append-only ledger policy prevents direct edits.

---

## 4. Input Validation & File Upload Hardening

- **Zod Schema Validation:** All request payloads strictly validated server-side.
- **File Upload Restrictions:** Uploads restricted to `image/jpeg`, `image/png`, `image/webp`. Executable extensions and path traversal sequences (`../`) rejected. Max size 5MB.
