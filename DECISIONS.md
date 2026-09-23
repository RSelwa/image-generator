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
