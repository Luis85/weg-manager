# ADR 0002 · Layered plugin architecture

- Status: accepted; the presentation bridge and the enforcement amended on 2026-11-21; CSS ownership amended on 21.11.2026 (colour tokens, base rules, harness host); the clock as a port added on 2026-11-22 (see the notes at the end)
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

## Amendment, 21.11.2026: CSS ownership in Obsidian, not only in isolation

Measured in Obsidian 1.15.1 (default theme), scoping alone was not enough: Obsidian's element rules reached into the plugin, and its theme colours, used as they are, missed WCAG 2.2 AA.

- **A small base reset, below the utilities.** Inside the root, lists, headings, paragraphs, fieldsets and legends start from zero, and buttons drop Obsidian's chrome (`button:not(.clickable-icon)` background and shadow, the fixed height, centring). Scoped, the element rules weigh (0,1,1), the button rule (0,1,2) through `button:not(svg)`: above Obsidian's element rules, hover and focus included, below every Tailwind utility (0,2,0). Nuxt UI's variants keep the last word. Text inputs are not reset: Obsidian's `input[type=text]:hover`/`:active` weigh (0,2,1) and would beat a reset that stays below the utilities; they change only the hover fill and the pressed ring.
- **Derived colour tokens, never the host hues raw.** Obsidian's status and accent colours are hues: in the default light theme the warning is 2.95:1 on white, the error 4.20:1, white on the accent 3.42:1. `src/styles/tokens.css` derives, from host variables only, text shades (`--wm-primary-fg`, `--wm-warn-fg`, `--wm-bad-fg`, `--wm-ok-fg`: the hue 55 % into `--text-normal`), fill shades under `--text-on-accent` (`--wm-*-fill`: the hue 60 % with black) and a field boundary (`--wm-line-strong`: `--text-muted` 70 % into the background). One formula per token holds in light and dark, so a community theme gets the same treatment. `bridge.css` wires them into Nuxt UI's roles; on solid fills (the element with `wm:text-inverted`) the roles switch to the fill shades. The accent-derived look stays; whether the primary becomes neutral, as the design handoff has it, is an open owner question. The raw accent remains for focus outlines (3:1).
- **State not by colour alone.** The selected community carries a check mark, the current page a bar.
- **The harness plays Obsidian.** Its fake host holds the default theme's values read from the running app and Obsidian's base rules that reach plugin markup, and the dev server scopes exactly as the build does (the scope transform ignores the line break before a selector).
- **Proof.** `tests/e2e/specs/appearance.e2e.ts` measures computed styles and the contrast of every visible text, light and dark, in Obsidian.

## Amendment, 2026-11-22: the clock is a port

PBI-61, criterion 4. Values derived from the date ("overdue") need the user's local day, and a view may stay open overnight.

- **`Today` is a port of the shell module** (`src/application/shell/today.ts`), like `DeviceStore`: one field of `AppAdapters`, an Obsidian adapter that reads the machine's clock in its local time zone, and an in-memory adapter whose day a test or the harness sets. A rule that depends on the date takes the day as a value (`YYYY-MM-DD`) instead of reading the clock.
- **Its one timer belongs to the runtime and to the plugin.** The Obsidian adapter keeps a single window timer, cleared by `plugin.register` when Obsidian unloads the plugin and by the runtime's scope when it is disposed, so neither an unload nor a failed bootstrap leaves it behind (as the host event listeners, ADR 0004). It looks at the clock at local midnight and at least once a minute, because a timer counts awake time, not the clock: a changed system clock or a sleep across midnight is published within a minute, and a read is right at once.
- **Mechanics** are in [architecture.md](../engineering/architecture.md#today).
