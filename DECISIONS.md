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

## Card pools › Rebuild script

- **`scripts/src/scripts/rebuild-card-pools.ts`, not run.** Run it once after deploying the trigger (maps rated before the deploy never fired it), or to repair drift:
  `GOOGLE_APPLICATION_CREDENTIALS=/Users/raphael/image-generator/service-account.json pnpm --filter @repo/scripts run src/scripts/rebuild-card-pools.ts`
- **Overwrites all 5 pool docs**, empty ones included, so a drifted pool is cleared rather than merged.
- **`gameId` from the doc path** (`map.ref.parent.parent.id`), the same source as the trigger's `event.params.gameId`, so `arrayRemove` always matches what the rebuild wrote. A doc without a parent game is skipped.
- **Grouping is a pure `buildCardPools`** in `libs/schemas` `card-pool.ts` (precedent: `buildReadyImageItem`), unit tested. `refs[TABLES.CARD_POOLS]` added to `libs/providers`.
- No header comment in the script (no-comments rule); the run command lives here.

## Packs API › Pack refill utils

- **`libs/common/src/utils/packs.ts`**: `getAvailablePacks`, `getNextPackAt`, `consumePack`, all taking one `{ packsStored, refillAnchorMs, nowMs }` object. **Milliseconds, not Timestamps**, so the endpoint (admin SDK) and the front (client SDK) call the same code.
- `PACK_REFILL_MS = 10 min` added with its first reader.
- **Full stock or never consumed (`refillAnchorMs: null`) → consuming restarts the refill from `now`**; otherwise the anchor advances by whole consumed periods only, so the partial progress toward the next pack is kept. A full stock doesn't bank refill time beyond the cap.
- `consumePack` returns `null` when no pack is available (a normal outcome, not an error). `getNextPackAt` returns `null` when full or never consumed. An anchor in the future adds no pack (clock skew).

## Packs API › Draw utils

- **`apps/front/utils/card-draw.ts`** (its only consumer is the Next API route). `CARD_RARITY_WEIGHTS` (60 / 25 / 10 / 4 / 1), `GUARANTEED_CARD_RARITIES` (rare, ultraRare, legendary) and `PACK_SIZE = 5` are game rules in `libs/common` constants, next to `CARD_RARITY`.
- **`drawRarities(random)`**: slots 1–4 weighted over every rarity, the last slot weighted over the guaranteed rarities only (10 / 4 / 1, i.e. the weights renormalised).
- **`pickCard(pools, rarity, random)`**: empty pool → next rarity **down**, then **up** if nothing lower has cards, so a pack only fails when no map is rated at all. Returns `{ rarity, entry }` with the rarity actually drawn (the card is recorded under it), or `null` when every pool is empty — the endpoint turns that into an error response.
- `random` is injected in both, so the tests pin every rarity band, the guaranteed slot and the fallbacks.

## Packs API › `POST /api/packs/open`

- **One transaction, every read first**: user + the 5 pools, then the drawn maps + the user's owned cards for them, then the writes. 409 (no pack) and 503 (no rated card anywhere) return before any write, so no pack is consumed. No side effect outside Firestore, so a transaction retry is safe (it re-rolls).
- **Status codes**: 401 no / invalid token, 404 user doc missing, 409 no pack, 503 no card, 500 otherwise. Body ignored: the uid comes only from `verifyIdToken`.
- **Duplicates inside one pack** are grouped: one `create` (count = occurrences) or one `increment` per map. `isNew` is true only on a map's first reveal in the pack, and only if the user didn't own it.
- **`cardPropertiesAtPull`** snapshots the map doc's `cardProperties`; falls back to the pool rarity if the map doc is gone (pool drift). The response carries map name / image for the reveal.
- **Response schema** `openPackResponseSchema` in `apps/front/schemas/packs.ts` (cards + new `packsStored` + `packsRefillAnchorMs`), parsed by the redux endpoint.
- **`getVerifiedUid` duplicated** from the achievements route (2 copies). The third route needing it moves it to a shared util; extracting now would edit the achievements route (a refactor outside this sub-bullet).
- **Pools read inside the transaction**: a pool write by the trigger during an open makes it retry, which is safe. Move the pool reads out of the transaction if contention ever shows.
- **Tests**: e2e request spec `e2e/tcg/open-pack.spec.ts` (API-route precedent). Success tests seed all 5 pools with one known map for a deterministic draw; accepted flake risk: a late `listen-docs` trigger from another spec adding a map to a pool mid-test (CI runs one worker). Not run locally (CI-only).

