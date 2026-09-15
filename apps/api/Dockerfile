# ==============================================================================
# FARM SEVA REST API — PRODUCTION DOCKERFILE
# Multi-Stage Container Build for Express.js + Prisma ORM
# ==============================================================================

FROM node:20-alpine AS builder

WORKDIR /app

# Copy root and package workspace manifests
COPY package.json package-lock.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/
COPY prisma/schema.prisma ./prisma/

# Install dependencies
RUN npm ci

# Copy source files
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api
COPY prisma ./prisma

# Build shared library, generate Prisma client, and compile TypeScript API
RUN npm run build --workspace=@farm-seva/shared
RUN npx prisma generate
RUN npm run build --workspace=@farm-seva/api

# --- Production Runner Stage ---
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

# Install OpenSSL for Prisma engine compatibility on Alpine
RUN apk add --no-cache openssl

# Copy node_modules, generated prisma client, and compiled code
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/shared ./packages/shared
COPY --from=builder /app/apps/api ./apps/api
COPY --from=builder /app/prisma ./prisma

EXPOSE 4000

# Healthcheck for container orchestrators
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000/health || exit 1

CMD ["node", "apps/api/dist/server.js"]
