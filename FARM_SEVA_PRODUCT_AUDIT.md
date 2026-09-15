# FARM SEVA — VENTURE-SCALE PRODUCT STRUCTURE & UI/UX AUDIT REPORT
**Date:** September 15, 2026  
**Auditor:** Antigravity AI (Google DeepMind Team)  
**Target Project:** FARM SEVA (Monorepo: `apps/web`, `apps/api`, `packages/database`, `packages/shared`)  
**Production URLs:** Backend API: `https://farmseva.onrender.com` | Web App: `https://farm-seva-web.vercel.app`

---

## 1. ARCHITECTURE OVERVIEW

FARM SEVA is a multi-channel agricultural platform designed to connect **Farmers**, **Agri Dealers (Sellers)**, **Certified Crop Experts**, **District Delivery Partners**, and **Platform Administrators** across rural and semi-urban India.

```
                         🌾 FARM SEVA
                              │
        ┌─────────────┬───────┼────────┬─────────────┐
        ↓             ↓       ↓        ↓             ↓
      FARMER        SELLER  EXPERT  DELIVERY       ADMIN
        │             │       │        │             │
     BUY/GROW      SELL      HELP    DELIVER       CONTROL
        │             │       │        │             │
        └─────────────┴───────┴────────┴─────────────┘
                              │
                       Shared Platform
                              │
       ┌──────────────┬───────┼──────────┬─────────────┐
       ↓              ↓       ↓          ↓             ↓
    Supabase        Auth    Payments    AI         Notifications
    PostgreSQL       RBAC   Orders    Gemini       SMS/WhatsApp
```

### Public Role Portals (4 Public Choices):
1. **👨‍🌾 Farmer (किसान / రైతు):** Buy inputs, manage crops, access advisory & AI.
2. **🏪 Agri Dealer / Seller:** Register shop, list inventory, fulfill district orders.
3. **🔬 Crop Expert:** Certified agronomists, review plant disease cases, issue formal advice.
4. **🚚 Delivery Partner:** District last-mile delivery, route navigation, OTP verification.

> [!IMPORTANT]
> **Admin (`/admin`) is a separate protected administration access** and does NOT appear as a normal public role-selection card on the landing page or login screen.

---

## 2. PRODUCTION AI CONFIGURATION AUDIT

Audited directly from `apps/api/src/providers/ai-vision-provider.ts` and `apps/api/src/services/crop-doctor-service.ts`:

- **`AI_PROVIDER`:** `GEMINI` (via `GeminiVisionProvider` / `ConfigurableAiVisionProvider`)
- **Primary Model (`AI_MODEL`):** `gemini-3.8-flash` (env fallback `gemini-3.8-flash`)
- **Fallback Model (`AI_FALLBACK_MODEL`):** `gemini-2.5-flash` (env fallback `gemini-2.5-flash`)
- **API Endpoint:** `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
- **Multimodal Support:** Multi-image base64 inline buffers (`inline_data`) with Zod structured JSON output schema (`AiVisionAnalysisResultSchema`)
- **Retry & Resilience Strategy:** Up to `AI_MAX_RETRIES` (default 4) with exponential backoff delay (1s–4s + jitter) on transient HTTP errors (429, 408, 500, 502, 503, 504). Automatic failover to `AI_FALLBACK_MODEL` (`gemini-2.5-flash`) if primary model returns 503 / `AI_SERVICE_UNAVAILABLE`.

---

## 3. COMPLETE ROUTE MAP & FRONTEND INVENTORY

Inventory of all pages and routes in `apps/web/src/app`:

| Route Path | Role | Purpose | Auth Required | API Dependency | DB Models | i18n Status | UI Quality |
|---|---|---|---|---|---|---|---|
| `/` | PUBLIC | Platform Landing & Ecosystem Hub | No | GET `/api/v1/public/stats` | User, Product, Expert, Shop | Translated | Redesigning |
| `/login` | PUBLIC | Unified 4-Role Login | No | POST `/api/v1/auth/login` | User | Translated | Production Ready |
| `/register` | PUBLIC | 4-Role Registration | No | POST `/api/v1/auth/register` | User, FarmerProfile, Seller | Translated | Production Ready |
| `/auth/google/callback` | PUBLIC | OAuth Handler | No | GET `/api/v1/auth/google` | User | N/A | Functional |
| `/forgot-password` | PUBLIC | Password Recovery | No | POST `/api/v1/auth/forgot-password` | User, PasswordResetToken | Translated | Functional |
| `/reset-password` | PUBLIC | Password Reset | No | POST `/api/v1/auth/reset-password` | User, PasswordResetToken | Translated | Functional |
| `/farmer` | FARMER | Farmer Dashboard Hub | Yes (FARMER) | GET `/api/v1/farmer/dashboard` | FarmerProfile, Farm, Order | Translated | Standardizing |
| `/farmer/farms` | FARMER | Farm Management | Yes (FARMER) | GET/POST `/api/v1/farms` | Farm, FarmField | Translated | Standardizing |
| `/farmer/crops` | FARMER | Active Sown Crops Log | Yes (FARMER) | GET/POST `/api/v1/crops` | Crop | Translated | Standardizing |
| `/farmer/marketplace` | FARMER | Input Product Catalog | Yes (FARMER) | GET `/api/v1/marketplace/products` | Product, Category | Translated | Standardizing |
| `/farmer/cart` | FARMER | Cart & Item Summary | Yes (FARMER) | GET/POST `/api/v1/cart` | Cart, CartItem | Translated | Standardizing |
| `/farmer/checkout` | FARMER | Address & Payment Selection | Yes (FARMER) | POST `/api/v1/orders` | Order, Address | Translated | Standardizing |
| `/farmer/orders` | FARMER | Order History & Tracking | Yes (FARMER) | GET `/api/v1/orders` | Order, Delivery | Translated | Standardizing |
| `/farmer/orders/[id]` | FARMER | Real-Time Order & Delivery Map | Yes (FARMER) | GET `/api/v1/orders/:id` | Order, Delivery, DeliveryLocation | Translated | Standardizing |
| `/farmer/crop-problems` | FARMER | Crop Health Cases | Yes (FARMER) | GET `/api/v1/crop-problems` | CropProblem, CropDiagnosis | Translated | Standardizing |
| `/farmer/profile` | FARMER | Farmer Account & KYC | Yes (FARMER) | GET/PUT `/api/v1/farmer/profile` | User, FarmerProfile | Translated | Functional |
| `/seller` | SELLER | Agri Dealer Dashboard | Yes (SELLER) | GET `/api/v1/seller/dashboard` | Seller, Shop, Order | Translated | Standardizing |
| `/seller/marketplace` | SELLER | Inventory & Product Listing | Yes (SELLER) | GET/POST `/api/v1/seller/products` | Product, Inventory | Translated | Standardizing |
| `/seller/orders` | SELLER | Shop Order Fulfillment | Yes (SELLER) | GET/PUT `/api/v1/seller/orders` | Order, OrderItem | Translated | Standardizing |
| `/expert` | EXPERT | Expert Workstation | Yes (EXPERT) | GET `/api/v1/expert/dashboard` | Expert, CropProblem | Translated | Standardizing |
| `/delivery` | DELIVERY | Delivery Partner Operations | Yes (DELIVERY) | GET `/api/v1/delivery/profile` | DeliveryPartner, Delivery | Translated | Production Ready |
| `/delivery/deliveries` | DELIVERY | Active Delivery & Map Tracking | Yes (DELIVERY) | GET `/api/v1/delivery/orders` | Delivery, DeliveryLocation | Translated | Production Ready |
| `/delivery/earnings` | DELIVERY | Daily/Weekly Earnings Desk | Yes (DELIVERY) | GET `/api/v1/delivery/earnings` | Delivery, Order | Translated | Production Ready |
| `/delivery/history` | DELIVERY | Completed Deliveries | Yes (DELIVERY) | GET `/api/v1/delivery/history` | Delivery | Translated | Production Ready |
| `/admin` | ADMIN | Platform Governance Hub | Yes (ADMIN) | GET `/api/v1/admin/dashboard` | User, Order, Product | Translated | Standardizing |

---

## 4. DELIVERY LOCATION REAL VERIFICATION PROTOCOL

Delivery partner location tracking is subject to strict verification standards. **Code presence alone does NOT constitute completion.**

To mark Delivery Location complete, the following runtime flow must be verified:

1. **Permission:** Delivery Partner grants browser location permission (`navigator.geolocation`).
2. **Toggle Online:** Partner toggles status to `ONLINE`.
3. **Capture:** GPS coordinates (`latitude`, `longitude`, `accuracy`) are captured.
4. **API Receive:** Authenticated API receives location payload at `/api/v1/delivery/location`.
5. **Persistence:** `DeliveryLocation` row is written to PostgreSQL DB.
6. **Active Delivery Update:** Location updates continuously during active delivery task.
7. **Map Render:** Farmer and Delivery map displays real-time pin.
8. **Offline Queue:** If offline, coordinates queue in `localStorage`.
9. **Reconnect Sync:** Coordinates flush safely to server when network reconnects.
10. **Completion:** Delivery OTP verified via bcrypt.
11. **Tracking Stop:** Partner goes `OFFLINE` or completes delivery; GPS tracking halts.

> [!CAUTION]
> If any step in this sequence is simulated or unverified, it will be explicitly flagged as **NOT VERIFIED**.

---

## 5. REVISED 7-PHASE EXECUTION ROADMAP

```
PHASE 1 — Foundation (P0)
  ├── Public stats API (/api/v1/public/stats)
  ├── Strict RBAC & server-side role Guards
  ├── Remove fake/static marketing claims
  ├── Verify production AI configuration (gemini-3.8-flash / gemini-2.5-flash)
  └── Verify existing authentication & JWT refresh