## Packs API › Redux endpoint

- **New `packsApi`** (one API per domain), registered in the store. `openPack` mirrors `sendAchievementEvent`: id token from `auth.currentUser`, `POST` with the bearer, `globalErrorHandler` on a non-OK answer, body parsed with `openPackResponseSchema`.
- **Invalidates `UserCards` only, on success.** The collection query (Front TCG) provides that tag. The pack stock needs no invalidation, unlike the plan's wording: it lives on the user doc, which `authApi` already listens to live (`onSnapshot`), so the store updates by itself after the server write.
- First unit-tested redux API in the repo (`packs.test.ts`: `auth` and `fetch` mocked, store built with only `packsApi`).

## Front TCG › `TCG` feature flag

- `FEATURE_FLAGS.TCG = "tcg"`, same pattern as Credits / Achievements: listed by the dev tools automatically, enabled with `?ff=tcg-true`. The existing `it.each(Object.values(FEATURE_FLAGS))` round-trip test covers it, so no dedicated test.
- **UI strings go through next-intl** (`messages/en.json` + `fr.json`), like the achievements pages — the app is localized.

## Front TCG › `MapTradingCard`

- **`components/cards/map-trading-card.tsx`**: 5:7 card, map image, name, optional game title, rarity badge, `×n` badge when `count > 1`.
- **Rarity frame via `data-rarity`** + Tailwind `data-[rarity=…]:` variants (border colour per rarity, coloured glow on ultraRare / legendary), not a class branch. Frame colours follow the badge colours (`CARD_RARITY_TO_BADGE_VARIANT`).
- **`gameTitle` is optional**: the open-pack response has no game title (the reveal shows the map only); the collection page passes it.
- Labels through next-intl `tradingCard` (en + fr). One story per rarity + `WithGame` + `Duplicate` (`stories/MapTradingCard.stories.tsx`, AchievementCard precedent).

## Front TCG › Packs page

- **Pack stock through the session user**: `sessionUserSchema` gains `packsStored` (default `PACKS_MAX`) and `packsRefillAnchorMs`, mapped in `formatSessionFromFirebaseUser` from the user doc the app already listens to live. Milliseconds so the store stays serializable; two primitive selectors (`selectPacksStored`, `selectPacksRefillAnchorMs`). After an open, the server write reaches the page through that snapshot — no refetch.
- **`PackCounter`** (`components/tcg/pack-counter.tsx`) is presentational with its own 1 s tick: `7/10` from the shared `getAvailablePacks`, countdown from `getNextPackAt` (`formatCountdown` → `m:ss`), "stock full" instead of a timer when full. The pack is a `<button disabled>` at 0 or while opening (styled with `disabled:` variants).
- **`PacksContent`**: TCG flag gate + redirect home (achievements page pattern), `page.tsx` for the metadata only.
- **After an open, the 5 cards show in a grid** with "Back to packs" (`reset`), so opening is visible in this sub-bullet on its own; the next sub-bullet puts the Pokémon-style pile in front of it.
- **No play tests**: there is no story test runner in the repo. Stories Full / Partial / Empty / AboutToRefill / Opening; the timer and count logic is unit tested (`libs/common` packs utils, `utils/countdown.test.ts`, `utils/user.test.ts` for the session mapping).
- Copy reads the refill time and the max from the constants (`{minutes}`, `{max}`), en + fr.
- Kept as one commit although the reviewer flagged `SCOPE: SPLIT` (stock display vs opening): one commit per sub-bullet, user's call.

## Front TCG › Pack opening pile

- **`PackReveal`** (`components/tcg/pack-reveal.tsx`): one `<button>` per card, stacked with an inline `zIndex`; only the top one is enabled, so a click or native Enter / Space reveals the next. Revealed cards get `data-revealed=true` → Tailwind `translate-x` + `rotate` + `invisible`, with `transition-[transform,visibility]` so the card slides before it hides; `motion-reduce:transition-none`. `m/5` counter under the pile.
- The endpoint returns the guaranteed rare+ card last, so it sits at the bottom of the pile.
- **Last card**: the summary replaces the pile in the same render, so the 5th card doesn't slide out. Accepted: showing the result right away beats a transition-end handler that never fires under reduced motion.
- **Summary**: grid of the 5 cards, `new` badge on first pulls, "Open another" when the stock right after the open (`openedPack.packsStored`) is > 0, "Back to packs". `PackReveal` is keyed by the mutation `requestId`, so a second open starts a fresh pile.
- **"See collection" deferred** to the collection-page sub-bullet: the route doesn't exist yet, a link now would 404.
- **Tests**: e2e `e2e/tcg/packs-page.spec.ts` (click → 2/5, Enter → 2/5, 5 reveals → summary with one `new` badge and "Open another", last pack → no "Open another"), pools seeded with one map through the shared `e2e/helpers/tcg.ts`. Stories: `Pile`. No play tests (no story runner).

