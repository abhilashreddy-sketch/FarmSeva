# 🚜 FARM SEVA — PHASE 8 IMPLEMENTATION PLAN
## Farmer Multi-Channel Communication Hub & Notification Engine

**Phase:** Phase 8 — Multi-Channel Farmer Communication & Notification Engine  
**Goal:** Build a robust, regional-language multi-channel notification engine (SMS, WhatsApp, IVR Voice Calls, Push Notifications, In-App Inbox) with fallback mechanisms, preference management, automated event triggers, and emergency regional broadcasts.

---

## Technical Architecture Overview

```text
                                FARM SEVA API
                                      │
                         ┌────────────┴────────────┐
                         │    Communication Hub    │
                         └────────────┬────────────┘
                                      │
        ┌───────────────────┬─────────┴─────────┬───────────────────┐
        ↓                   ↓                   ↓                   ↓
   SMS Gateway       WhatsApp Engine        IVR Engine          Push / In-App
   (MSG91/Twilio)    (Meta Cloud API)   (Regional Voice)     (Web/Mobile Push)
        │                   │                   │                   │
        └───────────────────┼───────────────────┴───────────────────┘
                            ↓
                Farmer Preferred Channel & Language
```

---

## 📁 Proposed Changes & Component Demarcations

### 1. Database Schema Updates (`prisma/schema.prisma`)
- Extend `Notification` model with `channel`, `status`, `recipientPhone`, `languageCode`, `externalMessageId`, `providerName`, `deliveryAttempts`, `failureReason`, `sentAt`, `deliveredAt`.
- Add `NotificationPreference` model (`userId`, `preferredChannel`, `enableSms`, `enableWhatsapp`, `enableIvr`, `enablePush`, `preferredLanguage`).
- Add `EmergencyBroadcast` model (`title`, `message`, `targetDistrict`, `targetCropName`, `sentByUserId`).

### 2. Shared Types (`packages/shared`)
- Export `NotificationChannel`, `NotificationType`, `NotificationStatus`, `NotificationTemplatePayload` in `@farm-seva/shared`.

### 3. Provider Interfaces & Gateways (`apps/api/src/services/providers`)
- `sms-provider.ts`: SMS dispatch interface & mock/live provider.
- `whatsapp-provider.ts`: WhatsApp Business API template payload generator.
- `ivr-provider.ts`: IVR voice call audio script builder in regional languages (`te`, `kn`, `hi`, `ta`, `mr`).

### 4. Communication Hub Service (`apps/api/src/services/notification-service.ts`)
- Core routing engine (`dispatchNotification`) respecting farmer channel preference, language, and fallback policies.
- Automated triggers bound to Order events, Advisory events, and Support events.
- Admin Emergency Agricultural Broadcast dispatch (`dispatchEmergencyBroadcast`).
- Provider delivery status callback handling (`processDeliveryStatusReport`).

### 5. API Endpoints & Routes (`apps/api/src/routes/notification-routes.ts`)
- `GET /api/v1/farmer/notifications`: Get farmer in-app notification inbox & unread counter.
- `PATCH /api/v1/farmer/notifications/:id/read`: Mark notification as read.
- `GET /api/v1/farmer/notification-preferences`: Get farmer multi-channel preferences.
- `PUT /api/v1/farmer/notification-preferences`: Update farmer channel preferences & language.
- `POST /api/v1/admin/communications/broadcast`: Admin emergency district/crop warning broadcast.
- `POST /api/v1/communications/webhook/:provider`: Gateway DSR delivery receipt callback.

### 6. Frontend Pages (`apps/web/src/app`)
- `/farmer/notifications`: In-app notification hub for farmers.
- `/farmer/profile`: Multi-channel notification toggles & preferred language selector.
- `/admin/communications`: Admin Emergency Broadcast Portal.

### 7. Integrated Test Suite (`apps/api/src/__tests__/native-runner.ts`)
- Add test cases 57–65 testing multi-channel notification dispatch, preferences, IVR scripts, WhatsApp payloads, emergency broadcasts, and 100% full regression across Phases 1–8.
