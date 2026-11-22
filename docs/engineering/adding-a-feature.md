# Adding a feature

The tracer slice, module `communities`, is the worked example: the first record type through every layer (PBI-56). Since the record kit moved to `notes` (ADR 0006, amendment 22.11.2026), a feature supplies its note type, its rules, its texts and its layout; lists, writes, the form's flow, the conflict UI and the delete dialog come from `notes`. A new feature follows the same steps in the same order. Each step names the real files of the slice and the test that comes **first**: write it, see it fail, then implement. How the pieces fit is in [architecture.md](architecture.md); how to run the tests is in [testing.md](testing.md).

A feature is a module: one folder per layer, each with an `index.ts` (see [Modules](architecture.md#modules)). It imports `notes` and `shell` only through their indexes; `shell` and `notes` never import it.

The shared files only compose. A new module adds one line to each of these. Typecheck fails until it adds the lines marked *typecheck*, as soon as the module's code uses the part (a use case that needs its services, an error, a text, an event, a route); a unit test fails until it adds the note types; nothing fails for a missing navigation entry, frame part or command, which only does not show:

| File | Line | Enforced by |
| --- | --- | --- |
| `src/application/app-services.ts` | its services in `AppServices` | typecheck |
| `src/application/errors.ts` and `user-messages.ts` | its errors in `AppError`, its describer in `describeError` | typecheck |
| `src/application/messages.ts` | its part of `Catalog`, in `de` and `en` | typecheck |
| `src/application/events.ts` | its event record, when it has events | typecheck |
| `src/application/routes.ts` | its route schema in `Route`, when it has a screen of its own | typecheck |
| `src/application/routes.ts` | its settings section id in `SETTINGS_SECTIONS`, when it has a settings area | typecheck (`appSurface`'s `sections` is typed by `SettingsSection`, so the id needs a part there); `tests/unit/application/routes.test.ts` pins the list and decodes each section |
| `src/application/note-types.ts` | its note types in `appNoteTypes` | `tests/unit/application/note-types.test.ts`: every note type a domain `index.ts` exports must be registered once; the test lists the domain indexes and fails until the new folder is in `DOMAIN_INDEXES` |
| `src/application/commands.ts` | its commands in `appCommands` (from the module's application index): id without the plugin id, label from its catalog part, and an action that opens a `Route` or runs a use case | typecheck for the label (a catalog key) and the route (a `Route`); `tests/unit/application/commands.test.ts`: every id once, kebab-case, without the plugin id, a label in both languages; a command left out is not checked |
| `src/application/app-services-layer.ts` | its services' Layer in `appServicesLayer`, after the modules it needs; a new port's adapter as a field of `AppAdapters` | typecheck (`appServicesLayer` must be a `Layer<AppServices>`; the plugin's `appLayer`, `harness/layers.ts` and `tests/support/adapters.ts` must each supply every field of `AppAdapters`) |
| `src/presentation/app-surface.ts` | its screens, navigation entry and frame parts | typecheck for the screens (one per `Route` name); the navigation entry and the frame parts are not checked |
| `src/presentation/app-surface.ts` | its settings section's part in `sections`: `label` from its catalog part, the lazy `component`, an optional `badge` | typecheck: one part per `SettingsSection`, none for an id no module has; `tests/dom/presentation/notes/data-issues.test.ts` shows the app's navigation of every section |

Inside the module, its error union and the tag record its type guard reads (`COMMUNITIES_ERROR_TAG_KEYS` in `src/application/communities/errors.ts`) must name the same errors; typecheck fails while the record misses one or has one too many.

## 0. Words and contract

- Put each new domain term into `GLOSSARY.md` before it enters code: English in code, German in the UI and in `docs/` (ADR 0006). The slice uses *community*, *short code*, *kind*, *unit label* and *community selection*, and added *colour*, *community switch*, *conflict* and *read-only*.
- Register the module in `FEATURE_MODULES` in `eslint.config.mjs`. Its folders become fallow zones by themselves and fall under the layer rules (`domain`, `application`, `adapters`, `presentation`) of `configs/fallow.json`, so the module may import `shell`, `notes` and every feature listed there. For other features to import it, add `<layer>/<module>` to the `allow` list of each of those layer rules where the module has a folder, next to `<layer>/communities`: fallow does not let a discovered zone import a sibling the rule does not name, and it has no wildcard for that. fallow refuses a rule that names a zone with no folder yet, so add each entry with the first file of that folder. fallow's cycle check keeps imports between features acyclic.
- Write the file contract page with the note type: one German page per type and version in `docs/contracts/` (`DV-01 - Gemeinschaft v1.md`), in the manner described in [docs/README_DOCS.md](../README_DOCS.md).

## 1. Domain: the note type and the rules

Folder `src/domain/communities/`. Pure functions and Effect Schema; no services, no language, issue codes instead of sentences. What every record needs is in `src/domain/notes` already: field kinds and `lineOfText`, `recordFileName` and `followsTitle` for the file name, `trimmedValues` and `editedValues` for what a form saves. A feature declares only what is its own.

1. **The note type** (`community-type.ts`). `defineNoteType` from `src/domain/notes` with the type name, the version, the folder below the root folder where new notes go (German, part of the contract), the fields in file order and the migrations:

   ```ts
   export const communityType = defineNoteType({
     type: "community",
     version: 1,
     folder: "Gemeinschaften",
     fields: {
       name: required(text({ schema: lineOfText(NAME_MAX_LENGTH), issue: "name.invalid" })),
       short_code: required(
         text({ schema: Schema.String.check(Schema.isPattern(SHORT_CODE_PATTERN)), issue: "short-code.invalid" }),
       ),
       color: required(text({ schema: Schema.Literals(COMMUNITY_COLORS), issue: "color.unknown" })),
       kind: required(text({ schema: lineOfText(LABEL_MAX_LENGTH), issue: "kind.invalid" })),
       unit_label: required(text({ schema: lineOfText(LABEL_MAX_LENGTH), issue: "unit-label.invalid" })),
     },
     migrations: {},
   });
   ```

   The key union is `(typeof communityType.keys)[number]`; no hand-written copy of the keys. First test: `tests/unit/domain/communities/community-type.test.ts`, with the exact outcome of a valid note, a missing field, each broken field and a newer version.
2. **The rules** (`rules.ts`, `kinds.ts`, `selection.ts`). One function per rule, over plain values: `communityValues(input)` (`trimmedValues`, the short code upper-case); `validateCommunity(input, { others, loaded })` checks the field rules through the codec's `check` and adds `short-code.taken` and `color.taken`; `duplicateShortCodes`, `colorOwners`, `firstFreeColor`, `kindSuggestions`, `selectedCommunity`. The form's validators and the use cases call the same function, so a rule lives in one place. `CommunityFieldIssue` is the schema of the module's issues (`key`, `code`, and the data a sentence needs). First tests: `rules.test.ts`, `kinds-and-selection.test.ts`.
3. A capability every feature needs belongs to `notes` or `shell`, not to the feature, with its tests on a small fixture type (`tests/unit/domain/notes/form.test.ts`, `file-name.test.ts`).

## 2. Application: records, use cases, selection, texts

Folder `src/application/communities/`. Test fixture: `tests/support/communities/fixture.ts` builds the module over the note index, the in-memory `NoteStore`, a sequential id generator and an in-memory device store; its specs run under `TestClock`, and `indexed` moves the clock past one index batch. The notes module's record kit is tested on its own sample type (`tests/support/notes/record-fixture.ts`).

1. **Register the type** in `src/application/note-types.ts`: `export const appNoteTypes: NoteTypeRegistry = [communityType];`. The index then holds its notes. First test: `tests/unit/application/note-types.test.ts`.
2. **Declare the records** (`list.ts`). `defineRecords` from the notes module turns the type into everything a record needs, from what only the feature knows:

   ```ts
   export const communityRecords = defineRecords({
     type: communityType,
     title: "name", // names the file, orders the list, words the notices
     fallbackName: (values) => values.short_code, // the file name when the name has nothing usable
     log: "communities", // communities.rename.failed
     issue: withColourText, // the codec's issue with the data its sentence needs
     between: markDuplicateShortCodes, // issues between records, over the sorted rows
   });
   ```

   It gives `list` and `changes` (the pair `useStream` follows: `RecordRow`s with path, file name, id, values, issues and frontmatter, sorted by title with German collation and numbers by value), `toList`, `shownName`, and `create(values)`, `update(row, values)` and `remove(row)`: the note in `<rootFolder>/<folder>/` named by `recordFileName`; the per-field merge inside the atomic write, then the rename while the file still follows the title, as one uninterruptible command; the trash; a note renamed meanwhile found by its id, a duplicated id refused; each write confirmed by a notice. First tests: the kit's in `tests/unit/application/notes/record-list.test.ts`, `record-writes.test.ts` and `record-update.test.ts`; the feature's `list.test.ts` for its own additions.
3. **Use cases** (`use-cases.ts`): the feature's rules, then the kit. `createCommunity(input)` checks `validateCommunity` against the list and hands the values to `communityRecords.create`; `updateCommunity(community, input)` keeps a fixed short code, checks the rules and hands `editedValues(communityType, input, communityValues(input), community.frontmatter)` to `communityRecords.update`; `deleteCommunity` is `communityRecords.remove`. First tests: `create-delete.test.ts` and `update.test.ts`, with the rules' refusals and the module's wiring (folder, frontmatter, rename by name, log event).
4. **A shared value** (`selection.ts`). The community selection is a service with a current value and a stream (`SubscriptionRef`), like the settings. It follows the index, applies `selectedCommunity` and stores the choice through the shell's `DeviceStore`. Its Layer (`communitySelectionLayer`) joins `appServicesLayer` in `src/application/app-services-layer.ts`, built on the notes module's services (step 3). First test: `selection.test.ts`.
5. **Errors** (`errors.ts`, `user-messages.ts`). `InvalidCommunityError { issues }`, a `Schema.TaggedError`, with `COMMUNITIES_ERROR_TAGS` and the guard `isCommunitiesError`; the module's union joins `AppError` and its describer joins `describeError`. See [error-handling.md](error-handling.md).
6. **Texts** (`i18n/catalog.ts`, `de.ts`, `en.ts`, `describe.ts`). The module's part of `Catalog`, typed, German in du-form and English in sentence case, cause then action: its labels (`fields`), what a missing field asks for (`missing`) and one sentence per code of its own (`issues: IssueSentences<CommunityFieldIssue>`), which together are the `RecordTexts` that `describeRecordIssue` words its issues with; `describeCommunityIssue` is that one line. Texts every record shares (notices, the conflict, the delete dialog, "In Obsidian öffnen") are the notes catalog's. First test: `i18n.test.ts`, which pins every text in both languages.
7. **The route** (`routes.ts`). A settings area is a section of the shell's settings screen: the module exports its id (`COMMUNITIES_SECTION`), and `src/application/routes.ts` adds it to `SETTINGS_SECTIONS`. A screen of its own would be a route schema that joins `Route` there, which also sets the start route.
8. **Commands**, when the feature has any (the slice has none). The module exports a list of `PluginCommand`s from its application index, e.g. `{ id: "new-matter", name: (messages) => messages.matters.commands.newMatter, action: { _tag: "open", route: NEW_MATTER } }` or `{ _tag: "run", effect: useCase }` for a use case that handles its expected failures itself; `src/application/commands.ts` spreads it into `appCommands`. Never a hotkey, never the plugin id in `id`, never an edit of the shell's `registerCommands`. First test: `tests/unit/application/commands.test.ts` with the new ids and labels.

Mutation testing covers `src/domain` and `src/application`; the slice's score is 100 %, keep it there. Run Stryker on the module's files only (see [testing.md](testing.md#mutation-testing)).

## 3. Composition: services and adapters

A feature adds no vault adapter: notes go through the notes module's `NoteStore`, so `communities` has no infrastructure folder. Its application service joins the one service graph, `appServicesLayer` (`src/application/app-services-layer.ts`), on the notes module's services:

```ts
const features = communitySelectionLayer.pipe(Layer.provideMerge(notes));
return adapters.hostEvents.pipe(Layer.provideMerge(features));
```

- **A new application service** is one line there, built on what it needs; nothing else changes. The plugin, the harness and the tests get it at once.
- **A new port** is a field of `AppAdapters` in the same file, merged into the graph where its service needs it, plus one adapter in each host: Obsidian's in the module's folder of `src/infrastructure/obsidian/<module>/`, spread into `appLayer` (`src/infrastructure/obsidian/app-layer.ts`, as `shellAdapters` and `notesAdapters` are); the harness's in `harness/layers.ts`; the tests' in `tests/support/adapters.ts` (`testAdapters`, in-memory adapters from `src/infrastructure/memory/`, never imported by `src/`). Typecheck fails at each until it supplies the field. `noteOpener` (`NoteOpener`) is one: `notesAdapters` gives Obsidian's, the harness and `testAdapters` the in-memory store's `opener`.

Test: `tests/unit/application/app-services-layer.test.ts` (the graph's order, the note types, the language, the log level); `tests/dom/infrastructure/runtime.test.ts` runs `createCommunity` against the Obsidian adapters on the double.

## 4. Presentation: section, form, switch

Folder `src/presentation/communities/`. Components import the shell only from `src/presentation/shell/index.ts` and the notes module only from `src/presentation/notes/index.ts`, never `effect`; they run use cases through `useQuery`, `useCommand` and `useStream`, and take texts from `useMessages()`. The notes module holds what every record screen shares, so the feature writes its layout and its rules. Test helper: `tests/support/communities/screen.ts` mounts the app on a section of the settings screen over the in-memory store (`openSettings`, `openCommunities`).

1. **The section** (`CommunitySettings.vue`): follows `communityListChanges` with `useStream` and hands the list to `useRecordScreen({ type, list, root })` from the notes module, which gives the folder for the intro, loading (after 300 ms), the index's failure with a retry, the empty state, and the sheet and the delete dialog with their modal props and the focus after them (`useFocusAfter`: cards marked `data-card-key` with `cardKey`, the elements that take the focus marked `data-focus="edit" | "remove" | "name" | "add"`). The layout is the module's: header, the cards (`CommunityCard.vue`, `CommunityBadge.vue`), the sheet. First test: `tests/dom/presentation/communities/screen.test.ts`.
2. **The form** (`CommunityForm.vue`, rules in `use-community-form.ts`): `useRecordForm({ type, record, initial, create, update, invalid, rules, describe, labels, summary, root, done })` holds TanStack Form and the flow (validators that call `rules`, the use case's issues at their fields, the `role="alert"` summary and the focus on the first invalid field, the note's own issue until the field changes, a conflict and the save against the note's current values, Save `aria-disabled` while blocked, never `disabled`). The feature supplies its rules (`validateCommunity` against the others, the fixed short code), its start values (the first free colour), the kind suggestions, and the markup; `ConflictChoice` from the notes module shows the conflict with the form's `label`. First tests: `create.test.ts`, `edit.test.ts`.
3. **Delete** (`DeleteRecordDialog` from the notes module): a `UModal` that asks first and runs the feature's `deleteCommunity` as a command; its title is the feature's ("Gemeinschaft löschen"), the rest the notes catalog's. **The switch** (`CommunitySwitch.vue`, its options a `radiogroup` in `CommunityOptions.vue`) fills the frame's context area. First tests: `delete.test.ts`, `switch.test.ts`.
4. **Sheets and dialogs** are modal through `useModal(open, afterClose)` from the shell (`useRecordScreen` does it for the record sheet and dialog): `aria-modal`, the frame `inert`, the initial focus on the element marked `data-autofocus`, and `afterClose` deciding where the focus goes. First test: `focus.test.ts`.
5. **Compose**: `index.ts` offers `communitiesSettings` (the section) and `communitiesFrame`; `src/presentation/app-surface.ts` adds the section's part to `sections` (`label` from the catalog, the lazy `component`, an optional `badge`), adds the navigation entry and loads the context area, all through lazy `import()`. A feature with a screen of its own maps its route name in `screens` instead.
6. **CSS ownership**: Tailwind classes carry `wm:`; Nuxt UI components are imported from `@nuxt/ui/components/*.vue`; a new one (`Slideover`) goes into the `@source` lists of `src/styles/app.css`, a new icon into `SHELL_ICONS` (`configs/vite.shared.ts`). Colours the feature owns are CSS custom properties per theme in its own stylesheet (`src/styles/communities.css`), and colour never carries meaning alone.

### Checklist for a new view

Each item needs a passing test. The slice's screen is the start route, so the shell's tests cover it:

- [ ] Disable → enable → disable in one session, and unload while load is pending: nothing leaks, and the second load behaves like the first (`tests/dom/lifecycle.test.ts`, `tests/e2e/specs/lifecycle.e2e.ts`).
- [ ] `data.json` missing, corrupt, partially invalid, or from a newer version: the plugin still loads, invalid fields fall back one by one, and a read-only file is never written (`tests/dom/external-settings.test.ts`, `external-settings.e2e.ts`, `settings-and-theme.e2e.ts`).
- [ ] A host theme switch while the view is open: the view follows it without reopening (`tests/dom/presentation/shell/theme.test.ts`, `settings-and-theme.e2e.ts`).
- [ ] The view in a pop-out window: its app, portals and theme binding live in the leaf's `ownerDocument` (`tests/dom/presentation/shell/mount.test.ts`, `popout.e2e.ts` with the form's sheet).
- [ ] Two views open, one closed: the other keeps working (`mount.test.ts`, `lifecycle.e2e.ts`, `community-selection.e2e.ts`).
- [ ] Keyboard and screen reader: no control turns `disabled` while it may hold the focus (`aria-disabled` instead); a sheet or dialog goes through `useModal` and puts the focus somewhere useful when it closes; a failure is announced (`role="alert"`) or takes the focus; a required field says `aria-required` (`tests/dom/presentation/communities/focus.test.ts`, `communities-focus.e2e.ts`).

A view with routes also restores its route from the view state, falls back to the start route for a broken one, and keeps its own route beside a second view (`tests/dom/infrastructure/shell/view-state.test.ts`, `navigation.e2e.ts`).

## 5. End to end in Obsidian

One spec per behaviour in `tests/e2e/specs/`, with helpers in `tests/e2e/communities.ts`: create, edit and delete with the note's exact file text, folder, file name and trash (`communities-crud.e2e.ts`); an outside edit while the form is open (`communities-outside-edit.e2e.ts`); a newer schema version (`communities-newer-schema.e2e.ts`); notes that break the contract (`communities-invalid.e2e.ts`); the selection and its persistence across a restart (`community-selection.e2e.ts`); focus and modality (`communities-focus.e2e.ts`). Each ends with a clean console. See [testing.md](testing.md#end-to-end-tests-in-obsidian).

## 6. Harness

Make the new states reachable through `?scenario=` in `harness/layers.ts`: `loaded`, `empty`, `invalid`, `readonly`, `failure`. Test: `tests/unit/harness-layers.test.ts`.

## 7. Gate

`npm run verify` exits 0, and `xvfb-run -a npm run test:e2e` passes. Before pushing a change to domain or application, run Stryker on the files you changed.

## Reference: the notes module

What a feature author needs when it reads or writes notes. The mechanics are in [Vault notes](architecture.md#vault-notes).

- **Records** go through the record kit, `defineRecords({ type, title, fallbackName, log, issue?, between? })` (`src/application/notes/record-kit.ts`): the list, `create`, `update`, `remove`, `shownName`. Call `NoteStore` directly only for what the kit does not do.

- **Writing** goes through `NoteStore` only (`src/application/notes/ports.ts`); its Obsidian adapter is the only code that changes vault files. Writes are commands: run them through `useCommand`. A body change needs a contract section first (ADR 0007).
- **Create** with `create({ folder, name, frontmatter })`, the frontmatter from `newRecordFrontmatter(type, values)`. A taken name gets ` (2)`, also in another case or Unicode form.
- **Save a form** with `update(path, editChange(type, loaded, edited))`. It fails with `NoteEditConflictError` (each field's `base`, `edited` and `current`) or `NoteWriteRefusedError`, and then writes nothing. After a conflict, save again with the conflicting fields of `loaded` replaced by their `current` values, as `CommunityForm.vue` does.
- **Rename** with `rename(path, newName)`; a taken name is `NotePathTakenError`. **Delete** with `trash(path)`.
- **Read lists from the index**, not with `list`: `noteSnapshot(type)` and `noteChanges(type)`. After a write the view follows by itself, about 100 ms later; use a write's result only for the form that wrote it.
- **Notes with problems** are shown, never repaired silently: a `read-only` record has no save; an `editable` one may have field issues, which the form marks by `key` and saving repairs. Unindexed notes come from `unindexedSnapshot` and `unindexedChanges`, worded by `describeUnindexedIssue`; the notes module shows them in the settings section "Datenprobleme".
- **Never** call `vault.modify`, `vault.adapter`, or `read` followed by a write, and never scan the vault in a hot path.