## Front TCG › Collection page

- **Server page reads the public data**: the 5 `cardPools` docs (= every card), one batched `db.getAll` of their map docs (name, image), and the `gamesList` metadata for game titles. **The client reads only the user's owned counts** (`getUserCardCounts` in `packsApi`, owner-only by the rules, provides the `UserCards` tag the open mutation invalidates, so a new pack refreshes the collection).
- **`buildCollectionGroups`** (`utils/collection.ts`, pure): one group per game sorted by title, rarest first (rank = `CARD_RARITY` key order, common → legendary), owned count per game; total = the game's cards in the pools. Unknown game title → the game id.
- **Owned → `MapTradingCard` with its count, unowned → a locked silhouette** (rarity frame via `data-rarity`, lock icon, `aria-label`), inline since it's rendered at one site.
- **`buildCollectionGroups` kept extracted with one production caller**, overruling `simplicity.md`'s 2-call-site rule (reviewer blocked twice): inlining deletes its unit tests, and a story `play` wouldn't replace them — Storybook exists but nothing runs stories (vitest only includes `**/*.test.ts`). "Tests ship with the change" wins here; same reasoning as `countMapsByCardRarity`.
- **"See collection"** (deferred by the pile sub-bullet) added to the pack summary now that the route exists.
- `packs.test.ts` mocks `@/constants/db-refs` (module-load Firestore refs now imported by `packs.ts`).
- Signed-out (no uid): the page shows its heading only; the page is reached from the signed-in menu.
- Tests: unit (`utils/collection.test.ts`), e2e `e2e/tcg/collection-page.spec.ts` (`1/2` progress, owned card, locked card). No story (no runner).

## Front TCG › Menu tabs

- **Two items, Packs and Collection**, in the user dropdown right after Achievements, same markup (`asChild` `Link`, `SELECTORS.NAV_PACKS` / `NAV_COLLECTION`), behind the `TCG` flag; lucide `Package` / `Layers`; en + fr.
- E2E `e2e/tcg/tcg-menu.spec.ts` (flag off → no tabs + `/packs` redirects home; flag on → each tab links its page), mirroring the achievements menu tests. `enableTcgFlag` moved to `e2e/helpers/tcg.ts`, shared by the 3 TCG page specs.

## Front TCG › E2E journey

- **`e2e/tcg/tcg-journey.spec.ts`, one outcome per test** (workflow rule: no intermediate assertion): stock `7/10` + timer shown; open + reveal 5 + back → `6/10`; open + reveal 5 + "See collection" → the card is in the collection; `0/10` → the pack button is disabled; another user's card doc (seeded with the admin SDK) → the viewer sees that map locked, never as owned. The owner-only read rule itself is covered by the rules suite.
- The stock test seeds no pool: it doesn't open a pack.
- **Not run locally**, like every e2e spec of this phase (CI-only); they run on the next push that triggers `front.yml`.

## TCG collection v1 › Plan

- **No draw bias toward missing cards** (user decision): draws stay fully random inside a rarity; duplicates are frustrating on purpose and push to open more packs.
- **Numbers are fixed**: grouped by game, never renumbered; a new card takes the next free number.

## TCG collection v1 › `number` in `cardProperties`

