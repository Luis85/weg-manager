# Adding a feature

The walking skeleton (greeting and markdown file count) is the worked example. Each step lists the file it uses as a model and the test that comes **first**: write it, see it fail, then implement.

1. **Domain rule** (`src/domain/settings.ts`). Pure functions and Effect Schema, no services. Test: `tests/unit/domain/*.test.ts`, with exact issue texts in German.
2. **Port, service, use case** (`src/application/`).
   - A new capability the host provides becomes a port in `ports.ts`.
   - A new expected failure becomes a tagged error, as described in [error-handling.md](error-handling.md).
   - The use case in `use-cases.ts` is the only API presentation calls.
   - To react to vault or workspace changes, subscribe via `EventBus.on("FileCreated")` (or `subscribe` for a forked consumer) instead of listening to Obsidian. A new kind of event, including a domain event, becomes a member of `AppEvent` (see [ADR 0004](../adr/0004-event-system.md)). Wait for `LayoutReady` before reading the vault's state. In a component, use `useAppEvents(handler)` from `src/presentation/runtime/use-runtime.ts`, and debounce work that reacts to file changes (see `ShellPanel.vue`, which recounts 300 ms after a burst of Markdown changes).
   - Test: `tests/unit/application/*.test.ts` with the in-memory Layers from `tests/support/layers.ts`; `recordingEventBus()` records what was published.
3. **Adapter** (`src/infrastructure/obsidian/layers.ts`). This is the only place that touches the `obsidian` API. Add the Layer to `appLayer`. Test: `tests/dom/infrastructure/*.test.ts` against the Obsidian double. Extend the double in `tests/support/obsidian/` when the API you need is missing.
4. **Component** (`src/presentation/components/`).
   - Call the use case through `useEffectAction(useCase)` and read state through `useSettings()`.
   - Render failures with `ErrorNotice.vue`.
   - Every form uses TanStack Form (`useForm`), and its validators call the domain rule (see `GreetingForm.vue`). Never duplicate a rule in a component.
   - Import Nuxt UI components explicitly (`@nuxt/ui/components/Button.vue`). Prefix every Tailwind class with `wm:`.
   - A Nuxt UI component that is new to the plugin goes into the `@source` lists in `src/styles/app.css`. A new icon goes into `SHELL_ICONS` in `vite.shared.ts`.
   - Test: `tests/dom/presentation/*.test.ts` through `mountSurface` with `testRuntime()` from `tests/support/runtime.ts`.
5. **Registration** (`src/bootstrap.ts`). Push an undo step for everything you register, so a failed bootstrap releases it. Test: `tests/dom/lifecycle.test.ts`.
6. **Harness scenario** (`harness/layers.ts`). Make the new states reachable through `?scenario=`. Test: `tests/unit/harness-layers.test.ts`.
7. **Gate.** `npm run verify` exits 0. Before pushing a change to domain or application, run `npm run test:mutation`.

## Checklist for a new view

Each item needs a passing test:

- [ ] Disable → enable → disable in one session, and unload while load is pending: nothing leaks, and the second load behaves like the first.
- [ ] `data.json` missing, corrupt, partially invalid, or from a newer version: the plugin still loads, invalid fields fall back one by one, and a read-only file is never written.
- [ ] A host theme switch while the view is open: the view follows it without reopening.
- [ ] The view in a pop-out window: its app, portals and theme binding live in the leaf's `ownerDocument`.
- [ ] Two views open, one closed: the other keeps working.
