# 🔌 FARM SEVA — PHASE 11 PROVIDER INTEGRATION SPECIFICATION & STATUS MATRIX

## Executive Summary
This document specifies the provider integration architecture, abstraction layers, callback handlers, and honest production status classification across payment, SMS, WhatsApp, IVR telephony, push notification, object storage, and seller payout providers.

---

## 1. Provider Integration Architecture

```
                                  ┌───────────────────────────┐
                                  │   FARM SEVA PROVIDERS     │
                                  └─────────────┬─────────────┘
                                                │
         ┌──────────────────┬───────────────────┼───────────────────┬──────────────────┐
         ▼                  ▼                   ▼                   ▼                  ▼
  ┌──────────────┐   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐   ┌──────────────┐
  │ Payment API  │   │  SMS Gateway │    │ WhatsApp API │    │ Telephony IVR│   │ FCM Push API │
  │  (Razorpay)  │   │ (DLT/Twilio) │    │(Meta Business│    │ (Cloud IVR)  │   │  (Firebase)  │
  └──────────────┘   └──────────────┘    └──────────────┘    └──────────────┘   └──────────────┘
```

---

## 2. Honest Provider Status Classification Matrix

| Provider | Abstraction Service | Configured Env Var | Current Status | Operating Mode |
|---|---|---|---|---|
| **Payment Gateway** | `payment-service.ts` | `RAZORPAY_KEY_ID` | `IMPLEMENTED / DEMO` | Demo webhook signature simulator / Razorpay Production |
| **SMS Gateway** | `sms-provider.ts` | `SMS_API_KEY` | `IMPLEMENTED / DEMO` | DLT template simulator / BSNL/Twilio SMS |
| **WhatsApp Business API** | `whatsapp-provider.ts` | `WHATSAPP_API_TOKEN` | `IMPLEMENTED / DEMO` | Meta HSM template payload simulator / Live WhatsApp |
| **Telephony / IVR Gateway** | `ivr-provider.ts` | `IVR_API_KEY` | `IMPLEMENTED / DEMO` | Multilingual DTMF voice call simulator / Live Cloud IVR |
| **Push Notifications** | `push-provider.ts` | `FCM_SERVER_KEY` | `IMPLEMENTED / DEMO` | FCM device token payload simulator / Live FCM |
| **Seller Payout Gateway** | `settlement-service.ts` | `PAYOUT_API_KEY` | `IMPLEMENTED / DEMO` | Automated batch settlement / Razorpay Route |
| **Object Storage** | `storage-service.ts` | `STORAGE_PROVIDER` | `CONFIGURED` | AWS S3 / Cloudflare R2 / Local Fallback |
| **Database Engine** | `PrismaClient` | `DATABASE_URL` | `CONNECTED` | Managed PostgreSQL with Connection Pool & SSL |

> [!IMPORTANT]
> **Production Status Guarantee:** External providers maintain honest status reporting. Provider status reads `NOT_CONFIGURED` or `IMPLEMENTED / DEMO` when live production API credentials are not actively set in the host environment.
