# Obsidian plugin shell blueprint

## How to use this folder

1. Copy this whole folder into the new repository as `docs/plans/obsidian-plugin-shell-blueprint/`; it is the only input the plan needs.
2. Answer the [inputs](#inputs) (or take their defaults) and replace each placeholder wherever it appears, also in the files you write.
3. Start at [Task 00](00-repository-skeleton.md) and run the tasks in order.
4. Open a task's file when that task starts, not before: each file is written to be read alone, after the tasks before it are done.

This is an implementation plan for an agent that starts in an empty folder holding only this folder. This file is the entry: goal, architecture, stack, inputs, rules, constraints, file structure, one paragraph per task, what the shell leaves to the plugin, the known gaps of this design, the lessons, and the definition of done. The files `NN-<slug>.md` beside it hold one task each, with its steps, checks and completion criterion. One file per task keeps each task's steps in front of the agent: in a single file every later task would sit between the agent and the current step, and an agent reading the whole would see "done" for later work while it is still on the current task.

**Words used throughout.** *Tracer*: the first feature, a neutral record type `item` in the module `items`; it walks the path every later feature walks, and the plugin's first real record type replaces it. *Gate*: `npm run verify`. *Discriminating check*: a planted defect that must make the named check fail before the check counts. Every path in this plan is a path in the new repository.

**Untested proposal.** A step or part of a step marked *Untested proposal* has not been built and run as written; it ends with what to do if it does not hold. Every unmarked step describes a design that has been built, tested, and run in Obsidian 1.15.1 with the versions of the stack table, in the project this plan was drawn from. Two parts are marked as a whole because that project did not contain them: the example feature of Task 18 and the plugin without note data. A figure called *reported* (a size, a timing, a count of runs) comes from that project and cannot be reproduced from this folder: treat it as an order of magnitude and measure your own. Where a measurement in real Obsidian disagrees with either, the measurement decides (see *Agent operating rules*). The order of the tasks is part of the plan: a task names what it takes from earlier tasks and what later tasks add. Where a task turns out to need something only a later task builds, build that piece in the current task, with its test, and say so in the commit message.

## Goal

A new Obsidian plugin repository whose gate is green and whose tracer feature proves the path every later feature walks: a Markdown note in the vault → decoded by a versioned schema → held in an index → shown on a routed view → written back line by line → an outside edit merged per field → a conflict shown to the user. Everything a second feature would otherwise copy is in shared modules, and a new module registers itself in two shared lines.

## Architecture

Ports and adapters in four layers, dependencies inward only: `domain` (pure rules and Effect Schema, issue codes instead of sentences) ← `application` (Effect services, ports, use cases, tagged errors, message catalogs) ← `infrastructure/obsidian` (the only code that imports `obsidian`; adapters for every port) and `presentation` (Vue 3 and Nuxt UI; reaches Effect only through `src/presentation/shell/runtime/`). Each layer is cut into module folders with one public `index.ts`: `shell` (what every module needs), `notes` (vault records: `NoteStore`, codec, index, record kit), then feature modules; the direction is feature → `notes` → `shell`. A module registers itself through two plain-data manifests, `src/application/<module>/module.ts` (`defineModule`) and `src/presentation/<module>/screens.ts`, listed once in `APP_MODULES` and `MODULE_SCREENS`; every composed type, the ESLint module rules and the generated fallow config derive from that one list. One `ManagedRuntime` per plugin load is built from `appServicesLayer(adapters)`; the plugin, the browser harness and the tests differ only in the adapters they pass. One Vue app per open view mounts lazily, so plugin load evaluates no Vue. Product data lives in notes recognised by `schema: <plugin-id>.<type>/v<n>` and a stable `id`; `data.json` holds only technical settings.

## Tech stack

Exact versions this plan was last verified with (2026-11-22, `package-lock.json` lockfile v3). Task 01 re-resolves them and keeps a newer version only when its probe passes. The first row is the `dependencies` of `package.json`; every other package is a `devDependencies` entry. Keep that split: Dependabot's `runtime` group (Task 21) reads it.

| Kind | Packages |
| --- | --- |
| Runtime (`dependencies`, bundled) | `vue@3.5.46`, `@nuxt/ui@4.13.0` (pulls `reka-ui@2.11.0`, `@vueuse/core@14.4.0`, `tailwind-merge@3.7.1`), `@iconify/vue@5.0.5`, `tailwindcss@4.3.5` (used at build time, listed here all the same), `effect@4.1.5`, `@tanstack/vue-form@1.33.5` |
| Types and language | `obsidian@1.14.4` (API types; no 1.15.x types published), `typescript@6.0.3` (held back, see Task 01), `vue-tsc@3.3.14`, `@types/node@26.6.6` |
| Build | `vite@8.3.8`, `@vitejs/plugin-vue@6.0.11`, `postcss@8.5.33`, `postcss-selector-parser@7.2.1`, `@iconify-json/lucide@1.2.157` |
| Unit and dom tests | `vitest@5.1.1`, `@vitest/coverage-v8@5.1.1`, `@effect/vitest@4.1.5`, `@vue/test-utils@2.6.0`, `happy-dom@21.0.4`, `fast-check@4.10.3`, `yaml@2.9.1` (only with the vault phase) |
| End to end | `wdio-obsidian-service@3.5.0`, `wdio-obsidian-reporter@3.5.0`, `@wdio/cli@10.2.0`, `@wdio/local-runner@10.2.0`, `@wdio/mocha-framework@10.2.0`, `@wdio/globals@10.2.0`, `mocha@12.0.3`, `@types/mocha@10.0.10` |
| Mutation | `@stryker-mutator/core@10.1.1`, `@stryker-mutator/vitest-runner@10.1.1`, `@stryker-mutator/typescript-checker@10.1.1` |
| Lint, format, analysis | `oxlint@1.94.0`, `eslint@9.39.5` and `@eslint/js@9.39.5` (held back), `typescript-eslint@8.73.0`, `eslint-plugin-vue@10.12.1`, `vue-eslint-parser@10.4.2`, `eslint-plugin-obsidianmd@0.6.0`, `eslint-plugin-oxlint@1.94.0`, `globals@17.14.0`, `prettier@3.10.1`, `fallow@3.45.0` |
| Platform | Node 24 LTS (`.nvmrc`: `24`), npm 11; Obsidian app 1.15.1 (the newest stable on 2026-11-22); GitHub Actions |

`overrides` in `package.json`: `"qs@<6.17.0": "6.17.1"`, `"minimatch@>=7.0.0 <11.0.1": "11.0.9"`, `"glob@>=9.0.0 <14.0.2": "14.0.6"` (moderate advisories in dev tooling only; Task 01 says when to drop them).

## Inputs

Ask the developer once, before Task 00. Use the default when there is no answer. Replace each placeholder everywhere it appears in this plan, including file contents.

| Placeholder | Meaning | Default |
| --- | --- | --- |
| `<plugin-id>` | manifest id, kebab-case, must not contain `obsidian` | `plugin-shell` |
| `<Plugin Name>` | manifest name, ribbon title and view title in every UI language | `Plugin Shell` |
| `<PluginClass>` | the class in `src/main.ts` | `ShellPlugin` |
| `<css-prefix>` | 2 to 4 lower-case letters: Tailwind and Nuxt UI prefix, token prefix | initials of `<plugin-id>` (`ps`) |
| `<author>` | manifest author | `git config user.name` |
| `<owner>` / `<repo>` | GitHub owner and repository name; the issues link in defect texts is `https://github.com/<owner>/<repo>/issues` | ask; `<repo>` = `<plugin-id>` |
| `<note-data>` | whether the plugin's data are Markdown notes in the vault: yes means Phase B (Tasks 13 to 17), no means [Without note data](#without-note-data), which is an untested variant | ask; no default |
| `<description>` | manifest `description`: one English sentence, the text of the community listing | ask; no default |
| `<languages>` | UI languages; the first is the fallback for every Obsidian language not listed | ask; no default |
| `<test-language>` | the language the Obsidian double and the e2e app start in, so exact-text tests pin the non-fallback texts | the second of `<languages>`, else the first |
| `<collation-language>` | the BCP 47 tag record lists sort by (`localeCompare`): the language the users write titles in | `<test-language>` |
| `<root-folder>` | vault folder for the plugin's notes (a setting without UI) | `<Plugin Name>` |
| `<min-app-version>` | `minAppVersion`; never below 1.13, which the declarative settings tab of Task 07 needs | the newest stable Obsidian app on the day of Task 00 (Task 00 step 2 gives the command) |
| `<license>` | `LICENSE` text | MIT |
| `OBSIDIAN_PLUGIN_DIR` | dev install target, in the git-ignored `.env.local` | unset: `npm run dev` builds only |

One decision is taken for the project, not asked: `isDesktopOnly: true` (global constraint 18). Lift it only on purpose, with the checks listed in *What the shell leaves to the plugin*.

## Agent operating rules

- **Work in the new repository only.** Do not create a remote, push, tag, or change GitHub settings. Task 21 lists those steps for the human; report them as `not-run`.
- **Tests first.** Every behaviour step writes the failing test, runs it, sees it fail for the stated reason, then implements. A step marked *discriminating check* counts only after the check was seen to fail on the planted defect and pass after its removal.
- **Read exit codes.** Never claim a check passed without running it and reading its exit code. Never mask one (`|| true`, a pipe that hides the first command's code, backgrounding).
- **The gate from Task 02 on.** `npm run verify` exits 0 at the end of every task from Task 02; it gains steps as the tasks add them. A task that touches lifecycle, the settings tab, theme, pop-out, view state or vault behaviour also needs a passing `xvfb-run -a npm run test:e2e` once Task 12 exists.
- **Measurements beat this plan.** Where Obsidian behaves differently from what a task says, an e2e measurement decides; record the difference in the task's ADR, change the Obsidian double to match, never the expectation alone.
- **Effect 4.** Services are `Context.Service` classes, errors `Schema.TaggedError`. Read `node_modules/effect/dist/*.d.ts` for every API you use; Effect 3 names and signatures from memory are wrong.
- **Stop and ask** when a Task 01 probe fails and no fallback here covers it, a global constraint cannot be met, a coverage or mutation threshold would have to be lowered, or a task needs a product decision this plan leaves to the plugin.
- **Commits.** One or more commits per task, Conventional Commits (`chore:`, `feat:`, `fix:`, `test:`, `build:`, `ci:`, `docs:`, `refactor:`).
- **Report** per check `passed`, `failed` or `not-run`, with the reason for each `not-run`.

## Global constraints

Each constraint ends with what checks it. *Gate* is a step of `npm run verify`; *test* is a test the gate runs; *convention* means no tool checks it and review must. Each task that introduces an enforcement proves it with a planted violation.

1. **Dependencies.** Exact versions, no `^` or `~`; `package-lock.json` committed; `.npmrc` holds `save-exact=true` and `tag-version-prefix=""`, never `engine-strict` (L47); `engines.node` is `>=24`. Runtime packages in `dependencies`, everything else in `devDependencies` (see *Tech stack*). A new runtime dependency needs a row with its reason in ADR 0001. Checked by: `npm ci` (lockfile); the exact pins are a convention that `save-exact=true` keeps, no gate step reads `package.json` for ranges.
2. **TypeScript** (`configs/tsconfig.base.json`). `target: "ES2022"`, `module: "ESNext"`, `moduleResolution: "Bundler"`, `lib: ["ES2023", "DOM", "DOM.Iterable"]`, `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `verbatimModuleSyntax`, `noEmit`, `skipLibCheck`, `isolatedModules`, `resolveJsonModule`, `forceConsistentCasingInFileNames`. `configs/tsconfig.node.json` narrows `lib` to `["ES2023"]` (Task 02). Checked by: gate `typecheck`.
3. **Layers** (oxlint `no-restricted-imports` in `.oxlintrc.json`; fallow zones). `obsidian` only in `src/main.ts`, `src/bootstrap.ts`, `src/infrastructure/obsidian/**`. `src/domain/**` and `src/application/**` import no `obsidian`, `electron`, Vue or UI package. `src/presentation/**` imports no `obsidian`, no `effect` (except `src/presentation/shell/runtime/**`) and no infrastructure. `main.ts` imports no `effect` and no Vue. The harness imports no `obsidian`. Checked by: gate (`lint` through oxlint; `analyze` through the fallow zones).
4. **Modules** (ESLint `no-restricted-imports` built from `APP_MODULES`; fallow zones from the generated `configs/fallow.json`). Outside a module folder, import it only through its `index.ts`; second entries: `presentation/shell/host.ts` for plugin-load code, `application/notes/adapter.ts` for `src/infrastructure/**` only, and each presentation module's `screens.ts` for `src/presentation/*.ts` only. Direction feature → `notes` → `shell`; features may import each other's index, acyclically. Nothing in `src/` imports `src/infrastructure/memory/`. Checked by: gate (`lint` through ESLint; `analyze`).
5. **No Vue at plugin load.** `main.ts`, `bootstrap.ts`, `src/infrastructure/**` and `src/presentation/*.ts` import a presentation `index.ts` only as types; `screens.ts` imports no Vue, no `.vue` file and no presentation index as a value. Checked by: gate (`lint`, the `vueFreeAtLoad` rule of Task 03) and, at runtime, the test `tests/dom/lazy-presentation.test.ts`.
6. **File size and complexity.** ESLint `max-lines`: 400 lines of code per source file, 450 per test file (blank lines and comments do not count). fallow: cyclomatic complexity at most 10, duplicates from 50 tokens. Checked by: gate (`lint`, `analyze`).
7. **Build output** is exactly `dist/main.js` (one CommonJS file, default export, `codeSplitting: false`), `dist/styles.css`, `dist/manifest.json`. External: `obsidian`, `electron`, `@codemirror/*`, `@lezer/*`, Node builtins. Budgets: `main.js` 1.5 MB, `styles.css` 250 KB. Checked by: gate `check:dist`.
8. **No runtime network.** Icons bundled, no remote fonts, no CDN; a missing icon is never fetched (`keepIconsOffline`). Checked by: gate `check:dist` (no `http` target in a string-literal `fetch(` or `.open(`) and, for the runtime behaviour, `no-network.e2e.ts`, which is not part of the gate.
9. **CSS ownership.** Every selector under `.<plugin-id>-root`; no Tailwind preflight; no `@layer` in the output; `@keyframes` and `@property` names prefixed; nothing written to `document.head`; Tailwind classes carry the `<css-prefix>:` prefix; Nuxt UI components imported explicitly from `@nuxt/ui/components/*.vue`. Checked by: gate `check:dist` (scoped selectors, no `@layer`, prefixed names) and a dom test (`document.head` unchanged); the Tailwind prefix and the explicit imports are build configuration, and a missed import renders unstyled.
10. **Obsidian guidelines** (`eslint-plugin-obsidianmd`, also on `.vue` files): no `innerHTML`/`outerHTML`, `v-html` banned, no default hotkeys, command ids without the plugin id, listeners through `this.register*`, `console` only in `src/infrastructure/logging/`, `getLanguage()` for the UI language. Checked by: gate `lint` for each rule except the listeners, which no lint rule covers: `tests/dom/event-listeners.test.ts` counts the host listeners over load and unload (Task 13), and `events.e2e.ts` does so in Obsidian.
11. **Config.** `src/**` reads no `process.env` and of `import.meta.env` only `MODE` (ESLint `no-restricted-syntax`, gate `lint`). No module-level mutable state in `src/**` (convention: review; no tool checks it).
12. **Texts.** Every user-visible text comes from a typed catalog per module and language; a key missing in one language fails typecheck. The domain returns issue codes, never sentences. Checked by: gate `typecheck` for the catalogs; the issue codes are a convention (the layer rules only keep the domain from importing a catalog).
13. **Code language.** Identifiers, events, log events, frontmatter keys and value codes are English; `GLOSSARY.md` gives the English term for each product term, and a term enters the glossary before it enters code. Convention: no tool checks it.
14. **Errors.** Every expected failure is a `Schema.TaggedError` in its module's union with a text in every catalog (typecheck fails otherwise); defects go through `reportDefect` once per boundary; log entries carry counts, flags and a `LoggedError`, never note content. Checked by: gate `typecheck` and `lint` (catalog texts; `switch-exhaustiveness-check` on `describeError`) and the logger's types; `reportDefect` once per boundary is a convention.
15. **Forms** use TanStack Form, with validators that call the domain rule. The settings tab uses Obsidian's declarative settings API. A setting has one edit location: plugin-wide technical settings in the settings tab, feature data in the plugin's views. Convention: no tool checks the form library or the edit location.
16. **Coverage** over `src/**` (not `main.ts`, `styles/`, `env.d.ts`): lines 90, statements 90, functions 90, branches 85. **Mutation** of `src/domain` and `src/application`: break 75, low 80, high 90. Never lowered. Checked by: gate `test:coverage`; the mutation thresholds by `test:mutation`, which runs in `verify:full` and nightly, not in the gate; "never lowered" is a convention.
17. **Portability.** Every script is Node or an npm script that runs unchanged on Windows and Linux. Convention: CI runs Linux only, and Windows is an Untested proposal until someone runs the gate there.
18. **Mobile.** `manifest.json` has `isDesktopOnly: true` (see [What the shell leaves to the plugin](#what-the-shell-leaves-to-the-plugin)). Convention; `tests/unit/support/test-manifest.test.ts` (Task 04) pins the double's copy of the manifest to the file.

## File structure

The state after Task 22, with the tracer module `items`. Files in one folder are listed together; tests mirror the folders of `src/` (`tests/<project>/<layer>/<module>/`).

```text
.
├─ manifest.json, versions.json, package.json, package-lock.json, .npmrc, .nvmrc
├─ .gitignore, .gitattributes, .editorconfig, .env.local.example, .prettierrc.json, .prettierignore
├─ .oxlintrc.json, eslint.config.mjs, tsconfig.json          # stay at the root (Task 02)
├─ LICENSE, README.md, AGENTS.md, CLAUDE.md, GLOSSARY.md, THIRD-PARTY-NOTICES.txt
├─ .githooks/pre-push
├─ .github/workflows/{ci,nightly-mutation,release}.yml, .github/dependabot.yml, .github/pull_request_template.md
├─ configs/
│  ├─ tsconfig.{base,app,node}.json
│  ├─ vite.shared.ts, vite.config.ts, vite.harness.config.ts, vite.probe.config.ts
│  ├─ vitest.config.ts, vitest.stryker.config.ts, vitest.stryker.edge.config.ts
│  ├─ stryker.config.mjs, stryker.edge.config.mjs
│  ├─ fallow.config.mjs, fallow.json (generated), eslint.scanner.config.mjs
├─ scripts/
│  ├─ verify.mjs, pre-push.mjs, install-hooks.mjs, modules.mjs, fallow-config.mjs
│  ├─ scope-css.mjs, no-head-plugins.mjs, check-dist.mjs, dev-install.mjs
│  ├─ bundled-packages.mjs, third-party-notices.mjs, notice-overrides.mjs
│  ├─ version-bump.mjs, package-release.mjs, reference-vault.mjs
├─ src/
│  ├─ main.ts, bootstrap.ts, env.d.ts
│  ├─ domain/{shell,notes,items}/
│  ├─ application/
│  │  ├─ module.ts, modules.ts, errors.ts, events.ts, app-services.ts, app-services-layer.ts
│  │  ├─ messages.ts, user-messages.ts, routes.ts, note-types.ts, commands.ts
│  │  ├─ shell/ (+ i18n/), notes/ (+ i18n/, adapter.ts), items/ (+ i18n/)
│  ├─ infrastructure/
│  │  ├─ runtime.ts, logging/{console-sink,incidents}.ts
│  │  ├─ obsidian/app-layer.ts, obsidian/{shell,notes}/
│  │  ├─ memory/notes/                                      # tests and harness only
│  ├─ presentation/
│  │  ├─ app-surface.ts
│  │  ├─ shell/{index,host,screens,mount,...}.ts, shell/runtime/, shell/components/
│  │  ├─ notes/{index,screens}.ts, notes/components/
│  │  ├─ items/{index,screens}.ts, items/components/
│  ├─ styles/{app,tokens,bridge}.css
├─ tests/
│  ├─ harness/{index.html,main.ts,layers.ts,fake-host.css}      # browser harness; the directory's scan ignores tests/ (L49)
│  ├─ unit/, dom/                                           # Vitest projects
│  ├─ e2e/{wdio.conf.mts,tsconfig.json,support.ts,specs/,probe-plugin/,vaults/basic/}
│  ├─ support/{obsidian/,notes/,items/,adapters.ts,runtime.ts,layers.ts,surface.ts,wait.ts,preload.ts,...}
├─ docs/
│  ├─ adr/0001-dependency-baseline.md … 0008-navigation-and-view-state.md
│  ├─ engineering/{architecture,adding-a-feature,testing,error-handling,releasing,github-setup}.md
│  ├─ contracts/                                            # one page per note type and version
│  ├─ plans/obsidian-plugin-shell-blueprint/                # this folder, copied before Task 00
```

## Phases and tasks

Four phases. Run the tasks in order; each task's file names what it needs from earlier ones. Phase B is the vault data path: **a plugin without note data skips Tasks 13 to 17**, builds its tracer in Task 18 on its own data path, and drops what the section [Without note data](#without-note-data) lists (an untested variant).

### Phase A: the shell

- **[Task 00 · Repository skeleton and identity](00-repository-skeleton.md).** The manifest, package files and dotfiles from the inputs. Done when the manifest id check exits 0.
- **[Task 01 · Dependency baseline and compatibility probes](01-dependency-baseline.md).** One pinned version per package, proven by probes in a scratch folder and written into ADR 0001. Packages enter `package.json` in the task that first uses them, at the versions ADR 0001 fixes, so fallow never reports an unused dependency.
- **[Task 02 · Toolchain and the gate](02-toolchain-and-gate.md).** Three TypeScript projects, oxlint with the layer rules, ESLint, Prettier, the Vitest projects `unit` and `dom`, `scripts/is-cli.mjs` (the one guard every script's command line uses) and `scripts/verify.mjs`: the gate that every later task ends on. Discriminating checks: a planted violation for each layer rule, line limit and type check location.
- **[Task 03 · Modules and manifests](03-modules-and-manifests.md).** `defineModule`, `APP_MODULES`, the shell manifest, and the ESLint module rules and the generated fallow config, all derived from that one list. Later tasks extend `src/application/module.ts`: `commandsOf` in Task 05, `servicesLayerOf` in Task 06, `sectionsOf` and `routeSchemasOf` in Task 10, `noteTypesOf` in Task 16.
- **[Task 04 · The Obsidian test double](04-obsidian-test-double.md).** `tests/support/obsidian/`, opted in per suite with `vi.mock("obsidian", () => import("@test/obsidian"))`. The vault half comes in Task 13.
- **[Task 05 · Shell domain and application](05-shell-core.md).** The settings codec and `SettingsService`, `Logger`, incidents, `reportDefect`, the diagnostics report, `Messages` and the per-module catalogs, `describeError`, and the shell's commands `open-view` and `copy-diagnostics`.
- **[Task 06 · Service graph, adapters, runtime](06-service-graph.md).** `AppAdapters`, `appServicesLayer` (shell services, then notes, then the features' Layers, the host event adapter last), `appLayer`, `makeRuntime`, `EventBus`, `hostEventsLayer` with `LayoutReady` only (file events come with their first consumer in Task 13), `testAdapters` and `testRuntime`.
- **[Task 07 · Plugin entry and lifecycle](07-plugin-lifecycle.md).** `main.ts`, `bootstrap.ts`, commands, ribbon, notices and the declarative settings tab with the log level only. Review focus: disable → enable → disable, and unload while load is pending.
- **[Task 08 · Build, CSS ownership, dist invariants](08-build-and-css.md).** `npm run build` writes exactly `dist/main.js`, `styles.css` and `manifest.json`; the gate gains `build` and `check:dist`.
- **[Task 09 · Surface and runtime bridge](09-surface-and-runtime.md).** `host.ts` (Vue-free) and `index.ts`, `mountSurface` (one Vue app per view), `useQuery`, `useCommand`, `useStream`, `useMessages`, `tests/support/wait.ts` (`eventually`) and `tests/support/preload.ts`.
- **[Task 10 · Navigation, view state, settings screen](10-navigation-and-settings-screen.md).** Routes as data, the per-view history, `ShellView`, `SettingsScreen`, `MODULE_SCREENS` and the `data-testid` values the e2e specs read. The settings route needs one section, so the tracer module's manifest and empty section start here; Task 18 fills them.
- **[Task 11 · Browser harness](11-browser-harness.md).** Two surfaces on one runtime, scenarios, harness adapters for every `AppAdapters` field, and a fake host whose marked placeholder values Task 12 replaces with measured ones.
- **[Task 12 · End to end in real Obsidian](12-e2e-in-obsidian.md).** The wdio config, `tests/e2e/support.ts`, the shell specs, and the fake host's values read from the running app. Run under `xvfb-run -a` on Linux.

### Phase B: vault data (skip for a plugin without note data)

- **[Task 13 · The note store](13-note-store.md).** The `NoteStore` port with the Obsidian and in-memory adapters, the double's vault half, the contract suite on both adapters and in real Obsidian through the probe plugin, and the fidelity scenarios.
- **[Task 14 · Line edits](14-note-text.md).** `updateNoteText` inside `vault.process`: only the lines of the keys a patch sets or removes change, and a text that does not read back exactly is refused (`NoteWriteRefusedError`, reason `layout`).
- **[Task 15 · The note codec](15-note-codec.md).** `defineNoteType`, `decode` with the outcomes `not-this-type`, `read-only` and `editable`, the per-field `merge` and the write guards. Property tests with fast-check.
- **[Task 16 · VaultReady and the index](16-vault-ready-and-index.md).** `VaultReady` from cache completeness, the note-type registry, the reference vault, `NoteIndex`, and budgets as counted work in unit tests and as timings only in e2e.
- **[Task 17 · The record kit](17-record-kit.md).** What every record type needs, in `notes`, before any feature: list rows, create, update (merge, then rename while the file follows the title, as one command), remove, form values per field kind, `useRecordForm`, `useRecordScreen`, `ConflictChoice`, `RecordSheet` with its question before unsaved input is discarded, the delete dialog and the settings section "data issues", all tested on a sample type.

### Phase C: the tracer

- **[Task 18 · Tracer feature `items`](18-tracer-items.md).** The `item` note type (`title`, `status`, `due`) as an example feature that walks the whole path: contract page, rules, manifest, settings section, sheet form, delete dialog, harness scenarios and e2e specs. The module has no infrastructure folder. Untested proposal as a whole.

### Phase D: release and hand-over

- **[Task 19 · Mutation testing](19-mutation-testing.md).** Stryker on `src/domain` and `src/application` with thresholds 75/80/90, the per-module runs, and the non-gating edge run over adapters and presentation `.ts` files.
- **[Task 20 · Release scripts and third-party notices](20-release-scripts.md).** `version-bump.mjs`, `check-versions.mjs`, `release-version.mjs`, `package-release.mjs` and the notices generated from the production bundle; the gate gains `check:versions` (in its first stage) and `check:notices`, and `verify:full` adds mutation testing.
- **[Task 21 · GitHub workflows and dependency updates](21-github.md).** `ci.yml`, `nightly-mutation.yml`, `release.yml` (two jobs; the one with write permissions runs no repository code; the build job checks the versions first and hashes the staged files), Dependabot, and the guides `github-setup.md` and `releasing.md`. The scheduled and release workflows cannot run before the repository is on GitHub.
- **[Task 22 · Documentation and acceptance](22-docs-and-acceptance.md).** ADRs 0002 to 0008, the engineering guides, `AGENTS.md` as built, then the acceptance run from a fresh clone and the hand-over list.

## Without note data

**Untested proposal.** The project this plan was drawn from always had note data, so this variant has not been built or run as written. If a later task turns out to need something one of the skipped tasks builds, build that piece in the current task, with its test, and say so in the commit message (see the order rule above); if the e2e run of the shell still fails after the removals below, restore the removed part and ask.

A plugin whose data is not notes (for example one that only renders, or keeps all state in `data.json`) skips Tasks 13 to 17 and keeps everything else. What falls away with them:

- the `notes` module in every layer, so `CORE_MODULES` in `scripts/modules.mjs` is `["shell"]`, and `configs/fallow.config.mjs` loses the zones and rules named `notes`, `notes-adapter` and `memory`;
- `NoteStore`, `NoteOpener`, `IdGenerator` and their fields in `AppAdapters`; `src/infrastructure/memory/notes/`; `TEST_ONLY_MARKER` and its `check:dist` rule (keep it if another in-memory adapter can fail);
- the double's vault, metadata cache and file manager beyond what Task 04 builds; the vault's fidelity scenarios, the contract run in Obsidian and the `yaml` dev dependency (keep the probe plugin with only its `workspace.openRoute` and the tabs-and-views scenario of Task 13 step 14, or run that scenario's expectation in a spec of its own);
- the file events and `events.e2e.ts` of Task 13, unless the tracer consumes file events; `VaultReady`, `cache-completeness.ts`, the reference vault, the index and its budgets; the `rootFolder` setting;
- the record kit, the data issues section, `docs/contracts/` and ADR 0007;
- the e2e specs `note-store`, `note-write-fidelity`, `vault-ready`, `note-index` and the record specs of Task 18.

`LayoutReady` stays: it is the edge after which the file list is complete. The tracer still has to walk the path the first real feature needs (lesson L1): its own source of data, a routed view, a write, and an outside change. Task 18 then names its own steps; the module manifest, screens, catalogs and e2e rules are the same.

## What the shell leaves to the plugin

- **The domain.** Note types, their fields and contracts, rules between records, screens beyond settings, commands beyond `open-view` and `copy-diagnostics`, domain events (`AppEvent` has none from a feature yet).
- **Mobile.** `isDesktopOnly: true`. Lifting it needs, at least: e2e runs in mobile emulation (`wdio-obsidian-service` supports it), a check that every Obsidian API used exists on mobile, the `Platform` flags read app-first (L24), and a manual check on a phone. The frame's layout already follows container width. None of it is tested by this plan.
- **A client store.** No Pinia: shared state is a service with a stream (settings, the index). Add one only with an ADR.
- **References between records and "today".** Built with their first consumer (L21), as designed and tested: reference field kinds with the index's missing-target issue in Task 15 step 11 and Task 16 step 5. "Today" is a shell port `Today` (`current`, `changes`) over a `CalendarDay` (`YYYY-MM-DD` text, the form of a `date` field, so "overdue" is `due < today` as text), one field `today` of `AppAdapters` built after the logger. The day is the one of the machine's time zone, never UTC's: the domain takes the zone as an IANA name (`localDay(time, zone)`, `untilNextLocalMidnight(time, zone)` through `Intl.DateTimeFormat`), so no rule depends on the process's `TZ`. `current` reads the clock each time and publishes a day it finds new, read and publish as one step (`SubscriptionRef.modifySomeEffect`), so an older day never follows a newer one. The Obsidian adapter keeps one window timer, set to the next local midnight but never more than one minute away (a timer counts awake time, not the clock: after a sleep or a clock change the next look within a minute publishes the new day), cleared by `plugin.register` on unload and by the scope's finalizer; a zone that `Intl` rejects (`Etc/Unknown`) or that cannot be read counts as the system's default zone (`undefined` in the domain's `TimeZone`), because a throw at the first look would fail the runtime's Layer and with it the plugin load, and a defect while the next look is planned is reported and the timer is set for the one minute, so it never stops; the in-memory adapter (`src/infrastructure/memory/shell/`) holds a day that `set` replaces. One contract suite runs on both adapters, the Obsidian one on a hand-moved clock with separate awake time (midnight, a clock set forward and back, a long sleep, a zone changed while it runs, a daylight saving day), and a dom test proves that no window timer survives two loads and unloads. One more test runs the adapter on the machine's own clock and zone, with the process's `TZ` set to a zone far ahead of UTC and one behind it and the clock faked, so a UTC day in place of the local one fails.
- **Per-device state.** A value that must stay on one device (a selection, a last-used choice) needs a port over `app.loadLocalStorage`/`saveLocalStorage` and the double's local storage (Task 04 step 10). Build both with the first such value.
- **Input components for other kinds.** The record kit holds numbers, flags, lists and references in a form (Task 17 step 2), but only text inputs exist; the first record type that needs a number input, a checkbox, a list editor or a reference picker builds it.
- **Drafts.** A form asks before unsaved input is discarded by closing its sheet (Task 17), but input is lost when the whole view closes, and a route change asks nothing; a draft store is decided with the first long form.
- **Deep links.** Routes are not URLs; Obsidian URIs would be a separate decision.
- **Community directory submission.** `npm run lint:scanner` approximates the scan; the submission itself is the plugin's. Run the directory's *Review branch* before the first release, not at submission (L52): its findings change files across the repository.

## Known gaps of this design

Each gap is known and not solved by this plan; none is a hidden promise. Record the ones that apply in the new repository's issue tracker once it has one.

- **One index snapshot per type.** The index publishes one snapshot per type, one after the other, so a view that joins two types can see one updated and the other not, and derived lists are recomputed per subscriber. With the second record type, write a test that saves notes of two types in one batch (one referring to the other) and shows whether a view sees a state in between; if it does, publish one snapshot for all types per batch with a selector per type, and keep derived lists in a service.
- **What the double does not model**, each a known difference: link updates on rename and the cache events they cause; `vault.modify`, `vault.delete`, `vault.adapter` (the plugin uses none); the file watcher's debounced report of an outside change and its timing; the order in which Obsidian's worker interleaves `resolve` and `resolved` with the next file (the scenarios write such orders as `eitherOrder` or leave the event out, Task 13); tab groups, splits and sidebars; what Obsidian does with the plugin's leaves when the plugin unloads (measured: sometimes a new tab, sometimes a stand-in that keeps the type); the settings renderer beyond the controls the plugin uses. Add each when a feature depends on it, with a fidelity scenario.
- **Contract cases that need a broken vault** run in Obsidian only where the vault can be broken for real. Failing writes can: the fixture removes the write bits of the vault's folders and notes (`chmod`), which stops `create`, `update`, the local trash and `rename`; that does not stop a user who is root, so those four cases are skipped by name as root and run as any other user. Failing reads, a held write and the few milliseconds between an outside delete and the file watcher's report cannot be made in a real vault; they run only against the double and the in-memory store and are skipped by name in Obsidian (Task 13).
- **A rename that joins another rename.** `fileManager.renameFile` moves a file inside Obsidian's one-at-a-time link update. A rename asked for while another update moves its files (from a `rename` listener, or a plugin's save during the user's own rename) joins that update: its promise resolves before its file has moved, and if that move fails the other caller's promise rejects, not its own. The double models the queue and the join, and the adapter's `rename` reports success at the path the note still has. No public signal says when the joined move has happened or failed. Waiting on Obsidian's internal queue is not public API, and waiting for the file's `rename` event with a deadline would call a late move a failure, so the adapter is left as it is: the index follows the move when it happens, the record kit finds the note by its `id`, and the file name is only for people. Decide again if a feature starts to depend on the new path.
- **A note deleted outside and still listed** is handled for `update` (`ENOENT` is "not found", Task 14). `trash` and `rename` in that window still report a write failure, because their `ENOENT` can also mean a missing target folder; Obsidian on mobile was not measured.
- **Accepted in bootstrap.** A throw in `addSettingTab` or `registerView` leaves the ribbon icon behind until Obsidian restarts; a failed bootstrap leaves harmless `registerEvent` closures until unload.
- **Gate cost.** Lint, type-aware and uncached (Task 02), sets the pace of the gate's first stage; CI runs `npm ci` twice per run (`verify` and `e2e`). The parallel first stage was measured only on a loaded machine (shorter than the sequential gate there; how much shorter on an idle machine is not measured).
- **E2e without a window manager.** CI runs Obsidian under plain `xvfb-run` (Task 21). An unmanaged window draws later, so a spec that reads too early can pass locally and fail there; find the missing wait first. If the job stays unreliable all the same, start a window manager again (Task 21 says how).
- **Not covered by the contrast spec:** neutral solid fills (`bg-inverted`), community themes, and Obsidian's own grey input focus ring beside the plugin's outline.
- **Manual checks** (keyboard only, screen reader, zoom, community themes) need a person; Task 22 lists them as `not-run`.

## Lessons

Each lesson is a rule with its technical reason. The task that applies it names it by number.

1. **L1 · Walk the path the first feature needs.** A walking skeleton must carry the data path the first feature uses. Hardening `data.json` end to end leaves note → decode → index → view → write → outside edit unbuilt in every layer, and that path is most of the work. Tasks 13–18.
2. **L2 · Modules before the second concern.** With one file per concern per layer (`errors.ts`, `ports.ts`, one catalog), every feature edits the same shared files; cutting modules later is a restructuring of its own. Task 03.
3. **L3 · Two shared lines per module, everything else derived.** A module that registers in many places can be missed in one of them without any check failing (a navigation entry, a frame part). Derive every list from the two manifests. Task 03, Task 10.
4. **L4 · Writes run to completion.** `plugin.saveData` and vault writes cannot be cancelled; an interruptible save-then-set leaves disk and memory apart when a view closes during a save. Make the write uninterruptible and give components a command form that scope end does not interrupt. Tasks 05, 09, 13.
5. **L5 · Diagnostics by type, not by redaction.** A deny-list by key with a length limit redacts every real stack and lets short messages with file names through. Log only counts, flags and a `LoggedError` of name and sanitised frames. Task 05.
6. **L6 · Do not call `fileManager.processFrontMatter` for updates.** It parses and rewrites the whole YAML block: comments go, `01067` becomes `1067`, `1.10` becomes `1.1`, a 20-digit number is rounded, a flow list becomes a block list, `'yes'` loses its quotes, no block is seen after a BOM, and LF lines are written into a CRLF note (measured in Obsidian 1.15.1). Edit lines inside `vault.process` and re-parse. Task 14.
7. **L7 · Find the block where the metadata cache finds it, not with `getFrontMatterInfo`.** `getFrontMatterInfo` sees no block after a BOM or with lone carriage returns and does not close at `----`, while the cache does; where Obsidian's own readers disagree, refuse the write. Task 14.
8. **L8 · `resolved` and `LayoutReady` do not mean "frontmatter is readable".** On a cold start the layout is ready with 1 of 2,200 notes cached and `resolved` fires per note; in a running app it never fires (Obsidian 1.15.1). Check cache completeness through the public API. Task 16.
9. **L9 · A read right after a write races the index.** The cache lags a write by a few milliseconds and the index by one batch; return the note as written to the form that wrote it, let every list follow the index, and let an e2e spec wait for the list before it clicks (a re-render about 0.1 s after a save can move a button by tens of pixels). Tasks 13, 16, 18.
10. **L10 · A lazily loaded part arrives later than its screen.** A settings badge follows its own snapshot and can appear after the list it sits beside; a test that reads both at once fails. Wait for the part itself. Tasks 10, 18.
11. **L11 · Never `vi.waitFor` with its 1 s default.** It fails on a loaded machine (the gate beside another suite, Stryker); `eventually` waits up to 4 s, polls every 10 ms and returns at once when it succeeds. Task 09.
12. **L12 · Preload what a view imports.** The first mount of a file pays seconds of transform under load inside its own timeout; `preloadSurface()` at the top of each file that opens a view, except the lazy-loading test. Task 09.
13. **L13 · No wall-clock assertions outside e2e.** Time bounds and ratios of two times fail under load with nothing wrong in the code; assert counted work (reads, decodes) and record timings in e2e reports. Task 16.
14. **L14 · Stryker's incremental file keeps old survivors.** An incremental run does not re-test a survivor against a new test; run with `--force` after adding tests, and read the timed-out count beside the score. Task 19.
15. **L15 · fallow reads only JSON and no placeholder.** Its zone rules must name every module, and it refuses a rule that names a zone without a folder; generate `configs/fallow.json` from a JS source and the module list, and let `npm run analyze` fail while it is stale. Pass `-c` explicitly: fallow does not discover `fallow.json` by itself. Task 03.
16. **L16 · Module rules in ESLint, layer rules in oxlint.** A later oxlint override replaces an earlier one's `no-restricted-imports` options for the same files, so module rules there switch the layer rules off. Task 02, Task 03.
17. **L17 · Keep `.oxlintrc.json` at the root.** oxlint resolves `ignorePatterns` and `overrides` relative to the config file; moved into `configs/`, its per-path overrides silently stop applying and a planted violation passes. Task 02.
18. **L18 · Bundle every icon and refuse the network.** Nuxt UI draws icons through `@iconify/vue`, which asks `api.iconify.design` for any icon the bundle lacks; list icons in `SHELL_ICONS` and replace the client's fetch with a 404. Task 08, Task 09.
19. **L19 · Nothing in `document.head`.** Nuxt UI's runtime `colors` plugin appends a `<style>`; in a pop-out it would style the main window. Replace it and the `head` plugin with sha256-pinned no-ops and set the colour roles in CSS. Task 08.
20. **L20 · Scan only the Nuxt UI components you use.** Scanning every component theme makes `styles.css` exceed the 250 KB budget (Nuxt UI 4.13.0); every new component is a line in the `@source` lists, or it renders unstyled. Task 08.
21. **L21 · Build no host event nobody handles.** An event, a bus member or a composable built ahead of its consumer is code to test and then delete; add each with its first consumer. Task 06, Task 13.
22. **L22 · Generic record handling belongs in `notes` before the second record type.** Most of a first record feature is record handling (file names, list rows, merge-then-rename, conflict UI, delete dialog) that a second type would copy. Task 17.
23. **L23 · A fixed tab, own history.** With `navigation = true` Obsidian records the leaf's history, but a plain click in the file explorer then opens the note in the plugin's tab and closes the view. Task 10.
24. **L24 · `Platform.isMacOS` is true on iPhones and iPads.** Read `isIosApp` and `isAndroidApp` first. Task 06.
25. **L25 · Measure a colour palette.** Two colours of a record palette can differ almost only in hue (a teal and a cyan chosen by eye were almost equal in luminance, reported), so adjacent badges look alike to colour-blind users, and Obsidian's warning colour is 2.95:1 on white (1.15.1 default theme). Derive text and fill shades from host variables and measure every text in e2e. Task 08, Task 18.
26. **L26 · The harness must play Obsidian.** Invented host colours and missing base rules hide what real Obsidian shows: list bullets, a 40 px indent, raised ghost buttons, 2.95:1 warning text. Read the fake host's values from the running app. Tasks 11 and 12.
27. **L27 · Ribbon after everything that can fail, title fixed.** On a normal unload Obsidian releases the ribbon entry: it stays in `leftRibbon.items` without its button and callback, so its order and hidden state survive a re-enable. After a failed `onload` nothing releases it, `icon.remove()` only detaches the element (the next re-render brings it back), and the entry is keyed `<plugin id>:<title>`, so a translated title loses its position (Obsidian 1.15.1). Task 07.
28. **L28 · Remove commands only after a failed bootstrap.** A late dispose that removes commands by id hits the commands of a quick re-enable. Task 07.
29. **L29 · Never rewrite `data.json` on load.** A migrated or version-bumped file makes an older plugin on another device (Sync) read it as newer and go read-only; rewrite on the next save, and leave defaults out of the file. Task 05.
30. **L30 · `aria-disabled`, never `disabled`, under the focus.** A control that turns `disabled` while focused drops the focus to the page; Nuxt UI's `loading` disables its button, so show a spinner icon instead. Task 09, Task 17.
31. **L31 · A difference between the double and Obsidian is a bug in the double.** Run the same fidelity scenario on both and compare with one expectation; fix the double, never the expectation alone. End each step on an event fence, not a settle time, and pin every order the host keeps, with an explicit either-order where it varies. Task 04, Task 13.
32. **L32 · Release from two jobs.** A job that holds a write token while it runs `npm ci` and the repository's code hands that token to every install script; the job with write permissions has no checkout and runs no npm. Task 21.
33. **L33 · Workflows that need a tag, a dispatch or a schedule cannot be proven before they run.** `release.yml` and `nightly-mutation.yml` can only be checked with `actionlint` until their first run on GitHub; expect fixes on the first release and the first night (a 45-minute limit is too short for a first full mutation run). Task 21.
34. **L34 · Overrides, not downgrades, for audit findings in tooling.** npm's suggested fixes can be old majors (`@wdio/cli` 9, `eslint-plugin-obsidianmd` 0.0.2 for these versions). Task 01.
35. **L35 · Notices from the bundle, not from the tree.** The runtime dependency tree holds about ten times the packages the production bundle ships (248 against 26 for this stack). Generate the notices from the bundler's module list and check them in the gate. Task 20.
36. **L36 · Waiting in e2e is on a condition, never a pause.** A pause before "nothing was written" passes empty if the effect comes later; a pause before a click races the indexer; a colour read 400 ms after a theme change on a runner without a window manager read the old theme. Wait on what shows the effect, let a negative check wait for a positive sign after it, bring colours to rest before measuring them, and start a check from a state that differs from the one it expects (a fall-back to the start route is checked from another route, or an ignored state passes by chance). Task 12, Task 18.
37. **L37 · A git worktree needs real `node_modules` copies of `@nuxt/ui` and `.nuxt-ui`.** A symlinked `node_modules` breaks Tailwind's `@source not` excludes; Stryker's sandbox must ignore `.obsidian-cache` (a symlink in a worktree, 1.3 GB). Task 08, Task 19.
38. **L38 · Give the release a start that needs no tag push.** An agent session can often push a branch but not a tag, so a release that starts only on a pushed tag stops at its last step. `release.yml` therefore has a `workflow_dispatch` with the version as input and creates the tag itself, on `main` only, last, together with the release. Task 21.
39. **L39 · A job cut off by its time limit is cancelled, not failed.** `if: failure()` does not see it, so a failure report must read `needs.*.result` for `cancelled` too. A lockfile in a cache key means the first run after any dependency change is a full run; size the time limit for that. Task 21.
40. **L40 · No ESLint cache with type-aware rules.** The cache keys on a file's own content, so a finding that depends on another file (an exhaustive `switch` over a union defined elsewhere) passes stale. Task 02.
41. **L41 · A slow first open needs its own timeout.** The one test that must not preload (the lazy-loading test, L12) pays the first transform of Vue, Nuxt UI and every screen inside its own time; give it an explicit limit (30 s) instead of the 5 s default. Task 09.
42. **L42 · A host call can report failure by its result.** `fileManager.trashFile` resolves `false`, without rejecting, when the system trash fails (Obsidian 1.15.1; the d.ts says `void`, success resolves `true`). A `try`/`catch` around it reports a deleted note that is still there. Read the result, count only `false` as the failure (`undefined` from an adapter that keeps to the d.ts is a success), and measure each host call's failure mode before wrapping it. Task 13.
43. **L43 · A "cached" read outlives the file.** Obsidian keeps the text of every Markdown file up to 64 KiB once it has read it, and its metadata cache reads every file it indexes. For a note deleted outside, `cachedRead` still gives the old text while `read` and `process` reject with `ENOENT`. Anything that must see the disk (is this note readable now) uses `read`; the double keeps the text too, so a test can tell the two apart. Task 13, Task 14.
44. **L44 · A command-line guard that compares paths fails open.** `import.meta.url` is the real path and `process.argv[1]` is what the caller typed; through a symlink a plain comparison is false, the script does nothing and exits 0, so a gate step that was skipped reads as passed. One shared helper compares real paths, and a test starts a script through a symlink. Task 02.
45. **L45 · A form kit that treats every field as text deletes the values it cannot show.** A list shown as a string, or a number or flag saved as text, rewrites the note's property on a save that changed something else. Give each field kind its own form value through one mapping, and keep an untouched field's stored value by comparing in the form of its kind. Task 17.
46. **L46 · The directory scans the whole repository and has no ignore option.** Its source scan reads every tracked file outside a fixed list of names (`**/tests/**`, `**/docs/**`, `**/scripts/**`, `**/*.mjs`, tool configs and more; checked 23.11.2026), and no ignore file, manifest field or `.gitattributes` changes that. Agent tooling with JavaScript or CSS in `.claude/` (a vendored skill such as Archify: `innerHTML`, `!important`, `:has`) is scanned like plugin code, although the plugin's own lint ignores it. Keep such tooling out of the repository: git-ignore it and document how each collaborator installs it. Task 00, Task 21.
47. **L47 · No `engine-strict`.** With `engine-strict=true` and `engines.node >=24`, the directory's `npm install` fails on its own Node version ("Source review dependency installation failed"), and the scan then runs without type information, its type-aware rules switched off. Keep `engines` as advice and pin the toolchain through `.nvmrc` and CI. Task 00.
48. **L48 · Presentation creates no DOM element.** The scan flags `document.createElement` (`obsidianmd/prefer-create-el`, also on `doc.createElement` in newer plugin versions than the local lint) and refuses a disable comment for it (`eslint-comments/no-restricted-disable`). Obsidian's `createEl` does not exist in the dom tests or the harness, so the caller passes the elements in: `ShellView` makes them with `contentEl.createDiv()`, tests and the harness with `createElement`. Task 09, Task 10.
49. **L49 · The harness lives under `tests/`.** A plain browser page needs `createElement` and `document`; under `tests/harness/` the scan ignores it by name, at the root it reports every call. Task 11.
50. **L50 · No literal special whitespace in source.** A non-breaking space typed into a regular expression is invisible in review and fails the scan's `no-irregular-whitespace`; write it as `\u00A0` (`\u202F` for the narrow one). Test files may keep literal ones: the scan ignores them. Task 02, Task 13.
51. **L51 · Tailwind's source directives look unknown to a CSS lint.** The scan's CSS lint reports `@source` and `@theme` as unknown at-rules (warnings). Put a `stylelint-disable at-rule-no-unknown` comment with its reason at the top of each source CSS file that uses them; the built `styles.css` has none. Whether the scan honours the comment is not documented. Task 08.
52. **L52 · Review early.** The first directory review of a plugin built on this plan, run after its first releases, found all of L46–L51 at once; the local scanner lint (pinned to `eslint-plugin-obsidianmd@0.6.0`) had missed two of them. Run *Review branch* as soon as the shell builds, again before each release, and bump the scanner lint's plugin version with each `eslint-plugin-obsidianmd` release. Task 21, Task 22.

## Definition of done

An agent can run each of these and reads the exit code:

1. `npm ci` in a fresh clone of the new repository exits 0, with no `--force` or `--legacy-peer-deps`; `npm ls --all` exits 0.
2. `npm run verify` exits 0; its summary lists `format:check`, `lint`, `typecheck`, `check:versions`, `test:coverage`, `analyze`, `build`, `check:dist`, `check:notices`, each `ok`.
3. `npm run test:mutation:full` exits 0 with a score at or above 75 on `src/domain` and `src/application`; the report is in `reports/mutation/`.
4. `xvfb-run -a npm run test:e2e` exits 0 (Linux; Untested proposal: without `xvfb-run` on Windows and macOS), every spec ending with a clean console.
5. `npm run fallow:config` leaves `git status` clean (the generated file is current).
6. A throwaway module, added as Task 22 describes, fails the list test, typecheck and `npm run analyze` until it has its two manifests and two shared lines, and passes after; it is then removed.
7. A planted type error in a domain file makes `npm run verify` exit non-zero with `typecheck` as the failing step and the later steps `not run`.
8. `npm run build && npm run release:package` writes `release/<plugin-id>/` with exactly `main.js`, `manifest.json`, `styles.css`, and `release/THIRD-PARTY-NOTICES.txt` beside it.
9. Outside `docs/plans/`: no `TODO`, `FIXME`, skipped or focused test, lint or type suppression without a reason on the same line, scratch file from Task 01, or `// Stryker disable` without a reason. (This blueprint names those words; it is not checked.)
10. ADR 0001 lists every version, fallback, blocker and override; ADRs 0002 to 0008 and the engineering guides match the code (every path in them exists).

Only a human or a real GitHub repository can confirm these; report them as `not-run`:

- the repository settings of Task 21 (Actions allowed, the `main` ruleset with `CI / verify` required, squash merges) and the proof that a pull request with a planted type error cannot be merged;
- the first run of `release.yml`, its attestation (`gh attestation verify`), the pre-release flag and installation through BRAT;
- the first run of `nightly-mutation.yml`, a second run that reuses the cached incremental file, and the failure issue;
- the first Dependabot run applying cooldown, groups and ignored majors;
- `CI / e2e` without a flake for about two weeks before it is made required;
- manual checks in a personal vault: keyboard only, a screen reader, Obsidian's zoom, a community theme in light and dark, other plugins, a pop-out window, Windows and macOS for the case-insensitive root folder.
