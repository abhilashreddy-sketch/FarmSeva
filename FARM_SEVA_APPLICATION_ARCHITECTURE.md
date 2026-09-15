# FARM SEVA — APPLICATION ARCHITECTURE & RESTRUCTURE AUDIT
**Date:** September 15, 2026  
**Auditor:** Antigravity AI (Google DeepMind Team)  
**Target Architecture:** Multi-Channel Agricultural Technology Platform (5 Specialized Connected Applications)

---

## 1. EXECUTIVE SUMMARY

FARM SEVA is not a single generic website or a demo project. It is a **venture-scale agricultural technology platform** connecting five distinct participant groups in the Indian farming ecosystem. 

Rather than presenting a single website with overlapping role dashboards, FARM SEVA is structured into **5 specialized connected web applications** powered by a single unified REST API, Supabase PostgreSQL database, Prisma ORM schema, and JWT authentication infrastructure.

```
                                  🌾 FARM SEVA PLATFORM
                                           │
         ┌──────────────────┬──────────────┼──────────────┬──────────────────┐
         ↓                  ↓              ↓              ↓                  ↓
    APPLICATION 1      APPLICATION 2  APPLICATION 3  APPLICATION 4      APPLICATION 5
   FARM SEVA FARMER   FARM SEVA SELLER FARM SEVA EXPERT FARM SEVA DELIVERY  FARM SEVA ADMIN
   (Buy / Grow / Help)  (Agri Dealer)   (Agronomist)   (Last-Mile GPS)    (Operations Control)
         │                  │              │              │                  │
         └──────────────────┴──────────────┼──────────────┴──────────────────┘
                                           │
                                    SHARED BACKEND API
                                 (apps/api / Express.js)
                                           │
                                    SHARED DATABASE
                                (Supabase PostgreSQL / Prisma)
```

---

## 2. AUDIT OF EXISTING REPOSITORY ARCHITECTURE

### 1. Current Frontend Routes (`apps/web/src/app`)
- Public pages: `/`, `/login`, `/register`, `/auth/google/callback`, `/forgot-password`, `/reset-password`
- Farmer routes: `/farmer`, `/farmer/farms`, `/farmer/crops`, `/farmer/marketplace`, `/farmer/cart`, `/farmer/checkout`, `/farmer/orders`, `/farmer/crop-problems`, `/farmer/profile`
- Seller routes: `/seller`, `/seller/marketplace`, `/seller/orders`
- Expert routes: `/expert`, `/expert/crop-problems/[id]`
- Delivery routes: `/delivery`, `/delivery/deliveries`, `/delivery/earnings`, `/delivery/history`, `/delivery/notifications`, `/delivery/profile`
- Admin routes: `/admin`, `/admin/kyc`, `/admin/marketplace`, `/admin/orders`, `/admin/deliveries`, `/admin/experts`, `/admin/business`, `/admin/communications`

### 2. Current Authentication & RBAC
- Auth Context: `AuthContext.tsx` manages session tokens, `user` state, and `getRoleDashboardPath()`.
- API Authorization: `authenticateToken` middleware verifies Bearer JWT tokens. `roleGuard` enforces database `User.role` (`FARMER`, `SELLER`, `EXPERT`, `DELIVERY`, `ADMIN`).
- Registration API endpoints already exist in `auth-routes.ts`: `/api/v1/auth/register/farmer`, `/register/seller`, `/register/expert`, `/register/delivery`.

### 3. Current Database Models (`prisma/schema.prisma`)
- Shared database model relationships:
  - `User` 1-to-1 with `FarmerProfile`, `Seller`, `Expert`, `DeliveryPartner`, `CallCenterAgent`
  - `Seller` 1-to-many `Shop` and `Product`
  - `Order` references `FarmerProfile`, `Shop`, `Address`, `Payment`, `Delivery`
  - `Delivery` references `Order`, `DeliveryPartner`, `DeliveryLocation`
  - `CropProblem` references `FarmerProfile`, `Crop`, `ExpertGuidance`

---

## 3. TARGET ARCHITECTURE: 5 SPECIALIZED APPLICATIONS

Each application features its own dedicated branding, navigation, dashboard, login experience, and workflows, while sharing the central database and API.

### APPLICATION 1 — FARM SEVA FARMER
- **Target Audience:** Indian Farmers & Agriculture Customers
- **Dedicated Routes:** `/farmer`, `/farmer/buy`, `/farmer/crops`, `/farmer/orders`, `/farmer/advisory`, `/farmer/profile`, `/farmer/login`, `/farmer/register`
- **Navigation:** Home | Buy Inputs | My Crops | Orders | Advisory | Profile
- **AI Assistant:** `<FloatingCropDoctor />` omnipresent bottom-right floating widget reusing real Gemini 1.5 Flash backend (`gemini-3.8-flash` / `gemini-2.5-flash` fallback). Guest wall presents login prompt for unauthenticated visitors.
- **Key Workflows:** Browse products, compare inputs, add to cart, checkout with COD/Razorpay, track real-time delivery pin, log crop sowing stages, report crop disease photos, receive expert advisories.