- **`number: z.number().int().positive()`, required** inside `cardPropertiesSchema` (nothing in prod, no migration). Owned cards get it for free through `cardPropertiesAtPull`.
- **The admin form got its number input in this step** (shown only when the map is a card), since a required field wouldn't compile otherwise. Picking a rarity keeps the existing number, or `UNSET_CARD_NUMBER = 0`, which fails validation so the admin must fill it. Prefill + duplicate / gap flags are the next sub-bullet.
- **Pool drift now fails the open**: a drawn map whose doc is gone or no longer a card returns `NO_CARD` (503, nothing written, the missing ids logged) instead of the old `{ rarity }` fallback, which can't be a valid `CardProperties` anymore. `rebuild-card-pools.ts` repairs the pools.
- Fixtures / specs / stories use a named `CARD_NUMBER` per file; rules tests untouched (rules don't validate the shape).

## TCG collection v1 › Admin number prefill + checks

- **Prefill = highest number used + 1** (`getNextCardNumber`), computed from the all-maps query the admin maps page already caches. Applied only when a map becomes a card without a number; an existing number is kept. The rarity select is disabled until that query resolves, so the prefill can't start from an empty list and collide.
- **Admin maps page flags** duplicate numbers (destructive) and unused numbers up to the highest (muted), from `getCardNumberIssues`. Nothing blocks saving a duplicate: the admin fixes it from these lines.
- **`formatCardNumber`**: `#` + 3-digit padding (`#042`), longer numbers kept whole.
- **`getNextCardNumber` / `getCardNumberIssues` kept extracted with one caller each**, overruling the 2-call-site rule again (reviewer blocked twice): inlining deletes the only direct tests of the max+1 and gap logic.
- Kept as one commit although the reviewer flagged `SCOPE: SPLIT` (prefill vs page flags).
- Tests: unit (`utils/card-number.test.ts`), e2e (prefilled value is what gets stored; a duplicate number is flagged).

## TCG collection v1 › `#number` on the cards

- **`MapTradingCard` takes a required `number`**, shown as a blur badge top-left (`#042`); the `×n` duplicate badge stays top-right. The ghost card shows the same badge.
- **The collection page builds each card from the map doc's `cardProperties`** (rarity + number, the source of truth) instead of the pool doc's rarity id. A pool entry whose map is gone or no longer a card is **skipped**, so it isn't counted in the progress either (it would reappear only through pool drift, repaired by the rebuild script).
- Tests: `collection-page.spec.ts` asserts the owned card and the ghost show their `#number`. Story default `number: 42`.

## TCG collection v1 › Numbered binder

- **`buildCollectionGroups` → `buildCollectionBinder`**, replacing the rarest-first order of the first collection page: every card sorted by `number`, games ordered by their first number (numbers are contiguous per game, so the binder reads `#001, #002…` across sections), cards by number inside a game. Returns `{ ownedCount, total, groups }`.
- **Overall progress on top** (`owned/total cards collected`), each game's `owned/total` kept as the secondary count. Owned cards in full with `×n`, missing ones as numbered ghosts (previous sub-bullets).
- Kept as one commit although the reviewer flagged `SCOPE: SPLIT` (order vs overall counter).

## TCG collection v1 › E2E

- **Binder order**: the owned card is legendary `#043`, the ghost common `#042`, so number order (ghost first) differs from the old rarest-first order; the test reads the game section's card testids in DOM order.
- **Overall progress**: the expected total is computed from Firestore with the admin SDK (pools → map docs that are still cards), since the emulator DB is shared by every spec; asserts `1/<total>`.
- The admin number field's e2e (filled per rarity, prefill stored as shown, duplicate flagged) shipped with the two admin sub-bullets.
- Not run locally (CI-only).

## TCG cards collection › `cards` data layer

- **Top-level `cards` reuses `TABLES.CARDS`** (`"cards"`), like `TABLES.MAPS` names both `maps` and `games/{id}/maps`: `refs[TABLES.CARDS]` is the top-level collection, `subRefs[TABLES.CARDS](uid)` stays `users/{uid}/cards`. Different paths, one name; nothing queries a `cards` collection group.
- **`CARD_TYPE = { MAP: "map" }`** in `libs/common` next to `CARD_RARITY`. `GAME` is added with the game variant, so no constant member sits unread.
- **`cardDocSchema` is a single `z.object`** with `type: z.literal(CARD_TYPE.MAP)` + `mapId`, not a one-member `discriminatedUnion` nor a base schema with one user (simplicity rules). The game sub-bullet moves the shared fields (`gameId`, `cardProperties`, timestamps) into a base and wraps both variants in `z.discriminatedUnion("type", …)`: the literal is already the discriminator, so consumers don't change.
- Timestamps like `mapDocSchema` (`timestampSchema.nullish().default(() => null)`). No `WITH_ID` variant yet: nothing reads cards.
- **Rules**: `match /cards/{card}` → read `true`, write `signedInAdmin()` (achievements pattern). Tests: signed-out + signed-in read allowed, user denied create / update / delete, admin allowed create / update / delete. The rules don't validate the shape (same as maps' `cardProperties`).
- Schema tests (`card.test.ts`): valid map card, timestamps default to null, missing `mapId`, unknown type, invalid `cardProperties` (unknown rarity, number 0, no number) rejected. The unknown-type test uses a made-up type, not `game`, so it stays valid once the game variant lands.

