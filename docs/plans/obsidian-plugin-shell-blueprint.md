# Obsidian plugin shell blueprint

- Date: 2026-11-22
- Derived from: the WEG Manager plugin repository at the state after its groundwork (module manifest, record kit, settings screen with sections, third-party notices), read from the code, the ADRs and the backlog, not from memory.
- Replaces: [the archived blueprint](archive/obsidian-plugin-shell-blueprint.md), which built a shell whose walking skeleton hardened `data.json` settings while the first feature needed vault notes ([pre-feature improvement plan](pre-feature-improvement-plan.md), verdict and section 3). About forty pull requests rebuilt it; this plan builds the result directly.

This is an implementation plan for an agent that starts in an **empty folder** and has only this plan. It is split in two parts:

- **This file** is the entry: goal, architecture, stack, inputs, rules, constraints, file structure, the task list with one paragraph per task, what the shell leaves to the plugin, what the source repository has not solved, the lessons, and the definition of done.
- **[`obsidian-plugin-shell-blueprint/`](obsidian-plugin-shell-blueprint/)** holds one file per task (`NN-<slug>.md`) with its steps, checks and completion criterion. Open a task's file when you start the task, not before: each file is written to be read alone, after the tasks before it are done.

Why split: the full text is about 1,200 long lines (some 33,000 words), well over the 700 lines one plan file should hold. One file would bury each task's steps under every later one, and an agent reading the whole would see "done" for later work while it is still on the current task.

**Words used throughout.** *Source repository*: the WEG Manager repository this plan was derived from. *Proven there*: a test in the source repository shows it and passes. *Design intention*: the source repository decided it but no test there shows it. *Tracer*: the first feature, a neutral record type `item`, which plays the role the source repository's `communities` module plays. *Gate*: `npm run verify`. Every path in this plan is a path in the new repository. The same path exists in the source repository with the source's names in place of the placeholders and of `items`/`item` (there `communities`/`community`), except for generated or git-ignored output (`dist/`, `release/`, `reports/`), files planted for a discriminating check, and the few files a task marks as a design intention.

## Goal

A new Obsidian plugin repository whose gate is green and whose tracer feature proves the path every later feature walks: a Markdown note in the vault → decoded by a versioned schema → held in an index → shown on a routed view → written back line by line → an outside edit merged per field → a conflict shown to the user. Everything a second feature would otherwise copy is in shared modules, and a new module registers itself in two shared lines.

## Architecture

Ports and adapters in four layers, dependencies inward only: `domain` (pure rules and Effect Schema, issue codes instead of sentences) ← `application` (Effect services, ports, use cases, tagged errors, message catalogs) ← `infrastructure/obsidian` (the only code that imports `obsidian`; adapters for every port) and `presentation` (Vue 3 and Nuxt UI; reaches Effect only through `src/presentation/shell/runtime/`). Each layer is cut into module folders with one public `index.ts`: `shell` (what every module needs), `notes` (vault records: `NoteStore`, codec, index, record kit), then feature modules; the direction is feature → `notes` → `shell`. A module registers itself through two plain-data manifests, `src/application/<module>/module.ts` (`defineModule`) and `src/presentation/<module>/screens.ts`, listed once in `APP_MODULES` and `MODULE_SCREENS`; every composed type, the ESLint module rules and the generated fallow config derive from that one list. One `ManagedRuntime` per plugin load is built from `appServicesLayer(adapters)`; the plugin, the browser harness and the tests differ only in the adapters they pass. One Vue app per open view mounts lazily, so plugin load evaluates no Vue. Product data lives in notes recognised by `schema: <plugin-id>.<type>/v<n>` and a stable `id`; `data.json` holds only technical settings.

## Tech stack

Exact versions the source repository pins today (`package.json`, `package-lock.json` lockfile v3). Task 01 re-resolves them and keeps a newer version only when its probe passes.

| Kind | Packages |
| --- | --- |
| Runtime (bundled) | `vue@3.5.46`, `@nuxt/ui@4.13.0` (pulls `reka-ui@2.11.0`, `@vueuse/core@14.4.0`, `tailwind-merge@3.7.1`), `@iconify/vue@5.0.5`, `tailwindcss@4.3.5` (build time only), `effect@4.1.5`, `@tanstack/vue-form@1.33.5` |
| Types and language | `obsidian@1.14.4` (API types; no 1.15.x types published), `typescript@6.0.3` (held back, see Task 01), `vue-tsc@3.3.14`, `@types/node@26.6.6` |
| Build | `vite@8.3.8`, `@vitejs/plugin-vue@6.0.11`, `postcss@8.5.33`, `postcss-selector-parser@7.2.1`, `@iconify-json/lucide@1.2.157` |
| Unit and dom tests | `vitest@5.1.1`, `@vitest/coverage-v8@5.1.1`, `@effect/vitest@4.1.5`, `@vue/test-utils@2.6.0`, `happy-dom@21.0.4`, `fast-check@4.10.3`, `yaml@2.9.1` (only with the vault phase) |
| End to end | `wdio-obsidian-service@3.5.0`, `wdio-obsidian-reporter@3.5.0`, `@wdio/cli@10.2.0`, `@wdio/local-runner@10.2.0`, `@wdio/mocha-framework@10.2.0`, `@wdio/globals@10.2.0`, `mocha@12.0.3`, `@types/mocha@10.0.10` |
| Mutation | `@stryker-mutator/core@10.1.1`, `@stryker-mutator/vitest-runner@10.1.1`, `@stryker-mutator/typescript-checker@10.1.1` |
| Lint, format, analysis | `oxlint@1.94.0`, `eslint@9.39.5` and `@eslint/js@9.39.5` (held back), `typescript-eslint@8.73.0`, `eslint-plugin-vue@10.12.1`, `vue-eslint-parser@10.4.2`, `eslint-plugin-obsidianmd@0.6.0`, `eslint-plugin-oxlint@1.94.0`, `globals@17.14.0`, `prettier@3.10.1`, `fallow@3.45.0` |
| Platform | Node 24 LTS (`.nvmrc`: `24`), npm 11; Obsidian app `minAppVersion` 1.15.1 in the source; GitHub Actions |

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
| `<languages>` | UI languages; the first is the fallback for every Obsidian language not listed | `en`, `de` |
| `<test-language>` | the language the Obsidian double and the e2e app start in, so exact-text tests pin the non-fallback texts | the second of `<languages>`, else the first |
| `<root-folder>` | vault folder for the plugin's notes (a setting without UI) | `<Plugin Name>` |
| `<min-app-version>` | `minAppVersion` | the newest stable Obsidian app on the day of Task 01 |
| `<license>` | `LICENSE` text | MIT |
| `OBSIDIAN_PLUGIN_DIR` | dev install target, in the git-ignored `.env.local` | unset: `npm run dev` builds only |

