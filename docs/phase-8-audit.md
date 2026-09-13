# 🚜 FARM SEVA — PHASE 8 CODE AUDIT REPORT
**Focus:** Centralized Communication Hub, Multi-Channel Notifications (SMS, WhatsApp, Push, In-App, IVR Architecture), Language Support, and Accessibility.

**Date:** September 12, 2026  
**Auditor:** Lead Software Architect & Senior Full-Stack Engineer  

---

## 1. Executive Summary

An in-depth audit of the existing **FARM SEVA** codebase (Phases 1–7) was conducted to evaluate existing notification capabilities, database schema constructs, internationalization (i18n) structures, event hook points, and provider integration readiness.

The current system has basic `Notification` model placeholders in Prisma schema and language configuration in `@farm-seva/shared`, but lacks a unified, multi-channel event-driven Notification Engine. Business logic across orders, payments, delivery, crop problem reporting, and consultations operates cleanly without notification clutter.

This audit establishes the blueprint for **Phase 8: Multi-Channel Communication Engine** using **ONE BACKEND SOURCE OF TRUTH**.

---

## 2. Audit Findings Across Systems

### 2.1 Existing Notification & Communication Code Audit
- **Database Schema (`prisma/schema.prisma`):**
  - Existing `Notification` model contains basic fields (`id`, `userId`, `title`, `message`, `type`, `isRead`, `metadataJson`, `createdAt`).
  - Missing: `readAt`, `updatedAt`, `channel`, delivery attempt tracking, channel delivery logs, user preferences, device token registration, and IVR menu mapping.
- **API Routes & Services (`apps/api`):**
  - No existing notification controllers or routes (`/api/v1/notifications` does not exist).
  - Business services (`checkout-service.ts`, `delivery-service.ts`, `crop-problem-service.ts`, `consultation-service.ts`, `expert-service.ts`) execute database state changes cleanly without hardcoded SMS or notification code.
- **Frontend App (`apps/web`):**
  - No existing notification drawer or notification preference page in `/farmer` portal.
  - Profile page (`/farmer/profile`) has basic farmer data but lacks multi-channel toggles (SMS, WhatsApp, Push, IVR) and preferred language picker.

### 2.2 Reusable Architectural Components
1. **RBAC & Authentication Middleware:** `authenticateToken`, `requireRole`, `checkResourceOwnership` in `apps/api/src/middleware/`.
2. **Audit Logging Framework:** `logAuditEvent` in `apps/api/src/utils/audit-logger.ts` for tracking communication events and emergency broadcasts.
3. **i18n Language Constants:** `SUPPORTED_LOCALES` (`en`, `te`, `kn`, `hi`, `ta`, `mr`) in `@farm-seva/shared`.
4. **Controlled State Machines:** Order, Crop Problem, and Consultation state machines in `@farm-seva/shared` will serve as immutable event triggers.
5. **Rate Limiting:** `globalLimiter`, `authLimiter`, `checkoutLimiter` in `rate-limiter-middleware.ts`.

### 2.3 Provider Integration Gaps & Environment Abstraction
- Currently, no external SMS (e.g. MSG91, Twilio), WhatsApp Business (Meta Cloud API), Push (FCM), or IVR (Exotel, Knowlarity) providers are configured with live API credentials.
- **Requirement:** Implement provider abstraction interfaces (`SmsProvider`, `WhatsAppProvider`, `PushProvider`, `IvrProvider`) with **safe, explicit DEMO adapters** for development/test environments. DEMO adapters will output formatted log previews without pretending real telecom delivery occurred unless live credentials are configured.

### 2.4 Privacy & Regulatory Compliance Audit
- **Internal Expert Notes:** Must **NEVER** be dispatched in farmer notifications or exposed via notification payloads (`isInternalNote: true` / `visibility: 'INTERNAL'`).
- **Pesticide / Chemical Safety Boundary:** Notifications must **NEVER** generate autonomous pesticide prescriptions, dosage calculations, or treatment schedules. Any agricultural guidance communicated must originate strictly from human agronomist advice already authorized in Phase 6.
- **Sensitive Data Exposure:** Notifications must **NEVER** contain passwords, OTP hashes, payment tokens, or JWT refresh tokens.

---

## 3. Recommended Phase 8 Architecture

```text
       Business Event (Order Placed / Expert Guidance / Delivery OTP)
                                     │
                                     ▼
                      Central Notification Engine
                     (apps/api/src/services/notification-service.ts)
                                     │
                     ┌───────────────┴───────────────┐
                     ▼                               ▼
         Notification Template            Channel Preference Check
        (Language: te/kn/hi/en)           (SMS/WhatsApp/Push/InApp)
                     │                               │
                     └───────────────┬───────────────┘
                                     ▼
                      Multi-Channel Delivery Dispatch
          ┌──────────────────┬───────────────┬──────────────────┐
          ↓                  ↓               ↓                  ↓
     In-App Adapter     SMS Adapter     WhatsApp Adapter   Push/IVR Adapter
          │                  │               │                  │
          └──────────────────┴───────┬───────┴──────────────────┘
                                     ▼
                           NotificationDelivery Record
                     (Status: QUEUED/SENT/DELIVERED/FAILED)
```

---

## 4. Required Database Schema Enhancements

1. **`Notification`**: Add `readAt`, `updatedAt`, `priority` (`LOW`, `MEDIUM`, `HIGH`, `URGENT`).
2. **`NotificationDelivery`**: New model tracking individual channel delivery attempts (`notificationId`, `channel`, `status`, `provider`, `providerMessageId`, `recipientPhone`, `attempts`, `deliveredAt`, `failedAt`, `errorCode`, `errorMessage`).
3. **`NotificationPreference`**: New model (`userId`, `smsEnabled`, `whatsappEnabled`, `pushEnabled`, `inAppEnabled`, `language`).
4. **`DeviceToken`**: New model for push notification tokens (`userId`, `deviceToken`, `platform`, `isActive`).

---

## 5. Risk Assessment & Mitigations

| Architectural Risk | Mitigation Strategy |
| :--- | :--- |
| **Notification failure breaking business operations** | Notification dispatch will execute asynchronously after database transaction commits, ensuring order/consultation creation never fails due to provider downtime. |
| **Duplicate notification spam on retries** | Implement idempotency keys and provider message ID tracking in `NotificationDelivery`. |
| **PII / Secret leakage in SMS / WhatsApp** | Strict payload sanitization stripping sensitive credentials before message compilation. |
| **Fake telecom delivery claims** | DEMO adapters will explicitly return `provider: 'DEMO'` and mark status as `SENT` (not `DELIVERED`) until provider webhook DSR confirms delivery. |
