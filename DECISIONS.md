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

---

# Coss design-token system — decisions

Branch `design/coss-token-system`. Goal: the front should read as modern, in the style of
[coss.com/ui](https://coss.com/ui), without swapping component libraries. What follows is
what was decided and why, so the next pass argues with the reasoning instead of rediscovering
it.

## The load-bearing discovery

`app/[locale]/layout.tsx` renders `<body data-marathon className="… dark …">`. Both are
hardcoded, always on, with no theme switcher. So the palette that ships is **`.dark`
overridden by `[data-marathon]`** — pure black background, white text, pink primary. The
`:root` light block is dead in the app.

It is *not* dead in Storybook: `.storybook/modeDecorator.tsx` toggles `.dark` on
`documentElement` behind a button, so light mode is reachable there. That is why `:root` was
modernised rather than deleted.

## Pass 1 — mechanics only (superseded in part by pass 2 below)

> The section that follows was the first pass. It changed the token plumbing and left every
> brand token alone, which made the result visually inert on the screens that matter. Pass 2
> reversed three of its decisions. Kept here because the reasoning about the cascade and the
> licence still holds.

### We did not adopt Coss's palette, only its mechanics

Coss is a developer-tool aesthetic: deliberately colourless, near-black `--primary`,
Inter + Geist Mono. This app is a game with a brutalist art direction — uppercase
`font-interference`, squared corners, pink/orange/lime brand hues. Importing Coss's colours
would have erased the game's identity, which is art direction, not stale styling.

So the six mechanics were taken and the brand was kept:

| Coss mechanic | applied as |
| ------------- | ---------- |
| surfaces are alpha over black/white, not solid greys | `--secondary` / `--muted` / `--accent` = `--alpha(… / 4%)`, `--border` 8%/6%, `--input` 10%/8% |
| tokens reference Tailwind's palette vars, never hand-tuned `oklch()` | `var(--color-zinc-800)`, `var(--color-red-500)`, … |
| one-off greys come from `color-mix()`, not a new token | `--muted-foreground`, `--sidebar-foreground`, dark `--background` / `--card` / `--popover` |
| state colours pair a 500 accent with a 700 (light) / 400 (dark) text | new `--info` / `--success` / `--warning` families |
| radius derived by `calc(±4px)` from one `--radius` | already the case — `0.65rem` kept, Coss's `0.625rem` is 0.4px away and not worth a diff |
| `--font-heading` equals `--font-sans` | not applied — this app has five brand faces and a real display/body split |

`zinc` was chosen over Coss's `neutral` because the existing palette was hue ~285 and the
brand primary is hue ~293. Zinc is the violet-leaning neutral family; `neutral` is dead
grey and would have fought the primary.

## `[data-marathon]` was left completely untouched

It needed no edit, and that is the point of the approach rather than an omission. The new
`.dark` definitions are *relative* — `--card: color-mix(in srgb, var(--background) 98%,
white)`. Custom properties resolve at computed-value time on the element that uses them,
and `[data-marathon]` redefines `--background: oklch(0 0 0)` on the same `<body>`, so
`--card` re-resolves against pure black on its own. Verified in the built CSS: the emitted
rule keeps `var(--background)` rather than baking in a zinc-950 value.

The old tokens could not do this — `--card: oklch(0.21 0.006 285.885)` was a solid grey slab
that ignored whatever background it sat on.

Consequence worth knowing: Tailwind also emits a flat hex fallback inside
`@supports not (color: color-mix(…))`, and that fallback *is* computed from `.dark`'s own
background, not marathon's black. Browsers without `color-mix()` therefore get zinc-950-ish
cards instead of black ones. Accepted — `color-mix()` is baseline in every browser this game
targets.

Marathon also keeps its own `--destructive` / `--destructive-foreground` pair (saturated red
plus near-white), which shadows the Coss-style pair from `.dark`. That is intentional: in
marathon the token drives a *solid* destructive button, so it plays the "text on solid"
role, not Coss's "bright text on subtle tint" role.

## Status badges moved to Coss's subtle pattern

`components/ui/badge.tsx` held nine hand-picked colour pairs (`bg-orange-400/50`,
`text-purple-200`, `bg-marathon-green`, …). Nine saturated solid chips in one admin table is
exactly the loud look we are getting rid of, so all of them now follow one recipe —
`border-<token>/20 bg-<token>/10 text-<token>-foreground`:

| variant | now |
| ------- | --- |
| `GREEN` | `success` |
| `ORANGE` | `warning` |
| `RED` | `destructive` |
| `BLUE` | `info` |
| `NEUTRAL` | `border-border bg-muted text-muted-foreground` |
| `PURPLE`, `YELLOW`, `LIME` | Tailwind 500/400 at the same alphas |
| `PINK` | `marathon-pink` at the same alphas |

Every `BADGE_VARIANTS` key was kept — `constants/mapping.ts` and `constants/social.ts` map
domain statuses onto them, so removing one would have broken those tables.

Three genuine bugs were fixed while rewriting those lines, because the lines were being
rewritten anyway:

- `blur` used `border-grey-100`. Tailwind's colour is `gray`, so the class never existed.
- `PINK` used `text-marathon-pink-foreground`, which is not registered in `@theme` — also a
  no-op class.
- `default` used `text-foreground` on `bg-primary`. `--primary-foreground` is the token that
  means "text on primary", and it is what the variant now uses. This is a visible change:
  on marathon's pink primary the label goes from white to black.

## Palette literals routed to tokens

211 hardcoded `zinc` / `neutral` / `gray` utilities bypassed the token layer, which would
have left roughly half the app ignoring everything above. All of them are now tokens, across
16 files. 87 of the 211 were two mechanical light/dark pairs in three files:

- `text-zinc-900 dark:text-zinc-50` → `text-foreground` (legal-page headings)
- `text-zinc-700 dark:text-zinc-300` → `text-muted-foreground` (legal-page body copy)

The rest collapsed to `text-muted-foreground`, `border-border`, `bg-muted`, `bg-background`
and `hover:text-foreground`.

Deliberately **not** converted:

- `text-white` over photo gradients (`game-card.tsx`, `admin/page.tsx`, `lobby-finished.tsx`)
  and `border-white/50` on `mini-map.tsx`. These sit on imagery, not on a themed surface —
  white is the correct literal there, in any theme.
- `indicatorClassName="bg-white"` on the points `Progress`. Same reason: it is the filled
  bar over a brand-coloured track.
- The eight-step `--color-gray-200 … 900` ramp in the `loadingColors` keyframes in
  `globals.css`. It is an animation ramp; the token layer has no eight-step scale to express
  it, and inventing one for a single keyframe would be worse than the literal.

## Scope held back on purpose

- **No library swap.** Neither Coss nor ReUI was installed. Coss's token file lives in
  `packages/ui/`, which the repo's mixed licence puts under **AGPLv3** (only `apps/origin/`
  and `apps/ui/` are MIT) — copying it into this front would put a network-copyleft
  obligation on the whole app. Its *design decisions* are not the file, and those are what
  was reimplemented. Nothing was copied.
