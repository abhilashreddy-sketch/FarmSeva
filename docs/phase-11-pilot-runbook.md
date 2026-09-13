# 🚜 FARM SEVA — PHASE 11 CONTROLLED REAL-FARMER PILOT RUNBOOK

## Executive Summary
This runbook defines the operational procedures, regional bounding, onboarding criteria, feedback collection, and incident escalation protocols for launching the controlled real-farmer pilot of FARM SEVA.

---

## 1. Configurable Pilot Regional Scope

- **Pilot Regions:** Guntur & Prakasam Districts (Andhra Pradesh), Kolar District (Karnataka), Nashik District (Maharashtra).
- **Environment Toggle:** `PILOT_MODE=true` in `apps/api/src/config/env.ts`.
- **Pilot User Limits:** Initial pilot cohort restricted to 500 verified farmers, 25 licensed input dealers, 10 agronomists/experts, and 15 local delivery partners.

---

## 2. End-to-End Pilot Journey Verification

```
[ Farmer Onboarding ] ──► [ Farm & Crop Registration ] ──► [ Crop-Aware Product Discovery ]
                                                                     │
                                                                     ▼
[ Delivery Confirmation ] ◄── [ Order Processing & Dispatch ] ◄── [ COD / Online Payment ]
```

---

## 3. Incident Handling & Operational Escalation

1. **Order Delivery Issue:** Call center agent assigns priority ticket to regional logistics partner via IVR/Call Center portal (`/call-center`).
2. **Crop Pest Outbreak Alert:** Regional agronomist issues verified advisory; Admin dispatches emergency regional notification broadcast (`/api/v1/communications/emergency-broadcast`).
3. **Disputed Transaction / Refund Request:** Customer dispute routed to Admin reconciliation desk for idempotent double-entry refund reversal.
