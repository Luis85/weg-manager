# ADR 0007 · Vault notes as records

- Status: accepted; adapter calls, the unreadable lookup and the conflict form amended on 2026-11-21, the update write path amended again on 2026-11-21; a contact's role, closing lines and folders, references with lookup by id, the wording of the budget, what the second review round measured (PBI-68) and the two decisions on references (missing target, no wikilink) amended on 2026-11-22 (see the notes at the end)
- Date: 2026-11-21

## Context

K-14 (festgelegt) makes Markdown notes with documented YAML frontmatter the product's data. DF-22, DF-23, PBI-31 and PBI-41 add: a versioned schema, unknown properties kept, no silent overwrite of an outside edit, read-only instead of damage on a newer or broken note, and indexes that can be rebuilt from the notes. Agents and people edit the same files without the plugin.

The shell has none of this. Its only vault access counts Markdown files. This ADR fixes the mechanics every note type shares. The fields of each type are product design and are written down with the type.

## Decision

### What a record is

- **Notes are the only store of product data.** `data.json` holds technical settings. Nothing derived is persisted: the index lives in memory and is rebuilt from the notes.
- **A note is a record when its frontmatter says so:** `schema: weg-manager.<type>/v<n>`, with `<type>` an English singular in kebab-case and `<n>` a positive integer. Where the note lies does not matter, so people and agents can move notes freely.
- **Identity is the frontmatter `id`:** `<type>-<uuid>`, created once and never changed. The file name is for people and may be renamed. References between notes hold an id in a `<type>_id` key (`community_id`). Whether a wikilink is written beside it was decided on 2026-11-22: none is (see the last amendment).
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
- **Not built.** A body section for any type. (A fallback for a Markdown file that is never indexed was built on 2026-11-22: see the amendment of that day.)

## Amendment, 2026-11-21: updates edit lines through `vault.process`

- **Why `processFrontMatter` was dropped for updates.** It parses the whole YAML block and writes all of it back. A review in Obsidian 1.15.1 saved a community after changing only its kind and found every other key the user had added changed: a comment gone, `plz: 01067` written as `1067`, `version: 1.10` as `1.1`, a 20-digit number rounded, `[a, b]` as a block list, `'yes'` unquoted. That breaks "unknown keys survive" above and DV-01. It also sees no frontmatter after a BOM, which the metadata cache reads, so a BOM note was listed but every save was refused; and it wrote LF lines into a CRLF note.
- **What an update does now.** The adapter calls `vault.process(file, fn)`: Obsidian hands `fn` the file's text as it is now, BOM and line breaks included, and writes what `fn` returns, or nothing when it returns the same text. Inside `fn`, one pure step (`updateNoteText`, `src/application/notes/note-text.ts`, over `src/domain/notes/note-text.ts` and `yaml-text.ts`) reads the frontmatter with Obsidian's `parseYaml`, runs the caller's `change` on it (the per-field merge above stays inside the atomic write), and changes only the lines of the top-level keys the patch sets or removes. A key that is set keeps its place, a new key goes at the end of the block, a removed key's lines go. Every other byte stays: comments, unknown keys in their form, order, quoting, line breaks (new lines take the opening fence's), a BOM, the body. A key set to the value it has is not rewritten.
- **One serialiser.** `vault.create` writes a new note with the same writer (`newNoteText`). Text is plain where YAML 1.2, as Obsidian parses it, and YAML 1.1, as older tools read it, give back the same text, else double-quoted with escapes; dates stay plain, as Obsidian writes them.
- **The block is where the metadata cache finds it** (measured): after one BOM, a first line `---`, up to the next line that starts with `---`. `getFrontMatterInfo` was not used: it finds no block after a BOM or with lone carriage returns, and it does not close at `----`. Where the two readers disagree, the update is refused.
- **A safety net.** A line scanner and a YAML parser can disagree about odd documents (a flow mapping as the block, anchors, explicit keys, a key YAML reads as a number). So the step writes only when the keys it found by line are exactly the keys `parseYaml` read, and when `parseYaml` reads the edited text as exactly the frontmatter the patch means, every other key deeply equal and in its order. Otherwise nothing is written and the update fails with `NoteWriteRefusedError`, reason `layout`, whose text asks the user to write the properties one per line. Unreadable YAML stays `NoteUnreadableError`, now without the parser's message, which quotes the note.
- **Failures.** What the plugin's own code throws inside the write (the merge, the serialiser) is a defect, not a `NoteWriteError` the user could retry (`asDefect`, `writeCommand`). A note deleted between the lookup and the write makes `vault.process` reject with ENOENT without calling back; the adapter reports `NoteNotFoundError` when the file is no longer at its path (and, since the amendment of 2026-11-22 below, also when the rejection's `code` is `ENOENT`, because Obsidian may still list the file).
- `fileManager.processFrontMatter` is no longer called by the plugin. The Obsidian double keeps it, because the fidelity scenarios still record what it does.