- ~~**The `rounded-none` overrides stay.**~~ Reversed in pass 2.
- ~~**The `marathon*` button variants stay.**~~ Reversed in pass 2.
- **`function Button(…)` / `function Badge(…)` were not converted to arrow-consts.** The
  diff rewrites the `cva` recipes, not the declarations, and the repo convention applies to
  lines a diff already touches.
- **No Radix → Base UI migration.** It is the real cost of actually adopting Coss's
  components, and it is a separate, much larger change: 103 `asChild` props across 43 files,
  ~200 `*Content` renames, 72 `SelectContent` sites needing the new `items` prop, and
  Sonner replaced by a `ToastProvider` in 24 files.

## Verified

`pnpm --filter @repo/front typecheck` clean. `pnpm lint` 0 errors (64 pre-existing
`no-console` warnings in `scripts/`, untouched). `pnpm --filter @repo/front build` passes,
and the built CSS was inspected: no `--alpha(` survives unresolved, every alpha surface
emits a hex value plus a `color-mix()` upgrade, and `[data-marathon]` still ships.

Not run: the Playwright e2e suite and Storybook. No `data-cy` attribute, prop or DOM
structure changed, so neither should be affected — but the visual outcome is a palette
change on every screen and wants a look before it merges.

---

## Pass 2 — the shape layer, fully Coss-soft

Pass 1 was visually inert, and that was a scoping mistake rather than a bug. Every token that
paints a screen here is a `[data-marathon]` brand token — `text-foreground` (95 sites),
`text-primary` (89), `bg-background` (69), `bg-primary` (55), `border-primary` (25) — and
pass 1 preserved all of them by design. The tokens it *did* change (`--muted`, `--accent`,
`--card`, `--popover`, `--border`) are concentrated in admin. So the refactor was real and
the surface was unchanged.

Direction chosen for pass 2: **fully Coss-soft, everywhere** — 10px radius across the app,
sentence case, the sans stack instead of the display face, pink demoted from a fill to an
accent. This removes the brutalist art direction. That was an explicit call, not a default.

### Pink is now an accent, not a fill

