# ADR 0006 · Modules inside the layers, English in code

- Status: accepted
- Date: 2026-11-21

## Context

The shell has one file per concern in each layer: `ports.ts`, `errors.ts`, `events.ts`, `use-cases.ts`, `user-messages.ts`, the catalogs, `app-services.ts`, `obsidian/layers.ts`, and `domain/settings.ts` as the only domain file. The MVP has 17 entities and 35 stories (18 and 37 when this was decided, before the Gmail skill was removed and mobile moved after the MVP). With a 400-line limit and agents working in parallel, every feature would edit the same files.

The product's words are German (Gemeinschaft, Punkt, Kürzel). The one file contract shipped at the time, that of the since removed Gmail skill, was English (`community_id`, `review_status: unreviewed`). The owner decided on 2026-11-21: frontmatter keys, value codes and code identifiers are English; German stays in the UI and in `docs/`.

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