### APPLICATION 2 — FARM SEVA SELLER (Agri Dealer Portal)
- **Target Audience:** Licensed Agricultural Input Retailers & Distributors
- **Dedicated Routes:** `/seller`, `/seller/products`, `/seller/inventory`, `/seller/orders`, `/seller/shop`, `/seller/settlements`, `/seller/profile`, `/seller/login`, `/seller/register`
- **Navigation:** Dashboard | Products | Inventory | Orders | Shop | Settlements | Profile
- **Key Workflows:** Submit GST & pesticide license during KYC, setup shop profile with coordinates, list products (`PENDING_APPROVAL` status badge), manage stock inventory, receive incoming district orders, accept and process orders for delivery handover, track daily payout settlements.

### APPLICATION 3 — FARM SEVA EXPERT (Agronomist Workstation)
- **Target Audience:** Certified Agronomists & Plant Pathologists
- **Dedicated Routes:** `/expert`, `/expert/cases`, `/expert/diagnosis`, `/expert/advisory`, `/expert/history`, `/expert/profile`, `/expert/login`, `/expert/register`
- **Navigation:** Dashboard | Cases | Diagnosis | Advisory | History | Profile
- **Key Workflows:** Register credentials & degree certificates, view high-severity crop disease triage queue, inspect high-res leaf photos and AI preliminary assessment, issue formal prescription guidance, answer farmer follow-up queries.

### APPLICATION 4 — FARM SEVA DELIVERY (Logistics Partner Application)
- **Target Audience:** District Last-Mile Delivery Drivers & Courier Partners
- **Dedicated Routes:** `/delivery`, `/delivery/deliveries`, `/delivery/active`, `/delivery/earnings`, `/delivery/history`, `/delivery/profile`, `/delivery/login`, `/delivery/register`
- **Navigation:** Dashboard | Deliveries | Active Delivery | Earnings | History | Profile
- **Key Workflows:** Toggle `ONLINE`/`OFFLINE` status, grant HTML5 Geolocation permission, stream battery-conscious GPS coordinates to `DeliveryLocation` DB table, receive assignment notifications, navigate to shop pickup location, navigate to farm destination using Leaflet map, verify 4-digit customer delivery OTP via bcrypt, complete delivery task, view payout history.

### APPLICATION 5 — FARM SEVA ADMIN (Operations & Governance Workstation)
- **Target Audience:** Platform System Administrators & Operations Managers
- **Dedicated Routes:** `/admin`, `/admin/users`, `/admin/kyc`, `/admin/products`, `/admin/orders`, `/admin/payments`, `/admin/delivery`, `/admin/experts`, `/admin/sellers`, `/admin/reports`, `/admin/settings`, `/admin/login`
- **Navigation:** Operations | Users | KYC | Products | Orders | Payments | Delivery | Experts | Sellers | Reports | Settings | Audit Logs
- **Key Workflows:** Moderate seller KYC licenses & pesticide permits, approve or reject seller product listings, oversee unassigned district delivery tasks, audit platform payment transactions, trigger emergency weather broadcasts, inspect security audit logs.

> [!IMPORTANT]
> Admin is **NOT** listed on any public login selector card. It is accessible strictly via `/admin/login`.

---

## 4. AUTHENTICATION & RBAC ARCHITECTURE

### Separate Login Portals
The single role-selection card chooser has been eliminated. Each application exposes its own dedicated login and registration experience:
- **Farmer Web:** `/farmer/login` & `/farmer/register`
- **Seller Web:** `/seller/login` & `/seller/register`
- **Expert Web:** `/expert/login` & `/expert/register`
- **Delivery Web:** `/delivery/login` & `/delivery/register`
- **Admin Web:** `/admin/login` (Protected)

### Backend Authorization (Database Single Source of Truth)
Regardless of which login URL a user hits, **the database `User.role` is authoritative**:
- JWT payload encodes `id`, `role`, `status`.
- Express API middleware (`roleGuard`) double-verifies permissions on every controller invocation:
  - `FARMER` token cannot invoke `/api/v1/seller/*` or `/api/v1/admin/*`.
  - `SELLER` token cannot invoke `/api/v1/expert/*` or `/api/v1/delivery/*`.
  - `DELIVERY_PARTNER` token cannot invoke `/api/v1/admin/*`.
  - `ADMIN` token alone has platform-wide administration privileges.

