# ADR 0002 · Layered plugin architecture

- Status: accepted; the presentation bridge and the enforcement amended on 2026-11-21 (see the note at the end)
- Date: 2026-11-21

## Context

An Obsidian plugin runs inside a host it does not own. It shares the page, the CSS cascade and the window with Obsidian and other plugins, and it can be loaded and unloaded many times in one session. The shell has to make feature work safe from day one: testable without Obsidian, leak-free on unload, and visually contained.

## Decision

- **Ports and adapters, inward dependencies only.** `domain` ← `application` ← `infrastructure/obsidian` and `presentation`. `src/main.ts` and `src/bootstrap.ts` are composition only. The boundaries are enforced by oxlint `no-restricted-imports` and fallow `boundaries`, so a violation fails the gate.
- **Presentation calls use cases; it does not import `effect`.** `src/presentation/runtime/use-runtime.ts` is the one bridge: `useQuery` for reads, `useCommand` for state changes, and `useSettings`. A query is interrupted when a newer one starts or the view closes; a command always runs to its end, so closing a view never splits a write. Components stay plain Vue and run in the browser harness, while Effect stays a detail of the inner layers.
- **One runtime per plugin load, one Vue app per open view.** On unload, every surface closes before the runtime is disposed.
- **No Pinia (or other client store)** until state has to be shared across views and does not belong in `SettingsService` or the vault. Today every piece of state is either persisted or owned by one component.
- **CSS ownership.** Everything is scoped under `.weg-manager-root`, with no preflight, no `@layer` in the output, and prefixed keyframes. Nothing is written to `document.head`; for that, Nuxt UI's runtime `colors` and `head` plugins are replaced (see ADR 0001). Each surface owns its portal target inside the view, so dialogs follow pop-out windows.
- **Forms.** TanStack Form for every presentation form; its validators reuse domain rules. The Obsidian settings tab uses Obsidian's native, declarative settings API.

## Consequences

- A feature passes through four layers even when it is small. `docs/engineering/adding-a-feature.md` keeps that path short and gives a test for each layer.
- `infrastructure` imports `presentation` (to mount the surface). A mount port would remove that edge if it ever matters.
- Every Nuxt UI component the plugin uses must be listed in `src/styles/app.css`. Without the list, `styles.css` exceeds its 250 KB budget.
- Per-surface portals stack on Obsidian's modal layer. A dialog cannot escape a stacking context that Obsidian itself creates around a leaf.

## Amendment, 2026-11-21: the bridge after the module split

- **Where the bridge is.** [ADR 0006](0006-module-structure.md) moved it to `src/presentation/shell/runtime/` (`use-runtime.ts` and `use-stream.ts`), and the only place in presentation that imports `effect` is that folder. Its composables are `useQuery`, `useCommand` and `useStream`, plus `useSettings`, `useSettingsStatus`, `useAppEvents` and `useMessages`; navigation adds `useRoute`, `useNavigate` and `useHistory` ([ADR 0008](0008-navigation-and-view-state.md)). The single `useEffectAction` of the first build was split into the query and the command form (PR #6); no component uses it any more.
- **What a view mounts.** Each view's Vue app mounts the app frame and the screen of its route (ADR 0008), not a single panel.
- **Enforcement.** Layers are enforced by oxlint and fallow as written above. The module boundaries of ADR 0006 are enforced by ESLint and fallow (see [architecture](../engineering/architecture.md#enforcement)).
- **The edge to presentation.** `infrastructure/obsidian` imports only the Vue-free `presentation/shell/host`; the Vue-loading surface comes through a dynamic `import()`, so the edge costs nothing at plugin load.
