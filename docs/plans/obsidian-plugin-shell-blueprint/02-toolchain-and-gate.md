# Task 02 · Toolchain and the gate

Phase A. Needs: Tasks 00 and 01.

**Goal.** Type checking, two linters, a formatter and the test runner, each enforcing its part of the global constraints, run by one gate script from now on. Every rule is proven with a planted violation before it counts.

## Files

Create: `tsconfig.json`, `configs/tsconfig.base.json`, `configs/tsconfig.app.json`, `configs/tsconfig.node.json`, `src/env.d.ts`, `.oxlintrc.json`, `eslint.config.mjs`, `.prettierrc.json`, `.prettierignore`, `configs/vitest.config.ts`, `scripts/verify.mjs`, `scripts/install-hooks.mjs`, `.githooks/pre-push`, `tests/unit/scripts/verify.test.ts`, `tests/unit/scripts/install-hooks.test.ts`, `tests/unit/obsidian-guard.test.ts`. Modify: `package.json`.

Install (versions from ADR 0001): `typescript`, `vue-tsc`, `@types/node`, `oxlint`, `eslint`, `@eslint/js`, `typescript-eslint`, `eslint-plugin-vue`, `vue-eslint-parser`, `eslint-plugin-obsidianmd`, `eslint-plugin-oxlint`, `globals`, `prettier`, `vitest`, `@vitest/coverage-v8`.

## Where configs live

Tool configs go into `configs/` only where the tool takes an explicit path and keeps resolving from the repository root. These stay at the root: `.oxlintrc.json` (oxlint resolves `ignorePatterns` and `overrides` relative to its file; moved into `configs/`, the layer bans silently stopped applying, L17), `eslint.config.mjs` (flat-config patterns resolve from its folder), `tsconfig.json` (editors), `.prettierrc.json` and `.prettierignore` (editors search upward), and the dotfiles of Task 00.

## Steps

- [ ] **1. TypeScript projects.** `configs/tsconfig.base.json` holds the compiler options of global constraint 2. `configs/tsconfig.app.json` extends it with `jsx: "preserve"`, `types: ["node"]`, `paths: { "@test/obsidian": ["../tests/support/obsidian/index.ts"] }`, `allowJs: true`, and includes `../src/**/*.{ts,vue}`, `../tests/**/*.{ts,vue}`, `../harness/**/*.{ts,vue}`, `../src/env.d.ts`, excluding `../tests/e2e/**`. `configs/tsconfig.node.json` extends it with lib `ES2023` only, `allowJs`, `checkJs`, `allowImportingTsExtensions`, and includes `*.ts`, `*.mjs`, `../*.mjs`, `../scripts/**/*.mjs` (the configs and scripts; scripts carry `// @ts-check` and JSDoc types). The root `tsconfig.json` has `files: []` and references both (Task 12 adds `tests/e2e/tsconfig.json`). `src/env.d.ts` declares `*.vue` and `*.css` modules and `ImportMetaEnv` with `MODE` only.
- [ ] **2. Script `typecheck`:** `vue-tsc -p configs/tsconfig.app.json && vue-tsc -p configs/tsconfig.node.json` (Task 12 appends `&& tsc -p tests/e2e/tsconfig.json`).
- [ ] **3. oxlint** (`.oxlintrc.json`): plugins `typescript`, `vue`, `import`, `unicorn`, `vitest`; categories `correctness`, `suspicious`, `perf` as errors; rules `no-console`, `eqeqeq`, `typescript/no-non-null-assertion`, `no-underscore-dangle` allowing `_tag`, `import/no-unassigned-import` allowing `**/*.css`; `ignorePatterns` for `docs/**`, `dist/**`, `release/**`, `reports/**`, `.stryker-tmp/**`, `.obsidian-cache/**` and any vendored tooling. Overrides, one per path, each a `no-restricted-imports` group (the layer rules of global constraint 3):
  - `scripts/**`, `src/infrastructure/logging/**`: `no-console` off;
  - `src/domain/**`, `src/application/**`: ban `obsidian`, `electron`, `vue`, `@nuxt/*`, `@tanstack/*`, `@vue/*`;
  - `src/infrastructure/**`: ban `obsidian` and the UI packages; `src/infrastructure/obsidian/**`: ban the UI packages only;
  - `src/presentation/**`: ban `obsidian`, `effect`, `effect/*`, `**/infrastructure/**`; `src/presentation/shell/runtime/**`: ban `obsidian` and `**/infrastructure/**` only;
  - `src/main.ts`: ban `effect`, `effect/*` and the UI packages; `src/bootstrap.ts`: ban the UI packages;
  - `harness/**`: ban `obsidian` and `**/infrastructure/obsidian/**`;
  - `tests/e2e/**`: `no-await-in-loop` and `unicorn/consistent-function-scoping` off (serialised `executeObsidian` callbacks cannot use outer helpers).
  Script `lint:ox`: `oxlint --deny-warnings`. Module rules do **not** go here (L16).
