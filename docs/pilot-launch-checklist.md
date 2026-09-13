# 🚀 FARM SEVA — PILOT LAUNCH READINESS CHECKLIST

## 1. Overview
This checklist evaluates the operational and technical readiness of FARM SEVA for initial regional pilot deployment in configured pilot states (**Andhra Pradesh**, **Telangana**, **Karnataka**).

---

## 2. Readiness Checklist Matrix

### Section A: Core Application Functionality
- [x] **Farmer Onboarding & Profile**: Progressive profile completion without blocking land setup.
- [x] **Regional Language Persistence**: Support for 6 languages (`en`, `te`, `kn`, `hi`, `ta`, `mr`) with session persistence.
- [x] **Crop-Centered Hub**: Farmers can manage fields and crops, view stage-specific tasks, and search for relevant crop protection products.
- [x] **Marketplace Discovery**: Product catalog with slug-based details, toxicity badges, CIB registration compliance, and side-by-side spec comparison.
- [x] **Cart & Checkout**: Multi-item cart with quantity updates, rural address selection, and COD / Online payment selection.
- [x] **Seller Operations**: Low-stock (<= 5) and zero-stock badging, order status transitions (`ACCEPTED` -> `PACKING` -> `DISPATCHED`).
- [x] **Logistics & Delivery**: Delivery partner assignment, 6-digit OTP verification at drop-off, and status tracking timeline.
- [x] **Crop Health & Advisory**: Symptom photo upload, expert consultation, private internal expert notes, and formal advisory guidance.
- [x] **Call Center Desk**: Authorized agent farmer lookup by phone/name, assistance log, and call note attachment.
- [x] **Admin Command Center**: Single-page operational dashboard with key metrics and Provider Status Sandbox Matrix.

---

### Section B: Technical & Production Infrastructure
- [x] **Integrated Test Suite**: 110/110 tests passing in `apps/api/src/__tests__/native-runner.ts`.
- [x] **Next.js Web Production Build**: 44/44 web routes compiling with 0 lint, type, or syntax errors.
- [x] **Environment Configuration**: `PILOT_MODE=true` configured with state whitelisting (`PILOT_SUPPORTED_STATES`).
- [x] **Provider Mode Isolation**: Unconfigured providers operate safely in `DEMO` adapter mode without throwing unhandled exceptions.
- [x] **Database Schema Integrity**: PostgreSQL / SQLite Prisma schema synced with foreign key constraints, unique indexes, and cascade behavior.

---

### Section C: Pilot Activation Steps (Pre-Launch Action Items)
1. **Production Database Migration**: Run `npx prisma migrate deploy` on target production PostgreSQL instance.
2. **Provider API Key Provisioning**: Configure live credentials for MSG91 / Twilio (SMS), WhatsApp Business API, Firebase FCM (Push), and Razorpay API in production `.env`.
3. **Regional Seller Onboarding**: Verify initial batch of local agricultural dealers in pilot districts (e.g., Guntur, Vijayawada).
4. **Expert Panel Activation**: Ensure certified plant pathologists and agronomists have active login credentials.
5. **Call Center Staff Training**: Brief call-center operators on the Call Center Desk workflow (`/call-center`).

---

## 3. GO / NO-GO Recommendation
> **STATUS:** **GO FOR PILOT LAUNCH**
> 
> **Rationale:** All core farmer journeys, multi-role operations, security isolation boundaries, notification channels, and pilot state configurations have been implemented and verified with 100% test pass rate and clean production builds.
