# Decisions

## TCG data › CARD_RARITY + cardProperties on maps

Committed straight on `develop` (TCG phase: no branch / PR).

- **`cardPropertiesSchema` in its own file** (`libs/schemas/src/firestore/card-properties.ts`), with `cardRaritySchema`, `CardRarity` and `CardProperties`. `CardRarity` has no importer yet; the pools, the draw util and the UI will use it.
- **`rarity` is required inside `cardProperties`**, `cardProperties` itself is optional: a map is either not a card, or a card with a rarity. No `.default()` on it, so a map without card properties never gets one back from a parse.
- **`ultraRare` in camelCase** for the stored value, matching the camelCase field and collection names.
- `createMapInputSchema` / `updateMapInputSchema` derive from `mapDocSchema`, so they carry `cardProperties` with no extra code. `updateMapInputSchema.parse` still fills the map's other defaults (existing `.partial()` behaviour, unchanged).

## TCG data › Schemas for card pools, owned cards and packs

- **Pool doc field is `maps`**, not `mapIds` as first planned: it holds `{ mapId, gameId }` objects, not ids. `cardPoolEntrySchema` is shared with the owned card schema (spread), so both carry the same pair.
- **Owned cards schema is `userCardDocSchema`** (`users/{uid}/cards/{mapId}`), file `user-card.ts`: `count` positive int, `cardPropertiesAtPull` reuses `cardPropertiesSchema`, `firstPulledAt` / `lastPulledAt` required timestamps.
- **`packsStored`**: int in `[0, PACKS_MAX]`, `.optional().default(PACKS_MAX)` — not `.nullish()` like `credits`, so a parse always yields a number and the pack util never handles `null`. Absent → full stock.
- **`packsRefillAnchor`**: `timestampSchema.nullish().default(null)`. `null` means the stock was never consumed.
- **Only `PACKS_MAX` added now.** `PACK_REFILL_MS` / `PACK_SIZE` land with the utils that read them (reviewer finding: no unread constants).
- `TABLES.CARDS` / `TABLES.CARD_POOLS` added and mapped in `DocumentMapping` (the testing ORM requires every table to be mapped). `libs/testing` user factory gains the two pack fields.

## TCG data › Rules + tests

- **`cardProperties` guard on both map matches.** `games/{g}/maps/{m}` and the collectionGroup `{path=**}/maps/{map}` both match a map write, and rules are OR'ed: guarding only one would let an iconograph set a rarity through the other. Iconographs still create / update maps, minus `cardProperties` (`adminOnlyMapFields()`, top-level key, so future card sub-fields are covered).
- **Admin client writes on `cards` / `cardPools` are allowed**, not denied as first planned: the global `match /{document=**}` admin rule grants them and rules can't subtract. Tests assert that. Normal users and signed-out visitors are denied every write.
- **`packsStored` / `packsRefillAnchor` join `serverOnlyUserFields()`**, same create + update guard as `credits`. The user doc stays public-readable (unchanged), so the owner reads their stock.
- `users/{uid}/cards/{card}`: owner-only read. `cardPools/{rarity}`: public read.

## TCG data › Create user CF sets the pack stock

- Only `packsRefillAnchor: now` is passed (the same `now` as `createdAt`). `packsStored` comes from the schema default (`PACKS_MAX`), so the CF doesn't repeat it; the test still asserts the stored value.

## Admin map rarity › Rarity select in the map form

- **Select in `map-id.tsx`**, same pattern as the achievement difficulty select: a `NO_CARD_RARITY = "none"` sentinel ("Not a card") plus one item per `CARD_RARITY`, `SELECTORS.MAP_FORM_CARD_RARITY(_OPTION)` test ids. Picking a rarity sets `cardProperties: { rarity }`, "Not a card" sets it to `undefined`.
- **Removal goes through `deleteField()`** in `updateMapById` (`cardProperties || deleteField()`): the form always sends the full map, so an absent `cardProperties` means "not a card". Its only caller is this form. `createMap` needs nothing: `ignoreUndefinedProperties` is on.
- **No Storybook story**, unlike the plan: the modal is bound to RTK Query, nuqs and the router, and no admin form in the repo has one. Covered by e2e instead (`e2e/tcg/admin-map-rarity.spec.ts`): one test per rarity, and "Not a card" removing `cardProperties`. E2E not run locally (CI-only).

## Admin map rarity › Rarity badge + filter on the admin maps page

- **The admin maps page loads every map.** `getMaps` was an infinite query capped at 100 with no "load more", so a filter over it could not show every map left to rate, and Firestore can't query a missing field ("not rated"). Its only consumer was this page: it becomes a plain query over the `maps` collectionGroup (reads every map on each visit, admin-only). `DEFAULT_SIZE_MAPS` and the pagination imports go with it.
- **Client-side filter**: pure `filterMapsByCardRarity` (`utils/card-rarity.ts`) + `cardRarityFilterSchema` (`schemas/card-rarity-filter.ts`, union of the rarities and `CARD_RARITY_FILTER.ALL / NOT_RATED`, `.catch(ALL)`), `CardRarityFilter` derived from it. Filter kept in `useState`, not the URL.
- **Badge colours** (`CARD_RARITY_TO_BADGE_VARIANT`): common neutral, uncommon green, rare blue, ultraRare purple, legendary yellow. The badge also shows in the admin maps-gallery modal (same `MapCard`).
- **No story / play test**: no storybook test runner in the repo, and `MapCard` needs nuqs. Unit tests + e2e (`e2e/tcg/admin-map-rarity.spec.ts`: filter by a rarity, filter "not rated").
- **Kept as one commit** although the reviewer flagged `SCOPE: SPLIT` (badge vs filter): the user asked for one commit per sub-bullet and to take every decision alone.

## Process (TCG phase)

- **Commits stay local on `develop`, not pushed**: pushing the shared branch is outward-facing and wasn't asked. Consequence: CI doesn't run, so the e2e specs written here are unverified until the next push.
- **E2E not run locally** (CI-only per the working rules). Unit, rules (emulator) and function (emulator) tests are run locally on every sub-bullet.
- **`DECISIONS.md` is committed with each sub-bullet** from here on. It had been emptied before the TCG phase started; that emptying is committed with it (the old decisions remain in git history).

## Admin map rarity › Count per rarity

- **Counts computed client side** from the maps the page already loads (every map), with `countMapsByCardRarity` reusing `filterMapsByCardRarity` over the same options as the filter select, so the badges read "All maps / Not rated / <rarity>: n" with the select's labels.
- **The util stays although it has one caller**: inlining it (tried after review round 1) left the feature without any test; `workflow.md` ("tests ship with the change") outranks the one-call-site rule. Concrete param type, no generic.
- **No e2e for the counts**: the emulator DB is shared by every spec, so absolute counts aren't stable to assert.

## Card pools › Trigger keeping the pools in sync

- **Hooked into the existing `listen_doc_maps_written`** (same `games/{gameId}/maps/{mapId}` path), next to `refreshReadyImagesForMap` in a `Promise.all`, instead of a second trigger on the same document.
- **`updateCardPools`** (`update-card-pools.ts`): compares `before?.cardProperties?.rarity` and `after?.…`; equal → no write (any other map edit costs nothing). Otherwise one batch: `arrayRemove({ mapId, gameId })` on the old pool, `arrayUnion` on the new one, both `set(…, { merge: true })` so a pool doc is created on its first card.
- Deleting a card map is the same "rarity → none" transition: it leaves its pool.
- Tests on the emulator through `firebase-functions-test` (file precedent): added, created as a card, rarity changed, removed, deleted, unchanged rarity.
