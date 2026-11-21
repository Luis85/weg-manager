# Issue tracker: Obsidian backlog

Issues and specs for this repo live as Markdown notes with YAML frontmatter, shown through `Product Backlog.base`. GitHub Issues is not used. `docs/README_DOCS.md` is the authority on conventions; read it before writing any note. Where this file and it disagree, it wins.

## Conventions

- One note per work item. `type` and folder: `PBI` → `docs/requirements/`, `Task` → `docs/tasks/`, `Bug` → `docs/bugs/`, `Issue` → `docs/issues/`. Create a folder only when its first note is written.
- File name is `<ID> - <Titel>.md`. IDs continue the highest existing number per prefix: `PBI-NN`, `T-NN`, `BUG-NN`, `ISS-NN`.
- Hierarchy is the quoted `parent` wikilink, never the folder: a `PBI` has exactly one `Feature`, a `Task` has a `PBI` (or `Bug`/`Issue`).
- `order` is a unique global rank. Give a new note the highest existing rank plus 1000. Never renumber other notes.
- Copy the frontmatter keys of an existing note of the same type. Leave unknown values as `""`; do not fill them with assumptions.
- Never create or change `tags`. Leave `status` empty unless the user gives a value.
- Triage state is the `triage` property (see `triage-labels.md`).
- Blocking is the `dependsOn` property, a list of quoted wikilinks.
- Wikilinks must point at existing notes and use the full file name, no ID-only aliases.
- Notes are written in German, like the rest of `docs/`.
- Comments and conversation history append at the bottom under `## Kommentare`.
- Do not create README, index or overview notes.

## When a skill says "publish to the issue tracker"

Create a note of the fitting type. A spec is a `PBI` (user story with acceptance criteria) under its `Feature`; implementation tickets are one `Task` note each with the PBI as `parent`.

## When a skill says "fetch the relevant ticket"

Read the note at the referenced path or ID. The user will normally pass one of them.

## Wayfinding operations

Used by `/wayfinder`. The **map** is a note with one **child** note per ticket.

- **Map**: the `PBI` or `Feature` note of the effort; Notes / Decisions-so-far / Fog go in its body.
- **Child ticket**: a `Task` note with the map as `parent` and a `kind` property (`research`/`prototype`/`grilling`/`task`), with the question in the body.
- **Blocking**: `dependsOn`. A ticket is unblocked when every note it lists has `finished` set.
- **Frontier**: Tasks under the map with empty `assignee` and `finished`, unblocked; lowest `order` wins.
- **Claim**: set `assignee` and `started` and save before any work.
- **Resolve**: append the answer under `## Antwort`, set `finished`, then add a context pointer (gist + link) to the map's Decisions-so-far.
