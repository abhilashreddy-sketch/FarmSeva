# 🚜 FARM SEVA — PHASE 10 IMPLEMENTATION PLAN
## STRENGTHENED DOUBLE-ENTRY FINANCIAL ENGINE, CONCURRENCY, RECONCILIATION & MARKETPLACE SCALE

---

## 1. Implementation Order & Architecture Flow

Phase 10 will be implemented in strict linear order:

```
PHASE 10 IMPLEMENTATION PIPELINE:

1. Database Schema Hardening (Prisma constraints, unique indexes, idempotency keys)
   ↓
2. Encryption Service (32-byte AES-256-GCM authenticated secret management & masking)
   ↓
3. Double-Entry Ledger Engine (Append-only paired DEBIT=CREDIT accounting)
   ↓
4. Commission Engine (Server-side gross/commission/net calculations)
   ↓
5. Refund & Reversal Engine (Idempotent refund processing & ledger reversals)
   ↓
6. Settlement Engine (Dynamic hold days, locked payout batches & DEMO badging)
   ↓
7. Reconciliation Service (Cross-system discrepancy detection & audit reports)
   ↓
8. Seller Analytics (Gross GMV, net earnings, payout history dashboard)
   ↓
9. Promotions & Referrals (Strict anti-abuse coupon validation & referral events)
   ↓
10. Farmer Loyalty & Reorder ("Buy Again" reorder & favorites system)
   ↓
11. Admin Business Command Center (Revenue metrics, date filters & CSV exports)
   ↓
12. 150+ Comprehensive Tests & Phase 1–9 Full Regression Execution
```

---

## 2. Comprehensive Database Schema (`prisma/schema.prisma`)

```prisma
// Configurable Business Parameters
model BusinessSetting {
  id                         String   @id @default("default")
  platformCommissionPercent Decimal  @default(5.0)
  fixedTransactionFee        Decimal  @default(10.0)
  deliveryFeeDefault         Decimal  @default(50.0)
  minOrderValueForFreeDelivery Decimal @default(1000.0)
  sellerSettlementDays       Int      @default(7)
  cancellationWindowHours    Int      @default(24)
  updatedAt                  DateTime @updatedAt
}

// Order-Level Commission Calculation
model SellerCommission {
  id                 String   @id @default(uuid())
  orderId            String   @unique
  sellerId           String
  grossAmount        Decimal
  commissionPercent  Decimal
  commissionAmount   Decimal
  fixedFeeAmount     Decimal  @default(0.0)
  netSellerAmount    Decimal
  status             String   @default("PENDING") // PENDING, ELIGIBLE, PROCESSING, PAID, CANCELLED, REVERSED
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt
}

// Locked Seller Payout Batches
model SellerSettlement {
  id                 String   @id @default(uuid())
  sellerId           String
  settlementRef      String   @unique
  totalGross         Decimal
  totalCommission    Decimal
  totalNetPayout     Decimal
  status             String   @default("PENDING") // PENDING, ELIGIBLE, PROCESSING, PAID, FAILED, DEMO
  payoutProvider     String   @default("DEMO")    // DEMO, RAZORPAY_X, BANK_TRANSFER
  idempotencyKey     String   @unique
  eligibleAt         DateTime
  paidAt             DateTime?
  rejectionReason    String?
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  ledgerEntries      FinancialLedger[]
}

// Immutable True Double-Entry Financial Ledger
model FinancialLedger {
  id                 String   @id @default(uuid())
  transactionId      String   // Groups balanced DEBIT and CREDIT entries for a single operation
  idempotencyKey     String   @unique
  accountType        String   // SELLER_PAYABLE, PLATFORM_COMMISSION, CUSTOMER_PAYMENT, ESCROW, DISCOUNTS
  direction          String   // DEBIT, CREDIT
  currency           String   @default("INR")
  amount             Decimal
  orderId            String?
  sellerId           String?
  settlementId       String?
  settlement         SellerSettlement? @relation(fields: [settlementId], references: [id])
  parentEntryId      String?  // References original entry during reversal
  snapshotBalance    Decimal  @default(0.0) // Non-authoritative snapshot
  description        String
  createdAt          DateTime @default(now())

  @@index([transactionId])
  @@index([sellerId])
  @@index([orderId])
  @@index([accountType])
}

// Strict Anti-Abuse Promotions & Coupons
model Promotion {
  id                 String    @id @default(uuid())
  code               String    @unique
  description        String
  discountType       String    @default("PERCENTAGE") // PERCENTAGE, FIXED
  discountValue      Decimal
  minOrderAmount     Decimal   @default(0.0)
  maxDiscountAmount  Decimal?
  applicableSellerId String?
  applicableCategoryId String?
  firstOrderOnly     Boolean   @default(false)
  userUsageLimit     Int       @default(1)
  totalUsageLimit    Int       @default(1000)
  usedCount          Int       @default(0)
  validFrom          DateTime  @default(now())
  validUntil         DateTime?
  isActive           Boolean   @default(true)
  createdAt          DateTime  @default(now())
}

// Event-Driven Referral Lifecycle
model Referral {
  id                 String   @id @default(uuid())
  referrerUserId     String
  refereeUserId      String   @unique
  referralCode       String
  qualifyingOrderId  String?
  status             String   @default("PENDING") // PENDING, ORDER_QUALIFIED, REWARD_GRANTED, REVERSED
  rewardAmount       Decimal  @default(50.0)
  grantedAt          DateTime?
  reversedAt         DateTime?
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt
}

// Farmer Favorites
model FarmerFavorite {
  id                 String   @id @default(uuid())
  farmerId           String
  favoriteType       String   // PRODUCT, SELLER
  targetId           String
  createdAt          DateTime @default(now())

  @@unique([farmerId, favoriteType, targetId])
}

// Protected Seller Service Areas
model SellerServiceArea {
  id                 String   @id @default(uuid())
  sellerId           String
  district           String
  state              String
  pincode            String?
  isSupported        Boolean  @default(true)
  createdAt          DateTime @default(now())

  @@index([sellerId])
  @@index([district, state])
}
```

