# Dependency upgrade — decisions

Branch `improvement/upgrade-dependencies`. Every workspace dependency was moved to its
latest release unless a row below says otherwise. Each deferral names the thing that
blocks it, so the next pass can re-test the blocker instead of re-deriving it.

## Held back on purpose

| package | held at | latest | why |
| ------- | ------- | ------ | --- |
| `typescript` | `6.0.3` | `7.0.2` | `typescript-eslint@8.70` (pulled by `@antfu/eslint-config@9`) declares `typescript: >=4.8.4 <6.1.0`. TS 7 is the Go port (Corsa); the lint stack cannot load it, and lint is the gate the whole repo runs. `6.0.3` is the newest version inside that range, and it is also the floor `@codecompose/typescript-config@5` requires (`typescript: >=6.0.0`). Re-test when typescript-eslint ships a TS 7 build. |
| `pnpm` (`packageManager`) | `10.30.0` | `12.4.1` | Two majors of lockfile format in one upgrade branch, and every developer plus `pnpm/action-setup` would have to move at the same time. Its own change, not this one. |
| `firebase-functions-test` | `3.5.0` | `3.5.0` | Already latest, but it is the blocker for the item below — noted here so it is visible. |

## Choices that changed code, not just versions

### TypeScript 6, not 7

TS 6 is the last JS-based compiler; the deprecated options it removes (`baseUrl`,
`moduleResolution: node10`, `target: ES5`, `outFile`, …) were almost unused here. Two
fallouts, both fixed:

- `functions/socials/tsconfig.json` declared `baseUrl: "."` plus a `~/*` path that the
  shared preset already provides. The whole `compilerOptions` block was redundant and is
  gone.
- TS 6 no longer auto-includes `@types` packages. `@repo/schemas` uses the `console`
  global, which it no longer picked up, so it now declares `"lib": ["esnext", "dom"]`.
  `dom` rather than `@types/node` because `@repo/schemas` is consumed by the browser app
  as well as by the functions.

### `firebase-admin` 14 + a local `makeDocumentSnapshot`

`firebase-admin@14` removes the namespaced default export (`admin.credential`,
`admin.apps`, `admin.firestore()`). Two files used it and were migrated to the modular
entry points (`firebase-admin/app`, `firebase-admin/firestore`, `firebase-admin/storage`):
`libs/providers/src/firebase.ts` and `functions/video-capture/src/index.ts`.

`firebase-functions-test@3.5.0` — the latest release — still calls the removed
`admin.firestore()` internally from `makeDocumentSnapshot`, and its peer range stops at
`firebase-admin@13`. Only that one helper is affected; `firebaseFunctionsTest().wrap()` is
fine. The two alternatives were:

1. hold `firebase-admin` at 13. Rejected: every 13.x now fails `trustPolicy: no-downgrade`
   on transitive deps (`@types/node@22.20.2` → `undici-types@6.21.0`, `jwks-rsa@3.2.2`),
   so staying on 13 would mean adding three trust exclusions — including one on a
   JWT-verification library — to move *backwards*.
2. reimplement the helper. Chosen.

`libs/testing/src/document-snapshot.ts` is a drop-in `makeDocumentSnapshot(data, refPath)`
exported as `@repo/testing/document-snapshot`. Same signature, so the 66 call sites in
`functions/listen-docs` only changed their import line. It builds the Firestore value
proto and calls `snapshot_`, which is still present in `@google-cloud/firestore@9`.
Delete it and go back to the upstream import once `firebase-functions-test` supports
`firebase-admin@14`.

### `preferRest` is off against the emulator

`firebase-admin@14` pulls `@google-cloud/firestore@9`. With `preferRest: true` the client
takes the REST transport, and under v9 that transport authenticates with real ADC
credentials even when `FIRESTORE_EMULATOR_HOST` is set — so the Admin SDK stopped being
"owner" against the emulator and started getting `PERMISSION_DENIED` from the security
rules. gRPC (`createInsecure()`) has no such problem.

`libs/providers/src/firebase.ts` therefore sets `preferRest: !isEmulated`. Production
behaviour is unchanged; only emulator-backed test runs switch to gRPC.

### `tsdown` 0.23 output extensions

`tsdown@0.23` defaults `fixedExtension` to `true` when `platform === "node"`, so builds
started emitting `index.mjs` / `index.d.mts` while every `exports` map points at `.js` /
`.d.ts`. The build stayed green and every consumer failed with `TS2307`.

Rather than rewrite the export maps of nine packages, each `tsdown.config.ts` now sets
`fixedExtension: false`. The packages are all `"type": "module"`, so `.js` is already ESM
and the extension carries no information.

