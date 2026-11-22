# Task 01 · Dependency baseline and compatibility probes

Phase A. Needs: Task 00.

**Goal.** One pinned version per package, proven to work together by small probes, written down in ADR 0001 with every fallback and its blocker. Peer ranges allowed every pair below on the day the source repository was built; two of them still failed, so a probe checks behaviour, not metadata.

## Files

Create: `docs/adr/0001-dependency-baseline.md`, a scratch folder `.probe/` (git-ignored for this task, deleted at its end). Modify: `manifest.json`, `versions.json` (the confirmed `minAppVersion`).

## Steps

- [ ] **1. Resolve.** For every package in the entry file's *Tech stack* run `npm view <pkg> dist-tags.latest`. Start from those results, not from the numbers printed in the stack table; the table is what the source repository pins on 2026-11-22.
- [ ] **2. Install in the scratch folder.** `mkdir .probe && cd .probe && npm init -y`, then install every package with `--save-exact`. `npm install` must finish without `--force` or `--legacy-peer-deps`, and `npm ls --all` must exit 0. Where it fails, read which peer range refuses and go to step 4.
- [ ] **3. Probes** (in `.probe/`; each states what must be seen):
  - **`vue-tsc` × TypeScript.** A `.vue` file with a type error in `<script setup lang="ts">` and one in the template: `npx vue-tsc --noEmit` exits non-zero naming both; exits 0 once both are fixed.
  - **Stryker × Vitest.** A function with one test; `npx stryker run` with `testRunner: "vitest"` reports at least one killed mutant; again with `checkers: ["typescript"]`. If the checker fails under the resolved TypeScript, drop the checker only and record it.
  - **Nuxt UI × Vite × Tailwind.** A Vite app with `@nuxt/ui/vite` (`router: false`) builds, and its CSS contains a Nuxt UI button class.
  - **`@effect/vitest` × Vitest.** An `it.effect` test runs and passes.
  - **TanStack Form × Vue under happy-dom.** A component with `useForm` and one validated field, mounted with `@vue/test-utils`, shows the field error after submit and calls `onSubmit` once the value is valid.
  - **TypeScript × `typescript-eslint`.** `npm ls typescript-eslint` and its `peerDependencies.typescript`: the newest TypeScript inside that range is the version to pin.
  - **ESLint × `eslint-plugin-obsidianmd`.** With the newest ESLint, `npm ls --all` exits 0. In the source repository ESLint 10 failed this, because `eslint-plugin-obsidianmd@0.6.0` pulls `@microsoft/eslint-plugin-sdl`, `eslint-plugin-import` and `eslint-plugin-react`, which accept ESLint `^9` only.
  - **`obsidian` types × app.** `npm view obsidian versions`: if no types package exists for `<min-app-version>`, pin the newest types and record that code may use only APIs those types declare.
- [ ] **4. Fallbacks.** For a failing probe, take the newest version of the blocked package that passes and write the blocker in ADR 0001. Known in the source repository (re-check each):
  - **TypeScript 6.0.3 instead of 7.** `typescript-eslint@8.73.0` declares `typescript >=4.8.4 <6.1.0`; ESLint is a gate step, so TypeScript stays on the newest 6.x.
  - **ESLint and `@eslint/js` 9.39.5 instead of 10.** The `eslint-plugin-obsidianmd` dependencies above.
  - **`obsidian@1.14.4` types under `minAppVersion` 1.15.1.** No 1.15.x types were published.
  Stop and ask when a probe fails and no fallback exists.
- [ ] **5. Audit.** `npm audit` in `.probe/`. For a finding in dev tooling whose suggested fix is an old major, add an `overrides` entry that lifts only the vulnerable range to a patched minor instead (L34). The source repository's three: `"qs@<6.17.0": "6.17.1"` (pulled by Stryker's unused dashboard reporter), `"minimatch@>=7.0.0 <11.0.1": "11.0.9"` (ESLint plugins, Stryker, `@vue/test-utils`, WebdriverIO; all four use only `Minimatch`, `minimatch()` and `escape`, which 11 keeps), `"glob@>=9.0.0 <14.0.2": "14.0.6"` (mocha). Verify each override with the probes again. Drop an override once `npm ls <pkg>` shows upstream requires a patched version itself.
- [ ] **6. ADR 0001** (`docs/adr/0001-dependency-baseline.md`), sections: *Context* (exact pins; "latest" means the newest stable that passes the probes; an older major only with a named blocker), *Versions* (table: package, version, runtime or dev, why), *Fallbacks and their blockers*, *Probe results* (table, with the date), *Security overrides* (table: override, advisory, pulled in by, why it is safe), *Runtime dependencies and their cost* (one row per bundled package and why an existing one cannot cover it; the rule that a new runtime dependency needs a row), *Other choices* (`isDesktopOnly: true` until mobile is verified; Prettier rather than `oxfmt` while `oxfmt` is 0.x; the types-vs-app rule), *Re-check cadence* (monthly and on each Obsidian minor release: `npm outdated`, then re-run the probes for each pair that changes).
- [ ] **7. `minAppVersion`.** Set `manifest.json` `minAppVersion` and the `versions.json` entry to `<min-app-version>`. The declarative settings tab of Task 07 needs Obsidian 1.13 or later.
- [ ] **8. Clean up.** Delete `.probe/`. The real `package.json` gets each dependency in the task that first uses it, at the version ADR 0001 fixes, with `npm install --save-exact <pkg>@<version>`. Reason: fallow (Task 03) reports a declared dependency nothing imports, which made the source repository's `analyze` fail for several tasks.

## Checks

- Every probe of step 3 has a recorded result (passed, passed with fallback, or the blocker).
- `docs/adr/0001-dependency-baseline.md` names every package of the stack with one version.
- `.probe/` no longer exists.

## Done when

ADR 0001 is complete and committed; `manifest.json` and `versions.json` carry the confirmed `minAppVersion`. Commit `chore: dependency baseline and probes`.

**Proven in the source repository:** the probe results of 2026-11-21 (ADR 0001) and `npm run verify`, `npm run test:e2e`, `npm run test:mutation:full` with the overrides. **Design intention:** installing each package only when first used; the source repository installed everything in this task and then needed `ignoreDependencies` and fixes in fallow.