---

## 3. Decoupled Financial Service Architecture (`apps/api/src/services/financial/`)

1. **`encryption-service.ts`:** Production-grade 32-byte AES-256-GCM authenticated encryption/decryption using `ENCRYPTION_SECRET`. Never logs plaintext keys or values; provides `maskBankAccount`.
2. **`ledger-service.ts`:** Manages true double-entry journal records (`recordDoubleEntry`). Verifies $\sum \text{Debits} = \sum \text{Credits}$ before committing. Computes authoritative dynamic balances on-the-fly (`SUM(Credits) - SUM(Debits)`).
3. **`commission-service.ts`:** Calculates server-side commissions upon order placement/delivery and creates paired double-entry ledger records.
4. **`refund-service.ts`:** Idempotent refund engine generating explicit reversal double-entry ledger records and updating order/referral statuses.
5. **`settlement-service.ts`:** Executes idempotent settlement batching using dynamic `BusinessSetting.sellerSettlementDays`. Flags unconfigured payout gateways as `"DEMO — NO REAL MONEY TRANSFERRED"`.
6. **`reconciliation-service.ts`:** Runs automated financial reconciliation across Gateway Payments, Financial Ledger, Settlements, and Payout Providers (`GET /api/v1/admin/financial/reconciliation`).

---

## 4. Financial Invariant & Concurrency Testing Plan

The native test suite (`apps/api/src/__tests__/native-runner.ts`) will be expanded to 150+ tests including specific concurrency and invariant assertions:
- **Concurrent Checkouts:** Multiple simultaneous purchases against single stock.
- **Duplicate Payment Webhooks:** Multiple identical payment webhooks with same idempotency key.
- **Duplicate Refund Requests:** Concurrent refund requests for single order.
- **Simultaneous Settlement Execution:** Race condition check on settlement batching.
- **Concurrent Coupon Redemption:** Simultaneous checkout using last available coupon code.
- **Financial Balance Invariant Check:** Assertion verifying $\sum \text{Debits} = \sum \text{Credits}$ across the global ledger table at the end of the test suite.

---

## 5. Phase 10 Acceptance Criteria Checklist

- [ ] **150+ Total Tests Passing, 0 Failing.**
- [ ] **All previous 110 tests continue passing without modification or deletion.**
- [ ] **Append-only ledger enforcing $\sum \text{Debits} = \sum \text{Credits}$ for every transaction.**
- [ ] **Authoritative balance calculated dynamically from ledger entries, never from `balanceAfter`.**
- [ ] **Refunds and payment reversals are idempotent and generate explicit reversal entries.**
- [ ] **Settlements lock atomically to prevent duplicate payouts.**
- [ ] **Seller bank details encrypted via AES-256-GCM and displayed masked (`XXXX-XXXX-1234`).**
- [ ] **Seller payout mode explicitly reported as `"DEMO — NO REAL MONEY TRANSFERRED"`.**
- [ ] **Product compliance data remains 100% read-only for sellers.**
- [ ] **All financial calculations occur strictly on the backend.**