## Amendment, 2026-11-22: a contact's role stays flat

- **Decision (owner, O-D10).** A contact has one role, and a list of the communities it is responsible for. The same person with a different role in another community is a remark in the contact's note for now.
- **What it means here.** The contact record needs no nested value: one key for the role (a code) and one key with the list of community `id`s. The rule "flat keys only" stands, and no assignment record type, parallel lists or coded list entries are introduced.
- **Later.** A role per community would come as a new schema version of the contact type, with its own decision on storage. The reference field kind, lookup by `id` and a source for "today" are PBI-61.

## Amendment, 2026-11-22: closing lines, line comments, folders by `clashKey`, file names in bytes

Owner decisions of 2026-11-22 (PBI-65).

- **Closing lines.** Measured in Obsidian 1.15.1 (`vaultFacts`, `tests/support/notes/scenarios.ts`): the metadata cache closes the block at every line that starts with `---`, whatever follows (`----`, `-----`, `---- `, `--- x`, `---x`, `--- # c`), with LF or CRLF, and reads the frontmatter above it; a line ` ---` or `...` does not close it. The update now writes into a block closed by `---`, by `---` with spaces or tabs after it, or by `----`, and keeps that line byte for byte. Every other closing line stays refused (`layout`), as do lone carriage returns, an opening line other than `---`, flow mappings, anchors and unusual keys. The safety net is unchanged.
- **A comment at the end of a written line stays.** When an update replaces a key's lines, the comment at the end of its key line goes behind the new value, with the blanks the user put before it (`kind: WEG # Art` becomes `kind: Haus # Art`); a value that becomes a block list keeps it on the key line (`tags: # Liste`, then the items). A `#` starts a comment only after a space or tab and outside quoted text, and quoted text starts only where a value starts (`src/domain/notes/line-comment.ts`), so `"A # B"`, `[a, "b # c"]` and `A#B` hold none. Comments on the further lines of a value that spans lines belong to that value and are replaced with it; a value whose quotes do not close on the key line has no comment there. A removed key takes its lines and their comments along. The safety net still checks what YAML reads from the result.
- **Folders found by `clashKey`.** `create` finds its folder segment by segment the way names clash (NFC, then lower case), also the type's subfolder, and writes the path in the vault's spelling: the folder spelled exactly as asked, else the first by code unit among those that clash; from the first segment the vault lacks, the rest is created as asked. `unreadable` finds its folder the same way, and the index looks for unreadable notes in the root folder by `clashKey`. Before, a vault with `weg manager/` and the setting `WEG Manager` got a second folder on Linux and, reasoned from Obsidian's source, a failed create on Windows and macOS (a manual check, `docs/engineering/testing.md`). The written path still goes through `normalizePath`, so a folder stored in NFD (macOS) is matched but written in NFC; whether Obsidian on macOS then finds the same folder is not verified.
- **File names in bytes.** A record's file name, with the longest clash suffix ` (100)` and `.md`, has at most 255 bytes in UTF-8 (`fitsFileName`, `src/domain/notes/file-name.ts`), the limit of Linux and macOS; Windows counts 255 UTF-16 units, never more than the bytes. A feature checks it at its title field, so a name that is too long is an issue there (the communities' `name.too-long`), never a failed write. A title a record already has is not checked, so a note named so outside the plugin keeps working; it is not renamed while the title stays.

