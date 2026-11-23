# ADR 0006 · Modules inside the layers, English in code

- Status: accepted; public entries of `presentation/shell` and the enforcement amended on 2026-11-21; composition seams and the `application/notes` adapter entry amended on 22.11.2026; the record kit in `notes` and the presentation module `notes` amended on 22.11.2026; the module manifest amended on 2026-11-22 (see the notes at the end)
- Date: 2026-11-21

## Context

The shell has one file per concern in each layer: `ports.ts`, `errors.ts`, `events.ts`, `use-cases.ts`, `user-messages.ts`, the catalogs, `app-services.ts`, `obsidian/layers.ts`, and `domain/settings.ts` as the only domain file. The MVP has 17 entities and 35 stories (18 and 37 when this was decided, before the Gmail skill was removed and mobile moved after the MVP). With a 400-line limit and agents working in parallel, every feature would edit the same files.

The product's words are German (Gemeinschaft, Vorgang, Kürzel). The one file contract shipped at the time, that of the since removed Gmail skill, was English (`community_id`, `review_status: unreviewed`). The owner decided on 2026-11-21: frontmatter keys, value codes and code identifiers are English; German stays in the UI and in `docs/`.

## Decision

- **The four layers stay** (ADR 0002). Each layer is sliced by module: `src/domain/<module>/`, `src/application/<module>/`, `src/infrastructure/obsidian/<module>/`, `src/presentation/<module>/`. Tests mirror this: `tests/unit/<layer>/<module>/`, `tests/dom/<layer>/<module>/`.
- **Three kinds of module**, with one direction of dependency: feature → `notes` → `shell`.

  | Module | Holds |
  | --- | --- |
  | `shell` | What every module needs: settings, logging, defects, diagnostics, the event bus, notices, the UI-language mechanism, the presentation runtime (`useQuery`, `useCommand`, `useStream`), the app frame and navigation (ADR 0008). It imports no other module. |
  | `notes` | Vault data access for all features: the `NoteStore` port, the note codec, the index (ADR 0007). It imports `shell` only. |
  | feature modules | One per entity or closely tied group, named by the English plural of its main entity: `communities` first. |

- **A module's public face is its `index.ts`, one per layer.** Another module imports only from there. A feature module may import another feature module's index when the domain needs it (an item belongs to a community); the imports stay acyclic.
- **What a module owns in each layer:**
  - domain: schemas, rules, issue codes;
  - application: its ports, tagged errors, events, use cases, and its part of the message catalog in German and English;
  - infrastructure: its adapters and the Layer that provides them;
  - presentation: its components and the routes it adds.
- **Shared files only compose.** `AppError`, `AppEvent`, `AppServices`, `Catalog` and the app Layer are built from the modules' parts: `AppError` is the union of the modules' error unions, `Catalog` has one key per module, `describeError` hands each error to its module. Exhaustiveness stays a type error: a module error without a text does not compile.
- **Tools enforce the boundaries.** oxlint and fallow reject an import that reaches into another module past its `index.ts` or against the direction above. The step that introduces the structure proves it with a planted violation.
- **`effect` in presentation stays in the shell's runtime folder.** Feature components get everything through `useQuery`, `useCommand` and `useStream`.
- **English in code.** Types, functions, files, events, log events, frontmatter keys and value codes are English. Texts the user sees are German and English catalog entries. `GLOSSARY.md` at the repository root gives the English term for each German product term; a domain term enters the glossary before it enters code.

## Consequences

- A feature adds a folder per layer and one line in each composing file. Two features rarely touch the same file.
- The first step is mechanical: the existing code becomes module `shell` with no behaviour change.
- ADR 0004 named `PunktErstellt` as a future domain event. Domain events are English too; its example now reads `CommunityCreated`.
- Readers move between German docs and English code. The glossary is the bridge and has to be kept.
- `notes` is a module that features depend on, not a layer. If it grows a second consumer-facing concern, it is split rather than widened.

## Amendment, 2026-11-21: two entries for `presentation/shell`

`presentation/shell` serves two kinds of caller. Feature components need the composables and the shared components, which load Vue. `bootstrap` and the Obsidian adapters run at plugin load, where nothing may load Vue (architecture, *Lazy presentation*). One `index.ts` cannot serve both.