PHASE 2 — Farmer Product (P0/P1)
  ├── Redesign Farmer Dashboard
  ├── Buy Inputs & Marketplace UI
  ├── My Crops tracker
  ├── Order tracking timeline
  ├── Advisory desk
  └── Floating AI Assistant (<FloatingCropDoctor />) with guest sign-in wall

PHASE 3 — Delivery Partner & Real Location Verification (P0/P1)
  ├── Delivery Partner Dashboard & Navigation
  ├── Online/Offline toggle with HTML5 Geolocation
  ├── Real GPS capture & DeliveryLocation persistence
  ├── Map route rendering (Leaflet OpenStreetMap)
  ├── Assignment accept/pickup & OTP verification
  ├── Offline location queueing & reconnect sync
  └── Earnings & settlement desk

PHASE 4 — Seller (P1)
  ├── Agri Dealer inventory management
  ├── Product approval status badges (PENDING_APPROVAL, APPROVED, REJECTED)
  ├── Order dispatch control panel
  └── Shop settlements desk

PHASE 5 — Expert (P1)
  ├── Diagnostic triage workstation
  ├── Plant pathology review desk
  ├── Prescriptive guidance issuance
  └── Consultation history

PHASE 6 — Design System & i18n (P1/P2)
  ├── Unified component primitives across all 5 roles
  ├── Mobile responsive testing (360px to 1440px)
  ├── 100% 8-language key parity (validate-translations.ts)
  └── Loading, Empty, Skeleton, and Error states

PHASE 7 — Full Production Verification (P0)
  └── End-to-end full loop test:
      Farmer → Product → Cart → Payment → Order → Seller → Delivery Partner → GPS → Farmer → OTP → Completed → Settlement
```