## TCG cards collection › Read side on `cards`

- **New `listen_doc_cards_written` on `cards/{cardId}`**; `updateCardPools` leaves the maps trigger (back to `refreshReadyImagesForMap` alone). Same rarity **and** same `gameId` before / after → no write; a `gameId` change alone still moves the entry, so no stale `{ cardId, oldGameId }` is left behind. Created = rarity added, deleted = rarity removed (a card always has `cardProperties`, so "rarity removed" is a delete). `arrayRemove` uses `before.gameId`, `arrayUnion` `after.gameId`.
- **Both sides parsed with `cardDocSchema.safeParse`**, a malformed doc counts as absent: written malformed → no pool change, a card turned malformed → leaves its pool. The rebuild script skips malformed docs the same way instead of aborting.
- **Pool doc field renamed `maps` → `cards`**, entries `{ cardId, gameId }`. `buildCardPools` takes cards (required `cardProperties`); the "unrated map left out" test is gone with the case. The rebuild script reads `refs[TABLES.CARDS]`; same run command, run it once after deploying (old pools hold `maps`, which the new schema ignores → empty pools until rebuilt).
- **Owned cards `users/{uid}/cards/{cardId}`** = `{ cardId, gameId, count, cardPropertiesAtPull, … }` (spread of the pool entry, no `mapId`). `getUserCardCounts` unchanged: keyed by doc id, now the card id.
- **Open-pack endpoint**: reads the drawn card docs + owned docs, then the cards' map docs (third read round, still before any write). `cardPropertiesAtPull` = the card's `cardProperties`; name / image from the map. Card doc gone / invalid **or** its map gone → `NO_CARD` 503, missing card ids logged (drift behaviour carried over). Response card gains `cardId` and keeps `mapId` (`MapTradingCard` and its `TRADING_CARD(mapId)` testid still need it); React keys use `cardId`.
- **Collection page reads `cards`, not the pools**: every valid card doc + one `db.getAll` of their maps; a card whose map is gone is skipped. `CollectionCard` gains `cardId`, owned counts looked up by `cardId`, the ghost testid `COLLECTION_LOCKED_CARD(cardId)`.
- **E2E**: `seedMapCard(gameId, cardProperties)` in `e2e/helpers/tcg.ts` writes the map (no `cardProperties`) + a `cards` doc with the admin SDK; `seedEveryPoolWithOneMap` → `seedEveryPoolWithOneCard`, returns `{ map, cardId }`. The overall-progress total counts card docs whose map exists. `admin-map-rarity.spec.ts` untouched. Not run locally (CI-only).
- **Known gap until the next sub-bullet**: the admin still writes `cardProperties` on maps, which no longer reaches the pools or the collection; cards only come from seeded / hand-written `cards` docs in dev meanwhile.

## TCG cards collection › Admin writes `cards`

