# Geo-Gamer

A geography guessing game where players identify games from spherical (360°) or flat images, with multiplayer lobbies, daily challenges, and a seed system.

## Stack

- **Frontend:** Next.js 16, React 19, TypeScript
- **State:** Redux Toolkit + RTK Query
- **Database:** Firebase Firestore + Storage
- **Styling:** Tailwind CSS 4, shadcn/ui, Radix UI
- **Forms:** React Hook Form + Zod
- **Monorepo:** Turborepo + pnpm
- **Tests:** Vitest, Playwright

## Structure

```
├── apps/
│   └── front/          # Next.js app
├── libs/
│   ├── common/         # Shared constants, utils, types
│   ├── schemas/        # Zod schemas (Firestore documents)
│   ├── providers/      # React context providers
│   └── testing/        # Test helpers
├── functions/          # Firebase Cloud Functions
├── rules/              # Firestore & Storage security rules
└── scripts/            # Deployment scripts
```

## Commands

Run from the root directory:

```bash
pnpm --filter @repo/front dev       # Start frontend dev server
pnpm --filter @repo/front build     # Build frontend
pnpm build:libs                     # Build all libs
pnpm lint                           # Run linter
```

## Docs

- [Daily Challenge](./docs/daily-challenge.md)
