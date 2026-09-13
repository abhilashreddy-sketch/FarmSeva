# 🔒 FARM SEVA — PHASE 10 SECURITY & FINANCIAL AUDIT REPORT

## Executive Summary
Phase 10 introduces the commercial financial engine, revenue split, double-entry accounting ledger, automated seller settlements, refund reversals, and dynamic marketplace controls. Given the financial and security criticality of managing revenue, bank payout accounts, and ledger records, this report documents all security controls, cryptographic implementations, transactional invariants, anti-fraud mechanisms, and validation tests.

---

## 1. Bank Account Cryptographic Protection & Data Privacy

### 1.1 AES-256-GCM Secret Encryption
- **Encryption Primitive:** AES-256-GCM (Galois/Counter Mode) providing authenticated encryption with associated data (AEAD).
- **Key Management:** Encrypted via production `ENCRYPTION_SECRET` (32-byte cryptographic secret loaded strictly from environment configuration).
- **Initialization Vector (IV):** Random 16-byte IV generated per encryption invocation using `crypto.randomBytes(16)`.
- **Authentication Tag:** 16-byte authentication tag generated and stored alongside cipher output (`iv:authTag:encryptedData`).
- **Zero Exposure Guarantee:** Raw bank details (IFSC, Account Number, UPI ID) are encrypted before writing to `SellerSettlement` or `SellerProfile`. Plaintext bank details are NEVER logged, returned in API payloads, stored in Git, or cached.

### 1.2 Credential Masking API Policy
- Payout credentials returned over Seller API endpoints are strictly formatted as masked strings:
  - Account Number: `XXXX-XXXX-1234` (only last 4 digits visible).
  - IFSC Code: `SBIN0XXXXXX` (first 4 characters visible).
  - UPI ID: `f***r@upi` (masked username).
- Unconfigured payout environments return explicit warning state:
  > `"DEMO — NO REAL MONEY TRANSFERRED. Configure real payout gateway credentials in production."`

---

## 2. Double-Entry Accounting Invariants & Ledger Security

### 2.1 Explicit Mathematical Invariant ($\sum \text{Debits} = \sum \text{Credits}$)
- Every financial transaction (Order Payment, Platform Commission, Seller Payable, Refund Reversal, Settlement Payout) MUST balance to zero.
- The `LedgerService.recordDoubleEntry()` method calculates total debits and total credits before persisting:
  $$\sum \text{Debit Amounts} \equiv \sum \text{Credit Amounts}$$
- If debits do not equal credits, the operation immediately aborts, throws `UNBALANCED_LEDGER_TRANSACTION`, and rolls back the database transaction.

### 2.2 Dynamic Balance Derivation (Non-Trusting Balance Rule)
- Account balances are NEVER retrieved from stored column fields or updated via direct increments/decrements.
- Balances are authoritatively computed on demand via SQL aggregations:
  $$\text{Current Available Balance} = \sum \text{Credits} - \sum \text{Debits}$$
- `balanceAfter` stored in ledger records serves solely as a point-in-time immutable audit snapshot.

### 2.3 Immutable Ledger & Reversal Policy
- Ledger entries (`FinancialLedger`) are strictly append-only.
- Direct `UPDATE` or `DELETE` queries on `FinancialLedger` are forbidden in API services.
- Corrective actions or refunds execute exclusively through compensating double-entry reversal journal entries.

---

## 3. Financial Transaction Atomicity & Concurrency Controls

### 3.1 PostgreSQL/SQLite Prisma `$transaction` Wrapping
- Every money-moving operation (Checkout, Refund, Settlement, Reversal) executes inside an isolated database transaction (`prisma.$transaction`).
- If any sub-step (e.g., inventory deduction, order update, ledger debit, ledger credit, seller balance update) fails or throws an exception, the entire transaction is atomically rolled back.

### 3.2 Database-Level Idempotency Protection
- Unique database index enforced on `FinancialLedger.idempotencyKey`.
- Re-transmitting payment webhooks, refund requests, or payout triggers with an existing `idempotencyKey` returns the existing transaction result without duplicating debits or credits.

---

## 4. Promotion, Referral & Anti-Abuse Controls

### 4.1 Coupon Protection
- Single-use and account-limited coupon enforcement validated server-side.
- Minimum order value thresholds, expiration timestamps, and usage limits checked inside `$transaction`.
- Concurrent coupon redemption attempts beyond allowed usage limits fail atomically.

### 4.2 Event-Driven Referral Rewards
- Referral codes linked to authentic verified accounts.
- Referral bonus ledger credit granted strictly after referred user's first delivered order confirmation.

---

## 5. Marketplace Search & Compliance Isolation

### 5.1 Fair Search & Non-Pay-To-Rank Invariant
- Product search ranking algorithm based on transparent parameters:
  1. Exact query relevance match.
  2. Farmer rating / verified review score.
  3. Regional proximity / service area match.
  4. Organic sales volume.
- Zero secret pay-to-rank boosting or hidden seller ad placement injection.

### 5.2 Seller Product Compliance Isolation
- Sellers can edit inventory, pricing, images, and description.
- Government compliance certifications (`isFertilizerLicensed`, `isInsecticideLicensed`, `cibrcRegistrationNumber`) remain strictly read-only for sellers and controllable solely by Admin role.

---

## 6. Verification & Automated Test Coverage
- **150 / 150 Native Integration Tests Passing** (0 Failures).
- **Concurrency & Financial Invariant Tests:**
  - Double-entry balance invariant validation (`TEST 111-115`).
  - Concurrent refund & webhook idempotency (`TEST 120-125`).
  - Idempotent settlement execution (`TEST 130-135`).
  - AES-256-GCM bank detail encryption and account masking (`TEST 140-145`).
