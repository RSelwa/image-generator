## Features TCG + Achievements

Start from develop. **One branch per sub-bullet**, in the order below. Let the reviewer do only 2 turns to not lose too many tokens. Create the PR from the branch to `develop`, wait for all tests to be green in CI before merging. Once merged, tick the sub-bullet (`- [x]`) in this file (and the parent bullet once all its sub-bullets are ticked). Clear context after each task completed.

**Run it automatically, without asking**: when a sub-bullet is done (PR open against `develop`, CI green), merge it into `develop` (never `main`), tick it here, record its decisions in `DECISIONS.md` (grouped by the sub-bullet they concern), clear the context, and start the next sub-bullet. Take every decision yourself, don't ask for advice. Stop only when every bullet is ticked, or when CI stays red after a fix attempt.

Goal: we will add an achievements system to allow users to win virtual money (`credits`), that they could exchange to open packs like a TCG. The goal of the achievements is to ensure that users share the app to their friends and bring new players.
We will also allow them to buy cosmetics with these.

Add feature like Wiki master (wiki-master.com): add a system of internal money called `credits`, we will create a bunch of achievements to allow users to earn more of it. We will create also a TCG system from games/maps in it, with rarity system. We will allow users to exchange it later on.

### Naming

- `credits`: the currency, and the user field holding the balance (a number). No `wallet` field: a wallet is the container, not the amount — if we ever need several currencies, `credits` moves into a `wallet` map then.
- `achievements`: root collection of the achievement definitions.
- `unlockedAchievements`: sub collection of `users/{uid}`, one doc per unlocked achievement. Distinct name from the root collection so a `collectionGroup("achievements")` query never mixes definitions and unlocks. camelCase like every other collection (`dailyChallengeResults`, `raceRuns`…).

### Security principles

- Only the server (firebase admin SDK) writes `credits`, `referralCode` and `unlockedAchievements`. Clients only read them.
- The uid always comes from the verified bearer token, never from the payload.
- Unlocking is idempotent server side: in one transaction, `create()` the `unlockedAchievements` doc (fails if it already exists) and `FieldValue.increment(reward)` the user's `credits`. The front also checks first and does not send the event when the achievement is already unlocked — that saves requests, the server check is the one that guarantees a single reward.
- Accepted risk: for `change_username`, the client sends the `before` / `after` payload, so it could forge a username change. The reward is small and one-shot, not worth more for now.
- Feature flags are client-side only (url / localStorage): they hide the UI, they do not protect anything. Server side code (rules, endpoint) is live as soon as it's merged.

### Later iterations (structure only for now)

This plan builds the structure, the following features come once everything is set up:

- **Referral**: `referralCode` is generated and stored, but nothing reads it yet (no redeem flow, no "invite a friend" achievement). Uniqueness is checked by regenerating until no user has it; the check-then-write race is accepted (two signups getting the same random code at the same instant is negligible).
- **Progress achievements**: `goalToAchieve` exists in the schema (ex: "finish 10 games") but no progress is tracked yet. When we implement the first one, we'll add where the progress lives (ex: a `progress` field on the `unlockedAchievements` doc, or a counter on the user).
- **TCG**: planned below (map cards, free refilling packs, collection). Game cards, buying packs with `credits`, pack size changes and card exchange are later iterations.
- **Cosmetics, exchange**: out of scope of this plan, no branch should start on them.

---

