# FARM SEVA — Production Infrastructure & Deployment Blueprint

This document provides step-by-step instructions for deploying the complete **FARM SEVA Multi-Channel Agricultural Marketplace Platform** to production infrastructure.

---

## 1. System Architecture Overview

```
                      ┌──────────────────────────────────────────────┐
                      │              Supabase PostgreSQL             │
                      │          (AWS ap-south-1 Mumbai)             │
                      └──────────────────────┬───────────────────────┘
                                             │
                       ┌─────────────────────┴─────────────────────┐
                       │    Prisma ORM Connection Pooler (6543)    │
                       └─────────────────────┬─────────────────────┘
                                             │
                                 ┌───────────┴───────────┐
                                 │   FARM SEVA REST API  │
                                 │   (Node.js / Express) │
                                 │ https://api.farmseva.com│
                                 └───────────┬───────────┘
                                             │
      ┌──────────────────┬───────────────────┼───────────────────┬──────────────────┐
      │                  │                   │                   │                  │
┌─────┴───────┐   ┌──────┴──────┐    ┌───────┴──────┐    ┌───────┴──────┐   ┌───────┴──────┐
│ Farmer Web  │   │ Seller Web  │    │  Expert Web  │    │ Delivery Web │   │  Admin Web   │
│ Next.js 14  │   │ Next.js 14  │    │  Next.js 14  │    │  Next.js 14  │   │  Next.js 14  │
│farmer.farm..│   │seller.farm..│    │expert.farm...│    │delivery.fa...│   │admin.farm... │
└─────────────┘   └─────────────┘    └──────────────┘    └──────────────┘   └──────────────┘
```

---

## 2. Database Tier Setup (Supabase PostgreSQL)

1. Log into your **Supabase Dashboard** (`https://supabase.com/dashboard`).
2. Obtain your project connection strings under **Project Settings $\rightarrow$ Database**:
   - **Transaction Pooler URL (`DATABASE_URL`):**
     `postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true`
   - **Direct Session URL (`DIRECT_URL`):**
     `postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:5432/postgres`
3. Execute production database schema synchronization:
   ```bash
   # Generate Prisma Client
   npx prisma generate

   # Push latest schema updates to Supabase
   npx prisma db push
   ```

---

## 3. Express REST API Deployment (`apps/api`)

### Option A: Cloud Hosting (Render / Railway / DigitalOcean App Platform)
1. Connect your GitHub repository: `https://github.com/abhilashreddy-sketch/FarmSeva`.
2. Configure build settings:
   - **Build Command:** `npm ci && npm run build --workspace=@farm-seva/shared && npx prisma generate && npm run build --workspace=@farm-seva/api`
   - **Start Command:** `node apps/api/dist/server.js`
   - **Environment Variables:** Populate all keys specified in `apps/api/.env.production.example`.
3. Set dynamic domain or custom CNAME: `https://api.farmseva.com`.

### Option B: Docker Container Deployment (AWS AppRunner / Cloud Run / ECS)
Use the included `apps/api/Dockerfile`:
```bash
# Build image
docker build -t farm-seva-api -f apps/api/Dockerfile .

# Run container with environment file
docker run -d -p 4000:4000 --env-file apps/api/.env.production farm-seva-api
```

---

## 4. Web Frontends Deployment (Vercel)

Deploy each of the 5 Next.js web applications as individual Vercel projects:

| Application | Root Directory | Build Command | Output Directory | Recommended Custom Domain |
| :--- | :--- | :--- | :--- | :--- |
| **Farmer Web** | `apps/farmer-web` | `npm run build` | `.next` | `https://farmer.farmseva.com` |
| **Seller Web** | `apps/seller-web` | `npm run build` | `.next` | `https://seller.farmseva.com` |
| **Expert Web** | `apps/expert-web` | `npm run build` | `.next` | `https://expert.farmseva.com` |
| **Delivery Web** | `apps/delivery-web` | `npm run build` | `.next` | `https://delivery.farmseva.com` |
| **Admin Web** | `apps/admin-web` | `npm run build` | `.next` | `https://admin.farmseva.com` |

**Mandatory Environment Variable for ALL Frontends:**
```env
NEXT_PUBLIC_API_URL=https://api.farmseva.com
```

---

## 5. Third-Party Provider Setup & Webhooks

### 1. Razorpay Payment Gateway
- Log into **Razorpay Dashboard $\rightarrow$ Settings $\rightarrow$ API Keys** to generate Live `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`.
- Go to **Settings $\rightarrow$ Webhooks $\rightarrow$ Add New Webhook**:
  - **Webhook URL:** `https://api.farmseva.com/api/v1/payments/webhook`
  - **Secret:** Enter your generated `RAZORPAY_WEBHOOK_SECRET`.
  - **Active Events:** `payment.captured`, `payment.failed`, `order.paid`.

### 2. MSG91 SMS & OTP Provider (India DLT Compliant)
- Register your DLT entity and template IDs.
- Configure `MSG91_AUTH_KEY`, `MSG91_SENDER_ID`, and DLT template IDs in API environment.

### 3. AWS S3 / Cloudflare R2 Cloud Storage
- Create a bucket named `farm-seva-production-assets` in `ap-south-1` (Mumbai).
- Enable CORS permissions on the bucket to allow GET/PUT requests from your web domains.

---

## 6. Verification & Operational Probes

### Health Check Probes
- **Liveness Probe:** `GET https://api.farmseva.com/health` $\rightarrow$ Returns HTTP `200 OK`
- **Readiness Probe:** `GET https://api.farmseva.com/ready` $\rightarrow$ Validates database connection state

### Automated Test Verification
Run full production sanity checks locally before each deployment push:
```bash
# 1. Typecheck entire monorepo
npx tsc --noEmit

# 2. Run backend integration test suite
npx tsx apps/api/src/__tests__/run-tests.ts
```
