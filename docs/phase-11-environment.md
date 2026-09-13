# 🚜 FARM SEVA — PHASE 11 ENVIRONMENT & SECRET MANAGEMENT SPECIFICATION

## Executive Summary
This document specifies the strict environment isolation, secret management rules, startup validations, and environment matrix across LOCAL, STAGING, and PRODUCTION environments for FARM SEVA.

---

## 1. Strict Isolation Principles

1. **Zero Secret Hardcoding:** Secrets (JWT keys, database passwords, API tokens, encryption keys) MUST NEVER be committed to Git.
2. **Production Startup Secret Guard (`env.ts`):** The API process terminates immediately if `NODE_ENV=production` and mandatory secrets (`JWT_SECRET`, `REFRESH_TOKEN_SECRET`, `ENCRYPTION_SECRET`, `DATABASE_URL`) are missing or match development defaults.
3. **Environment Separation:** Development fallback providers MUST NEVER be accessible from staging or production builds.

---

## 2. Environment Matrix

| Environment Variable | Category | Required in Prod? | Validation Rule |
|---|---|---|---|
| `NODE_ENV` | Environment | Yes | Must be `production` |
| `PORT` | Networking | Yes | Integer (default 4000) |
| `JWT_SECRET` | Cryptography | Yes | Min 32 chars, not dev default |
| `REFRESH_TOKEN_SECRET` | Cryptography | Yes | Min 32 chars, not dev default |
| `ENCRYPTION_SECRET` | Financial Security | Yes | Exactly 32 bytes, not dev default |
| `DATABASE_URL` | Infrastructure | Yes | PostgreSQL connection string with SSL |
| `REDIS_URL` | Infrastructure | Yes | Managed Redis cluster connection string |
| `CORS_ORIGINS` | Network Security | Yes | Comma-separated domains (No `*`) |
| `STORAGE_PROVIDER` | Assets | Yes | `S3` or `R2` |
| `RAZORPAY_KEY_ID` | External Gateway | Conditional | Required for real live payments |
| `SMS_API_KEY` | External Gateway | Conditional | Required for real live SMS dispatches |
| `WHATSAPP_API_TOKEN` | External Gateway | Conditional | Required for real live WhatsApp |
| `IVR_API_KEY` | External Gateway | Conditional | Required for real live IVR calls |
| `FCM_SERVER_KEY` | External Gateway | Conditional | Required for real live push |