### ESLint 10 / `@antfu/eslint-config` 9

`@eslint-react/eslint-plugin@5` absorbed the React Compiler hook rules, and antfu 9 no
longer registers `react-hooks` or `react-hooks-extra` as separate plugins — everything is
under the `react/` prefix. `eslint-plugin-react-hooks` was removed from the root
devDependencies because nothing references it any more, and the rule overrides were
remapped:

| before | after |
| ------ | ----- |
| `react-hooks/exhaustive-deps` | `react/exhaustive-deps` |
| `react-hooks/rules-of-hooks` | `react/rules-of-hooks` |
| `react-hooks-extra/no-direct-set-state-in-use-effect` | `react/set-state-in-effect` |

Three rules that are new in this config are turned down rather than chased across the app:

- `react/static-components` → `warn`. It fires on `apps/front/components/ui/avatar.tsx`,
  which really does create components during render. A genuine finding, but fixing it is a
  behaviour change and belongs in its own ticket; `--quiet` keeps CI green meanwhile.
- `e18e/prefer-array-fill` → `off`. Its autofix rewrites
  `Array.from({ length: n }, () => null)` into `Array.from({ length: n }).fill(null)`,
  which is typed `unknown[]` and breaks `tsc`. The typed alternative, `new Array<T>(n)`,
  is rejected by `unicorn/no-new-array`. The two rules cannot both be satisfied.
- `markdown/no-multiple-h1` → `off`, scoped to `**/*.md`. `CLAUDE.md` and
  `apps/front/README.md` use several H1s deliberately.

`eslint --fix` also normalised `eslint.config.mjs` from CRLF to LF, which is why that file
shows a whole-file diff.

### Front-end API migrations

- `react-zoom-pan-pinch@4` renamed `ZoomPanPinch.transformState` to `.state`
  (`apps/front/components/mini-map.tsx`, 3 sites).
- `react-day-picker@10` renamed the `table` class-names slot to `month_grid`
  (`apps/front/components/ui/calendar.tsx`).
- `e18e/prefer-timer-args` autofixes were kept in `lobby-starting.tsx` and
  `lobby-waiting.tsx` — they pass the argument to `setTimeout` instead of allocating a
  closure, and both typecheck.

### `@types/node` on `^26`, runtime still `nodejs22`

`@types/node@22.x` resolves to `22.20.2`, which fails `trustPolicy: no-downgrade` through
`undici-types@6.21.0`. Every package moved to `^26.5.1`. The Cloud Functions runtime in
`firebase.json` stays `nodejs22` and CI stays on Node 22 — this is a type-surface change
only. It does mean the types describe APIs newer than the deploy runtime, so prefer the
Node 22 docs when reaching for something unfamiliar.

### `trustPolicyExclude` gained `@pnpm/types`

`firebase-tools-with-isolate@15.30.0` depends on `isolate-package@1.37.0`, which pulls
`@pnpm/types@1001.3.1` — a pnpm first-party package published without a provenance
attestation, which `no-downgrade` reads as a takeover risk. The exclusion is scoped to
that one package name; nothing else about the policy changed. The alternative was freezing
the deploy tooling two majors behind.

## Repo fixes made along the way

- `libs/common`, `libs/schemas`, `libs/providers` and `libs/testing` declare
  `--coverage` in their `test` scripts but never depended on `@vitest/coverage-v8`, so
  `pnpm test` at the root died on the first lib. Added the dependency, and set
  `passWithNoTests: true` in those four configs — none of them ships a test file yet, and
  vitest exits 1 on an empty run.
- `vite@8` warns that `__dirname` is unsupported by the native config loader. All 13
  `vitest.config.ts` files now use `import.meta.dirname`.

## Not touched

- **No new CI workflow.** There is still no lint or typecheck job; `pr` gating happens
  through the per-function deploy workflows and `e2e-front.yml`. Adding one is worth doing
  but is its own change.
- **`.nvmrc` (`v26.8.2`) still disagrees with `.github/actions/initialization`
  (`node-version: 22`).** CI was left on 22 to match the `nodejs22` functions runtime.
  Every new dependency's `engines` is satisfied by current 22.x (`vitest@5` needs
  `>=22.12`, `tsdown@0.23` needs `>=22.18`), so this is a consistency wart, not a break.
- **`shadcn` is in `apps/front` `dependencies`.** It is a CLI and belongs in
  `devDependencies` — or nowhere, since this repo hand-writes `components/ui`. Bumped to 4
  and left where it was.
