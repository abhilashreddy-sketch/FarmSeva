# 🚜 FARM SEVA — PHASE 7 SECURITY ASSESSMENT REPORT

**Date:** September 12, 2026  
**Target:** FARM SEVA Platform (REST API, Web Frontend, Database Schema, Shared Business Logic)  

---

## 1. Security Domain Assessment Results

### 1.1 IDOR / BOLA Authorization Audit
- **Audit Target:** All sensitive endpoints across `farmer`, `seller`, `expert`, `call-center`, `admin`, `orders`, `addresses`, `cart`, `logistics`, `crop-problems`, and `consultations`.
- **Finding:** Enforced strict ownership validation (`req.user.userId` matching resource owner) across all services. Non-owners receive HTTP 403 `AUTH_OWNERSHIP_DENIED` or `AUTH_FORBIDDEN`.
- **Test Verification:** Tests 9, 12, 21, 24, 27, 38, 39, and 42 explicitly verify BOLA rejection.

### 1.2 Payment & Webhook Security
- **Audit Target:** Razorpay online payment verification (`/api/v1/payments/verify`) and webhook intake (`/api/v1/payments/webhook`).
- **Hardening:**
  - HMAC SHA-256 signatures are evaluated using `crypto.timingSafeEqual` to prevent timing attack side-channels.
  - Payment status updates check ownership (`order.farmer.userId === userId`).
- **Test Verification:** Tests 28 & 29 passed.

### 1.3 Delivery OTP Security & Replay Prevention
- **Audit Target:** Delivery drop-off OTP validation (`/api/v1/logistics/delivery/orders/:id/status`).
- **Hardening:**
  - Delivery OTPs are hashed using `bcrypt` (salt rounds 8).
  - Upon successful delivery drop-off, `deliveryOtpHash` is cleared (`null`).
  - Completed deliveries reject subsequent delivery status modifications with HTTP 400 `INVALID_DELIVERY_STATE`.
- **Test Verification:** Tests 32, 33, and 56 passed.

### 1.4 File / Image Upload Security
- **Audit Target:** Symptom photo uploads for crop problem reports (`/api/v1/farmer/crop-problems/:id/images`).
- **Hardening:**
  - Zod validation enforces MIME type restrictions: `['image/jpeg', 'image/png', 'image/webp', 'image/jpg']`.
  - Max file size capped at 10MB (`10,485,760` bytes).
- **Test Verification:** Test 54 passed (invalid file types rejected with HTTP 400 `VALIDATION_ERROR`).

### 1.5 JWT & Refresh Token Security
- **Audit Target:** Authentication, token generation, refresh rotation, and logout.
- **Hardening:**
  - Access Tokens expire in 15 minutes.
  - Refresh Tokens use single-use rotation (token is revoked upon use, returning a new token pair). Reusing an old refresh token immediately fails with HTTP 401.
  - Revocation hashes stored in database.
  - Production assertion blocks default dev secrets.
- **Test Verification:** Tests 4 & 5 passed.

### 1.6 Sensitive PII & Secret Exposure in Logging
- **Audit Target:** `globalErrorHandler` (`apps/api/src/middleware/error-middleware.ts`).
- **Hardening:**
  - Error messages scrub raw passwords using regex replacement (`password=[REDACTED]`).
  - Stack traces suppressed in production (`NODE_ENV === 'production'`).
- **Test Verification:** Verified via error middleware log inspection.

### 1.7 Dependency & Vulnerability Audit
- **Audit Target:** Package dependencies across monorepo (`npm audit`).
- **Finding:** Clean build with zero critical/high severity vulnerabilities.

### 1.8 Database Concurrency & Race Safeguards
- **Audit Target:** Expert self-assignment (`expert-service.ts`) and stock deduction (`checkout-service.ts`).
- **Hardening:**
  - Expert claim: Prisma transaction with atomic status lock (`OPEN`/`UNDER_REVIEW` -> `EXPERT_ASSIGNED`). Concurrent claim attempt returns HTTP 409 `CASE_ALREADY_ASSIGNED`.
  - Stock decrement: Prisma transaction with atomic stock condition (`stockQuantity: { gte: quantity }`).
- **Test Verification:** Tests 53 & 55 passed.

### 1.9 Realtime Messaging Architecture Verification
- **Audit Target:** Consultation chat messaging.
- **Architecture Note:** Messaging operates strictly via authenticated HTTP REST endpoints (`/api/v1/farmer/consultations/:id/messages`). Realtime messaging relies on client polling / API revalidation. No WebSockets or SSE infrastructure is mounted.

---

## Security Audit Summary Table

| Security Category | Hardening Status | Test Coverage | Result |
| :--- | :--- | :--- | :--- |
| IDOR / BOLA Authorization | Hardened | Tests 9,12,21,24,27,38,39,42 | **PASSED** |
| Payment & Webhook Security | Hardened | Tests 28, 29 | **PASSED** |
| Delivery OTP Replay Protection | Hardened | Tests 32, 33, 56 | **PASSED** |
| File Upload Security | Hardened | Test 54 | **PASSED** |
| JWT & Token Rotation | Hardened | Tests 4, 5 | **PASSED** |
| Log PII / Secret Redaction | Hardened | Verified | **PASSED** |
| Concurrency & Race Locks | Hardened | Tests 53, 55 | **PASSED** |
| API Rate Limiting | Hardened | Test 52 | **PASSED** |

**Final Security Assessment:** **PASSED — PRODUCTION-READY SECURITY POSTURE**
