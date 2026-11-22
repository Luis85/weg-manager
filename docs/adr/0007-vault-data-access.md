# ADR 0007 · Vault notes as records

- Status: accepted; adapter calls, the unreadable lookup and the conflict form amended on 2026-11-21, the update write path amended again on 2026-11-21 (see the notes at the end)
- Date: 2026-11-21

## Context

K-14 (festgelegt) makes Markdown notes with documented YAML frontmatter the product's data. DF-22, DF-23, PBI-31 and PBI-41 add: a versioned schema, unknown properties kept, no silent overwrite of an outside edit, read-only instead of damage on a newer or broken note, and indexes that can be rebuilt from the notes. Agents and people edit the same files without the plugin.

The shell has none of this. Its only vault access counts Markdown files. This ADR fixes the mechanics every note type shares. The fields of each type are product design and are written down with the type.

## Decision

### What a record is

- **Notes are the only store of product data.** `data.json` holds technical settings. Nothing derived is persisted: the index lives in memory and is rebuilt from the notes.
- **A note is a record when its frontmatter says so:** `schema: weg-manager.<type>/v<n>`, with `<type>` an English singular in kebab-case and `<n>` a positive integer. Where the note lies does not matter, so people and agents can move notes freely.
- **Identity is the frontmatter `id`:** `<type>-<uuid>`, created once and never changed. The file name is for people and may be renamed. References between notes hold an id in a `<type>_id` key (`community_id`). Whether a wikilink is written beside it is decided with the first relation.
- **A readable number is not the id.** Where the design shows one (`P-041`), it is a separate field. Two notes with the same number are an issue to show, not a broken reference.
- **Keys are English snake_case, flat, and of a type Obsidian's properties panel can edit:** text, number, checkbox, date, list. Value codes are English. Free text stays as the user wrote it.
- **The body belongs to the user.** The plugin writes frontmatter. It changes a body only where a type's contract defines a section.
- **Folders are where new notes are created, nothing more.** The default root is `WEG Manager/`, held as a setting. Folder names are part of the contract and are German in every UI language (`WEG Manager/Gemeinschaften/`), because a vault is shared between devices. A name clash gets the suffix ` (2)`.

The first type, as the tracer slice builds it (the values are examples; `color` is an English name from the fixed palette):

```yaml
---
schema: weg-manager.community/v1
id: community-3f2b8c1e-7a44-4d0b-9c2e-5b1f0a6d9e21
name: Ahornweg 12
short_code: AW
color: teal
kind: WEG
unit_label: Einheiten
---
```

### Reading

- **One codec for all types.** An Effect Schema per type and version goes in; a record or a list of issue codes comes out. It never throws, and the domain stays language-free (ADR 0005).
- **Versions.** A note of a newer version than the plugin knows is read-only and shown with an issue. A note of an older version is migrated in memory through a table of steps and written in the new form only when the user next saves it. Nothing is rewritten on load, so an older plugin on another device keeps working.
- **Broken notes.** A duplicate `id` marks every note that carries it as read-only with an issue. A note whose frontmatter cannot be parsed has no readable `schema`; it is reported only when it lies in one of the plugin's folders, which is the one hint left.
- **Reads come from Obsidian's metadata cache,** not from file contents. A body is read on demand.

### Writing