- **Auto id kept** (spec), not a deterministic `map_<mapId>` id: the form looks the map's card up in the all-cards query it already needs for the prefill (`cards.find(mapId)`), so no extra read; seeded / script cards (`.add()`) are found the same way. "One card per map" is held by the form (update when found, create otherwise), not by construction; the e2e asserts exactly one card doc per map.
- **New `cardApi`** (`redux/api/cards.ts`, client SDK, admin allowed by the `cards` rules): `getCards` (every card, `safeParse` with the new `cardDocWithIdSchema` + `flatMap`: a malformed doc is logged and skipped, like the collection page, so one bad doc can't fail the query; tag `CardList`) + one `saveMapCard({ card, gameId, mapId, cardProperties })` mutation: no card → `addDoc` when properties are set (else no-op); card + no properties → delete (pools follow through the trigger); card + same rarity and number → **no write**; else update `cardProperties` + `updatedAt`. The new doc is `{ type: map, gameId, mapId, cardProperties, createdAt, updatedAt }`. Timestamps `Timestamp.now()` like `maps.ts`. No toast in the mutation: the form owns the message. Front `TABLE_REFS[TABLES.CARDS]` typed `CardDoc` (like `@repo/providers`), `getCardRef`. Unit-tested with mocked Firestore (`cards.test.ts`: create / update / delete / two no-ops / error / malformed doc skipped).
- **Iconographs pass the admin guard but can't write `cards`**: the card section (rarity + number) is **hidden** for non-admins (`selectIsAdmin`), not disabled — they could never set it, and hiding keeps the form clean. Their submits then carry the loaded card unchanged → no-op, so saving a map that is a card no longer hits `PERMISSION_DENIED`. Rules tests: iconograph denied create / update / delete on `cards`.
- **Form**: `mapFormSchema` = `createMapInputSchema` + optional `cardProperties`, module-private in `map-id.tsx`; submit splits it, writes the map, then the card (after create, with the new map id). Success toast only when both writes succeeded; a card failure shows "Map created / updated, but its card was not saved" (on create the URL still moves to the new map, so a resubmit edits it instead of creating a second map). The form shows the loading modal until the cards query (and the map) resolve, and **never renders without them**: a failed cards or map query shows a "Could not load this map" modal instead of a form on defaults that a submit would write over the map. It resets once both are there, so a late cards load can't wipe typed edits. Prefill = max number across `cards` + 1; the rarity select's `disabled={!cards}` is gone, superseded by that gate.
- **Admin maps page / maps gallery**: `getCardRarityByMapId(cards)` → `Map<mapId, rarity>`, fed to `filterMapsByCardRarity` / `countMapsByCardRarity` and to `MapCard`'s new `rarity` prop (MapCard stays query-free). Number flags from `getCardNumberIssues(cards)`, so a card whose map is gone still holds its number.
- **Removed from maps**: `cardProperties` off `mapDocSchema` (zod strips a leftover field; `map.test.ts` reduced to that), the `deleteField()` in `updateMapById`, `adminOnlyMapFields` + its rules tests (map rules back to `create, update: signedInIconograph()`).
- **Known gap**: deleting a map leaves its card doc (and pool entry); the open-pack endpoint already answers `NO_CARD` for a card whose map is gone. Not handled here.
- E2E `admin-map-rarity.spec.ts`: cards seeded with `seedMapCard`, assertions read `cards where mapId ==` with the admin SDK; new "update the existing card" case. Not run locally (CI-only).

## TCG cards collection › Game cards

- **`CARD_TYPE.GAME`**; `cardDocSchema` = `z.discriminatedUnion("type", [map, game])` over a module-private base (`gameId`, `cardProperties`, timestamps). A game card has no `mapId`: a stray one is stripped (zod default), not rejected. `cardDocWithIdSchema` = `cardDocSchema.and(WITH_ID)` (a union has no `.shape` to spread). Pools, user cards, the listen-docs trigger and the rebuild script only read `gameId` / `cardProperties`: unchanged (one trigger test added for a game card).
- **`saveMapCard` → `saveCard`** (2 call sites now): `mapId` optional, present → map card, absent → game card. Game form finds its card with `type === game && gameId`; map form's lookup now also checks `type === map` (the union forces it). "One game card per game" is held by the form, like maps.
- **Game form** (`components/modals/game.tsx`): same card section as the map form (admin-only via `selectIsAdmin`, prefill max + 1 across all cards, "Not a card" deletes), same gate (loading until cards + game load, "Could not load this game" on failure), same partial-failure toasts. The section is **duplicated** rather than extracted: two blocks, each bound to its own form and `GAME_FORM_*` / `MAP_FORM_*` testids; extracting would rewrite the working map form. New `GAME_FORM_SUBMIT` testid.
- **`utils/card-subject.ts`**: `getCardSubjectRef(card)` (map doc or game doc) + `getCardSubject(card, data)` → `{ name, imageUrl }` (map `name` / `imageUrl`, game `title` / `image || null`), used by the open-pack endpoint and the collection page. Still one `getAll` round; a gone map **or game** → `NO_CARD` 503 / skipped in the binder.
- **`mapId` dropped** from the opened-card response and `CollectionCard`; `MapTradingCard` takes `cardId`, `TRADING_CARD(cardId)` (e2e updated). Component kept as is: a game card is the same card with the game's title + image, no variant. `CollectionCard` gains `type`.
- **Binder order**: sort by number (unchanged, drives group order), then inside each game block a stable sort puts the game card first; map cards stay by number. Numbers are never renumbered, the prefill stays max + 1.
- E2E: `seedGameCard(gameId, props)`, `seedEveryPoolWithOneGameCard`; collection shows the game card first (with the game title), a pack can pull a game card (title / image in the response), admin makes a game a card (prefilled number) and updates it (in `admin-map-rarity.spec.ts`, reusing its admin login). Overall-progress total counts cards whose map / game exists. Not run locally (CI-only).

## TCG admin cards CRUD

- **Writes reuse `saveCard`** (create = no card + properties, update = card + properties, delete = card + no properties): no new endpoint, the pools follow through the `cards` trigger. Rules unchanged: `cards` already read `true` / write `signedInAdmin()`, and `users/{uid}/cards` has no client write.
- **Names are joined client side**: `buildAdminCardRows(cards, games, maps)` over `getCards` + `getAllGames` + `getMaps` (collection group, the admin maps page already loads it). A card whose map / game is gone shows "Missing map / game" instead of being hidden, so the admin can delete the orphan (the map-deletion gap from the cards collection section).
- **Shared `CardPropertiesFields`** (rarity select + number input over a `UseFormReturn<CardProperties>`), used by the new-card modal and the card sheet. The map / game forms keep their own card section (they carry the "Not a card" option and live in another form type); not rewritten.
- **New-card modal**: type / game / map held in `useState`, the form only holds `CardProperties`. Only maps without a card are listed and a game with a card is refused, so "one card per map / per game" holds here like in the map / game forms. The form waits for `getCards` so the number prefill (`getNextCardNumber`) is right. Duplicate numbers are flagged in the table, not blocked (same as the map form).
- **Sheet** finds its card in the page's rows (`card-id` query param), no extra fetch. Type / subject are read-only: changing what a card points at is delete + create.
- E2E `e2e/tcg/admin-cards.spec.ts`, navigates through the admin menu like the achievements spec. Not run locally (CI-only).
- **Review calls overruled**: `buildAdminCardRows` stays a unit-tested pure util with one caller, like `utils/collection.ts` / `utils/card-rarity.ts` (the repo keeps page logic testable in `utils/`). Scope split (list + sheet vs create modal) declined: the ask was one CRUD, and the three parts share the constants, fields component and spec.

## TCG cards single source of truth

- **Draw reads the whole `cards` collection** in the open-pack transaction (`transaction.get(refs.cards)`), groups by rarity in memory, then `pickCard`. Picked by the user over a per-rarity query or a `random` field + index: nothing in prod, a small catalogue, and it removes the trigger, the rebuild script and pool drift. Cost is N card reads per pack; revisit with a `random` field + `where rarity == r && random >= x, limit 1` if reads grow.
- The drawn cards come from the query, so the second read round for the card docs is gone: one round reads the owned docs and the maps / games together. A gone map / game still answers `NO_CARD` 503 with the ids logged.
- **`cardFieldsSchema` (`{ rarity, number }`) in `card.ts`**, spread into the card base with `.extend`: the admin forms still edit that pair as one object (`CardFields`), but it is stored flat. `cardRaritySchema` / `CardRarity` moved into `card.ts`; `card-properties.ts` deleted. `CardPropertiesFields` → `CardFieldsInputs` (`card-fields-inputs.tsx`); the map / game form field `cardProperties` → `cardFields`; `saveCard` takes `cardFields` and writes them spread (`...cardFields`).
- **`cardPropertiesAtPull` dropped**, not flattened: it was written by the endpoint and read by nothing (the binder reads the live card). An admin edit applies to every owner.
- `pickCard` returns `{ rarity, card }` over `Record<CardRarity, CardDocWithId[]>`. The opened-card response is flat: `{ cardId, gameId, rarity, number, name, imageUrl, isNew }`.
- `map.test.ts` still checks a leftover `cardProperties` on a map is stripped: it guards legacy map docs, untouched.
- **E2E**: `seedEveryPoolWithOneCard` / `…GameCard` → `seedOnlyMapCard` / `seedOnlyGameCard`, which delete every `cards` doc before seeding so a pack can only draw the seeded card. Deterministic under CI's single worker; a local fully-parallel run can race with specs seeding cards (collection, admin). Not run locally (CI-only).
- **Deploy**: `listen_doc_cards_written` is removed from the code; the next functions deploy asks to delete it. Leftover `cardPools` docs in dev are dead data, safe to delete by hand.
