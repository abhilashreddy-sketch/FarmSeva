# 🚜 FARM SEVA — PHASE 11 CLOUD DEPLOYMENT GUIDE

## Executive Summary
This guide documents the containerization, environment setup, database migration protocol, and cloud deployment procedures for FARM SEVA on Kubernetes / AWS ECS / Render.

---

## 1. Containerization Specifications

### 1.1 Multi-Stage Dockerfile Strategy
```dockerfile
# Stage 1: Build Environment
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build --workspace=apps/api
RUN npm run build --workspace=apps/web

# Stage 2: Production Runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/prisma ./prisma

EXPOSE 4000 3000
CMD ["node", "apps/api/dist/server.js"]
```

---

## 2. Zero-Downtime Deployment & Health Checks

### 2.1 Kubernetes Probe Configuration
```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 4000
  initialDelaySeconds: 10
  periodSeconds: 15

readinessProbe:
  httpGet:
    path: /ready
    port: 4000
  initialDelaySeconds: 15
  periodSeconds: 10
```

---

## 3. Database Migration Protocol

1. **Pre-Deployment Backup:** Perform automated database snapshot before running migrations (`scripts/backup-restore.ts`).
2. **Schema Migration:** Execute non-destructive schema migrations using `npx prisma migrate deploy`.
3. **Migration Locking:** Prisma migration engine guarantees single-instance migration execution using advisory locks.