- [x] Clean codebase
  - [x] Change eslint for oxlint + oxfmt + clean (all current codebase), don't review files that will be formatted (you will lose tokens for nothing). Must be merged before any other branch starts, otherwise every branch conflicts on the reformat.
  - [x] Take the config of CI, CLI from flim-monorepo (we've made refacto to clean this system to not have bunch of CI files)

- [x] Front Feature flags
  - [x] Integrate dev tools from `flim-monorepo` -> `apps/web`, pick the FEATURE_FLAGS system, the url, localstorage, the hotkeys system
  - [x] Add the Feature Flags: `Credits`, `Achievements`

- [x] Users schemas
  - [x] Add in user's schemas optional fields `credits` (default to 0 if not existing) and `referralCode`
  - [x] Add rules to not let users write any of these two fields, on **create** (currently `allow create: if isSignedIn()`) and on **update** (currently `isDocOwner(user)` can write any field) + tests: user denied, admin allowed
  - [x] Modify the create user CF (`functions/create-user-document`) to add these fields when user is created (for the referral code, create a util that generates a 6 digit number, regenerate until no user has it yet)
  - [x] Create a script that populates these fields for existing users (do not run it yet, since it won't be in prod)

- [x] Achievements data
  - [x] Create schemas and constants for the architecture: an `achievements` collection, and a `unlockedAchievements` sub collection on each user, where the id of the doc is the id of the achievement. Use the achievement `key` as doc id, so an event carrying a `key` needs no lookup.
    - `achievements/{key}`: `key`: string (ex: `change_username`), `name`: string, `description`: string, `reward`: number, `difficulty`?: `AchievementDifficulty`, `goalToAchieve`?: number
    - `users/{uid}/unlockedAchievements/{key}`: `achievedAt`: FirestoreTimestamp, `reward`: number (snapshot of the reward paid, so editing an achievement's reward later doesn't change what users were paid)
    - Difficulty, same pattern as `DIFFICULTIES` / `difficulty: z.enum(DIFFICULTIES)` in `spherical.ts` (separate constant, since achievements add `legendary`):
      ```ts
      // libs/common/src/constants/constants.ts
      export const ACHIEVEMENT_DIFFICULTY = {
        EASY: "easy",
        MEDIUM: "medium",
        HARD: "hard",
        LEGENDARY: "legendary",
      } as const

      // libs/schemas
      export const achievementDifficultySchema = z.enum(ACHIEVEMENT_DIFFICULTY)
      export type AchievementDifficulty = z.infer<
        typeof achievementDifficultySchema
      >
      ```
  - [x] Add rules + tests: anyone reads `achievements`, only admin writes them; a user reads only their own `unlockedAchievements`, nobody writes them from a client (admin SDK only)
  - [x] Create one basic achievement: modify your userName (`change_username`)

- [x] Achievements API
  - [x] Implement strongly typed schemas for the event payload: a discriminated union on `key`, and depending on it some other object in the payload is required (ex: `change_username` requires `before` and `after` user data, typed like the firestore function `Change` before/after)
  - [x] Create an endpoint to receive all achievement events in the Next API (uid from bearer token, payload validated by the schemas above, idempotent transaction described in Security principles), add tests to cover it. We will populate this endpoint depending on future achievements

- [x] Front Achievements
  - [x] In admin side, create the crud for the achievements: a global admin page to see them all, a redux endpoint, + form to modify them easily
  - [x] Create component `AchievementCard` to display an achievement. Loading: a global load rather than individual ones
  - [x] In client side, add an achievements tab in the menu, that redirects to an achievements page: a server side page that fetches the raw achievements, a client component that fetches your unlocked ones. Behind the `Achievements` flag — the flag lives in localStorage, so the gate must be in a client component, the server page can't read it
  - [x] Plug the username change event: if `change_username` isn't unlocked yet, call the endpoint; the endpoint verifies from `before` / `after` that the username changed, creates the `unlockedAchievements` doc with `achievedAt` + `reward`, and adds the reward to the user's `credits`

---

## TCG

Cards are **maps only** for now: a card is a view of a map doc, so no dedicated `cards` collection duplicating name / image. Game cards come later (an owned card then gains a `kind` field defaulting to `"map"`).

### Naming & data

- `cardProperties`: optional object on `games/{gameId}/maps/{mapId}`, holding everything that makes a map a card. One schema (`cardPropertiesSchema`) to extend when the card system grows, instead of new loose fields on the map. A map without `cardProperties` is not a card and never drops from a pack.
  - `cardProperties.rarity`: required inside the object, set **by hand** by an admin (no popularity computation).
  ```ts
  // libs/common/src/constants/constants.ts
  export const CARD_RARITY = {
    COMMON: "common",
    UNCOMMON: "uncommon",
    RARE: "rare",
    ULTRA_RARE: "ultraRare",
    LEGENDARY: "legendary",
  } as const
  ```
  Popular = rare: maps everyone loves are `legendary`, obscure ones are `common`.
- `cardPools/{rarity}`: one doc per rarity, `{ mapIds: { mapId, gameId }[] }`, derived from the maps by a trigger. Lets the pack function pick a random card in one read per rarity. Server writes only.
- `users/{uid}/cards/{mapId}`: owned cards. `{ mapId, gameId, count, cardPropertiesAtPull, firstPulledAt, lastPulledAt }`. Doc id is the `mapId`, so a duplicate increments `count`. `cardPropertiesAtPull` snapshots the map's whole `cardProperties` (same `cardPropertiesSchema`) so a hand edit later doesn't downgrade what users pulled, and future card fields are snapshotted for free.
- Packs on the user doc: `packsStored` (number) and `packsRefillAnchor` (timestamp). No cron: available packs = `min(PACKS_MAX, packsStored + floor((now - anchor) / PACK_REFILL_MS))`. On open, advance the anchor by the consumed refill periods only, never reset it to `now` (keeps partial progress).
- Constants: `PACKS_MAX = 10`, `PACK_REFILL_MS = 10 min`, `PACK_SIZE = 5`, drop weights `common 60 / uncommon 25 / rare 10 / ultraRare 4 / legendary 1`. The last card of a pack is **guaranteed rare or better** (weights renormalised over rare / ultraRare / legendary).
- Empty pool: fall back to the next rarity down until a non-empty pool is found (no rated map at all → the endpoint returns an error, no pack consumed).

### Security

- Only admins write `cardProperties` on maps. Only the server (admin SDK) writes `cardPools`, `users/{uid}/cards`, `packsStored` and `packsRefillAnchor`.
- Opening a pack is server side only: the draw, the pack count check and every write happen in one transaction. The client never sends a rarity or a card.
- Feature flag `TCG` (client side, hides the UI only).

---

- [ ] TCG data
  - [ ] Add `CARD_RARITY` constant + `cardRaritySchema`, a `cardPropertiesSchema` (`{ rarity: cardRaritySchema }`, its own file in `libs/schemas`, exported type `CardProperties`), and `cardProperties: cardPropertiesSchema.optional()` on `mapDocSchema` (+ create / update input schemas). Every card consumer (pools, owned cards, endpoint, UI) imports `CardProperties`, never a loose `rarity` type. Schema unit tests: valid `cardProperties`, missing `cardProperties`, `cardProperties` without `rarity` rejected, invalid rarity rejected
  - [ ] Add schemas for `cardPools/{rarity}`, `users/{uid}/cards/{mapId}`, and `packsStored` / `packsRefillAnchor` on the user schema (optional, `packsStored` defaults to `PACKS_MAX`, a new user starts full)
  - [ ] Rules + tests: only admin writes `cardProperties` on a map (rule on the top-level key, `affectedKeys().hasAny(["cardProperties"])`, so future sub-fields are covered without touching the rule) (user denied on create and update, admin allowed); anyone reads `cardPools`, nobody writes them from a client; a user reads only their own `cards` (owner allowed, another signed-in user denied, anonymous denied), nobody writes them from a client (owner and admin client denied); the owner reads their own `packsStored` / `packsRefillAnchor` (needed by the packs page), users can't write them on create nor update (owner denied, admin allowed)
  - [ ] Modify the create user CF (`functions/create-user-document`) to set `packsStored = PACKS_MAX` and `packsRefillAnchor = now`, + test

- [ ] Admin map rarity
  - [ ] Add a "Card" section in the map form (`components/modals/map-id.tsx`) bound to `cardProperties`, with a `rarity` select and a "not a card" option that removes the whole `cardProperties` object; wire it through the maps redux endpoint (update mutation). Story for the form with each rarity
  - [ ] In the admin maps page, show the rarity on each `MapCard` (badge) and add a filter by rarity (including "not rated"), so admins can see which maps are left to rate. Story + play test of the filter
  - [ ] Add a count per rarity at the top of the admin maps page, to balance pools by hand

- [ ] Card pools
  - [ ] Add a Firestore trigger in `functions/listen-docs` on `games/{gameId}/maps/{mapId}` writes: when `cardProperties.rarity` changes (`cardProperties` added, rarity updated, `cardProperties` removed, or map deleted), remove the map from its old pool and add it to the new one (`arrayRemove` / `arrayUnion` in one batch). Unit tests for each transition
  - [ ] Create a script that rebuilds every `cardPools` doc from the maps (for the first run and to repair drift). Do not run it yet

- [ ] Packs API
  - [ ] Create a pure util in `libs/common` `getAvailablePacks(packsStored, anchor, now)` + `getNextPackAt(...)` + `consumePack(...)` returning the new `packsStored` / anchor. Shared by the endpoint and the front countdown, so both compute the same count. Unit tests: empty, partial refill, capped at `PACKS_MAX` (no next pack date when full), anchor advanced by consumed periods only
  - [ ] Create a pure util `drawRarities(random)` returning `PACK_SIZE` rarities with the weights and the guaranteed rare+ last card, plus `pickCard(pools, rarity)` with the fallback to the next rarity down. Unit tests with an injected random (every rarity reachable, last card always rare+, fallback when a pool is empty, error when all pools are empty)
  - [ ] Create a `POST /api/packs/open` endpoint in the Next API: uid from bearer token, no payload. In one transaction: read the user, compute available packs (none → 409), read the pools, draw 5 cards, upsert `users/{uid}/cards/{mapId}` (`count` increment, `cardPropertiesAtPull`, timestamps), update `packsStored` / `packsRefillAnchor`. Returns the 5 cards (map data + `cardProperties` + `isNew`). Tests: unauthenticated 401, no pack 409, success writes cards and consumes one pack, duplicate increments `count`
  - [ ] Add a redux endpoint for it (mutation, invalidates the user's cards and packs)

- [ ] Front TCG
  - [ ] Add the `TCG` feature flag
  - [ ] Create a `MapTradingCard` component: map image, name, game, rarity frame from `cardProperties.rarity` (one visual treatment per rarity), `count` badge when owned more than once. Story per rarity
  - [ ] Create a packs page, behind the `TCG` flag (client gate): the pack stock shown as `7/10`, and a countdown to the next pack computed client side with the shared `getAvailablePacks` / `getNextPackAt` from the user doc's `packsStored` / `packsRefillAnchor` Firestore timestamps (ticks every second, the count goes up by itself when the timer ends, no refetch; hidden when full). Display only, the endpoint recomputes on its own. Clicking the pack calls the open endpoint (disabled at `0/10` and while the request is pending). Stories + play tests: full (`10/10`, no timer), partial (`7/10` + timer), empty (`0/10`, disabled, timer), timer reaching zero increments the count (fake timers)
  - [ ] Pack opening, Pokémon style: after the endpoint answers, the 5 cards are shown as a pile, face up, top card first and the guaranteed rare+ one at the bottom. Clicking (or Enter / Space on) the top card slides it out and reveals the next one; a counter shows `2/5`. After the last card, a summary grid of the 5 cards with a `new` badge on first pulls, and "Open another" (if packs left) / "See collection" buttons. CSS transitions only (no animation lib), no slide under `prefers-reduced-motion`. Stories + play tests: click advances the pile, keyboard advances it, summary shows after the 5th card with the `new` badges, "Open another" hidden at `0/10`
  - [ ] Create a collection page, behind the `TCG` flag: the user's cards grouped by game, sorted by rarity, with owned / total per game (total = maps of the game that have `cardProperties`). Unowned cards shown as locked silhouettes. Story + play test of the grouping
  - [ ] Add a TCG tab in the menu (packs + collection), behind the flag
  - [ ] E2E: a seeded user at `7/10` sees the counter and the timer, opens a pack, clicks through the 5-card pile, reaches the summary, the counter shows `6/10`, the cards appear in the collection. A seeded user at `0/10` can't open a pack. A second user can't see the first user's cards