`[data-marathon]` had `--primary` and `--ring` both set to the brand pink, so pink was
simultaneously the fill of every primary button, the colour of 89 `text-primary` sites, and
the focus ring. Nothing could recede.

- `--primary` → `var(--color-zinc-100)`, `--primary-foreground` → `var(--color-zinc-900)`.
  Primary surfaces are now neutral, the Coss way.
- `--ring` **keeps the pink**. Focus is the one place the brand still lands, which is what
  "accent only" means here.
- `--marathon-pink` / `-orange` / `-yellow` / `-green`, `--ready` and `--blue-accent` are
  untouched and still available — the `PINK` badge, the daily-challenge nodes and the
  `::selection` colour still use them.

A commented-out older `--primary` was deleted while rewriting those lines.

### Squared corners un-pinned

43 `rounded-none` occurrences pinned squared corners *over* shadcn's radius — this was the
"mix of shadcn and custom style" in one line. All removed except two functional cases that
are not styling:

- `calendar.tsx` — `range_middle` and `data-[range-middle=true]` need square middles for a
  date range to read as one bar. Standard shadcn does the same.
- `input-group.tsx` lines 139/155 — the inner `input`/`textarea` of a group must not carry
  their own radius inside the group shell.

`select.tsx` also dropped `font-mono` on the trigger and the content, and the custom
`border-0 border-b border-foreground` underline on items in favour of the base
`rounded-sm` item.

### Display face and caps dropped

`font-interference` (30 sites) and `uppercase` (24) are gone from components. `--font-sans`
is `--font-shapiro`, so type falls back to the brand sans rather than a system font — the
display face is retired from default UI, not the brand typeface.

The font itself stays loaded: `app/[locale]/layout.tsx` keeps the
`variable: "--font-interference"` declaration and `@theme` keeps `--font-interference`, so
`font-interference` is still available to opt into. `stories/Fonts.stories.tsx` is
deliberately untouched — the font name there is showcase data, not styling.

### Brutalist inset rings became bordered surfaces

`--inset-shadow-marathon` / `-marathon-white` drew a 1px inset ring in primary/foreground.
The six uses in `home-footer.tsx` are now `border rounded-lg`, turning the footer mosaic into
soft bordered cards. The two `@theme` definitions remain, unused, for the same
opt-back-in reason as the font.

The six `marathon*` button variants were rewritten to their Coss equivalents (solid neutral,
inverted, outline, destructive, link). `marathon` and `default` are now the same declaration,
as are `marathon-black` and `marathon-outline`; `defaultVariants.variant` is still
`"marathon"`. Collapsing the duplicates means editing every call site, which is a rename
ticket, not this one.

`driver-popover` in `globals.css` moved from `rounded-none!` + `font-interference!` +
`font-mono!` to `rounded-lg!` and the default stack.

### Visible changes to expect

- Primary buttons: pink fill → near-white with dark label.
- All `text-primary` (89 sites): pink → near-white. Emphasis now comes from
  `foreground` vs `muted-foreground`, as in Coss.
- Every surface gains a 10px radius: dialogs, popovers, dropdowns, cards, selects,
  textareas, tooltips, avatars, sliders.
- Buttons and headings lose caps and the display face.
- Home footer: inset pink/white rings → bordered rounded cards.
- Focus rings are pink.

### How this was done, and one bug it caused

The edits were applied by script. A first attempt used regexes over whole files and damaged
formatting — it collapsed whitespace before `>`, which reflowed multi-line JSX and turned
`length > 0` into `length> 0`. All `.tsx` files were reset and the work redone with rewrites
that only ever touch the contents of a string literal.

That second approach had one bug worth recording, because it is the kind that typechecks:
trimming literal contents rewrote the JSX whitespace expression `{" "}` to `{""}` in 11
files, silently deleting spaces between inline elements. Restored. It also emptied
`className: "font-interference"` in `Fonts.stories.tsx`, where the value is data — that file
was reverted whole.

Residual churn: about 10 lines where a pre-existing double space inside a `className` string
collapsed to one. No behaviour change; left as is.

### Verified

`typecheck` clean. `pnpm lint` 0 errors, 64 warnings — the same pre-existing `no-console`
count as before the branch. `build` compiles. Built CSS confirms
`[data-marathon] --primary: var(--color-zinc-100)`, `--ring: #ff445c`, `--radius: .65rem`,
and `border-radius: 0` surviving only in the calendar/input-group chunk.

Not run: Playwright e2e and Storybook. `data-cy` attributes, props and DOM structure are
unchanged, but this pass alters the look of every screen and the Storybook snapshots will
need regenerating.
