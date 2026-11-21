# Adding a feature

The tracer slice, module `communities`, is the worked example: the first record type through every layer (PBI-56). A new feature follows the same steps in the same order. Each step names the real files of the slice and the test that comes **first**: write it, see it fail, then implement. How the pieces fit is in [architecture.md](architecture.md); how to run the tests is in [testing.md](testing.md).

A feature is a module: one folder per layer, each with an `index.ts` (see [Modules](architecture.md#modules)). It imports `notes` and `shell` only through their indexes; `shell` and `notes` never import it.

The shared files only compose. A new module adds one line to each of these, and typecheck fails until it does:

| File | Line |
| --- | --- |
| `src/application/app-services.ts` | its services in `AppServices` |
| `src/application/errors.ts` and `user-messages.ts` | its errors in `AppError`, its describer in `describeError` |
| `src/application/messages.ts` | its part of `Catalog`, in `de` and `en` |
| `src/application/events.ts` | its event record, when it has events |
| `src/application/routes.ts` | its route schema in `Route` |
| `src/application/note-types.ts` | its note types in `appNoteTypes` |
| `src/infrastructure/obsidian/app-layer.ts` | its Layer in `appLayer` |
| `src/presentation/app-surface.ts` | its screens, navigation entry and frame parts |

## 0. Words and contract

- Put each new domain term into `GLOSSARY.md` before it enters code: English in code, German in the UI and in `docs/` (ADR 0006). The slice uses *community*, *short code*, *kind*, *unit label* and *community selection*, and added *colour*, *community switch*, *conflict* and *read-only*.
- Register the module in `FEATURE_MODULES` in `eslint.config.mjs`. Its folders become fallow zones by themselves. If another module will import it, add it to the `allow` lists of the layer rules in `configs/fallow.json` too, next to `<layer>/shell`; fallow refuses a rule that names a zone with no folder yet, so add each entry with the first file of that folder.
- Write the file contract page with the note type: one German page per type and version in `docs/contracts/` (`DV-01 - Gemeinschaft v1.md`), in the manner described in [docs/README_DOCS.md](../README_DOCS.md).

## 1. Domain: the note type and the rules

Folder `src/domain/communities/`. Pure functions and Effect Schema; no services, no language, issue codes instead of sentences.

1. **The note type** (`community-type.ts`). `defineNoteType` from `src/domain/notes` with the type name, the version, the fields in file order and the migrations:

   ```ts
   export const communityType = defineNoteType({
     type: "community",
     version: 1,
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

   First test: `tests/unit/domain/communities/community-type.test.ts`, with the exact outcome of a valid note, a missing field, each broken field and a newer version.
2. **The rules** (`rules.ts`, `file-name.ts`, `kinds.ts`, `selection.ts`). One function per rule, over plain values: `validateCommunity(input, { others, loaded })` checks the field rules through the codec's `check` and adds `short-code.taken` and `color.taken`; `duplicateShortCodes`, `colorsInUse`, `communityFileName`, `followsName`, `kindSuggestions`, `selectedCommunity`. The form's validators and the use cases call the same function, so a rule lives in one place. First tests: `rules.test.ts`, `file-name.test.ts` (with a property test that every file name passes `noteNameIssue`), `kinds-and-selection.test.ts`.
3. A capability every feature needs belongs to `notes` or `shell`, not to the feature. The slice added `check` to `defineNoteType` (`src/domain/notes/codec.ts`, test `tests/unit/domain/notes/check.test.ts`): form values against a type's field rules.

## 2. Application: list, use cases, selection, texts

Folder `src/application/communities/`. Test fixture: `tests/support/communities/fixture.ts` builds the module over the note index, the in-memory `NoteStore`, a sequential id generator and an in-memory device store; its specs run under `TestClock`, and `indexed` moves the clock past one index batch.

1. **Register the type** in `src/application/note-types.ts`: `export const appNoteTypes: NoteTypeRegistry = [communityType];`. The index then holds its notes. First test: `tests/unit/application/note-types.test.ts`.
2. **Read the records** (`list.ts`). `toCommunityList` turns the index's snapshot into what the views show: each note with its path, file name, id, valid values, issues and frontmatter, sorted by name, plus `short-code.duplicate` on every community whose code another one has. `communityList` and `communityListChanges` (`use-cases.ts`) are the pair `useStream` follows. First test: `tests/unit/application/communities/list.test.ts`.
3. **Write through `NoteStore`** (`use-cases.ts`). Each use case checks its rule against the current list, then writes:
   - `createCommunity(input)`: `newRecordFrontmatter` and `NoteStore.create` into `<rootFolder>/Gemeinschaften/`, named by `communityFileName`.
   - `updateCommunity(community, input)`: `NoteStore.update(path, editChange(type, loaded, values))`, so the per-field merge runs inside the atomic write; then the file follows the name. A note renamed meanwhile is found by its id.
   - `deleteCommunity(community)`: `NoteStore.trash`.

   First tests: `create-delete.test.ts` and `update.test.ts`, with the note's exact frontmatter, the merge, the conflict, the refusal and a note that is gone.
4. **A shared value** (`selection.ts`). The community selection is a service with a current value and a stream (`SubscriptionRef`), like the settings. It follows the index, applies `selectedCommunity` and stores the choice through the shell's `DeviceStore`. Its Layer joins `appLayer` through the module's infrastructure folder (step 3). First test: `selection.test.ts`.
5. **Errors** (`errors.ts`, `user-messages.ts`). `InvalidCommunityError { issues }`, a `Schema.TaggedError`, with `COMMUNITIES_ERROR_TAGS` and the guard `isCommunitiesError`; the module's union joins `AppError` and its describer joins `describeError`. See [error-handling.md](error-handling.md).
6. **Texts** (`i18n/catalog.ts`, `de.ts`, `en.ts`, `describe.ts`). The module's part of `Catalog`, typed, German in du-form and English in sentence case, cause then action. `describeCommunityIssue` words the module's codes with the field's label and hands the shared ones to the notes catalog. First test: `i18n.test.ts`, which pins every text in both languages.
7. **The route** (`routes.ts`). `CommunitiesRoute` joins the union in `src/application/routes.ts`, which also sets the start route.

Mutation testing covers `src/domain` and `src/application`; the slice's score is 100 %, keep it there. Run Stryker on the module's files only (see [testing.md](testing.md#mutation-testing)).

## 3. Infrastructure: the Layer

Folder `src/infrastructure/obsidian/communities/`. A feature adds no vault adapter: notes go through the notes module's `NoteStore`. Its `index.ts` holds `communitiesLayer`, the module's services over the shell's and the notes module's. `appLayer` (`src/infrastructure/obsidian/app-layer.ts`) builds it on `notesLayer`:

```ts
shellLayer(plugin, options, communitiesLayer.pipe(Layer.provideMerge(notesLayer(plugin, appNoteTypes))));
```

Test: `tests/dom/infrastructure/runtime.test.ts` runs `createCommunity` against the Obsidian adapters on the double. `tests/support/runtime.ts` and `harness/layers.ts` compose the same Layers over the in-memory adapters (`src/infrastructure/memory/`, never imported by `src/`).

## 4. Presentation: screen, form, switch

Folder `src/presentation/communities/`. Components import the shell only from `src/presentation/shell/index.ts`, never `effect`; they run use cases through `useQuery`, `useCommand` and `useStream`, and take texts from `useMessages()`. Test helper: `tests/support/communities/screen.ts` mounts the app on the community settings over the in-memory store.

1. **The screen** (`CommunitySettings.vue`): follows `communityListChanges` and `unindexedChanges` with `useStream`; shows loading until the index is ready, the index's failure with `ErrorNotice` and a retry through `useCommand(() => rebuildNoteIndex)`, an empty state with a create action, the list (`CommunityCard.vue`, `CommunityBadge.vue`) and the notes of no known type. First test: `tests/dom/presentation/communities/screen.test.ts`.
2. **The form** (`CommunityForm.vue`): TanStack Form; each field's validators call `validateCommunity`; the use case has the final word and its issues land at their fields; submit is disabled while the command runs. The same component creates and edits. A conflict shows `ConflictChoice.vue`, one choice per field; the form then saves again against the note's current values. First tests: `create.test.ts`, `edit.test.ts`.
3. **Delete** (`DeleteCommunityDialog.vue`): a `UModal` that asks first and runs `deleteCommunity` as a command. **The switch** (`CommunitySwitch.vue`) fills the frame's context area. First test: `delete-and-switch.test.ts`.
4. **Compose**: `index.ts` offers `communitiesScreens` and `communitiesFrame`; `src/presentation/app-surface.ts` maps the route name to its screen, adds the navigation entry and loads the context area, all through lazy `import()`.
5. **CSS ownership**: Tailwind classes carry `wm:`; Nuxt UI components are imported from `@nuxt/ui/components/*.vue`; a new one (`Slideover`) goes into the `@source` lists of `src/styles/app.css`, a new icon into `SHELL_ICONS` (`configs/vite.shared.ts`). Colours the feature owns are CSS custom properties per theme in its own stylesheet (`src/styles/communities.css`), and colour never carries meaning alone.

### Checklist for a new view

Each item needs a passing test. The slice's screen is the start route, so the shell's tests cover it:

- [ ] Disable → enable → disable in one session, and unload while load is pending: nothing leaks, and the second load behaves like the first (`tests/dom/lifecycle.test.ts`, `tests/e2e/specs/lifecycle.e2e.ts`).
- [ ] `data.json` missing, corrupt, partially invalid, or from a newer version: the plugin still loads, invalid fields fall back one by one, and a read-only file is never written (`tests/dom/external-settings.test.ts`, `external-settings.e2e.ts`, `settings-and-theme.e2e.ts`).
- [ ] A host theme switch while the view is open: the view follows it without reopening (`tests/dom/presentation/shell/theme.test.ts`, `settings-and-theme.e2e.ts`).
- [ ] The view in a pop-out window: its app, portals and theme binding live in the leaf's `ownerDocument` (`tests/dom/presentation/shell/mount.test.ts`, `popout.e2e.ts` with the form's sheet).
- [ ] Two views open, one closed: the other keeps working (`mount.test.ts`, `lifecycle.e2e.ts`, `community-selection.e2e.ts`).

A view with routes also restores its route from the view state, falls back to the start route for a broken one, and keeps its own route beside a second view (`tests/dom/infrastructure/shell/view-state.test.ts`, `navigation.e2e.ts`).

## 5. End to end in Obsidian

One spec per behaviour in `tests/e2e/specs/`, with helpers in `tests/e2e/communities.ts`: create, edit and delete with the note's exact file text, folder, file name and trash (`communities-crud.e2e.ts`); an outside edit while the form is open (`communities-outside-edit.e2e.ts`); a newer schema version (`communities-newer-schema.e2e.ts`); notes that break the contract (`communities-invalid.e2e.ts`); the selection and its persistence across a restart (`community-selection.e2e.ts`). Each ends with a clean console. See [testing.md](testing.md#end-to-end-tests-in-obsidian).

## 6. Harness

Make the new states reachable through `?scenario=` in `harness/layers.ts`: `loaded`, `empty`, `invalid`, `readonly`, `failure`. Test: `tests/unit/harness-layers.test.ts`.

## 7. Gate

`npm run verify` exits 0, and `xvfb-run -a npm run test:e2e` passes. Before pushing a change to domain or application, run Stryker on the files you changed.

## Reference: the notes module

What a feature author needs when it reads or writes notes. The mechanics are in [Vault notes](architecture.md#vault-notes).

- **Writing** goes through `NoteStore` only (`src/application/notes/ports.ts`); its Obsidian adapter is the only code that changes vault files. Writes are commands: run them through `useCommand`. A body change needs a contract section first (ADR 0007).
- **Create** with `create({ folder, name, frontmatter })`, the frontmatter from `newRecordFrontmatter(type, values)`. A taken name gets ` (2)`, also in another case or Unicode form.
- **Save a form** with `update(path, editChange(type, loaded, edited))`. It fails with `NoteEditConflictError` (each field's `base`, `edited` and `current`) or `NoteWriteRefusedError`, and then writes nothing. After a conflict, save again with the conflicting fields of `loaded` replaced by their `current` values, as `CommunityForm.vue` does.
- **Rename** with `rename(path, newName)`; a taken name is `NotePathTakenError`. **Delete** with `trash(path)`.
- **Read lists from the index**, not with `list`: `noteSnapshot(type)` and `noteChanges(type)`. After a write the view follows by itself, about 100 ms later; use a write's result only for the form that wrote it.
- **Notes with problems** are shown, never repaired silently: a `read-only` record has no save; an `editable` one may have field issues, which the form marks by `key` and saving repairs. Unindexed notes come from `unindexedSnapshot` and `unindexedChanges`, worded by `describeUnindexedIssue`.
- **Never** call `vault.modify`, `vault.adapter`, or `read` followed by a write, and never scan the vault in a hot path.
