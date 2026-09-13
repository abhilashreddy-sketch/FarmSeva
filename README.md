# FARM SEVA - Multi-Channel Agricultural Marketplace

FARM SEVA is a multi-channel agricultural marketplace designed for Indian farmers, agricultural retailers, crop protection experts, and logistics partners.

---

## Key Features & Channels
- **Farmer Self-Service:** Simple, accessible interface for low digital literacy farmers.
- **Assisted Call-Center Interface:** Enables agents to create farmer profiles, log crop problems, and place orders on behalf of farmers over phone calls.
- **Local Seller Portal:** Agricultural dealers manage inventory, accept orders, and fulfill local deliveries.
- **Agricultural Expert Workstation:** Certified experts review crop photographs and prescribe safe, non-automated crop protection guidance.
- **Admin Governance Dashboard:** Comprehensive seller verification, product compliance audit, and platform logs.

---

## Project Structure
```
farm seva/
├── apps/
│   ├── api/                 # Node.js + Express + TypeScript REST API backend
│   └── web/                 # Next.js + Tailwind CSS + TypeScript frontend
├── packages/
│   └── shared/              # Shared types, state machines, i18n locales & constants
├── prisma/
│   └── schema.prisma        # Normalized PostgreSQL database schema (30+ entities)
├── docs/
│   ├── requirements.md      # Product Requirements Document
│   ├── architecture.md      # Comprehensive Technical Architecture & ERD
│   └── roadmap.md           # Phased Development Roadmap
├── docker-compose.yml       # Docker environment setup (PostgreSQL, Redis, API, Web)
├── .env.example             # Environment configuration template
├── package.json             # NPM workspace configuration
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js >= 20.x
- npm >= 10.x
- Docker & Docker Compose (optional for local DB setup)

### Installation
1. Clone the repository and install dependencies:
```bash
npm install
```

2. Configure Environment Variables:
```bash
cp .env.example .env
```

3. Start PostgreSQL and Redis via Docker:
```bash
docker-compose up -d postgres redis
```

4. Generate Prisma Client:
```bash
npm run db:generate
```

5. Run Development Servers:
```bash
npm run dev
```

---

## Regulatory & Compliance Notice
> **Safety Rule:** FARM SEVA strictly prohibits automated AI prescribing of regulated chemical pesticides. All regulated crop protection advice requires review by certified agricultural experts or official manufacturer label display.
