# Task 03 · Modules and manifests

Phase A. Needs: Task 02.

**Goal.** The module structure exists before the second concern does (L2): every layer is cut into module folders, a module registers itself with a plain-data manifest, the application lists the manifests once in `APP_MODULES`, and ESLint and fallow read their module lists from that one list (L3, L15). Only the `shell` module exists after this task, and only in the application layer; `notes` comes in Task 13, the tracer in Task 10 (skeleton) and Task 18.

## Files

Create: `src/application/module.ts`, `src/application/modules.ts`, `src/application/shell/{index,module,user-messages}.ts`, `src/application/shell/i18n/{catalog,<language>}.ts` (one file per language of `<languages>`; Task 05 fills them), `scripts/modules.mjs`, `configs/fallow.config.mjs`, `scripts/fallow-config.mjs`, `configs/fallow.json` (generated), `tests/unit/scripts/modules.test.ts`, `tests/unit/scripts/fallow-config.test.ts`, `tests/unit/application/modules.test.ts`, `tests/unit/application/module.test.ts`. Modify: `eslint.config.mjs`, `package.json`, `scripts/verify.mjs` (add `analyze`).

Install (`devDependencies`): `fallow`.

## The rules this task enforces

- **Layers × modules.** Module folders: `src/domain/<module>/`, `src/application/<module>/`, `src/infrastructure/obsidian/<module>/`, `src/infrastructure/memory/<module>/` (in-memory adapters for tests and the harness, Task 13), `src/presentation/<module>/`. A module has a folder only in the layers where it has code; a feature that adds no adapter has no infrastructure folder.
- **Public face.** Outside a module folder, code imports it only through its `index.ts` (`../shell`, never `../shell/ports`), also the same module from another layer. Second entries, each for one kind of caller: `presentation/shell/host.ts` (Vue-free, for plugin-load code, Task 09), `application/notes/adapter.ts` (the `NoteStore` adapters' kit, for `src/infrastructure/**` only, Task 13), and each presentation module's `screens.ts` (for `src/presentation/*.ts` only, Task 10). Tests may import a module's files directly.
- **Direction.** feature → `notes` → `shell`. `shell` imports no other module; `notes` imports only `shell`; features may import each other's index, acyclically (fallow's cycle check).
- **Composition files.** The files at a layer's root only compose module parts: in application `module.ts`, `modules.ts`, `errors.ts` (`AppError`), `events.ts` (`AppEvent`), `app-services.ts`, `app-services-layer.ts`, `messages.ts`, `user-messages.ts` (`describeError`), `routes.ts`, `note-types.ts`, `commands.ts`; in infrastructure `obsidian/app-layer.ts`, `runtime.ts`, `logging/`; in presentation `app-surface.ts`. Each arrives in the task that needs it.
- **Type-only edges to the root.** `EventBus` and `Messages` (shell) carry the composed `AppEvent` and `Catalog`, so `src/application/shell/` imports them from the root as types only; runtime imports go the other way only.

## Steps

