# Seed generation refactor — notes

Goal: speed up game start. Root cause is that `generateSeedRounds`
(`apps/front/libs/seed.ts`) rebuilds the whole content library on every start:
it scans all ready sphericals/flats, then does 2 Firestore reads per image
(game + map → an N+1, see `apps/front/libs/round-normal.ts`). Scales linearly
with the library.

## How to run the ready-images count

The shared `db` in `@repo/providers` always targets the credential's project,
`(default)` database — NOT the `PROJECT_ID` constant. The repo's default gcloud
key (`~/.config/gcloud/service-account.json`) points to the WRONG project
(`pusher-292200`). The correct game project is `tiktok-generator-fa261`, whose
key is at the repo root: `service-account.json`.

Always run with the repo-root key so the header reads
`Credential project: tiktok-generator-fa261`:

```bash
GOOGLE_APPLICATION_CREDENTIALS=/Users/raphael/image-generator/service-account.json \
  pnpm --filter @repo/scripts run src/scripts/count-ready-images.ts
```

The script (`scripts/src/scripts/count-ready-images.ts`) prints a target-check
header (project / database / emulator) before counting, then reports the normal
pool, special pool, and a single-doc-vs-shard size estimate.

### Counts (fill in after running against tiktok-generator-fa261)

- Normal pool (status=READY & mapId): **131** (121 sphericals, 10 flats)
- Special pool (status=READY & thumbnail): **132** (110 sphericals, 22 flats)
- Decision: **single doc, no sharding.** Fully denormalized ≈ 80 KB per pool
  (~8% of the 1 MB limit). Keep the existing single `metadata/READY_IMAGES` doc,
  just enriched.

## Plan (agreed: Stage 1 + Stage 2)

**Stage 1 — make generation fast.** Pre-build the candidate pool incrementally
in `metadata/READY_IMAGES` (already maintained by
`functions/listen-docs/src/updates-ready-images.ts`). Enrich each entry with the
full pre-formatted round data (gameTitle, mapImage, mapWidth, …) so the join
happens once at write time. Rewrite `generateSeedRounds` to read that doc and
pick N random rounds — no library scan, no N+1. Add game/map update triggers to
keep the denormalized data fresh. Backfill script. Shard the doc if the count
exceeds ~1MB.

**Stage 2 — backup seed (instant fallback).** Add queryable `numberOfRounds` /
`hasSpecialRounds` to the seed schema (+ composite index). On lobby
creation/param change, attach a matching existing `backupSeedId`. In
`startLobby`, race live generation against a timeout and fall back to the backup
if slow/failed. Caveat: backup path skips `recentlyPlayedGameIds` repeat-avoidance.
