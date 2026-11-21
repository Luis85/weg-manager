# ADR 0007 · Vault notes as records

- Status: accepted
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

The first type, as the tracer slice builds it (the values are examples; the colour names come from the reviewed palette):

```yaml
---
schema: weg-manager.community/v1
id: community-3f2b8c1e-7a44-4d0b-9c2e-5b1f0a6d9e21
name: Ahornweg 12
short_code: AW
color: c1
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
- **It builds after a readiness event.** The workspace layout being ready is not enough: Obsidian may still be reading frontmatter. A new `AppEvent` is published once per load, when the layout is ready and the metadata cache has reported `resolved`. An e2e spec on a cold vault has to prove this before the index relies on it.
- **Then it follows file events** (metadata changed, deleted, renamed), in debounced batches. A rebuild is always possible and is a use case.
- **Budget:** the reference vault of F-21 (2,000 notes, 200 Punkte) within B-NFR-04, checked by a timing test.

## Consequences

- Moving, renaming and reorganising notes never breaks the plugin. In return the index looks at every Markdown file's frontmatter once; the metadata cache makes that cheap.
- Ids are not readable. Lists and texts show names, short codes and numbers.
- A conflict costs the user a choice instead of costing data. Forms need the loaded state and a per-field conflict view.
- The file names differ from the code: German folders and UI, English keys. `GLOSSARY.md` and each type's contract page carry the mapping.
- Each type needs its contract documented when it is built (K-14). How the contract reaches a user's vault is a product question under PBI-41.
- The Obsidian test double grows by the vault, metadata-cache and file-manager calls named above, and one in-memory `NoteStore` serves both the tests and the browser harness.
