# FARM SEVA - Project Requirements Document (PRD)

## 1. Executive Summary
FARM SEVA is a multi-channel agricultural marketplace built for Indian farmers, agricultural retailers, crop experts, and logistics partners. Recognizing that millions of farmers face digital literacy barriers, lack smartphones, or communicate primarily in regional languages, Farm Seva is architected to operate across multiple access channels:
- **Direct Smartphone / Mobile Web Interface** (Farmer Self-Service)
- **Assisted Call-Center Interface** (Telephonic Order & Crop Advisory)
- **Local Agricultural Retailer Portal** (Shop Inventory & Order Fulfillment)
- **Agricultural Expert Workstation** (Visual Crop Diagnosis & Verification)
- **Admin Control Dashboard** (Platform Governance, Seller Verification, Audit Logs)
- **Future IVR / Voice Automation Integration**

---

## 2. Problem Statement & Core Value Proposition
### Problem:
1. **Low Digital Literacy & Smartphone Penetration:** Traditional e-commerce apps fail for farmers who cannot read complex UI or navigate apps.
2. **Lack of Local Trust:** Farmers rely on local agricultural dealers for product advice and supplies.
3. **Pest & Disease Misdiagnosis:** Indiscriminate purchase of crop protection chemicals without expert verification causes crop losses, safety risks, and financial loss.

### Core Value Proposition:
- **Discover:** Identify crop symptoms without forcing chemical prescriptions.
- **Verify:** Purchase from admin-verified local agricultural dealers.
- **Compare:** Review pack sizes, formulation types (SC, EC, WP), dosages, and prices.
- **Buy & Deliver:** Place direct or agent-assisted orders for local pickup/delivery.
- **Support & Record:** Access agricultural expert guidance and maintain digitised farm/crop logs.

---

## 3. Regulatory & Safety Compliance Principles
> [!IMPORTANT]
> **Safety Boundary:** FARM SEVA WILL NEVER USE AI TO AUTOMATICALLY PRESCRIBE REGULATED PESTICIDES OR CHEMICALS TO FARMERS.
> AI algorithms may assist in symptom categorization or pre-screening photographs, but formal guidance and regulated chemical purchase approvals MUST involve certified agricultural experts or official manufacturer label warnings.

---

## 4. Multi-Role Capability Breakdown

| Role | Primary Functions & Responsibilities | Key Controls |
| :--- | :--- | :--- |
| **FARMER** | Farm/crop registration, visual symptom submission, product search, cart & checkout, order tracking, expert consultation request | Mobile phone authentication, regional i18n support |
| **SELLER** | Shop profile, license submission (CIB/Pesticide/Fertilizer), product catalog listing, stock updates, order acceptance/packing, sales reports | Requires ADMIN verification before listing products |
| **AGRICULTURAL EXPERT**| Queue management for assigned crop problems, image review, field symptom assessment, audio/text advisory notes, consultation closure | Certified credentials mandatory |
| **DELIVERY PARTNER** | Assigned order pickup from retail shop, route navigation, delivery verification (OTP/Photo proof), status update | Geo-fenced active district |
| **CALL CENTER AGENT** | Assisted farmer creation, phone search, remote cart build & checkout on behalf of farmer, telephonic crop problem logging | Full audit logging of agent actions |
| **ADMIN** | Platform analytics, seller license verification, product approval audit, category management, ticket escalation, system configuration | Superuser RBAC permissions |

---

## 5. Scope & MVP Focus

### MVP Focus (Phase 1 & 2):
- Crop Protection Marketplace (Insecticides, Fungicides, Herbicides, Bio-stimulants)
- Verified Local Seller Network
- Expert Crop Problem & Advisory Queue
- Call-Center Assisted Flow for Low-Literacy Farmers
- Multilingual Architecture (English, Telugu, Kannada, Hindi, Tamil, Marathi)

### Future Expansion (Phase 3+):
- Seeds & Fertilizers with Soil Test Integration
- Farm Equipment & Tool Rental Marketplace
- Telephony IVR Automated Voice Ordering System
- Geo-spatial Satellite Crop Health Monitoring
