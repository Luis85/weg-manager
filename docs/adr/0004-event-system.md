# ADR 0004 · Typed event system

- Status: accepted
- Date: 2026-11-21

## Context

Features have to react to what happens in the vault and the workspace: a note is created or renamed, its frontmatter is re-indexed, the active file or the colour scheme changes. Obsidian offers this through its `Events` mixin on `vault`, `metadataCache` and `workspace`. Using it directly would spread `obsidian` imports and untyped callbacks through application code, would leak listeners whenever a bootstrap fails or is aborted (`bootstrap` then disposes the runtime without the plugin being unloaded, so `registerEvent` alone does not cover it), and would expose every feature to the flood of `create` events Obsidian fires for every existing file while it starts. Later the plugin also needs its own **domain events** (e.g. `CommunityCreated`; English since [ADR 0006](0006-module-structure.md)), and they should travel the same way.

## Decision

- **One bus.** `EventBus` (`src/application/event-bus.ts`) is a `Context.Service` in `AppServices` with `publish(event)`, `events` (a `Stream` of every event from the moment it runs), `on(tag)` (the same stream narrowed to one member) and `subscribe` (subscribes immediately, for forked consumers that must not miss what is published right after). Each consumer has its own subscription, so a consumer that fails or dies ends only its own stream.
- **One vocabulary.** `AppEvent` (`src/application/events.ts`) is a `Data.TaggedEnum` of plain, serialisable data: no Obsidian types, no class instances. Consumers switch exhaustively on `_tag`. Host and domain events share this union.
- **Host events are mapped at the edge.** `hostEventsLayer` (`src/infrastructure/obsidian/events.ts`) is the only code that listens to Obsidian:

  | Obsidian | `AppEvent` |
  | --- | --- |
  | `vault` `create`, `modify`, `delete` (a `TFile`) | `FileCreated`, `FileModified`, `FileDeleted` `{ path, extension }` |
  | `vault` `rename` (a `TFile`, old path) | `FileRenamed { path, oldPath, extension }` |
  | `metadataCache` `changed` | `MetadataChanged { path, extension }` |
  | `workspace.onLayoutReady` | `LayoutReady {}` |
  | `workspace` `file-open` | `ActiveFileChanged { path \| null }` |
  | `workspace` `css-change`, when `theme-dark` on the body flips | `ColorSchemeChanged { scheme }` |

  Folders are not published: no feature needs them yet, and a separate `Folder…` tag can be added when one does. `isMarkdown(event)` filters Markdown files with Obsidian's own test (`extension === "md"`). `ActiveFileChanged` uses `file-open` rather than `active-leaf-change`: `file-open` carries exactly the file shown in the active editor (or `null`) and matches `workspace.getActiveFile()`, whereas `active-leaf-change` also fires when a sidebar or this plugin's own view takes focus, which does not change the active file.
- **Layout-ready gating.** Until `onLayoutReady` fires, the adapter publishes nothing. Then it publishes `LayoutReady` first and every later host event after it. A feature that needs the current state reads it after `LayoutReady` instead of replaying the startup `create` flood. `appLayer` builds the adapter last, so a subscriber that a service starts while the runtime is built sees `LayoutReady`; one that subscribes later does not.
- **Capacity: unbounded.** Obsidian's callbacks are synchronous, so the producer cannot wait for back-pressure, and a `dropping` or `sliding` PubSub would silently lose file events during a bulk sync of thousands of files. The unbounded PubSub holds a message only until every current subscriber has taken it and discards it when nobody subscribes, so memory grows only while a subscriber lags (about a hundred bytes per event).
- **Lifecycle.** The PubSub is acquired with `acquireRelease` and shut down when the runtime is disposed, which ends every stream. The adapter registers its listeners with `on` and removes each with `offref` in its scope's finalizer, so `runtime.dispose()` removes every listener whatever way the load ended. Each listener is also registered with `plugin.registerEvent` (2026-11-21), so a normal `unload()` detaches it synchronously, before the asynchronous runtime dispose has finished; a second `offref` on the same ref is a no-op in Obsidian. The `onLayoutReady` callback cannot be cancelled, so it checks that its scope is still open.
- **Defects.** Mapping and publishing run synchronously inside Obsidian's callback (`Effect.runSyncExitWith`). A defect goes to `reportDefect` and never throws into Obsidian. Individual events are not logged.

## Consequences

- Application code reacts to the vault without importing `obsidian`, and tests drive it through the double's `trigger`.
- A subscriber that never drains its stream keeps every later event in memory. Consumers must keep up or end their stream.
- `LayoutReady` is an edge, not a state: it is published once per plugin load. A feature started later has to read the current state itself.
- The e2e suite inspects Obsidian's internal `Events._` map to prove that listeners are removed. A future Obsidian release may change it; the spec then fails loudly rather than passing.

## Adding an event

1. Add a member to `AppEvent` in `src/application/events.ts` with plain readonly fields. Domain events (e.g. `CommunityCreated { communityId }`) go into the same union.
2. Typecheck now fails in every exhaustive `switch` on `_tag`; handle the new member there.
3. Publish it: a host event from `hostEventsLayer`, with a mapping test in `tests/dom/infrastructure/events.test.ts`; a domain event from the use case or service that causes it, with `EventBus.publish`.
4. Consume it with `EventBus.on("<Tag>")`, or `subscribe` for a forked consumer.