- [ ] **4. ESLint** (`eslint.config.mjs`, flat config, in this order):
  - global `ignores` (as oxlint's, plus `node_modules/**`, `**/dist/**`, `.obsidian/**`);
  - `...obsidianmd.configs.recommended` (it includes the eslint and typescript-eslint presets and checks `manifest.json` and `LICENSE`);
  - `parserOptions.project` with the TypeScript projects for `**/*.{ts,mts,mjs}`;
  - `@typescript-eslint/switch-exhaustiveness-check` for `**/*.{ts,mts,vue}` (a `switch` with `default` over a union does not pass; write the cases out);
  - `eslint-plugin-vue` `flat/recommended` scoped to `**/*.vue`, its layout rules off (Prettier owns template layout), `vue-eslint-parser` with the typescript-eslint parser and the same projects, `extraFileExtensions: [".vue"]`;
  - the obsidianmd rules re-scoped to `.vue`: filter `obsidianmd.configs.recommended` for the blocks whose `files` is exactly `["**/*.{ts,cts,mts,tsx}"]`, keep the rules starting with `obsidianmd/` and `no-unsanitized/`, and emit each block again with `files: ["**/*.vue"]` and its own `ignores` (the plugin scopes them to JS and TS, so `.vue` files would get none); plus `vue/no-v-html: "error"`;
  - for `src/**/*.{ts,vue}`: `no-restricted-syntax` banning `process.env` and every `import.meta.env` member except `MODE`;
  - Node globals for `scripts/**/*.mjs`, `configs/**/*.{ts,mjs}`, `*.config.mjs`; `obsidianmd/prefer-active-doc` and `obsidianmd/prefer-create-el` off for `harness/**` (a plain browser page);
  - `max-lines` 400 with `skipBlankLines` and `skipComments` for `**/*.{ts,vue,mjs}` outside `tests/**`, 450 for `tests/**/*.{ts,vue}`;
  - `...oxlint.buildFromOxlintConfigFile("./.oxlintrc.json")` last but one (turns off in ESLint what oxlint owns), and Task 03's module blocks after it.
  Scripts: `lint:es`: `eslint --max-warnings 0 .`; `lint`: `npm run lint:ox && npm run lint:es`.
- [ ] **5. Prettier.** `.prettierrc.json`: `printWidth: 100`, `semi: true`, `singleQuote: false`, `trailingComma: "all"`. `.prettierignore`: `docs/`, `*.md`, `package-lock.json`, `node_modules/`, `dist/`, `release/`, `reports/`, `.stryker-tmp/`, `.obsidian-cache/`, `.obsidian/`, vendored tooling. Scripts `format`: `prettier --write .`, `format:check`: `prettier --check .`.
- [ ] **6. Vitest** (`configs/vitest.config.ts`). First line `process.env.TZ = "UTC";` (before any import that reads time). `root` is the repository root. An `obsidianGuard()` plugin (`enforce: "pre"`) resolves `obsidian` to a virtual module that throws `OBSIDIAN_REQUIRES_TEST_DOUBLE: add vi.mock("obsidian", () => import("@test/obsidian"))`; alias `@test/obsidian` → `tests/support/obsidian/index.ts` (Task 04). Export `obsidianGuard`, `testAlias` and `ROOT` for the Stryker configs. Projects: `unit` (`tests/unit/**/*.test.ts`, environment `node`) and `dom` (`tests/dom/**/*.test.ts`, `happy-dom`; Task 04 adds `setupFiles: ["tests/support/dom-setup.ts"]` with the file, Task 08 the plugins and `define` of `sharedConfig`). Vitest fails a project that finds no test file, so add the `dom` project in Task 04 with its first test. Coverage: provider `v8`, include `src/**/*.{ts,vue}`, exclude `src/main.ts`, `src/styles/**`, `src/env.d.ts`, reporters `text`, `html`, `cobertura` into `reports/coverage`, thresholds of global constraint 16. Reporters: `default`, plus `junit` into `reports/junit.xml` when `CI` is set. Scripts `test`: `vitest run --config configs/vitest.config.ts`; `test:coverage`: the same with `--coverage`. Test first: `tests/unit/obsidian-guard.test.ts` imports `obsidian` and expects the guard's error; a second case resolves the alias (it passes once Task 04 exists; mark it `todo` until then and remove the mark in Task 04).
- [ ] **7. The gate** (`scripts/verify.mjs`). Tests first in `tests/unit/scripts/verify.test.ts`, with an injected fake spawn: all steps run in order when all pass; the first non-zero code stops the run, is returned, and no later step starts; `summary` marks `ok`, `FAIL` and `not run` with seconds. Then implement:
  - `STEPS`: the npm scripts in this order; the final list is `format:check`, `lint`, `typecheck`, `test:coverage`, `analyze`, `build`, `check:dist`, `check:notices`. Add each when its script exists: now the first four, `analyze` in Task 03, `build` and `check:dist` in Task 08, `check:notices` in Task 20. The test pins the current list.
  - `FULL_STEPS = [...STEPS, test:mutation]` (Task 19 adds the script).
  - `runSteps(steps, spawn)` strictly sequential; spawn with `stdio: "inherit"` and `shell: process.platform === "win32"` (npm is a `.cmd` shim on Windows); a spawn error counts as code 1.
  - CLI: `--full` picks `FULL_STEPS`; prints `summary`; `process.exitCode` is the failing step's code.
  Scripts `verify`: `node scripts/verify.mjs`; `verify:full`: `node scripts/verify.mjs --full`.
- [ ] **8. Hook.** `scripts/install-hooks.mjs` exports `installHooks(env, git)`: returns `skipped: CI` when `CI`, `TF_BUILD` or `GITHUB_ACTIONS` is set, `skipped: no git` outside a work tree, else runs `git config core.hooksPath .githooks`. Test both skips and the install with a fake `git`. `.githooks/pre-push`: `#!/bin/sh` and `exec npm run verify` (mark it executable: `git update-index --chmod=+x .githooks/pre-push`). Script `prepare`: `node scripts/install-hooks.mjs`.
- [ ] **9. Coverage with little source.** If Vitest fails the thresholds because `src/` is still empty, keep `test:coverage` out of `STEPS` and run `test` in its place until Task 05 adds the first source files; record which was needed.

## Discriminating checks

Plant each, run the named command, see it fail naming the file, delete the plant, see it pass:

| Plant | Fails |
| --- | --- |
| a type error in `src/domain/_p.ts`, in `tests/unit/_p.test.ts`, in `scripts/_p.mjs`, in `configs/_p.ts` (one at a time) | `npm run typecheck` |
| `src/domain/_p.ts` importing `obsidian`; `src/application/_p.ts` with `import type { App } from "obsidian"` | `npm run lint` (oxlint) |
| `src/presentation/_p.ts` importing `effect`; `src/presentation/_p.ts` importing `../infrastructure/runtime` | `npm run lint` (oxlint) |
| `src/main.ts` importing `effect` | `npm run lint` (oxlint) |
| `a == b`; `value!`; `console.log` in `src/domain/_p.ts` | `npm run lint` (oxlint) |
| a `switch` over a union that misses a member | `npm run lint` (ESLint) |
| `src/application/_p.ts` reading `process.env.X`; one reading `import.meta.env.DEV` | `npm run lint` (ESLint) |
| `el.innerHTML = "x"` in `src/infrastructure/obsidian/_p.ts` | `npm run lint` (ESLint, obsidianmd) |
| a generated `src/domain/_long.ts` with 401 lines of code (passes at 400); `tests/unit/_long.test.ts` with 451 (passes at 450) | `npm run lint` (ESLint `max-lines`) |
| a type error in `src/domain/_p.ts` | `npm run verify`: exit non-zero, summary `FAIL typecheck`, later steps `not run` |

A rule that cannot be shown to fail on a plant does not belong in the config.

## Done when

`npm run verify` exits 0; every plant above was seen to fail and is deleted; `git config core.hooksPath` prints `.githooks`. Commit `chore: toolchain, layer rules and the gate`.

**Proven in the source repository:** every plant of the table (`docs/engineering/architecture.md`, *Enforcement*; `docs/engineering/testing.md`, *Lint*), `tests/unit/scripts/verify.test.ts`, `tests/unit/scripts/install-hooks.test.ts`, `tests/unit/obsidian-guard.test.ts` and `tests/dom/obsidian-guard.test.ts`. **Design intention:** running the gate from this task on; the source repository introduced it in its eleventh task and had red `test:coverage` and `analyze` steps until then.
