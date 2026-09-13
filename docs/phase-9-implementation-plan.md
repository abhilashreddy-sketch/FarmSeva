# 🚜 FARM SEVA — PHASE 9 IMPLEMENTATION PLAN
## Real-World Farmer MVP, End-to-End Operations & Pilot Launch Readiness

**Project:** FARM SEVA  
**Phase:** Phase 9  
**Status:** PROPOSED FOR USER REVIEW  

---

## 1. Objectives & Scope

Phase 9 prepares FARM SEVA for a real-world pilot launch by ensuring that the end-to-end workflows of all 6 user roles (**Farmer**, **Seller**, **Agricultural Expert**, **Delivery Partner**, **Call-Center Agent**, **Admin**) operate seamlessly.

### Core Focus Areas:
1. **Farmer Experience & Onboarding:** Progressive profile completion, language persistence, icon-first dashboard, and crop-centered management hub.
2. **Operational Workflows:** Seller order packing & inventory stock alerts; delivery partner mobile drop-off & OTP verification; expert consultation case queue & guidance submission; call-center farmer lookup & support portal.
3. **Admin Operations Center:** Live operational command dashboard, seller/expert verification workflows, provider status indicators (DEMO vs PRODUCTION), and pilot region configuration.
4. **Testing & Quality Assurance:** Expansion of integrated test suite to 110+ PASSED HTTP tests, 100% regression pass rate on Phases 1–8, and clean Next.js production build.

---

## 2. Priority Classification

### CRITICAL (P0)
- Progressive Farmer Onboarding & Profile Completion (do not block farmer if land/crop setup is pending).
- Crop-Centered Experience: Crop detail view serving as hub for crop information, crop problems, and crop-aware product discovery.
- Call-Center Agent Unified Farmer Lookup & Assist Portal (`/call-center`).
- Operational Admin Command Dashboard (`/admin`) with real-time platform metrics.
- Complete Integrated Test Suite Expansion (Tests 79–110+).

### HIGH (P1)
- Seller Order Processing & Low Stock (<5 items) / Out of Stock Inventory Indicators (`/seller`).
- Delivery Partner Mobile Operational View & OTP Drop-off (`/delivery`).
- Expert Consultation Queue & Guidance Form (`/expert`).
- DEMO vs PRODUCTION Mode Indicators for all 5 communication providers and payments.

### MEDIUM (P2)
- Multi-seller order fulfillment status visualization in Farmer Order Detail.
- Language persistence across all farmer-facing screens.

---

## 3. Proposed Module Modifications

### 3.1 Backend Configuration & API (`apps/api/src/`)
- Add pilot mode flags in `config/env.ts` (`PILOT_MODE=true`, `PILOT_SUPPORTED_STATES`).
- Add Call-Center Farmer Lookup API (`GET /api/v1/call-center/farmers/search?phone=...`).
- Add Admin Operational Metrics Summary API (`GET /api/v1/admin/dashboard/metrics`).

### 3.2 Web Frontend (`apps/web/src/app/`)
- **`farmer/page.tsx`**: Simple, icon-first farmer dashboard with progressive profile completion banner.
- **`farmer/crops/[id]/page.tsx`**: Crop-centered hub linking crop details, symptom reporting, and crop-aware product discovery.
- **`call-center/page.tsx`**: Unified Call-Center Agent Portal (Search farmer, view context, log problem, trigger support).
- **`admin/page.tsx`**: Operational Command Dashboard (Metrics, verification queues, system provider status).
- **`seller/marketplace/page.tsx`**: Operational inventory view with low-stock badges.
- **`delivery/page.tsx`**: Mobile-optimized delivery partner dispatch list.

### 3.3 Test Suite (`apps/api/src/__tests__/native-runner.ts`)
- Add test cases 79 through 110+ covering end-to-end onboarding, crop-centered hub, call-center assist, seller inventory alerts, admin command metrics, provider status, and security regression.

---

## 4. Verification Plan

1. **Automated Integration Tests:**
   `npx tsx apps/api/src/__tests__/native-runner.ts` (Target: 110+ PASSED, 0 FAILED).
2. **Next.js Production Web Build:**
   `npm run build --workspace=apps/web` (Target: 0 build errors).
3. **Documentation:**
   Generate `docs/phase-9-security-report.md`, `docs/phase-9-completion-report.md`, and `docs/pilot-launch-checklist.md`.