## Amendment, 2026-11-22: `VaultReady` after a deadline, a note deleted while Obsidian still lists it

Owner decisions of 2026-11-22 (PBI-65, cases 1 and 4).

- **The fallback of the "Not built" line is built.** After 10 s without a sign of life from the metadata cache with a file still missing, `VaultReady` is published anyway, so the index builds with what the cache holds, and the number of missing files is logged once, without paths ([ADR 0004](0004-event-system.md), amendment of the same day). The index follows the file's `MetadataChanged` if Obsidian indexes it later, so the note then appears; nothing in the index changed. Still not built: a body section for any type.
- **Deleted while still listed.** Measured in Obsidian 1.15.1 (`tests/e2e/specs/note-vanished.e2e.ts`): when a note is deleted outside Obsidian (a person, Sync, an agent), Obsidian lists the file until its file watcher reports the delete, a few milliseconds later. In that window `vault.process` rejects with Node's error, an `Error` with `code: "ENOENT"`, `errno: -2`, `syscall: "open"`, without calling back. The adapter used to decide on the listing alone, so the first write ended as `NoteWriteError` ("try again") and a second one, after the report, as `NoteNotFoundError`. `update` now also treats a rejection whose `code` is `ENOENT` as `NoteNotFoundError` (`isFileGone`, `src/application/notes/command.ts`); only the code counts, never the message text. A rejection with another code stays a `NoteWriteError`. The double models the window (`vault.vanish`, then `remove` as the watcher's report) and rejects with the measured error; a contract case checks both adapters, and the scenario `vanishedScenario` checks the double against the app.
- **Not covered.** Obsidian on mobile (a different adapter, whose rejection was not seen) and `trash`/`rename` of a note in that window (their ENOENT can also mean a missing target folder, so the code alone does not say which).

## Amendment, 2026-11-22: references and lookup by id

PBI-61, criteria 2 and 3; built for the first feature after `communities` (contacts or items), used by none yet.

