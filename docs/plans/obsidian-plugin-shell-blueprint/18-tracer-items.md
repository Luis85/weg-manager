# Task 18 · Tracer feature `items`

Phase C. Needs: Task 17 (or, without note data, Task 12).

**Goal.** The thinnest real feature through every layer, built only from what the shell and `notes` offer, so it proves the path every later feature walks and shows what a feature writes itself: a note type, its rules, its texts and its layout. It replaces nothing: there is no demo to delete (L1). It plays the role of the source repository's `communities` module; replace it with the plugin's first real record type when the product names one.

## The record type

`item`, module `items`, notes in `<root-folder>/Items/` (the folder name is part of the contract and the same in every UI language):

```yaml
---
schema: <plugin-id>.item/v1
id: item-3f2b8c1e-7a44-4d0b-9c2e-5b1f0a6d9e21
title: Replace the hallway light
status: open
due: 2026-12-01
---
```

| Key | Kind | Rule | Issue code |
| --- | --- | --- | --- |
| `title` | required text | `lineOfText(100)`; its file name fits 255 bytes (`fitsFileName`, checked for a new or changed title); unique among items by `clashKey` | `title.invalid`; `title.too-long`; `title.taken` (form), `title.duplicate` (between records) |
| `status` | required text | one of `open`, `done` (English value codes; the UI words them) | `status.unknown` |
| `due` | optional date | a real day, `YYYY-MM-DD` | `field.date` |

The title names the file (`recordFileName(title, fallback)`; `fallbackName: () => "Item"` for a title made only of forbidden characters); the file follows a title change while it still carries the old title.

## Files

Domain: `src/domain/items/{item-type,rules,index}.ts`. Application: `src/application/items/{errors,list,use-cases,user-messages,routes,module,index}.ts`, `i18n/{catalog,describe,<language>}.ts`. Presentation: `src/presentation/items/{index,screens,use-item-form}.ts`, `components/{ItemSettings,ItemForm,ItemCard}.vue`. Docs: one contract page in `docs/contracts/` for `item` v1, `GLOSSARY.md` rows. Tests: `tests/unit/domain/items/{item-type,rules}.test.ts`, `tests/unit/application/items/{list,create-delete,update,i18n}.test.ts`, `tests/support/items/{fixture,screen}.ts`, `tests/dom/presentation/items/{screen,create,edit,delete,focus}.test.ts`, harness scenarios, `tests/e2e/items.ts`, `tests/e2e/specs/{items-crud,items-outside-edit,items-newer-schema,items-invalid,items-focus,settings-sections,appearance}.e2e.ts`, the form case of `note-write-fidelity.e2e.ts`, `tests/support/contrast.ts` with `tests/unit/support/contrast.test.ts`, `tests/e2e/appearance.ts`. The module has no infrastructure folder: notes go through `NoteStore`.

## Steps

