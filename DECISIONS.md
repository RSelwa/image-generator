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
