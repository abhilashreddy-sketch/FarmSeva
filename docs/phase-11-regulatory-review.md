# ⚖️ FARM SEVA — PHASE 11 AGRICULTURAL MARKETPLACE REGULATORY & COMPLIANCE REVIEW

## Executive Summary
This document specifies the compliance boundaries, regulatory requirements, seller licensing isolation, and AI safety guardrails enforced across FARM SEVA in alignment with applicable Indian agricultural laws.

---

## 1. Indian Agricultural Input Licensing Requirements

1. **Insecticides & Pesticides Compliance:** Compliance with the **Insecticides Act, 1968** and **Insecticides Rules, 1971**. Sellers listing chemical pesticides MUST possess a valid state agricultural department pesticide license. CIBRC (Central Insecticides Board & Registration Committee) registration numbers MUST be verified before listing approval.
2. **Fertilizers Quality & Sales Control:** Compliance with the **Fertilizer (Control) Order, 1985 (FCO)** under the Essential Commodities Act, 1955. Mandatory retail license verification.
3. **Seeds Licensing:** Compliance with the **Seeds Act, 1966** and **Seeds Rules, 1968**. Mandatory seed license verification.

---

## 2. Master Compliance Isolation Principle

- **Seller Read-Only Restriction:** Sellers CANNOT self-certify or edit compliance attributes (`cgbRegistrationNo`, `toxicityClass`, `isFertilizerLicensed`, `isInsecticideLicensed`). Compliance master fields can ONLY be verified and edited by the **ADMIN** role (`apps/api/src/controllers/admin-marketplace-controller.ts`).

---

## 3. Critical Safety Rule: Zero Autonomous Pesticide Prescriptions

> [!CAUTION]
> **Safety Boundary Constraint:** FARM SEVA AI algorithms and automated recommendations MUST NEVER autonomously generate or prescribe specific chemical pesticide dosages, chemical tank mixes, or spraying schedules. All formal crop advisory prescriptions MUST be submitted strictly by verified human agricultural experts (`UserRole.AGRICULTURAL_EXPERT`).