- [ ] **1. The manifest shape** (`src/application/module.ts`). Test first in `tests/unit/application/module.test.ts`: two stub manifests give `catalogOf(modules, language)` with one key per module name, and `describerOf(modules)` hands an error to the module whose `tags` name its `_tag`, with that module's part of the catalog. Then write:
  - `type ErrorTags<E extends { _tag: string }> = { readonly [Tag in E["_tag"]]: true }`: typecheck fails while a tag is missing or extra.
  - `type ModuleManifest<…>` with `name` (the folder name in every layer, and the module's key in `Catalog`), `catalog` (one entry per language, one type), and the optional part `errors: { tags, describe(error, messages): UserMessage }`. A part a module does not have is left out. Later tasks add the parts `commands` (Task 05), `services` (Task 06), `routes` and `sections: { id, order }[]` (Task 10), `noteTypes` (Task 16).
  - `defineModule(manifest)`, generic with `const Name` and defaults of `never`, returning the manifest unchanged so every type is inferred.
  - The derivations of this task: `CatalogOf<M>`, `ErrorOf<M>` (the union of the describers' error parameters), `catalogOf`, `describerOf`. Later tasks add `commandsOf` (Task 05), `servicesLayerOf`/`ServicesOf` (Task 06), `sectionsOf`/`SectionOf` and `routeSchemasOf`/`RouteOf` (Task 10), `noteTypesOf` (Task 16). The file imports no module at runtime (types only).
- [ ] **2. The shell's manifest.** `src/application/shell/module.ts`: `export const shellModule = defineModule({ name: "shell", catalog: { … } })`, exported from `src/application/shell/index.ts`. Task 05 adds its errors and commands. `module.ts` needs two shell types now: `Language` (`LANGUAGES = [<languages>] as const` and `type Language = (typeof LANGUAGES)[number]` in `src/application/shell/i18n/catalog.ts`) and `UserMessage` (in `src/application/shell/user-messages.ts`; its shape is in Task 05 step 10). Create both here; the catalog type `ShellCatalog` holds one entry, `language: Language`, which each language file sets to its own code. Task 05 adds the rest.
- [ ] **3. The module list.** `src/application/modules.ts`: `export const APP_MODULES = [shellModule] as const;`, `type AppModule`, `type AppModuleName`. Each element is an identifier imported from `./<module>`; the order is load order with the core modules first.
- [ ] **4. Reading the list without running it** (`scripts/modules.mjs`). Tests first (`tests/unit/scripts/modules.test.ts`): a list text gives its names in order; an element not imported from `./<folder>` fails naming the element; a list that does not start with the core modules fails. Then: `MODULE_LIST = "src/application/modules.ts"`, `CORE_MODULES = ["shell"]` (Task 13 makes it `["shell", "notes"]`), `parseModuleNames(text)` with the `typescript` compiler API (`ts.createSourceFile`, the `APP_MODULES` array literal, each identifier mapped to the folder of its import), and `readModules(text?)` returning `{ all, core, features }`.
- [ ] **5. ESLint module rules** (`eslint.config.mjs`, after the oxlint block, built from `readModules()`; ADR 0006):
  - `pastIndexWith(extra)`: per module, the pattern `(^|/)<module>/(?!(index|<second entry>|<extra>)$)` with the message `Import module <module> only through its index.ts`; second entries `{ shell: "host", notes: "adapter" }`; `pastIndex` is `pastIndexWith([])` plus a pattern refusing `shell/host` outside `presentation/`.
  - For `src/**/*.{ts,vue}`: `pastIndex`, the kit rule (Task 13) and `testOnly` (`(^|/)memory(/|$)`, "the in-memory adapters are for tests and the harness only"); for `src/infrastructure/**/*.ts` the same with the infrastructure's kit rule; for `src/presentation/*.ts` `pastIndexWith(["screens"])`.
  - `vueFreeAtLoad(files, regex)` with `@typescript-eslint/no-restricted-imports` and `allowTypeImports: true`: on `src/main.ts`, `src/bootstrap.ts`, `src/infrastructure/**/*.ts` against `presentation/<module>(/index)?`; on `src/presentation/*.ts` against `./<module>(/index)?`; on `src/presentation/*/screens.ts` against `vue`, `@vue/*`, `@nuxt/*`, `@tanstack/*`, `*.vue`, `./index` and `../<module>(/index)?` (global constraint 5).
  - For each core module, blocks over its folders that refuse every module listed after it (`Module shell never imports notes: feature → notes → shell`).
  Adding a module never edits this file. ESLint accepts a block whose `files` match nothing yet, so the whole file is written now.
- [ ] **6. The fallow template** (`configs/fallow.config.mjs`, exports `fallowConfig({ modules, has })`, where `has(folder, module)` says whether `src/<folder>/<module>/` exists). fallow reads only JSON and knows no placeholder for "every module" (L15), so this JS file is the template and `configs/fallow.json` is generated from it. Contents:
  - `$schema` (`../node_modules/fallow/schema.json`), `entry` (empty until Task 11 adds `harness/main.ts`), `supportEntry` for `scripts/*.mjs`, `tests/**/*.test.ts`, `tests/e2e/**/*.ts`, `tests/e2e/wdio.conf.mts`, `configs/*.ts`, `configs/*.mjs`, `*.config.mjs`; `ignorePatterns` as oxlint's; `duplicates: { minTokens: 50 }`; `health: { maxCyclomatic: 10 }`. fallow takes `src/main.ts` as an entry by itself (`npx fallow dead-code -c configs/fallow.json --trace src/main.ts:default` shows it), and a file that a test imports counts as used.
  - **Zones** (`boundaries.zones`), in this order, because a file belongs to the first zone that matches it. *Discovered* zones (`autoDiscover`) make one zone `<zone>/<module>` per subfolder; *pattern* zones match files.

    | Zone | Kind | Matches | Public files | From |
    | --- | --- | --- | --- | --- |
    | `domain` | discovered | `src/domain` | `index.ts` | Task 05 |
    | `application/notes-adapter` | pattern | `src/application/notes/{adapter,command,frontmatter,note-text,paths}.ts` | `src/application/notes/adapter.ts` | Task 13 |
    | `application` | discovered | `src/application` | `index.ts` | Task 03 |
    | `application-module` | pattern | `src/application/module.ts` | | Task 03 |
    | `application-describe-error` | pattern | `src/application/user-messages.ts` (`presentation/shell` calls it at runtime, while it may import the other root files only as types) | | Task 05 |
    | `application-composition` | pattern | `src/application/**` | | Task 03 |
    | `adapters` | discovered | `src/infrastructure/obsidian` | `index.ts` | Task 06 |
    | `memory` | discovered | `src/infrastructure/memory` | `index.ts` | Task 13 |
    | `infrastructure` | pattern | `src/infrastructure/**` | | Task 06 |
    | `presentation/shell` | pattern | `src/presentation/shell/**` | `index.ts`, `host.ts`, `screens.ts` of that folder | Task 09 |
    | `presentation` | discovered | `src/presentation` | `index.ts`, `screens.ts` | Task 09 |
    | `presentation-composition` | pattern | `src/presentation/**` | | Task 09 |
    | `composition` | pattern | `src/main.ts`, `src/bootstrap.ts` | | Task 07 |

  - **Rules** (`boundaries.rules`). A discovered zone may import a sibling zone only if a rule names it, and a rule cannot name its own group as a whole, so each layer rule lists `<layer>/<module>` for every module that has a folder in that layer: `siblings(folders, zone, folder)` returns those names. `allowTypeOnly` allows imports of types only.

    | From | Allow | Allow type only |
    | --- | --- | --- |
    | `domain` | `siblings(…, "domain", "domain")` | |
    | `application` | `domain`, `siblings(…, "application", "application")`, `application-module`, `application-composition` | |
    | `application-module` | (nothing) | `application/shell`, `application/notes` |
    | `application-describe-error` | `application`, `application-module`, `application-composition` | |
    | `application-composition` | `domain`, `application`, `application-module` | |
    | `adapters` | `siblings(…, "adapters", "infrastructure/obsidian")`, `infrastructure`, `application`, `application/notes-adapter`, `application-composition`, `domain`, `presentation/shell` | |
    | `infrastructure` | `adapters`, `application`, `application-composition`, `domain` | |
    | `memory` | `application`, `application/notes-adapter`, `application-composition`, `domain` | |
    | `presentation` | `siblings(…, "presentation", "presentation")`, `application`, `application-composition`, `application-describe-error`, `domain` | |
    | `presentation-composition` | `presentation`, `application`, `application-composition`, `domain` | |
    | `composition` | `infrastructure`, `adapters`, `application`, `application-composition`, `domain`, `presentation`, `presentation-composition` | |
    | `domain/shell` | (nothing) | |
    | `domain/notes` | `domain/shell` | |
    | `application/shell` | `domain/shell`, `application-module` | `application-composition` |
    | `application/notes` | `domain/shell`, `domain/notes`, `application/shell`, `application-module` | `application-composition` |
    | `application/notes-adapter` | `domain/shell`, `domain/notes`, `application/shell`, `application/notes` | |
    | `adapters/shell` | `infrastructure`, `application/shell`, `application-composition`, `domain/shell`, `presentation/shell` | |
    | `adapters/notes` | `adapters/shell`, `infrastructure`, `application/shell`, `application/notes`, `application/notes-adapter`, `domain/shell`, `domain/notes`, `presentation/shell` | `application-composition` |
    | `presentation/shell` | `application/shell`, `application-describe-error`, `domain/shell` | `application-composition` |
    | `presentation/notes` (Task 17) | `presentation/shell`, `application/shell`, `application/notes`, `application-describe-error`, `domain/shell`, `domain/notes` | `application-composition` |

    **Each zone and each name enters with its folder.** fallow refuses a rule that names a discovered zone whose folder does not exist (`references undefined zone '<name>'`), while a pattern zone that matches no file is accepted. So write a zone when the task in its *From* column has created its folder, a rule when its `From` zone exists, and a name in `Allow` or `Allow type only` once that zone exists; `siblings` already leaves out a module without a folder. In this task that is the zones `application`, `application-module`, `application-composition` and the rules `application` (without `domain`), `application-module` (type only `application/shell`), `application-composition` (without `domain`) and `application/shell` (`application-module`, type only `application-composition`). Every later task that creates such a folder adds its rows here and runs `npm run fallow:config`.
  - `boundaries.coverage`: `requireAllFiles: true` with `allowUnmatched` for `src/env.d.ts`, `src/styles/**`, `tests/**`, `scripts/**`, `harness/**`, `configs/**`, `*.mjs`.
  - `ignoreDependencies` for packages used only by a CLI or a config fallow cannot see: now `obsidian` and `@eslint/js` (Task 02); later `@iconify-json/lucide` (Task 08) and `wdio-obsidian-reporter`, `@wdio/local-runner`, `@wdio/mocha-framework` (Task 12), each with the task that installs it. `overrides: [{ files: ["tests/support/obsidian/**"], rules: { "unused-class-members": "off" } }]` (the double mirrors Obsidian's API, Task 04).
- [ ] **7. The generator** (`scripts/fallow-config.mjs`). Tests first (`tests/unit/scripts/fallow-config.test.ts`): the same module list and folders give the same text; a module without a folder in a layer is left out of that layer's rule; `--check` returns the message `configs/fallow.json does not match the module list: run \`npm run fallow:config\`.` for a stale file and nothing for a current one. Then `fallowJson({ modules, has })` formats `JSON.stringify(fallowConfig(…))` with Prettier's options for the target file, and `syncFallowJson({ check })` writes or compares. Scripts: `fallow:config`: `node scripts/fallow-config.mjs`; `analyze`: `node scripts/fallow-config.mjs --check && fallow -c configs/fallow.json && fallow architecture -c configs/fallow.json` (always `-c`: fallow does not discover a config named `fallow.json` by itself). Run `npm run fallow:config` and commit the generated file. Add `analyze` to `SERIAL` in `scripts/verify.mjs`, after `test:coverage`.
- [ ] **8. The list test** (`tests/unit/application/modules.test.ts`): every folder in `src/{domain,application,infrastructure/obsidian,infrastructure/memory,presentation}` is a name in `APP_MODULES`; every listed module has `src/application/<name>/module.ts` and (from Task 10) `src/presentation/<name>/screens.ts`; `readModules().all` equals the manifests' names, each once; no error tag and no section id belongs to two modules; `keyof Catalog` equals `AppModuleName` (`expectTypeOf`, once `messages.ts` exists in Task 05).

## Discriminating checks

| Plant | Fails |
| --- | --- |
| `src/application/extras/index.ts` (a folder the list does not name) | `tests/unit/application/modules.test.ts` |
| `src/application/_m/index.ts` importing `../shell/user-messages` (past the index) | ESLint and `npm run analyze` |
| hand-edit `configs/fallow.json` | `npm run analyze` stops with the staleness message |
| `src/application/_x.ts` outside any module (unmatched file) | `npm run analyze` (`requireAllFiles`) |

## Done when

`npm run verify` exits 0 with `analyze` in its summary; every plant above was seen to fail and is deleted. Commit `refactor: module manifest and generated module rules`.

Untested proposal: the module rules and the fallow zones written while only `shell` exists, and grown row by row with the folders. If fallow or ESLint refuses a rule list in a state this plan passes through (an empty `allow`, a zone that matches no file yet), leave that row out until the next task that creates a folder and note it in that task's commit message.