---

## 5. SHARED END-TO-END ORDER LIFECYCLE

```
 1. FARMER APP         2. SELLER APP         3. DELIVERY APP       4. FARMER APP         5. ADMIN APP
 (Order Placed) ───► (Order Accepted) ───► (GPS Handover/OTP) ───► (Order Delivered) ───► (Audit Settlement)
       │                     │                     │                     │                     │
       └─────────────────────┴──────────┬──────────┴─────────────────────┴─────────────────────┘
                                        ↓
                                SHARED DATABASE
                      (Supabase PostgreSQL / Prisma ORM)
```

1. **Farmer (App 1):** Selects verified inputs from catalog, places order with COD/Prepaid payment. Order state = `PENDING`.
2. **Seller (App 2):** Receives instant notification on shop dashboard, accepts order, packs items. Order state = `CONFIRMED`.
3. **Delivery Partner (App 4):** System assigns nearest online partner in active district. Partner accepts task, navigates to shop, picks up parcel. Delivery state = `PICKED_UP`.
4. **GPS Tracking (App 4 & App 1):** Delivery partner's GPS coordinates stream to `DeliveryLocation` table. Farmer views live pin moving toward farm.
5. **Handover & OTP (App 4 & App 1):** Partner arrives at farm destination. Farmer provides 4-digit OTP. Partner inputs OTP; server verifies hash via bcrypt. Order state = `DELIVERED`.
6. **Admin Audit (App 5):** Operations team inspects completed transaction, approves seller & delivery payouts.

---

## 6. SAFEST MIGRATION & RESTRUCTURING PLAN

To preserve all existing working functionality, zero database data loss, and avoid breaking deployment scripts, we will maintain the existing monorepo structure while implementing clean application boundaries inside `apps/web`:

### File Changes & Migration Map

#### Files to be CREATED:
- `apps/web/src/app/farmer/login/page.tsx` — Dedicated Farmer Login
- `apps/web/src/app/farmer/register/page.tsx` — Dedicated Farmer Registration
- `apps/web/src/app/seller/login/page.tsx` — Dedicated Seller Login
- `apps/web/src/app/seller/register/page.tsx` — Dedicated Seller Registration
- `apps/web/src/app/expert/login/page.tsx` — Dedicated Expert Login
- `apps/web/src/app/expert/register/page.tsx` — Dedicated Expert Registration
- `apps/web/src/app/delivery/login/page.tsx` — Dedicated Delivery Login
- `apps/web/src/app/delivery/register/page.tsx` — Dedicated Delivery Registration
- `apps/web/src/app/admin/login/page.tsx` — Dedicated Admin Login
- `apps/web/src/components/FloatingCropDoctor.tsx` — Omnipresent AI Assistant Widget
- `apps/api/src/routes/public-routes.ts` — Real DB stats endpoint (`/api/v1/public/stats`)

#### Files to be MODIFIED:
- `apps/web/src/app/page.tsx` — Redesigned public landing page (*"Everything your farm needs, in one place"*) with direct 4-role entry links and live stats.
- `apps/web/src/components/Navbar.tsx` — Context-aware application headers per active role.
- `apps/web/src/app/layout.tsx` — Embed `<FloatingCropDoctor />` globally for farmers.
- `apps/web/src/context/AuthContext.tsx` — Refine role-specific portal redirection and session handling.
- `apps/web/src/lib/i18n/translations.ts` — 100% translation key parity across all 8 locales (`en`, `te`, `hi`, `kn`, `ta`, `ml`, `mr`, `bn`).

#### Files that MUST NOT BE DELETED:
- `apps/api/src/providers/ai-vision-provider.ts` — Core Gemini 3.8 Flash / 2.5 Flash Vision AI service.
- `apps/api/src/services/*` — Business logic services (`crop-doctor-service.ts`, `order-service.ts`, `delivery-service.ts`, `marketplace-service.ts`).
- `apps/api/src/middleware/*` — Auth & security middlewares (`auth-middleware.ts`, `role-guard.ts`, `error-middleware.ts`).
- `prisma/schema.prisma` — Authoritative database schema definition.

---

## 7. VERIFICATION & QUALITY ASSURANCE

1. **Zero Mock/Fake Data:** All counters, maps, and orders connect directly to Supabase PostgreSQL database.
2. **Strict RBAC Enforcement:** Attempting to manually navigate to an unauthorized portal (e.g. Farmer attempting `/seller` or `/admin`) triggers immediate server-backed redirect to assigned dashboard or `/unauthorized`.
3. **Responsive Mobile Testing:** Every application view validated across 360px, 390px, 768px, 1024px, and 1440px viewports.