- **A reference is a field kind.** A note type declares the type it refers to: `community_id: reference("community")` for one record, `community_ids: references("community")` for a list (a contact's communities, amendment above). The value is the target's `id` as text, or a list of ids; the keys stay `<type>_id` and `<type>_ids`, flat. Obsidian edits them as text and list. A value that is no id of the named type is the field's issue (`field.reference`, `field.references`), as for the other kinds. Whether a wikilink is written beside the id was decided on 2026-11-22: none is (see the last amendment).
- **A missing target is an issue of the domain, added by the index.** The codec reads one note and cannot see the others, so the index marks it over the records of every type, beside the duplicate ids (`markMissingReferences`): each id a record names and no record carries is `reference.missing` with its key and the id. A list with one missing target yields one issue for that id and keeps its whole value. The record stays as it was, editable or not, because Sync may bring the target back; nothing blocks a save. The id is shown to the user and never logged. A feature writes no rule for it: the record kit's rows carry it, and the notes catalog words it. A reference to a type no module registers is a defect at build.
- **A snapshot of the index has a lookup by id** (`byId`), built once when the snapshot is published, so a route such as `item/<id>` or a reference finds its record without a scan. An id several notes carry gives the first of them by path; like each of them it is read-only with `id.duplicate`, so a write through it is refused, as before. The record kit finds a renamed record through it.
- **Not built.** A choice of records in a form, a reference to a record of another vault, and a check of references in `check` (a form's validators): the first feature decides how it offers its targets.

## Amendment, 2026-11-22: the budget counts work

Review round 2 of 2026-11-22. The decision's line "checked by a timing test" is not what was built: the budget is counted work, because a time bound fails on a loaded machine (`docs/engineering/testing.md`, "No wall-clock assertion").

- **Unit test.** `tests/unit/application/notes/note-index-budget.test.ts` builds the reference vault's records over the in-memory store and asserts reads and decodes, not time: a build decodes each record once and reads no file twice, a rebuild reads and decodes nothing unchanged, and one edit costs one read and one decode.
- **E2e.** `tests/e2e/specs/note-index.e2e.ts` bounds only the outside edit, from the edit to the snapshot (1 s). The first build after `VaultReady` on a cold start and on a warm restart is recorded in `reports/e2e/`, not asserted.

## Amendment, 2026-11-22: what the second review round measured (PBI-68)

Each point measured in Obsidian 1.15.1 with a shared scenario that the double is held to as well.

- **A failed system trash does not reject.** With the trash option "system" (the desktop default), `fileManager.trashFile` asks `vault.adapter.trashSystem`; when that answers `false`, Obsidian shows its own notice and resolves `false`, and the note stays (`trash-failure-scenario.ts`). `trash` now reports `NoteTrashError` for a `false` as for a rejection (`trashCommand`). Only `false` counts: Obsidian resolves `true` on success, and an adapter that keeps to the d.ts (`void`) resolves `undefined`, which is no failure. The user sees Obsidian's notice beside the plugin's.
- **`cachedRead` keeps the text of a deleted note.** Obsidian keeps the text of every Markdown file up to 64 KiB once it has read it, and its metadata cache reads every file it indexes; `cachedRead` hands that out without the disk. So for an indexed note deleted outside, `cachedRead` gives the old text while `read` and `process` reject with `ENOENT` (`vanishedScenario`). `unreadable` now reads its candidates with `vault.read`, so a candidate deleted while still listed is left out, as the 2026-11-22 amendment above meant; the cost is one disk read per note whose block the cache could not read.
- **`renameFile` is a queued link update.** Obsidian moves the file inside `runAsyncLinkUpdate`: one link update at a time, each after the metadata cache has indexed every earlier write, which is why a rename right after an update sees the written frontmatter in the cache. A rename asked for while another update moves its files (from a `rename` listener, or a plugin's save during the user's own rename) joins that update instead: its promise resolves before the file moves, and a failure of that move rejects the other caller's promise, not its own (`orderScenario`, `renameDuringRename` and `failingJoinedRename`). The adapter's `rename` then returns the note at the path it still has, as a success. No public signal tells it when the joined move has happened or failed, so this stays open (PBI-68) until the owner picks one of: waiting on Obsidian's internal queue (`fileManager.updateQueue`, exact but not public API), waiting for the file's `rename` event with a deadline (a timer that can call a late move a failure), or accepting it as now (the index follows the move when it happens, the record kit finds the note by `id`, and a failed rename was only logged anyway).
- **What `rename` returns.** The review expected `rename` right after `update` or `create` to return the frontmatter from before the write. Measured, it does not: because of the wait above, the cache holds the written frontmatter when the move is done. Contract cases "returns the frontmatter an update just wrote" and "a create just wrote" now hold every adapter to it, in the app too; they passed at once, also on the double. The case that does return stale frontmatter is the joined rename, so the port now says `rename` gives the frontmatter as the store reads it after the move, and the record kit returns the frontmatter its update wrote at the path of the rename.

## Amendment, 2026-11-22: a missing target never blocks a save, and a link is the id only

Owner decisions of 2026-11-22, fourth interview (PBI-61, PBI-71). They settle two points the amendment "references and lookup by id" left open or only implied.

- **A record that points at a missing target still saves.** The target may be a deleted note, or one that Sync has not brought yet. The form marks the field, and the record is listed under the data issues as `reference.missing`. Saving is never refused for that reason: no validator, in the domain or in a form, turns a missing target into a failed save. The index already behaves so (`markMissingReferences` adds the issue and leaves the record as it was).
- **A link between records is written as the target's `id` only.** The value of a `<type>_id` or `<type>_ids` key is the `id`; no wikilink is written beside it, and no property holds one. The consequence the owner accepted: Obsidian's graph and backlinks do not show the relation. This closes the sentence "Whether a wikilink is written beside it is decided with the first relation" under *What a record is*.
- **Not changed.** The reference field kinds, `reference.missing`, lookup by `id` and the flat keys stand as the amendment of 2026-11-22 "references and lookup by id" built them.
