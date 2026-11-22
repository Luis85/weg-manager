# Task 15 · The note codec

Phase B. Needs: Task 14.

**Goal.** One declaration per note type drives reading and writing, as `FIELDS` drives the settings. Decoding never throws and never repairs silently: a note is a record of a type, read-only with an issue, or editable with field issues. Saving a form merges per field with the note's current state inside the atomic write; a field changed on both sides is a conflict and nothing is written.

## Files

Create in `src/domain/notes/`: `record-id.ts`, `fields.ts`, `codec.ts`, `decode.ts`, `duplicates.ts`; extend `note-type.ts` (the declarations and outcomes), `write.ts` (the merge, beside `WriteRefusal` of Task 14) and `index.ts`. In `src/application/notes/`: `records.ts` (`newRecordFrontmatter`, `editChange`), the codec's errors in `errors.ts`, `describeNoteIssue` in `i18n/describe.ts`. Tests: `tests/unit/domain/notes/{record-id,fields,decode,check,write,duplicates,codec-properties}.test.ts`, `tests/unit/application/notes/{records,issues}.test.ts`, `tests/support/notes/test-note-type.ts`.

## Steps

- [ ] **1. The marker** exists since Task 13 (`parseSchemaMarker`, `RECORD_SCHEMA_PREFIX`); `decode` reads the type and version from it, and `schemaMarker(type, version)` (beside it) writes it.
- [ ] **2. The id** (`record-id.ts`): `<type>-<uuid>`, the UUID in lower case, any UUID version; created once, never changed; the file name is for people. `recordIdIssue(type, value)` gives `id.missing` (no value or `null`), `id.malformed` or `id.other-type`. A readable number, where a design shows one, is a separate field, never the id.
- [ ] **3. Field kinds** (`fields.ts`), what Obsidian's properties panel edits: `text`, `number` (finite), `checkbox`, `date` (a real day as `YYYY-MM-DD` text), `list` (of text); each reports `field.<kind>` for a value of the wrong kind; a narrower schema may bring its own issue code, which the feature words; `required(…)` makes a missing value `field.missing`; an empty property (`null`, as Obsidian writes it) counts as unset. Keys are English snake_case, flat (no nested map), the same in the file, the contract page and the code: no mapping to camelCase.
- [ ] **4. A declaration** (`defineNoteType({ type, version, folder?, fields, migrations })`, `codec.ts`): the fields in the order a new note writes them; `folder` (below the root folder, part of the contract, the same in every UI language because a vault is shared between devices) where new notes go; `migrations[n]` lifts version `n` to `n + 1`, runs in memory only through the shared `runMigrations` (Task 05), an entry at or beyond the current version never runs, a step that throws or returns no object fails with its version. The note on disk keeps its version until the user saves. The key union is `(typeof type.keys)[number]`; no hand-written copy. `tests/support/notes/test-note-type.ts` is a test-only type with every field kind and two migrations.
- [ ] **5. `decode({ path, frontmatter })`** (`decode.ts`) never throws. Outcomes, each with `path` and the `frontmatter` as read, a record also with its file's `version`:
  | `kind` | When | Holds |
  | --- | --- | --- |
  | `not-this-type` | no `schema`, another type, a malformed marker | the parsed `marker` |
  | `read-only` | a newer version (`schema.newer`), a failed migration (`migration.failed`), no valid id of this type (`id.*`), a duplicate id (`id.duplicate`, from `markDuplicateIds`) | `id` when valid; the valid `values`, empty for a newer or unmigratable note |
  | `editable` | everything else, also with broken fields | `id`, the valid `values`, one `issues` entry per broken or missing field with `code` and `key` |
  A note without identity is read-only, because a write could not be matched to its record and a copy may carry the real one. A note with broken fields stays editable: the form marks each field and saving repairs it.
- [ ] **6. `markDuplicateIds(notes)`** (`duplicates.ts`) over decoded notes of any types: every note that shares its id with another becomes read-only with `id.duplicate`, whose `other` names the first other note's path (shown in the UI, never logged).
- [ ] **7. `check(values)`** runs form values against the type's field rules, so the form's validators and the use cases share one rule (global constraint 15).
- [ ] **8. Writing** (`write.ts`, `records.ts`):
  - `newRecordFrontmatter(type, values)` draws an id from `IdGenerator` and builds `schema`, `id`, then each set field in declaration order, for `NoteStore.create`.
  - `editChange(type, base, edited)` is the `change` of `NoteStore.update` for a form: `base` is the frontmatter the form loaded, `edited` every field as saved (`undefined` for a cleared one). Inside the atomic write, `type.merge(base, edited, current)` decides per field: a field the user did not change keeps the note's current value; a field the user changed is written while the note still has the loaded value (`undefined` removes the key); a field both sides changed to different values is `NoteEditConflictError` listing each such field with `key`, `base`, `edited`, `current`, and nothing is written; both sides to the same value is no conflict. Values compare structurally (lists, dates as text), `null` equals unset; a broken value the user did not touch stays as it is; unknown keys are never written.
  - **Guards**: `NoteWriteRefusedError` when `current` is no longer a record of this type (`other-type`), is of a newer version (`newer-version`), has no valid id or another id than `base` (`identity`), or cannot be migrated (`migration-failed`); a feature refuses with `duplicate-id` when another note carries the record's id (it cannot tell which one the form loaded); the adapter adds `layout` (Task 14).
  - **An older version** is written in the current one by the same patch: `schema` and what the migration changed in `current`, then the user's fields on top; both sides compare after migration, so a conflict shows values in the current form.
  - Only the conflict carries note content, for the form; neither its text nor any log uses it.
- [ ] **9. Texts.** `describeNoteIssue(issue, messages.notes, label)`: `label(key)` is the field's label from the feature's catalog. Every code has a sentence in every language (`tests/unit/application/notes/issues.test.ts`).
- [ ] **10. Properties** (`codec-properties.test.ts`, fast-check): decode never throws on `fc.anything()` frontmatter; a round trip keeps unknown keys and key order; invalid YAML, a duplicate id and a newer schema each give an issue code and never a write.

## Done when

`npm run verify` exits 0 (mutation testing of these files follows in Task 19). Commit `feat: note codec with versioned schema and per-field merge`.

The codec is exercised in Obsidian through the tracer's specs (Task 18). A reference field kind, a lookup by id and a "today" source are not built (*Known gaps* in the README); the plugin writes a body only where a type's contract defines one.
