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
- **TCG, packs, cosmetics, exchange**: out of scope of this plan, no branch should start on them.

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

- [ ] Achievements API
  - [x] Implement strongly typed schemas for the event payload: a discriminated union on `key`, and depending on it some other object in the payload is required (ex: `change_username` requires `before` and `after` user data, typed like the firestore function `Change` before/after)
  - [ ] Create an endpoint to receive all achievement events in the Next API (uid from bearer token, payload validated by the schemas above, idempotent transaction described in Security principles), add tests to cover it. We will populate this endpoint depending on future achievements

- [ ] Front Achievements
  - [ ] In admin side, create the crud for the achievements: a global admin page to see them all, a redux endpoint, + form to modify them easily
  - [ ] Create component `AchievementCard` to display an achievement. Loading: a global load rather than individual ones
  - [ ] In client side, add an achievements tab in the menu, that redirects to an achievements page: a server side page that fetches the raw achievements, a client component that fetches your unlocked ones. Behind the `Achievements` flag — the flag lives in localStorage, so the gate must be in a client component, the server page can't read it
  - [ ] Plug the username change event: if `change_username` isn't unlocked yet, call the endpoint; the endpoint verifies from `before` / `after` that the username changed, creates the `unlockedAchievements` doc with `achievedAt` + `reward`, and adds the reward to the user's `credits`