- **One port, `NoteStore`, in module `notes`.** It speaks in plain data (path, frontmatter, id), never in `TFile`. Its Obsidian adapter is the only code that changes vault files, and it uses only `fileManager.processFrontMatter`, `vault.process`, `vault.create`, `fileManager.trashFile` and `fileManager.renameFile`, with paths through `normalizePath`. No `vault.adapter`, no `read` followed by `modify`.
- **Unknown keys and key order survive,** because a write changes only the keys the type knows.
- **Delete moves the note to the trash** the user configured in Obsidian.
- **A write is a command.** Once started it completes (PR #6), and components run it through `useCommand`.
- **An outside edit is merged per field.** A form keeps the frontmatter it loaded. On save, inside the atomic write:
  - a field the user did not change keeps the note's current value;
  - a field the user changed is written if the note still has the loaded value;
  - a field changed on both sides to different values is a conflict. Nothing is written, and the form shows both values for the user to choose.

  A note that was renamed meanwhile is found by its id. A note that is gone is an error the user is told about.

### The index

- **A service in module `notes`** holds the decoded records and their issues per type and gives each feature a stream to follow.
- **It builds after a readiness event.** The workspace layout being ready is not enough: Obsidian may still be reading frontmatter. A new `AppEvent`, `VaultReady`, is published once per load, when the layout is ready and every Markdown file has its entry in the metadata cache. Measured on 2026-11-21 in Obsidian 1.15.1 on the reference vault: on a cold start the layout is ready with 1 of 2,200 notes cached, and `resolved` fires once per indexed note, the first time before the layout is ready; on a warm restart and in a running app the cache is complete at once and `resolved` fires once or never. So `resolved` alone is no signal, and the adapter checks the cache itself ([ADR 0004](0004-event-system.md), amendment of the same day). An e2e spec on a cold vault proves it.
- **Then it follows file events** (metadata changed, deleted, renamed), in debounced batches. A rebuild is always possible and is a use case.
- **Budget:** the reference vault of F-21 (2,000 notes, 200 Punkte) within B-NFR-04, checked by a timing test.

## Consequences

- Moving, renaming and reorganising notes never breaks the plugin. In return the index looks at every Markdown file's frontmatter once; the metadata cache makes that cheap.
- Ids are not readable. Lists and texts show names, short codes and numbers.
- A conflict costs the user a choice instead of costing data. Forms need the loaded state and a per-field conflict view.
- The file names differ from the code: German folders and UI, English keys. `GLOSSARY.md` and each type's contract page carry the mapping.
- Each type needs its contract documented when it is built (K-14): one German page per type and version under `docs/`, German text around the English keys and codes, as the Gmail skill's contract is written. How the contract reaches a user's vault is a product question under PBI-41.
- The Obsidian test double grows by the vault, metadata-cache and file-manager calls named above, and one in-memory `NoteStore` serves both the tests and the browser harness.

## Amendment, 2026-11-21: what was built

- **Adapter calls.** The Obsidian adapter uses `vault.create`, `vault.createFolder` (for missing folders), `vault.process` (for updates, since the second amendment below; it used `fileManager.processFrontMatter` before), `fileManager.trashFile` and `fileManager.renameFile`. Name clashes compare `clashKey` (NFC, then lower case), also against folders, whatever the disk does.
- **Unreadable notes.** Under *Broken notes*, "one of the plugin's folders" is the `rootFolder` setting. The index asks `NoteStore.unreadable(folder)`, because Obsidian's cache cannot tell a note with broken YAML from a note without frontmatter except through its `yaml` section.
- **The conflict form** shows, per conflicting field, the value when the form opened, the user's and the note's current one; the user picks one per field, and the form saves again against the current note. Applying the choice ends the conflict view: a chosen value that breaks a rule (a property emptied outside) stays in the editable form with its field's issue, and the next save goes against the same note values.
- **Unregistered records.** A valid `schema` of a type no feature registered, and a malformed `schema`, are shown as issues (`schema.unknown-type`, `schema.malformed`), never dropped.
- **Not built.** A fallback when a Markdown file is never indexed (it would hold `VaultReady` back), and a body section for any type.

## Amendment, 2026-11-21: updates edit lines through `vault.process`

- **Why `processFrontMatter` was dropped for updates.** It parses the whole YAML block and writes all of it back. A review in Obsidian 1.15.1 saved a community after changing only its kind and found every other key the user had added changed: a comment gone, `plz: 01067` written as `1067`, `version: 1.10` as `1.1`, a 20-digit number rounded, `[a, b]` as a block list, `'yes'` unquoted. That breaks "unknown keys survive" above and DV-01. It also sees no frontmatter after a BOM, which the metadata cache reads, so a BOM note was listed but every save was refused; and it wrote LF lines into a CRLF note.
- **What an update does now.** The adapter calls `vault.process(file, fn)`: Obsidian hands `fn` the file's text as it is now, BOM and line breaks included, and writes what `fn` returns, or nothing when it returns the same text. Inside `fn`, one pure step (`updateNoteText`, `src/application/notes/note-text.ts`, over `src/domain/notes/note-text.ts` and `yaml-text.ts`) reads the frontmatter with Obsidian's `parseYaml`, runs the caller's `change` on it (the per-field merge above stays inside the atomic write), and changes only the lines of the top-level keys the patch sets or removes. A key that is set keeps its place, a new key goes at the end of the block, a removed key's lines go. Every other byte stays: comments, unknown keys in their form, order, quoting, line breaks (new lines take the opening fence's), a BOM, the body. A key set to the value it has is not rewritten.
- **One serialiser.** `vault.create` writes a new note with the same writer (`newNoteText`). Text is plain where YAML 1.2, as Obsidian parses it, and YAML 1.1, as older tools read it, give back the same text, else double-quoted with escapes; dates stay plain, as Obsidian writes them.
- **The block is where the metadata cache finds it** (measured): after one BOM, a first line `---`, up to the next line that starts with `---`. `getFrontMatterInfo` was not used: it finds no block after a BOM or with lone carriage returns, and it does not close at `----`. Where the two readers disagree, the update is refused.
- **A safety net.** A line scanner and a YAML parser can disagree about odd documents (a flow mapping as the block, anchors, explicit keys, a key YAML reads as a number). So the step writes only when the keys it found by line are exactly the keys `parseYaml` read, and when `parseYaml` reads the edited text as exactly the frontmatter the patch means, every other key deeply equal and in its order. Otherwise nothing is written and the update fails with `NoteWriteRefusedError`, reason `layout`, whose text asks the user to write the properties one per line. Unreadable YAML stays `NoteUnreadableError`, now without the parser's message, which quotes the note.
- **Failures.** What the plugin's own code throws inside the write (the merge, the serialiser) is a defect, not a `NoteWriteError` the user could retry (`asDefect`, `writeCommand`). A note deleted between the lookup and the write makes `vault.process` reject with ENOENT without calling back; the adapter reports `NoteNotFoundError` when the file is no longer at its path.
- `fileManager.processFrontMatter` is no longer called by the plugin. The Obsidian double keeps it, because the fidelity scenarios still record what it does.

## Amendment, 2026-11-22: a contact's role stays flat

- **Decision (owner, O-D10).** A contact has one role, and a list of the communities it is responsible for. The same person with a different role in another community is a remark in the contact's note for now.
- **What it means here.** The contact record needs no nested value: one key for the role (a code) and one key with the list of community `id`s. The rule "flat keys only" stands, and no assignment record type, parallel lists or coded list entries are introduced.
- **Later.** A role per community would come as a new schema version of the contact type, with its own decision on storage. The reference field kind, lookup by `id` and a source for "today" are PBI-61.
