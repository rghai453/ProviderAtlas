# ProviderAtlas

Texas Healthcare Provider Intelligence — public data SaaS aggregating NPI registry and Open Payments data.

## Stack
- Next.js 15+ (App Router, TypeScript, Tailwind CSS v4)
- Drizzle ORM + Neon Postgres
- Neon Auth (authentication)
- Stripe (subscriptions + one-time payments)
- Resend (email alerts)
- Upstash Redis (rate limiting)

## Architecture
- All DB access goes through `src/lib/services/` — NEVER import db in pages/routes
- Server components call service functions for data
- Client components are leaf nodes for interactivity only
- Zod validation at all API boundaries
- `import type` for type-only imports

## Key Commands
```bash
pnpm dev              # Start dev server
pnpm build            # Production build
pnpm drizzle-kit generate  # Generate migrations
pnpm drizzle-kit push      # Push schema to DB
pnpm tsx scripts/ingest/fetch-npi.ts     # Fetch NPI data
pnpm tsx scripts/ingest/seed.ts          # Seed database
```

## Data Flow
1. Scripts fetch from NPI Registry + Open Payments APIs
2. Data normalized and seeded to Postgres via Drizzle
3. Service layer queries data for pages
4. Programmatic SEO pages generated for providers, specialties, cities, ZIPs

## Monetization
- Free tier: browse providers, basic search
- Pro ($29/mo): contact info reveal, CSV export, saved searches, alerts
- Data lists: one-time Stripe purchases for pre-built CSV datasets
