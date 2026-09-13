# 🚜 FARM SEVA — PHASE 11 PRODUCTION ARCHITECTURE SPECIFICATION

## Executive Summary
This document specifies the target cloud production architecture for FARM SEVA, detailing component topology, request lifecycles, database connection pooling, object storage isolation, Redis job queues, and high availability design.

---

## 1. High-Level Production System Topology

```
                               ┌─────────────────────────┐
                               │   Cloudflare DNS & WAF  │
                               └────────────┬────────────┘
                                            │ (HTTPS / TLS 1.3)
                                            ▼
                               ┌─────────────────────────┐
                               │ NGINX / Cloud Ingress   │
                               └────────────┬────────────┘
                                            │
                     ┌──────────────────────┴──────────────────────┐
                     ▼                                             ▼
        ┌─────────────────────────┐                   ┌─────────────────────────┐
        │ Next.js Web App Cluster │                   │ Node.js REST API Node   │
        └─────────────────────────┘                   └────────────┬────────────┘
                                                                   │
               ┌───────────────────────┬───────────────────────────┼───────────────────────────┐
               ▼                       ▼                           ▼                           ▼
    ┌────────────────────┐   ┌────────────────────┐     ┌────────────────────┐     ┌────────────────────┐
    │ Managed PostgreSQL │   │   Managed Redis    │     │   S3 / Cloudflare  │     │ External Gateways  │
    │   (SSL & Pool)     │   │ (Cluster & Queue)  │     │   Object Storage   │     │ (Payment/SMS/IVR)  │
    └────────────────────┘   └────────────────────┘     └────────────────────┘     └────────────────────┘
```

---

## 2. Component Design & Scaling Rules

### 2.1 API Monolith Service Boundary
- Built with Express 4, TypeScript, and Prisma ORM.
- Containerized via Docker (`node:20-alpine`) running statelessly.
- Horizontal pod autoscaling (HPA) based on CPU/Memory usage (scale trigger at 70% CPU).

### 2.2 Managed Database Layer (PostgreSQL 15+)
- Connection pooling via PgBouncer / Prisma connection pool (`connection_limit=20`).
- SSL/TLS connection mandatory (`sslmode=require`).
- Read-replica replication for heavy search/marketplace query offloading.

### 2.3 Managed Redis & Asynchronous Workers
- Redis 7 instance handling session caching, rate limiting, and background job queueing.
- Workers process SMS, WhatsApp, Push, IVR telephony dispatches, and webhook retries asynchronously without blocking HTTP response loops.

### 2.4 Cloud Object Storage (S3 / Cloudflare R2)
- All user-uploaded media (Crop symptom photos, business licenses, invoice PDFs) stored in private cloud buckets.
- Uploads validated for MIME type (`image/jpeg`, `image/png`, `image/webp`) and size (max 5MB).
- Access served via short-lived pre-signed URLs (`generateSignedUrl`).
