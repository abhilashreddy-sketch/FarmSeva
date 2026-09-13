# 🚜 FARM SEVA — PHASE 7 IMPLEMENTATION PLAN REPORT

**Phase:** Phase 7 — Security, Performance, Testing & Production Reliability  
**Status:** COMPLETED & VERIFIED  

---

## Technical Hardening Architecture

### 1. Production Secrets & Environment Hardening
- **Target File:** `apps/api/src/config/env.ts`
- **Implementation:** Added runtime environment assertions checking `process.env.NODE_ENV === 'production'`. Throws fatal error if default fallback strings `farm-seva-dev-secret-key...` or `farm-seva-refresh-secret-key...` are detected.

### 2. Rate Limiting Middleware
- **Target File:** `apps/api/src/middleware/rate-limiter-middleware.ts`
- **Mount Point:** `apps/api/src/server.ts`
- **Configuration:**
  - `authLimiter`: 10 requests / 15 minutes per IP on `/api/v1/auth`.
  - `checkoutLimiter`: 15 requests / 15 minutes per IP on `/api/v1/orders/checkout` & `/api/v1/payments`.
  - `globalLimiter`: 100 requests / 15 minutes per IP globally.
  - Test mode dynamic skip condition allows automated test runner execution while enabling explicit rate limit testing in Test 52.

### 3. Concurrency & Race Condition Lock Safeguards
- **Target File:** `apps/api/src/services/expert-service.ts`
  - Encapsulated expert self-assignment inside `prisma.$transaction`.
  - Added atomic check: `where: { id: problemId, status: { in: ['OPEN', 'UNDER_REVIEW', 'SUBMITTED'] } }`.
  - Rejects racing claim attempts with HTTP 409 `CASE_ALREADY_ASSIGNED`.
- **Target File:** `apps/api/src/services/checkout-service.ts`
  - Encapsulated stock deduction inside `prisma.$transaction`.
  - Enforced atomic query condition: `where: { id: variantId, stockQuantity: { gte: item.quantity } }`.
  - Rejects overdraw attempts with HTTP 400 `INSUFFICIENT_STOCK`.

### 4. Delivery OTP Replay Protection & Expiry
- **Target File:** `apps/api/src/services/delivery-service.ts`
  - Verifies `delivery.status !== 'DELIVERED'` before processing delivery status updates.
  - Clears `deliveryOtpHash = null` upon successful completion to prevent OTP replay.

### 5. Payment Signature Timing Safety
- **Target File:** `apps/api/src/services/payment-service.ts`
  - Replaced string equality (`===`) with `crypto.timingSafeEqual` for Razorpay signature verification and webhook signature verification.

### 6. Input Validation & Query Bounds
- **Target File:** `apps/api/src/validations/marketplace-validation.ts`
  - Enforced `limit <= 50` max bound and `page >= 1` min bound on product list queries.
- **Target File:** `apps/api/src/validations/crop-problem-validation.ts`
  - Restricted `fileType` to `['image/jpeg', 'image/png', 'image/webp', 'image/jpg']` and capped `fileSize <= 10MB`.

### 7. Database Index Optimization
- **Target File:** `prisma/schema.prisma`
  - Added `@@index([consultationId, createdAt])` to `ConsultationMessage`.
  - Added `@@index([farmerId, status])` to `CropProblem`.
  - Added `@@index([orderId, deliveryPartnerId])` to `Delivery`.

### 8. Verification & Test Expansion
- **Target File:** `apps/api/src/__tests__/native-runner.ts`
  - Expanded integrated test suite from 51 to 56 tests, adding test cases 52–56 for Phase 7 security verification.