- [ ] **0. Words and contract.** Add every term to `GLOSSARY.md` before it enters code. Write the contract page (keys, kinds, rules, an example, every issue code and what the plugin does with it; read-only cases; that unknown keys and the body are kept). It is the reference for people and agents who edit the notes without the plugin.
- [ ] **1. Domain.** `itemType = defineNoteType({ type: "item", version: 1, folder: "Items", fields: { title: required(text({ schema: lineOfText(TITLE_MAX_LENGTH), issue: "title.invalid" })), status: required(text({ schema: Schema.Literals(ITEM_STATUSES), issue: "status.unknown" })), due: date() }, migrations: {} })`. `validateItem(input, { others, loaded })` runs the type's `check`, then `title.taken`; a value the record already had is not checked again, so a duplicate made outside the plugin does not block a save. `duplicateTitles` marks duplicates (`title.duplicate`). Tests first: the exact outcome of a valid note, a missing field, each broken field, a newer version.
- [ ] **2. Application.** `itemRecords = defineRecords({ type: itemType, title: "title", fallbackName, log: "items", between: markDuplicateTitles })`; use cases `createItem(input)` (rules, then the kit's `create`), `updateItem(item, input)` (rules, then the kit's `update` with `editedValues`), `deleteItem` (the kit's `remove`); `InvalidItemError { issues }` (`Schema.TaggedError`) in the manifest's `errors.tags` with `describeItemsError`; the catalog (`fields`, `missing`, `issues`, the section label, the empty state, the status labels) in every language; `describeItemIssue` via `describeRecordIssue`. The manifest: `defineModule({ name: "items", catalog, errors, noteTypes: [itemType], sections: [{ id: ITEMS_SECTION, order: 100 }] })`. Test fixture `tests/support/items/fixture.ts` over the index fixture under `TestClock` (`ready`, `indexed`). Tests first: `list`, `create-delete`, `update` (the rules' refusals and the wiring: folder, frontmatter, rename by title, log event), `i18n` (every text in every language).
- [ ] **3. Presentation.** `ItemSettings.vue`, the section: `useStream` over the list, `useRecordScreen` for loading, failure, empty state, sheet, delete dialog and focus; `ItemCard.vue` with `OpenNoteButton` on a read-only card; `ItemForm.vue` in a `USlideover` with `use-item-form.ts` on `useRecordForm` (rules: `validateItem` against the others; start values: `status: "open"`); `DeleteRecordDialog` with the feature's title. `index.ts` offers `itemsSettings`; `screens.ts` `{ screens: {}, sections: { items: { label, component: () => import("./index").then(m => m.itemsSettings) } } } satisfies ModuleScreens<"items">`; `MODULE_SCREENS` gains `items`. Every Nuxt UI component it uses is in `app.css`'s `@source` lists, every icon in `SHELL_ICONS`. Test helper `tests/support/items/screen.ts` mounts the app on the section over the in-memory store (`openSettings(section)`, `openItems`, `until`, `fill`, `save`); texts in dom tests come from the typed catalog, not literals. Tests first: `screen`, `create`, `edit`, `delete`, `focus` (modality, initial focus, focus after sheet and dialog, the failed-submit summary).
- [ ] **4. Harness scenarios** (`harness/layers.ts`, `tests/unit/harness-layers.test.ts`): `loaded` (two items), `empty`, `invalid` (a broken status, a duplicate title, an unreadable note in the folder, a malformed `schema` elsewhere), `readonly` (a note of `v2` beside a valid one), `failure` (the index's first read fails, then succeeds on retry).
- [ ] **5. E2e** (helpers in `tests/e2e/items.ts`; each spec ends with a clean console; each waits for the list before it clicks, L9):
  - `items-crud.e2e.ts`: create from the form, the note under `<root-folder>/Items/` with its **exact file text** and a random id, a notice; input that breaks a rule never written, with the summary; an edit saved with unknown keys and body kept, the file renamed with the title, a notice; delete after confirmation into the vault's trash.
  - `items-outside-edit.e2e.ts`: an outside edit while the form is open: another field merged; the same field a conflict that takes the focus, writes nothing, shows the three values and saves the chosen one.
  - `items-newer-schema.e2e.ts`: a `v2` note listed read-only with its issue and only "Open in Obsidian", never written across a plugin reload.
  - `items-invalid.e2e.ts`: a broken status, a duplicate title, a duplicate id (naming the other note's path) each shown beside a valid item; unreadable frontmatter in the folder under data issues, counted beside its entry; the broken status repaired by saving; the others untouched; "Open in Obsidian" opens the note in another tab while the view stays.
  - `items-focus.e2e.ts`: the sheet modal (`aria-modal`, the frame `inert`), the focus on Title and Tab kept inside, Escape back to the create button; the failed-submit summary and the focus on the first invalid field; the focus on the new card's edit button after a create and on the same card after a rename; the delete dialog on Cancel and the create button after the delete.
  - `note-write-fidelity.e2e.ts`, form case: an item saved through the form with only its status changed, the file compared byte for byte (comments, `01067`, `1.10`, a 20-digit number, a flow list, `'yes'`, a quoted key with a comment, a list at column 0, a block scalar, a trailing comment on the written line, a BOM, CRLF).
  - `settings-sections.e2e.ts`: the settings navigation with "Items" and "Data issues" and its count (wait for the badge, L10); a section opened as a route with the focus kept on its entry; back with the frame's control; a saved section restored, an unknown one falling back; no overflow at 320 px.
  - `appearance.e2e.ts`: in Obsidian's default theme, light and dark, lists, headings and paragraphs start from zero and ghost buttons carry no Obsidian chrome; every visible text reaches 4.5:1 on its effective background and text fields 3:1 (measured at rest, because a focused field shows Obsidian's accent outline); the current page marked by a bar, not by colour alone; a 100-character title wraps on its card without horizontal overflow as a sidebar and at 320 px. The contrast maths is `tests/support/contrast.ts`, unit-tested; ratios land in `reports/e2e/appearance-contrast.json`. A palette of record colours, if the product has one, is measured too: distances between colours, not only against the background (L25).
- [ ] **6. The checklist for a new view** (each item needs a passing test; most are the shell's from Tasks 07 to 12): disable → enable → disable and unload while pending; `data.json` missing, corrupt, partly invalid or newer; a theme switch while open; a pop-out window with the form's sheet; two views, one closed; keyboard and screen reader rules of Task 09 step 8.

## Without note data

Keep steps 0 (glossary and the data contract of the plugin's own store), 3, 4, 5 and 6 with the plugin's own source of data in place of `NoteStore`: one port with an in-memory and a host adapter and a contract suite on both (as Task 13 does), a use case per write run as a command, a routed view that follows a stream, and an e2e spec for an outside change. The manifest, screens, catalogs and the gate are the same.

## Done when

`npm run verify` and `xvfb-run -a npm run test:e2e` exit 0; mutation testing of `src/domain/items` and `src/application/items` leaves no survivor (Task 19's per-module command); a planted cross-feature import into `notes` (`src/application/notes/_p.ts` importing `../items`) fails ESLint and fallow. Commit `feat: tracer record type items`.

**Proven in the source repository** for `communities` (same structure, other fields): every test kind and spec named here, with the module's score at 100 % (PRs #26, #30, #31, #34, #39 there). **Not in the source:** `items` itself; a status field with value codes; titles unique by `clashKey`.
