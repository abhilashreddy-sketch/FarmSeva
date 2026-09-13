# 💳 FARM SEVA — PHASE 11 PAYMENT OPERATIONS & RECONCILIATION RUNBOOK

## Executive Summary
This document details payment processing workflows, Razorpay webhook signature verification, payment state reconciliation, idempotent refund processing, and double-entry ledger integration for FARM SEVA.

---

## 1. Payment Lifecycle & Webhook Processing

```
[ Farmer Checkout ] ──► [ Razorpay Order Created ] ──► [ Farmer Pays via UPI/Netbanking ]
                                                                   │
                                                                   ▼
[ Ledger Reconciled ] ◄── [ Double-Entry Recorded ] ◄── [ Signature Verified Webhook ]
```

### 1.1 Webhook Idempotency & HMAC Verification
- Webhook payloads received at `POST /api/v1/payments/webhook` MUST contain a valid `x-razorpay-signature` header.
- The HMAC-SHA256 signature is calculated over the raw request body using `RAZORPAY_WEBHOOK_SECRET`. Invalid signatures are rejected immediately (400 Bad Request).
- Webhook processing checks database uniqueness constraint on `idempotencyKey` (`IDEM_PAYMENT_WEBHOOK_${orderId}`). Duplicate webhook triggers return 200 OK without re-recording double-entry debits/credits.

---

## 2. Prohibited Financial Data Exposure Safeguards

1. **Card/PIN Non-Storage Invariant:** Plaintext credit/debit card numbers, CVVs, netbanking passwords, and UPI PINs are NEVER received, processed, or stored on FARM SEVA servers. All payment credential collection occurs directly within Razorpay's PCI-DSS compliant checkout iframe.
2. **AES-256-GCM Bank Encryption:** Seller bank details for payout settlements are stored encrypted via `EncryptionService` and returned masked (`XXXX-XXXX-1234`).
