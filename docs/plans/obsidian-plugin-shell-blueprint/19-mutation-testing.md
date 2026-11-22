# Task 19 · Mutation testing

Phase D. Needs: Task 18. (Configure it earlier if you like; the thresholds bind from here on.)

**Goal.** Mutation testing shows that the tests of the inner layers fail when the code changes. A gated run covers `src/domain` and `src/application` with a threshold that is never lowered; a second, informational run covers the edge layers.

## Files

Create: `configs/stryker.config.mjs`, `configs/vitest.stryker.config.ts`, `configs/stryker.edge.config.mjs`, `configs/vitest.stryker.edge.config.ts`. Modify: `package.json` (scripts `test:mutation`, `test:mutation:full`, `test:mutation:edge`), `configs/fallow.config.mjs` (`ignoreDependencies` if fallow reports the Stryker packages).

Install: `@stryker-mutator/core`, `@stryker-mutator/vitest-runner`, `@stryker-mutator/typescript-checker`.

## Steps

- [ ] **1. Gated config** (`configs/stryker.config.mjs`): `testRunner: "vitest"`, `vitest: { configFile: "configs/vitest.stryker.config.ts" }`, `checkers: ["typescript"]` (unless ADR 0001 dropped it), `tsconfigFile: "configs/tsconfig.app.json"`, `mutate: ["src/domain/**/*.ts", "src/application/**/*.ts"]`, `thresholds: { high: 90, low: 80, break: 75 }`, `incremental: true`, `incrementalFile: "reports/stryker-incremental.json"`, reporters `clear-text`, `progress`, `html` (`reports/mutation/index.html`), `json` (`reports/mutation/mutation.json`), `ignorePatterns` for `/.obsidian-cache`, `/.claude`, `/docs`, `/dist`, `/release`, `/coverage`, `/harness` (the Obsidian download is about 1.3 GB and agent worktrees hold symlinks Stryker cannot copy; L37), `tempDirName: ".stryker-tmp"`, `cleanTempDir: "always"`. `configs/vitest.stryker.config.ts`: the guard and alias of `vitest.config.ts`, `include` `tests/unit/domain/**/*.test.ts` and `tests/unit/application/**/*.test.ts`, environment `node`, no coverage. Scripts: `test:mutation`: `stryker run configs/stryker.config.mjs`; `test:mutation:full`: the same with `--force`.
- [ ] **2. Edge config** (`configs/stryker.edge.config.mjs`, informational): `mutate` `src/infrastructure/obsidian/**/*.ts`, `src/infrastructure/memory/**/*.ts`, `src/presentation/**/*.ts` (not `.vue`), `src/bootstrap.ts`; `thresholds: { high: 90, low: 80, break: null }`; its own `incrementalFile: "reports/stryker-edge-incremental.json"` and reports in `reports/mutation-edge/`; `configs/vitest.stryker.edge.config.ts` with both projects (it repeats the projects of `vitest.config.ts`, because Stryker reads this file instead). Script `test:mutation:edge`: `stryker run configs/stryker.edge.config.mjs`. Not part of `verify`, `verify:full` or the hook. Both configs use `.stryker-tmp`, so never run them at the same time in one checkout.
- [ ] **3. `verify:full`** already appends `test:mutation` (Task 02).
- [ ] **4. Discriminating check.** Remove the assertions of one exact outcome (for example the newer-version case of the settings codec's tests); `npm run test:mutation:full` lists a surviving mutant in that function. Restore them.
- [ ] **5. Raise the score, never lower a threshold.** Below `break`, add tests. For each survivor:
  - **Plant it by hand first** (edit the line, run `npx vitest run`): an incremental run can report a survivor a test already kills, and some survivors are equivalent (the same result, only the cost differs). Write a test only where nothing fails, and state behaviour in it ("a closed surface removes its scope class"), not an implementation step.
  - **After adding tests, run with `--force`**: an incremental run does not re-test a survivor against a new test (L14).
  - A `// Stryker disable` needs its reason on the same line.
  - A timed-out mutant counts as killed; on a loaded machine slow tests turn survivors into timeouts, so read the "timed out" count beside the score.
- [ ] **6. Per module.** Before pushing a change to one module, mutate its files only: `npx stryker run configs/stryker.config.mjs --mutate "src/domain/items/**/*.ts,src/application/items/**/*.ts"`.

## Done when

`npm run test:mutation:full` exits 0 at or above 75 (aim for the source's level: 100 % on its feature module); `npm run test:mutation:edge` exits 0 and its score is recorded in the final report (no threshold); `npm run verify` exits 0. Commit `test: mutation testing, gated and edge`.

**Proven in the source repository:** the configs and the incremental caveat (an edge survivor stayed "Survived" in an incremental run although a hand-planted copy failed the new tests); the edge run took 25 to 41 minutes on four cores for about 990 mutants and scored 94.81 % after targeted tests (85.37 % before). **Not run there yet:** the nightly workflow that runs both (Task 21).
