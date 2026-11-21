# ADR 0001 · Dependency baseline

- Status: accepted
- Date: 2026-11-21

## Context

The plugin shell pins every dependency exactly. "Latest" means the newest stable `dist-tags.latest` that passes the compatibility probes in the plugin shell blueprint (Task 1). An older major is allowed only with a named blocker in this record.

## Decision

### Versions

| Package | Version | Kind |
| --- | --- | --- |
| `vue` | 3.5.46 | runtime |
| `@nuxt/ui` | 4.13.0 | runtime |
| `tailwindcss` | 4.3.5 | runtime |
| `effect` | 4.1.5 | runtime |
| `@tanstack/vue-form` | 1.33.5 | runtime |
| `obsidian` | 1.14.4 | dev (API types; newest published, no 1.15.x types exist on 2026-11-21) |
| `typescript` | **6.0.3** (latest: 7.0.2) | dev |
| `vue-tsc` | 3.3.14 | dev |
| `vite` | 8.3.8 | dev |
| `@vitejs/plugin-vue` | 6.0.11 | dev |
| `vitest` | 5.1.1 | dev |
| `@vitest/coverage-v8` | 5.1.1 | dev |
| `@effect/vitest` | 4.1.5 | dev |
| `@vue/test-utils` | 2.6.0 | dev |
| `happy-dom` | 21.0.4 | dev |
| `fast-check` | 4.10.3 | dev |
| `wdio-obsidian-service`, `wdio-obsidian-reporter` | 3.5.0 | dev (e2e in a real Obsidian; added 2026-11-21) |
| `@wdio/cli`, `@wdio/local-runner`, `@wdio/mocha-framework`, `@wdio/globals` | 10.2.0 | dev (e2e) |
| `mocha` | 12.0.3 | dev (e2e; same version @wdio/mocha-framework installs) |
| `@types/mocha` | 10.0.10 | dev (e2e) |
| `@stryker-mutator/core` | 10.1.1 | dev |
| `@stryker-mutator/vitest-runner` | 10.1.1 | dev |
| `@stryker-mutator/typescript-checker` | 10.1.1 | dev |
| `oxlint` | 1.94.0 | dev |
| `eslint` | **9.39.5** (latest: 10.15.0) | dev |
| `@eslint/js` | **9.39.5** (latest: 10.0.1) | dev |
| `typescript-eslint` | 8.73.0 | dev |
| `eslint-plugin-vue` | 10.12.1 | dev |
| `vue-eslint-parser` | 10.4.2 | dev |
| `eslint-plugin-obsidianmd` | 0.6.0 | dev |
| `eslint-plugin-oxlint` | 1.94.0 | dev |
| `globals` | 17.14.0 | dev |
| `fallow` | 3.45.0 | dev |
| `prettier` | 3.10.1 | dev |
| `postcss` | 8.5.33 | dev |
| `postcss-selector-parser` | 7.2.1 | dev |
| `@iconify-json/lucide` | 1.2.157 | dev |
| `@types/node` | 26.6.6 | dev |

Runtime: Node 24 LTS (`.nvmrc`), npm 11.

### Fallbacks and their blockers

- **TypeScript 6.0.3 instead of 7.0.2.** `typescript-eslint@8.73.0` (latest) declares the peer `typescript >=4.8.4 <6.1.0`, and `eslint-plugin-obsidianmd` needs `typescript-eslint`. ESLint is a required gate step, so TypeScript stays on the newest 6.x. Re-check when `typescript-eslint` widens its range.
- **Nuxt UI's runtime `colors` and `head` plugins are replaced by no-ops.** `@nuxt/ui/vue-plugin` installs `runtime/plugins/colors.js`, which appends `<style id="nuxt-ui-colors">` to `document.head` on the first mount. This breaks the CSS ownership rule that mounting a view adds nothing to the host page, and in a pop-out window it would style the main window instead. `scripts/no-head-plugins.mjs` resolves both files to no-op modules (one module each, so Vue does not warn about a plugin installed twice). `src/styles/bridge.css` sets every colour role. Each replaced file is pinned by sha256, so an upgrade that changes one fails the build until it is reviewed again. The `mount` dom test fails without the replacement.
- **ESLint 9.39.5 instead of 10.15.0.** `eslint-plugin-obsidianmd@0.6.0` pulls `@microsoft/eslint-plugin-sdl`, `eslint-plugin-import` and `eslint-plugin-react`, which accept ESLint only up to `^9`. With ESLint 10, `npm ls --all` fails. Re-check on every `eslint-plugin-obsidianmd` release.

### Probe results (2026-11-21)

| Probe | Result |
| --- | --- |
| `vue-tsc` × TypeScript 6.0.3: a type error in `<script setup>` and one in the template are both reported; the fixed file exits 0 | passed |
| Stryker `vitest-runner` × Vitest 5.1.1: at least one killed mutant; again with the `typescript` checker enabled | passed (checker kept) |
| `@nuxt/ui/vite` (`router: false`) × Vite 8 × Tailwind 4: build succeeds, CSS contains Nuxt UI button classes | passed |
| `@effect/vitest` `it.effect` × Vitest 5 | passed |
| `@tanstack/vue-form` × Vue 3.5 under happy-dom: field error after submit, `onSubmit` once valid | passed |

The `vue-demi` postinstall script is not run (npm 11 `allowScripts`); `vue-demi` defaults to Vue 3, which is what this repo uses.

### Other choices

- `isDesktopOnly: true` until the plugin is verified on Obsidian mobile.
- Prettier rather than `oxfmt` while `oxfmt` is 0.x.
- `minAppVersion` is **1.15.1**, the current stable Obsidian app (owner's decision, 2026-11-21). The `obsidian` types package has no 1.15.x release yet, so the types stay at 1.14.4. Code may only use APIs that the 1.14.4 types declare. When 1.15.x types appear, upgrade them and re-check this rule. The end-to-end suite runs the latest Obsidian app on the latest installer only; the oldest installer that 1.15.1 accepts (1.5.8) is no longer tested in CI.

## Re-check cadence

Monthly and on each Obsidian minor release: `npm outdated`, then re-run the probes for every pair that changes. Update this record with each change.
