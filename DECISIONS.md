# Decisions

## Clean codebase › Change eslint for oxlint + oxfmt + clean

Branch `improvement/oxlint-oxfmt`, PR into `develop`.

### Tooling

- **Config copied from `flim-monorepo`.** Root `oxlint.config.ts` and `oxfmt.config.ts` are the flim-monorepo ones, so both repos lint and format the same way. `apps/front/oxlint.config.ts` extends the root one and adds the `react` and `nextjs` plugins, like `apps/web` does there.
- **Versions:** `oxlint@^1.85.0`, `oxfmt@^0.70.0`, `oxlint-tsgolint@^7.0.2002` (latest at the time; oxlint 1.85 peers on tsgolint `>=7.0.2001`).
- **Type-aware linting is on** (`options.typeAware`), as in flim-monorepo. It is what catches `no-misused-promises`, `unbound-method`, etc.
- **No `jsx-a11y` plugin.** The ESLint config never enforced a11y rules; turning them on is a separate cleanup, not a tool swap.
- **Formatting style changes to flim-monorepo's:** 80 columns, trailing commas everywhere. Double quotes and no semicolons, as before. Every file is reformatted once, which is why this branch must merge before any other starts.
- **oxfmt also formats Markdown and YAML** (FEATURES.md, READMEs, workflows). Kept: one formatter for everything, no exceptions list to maintain.
- **`NODE_OPTIONS=--disable-warning=MODULE_TYPELESS_PACKAGE_JSON` in the scripts** instead of `cross-env` (flim-monorepo's way). `pnpm-workspace.yaml` already sets `shellEmulator: true`, so the inline env var is cross-platform without a new dependency. Adding `"type": "module"` to the root and front `package.json` was rejected: it changes how every `.js` file there is loaded.
- **`apps/front/tsconfig.json` excludes `oxlint.config.ts`**, like `apps/web`. Its `../../oxlint.config.ts` import needs the `.ts` extension to run in Node, which `tsc` rejects without `allowImportingTsExtensions`.
- **Husky kept, lefthook not adopted.** The git hooks and CI are the next sub-bullet ("Take the config of CI, CLI from flim-monorepo"). The existing `pre-commit` (`pnpm run format`) and `pre-push` (`pnpm run lint`) now work: the `format` script they call did not exist before.
- **Scripts:** `lint`, `lint:errors`, `lint:fix` kept with the same names (now oxlint), `format` and `format:check` added.
- **Removed:** `eslint.config.mjs`, `eslint`, `@antfu/eslint-config`, `@eslint-react/eslint-plugin`, `@next/eslint-plugin-next`, `eslint-plugin-react-refresh`, `eslint-plugin-storybook` (front), and the `"lint": "biome check"` scripts in 9 packages and in the 2 `cli/template` packages — Biome was not installed anywhere, so these scripts could not run. The now unused `lint` task in `turbo.json` goes with them. The dead `eslint-disable` comment in `.husky/install.mjs` too.
- **VS Code:** default formatter and fix-on-save switched to the Oxc extension (`oxc.oxc-vscode`), recommended in `.vscode/extensions.json`. The ESLint-specific settings are gone.

### Rules

- **Stories are linted now.** ESLint ignored `**/*.stories.*`; oxlint lints them with the test overrides (`no-explicit-any`, `no-console`… off, `rules-of-hooks` off).
- **`no-misused-promises` → `checksVoidReturn: { attributes: false }`.** Async `onClick` / `onSubmit` handlers in JSX are the React norm (106 of the 109 errors). Promises passed as plain function arguments are still errors, and the 3 real ones were fixed (`onAuthStateChanged` / `onSnapshot` callbacks in `redux/api/auth.ts`, a `setTimeout` in `lobby-waiting.tsx`).
- **`no-unused-vars` ignores `_`-prefixed names and rest siblings** (`{ id: _, ...item }`, `children` stripped before a spread).
- **`no-console` off in `scripts/**` and `cli/**`**: they are CLIs, printing is their output.
- **Turned off, parity with the old ESLint config** (which had them off or did not include them): `react/exhaustive-effect-dependencies` and `react-hooks/exhaustive-deps` (was `react/exhaustive-deps: off`), `react/set-state-in-effect`, `no-unmodified-loop-condition`, `no-shadow` (29 hits, not in antfu's config), `typescript/consistent-return` (the conditional-cleanup `useEffect` pattern).
- **`react/incompatible-library` off**: it warns that react-hook-form's `watch` can't be memoized by the React Compiler, which this app does not use.
- **`typescript/unbound-method` off in `apps/front/redux/**`**: RTK Query's `onCacheEntryAdded` destructures `updateCachedData` & co, a false positive (flim-monorepo does the same).

### Clean

- `oxlint --fix` (safe fixes only): useless type assertions and non-null assertions, `...(x || {})` → `...x`, `.map().flat()` → `.flatMap()`, duplicate imports merged, a useless regex escape.
- Default imports that shadow a named export switched to the named one: `z` from `zod` (65 files), `useSound`, `spinners`, `MiniMap`, `UploadPost`. Same binding, no behavior change.
- Deleted 3 empty files (`redux/session/session.state.ts`, `libs/testing/src/factories/{game,spherical}.ts`), none imported.
- A few one-liners: `log && console.info()` → `if`, `for await` over a plain array → `for`, `Boolean(!x)` → `!x`, `input?.toString()` on a string, `img.onload` → `addEventListener`, `//` text nodes in `not-found.tsx` wrapped in `{"…"}`, unused imports.
- **Left as warnings (36), on purpose:** `react/no-array-index-key` (11), `unicorn/consistent-function-scoping` (5), `no-base-to-string` (5, `FormData.get()` / test helpers), React Compiler style hints (`capitalized-calls`, `static-components`, `purity`, `immutability`, `memo-dependencies`, `no-unstable-nested-components`), 3 `no-unnecessary-type-parameters`, 2 `no-useless-default-assignment`, 1 `no-redundant-type-constituents` (the `AVATARS_KEYS | string` autocomplete trick). Each needs a judgement call on behavior or keys, not a mechanical fix, so they stay visible instead of being silenced. `pnpm lint` exits 0; errors are at 0.

### Commits

The branch has 3 commits so the review can skip the reformat: tooling, then `🎨 Format the codebase with oxfmt` (formatting only, don't review), then the lint fixes.

## Clean codebase › Take the config of CI, CLI from flim-monorepo

Branch `improvement/ci-cli`, PR into `develop`.

### CI

- **One entry point, `ci.yml`, like flim-monorepo.** It runs on every pull request and on pushes to `main` / `develop`, lists the affected packages with `turbo ls --affected` (`detect-affected` action, which also comments the list on the PR), then calls reusable workflows for what changed: `deploy-cloud-functions.yml`, `deploy-cloud-run.yml`, `front.yml`. The 12 per-target workflows are gone; 4 workflows + 1 path-triggered rules workflow remain.
- **Affected detection replaces the hand-written `paths:` lists.** A function is rebuilt/tested/deployed when turbo says it (or a lib it depends on) changed. This is a superset of the old lists (e.g. `lobby-cleanup` now also redeploys on a `libs/schemas` change), and fixes the old filters that never matched (`functions/create-user-document` without `/**`, `libs/schemas/src/firestore/user`).
- **Non-package paths go through `.github/scripts/ci-check-workflow-changes.mjs`**, ported from flim-monorepo: the workflow files themselves, `firebase.json`, and the three Cloud Run services, which keep exactly their old triggers (`functions/<service>/`, `libs/common/`, `apps/front/app/capture/` for video-capture). `ci-merge-packages.mjs` turns both into the job inputs.
- **Concurrency is per deploy target, not per workflow.** One shared group would let GitHub replace a pending run and drop its changes (each run only diffs its own push). So `ci.yml` groups pushes by sha and only cancels superseded PR runs; function chunks, each Cloud Run service and the VPS deploy each have their own non-cancelling group. Changed files come from `git diff` in the checkout rather than the compare API, which caps at 300 files on a large develop → main merge.
- **Cloud functions: one matrix workflow with a blacklist.** Deploys run in chunks of 5 with `firebase deploy --only functions:a,functions:b --force`. `CF_BLACKLIST` holds `http-base` (had no deploy workflow) and `video-capture` (a Cloud Run job), so the deployed list is exactly the 8 functions deployed today. `workflow_dispatch` takes a comma-separated list (empty = all).
- **Function tests stay one job per function**, not flim's shared-emulator chunks: the emulator loads every built codebase, so building only the function under test keeps another function's triggers away from its data, as the old per-function workflows did. `--project` is omitted because the tests hardcode the `.firebaserc` id (`tiktok-generator-fa261`). `lobby-cleanup`'s unit tests now run too (they passed, never ran in CI before).
- **Deploys wait for lint and format** (flim's `!cancelled() && !failure()` gate). A red lint on `develop` now blocks the deploy; before, lint only ran for `create-party-doc`.
- **Lint in CI is `pnpm lint:ci`** (build libs, then oxlint) because type-aware rules need the `@repo/*` `dist/`. No `--deny-warnings`: the 36 known warnings are left visible on purpose (previous sub-bullet). **Format uses `format:check`**; flim-monorepo's job runs `format`, which never fails.
- **Cloud Run: one workflow, one job per service**, with the build-and-wait loop moved into a `cloud-build` composite action (it was copy-pasted 3 times). Same images, flags, secrets and region. Only deploys from `main` / `develop`, dispatch included.
- **Front: `e2e-front.yml` became the reusable `front.yml`**, same 6 suites and VPS deploy. It runs when `@repo/front`, `create-user-document` or `lobby-presence` is affected (the old workflow listed the two functions). `[force_deploy]` / `[force_deploy_race_seed_populate]` commit tags are replaced by `workflow_dispatch` on `front.yml` / `deploy-cloud-functions.yml`; `[skip_e2e]` is kept. E2E no longer runs on a branch push without a PR.
- **Secrets and environments unchanged**: `prod` environment, `GCP_SA_KEY`, `PROJECT_ID`, `FIREBASE_TOKEN` untouched, `STRIPE_API_KEY` still written to `create-party-doc/.env.test`, `VPS_HOST` / `VPS_USER` / `SSH_PRIVATE_KEY` at repo level.
- **Actions kept at the majors this repo already runs** (`checkout@v4`, `setup-node@v4`, `pnpm/action-setup@v4`, `cache@v4`, `google-github-actions/*@v2`). Rejected flim's `pnpm/setup@v2`: it only installs pnpm 11+, this repo is on pnpm 10. `firebase` comes from the local `firebase-tools-with-isolate` (`pnpm exec firebase`) instead of a global `firebase-tools` install per job; it is the one `npx firebase` already resolved to.
- **Turbo cache action ported**, pointed at `.turbo/cache` (turbo 2's location; flim's `node_modules/.cache/turbo` is turbo 1's).
- **Not ported**: label sync, storybook / Amplify / gh-pages / release / Linear workflows, `pr-cleanup` — no counterpart in this repo. `python-initialization` action deleted: nothing used it.

### CLI and scripts

- **`cli/` synced with flim-monorepo**: arrow functions, `cp` / `rename` instead of shelling out, the http template fixes (`{{FUNCTION_NAME}}` placeholder, `throw new HttpsError`). The CLI no longer generates a per-function workflow (`gh-action.yml` templates deleted) nor a `build:<name>` script: a new function is picked up by `ci.yml` automatically.
- **`firebase.json` predeploy is `pnpm build:cf`** (`turbo run build --filter='./functions/*'`) for every function, like flim-monorepo. The 8 `build:<function>` scripts and `build:functions` are removed; `http-base`'s predeploy called a `build:http` script that did not exist. The glob is quoted because `shellEmulator: true` expands it otherwise.
- **Lefthook replaces Husky** (flim-monorepo's `lefthook.yml`): pre-commit formats the staged files and re-stages them, pre-push lints the pushed files. Markdown and YAML added to the format glob, since oxfmt formats them here. `--deny-warnings` dropped from pre-push for the same reason as in CI. `lefthook` added to `onlyBuiltDependencies` so its postinstall installs the hooks.

## Front Feature flags › Integrate dev tools from flim-monorepo

Branch `feat/dev-tools`, PR into `develop`.

- **Ported the flag system, not the whole dev tools bar.** From `apps/web`'s `components/Extra/dev-tools.tsx` only the feature flags menu came over (checkbox per flag + copy-shareable-link button). The env indicator, Tailwind breakpoint helper, grid overlay, element inspector, storage/redux helpers, drag-to-move and the Firebase console link were left out: they were not asked for and each is flim-specific.
- **`FEATURE_FLAGS = {} as const`** in `constants/feature-flags.ts`, with `FeatureFlag` derived from it. `Credits` / `Achievements` land in the next sub-bullet.
- **Same URL format as flim: `?ff=<flag>-true|false`.** The param name is `QUERY_PARAMS.FEATURE_FLAG` (`"ff"`), next to the app's other query params.
- **The URL param is read once, globally, in `DevTools`** (always mounted in `[locale]/layout.tsx`), instead of in every `useFeatureFlag` call like flim. flim only applies a link when a component using that flag is on the page; here any page applies it. It is written to localStorage, a `storage` event is dispatched so readers update, and the param is removed from the URL.
- **Only known flags are accepted from the URL.** flim writes whatever name the link carries into localStorage; that would let a crafted link overwrite any localStorage key (redux-persist, `devtools`...). `parseFeatureFlagParam` returns `null` for an unknown name. A status other than `true` means disabled (flim `JSON.parse`d it, which throws on garbage).
- **nuqs `useQueryState` to read and clear the param**, instead of flim's `useSearchParams` + `router.replace`: nuqs is already the app's query-state tool and keeps the `[locale]` prefix untouched.
- **Flags are stored under their own name in localStorage** (flim parity, so links and seeded test storage work the same way), read with the existing `useLocalStorage` hook from `hooks/use-storage.ts`.
- **No `useFeatureFlag` hook yet.** With an empty flag list it would have no caller; the next sub-bullet adds it with its first consumer.
- **Hotkeys: `react-hotkeys-hook@^5.3.3`** (flim uses v4; v5 is current, peers on React `>=16.8`). The dev tools bar toggles with `mod+shift+k` (Cmd on macOS, Ctrl elsewhere — flim binds the same two combos), `preventDefault` on. A hand-written `keydown` listener (like `components/ui/sidebar.tsx`) was rejected: the brief is to adopt flim's hotkeys system so later shortcuts reuse it.
- **Access: anyone outside production, admins only in production** (`selectIsAdmin`). flim gates on an email-domain / uid allow-list; this app already has an `admin` right, so no list to maintain. The bar is hidden by default everywhere (flim shows it by default in dev); its visibility persists in localStorage under `devtools`. Hidden by default keeps it out of e2e runs and dev screenshots without flim's extra env checks.
- **Unit tests with vitest** (`apps/front/vitest.config.mts`, `pnpm --filter @repo/front test:unit`), a node environment — the tested logic (`utils/feature-flags.ts`) is pure, so no jsdom. `include` is `**/*.test.ts` so Playwright's `e2e/**/*.spec.ts` are never picked up. The config is `.mts` because `apps/front` is not `"type": "module"`. The tests mock `FEATURE_FLAGS` with one flag, since the real list is empty.
- **CI: a `🧪 Unit Tests` job in `front.yml`** (build libs, run the unit tests); the VPS deploy now waits for it as well as for E2E.

## Front Feature flags › Add the Feature Flags: Credits, Achievements

Branch `feat/credits-achievements-flags`, PR into `develop`.

- **`FEATURE_FLAGS = { CREDITS: "credits", ACHIEVEMENTS: "achievements" }`.** Lowercase values: they are the localStorage keys, the `?ff=` link value and the dev tools menu label. No `-` in a value, since `-` separates the flag from its status in the link. Neither key collides with an existing localStorage key.
- **Still no `useFeatureFlag` hook.** Nothing reads these flags until the credits / achievements UI lands, so a hook now would have zero callers (simplicity: 2+ call sites, or at least one real consumer). The first sub-bullet that gates UI (the achievements page) adds it with its consumer. The dev tools menu already lists both flags, since it iterates `FEATURE_FLAGS`.
- **Unit tests use the real flags**, the `vi.mock` of `@/constants/feature-flags` is gone. Added a round-trip test over every declared flag (link built by `getFeatureFlagUrl`, parsed back by `parseFeatureFlagParam`), which fails if a future flag value breaks the link format.

## Users schemas › Add in user's schemas optional fields credits and referralCode

Branch `feat/user-credits-referral-schema`, PR into `develop`.

- **`credits: z.number().nullish().default(0)`**, the same `nullish().default()` pattern as `streak` / `bestRaceScore`: a user doc written before this field reads as 0 credits, no migration needed to read it.
- **`referralCode: z.string().nullish()`, no default.** It is generated server side (create-user-document sub-bullet); an absent code stays absent instead of a fake `""` that would look like a real code. A string, not a number: the code is a 6-digit identifier, and a number would drop leading zeros (`042137`).
- **No `USERS_FIELDS.CREDITS` / `REFERRAL_CODE` constants yet.** Nothing reads the field names outside the schema; the rules / CF sub-bullets add them if they need them.
- **Side effect to handle in the rules sub-bullet:** because `userDocSchema.parse` now fills `credits: 0`, every writer that spreads a parsed doc writes it — `create-user-document` (wanted), but also the client-side anonymous user creation in `apps/front/redux/api/auth.ts`. When the rules forbid clients from writing `credits` on create, that client write has to stop sending it (or the rule has to accept `credits == 0`). Not changed here: today no rule rejects it.
- **`userFactory` (`libs/testing`) sets `credits: 0`**, required by the new output type.
- **Schema unit tests in `libs/schemas/src/firestore/user.test.ts`** (vitest, already configured in the package). They run with `pnpm --filter @repo/schemas test`; CI has no job for lib unit tests yet, so they are local-only for now — adding that job is a CI change of its own.

## Users schemas › Add rules to not let users write credits and referralCode

Branch `feat/user-credits-referral-rules`, PR into `develop`.

- **One `serverOnlyUserFields()` list in `firestore.rules`** (`['credits', 'referralCode']`), used by both checks, so a future server-only field is added in one place.
- **Create: `!request.resource.data.keys().hasAny(serverOnlyUserFields())`.** Strict, as the spec says: a client may not send the fields at all, not even `credits: 0`. Allowing `credits == 0` was rejected: it is harmless today but turns the invariant ("clients never write credits") into a value check to keep right.
- **Update: the owner branch gets `noUpdatesOnFields(serverOnlyUserFields())`** (the existing helper, which diffs the doc, so re-sending an unchanged value is not a write). The admin branch is untouched.
- **Admin stays allowed on create and update** through `signedInAdmin()`, and the admin SDK bypasses rules anyway (create-user-document, the future achievements endpoint).
- **Pre-existing, not changed:** `allow create: if isSignedIn()` lets any signed-in user create any `users/{uid}` doc, not only their own. Tightening it to `request.auth.uid == user` is a separate fix.
- **The client anonymous-user creation (`redux/api/auth.ts`) now drops `credits`** from the parsed doc — the side effect recorded in the schema sub-bullet — so the new create rule does not reject it. It writes with `{ merge: true }`: the typed users ref requires a full `UserDoc` for a plain `setDoc`, `merge` takes a partial one, and on a doc that does not exist yet (checked just above) it is still a create for the rules. Anonymous users therefore have no `credits` field until the populate script runs; the schema reads it as 0.
- **Rule tests** (`rules/src/rules.test.ts`, `when a client writes a server-only field`): a user creating or updating either field is denied, a user creating their doc without them / updating another field is allowed, an admin creating or updating either field is allowed. The 4 deny cases were checked to fail against the previous rules.

## Users schemas › Modify the create user CF to add credits and referralCode

Branch `feat/create-user-credits-referral`, PR into `develop`.

- **`generateReferralCode` in `libs/common/src/utils/referral-code.ts`**, next to `generateUsername`: pure, no Firestore, six random digits joined as a string (leading zeros kept). `REFERRAL_CODE_LENGTH = 6` and `USERS_FIELDS.REFERRAL_CODE` go in `constants/firestore.ts`. It lives in `libs/common` because the populate script (next sub-bullet) generates codes too.
- **The uniqueness loop stays in the function** (`functions/create-user-document/src/referral-code.ts`, `generateUniqueReferralCode`): query `users where referralCode == code limit 1`, regenerate while taken. It is not shared yet: the populate script also has to avoid codes it generated in the same run that are not written yet, so its check will not be this one. Its own file so it can be tested against the emulator without going through the auth trigger.
- **No attempt cap on the loop.** With 1,000,000 codes, a collision is rare until the user count is in the hundreds of thousands, and the spec says "regenerate until no user has it". The check-then-write race is the one accepted in FEATURES.md.
- **`credits` is not passed explicitly**: `userDocSchema` already defaults it to 0, and the CF writes the parsed doc. The CF test asserts `credits: 0` so a schema change that drops the default is caught.
- **Tests:** `generateReferralCode` unit tests (leading zeros, highest digit, format) in `libs/common`; `generateUniqueReferralCode` against the emulator with `generateReferralCode` mocked (free first code, taken code regenerated); the existing CF trigger test also checks `credits` and the `referralCode` format.
- **`fileParallelism: false` in the function's vitest config.** `index.test.ts` wipes every user in its `beforeAll`; run in parallel with `referral-code.test.ts` it could delete the seeded taken-code user mid-test. Both files share one emulator database, so they run one after the other.
- **libs/common tests are local-only**: CI has no job for lib unit tests (recorded in the schema sub-bullet).

## Users schemas › Create a script that populates credits and referralCode for existing users

Branch `feat/populate-users-credits-referral`, PR into `develop`. Not run against any real project.

- **`scripts/src/scripts/populate-credits-referral-code.ts`**, a Deno script like the other backfills (`add-newsletter-to-user.ts`, `add-streak.ts`), run with `pnpm --filter scripts run src/scripts/populate-credits-referral-code.ts`.
- **Only missing fields are written.** `credits` is set to 0 only when it is not a number (an existing balance is never reset), `referralCode` only when absent. Users already complete are skipped; the script is safe to re-run.
- **Uniqueness is checked in memory**, not with one query per user like the CF: every existing code is loaded from the single `users` read into a `Set`, and each generated code is added to it, so two users in the same run can't get the same code (a per-user query would miss codes generated earlier in the run and not yet committed). It reuses `generateReferralCode` from `libs/common`.
- **Batched writes of 500** (Firestore's batch limit), with `update` so no other field is touched.
- **No unit test**: `scripts/` has no test runner and the script is top-level code, like every other script there. It was checked once against the Firestore emulator (3 seeded users: no fields / credits only / both): the first two got a code and the missing `credits: 0`, the existing `credits: 42` and the complete user were left untouched.

## Achievements data › Create schemas and constants for the architecture

Branch `feat/achievements-schemas`, PR into `develop`.

- **Constants in `libs/common`:** `ACHIEVEMENT_DIFFICULTY` next to `DIFFICULTIES` in `constants/constants.ts` (as specified, a separate constant because of `legendary`), `TABLES.ACHIEVEMENTS` (`achievements`) and `TABLES.UNLOCKED_ACHIEVEMENTS` (`unlockedAchievements`) in `constants/firebase.ts`.
- **Two schema files in `libs/schemas/src/firestore`**, one per collection like the rest: `achievement.ts` (`achievementDifficultySchema`, `achievementDocSchema`, `AchievementDifficulty`, `AchievementDoc`) and `unlocked-achievement.ts` (`unlockedAchievementDocSchema`, `UnlockedAchievementDoc`). Both are added to `DocumentMapping`, which requires an entry for every `TABLES` value.
- **`key` stays a `z.string().min(1)`**, not an enum of known keys: the definitions are admin-edited data, and the typed keys come with the event payload union (Achievements API). `key` duplicates the doc id on purpose (spec), so a doc read without its id still carries it.
- **`reward` is a non-negative integer**, not just a number: credits are a whole-unit balance and a negative reward would take credits away on unlock. `unlockedAchievementDocSchema.reward` reuses the same field schema, since it is a snapshot of it.
- **`goalToAchieve` is a positive integer, optional**; `difficulty` optional, no default (the spec makes it optional; defaulting to `easy` would state a difficulty nobody chose). `name` non-empty, `description` any string.
- **`achievedAt` is required** on the unlock (always written by the server transaction), with the shared `timestampSchema`.
- **No db refs (`refs` / `subRefs` in `libs/providers`, front `db-refs.ts`) yet**: nothing reads the collections until the rules / first achievement / endpoint sub-bullets, which add the refs they use.
- **Schema unit tests** in `libs/schemas` (local-only, see the user schema sub-bullet).

## Achievements data › Add rules + tests for achievements and unlockedAchievements

Branch `feat/achievements-rules`, PR into `develop`.

- **`achievements/{achievement}`: `read: if true`, `write: if signedInAdmin()`.** Read is public, signed-out included: the achievements page is server-rendered from the raw definitions (Front Achievements), and nothing in a definition is private.
- **`users/{user}/unlockedAchievements/{achievement}`: only `read: if isSignedIn() && request.auth.uid == user`**, nested under `users/{user}` next to `dailyChallengeResults`. No `write` rule at all, so every client write is denied; the achievements endpoint writes with the admin SDK, which bypasses rules.
- **Accepted: an admin can still write unlocked achievements from a client**, through the existing global `match /{document=**} { allow read, write: if signedInAdmin() }`. Rules are OR'd across matches, so a sub-match cannot take that back; narrowing the global admin rule changes every collection and is its own ticket. Same as for `credits`: admins are trusted.
- **No `collectionGroup("unlockedAchievements")` read rule**: nothing queries across users; a leaderboard of achievements would add it.
- **Tests** in `rules/src/rules.test.ts`: definitions readable signed-out, user create/update denied, admin create/update allowed; unlocks readable by their owner only (other user and signed-out denied), owner create/update/delete denied. The two allow cases were checked to fail against the previous rules (the deny cases already held through default-deny).

## Achievements data › Create one basic achievement: change_username

Branch `feat/change-username-achievement`, PR into `develop`.

- **`ACHIEVEMENT_KEYS = { CHANGE_USERNAME: "change_username" }`** in `libs/common/src/constants/constants.ts`, next to `ACHIEVEMENT_DIFFICULTY`. The event payload union (Achievements API) and the front will discriminate on these keys.
- **The definition lives in Firestore, created by a seed script** (`scripts/src/scripts/seed-achievements.ts`, Deno like the other scripts). Definitions are data an admin edits (Front Achievements CRUD), not code: the script only bootstraps them. Not run against any real project yet.
- **The script never overwrites**: an existing `achievements/{key}` doc is skipped, so re-running it after an admin changed a reward keeps the admin's value. New achievements are added to its list and created on the next run. Each doc goes through `achievementDocSchema.parse` before the write.
- **`change_username`: "New identity" / "Change your username", reward 50, difficulty `easy`, no `goalToAchieve`** (a one-shot action). 50 is small on purpose: the accepted risk in FEATURES.md is that a user can forge this event.
- **`refs.achievements`** added to `libs/providers/src/db-refs.ts` (admin SDK, typed `AchievementDoc`), used by the script and by the endpoint later. No `unlockedAchievements` sub-ref yet: the endpoint adds it with its first use.
- **No automated test**: `scripts/` has no test runner. Checked once against the Firestore emulator: first run creates the doc, a second run after changing `reward` to 999 skips it and keeps 999.

## Achievements API › Strongly typed event payload schemas

Branch `feat/achievement-event-schemas`, PR into `develop`.

- **`achievementEventSchema` in `libs/schemas/src/firestore/achievement.event.ts`**, a dotted sub-module next to `achievement.ts`, with its `AchievementEvent` type. A `z.discriminatedUnion("key", …)` whose members use `z.literal(ACHIEVEMENT_KEYS.…)`, so an unknown key is rejected and TS narrows the payload on `key`. One member today (`change_username`); each new achievement adds one.
- **`change_username` requires `before` and `after`**, shaped like the Cloud Functions `Change<T>` (two snapshots of the same doc), typed from `userDocSchema`.
- **`before` / `after` only carry `pseudo`** (`userDocSchema.pick({ pseudo: true })`), not the whole user doc. The payload is JSON: a serialized Firestore `Timestamp` (`createdAt`…) loses `toDate` and would fail `timestampSchema`, and the full doc would also require `email`. The endpoint only needs the username to verify the change, and fewer client-sent fields means less forgeable surface. Other fields sent inside `before` / `after` are stripped (zod's default), so a front sending its whole user doc still parses.
- **No generic `changeSchema(schema)` helper**: one instantiation today (simplicity); extract it when a second event needs a before/after pair.
- **The event object is strict (`z.strictObject`): a `uid`, or any unknown top-level field, is rejected**, not silently stripped. The uid comes from the bearer token only; a client sending one is a bug worth a 400 rather than a payload that looks accepted.
- **Unit tests** in `achievement.event.test.ts`: valid event parses, extra user fields stripped, missing `before` / `after` rejected, unknown key rejected, `uid` rejected (local-only, CI has no lib unit test job).

## Achievements API › Endpoint for achievement events

Branch `feat/achievements-endpoint`, PR into `develop`.

- **`POST /api/achievements/events`** (`apps/front/app/api/achievements/events/route.ts`), one route for every achievement event, as the spec asks: the payload's `key` picks the verifier.
- **uid only from `Authorization: Bearer <idToken>`, verified with the admin `auth.verifyIdToken`.** Missing header, non-`Bearer` scheme or a token that fails verification → 401. The existing routes let an invalid token throw into their 500 catch; this one maps it to 401. No shared helper existed for "token → uid" (`utils/api.ts` `getUserRight` also reads `rights`), so the check is a private function in the route rather than a new util with one caller.
- **Anonymous users are accepted.** Their ID token verifies like any other, they have a `users` doc and can change their pseudo. Their credits live on the anonymous uid, like the rest of their data.
- **Body parsed with `achievementEventSchema`** → 400, including a non-JSON body and a payload carrying a `uid` (the schema is strict).
- **Per-key verification is a map keyed by `ACHIEVEMENT_KEYS`** (`apps/front/utils/achievement-events.ts`, `isAchievementEventVerified(key, event)`), typed so each key's verifier receives its own narrowed event and a new key in the union fails to compile until its verifier is added. No switch (project rule). `change_username` passes only when `before.pseudo !== after.pseudo`; otherwise 422, nothing written.
- **Reward read from `achievements/{key}` server side**, never from the payload. Missing doc → 404. The doc is `achievementDocSchema.safeParse`d before its reward is paid; an invalid admin-edited doc → 500 rather than paying a malformed reward.
- **One transaction** reads `users/{uid}` and `users/{uid}/unlockedAchievements/{key}`, then `create()`s the unlock (`achievedAt: serverTimestamp()`, `reward` snapshot) and `update`s `credits` with `FieldValue.increment(reward)`. Reading the unlock inside the transaction makes concurrent requests contend and retry, so the loser sees the doc and answers "already unlocked" instead of failing on `create()`; `create()` stays as the write-level guarantee. `increment` on a missing `credits` field (anonymous users, pre-populate users) starts from 0.
- **Responses:** first unlock 201 `{ unlocked: true, reward }`; already unlocked 200 `{ unlocked: false }`, credits unchanged — a normal outcome, not an error (the front checks first anyway). Missing `users/{uid}` doc → 404 (checked in the transaction, an `update` would otherwise throw).
- **`subRefs.unlockedAchievements(uid)`** added to `libs/providers` db-refs, typed `UnlockedAchievementDoc`.
- **Tests: a Playwright API spec against the emulators** (`e2e/achievements/achievement-events.spec.ts`), the established way this app tests its routes against Firestore/Auth: the real Next server, the real `create-user-document` blocking function, seeding and assertions with the admin SDK. ID tokens come from the Auth emulator's `signUp` REST call (the admin SDK cannot mint ID tokens). Covers no / invalid token 401, bad payload and `uid` 400, same pseudo 422, missing achievement 404, first unlock (credits += reward, unlock doc with the reward snapshot), a second call (200, paid once), two concurrent calls (one 201 + one 200, paid once), and an anonymous user (doc seeded without `credits`, like the app writes it — the blocking function does not fire for anonymous sign-ups). The file runs serially: the 404 case deletes the shared definition. New `achievements` suite in `front.yml`'s E2E matrix.
- **The verifier map has vitest unit tests** (`utils/achievement-events.test.ts`), run by the front `🧪 Unit Tests` job.

## Front Achievements › Admin CRUD for achievements

Branch `feat/admin-achievements`, PR into `develop`.

- **Same shape as the daily-challenge / sounds admin CRUD**: a client page at `/admin/achievements` with a searchable table (key, name, description, reward, difficulty, goal), a `NEW_ACHIEVEMENT` modal for creation, and an `AchievementSheet` opened from a row through the `achievement-key` query param (nuqs) for edit + delete, the delete behind an `AlertDialog` confirm. Linked from the admin home grid and from the admin sub menu of the user dropdown.
- **Admin gating is the existing `admin/layout.tsx` `AdminGuard`**, nothing page-specific. The real protection is the `achievements` Firestore rule (`write: if signedInAdmin()`), already tested.
- **Not behind the `Achievements` feature flag**: this is an admin tool, and the flag hides the user-facing UI only. Admins must be able to prepare definitions before the flag goes on.
- **Own RTK Query API, `achievementsApi`** (`redux/api/achievements.ts`), `fakeBaseQuery` + client Firestore like `dailyChallengeApi`: `getAllAchievements`, `getAchievementByKey`, `createAchievement`, `updateAchievement`, `deleteAchievement`, with `Achievement` / `AchievementList` tags. Every read is `achievementDocSchema.safeParse`d; an invalid doc is logged and left out of the list rather than breaking the page.
- **Doc id = `key`.** Create writes to `achievements/{key}` inside a transaction that reads the doc first and refuses when it exists, so creating a key that already exists never silently overwrites a live definition; the error is shown under the key field. A plain `setDoc` was rejected for the create for that reason. Update is a full `setDoc` on the same key (so clearing difficulty / goal removes the field).
- **The key is read-only once created**: the edit form shows it `readOnly`, and the update always writes to the sheet's original key. Renaming a key would orphan every `unlockedAchievements/{key}` and the event verifier map; it is create-new + delete instead.
- **One form, validated by `achievementDocSchema`** (zodResolver), shared by the modal and the sheet (`components/achievement-form-fields.tsx`, two call sites). Difficulty is a select over `ACHIEVEMENT_DIFFICULTY` plus a "None" entry (`NO_ACHIEVEMENT_DIFFICULTY`, since Radix Select cannot hold an empty value) mapping to `undefined`. An empty goal maps to `undefined`, since it is optional.
- **`ACHIEVEMENT_DIFFICULTY_TO_BADGE_VARIANT`** next to `DIFFICULTIES_TO_BADGE_VARIANT`, `legendary` in purple.
- **Deleting a definition does not touch unlocks**: users keep the `unlockedAchievements` doc and the credits already paid (the reward is a snapshot); the endpoint then answers 404 for that key.
- **No story**: no admin component in the app has one (stories cover `components/ui` primitives only).
- **E2E spec `e2e/achievements/admin-achievements.spec.ts`**, in the existing `achievements` suite of `front.yml` (its `path` already covers the folder). Admin = a `setupUser` user plus a `rights` doc seeded with the admin SDK, logged in with `loginViaUI`. Covers list, create (doc written under its key with every field), create on a taken key refused (doc untouched), edit (key read-only, fields updated, difficulty cleared), delete (after confirm). Locators are new `data-testid` `SELECTORS`.
- **The spec reaches the page through the admin menu, not `page.goto`.** A full reload of an admin page can race `AdminGuard`: the session reads as loaded before the rights are, and the guard redirects home (`ERR_ABORTED` on the goto). Navigating client side keeps the loaded session, and exercises the new menu entry. The guard race is pre-existing, not fixed here.
- **Lint: 2 new `react(capitalized-calls)` warnings** on `SELECTORS.X(...)` function selectors, the same as the existing ones (`GAME_MAP(...)`, `RACE_FINISHED_SCORE(...)`); 0 errors.
- **`getAchievementByKey` returns `null` for a missing doc** instead of throwing (not found is a normal outcome); the sheet shows `EmptySheet` for it.
- **`NAV_USER_DROPDOWN_TRIGGER` added to `SELECTORS`** and used by `nav-user.tsx` (the element that emits it) and the new spec. The existing literal in `e2e/helpers/lobby.ts` is left as is.
- **Review: the reviewer proposed splitting (list / create / edit+delete); overruled.** FEATURES.md defines the CRUD as one sub-bullet, and the three parts share the page, API and form. Not done, as in the neighbouring admin sheets: failed saves / deletes in the sheet are not surfaced (no `.unwrap()`), and `key` has no charset constraint in `achievementDocSchema` (a `/` in a key makes the create fail, and the error is shown under the key field).

## Front Achievements › AchievementCard component

Branch `feat/achievement-card`, PR into `develop`.

- **`AchievementCard` in `components/cards/achievement-card.tsx`**, next to the other cards, built on the shadcn `Card` like `LobbyHistoryCard` (title, description, `CardAction` badge, icon + text meta row).
- **Props: `achievement: AchievementDoc` and optional `unlocked?: UnlockedAchievementDoc`.** The achievements page maps the server-fetched definitions and looks each one's unlock up by `key` in the client-fetched list; no unlock = locked. No `isUnlocked` boolean prop: it would be derivable from `unlocked`.
- **Locked vs unlocked is a `data-unlocked` attribute** styled with Tailwind `data-[unlocked=false]:` variants (dashed border, muted text), plus a `Lock` / `Trophy` icon with an `aria-label`. No opacity (project rule).
- **Reward: unlocked shows the paid snapshot (`unlocked.reward`), locked shows the definition's reward**, so editing a reward later never changes what the card says a user earned. A ternary, not `||`: a paid reward of 0 is a real value.
- **`achievedAt` formatted with next-intl `useFormatter().dateTime(…, { dateStyle: "medium" })`**, locale aware, instead of the `toLocaleDateString()` of older cards.
- **Difficulty badge reuses `ACHIEVEMENT_DIFFICULTY_TO_BADGE_VARIANT`** (added with the admin CRUD, `legendary` purple); label translated. No badge when the difficulty is unset. `goalToAchieve` shown as "Goal: N" when set (no progress tracked yet).
- **i18n: new `achievementCard` namespace in `messages/en.json` and `fr.json`**, reward with an ICU plural (`# credit` / `# credits`).
- **No `"use client"`**: the card has no state or effects, and the next-intl hooks work in both; its parent (the client list) decides.
- **No loading state, no skeleton export.** Loading is global (spec): the list waits for its unlocks and renders the cards once. A list skeleton, if any, belongs to the achievements page sub-bullet, which owns the loading.
- **Story `stories/AchievementCard.stories.tsx`**: locked, unlocked, with goal, without difficulty, and every difficulty locked + unlocked. It wraps the story in a `NextIntlClientProvider` (en messages, UTC) as a meta decorator, since it is the first story of a translated component; a global preview decorator was not needed for one story.
- **No unit test**: the card has no pure logic outside JSX (the front vitest config is node-only, no component rendering).

## Front Achievements › Achievements page and menu tab

Branch `feat/achievements-page`, PR into `develop`.

- **Server page `app/[locale]/(app)/achievements/page.tsx`** reads the definitions with the admin SDK (`refs.achievements` from `@repo/providers`, the mechanism the API routes already use; no page fetched Firestore server side before). Each doc is `achievementDocSchema.safeParse`d; an invalid one is logged and left out, like the admin list. Definitions are plain JSON, so they pass as props to the client component unchanged.
- **`await connection()` before the read** so the page renders per request (Next 16's preferred opt-out of prerendering over `dynamic = "force-dynamic"`). Otherwise `next build` would freeze the definitions at build time, and an admin edit would not show until the next deploy.
- **Client component `achievements-content.tsx`** holds the gate, fetches the unlocks and renders the grid of `AchievementCard`s. The title is inside it too, so a disabled flag shows nothing of the feature.
- **`useFeatureFlag(flag)` added (`hooks/use-feature-flag.ts`)**, first consumers: the menu entry and the page. It is a `useSyncExternalStore` over the same localStorage keys and `storage` event the dev tools write (`subscribe` in `hooks/use-storage.ts` is now exported as `subscribeToStorage`). It returns `null` on the server and during hydration, then `true` / `false`: the page must tell "not known yet" from "off", or it would redirect every visitor during hydration. The pure part, `isFeatureFlagEnabled` (only a stored `true` enables a flag), is in `utils/feature-flags.ts` with unit tests; the front vitest config is node-only, so the hook itself is covered by the E2E spec.
- **Flag off on the page → `router.replace(PAGES.HOME)`**, the same pattern as `AuthGuard` / `AdminGuard`, rendering nothing meanwhile. A client-side `notFound()` was rejected: Next documents it for Server Components only. Known edge: a `?ff=achievements-true` link opened directly on `/achievements` may redirect before `DevTools` applies it, so share the link on another page.
- **`getUnlockedAchievements({ uid })` added to the existing `achievementsApi`** (`fakeBaseQuery` + client Firestore, same file as the admin CRUD), returning a `Record<key, UnlockedAchievementDoc>` keyed by doc id so each card looks its unlock up by `key`. Invalid docs are logged and skipped. `TABLES_SUB_REFS.unlockedAchievements(uid)` added to the client refs. No tag: nothing invalidates it yet (the username event sub-bullet will).
- **One global loading state**: the `Loader` spinner centered, as on the history page, until the unlocks are loaded; then all cards render at once. A failed fetch shows an error line instead of a grid of wrongly locked cards. No definitions → an empty-state line.
- **Anonymous users: the page works for them** (every visitor is signed in anonymously, has a `users` doc, and can unlock per the endpoint), showing the definitions and their own unlocks; the rules already let a signed-in owner read `unlockedAchievements`. The menu tab lives in `NavUser`, which already renders nothing for anonymous users, so they have no tab; that is not changed here. The query waits for the session uid.
- **Menu tab in `NavUser`** after History (`Trophy` icon, `PAGES.ACHIEVEMENTS = "/achievements"`), rendered only when the flag is on. `NavUser` is where the other client pages are listed; the home footer links are left alone.
- **SEO metadata like the daily-challenge page** (title, description, canonical, hreflang, Open Graph, Twitter), plus `robots: { index: false }` while the feature is behind a flag: search engines would otherwise index a URL that redirects home for everyone.
- **i18n:** `nav.achievements` and an `achievements` namespace (meta, title, description, empty, error) in `en.json` and `fr.json`.
- **E2E spec `e2e/achievements/achievements-page.spec.ts`** in the existing `achievements` suite of `front.yml`. The flag is set with `page.addInitScript` writing the localStorage key, as `lobby-driver.spec.ts` does. Covers: flag off → no menu tab (with the History entry as the menu-open anchor), flag off → the page redirects home; flag on → the tab links to the page, the page lists seeded definitions with the seeded unlock (admin SDK) marked `data-unlocked="true"` and the other `false`. Locators: new `NAV_ACHIEVEMENTS` and `ACHIEVEMENTS_ITEM(key)` `data-testid`s on the `li` around each card, the card's own `data-unlocked` inside it.
- **The listing test opens the page with `page.goto`, not the menu.** Locally, clicking the tab right after `loginViaUI` sometimes landed back on home: the login form's `router.push(HOME)` can fire again after the test moved on. The same pre-existing race makes `admin-achievements.spec.ts` flaky locally (seen once in 3 repeats); CI's retries absorb it. `goto` also exercises the hydration path of the gate.
