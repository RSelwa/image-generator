# Architecture notes for the next project

Conclusions from reviewing the current monorepo (`geo-gamer`), to reuse on a future repo.
Goal: keep the *organizational* benefits of the current setup without the build/relink machinery.

---

## 1. Why the current repo has built libs (the thing to avoid)

The `libs/*` packages (`common`, `schemas`, `providers`, `testing`) aren't complex for their
own sake. They need a build step (`tsdown` → `dist/` + `pnpm install` relink, i.e. `build:libs`)
because they are consumed by **many independent deploy targets**:

- `apps/front`
- 10+ cloud functions (`listen-docs`, `socials`, `daily-challenge`, …) — each deployed in isolation
- `scripts`

A deployed Firebase function ships alone and can't reach a sibling's TS source, so shared code
must be **pre-compiled to `dist/`**. That's the only reason for the build step.

Key insight: **libs are "overkill" only when there's no second independent deploy target.**
The front itself never needed the build — Next.js can consume raw workspace TS via
`transpilePackages`. The build is a tax paid for the multi-deploy topology.

---

## 2. Chosen approach for the next repo — Option A

Backend is just "Next.js route handlers + a few listener functions", so there's no real second
deploy target forcing a split. Put shared code in **plain folders inside the Next app**, imported
via TS path aliases. No workspace packages, no build, no `dist`, no relink.

### Folder layout

```
my-game/
  apps/
    front/
      next.config.ts
      tsconfig.json
      src/
        app/                    # pages + route handlers = the "API"
          api/.../route.ts
        shared/                 # ← was libs/schemas + libs/common
          schemas/              # zod = single source of truth (the genuinely valuable part)
          constants/
          utils/
        server/                 # ← was libs/providers (server-only)
          firebase-admin.ts
          db-refs.ts
        client/
          firebase.ts           # client SDK
        components/
        styles/
  functions/                    # ONLY if listener functions are needed
    listen-docs/
      package.json
      tsup.config.ts
      src/index.ts
```

### tsconfig path aliases (`apps/front/tsconfig.json`)

```jsonc
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@shared/*": ["./src/shared/*"],
      "@server/*": ["./src/server/*"]
    }
  }
}
```

- `@shared` is just a folder — no package, no build.
- Put `import "server-only"` at the top of `server/` files so `firebase-admin` can never leak
  into a client bundle.

### Killing the "built lib" pain for functions

Each function is a tiny package that **bundles** and reaches into the shared folder directly.
The bundler inlines the source, so there's no published lib to keep in sync.

```ts
// functions/listen-docs/tsup.config.ts
import { defineConfig } from "tsup"

export default defineConfig({
  entry: ["src/index.ts"],
  bundle: true, // inlines ../../apps/front/src/shared/* into the output
  platform: "node",
  format: ["esm"],
  noExternal: [/.*/], // bundle own code; keep node_modules external as appropriate
})
```

```ts
// functions/listen-docs/src/index.ts
import { seedDocSchema } from "../../../apps/front/src/shared/schemas"
```

Deploy = `tsup && firebase deploy`. No `build:libs`, no relink.
If reaching across `apps/` feels ugly, hoist `shared/` to a **top-level `shared/`** folder
consumed by both via relative path — still no package, still no build of it.

### Alternative kept on record — Option B

Keep `libs/*` as workspace packages but point their `exports` at `./src/index.ts` and add them
to `transpilePackages` in `next.config`. Front consumes raw TS; build cost only paid for
functions/scripts. Less radical, but doesn't fully remove the lib machinery. **Not chosen.**

---

## 3. Backend: Firebase vs Supabase

Pain points with Firebase noted on the current project: IAM, per-function deploy, GCP env sprawl,
having to bolt on OpenSearch for search.

What this kind of app actually uses: Firestore, **Realtime DB for presence/lobby**, Auth,
Storage, **Cloud Functions as doc-change listeners**, + OpenSearch.

| Concern | Firebase | Supabase |
|---|---|---|
| Realtime presence | RTDB `onDisconnect` is best-in-class for "who's in the lobby" | Realtime Presence is good, but server-authoritative disconnect cleanup is weaker — lean on Postgres + a cleanup job |
| IAM / GCP pain | Real (IAM, service accounts, per-fn deploy, env juggling) | Much simpler: one project/dashboard, Postgres roles + RLS |
| Listener functions | Native (`onDocumentWritten`) | DB Webhooks/triggers → Edge Functions, or `LISTEN/NOTIFY`; simpler deploy (Deno, one CLI) |
| Data model | Schemaless docs, flexible | Relational — leaderboards/aggregations (e.g. "top race runs by week") become clean SQL instead of denormalized counters |
| Search | Bolted-on OpenSearch | Postgres FTS / pgvector built-in — one less service |

**Read:** Supabase would remove most of the named pain (IAM, per-function deploy, env sprawl) and
simplify aggregation/leaderboard logic via SQL. It also reinforces Option A — Edge Functions are
Deno single-file bundles, so "no built libs" is even more natural.

**The one risk to validate first:** *presence*. Spike the lobby presence logic on Supabase
Realtime Presence before committing — the `onDisconnect` guarantee is the single feature Firebase
does clearly better, and it's load-bearing for a lobby game.

---

## 4. One thing to preserve regardless of backend

Keep **Zod schemas as the single source of truth** for both route handlers and functions.
That's the genuinely valuable part of today's `libs/schemas`, and it works perfectly as a plain
folder with no build step.

---

## 5. Framework: Next.js vs TanStack Start

A multiplayer game is client-heavy and highly interactive, so most of Next's headline value
(RSC, SSR streaming, ISR, image optimization, SEO) matters little here — and you pay the RSC
complexity tax (`"use client"` boundaries, server/client serialization) for benefits you barely use.

**TanStack Start fits this case unusually well:**
- Vite-based — simpler/faster dev than Next's bundler story; repo already leans Vite (`vitest`).
- Type-safe routing + typed search params — natively replaces today's `nuqs` usage.
- `createServerFn` server functions = a clean, thin RPC backend; matches the "just some endpoints"
  model and slots into Option A like route handlers do.
- No RSC mental model — SPA-first is the natural fit for a game UI.

**Costs:**
- Younger than Next (early 2026): smaller ecosystem, fewer examples, less battle-tested.
- Switching cost — Next is already known from `geo-gamer`.
- Ecosystem loss: `next-intl`, `next-themes`, Next image have no drop-in; i18n needs a deliberate pick.
- Hosting deploys widely (Nitro) but is less turnkey than Next-on-Vercel.

**Interactions:** Option A is framework-agnostic (shared folders + aliases identical). Supabase +
TanStack Query is a well-trodden combo; adopting Start nudges data layer from Redux Toolkit → TanStack Query.

**Read:** If willing to trade ecosystem maturity for a simpler, type-safe, Vite-native stack that
genuinely suits an interactive game → strong choice, reinforces the "simplify" theme. If you want
the safest path while *also* possibly moving to Supabase → stay on Next so only one big thing
changes at a time.