## Agent operating rules

- **Work in the new repository only.** Do not create a remote, push, tag, or change GitHub settings. Task 21 lists those steps for the human; report them as `not-run`.
- **Tests first.** Every behaviour step writes the failing test, runs it, sees it fail for the stated reason, then implements. A step marked *discriminating check* counts only after the check was seen to fail on the planted defect and pass after its removal.
- **Read exit codes.** Never claim a check passed without running it and reading its exit code. Never mask one (`|| true`, a pipe that hides the source's code, backgrounding).
- **The gate from Task 02 on.** `npm run verify` exits 0 at the end of every task from Task 02; it gains steps as the tasks add them. A task that touches lifecycle, the settings tab, theme, pop-out, view state or vault behaviour also needs a passing `xvfb-run -a npm run test:e2e` once Task 12 exists.
- **Measurements beat this plan.** Where Obsidian behaves differently from what a task says, an e2e measurement decides; record the difference in the task's ADR, change the Obsidian double to match, never the expectation alone.
- **Effect 4.** Services are `Context.Service` classes, errors `Schema.TaggedError`. Read `node_modules/effect/dist/*.d.ts` for every API you use; Effect 3 names and signatures from memory are wrong.
- **Stop and ask** when a Task 01 probe fails and no fallback here covers it, a global constraint cannot be met, a coverage or mutation threshold would have to be lowered, or a task needs a product decision this plan leaves to the plugin.
- **Commits.** One or more commits per task, Conventional Commits (`chore:`, `feat:`, `fix:`, `test:`, `build:`, `ci:`, `docs:`, `refactor:`).
- **Report** per check `passed`, `failed` or `not-run`, with the reason for each `not-run`.

## Global constraints

Every constraint is enforced by a tool in the gate unless it says otherwise. Each task that introduces an enforcement proves it with a planted violation.

1. **Dependencies.** Exact versions, no `^` or `~`; `package-lock.json` committed; `.npmrc` holds `save-exact=true`, `engine-strict=true`, `tag-version-prefix=""`; `engines.node` is `>=24`. A new runtime dependency needs a row with its reason in ADR 0001.
2. **TypeScript.** `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `verbatimModuleSyntax`, `noEmit`, `skipLibCheck`, `isolatedModules`, `moduleResolution: "Bundler"`, target `ES2022`, lib `ES2023` (`configs/tsconfig.base.json`).
3. **Layers** (oxlint `no-restricted-imports` in `.oxlintrc.json`; fallow zones). `obsidian` only in `src/main.ts`, `src/bootstrap.ts`, `src/infrastructure/obsidian/**`. `src/domain/**` and `src/application/**` import no `obsidian`, `electron`, Vue or UI package. `src/presentation/**` imports no `obsidian`, no `effect` (except `src/presentation/shell/runtime/**`) and no infrastructure. `main.ts` imports no `effect` and no Vue. The harness imports no `obsidian`.
4. **Modules** (ESLint `no-restricted-imports` built from `APP_MODULES`; fallow zones from the generated `configs/fallow.json`). Outside a module folder, import it only through its `index.ts`; second entries: `presentation/shell/host.ts` for plugin-load code, `application/notes/adapter.ts` for `src/infrastructure/**` only, and each presentation module's `screens.ts` for `src/presentation/*.ts` only. Direction feature → `notes` → `shell`; features may import each other's index, acyclically. Nothing in `src/` imports `src/infrastructure/memory/`.
5. **No Vue at plugin load.** `main.ts`, `bootstrap.ts`, `src/infrastructure/**` and `src/presentation/*.ts` import a presentation `index.ts` only as types; `screens.ts` imports no Vue, no `.vue` file and no presentation index as a value. Proven at runtime by `tests/dom/lazy-presentation.test.ts`.
6. **File size and complexity.** ESLint `max-lines`: 400 lines of code per source file, 450 per test file (blank lines and comments do not count). fallow: cyclomatic complexity at most 10, duplicates from 50 tokens.
7. **Build output** is exactly `dist/main.js` (one CommonJS file, default export, `codeSplitting: false`), `dist/styles.css`, `dist/manifest.json`. External: `obsidian`, `electron`, `@codemirror/*`, `@lezer/*`, Node builtins. Budgets: `main.js` 1.5 MB, `styles.css` 250 KB (`check:dist`).
8. **No runtime network.** Icons bundled, no remote fonts, no CDN; a missing icon is never fetched (`keepIconsOffline`).
9. **CSS ownership.** Every selector under `.<plugin-id>-root`; no Tailwind preflight; no `@layer` in the output; `@keyframes` and `@property` names prefixed; nothing written to `document.head`; Tailwind classes carry the `<css-prefix>:` prefix; Nuxt UI components imported explicitly from `@nuxt/ui/components/*.vue`.
10. **Obsidian guidelines** (`eslint-plugin-obsidianmd`, also on `.vue` files): no `innerHTML`/`outerHTML`, `v-html` banned, no default hotkeys, command ids without the plugin id, listeners through `this.register*`, `console` only in `src/infrastructure/logging/`, `getLanguage()` for the UI language.
11. **Config.** `src/**` reads no `process.env` and of `import.meta.env` only `MODE` (ESLint `no-restricted-syntax`). No module-level mutable state in `src/**` (review rule; no tool checks it).
12. **Texts.** Every user-visible text comes from a typed catalog per module and language; a key missing in one language fails typecheck. The domain returns issue codes, never sentences.
13. **Code language.** Identifiers, events, log events, frontmatter keys and value codes are English; `GLOSSARY.md` gives the English term for each product term, and a term enters the glossary before it enters code.
14. **Errors.** Every expected failure is a `Schema.TaggedError` in its module's union with a text in every catalog (typecheck fails otherwise); defects go through `reportDefect` once per boundary; log entries carry counts, flags and a `LoggedError`, never note content.
15. **Forms** use TanStack Form, with validators that call the domain rule. The settings tab uses Obsidian's declarative settings API. A setting has one edit location: plugin-wide technical settings in the settings tab, feature data in the plugin's views.
16. **Coverage** over `src/**` (not `main.ts`, `styles/`, `env.d.ts`): lines 90, statements 90, functions 90, branches 85. **Mutation** of `src/domain` and `src/application`: break 75, low 80, high 90. Never lowered.
17. **Portability.** Every script is Node or an npm script that runs unchanged on Windows and Linux.
18. **Mobile.** `manifest.json` has `isDesktopOnly: true` (see [What the shell leaves to the plugin](#what-the-shell-leaves-to-the-plugin)).

## File structure

The state after Task 22, with the tracer module `items`. Files in one folder are listed together; tests mirror the source folders (`tests/<project>/<layer>/<module>/`).

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
│  ├─ verify.mjs, install-hooks.mjs, modules.mjs, fallow-config.mjs
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
│  │  ├─ memory/{shell,notes}/                              # tests and harness only
│  ├─ presentation/
│  │  ├─ app-surface.ts
│  │  ├─ shell/{index,host,screens,mount,...}.ts, shell/runtime/, shell/components/
│  │  ├─ notes/{index,screens}.ts, notes/components/
│  │  ├─ items/{index,screens}.ts, items/components/
│  ├─ styles/{app,tokens,bridge}.css
├─ harness/{index.html,main.ts,layers.ts,fake-host.css}
├─ tests/
│  ├─ unit/, dom/                                           # Vitest projects
│  ├─ e2e/{wdio.conf.mts,tsconfig.json,support.ts,specs/,probe-plugin/,vaults/basic/}
│  ├─ support/{obsidian/,notes/,items/,adapters.ts,runtime.ts,layers.ts,surface.ts,wait.ts,preload.ts,...}
├─ docs/
│  ├─ adr/0001-dependency-baseline.md … 0008-navigation-and-view-state.md
│  ├─ engineering/{architecture,adding-a-feature,testing,error-handling,releasing,github-setup}.md
│  ├─ contracts/                                            # one page per note type and version
```

## Phases and tasks

Four phases. Run the tasks in order; each task's file names what it needs from earlier ones. Phase B is the vault data path: **a plugin without note data skips Tasks 13 to 17**, builds its tracer in Task 18 on its own data path, and drops what the section [Without note data](#without-note-data) lists.

### Phase A: the shell

- **[Task 00 · Repository skeleton and identity](obsidian-plugin-shell-blueprint/00-repository-skeleton.md).** `git init -b main`; `manifest.json` (`version: "0.1.0"`, `isDesktopOnly: true`), `versions.json`, `package.json` (`"type": "module"`, `"private": true`, no dependencies yet), `.npmrc`, `.nvmrc`, `.gitignore`, `.gitattributes`, `.editorconfig`, `LICENSE`, `README.md`, `AGENTS.md`, `CLAUDE.md` (`@AGENTS.md`), `GLOSSARY.md`, `docs/adr/`. Done when the manifest id check exits 0.
- **[Task 01 · Dependency baseline and compatibility probes](obsidian-plugin-shell-blueprint/01-dependency-baseline.md).** Resolve each package's newest stable version, run the probes in a scratch folder (`vue-tsc` × TypeScript, Stryker × Vitest with the TypeScript checker, Nuxt UI × Vite × Tailwind, `@effect/vitest`, TanStack Form under happy-dom, the peer ranges that hold back TypeScript 7 and ESLint 10), and write ADR 0001 with every version, fallback, blocker and override. Packages enter `package.json` in the task that first uses them, at the versions ADR 0001 fixes, so fallow never reports an unused dependency.
- **[Task 02 · Toolchain and the gate](obsidian-plugin-shell-blueprint/02-toolchain-and-gate.md).** Three TypeScript projects checked by `vue-tsc`/`tsc`; oxlint with the layer rules (its config stays at the root); ESLint flat config with `eslint-plugin-obsidianmd` (also re-scoped to `.vue`), `eslint-plugin-vue`, `switch-exhaustiveness-check`, `max-lines` and the `process.env` ban, `eslint-plugin-oxlint` last; Prettier; Vitest projects `unit` and `dom` with the throwing `obsidian` guard and coverage thresholds; `scripts/verify.mjs` (strictly sequential, stops at the first failure, prints a timing table); `.githooks/pre-push` and `scripts/install-hooks.mjs`. Discriminating checks: a planted violation for each layer rule, line limit and type check location.
- **[Task 03 · Modules and manifests](obsidian-plugin-shell-blueprint/03-modules-and-manifests.md).** `src/application/module.ts` (`defineModule`, `CatalogOf`, `ErrorOf`, `describerOf`, `sectionsOf`, `routeSchemasOf`, `commandsOf`, `noteTypesOf`, `servicesLayerOf`), `src/application/modules.ts` (`APP_MODULES`), the shell module's empty manifest, `scripts/modules.mjs` (parses the list without running it), the ESLint module rules built from it, `configs/fallow.config.mjs` and `scripts/fallow-config.mjs` writing `configs/fallow.json`, `npm run analyze` with the staleness check first, and `tests/unit/application/modules.test.ts`. Done when a throwaway module folder fails the list test and a planted cross-module import fails ESLint and fallow.
- **[Task 04 · The Obsidian test double](obsidian-plugin-shell-blueprint/04-obsidian-test-double.md).** `tests/support/obsidian/`: `Component` and `Plugin` with Obsidian's unload order, `Events` with `trigger` and `listenerCount`, workspace and leaves with view state and `layoutReady`/`markLayoutReady()`, the left ribbon as Obsidian keeps it, the declarative settings renderer, `Notice`, DOM extensions, `getLanguage()` starting in `<test-language>`, local storage that clears falsy values. Opted in per suite with `vi.mock("obsidian", () => import("@test/obsidian"))`. The vault half comes in Task 13.
- **[Task 05 · Shell domain and application](obsidian-plugin-shell-blueprint/05-shell-core.md).** The settings codec (one declaration per setting in `FIELDS`, `makeSettingsCodec`, per-field fallback, `MIGRATIONS` applied in memory only, read-only on a newer or unreadable file, `omitWhenDefault`), `SettingsService` with uninterruptible save-then-set, `Logger` with a typed `LoggedError`, incidents, `reportDefect`/`reportUnexpected`, the German-stable diagnostics report, the `Messages` service and per-module catalogs, `describeError` through the manifests' tags, the shell's commands `open-view` and `copy-diagnostics`.
- **[Task 06 · Service graph, adapters, runtime](obsidian-plugin-shell-blueprint/06-service-graph.md).** `AppAdapters` (one Layer per port), `appServicesLayer` (shell services, then notes, then the features' Layers, the host event adapter last), `appLayer` over the Obsidian adapters, `makeRuntime`, `EventBus` on an unbounded PubSub with `subscribe`, `hostEventsLayer` (nothing before `LayoutReady`; `registerEvent` plus `offref`), the console sink, `tests/support/adapters.ts` (`testAdapters`) and `tests/support/runtime.ts` (`testRuntime`).
- **[Task 07 · Plugin entry and lifecycle](obsidian-plugin-shell-blueprint/07-plugin-lifecycle.md).** `src/main.ts` (composition only, abort on unload, `onExternalSettingsChange`), `src/bootstrap.ts` (settings mirror, commands from `appCommands` without hotkeys, ribbon after everything that can fail, `addSettingTab` and `registerView` last, undo in reverse order, commands removed only after a failed load), `runSafely`, notices, the declarative settings tab with the log level only. Review focus: disable → enable → disable, and unload while load is pending.
- **[Task 08 · Build, CSS ownership, dist invariants](obsidian-plugin-shell-blueprint/08-build-and-css.md).** `configs/vite.shared.ts` (Vue, Nuxt UI with `router: false`, `colorMode: false`, explicit components, `theme.prefix`, icons in `svg` mode from `SHELL_ICONS`, `scopeCss`, `noHeadPlugins`), `configs/vite.config.ts`, `scripts/scope-css.mjs`, `scripts/no-head-plugins.mjs` (sha256-pinned no-ops for Nuxt UI's `colors` and `head` plugins), `scripts/check-dist.mjs`, `src/styles/` (no preflight, an explicit `@source` list, tokens derived from host variables, a scoped base reset), `scripts/dev-install.mjs`. The gate gains `build` and `check:dist`.
- **[Task 09 · Surface and runtime bridge](obsidian-plugin-shell-blueprint/09-surface-and-runtime.md).** `src/presentation/shell/host.ts` (Vue-free) and `index.ts`, `loadSurface` (`import("./mount")`), `mountSurface` (one Vue app per view, portal in the owner document, `errorHandler` to `reportDefect`, idempotent close), `bindHostTheme`, `keepIconsOffline`, `useQuery`, `useCommand` (never interrupted, resolves to a `RunOutcome`), `useStream`, `useMessages`, `ErrorNotice`, `NotFoundState`, `useModal`, `useDelayed`; `tests/support/wait.ts` (`eventually`) and `tests/support/preload.ts`.
- **[Task 10 · Navigation, view state, settings screen](obsidian-plugin-shell-blueprint/10-navigation-and-settings-screen.md).** Routes as data (`routesOf`, `settingsRoute(sections)`, `Route` and `appRoutes` in `src/application/routes.ts`), the per-view history (at most 50 steps), `ShellView` with `navigation = false`, `getState`/`setState`, `openRoute`, `AppFrame.vue` as a size container, `RouteOutlet.vue`, `SettingsScreen.vue` with one section per module, `frameMenu`, `src/presentation/app-surface.ts` with `MODULE_SCREENS`, `tests/support/surface.ts` with test-only routes. The settings route needs one section, so the tracer module's manifest and empty section start here; Task 18 fills them.
- **[Task 11 · Browser harness](obsidian-plugin-shell-blueprint/11-browser-harness.md).** `harness/` with two surfaces on one runtime (one 320 px wide), a theme switch, visible notices, `?scenario=` and `?lang=`, harness adapters for every `AppAdapters` field, and a fake host whose variables and base rules are read from the running Obsidian app, not written from memory. `npm run dev:ui`, `npm run build:ui`, `tests/unit/harness-layers.test.ts`.
- **[Task 12 · End to end in real Obsidian](obsidian-plugin-shell-blueprint/12-e2e-in-obsidian.md).** `tests/e2e/wdio.conf.mts` (latest app on the latest installer, `--lang` for `<test-language>`, `.obsidian-cache/`), `tests/e2e/support.ts` (console spy that ignores only `ResizeObserver loop`), and the shell specs: lifecycle, settings and theme, external settings, pop-out, navigation, language, no network, events. Run under `xvfb-run -a` on Linux.

### Phase B: vault data (skip for a plugin without note data)

- **[Task 13 · The note store](obsidian-plugin-shell-blueprint/13-note-store.md).** The `notes` module in every layer; the `NoteStore` port (`list`, `read`, `unreadable`, `create`, `update`, `trash`, `rename`), `NoteOpener`, `IdGenerator`; the Obsidian adapter (the only code that changes vault files: `vault.create`, `vault.createFolder`, `vault.process`, `fileManager.trashFile`, `fileManager.renameFile`, paths through `normalizePath`), the in-memory adapter, writes as uninterruptible commands, name clashes by `clashKey`, the root folder setting; the double's vault, metadata cache and file manager; the contract suite run against both adapters on a case-sensitive and a case-insensitive disk; the fidelity scenarios and the e2e probe plugin.
- **[Task 14 · Line edits and the YAML writer](obsidian-plugin-shell-blueprint/14-note-text.md).** `updateNoteText` inside `vault.process`: split the block where the metadata cache does, read it with `parseYaml`, change only the lines of the keys the patch sets or removes, re-parse the edited text and refuse (`NoteWriteRefusedError`, reason `layout`) when it does not read back exactly; one serialiser (`yamlEntry`) for create and update; BOM and line endings kept; the four fixes the source decided and landed on 2026-11-22 (closing lines `---` with trailing blanks and `----` written into and kept, a comment at the end of a written line kept, folders found by `clashKey`, file names at most 255 bytes in UTF-8).
- **[Task 15 · The note codec](obsidian-plugin-shell-blueprint/15-note-codec.md).** `defineNoteType` (field kinds `text`, `number`, `checkbox`, `date`, `list`; `required`; the `schema` marker; the `<type>-<uuid>` id; migrations in memory), `decode` with the outcomes `not-this-type`, `read-only`, `editable`; `check`; `markDuplicateIds`; the per-field `merge` with `NoteEditConflictError`; the write guards of `NoteWriteRefusedError`. Property tests with fast-check.
- **[Task 16 · VaultReady and the index](obsidian-plugin-shell-blueprint/16-vault-ready-and-index.md).** `VaultReady` from cache completeness (every Markdown file has a `getFileCache` entry, checked at layout ready and on each `resolved`), the deterministic reference vault (`scripts/reference-vault.mjs`), `NoteIndex` (build at `VaultReady`, re-read by path after events, batches of 100 ms quiet or 1 s, snapshots only on change, rebuild, failure kept beside the last notes), budgets as counted work in unit tests and as timings only in e2e.
- **[Task 17 · The record kit](obsidian-plugin-shell-blueprint/17-record-kit.md).** What every record type needs, in `notes`, before any feature: `recordFileName`, `followsTitle`, `lineOfText`, `editedValues` (domain); `defineRecords` with list rows, create, update (merge, then rename while the file follows the title, as one command), remove, notices, `describeRecordIssue` (application); `useRecordForm`, `useRecordScreen`, `ConflictChoice`, `DeleteRecordDialog`, `OpenNoteButton` and the settings section "data issues" (presentation), all tested on a sample type in `tests/support/notes/record-fixture.ts`.

### Phase C: the tracer

- **[Task 18 · Tracer feature `items`](obsidian-plugin-shell-blueprint/18-tracer-items.md).** The `item` note type (`title`, `status`, `due`), its contract page, its rules, its manifest, its settings section with the list, the sheet form, the delete dialog and the data issues beside it; harness scenarios `loaded`, `empty`, `invalid`, `readonly`, `failure`; e2e specs for create/edit/delete with exact file text, an outside edit and a conflict, a newer schema, invalid notes, write fidelity byte for byte, focus and modality, settings sections, and measured contrast. The module has no infrastructure folder.

### Phase D: release and hand-over

- **[Task 19 · Mutation testing](obsidian-plugin-shell-blueprint/19-mutation-testing.md).** Stryker on `src/domain` and `src/application` with the TypeScript checker and thresholds 75/80/90 (`npm run test:mutation`, `test:mutation:full` with `--force`); the non-gating edge run over the adapters, presentation `.ts` files and `bootstrap.ts` (`npm run test:mutation:edge`); the incremental caveat; survivors planted by hand before a test is written.
- **[Task 20 · Release scripts and third-party notices](obsidian-plugin-shell-blueprint/20-release-scripts.md).** `scripts/version-bump.mjs` (the npm `version` hook), `scripts/package-release.mjs` (`release/<plugin-id>/` with three files, the notices beside it, tag = manifest version, `check:dist` re-run, `versions.json` entry), `scripts/bundled-packages.mjs` and `scripts/third-party-notices.mjs` (licences of what the production bundle holds, not of the dependency tree); the gate gains `check:notices`; `verify:full` adds mutation testing.
- **[Task 21 · GitHub workflows and dependency updates](obsidian-plugin-shell-blueprint/21-github.md).** `ci.yml` (`verify`, `e2e`, `scanner-lint`), `nightly-mutation.yml` (cached incremental file, `full` by hand, the edge job, a failure issue), `release.yml` (a read-only `build` job that checks the tag is on `main` and runs gate, e2e and packaging; a `release` job with write permissions, no checkout and no npm, that attests four assets and creates a pre-release while the major is 0), Dependabot with cooldown and ignored majors, actions pinned by SHA, `docs/engineering/github-setup.md` and `releasing.md` with BRAT. The workflows that need a tag cannot be run before the first tag.
- **[Task 22 · Documentation and acceptance](obsidian-plugin-shell-blueprint/22-docs-and-acceptance.md).** ADRs 0002 to 0008, the engineering guides with the tracer as the worked example of `adding-a-feature.md`, `AGENTS.md` as built, then the acceptance run from a fresh clone (`npm ci`, `npm run verify:full`, `npm run test:e2e`) and the hand-over list.

## Without note data

A plugin whose data is not notes (for example one that only renders, or keeps all state in `data.json`) skips Tasks 13 to 17 and keeps everything else. What falls away with them:

- the `notes` module in every layer, so `CORE_MODULES` in `scripts/modules.mjs` is `["shell"]`, and `configs/fallow.config.mjs` loses the zones and rules named `notes`, `notes-adapter` and `memory/notes`;
- `NoteStore`, `NoteOpener`, `IdGenerator` and their fields in `AppAdapters`; `src/infrastructure/memory/notes/`; `TEST_ONLY_MARKER` and its `check:dist` rule (keep it if another in-memory adapter can fail);
- the double's vault, metadata cache and file manager beyond what Task 04 builds; the fidelity scenarios, the probe plugin and `configs/vite.probe.config.ts`; the `yaml` dev dependency;
- `VaultReady`, `cache-completeness.ts`, the reference vault, the index and its budgets; the `rootFolder` setting;
- the record kit, the data issues section, `docs/contracts/` and ADR 0007;
- the e2e specs `note-store`, `note-write-fidelity`, `vault-ready`, `note-index` and the record specs of Task 18.

`LayoutReady` stays: it is the edge after which the file list is complete. The tracer still has to walk the path the first real feature needs (lesson L1): its own source of data, a routed view, a write, and an outside change. Task 18 then names its own steps; the module manifest, screens, catalogs and e2e rules are the same.

## What the shell leaves to the plugin

- **The domain.** Note types, their fields and contracts, rules between records, screens beyond settings, commands beyond `open-view` and `copy-diagnostics`, domain events (`AppEvent` has none from a feature yet).
- **Mobile.** `isDesktopOnly: true`. Lifting it needs, at least: e2e runs in mobile emulation (`wdio-obsidian-service` supports it; not tried in the source), the frame's layout already follows container width, a check that every Obsidian API used exists on mobile, the `Platform` flags read app-first (L24), and a manual check on a phone. None of this is proven in the source repository.
- **A client store.** No Pinia: shared state is a service with a stream (settings, the index). Add one only with an ADR.
- **Per-device state.** The source has a `DeviceStore` port over `app.loadLocalStorage`/`saveLocalStorage` for its community selection. Build it with the first value that must stay on one device.
- **Drafts.** Form input is lost when a view closes; a draft store is decided with the first long form.
- **Deep links.** Routes are not URLs; Obsidian URIs would be a separate decision.
- **Community directory submission.** `npm run lint:scanner` approximates the scan; the submission itself, and what the scanner says about vendored agent tooling, is the plugin's.

## Not solved in the source repository

Open backlog items there; this plan does not solve them either. Each is a known gap, not a hidden promise.

- **`VaultReady` has no fallback** (PBI-65, case 1). A Markdown file Obsidian never indexes would hold the index back for good; none was seen in real Obsidian 1.15.1 (empty, binary, 30 MB, excluded, symlinked and unreadable files were tried).
- **Two wrong messages** (PBI-65, cases 4 and 7). A note deleted while `vault.process` waits gives a write error instead of "not found" on the first try; the notice of a failed settings save after its view closed says the input is kept, which is no longer true.
- **References between records and a "today" service** (PBI-61). No `reference(type)` field kind with a domain issue for a missing target, no lookup by `id` without scanning a list, no date source that turns over at local midnight.
- **One index snapshot across types** (PBI-62). The index publishes one snapshot per type, one after the other; a view that joins two types could see one updated and the other not. Derived lists are recomputed per subscriber. Untested, because there is one type.
- **Test double gaps** (PBI-63). The double's YAML is stricter than Obsidian's (nested maps, block scalars, anchors); its indexing is one macrotask after a write where Obsidian's worker reorders; lazily loaded background tabs, `getLeaf(false)` reuse, layout restore and folder renames are not modelled; the double is joined to the plugin through casts, not `satisfies` against `obsidian.d.ts`; the `NoteStore` contract runs only against the double and the in-memory store; e2e specs still hold fixed pauses and literal sentences.
- **Gate cost** (PBI-64). The gate took 81 to 87 s there (about 105 s summed over its steps in the run of 2026-11-22 for this plan) and runs its first three independent steps (format, lint, typecheck) one after the other; the pre-push hook runs the whole gate for a docs-only push; the e2e job installs a window manager with `apt-get` on every run; CI runs `npm ci` once per job.
- **First release and nightly run** (PBI-67). Neither workflow has run; `CI / e2e` is not a required check; manual accessibility checks (keyboard only, screen reader, zoom, community themes) have not been done by a person (PBI-66).

## Lessons

Each lesson cost time in the source repository. The rule comes first, then the reason. The task that applies it names it by number.

1. **L1 · Walk the path the first feature needs.** The first shell hardened `data.json` end to end with a demo greeting while every product record was going to be a note; the path note → decode → index → view → write → outside edit existed in no layer and took six steps to build. Tasks 13–18.
2. **L2 · Modules before the second concern.** One file per concern per layer (`errors.ts`, `ports.ts`, one catalog) meant every feature would edit the same eight files; restructuring later was a pull request of its own. Task 03.
3. **L3 · Two shared lines per module, everything else derived.** Before the manifest a module registered in about twelve places and some of them failed nowhere when missed (the navigation entry, the frame parts). Task 03, Task 10.
4. **L4 · Writes run to completion.** `plugin.saveData` and vault writes cannot be cancelled; an interruptible save-then-set left disk and memory apart when a view closed during a save. Make the write uninterruptible and give components a command form that scope end does not interrupt. Tasks 05, 09, 13.
5. **L5 · Diagnostics by type, not by redaction.** A deny-list by key and a 200-character limit redacted every real stack and let short messages with file names through. Log only counts, flags and a `LoggedError` of name and sanitised frames. Task 05.
6. **L6 · Do not call `fileManager.processFrontMatter` for updates.** It rewrites the whole YAML block: comments gone, `01067` → `1067`, `1.10` → `1.1`, a 20-digit number rounded, a flow list made a block list, `'yes'` unquoted, no block seen after a BOM, LF written into a CRLF note. Edit lines inside `vault.process` and re-parse. Task 14.
7. **L7 · Find the block where the metadata cache finds it, not with `getFrontMatterInfo`.** It sees no block after a BOM or with lone carriage returns and does not close at `----`, while the cache does; where Obsidian's own readers disagree, refuse the write. Task 14.
8. **L8 · `resolved` and `LayoutReady` do not mean "frontmatter is readable".** On a cold start the layout is ready with 1 of 2,200 notes cached and `resolved` fires per note; in a running app it never fires. Check cache completeness through the public API. Task 16.
9. **L9 · A read right after a write races the index.** The cache lags a write by a few milliseconds and the index by one batch; return the note as written to the form that wrote it, let every list follow the index, and let an e2e spec wait for the list before it clicks (a re-render about 0.1 s after a save moved a button by 41 px). Tasks 13, 16, 18.
10. **L10 · A lazily loaded part arrives later than its screen.** A settings badge follows its own snapshot and appeared after the list it sat beside; a test that read both at once failed. Wait for the part itself. Tasks 10, 18.
11. **L11 · Never `vi.waitFor` with its 1 s default.** It failed on a loaded machine (the gate beside another suite, Stryker); `eventually` waits up to 4 s, polls every 10 ms and returns at once when it succeeds. Task 09.
12. **L12 · Preload what a view imports.** The first mount of a file paid seconds of transform under load inside its own timeout; `preloadSurface()` at the top of each file that opens a view, except the lazy-loading test. Task 09.
13. **L13 · No wall-clock assertions outside e2e.** Time bounds and ratios of two times failed under load with nothing wrong in the code; assert counted work (reads, decodes) and record timings in e2e reports. Task 16.
14. **L14 · Stryker's incremental file keeps old survivors.** An incremental run does not re-test a survivor against a new test; run with `--force` after adding tests, and read the timed-out count beside the score. Task 19.
15. **L15 · fallow reads only JSON and no placeholder.** Its zone rules must name every module; generate `configs/fallow.json` from a JS source and the module list, and let `npm run analyze` fail while it is stale. Pass `-c` explicitly: fallow did not discover `fallow.json` by itself. Task 03.
16. **L16 · Module rules in ESLint, layer rules in oxlint.** A later oxlint override replaces an earlier one's `no-restricted-imports` options for the same files, so module rules there switched the layer rules off. Task 02, Task 03.
17. **L17 · Keep `.oxlintrc.json` at the root.** Moved into `configs/`, its per-path overrides silently stopped applying; a planted violation passed. Task 02.
18. **L18 · Bundle every icon and refuse the network.** Nuxt UI draws icons through `@iconify/vue`, which asks `api.iconify.design` for any icon the bundle lacks; list icons in `SHELL_ICONS` and replace the client's fetch with a 404. Task 08, Task 09.
19. **L19 · Nothing in `document.head`.** Nuxt UI's runtime `colors` plugin appends a `<style>`; in a pop-out it would style the main window. Replace it and the `head` plugin with sha256-pinned no-ops and set the colour roles in CSS. Task 08.
20. **L20 · Scan only the Nuxt UI components you use.** Scanning every component theme made `styles.css` 263 KB against a 250 KB budget; every new component is a line in the `@source` lists, or it renders unstyled. Task 08.
21. **L21 · Build no host event nobody handles.** `ActiveFileChanged`, `ColorSchemeChanged`, `isMarkdown` and two bus members were built, tested and then deleted unused; add an event with its first consumer. Task 06.
22. **L22 · Generic record handling belongs in `notes` before the second record type.** Most of the first feature was record handling (file names, list rows, merge-then-rename, conflict UI, delete dialog) that a second type would have copied. Task 17.
23. **L23 · A fixed tab, own history.** With `navigation = true` Obsidian records the leaf's history, but a plain click in the file explorer then opens the note in the plugin's tab and closes the view. Task 10.
24. **L24 · `Platform.isMacOS` is true on iPhones and iPads.** Read `isIosApp` and `isAndroidApp` first. Task 06.
25. **L25 · Measure a colour palette.** Two palette colours (`teal`, `cyan`) differed almost only in hue (luminance ratio 1.02 light, 1.44 dark), so adjacent badges looked alike to colour-blind users; Obsidian's warning colour was 2.95:1 on white. Derive text and fill shades from host variables and measure every text in e2e. Task 08, Task 18.
26. **L26 · The harness must play Obsidian.** Its invented host colours and missing base rules hid list bullets, a 40 px indent, raised ghost buttons and 2.95:1 warning text that real Obsidian showed. Read the fake host's values from the running app. Task 11.
27. **L27 · Ribbon after everything that can fail, title fixed.** Obsidian removes the ribbon entry on a normal unload but not after a failed `onload`, `icon.remove()` leaves the entry in `leftRibbon.items`, and the entry is keyed `<plugin id>:<title>`, so a translated title loses its position. Task 07.
28. **L28 · Remove commands only after a failed bootstrap.** A late dispose removing commands by id hit the commands of a quick re-enable. Task 07.
29. **L29 · Never rewrite `data.json` on load.** A migrated or version-bumped file makes an older plugin on another device (Sync) read it as newer and go read-only; rewrite on the next save, and leave defaults out of the file. Task 05.
30. **L30 · `aria-disabled`, never `disabled`, under the focus.** A control that turns `disabled` while focused drops the focus to the page; Nuxt UI's `loading` disables its button, so show a spinner icon instead. Task 09, Task 17.
31. **L31 · A difference between the double and Obsidian is a bug in the double.** Run the same fidelity scenario on both and compare with one expectation; fix the double, never the expectation alone. Task 04, Task 13.
32. **L32 · Release from two jobs.** The first release workflow held a write token while running `npm ci` and the repository's code; the job with write permissions must have no checkout and run no npm. Task 21.
33. **L33 · Workflows that need a tag or a schedule cannot be proven before they run.** `release.yml` and `nightly-mutation.yml` were checked with `actionlint` only; expect fixes on the first tag and the first night. Task 21.
34. **L34 · Overrides, not downgrades, for audit findings in tooling.** npm's suggested fixes were old majors (`@wdio/cli` 9, `eslint-plugin-obsidianmd` 0.0.2). Task 01.
35. **L35 · Notices from the bundle, not from the tree.** The runtime tree had 248 packages; the production bundle holds 26. Generate the notices from the bundler's module list and check them in the gate. Task 20.
36. **L36 · Waiting in e2e is on a condition, never a pause.** A pause before "nothing was written" passes empty if the effect comes later; a pause before a click races the indexer. Task 12.
37. **L37 · Agent worktrees need real `node_modules` copies of `@nuxt/ui` and `.nuxt-ui`.** A symlinked `node_modules` breaks Tailwind's `@source not` excludes; Stryker's sandbox must ignore `.claude` and `.obsidian-cache` (symlinks, 1.3 GB). Task 08, Task 19.

## Definition of done

An agent can run each of these and reads the exit code:

1. `npm ci` in a fresh clone of the new repository exits 0, with no `--force` or `--legacy-peer-deps`; `npm ls --all` exits 0.
2. `npm run verify` exits 0; its summary lists `format:check`, `lint`, `typecheck`, `test:coverage`, `analyze`, `build`, `check:dist`, `check:notices`, each `ok`.
3. `npm run test:mutation:full` exits 0 with a score at or above 75 on `src/domain` and `src/application`; the report is in `reports/mutation/`.
4. `xvfb-run -a npm run test:e2e` exits 0 (Linux; without `xvfb-run` on Windows and macOS), every spec ending with a clean console.
5. `npm run fallow:config` leaves `git status` clean (the generated file is current).
6. A throwaway module, added as Task 22 describes, fails the list test, typecheck and `npm run analyze` until it has its two manifests and two shared lines, and passes after; it is then removed.
7. A planted type error in a domain file makes `npm run verify` exit non-zero with `typecheck` as the failing step and the later steps `not run`.
8. `npm run build && npm run release:package` writes `release/<plugin-id>/` with exactly `main.js`, `manifest.json`, `styles.css`, and `release/THIRD-PARTY-NOTICES.txt` beside it.
9. No `TODO`, `FIXME`, skipped or focused test, lint or type suppression without a reason on the same line, scratch file from Task 01, or `// Stryker disable` without a reason.
10. ADR 0001 lists every version, fallback, blocker and override; ADRs 0002 to 0008 and the engineering guides match the code (every path in them exists).

Only a human or a real GitHub repository can confirm these; report them as `not-run`:

- the repository settings of Task 21 (Actions allowed, the `main` ruleset with `CI / verify` required, squash merges) and the proof that a pull request with a planted type error cannot be merged;
- the first run of `release.yml` on a tag, its attestation (`gh attestation verify`), the pre-release flag and installation through BRAT;
- the first run of `nightly-mutation.yml`, a second run that reuses the cached incremental file, and the failure issue;
- the first Dependabot run applying cooldown, groups and ignored majors;
- `CI / e2e` without a flake for about two weeks before it is made required;
- manual checks in a personal vault: keyboard only, a screen reader, Obsidian's zoom, a community theme in light and dark, other plugins, a pop-out window, Windows and macOS for the case-insensitive root folder.