Decision: `presentation/shell` has two public files. `index.ts` is the interface for feature components and may load Vue: `useQuery`, `useCommand`, `useStream`, `useMessages`, `useRoute`, `useNavigate` and shared components such as `ErrorNotice`. `host.ts` is Vue-free and holds what code at plugin load needs: `releaseAll`, `loadSurface` and the types of a surface. Every other module, and every other layer of the shell, keeps the single `index.ts`.

Consequence: ESLint and fallow accept exactly these two files as entries of `presentation/shell`. ESLint also rejects a value import of the Vue-loading `index.ts` from `main.ts`, `bootstrap.ts`, `src/infrastructure/**` and the composition files in `src/presentation/`. A test fails if loading `host.ts` evaluates Vue.

## Amendment, 2026-11-21: ESLint enforces the modules, and what was built

- **Who enforces what.** The decision says oxlint and fallow reject a cross-module import. As built, oxlint keeps the layer rules, ESLint enforces the module boundaries (the index rule, the direction `feature → notes → shell`, no in-memory adapters in `src/`), and fallow checks both with zones. An oxlint override replaces the `no-restricted-imports` options of an earlier matching override, so a module rule there would have switched the layer rule off. Details: [architecture](../engineering/architecture.md#enforcement).
- **`host.ts` also exports `memoryNavigation`.** The Vue-free entry of `presentation/shell` holds `releaseAll`, `loadSurface`, `memoryNavigation` and the surface types, because `ShellView` keeps its own history ([ADR 0008](0008-navigation-and-view-state.md), amendment).
- **Built as decided.** The modules are `shell`, `notes` and `communities`. The root files compose only: `AppError`, `AppEvent`, `AppServices`, `Catalog`, `Route`, `appNoteTypes`, `appLayer` and `appSurface`. The first feature module added no vault adapter and no Layer of its own beyond the community selection.

## Amendment, 22.11.2026: composition seams and a second entry for `application/notes`

An architecture review after the first feature found that each new module had to edit the shell or repeat its wiring in three places, and that the notes module's index handed the `NoteStore` adapters' kit to every feature.

Decision:

- **One service graph.** `appServicesLayer(adapters, options)` (`src/application/app-services-layer.ts`) builds every application service of a load in one place, typed `Layer<AppServices>`. Hosts supply only adapters (`AppAdapters`, one Layer per port): Obsidian through `shellAdapters` and `notesAdapters` in `appLayer`, the harness in `tests/harness/layers.ts`, the tests in `tests/support/adapters.ts`. A feature whose Layer was only an application Layer has no infrastructure folder; `src/infrastructure/obsidian/communities/` is gone.
- **Commands are composed.** `appCommands` (`src/application/commands.ts`) joins the root files: each module contributes `PluginCommand`s (id without the plugin id, a label from its catalog part, an action that opens a typed `Route` or runs a use case), and the shell's `registerCommands` iterates them. A feature command never edits the shell.
- **A second entry for `application/notes`.** `adapter.ts` holds the kit the `NoteStore` adapters build on (`writeCommand`, `createNote`, `asDefect`, `copyFrontmatter`, `recordNotes`, `newNoteText`, `updateNoteText`, `pathsInFolder`, `planRename`). Only `src/infrastructure/**` imports it; features reach the vault through `NoteStore` alone. ESLint refuses `notes/adapter` outside the infrastructure; fallow makes the kit's files a zone of their own whose only public file is `adapter.ts` and which only the adapter zones may import. The kit imports the rest of the module through its `index.ts`. Constants only tests read (`INDEX_BATCH_QUIET`, `INDEX_BATCH_MAX`) left the index; tests import them from their file.

Consequence: the root files are `AppError`, `AppEvent`, `AppServices`, `appServicesLayer`, `Catalog`, `Route`, `appNoteTypes`, `appCommands`, `appLayer` and `appSurface`. Two modules have a second entry, each for one kind of caller: `presentation/shell/host.ts` for code at plugin load, `application/notes/adapter.ts` for the `NoteStore` adapters.

## Amendment, 22.11.2026: the record kit and a presentation module for `notes`

Context: a review after the first feature found that most of `communities` was record handling that every record type repeats: file names from a title, line fields, the edited values a form saves, list rows and their order, finding a record by its id, create, the merge-then-rename update and delete with their notices, the issue describer, the conflict choice, the form's flow, the delete dialog, opening a note in Obsidian and the list of notes of no known type. The second feature would have copied it.

Decision (owner, 22.11.2026):

- **What any record needs belongs to `notes`, in every layer.** The domain holds `recordFileName`, `followsTitle`, `lineOfText`, `trimmedValues` and `editedValues`; a note type may name its `folder`. The application holds the record kit, `defineRecords({ type, title, fallbackName, log, issue?, between? })`, which gives the list (`RecordRow`, `RecordList`), `create`, `update` and `remove`, and `describeRecordIssue` over a feature's `RecordTexts`. The generic texts (notices, conflict, delete dialog, open in Obsidian, data issues) are the notes catalog's, without feature words.
- **`src/presentation/notes/` is a module**, with its `index.ts`, in the direction feature → `notes` → `shell`: `useRecordForm`, `useRecordScreen`, `cardKey`, `ConflictChoice`, `DeleteRecordDialog`, `OpenNoteButton`, and the settings section `DataIssues` with its badge. ESLint already knew `notes` as a core module; fallow lets the presentation rule import `presentation/notes` and gives the zone a rule of its own (`presentation/shell`, `application/notes`, `application/shell`, `application-describe-error`, `domain/notes`, `domain/shell`; the composition as types only).
- **A feature keeps what is its own:** its note type, its rules (for communities: unique short code and colour, the fixed short code, the kinds, the selection), its texts and its layout.

Consequence: a new record type declares its type, its rules and its texts, and gets lists, writes, the form's flow and the conflict UI from `notes`. The modules are `shell`, `notes` and `communities`, now with a `notes` folder in every layer, presentation included.

## Amendment, 2026-11-22: one manifest per module and side, one module list

Context: a new module still registered itself in about twelve shared places (PBI-60): the module lists of ESLint and fallow, seven root files of the application, `app-surface.ts`, the service graph, the harness and the test runtime. Only some of them failed when a line was missing; the navigation entry and the frame parts failed nowhere.

Decision (owner, 22.11.2026):

- **Two manifests per module.** The application side is `src/application/<module>/module.ts`, written with `defineModule` (`src/application/module.ts`) as plain data: `name` (the folder name), `catalog` (`de`, `en`), `errors` (`tags`, one per member of the module's error union, and `describe`), `noteTypes`, `routes` (schemas of its own screens), `sections` (settings section ids with an `order`), `services` (its Layer, built on `shell` and `notes`) and `commands`; a part the module has not is left out. The screens are `src/presentation/<module>/screens.ts`, typed `ModuleScreens<"<module>">`: `screens` (one per route of its manifest; the shell's is the settings screen), `sections` (one part per section id), `menu`, `context`. It loads components only through `import()`, so code at plugin load may import it.
- **One module list.** `APP_MODULES` (`src/application/modules.ts`) lists the application manifests in load order, core modules first. The root files derive from it: `Catalog`, `de`, `en`, `AppError`, `describeError`, `Route`, `SETTINGS_SECTIONS`, `appNoteTypes`, `appCommands`, `AppServices` and the feature modules' part of `appServicesLayer`. `appSurface` takes the screens from a map typed by the module names, so a module of the list without screens does not compile.
- **The tools read the list.** ESLint takes its module list from `APP_MODULES` (`scripts/modules.mjs` parses the file without running it). fallow reads only JSON and has no placeholder, so `configs/fallow.json` is generated from `configs/fallow.config.mjs` and the list (`npm run fallow:config`); `npm run analyze`, a step of the gate, fails while the file is stale.
- **A third entry per presentation module.** `screens.ts` is public for `src/presentation/*.ts` only (ESLint); fallow lists it as a public file of every presentation zone. ESLint refuses a value import of Vue, a `.vue` file or a presentation `index.ts` in it; `tests/dom/lazy-presentation.test.ts` proves it at runtime.
- **Guards gave way to tags.** `isNotesError`, `isCommunitiesError` and their tag sets are gone: `describeError` finds an error's module by the manifests' tags.

Consequence: a new module writes its two manifests and edits two shared places, `APP_MODULES` and the screens map in `app-surface.ts`, then regenerates `configs/fallow.json`. A module with events of its own still adds its record in `src/application/events.ts`; a new port still adds a field to `AppAdapters` and an adapter in each host. Feature services are merged side by side on the core services, so a feature whose service needs another feature's does not compile until the graph orders them. (Changed 2026-11-22, PBI-71: the feature Layers are folded in `APP_MODULES` order, each on the earlier ones, so a feature's service may use an earlier feature's; one that needs a later module's still fails typecheck.)
