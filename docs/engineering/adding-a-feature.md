# Adding a feature

The walking skeleton (greeting and markdown file count) in module `shell` is the worked example. A new module gets a folder per layer; see [Modules](architecture.md#modules) for its `index.ts` and the composing files. Each step lists the file it uses as a model and the test that comes **first**: write it, see it fail, then implement.

1. **Domain rule** (`src/domain/shell/settings.ts`). Pure functions and Effect Schema, no services, no language: a broken rule is a `SettingsIssue` code with its data (`{ code: "greeting.length", max }`). Test: `tests/unit/domain/<module>/*.test.ts`, with the exact issues.
   - A new setting is one entry in `FIELDS` in `settings.ts` plus its key in `Settings` and its issue code; see [Settings](architecture.md#settings). Decode, patch validation and encode follow from it.
   - Word each new issue code in both catalogs (`src/application/shell/i18n/de.ts`, `en.ts`) and pin both sentences in `tests/unit/application/shell/i18n.test.ts`.
2. **Port, service, use case** (`src/application/shell/`).
   - A new capability the host provides becomes a port in the module's `ports.ts`.
   - A new expected failure becomes a tagged error, as described in [error-handling.md](error-handling.md).
   - The use case in the module's `use-cases.ts`, exported from its `index.ts`, is the only API presentation calls.
   - A text the user sees (notice, command name, label) is a key in the module's catalog part (`ShellCatalog`) with a German and an English value; take the catalog with `yield* Messages` and read your part (`.shell`). Never write a literal user-visible string outside `src/application/shell/i18n/`.
   - To react to vault or workspace changes, subscribe via `EventBus.on("FileCreated")` (or `subscribe` for a forked consumer) instead of listening to Obsidian. A new kind of event, including a domain event, becomes a member of the module's event record (`ShellEvents`), which `AppEvent` includes (see [ADR 0004](../adr/0004-event-system.md)). Wait for `LayoutReady` before reading the vault's state. In a component, use `useAppEvents(handler)`, and debounce work that reacts to file changes (see `ShellPanel.vue`, which recounts 300 ms after a burst of Markdown changes).
   - A value that a view follows (the settings, later the community selection) is a pair a use case hands out: an effect that reads it now, which must not suspend, and a stream of its changes, ideally `SubscriptionRef.changes`, which emits the current value first.
   - Test: `tests/unit/application/shell/*.test.ts` with the in-memory Layers from `tests/support/layers.ts`; `recordingEventBus()` records what was published.
3. **Adapter** (`src/infrastructure/obsidian/shell/layers.ts`). This is the only place that touches the `obsidian` API. Add the Layer to the module's Layer (`shellLayer`), which `appLayer` merges. Test: `tests/dom/infrastructure/shell/*.test.ts` against the Obsidian double. Extend the double in `tests/support/obsidian/` when the API you need is missing.
4. **Component** (`src/presentation/shell/components/`). A feature module imports the shell's presentation only from `src/presentation/shell/index.ts`.
   - Run a read through `useQuery(useCase)` and a state change through `useCommand(useCase)`. Follow a value with `useStream(read, changes)`: the ref holds `read`'s value from the first render on and follows `changes` until the component's scope ends; a defect is reported once. Read settings through `useSettings()` and texts through `useMessages()`.
     - `useQuery`: the latest call wins. A second `run` interrupts the first, and closing the view interrupts a pending run.
     - `useCommand`: nothing in the view interrupts it. A `run` while one is pending returns the pending run's promise and starts nothing, so disable the control on `pending`. After the view closed, the command still finishes; a typed failure then becomes a notice.
     - A use case that writes must make its write atomic with respect to interruption: once a write that cannot be cancelled has started, setting the in-memory state runs uninterruptibly with it (see `SettingsService.update`). Plugin unload can still interrupt a command.
   - Render failures with `ErrorNotice.vue`.
   - Every form uses TanStack Form (`useForm`), and its validators call the domain rule (see `GreetingForm.vue`). Never duplicate a rule in a component.
   - Each setting has exactly one edit location: plugin-wide technical settings (the log level) in Obsidian's settings tab (`src/infrastructure/obsidian/shell/settings-tab.ts`), feature data (the greeting) in the plugin's views. The other place shows the value read-only at most (PBI-49).
   - Import Nuxt UI components explicitly (`@nuxt/ui/components/Button.vue`). Prefix every Tailwind class with `wm:`.
   - A Nuxt UI component that is new to the plugin goes into the `@source` lists in `src/styles/app.css`. A new icon goes into `SHELL_ICONS` in `configs/vite.shared.ts`.
   - Test: `tests/dom/presentation/shell/*.test.ts` through `mountApp` (`tests/support/surface.ts`) with `testRuntime()` from `tests/support/runtime.ts` (German by default; `testRuntime({ language: "en" })` for English).
5. **Route and screen** (ADR 0008). A screen of its own is a route, never a placeholder: add it only with the screen.
   - Add the route schema to the module's application layer and to the union in `src/application/routes.ts`:

     ```ts
     // src/application/communities/routes.ts
     export const CommunitiesRoute = Schema.Struct({
       name: Schema.Literal("settings"),
       section: Schema.Literal("communities"),
     });
     // src/application/routes.ts
     const Route = Schema.Union([ShellRoute, CommunitiesRoute]);
     ```

   - Offer the screen from the module's presentation `index.ts` (`communitiesScreens = { settings: CommunitySettings }`, like `shellScreens`) and map the name in `src/presentation/app-surface.ts`, with a navigation entry if it should have one. Typecheck fails until every route name has a screen.

     ```ts
     settings: () => import("./communities").then(({ communitiesScreens }) => communitiesScreens.settings),
     ```

   - The screen reads its route with `useRoute()` and moves on with `useNavigate()`. A record that no longer exists renders `NotFoundState` from the shell's index.
   - A command that opens the screen calls `openRoute(plugin.app.workspace, route)`.
   - Test: navigation through `mountTest` with test routes, or the app's routes through `mountApp` (`tests/support/surface.ts`); the decoder's fallbacks in `tests/unit/application/`.
6. **Registration** (`src/bootstrap.ts`). Push an undo step for everything you register, so a failed bootstrap releases it. Test: `tests/dom/lifecycle.test.ts`.
7. **Harness scenario** (`harness/layers.ts`). Make the new states reachable through `?scenario=`. Test: `tests/unit/harness-layers.test.ts`.
8. **Gate.** `npm run verify` exits 0. Before pushing a change to domain or application, run `npm run test:mutation`.

## Writing to the vault

Every feature reads and writes notes through the `NoteStore` port of module `notes` (`src/application/notes/`, ADR 0007); see [Architecture → Vault notes](architecture.md#vault-notes). Import it from the module's index. The Obsidian adapter (`src/infrastructure/obsidian/notes/`) is the only code that changes vault files; a feature adds no vault adapter of its own.

- **Create a record** with `create({ folder, name, frontmatter, body })`. Folders come from settings and are created when missing; a taken name gets ` (2)`. A name is taken also in another case or Unicode form (`ahornweg` beside `Ahornweg`), as on Windows and macOS.
- **Change frontmatter** with `update(path, change)`. `change` runs inside Obsidian's atomic `processFrontMatter` on the frontmatter just read from the file and returns `Result.succeed({ set, remove })` or `Result.fail(yourError)` to write nothing. Write only the keys your type knows; the store keeps every other key, the key order and the body.
- **Delete** with `trash(path)`, **rename** with `rename(path, newName)`.
- **Read** with `list` (every record, by `schema`) and `read(path)`. Both come from the metadata cache, which catches up with a write a moment later: use the note a write returns, not a read right after it.
- **Never** call `vault.modify`, `vault.adapter`, or `read` followed by a write. A body change needs a contract section first (ADR 0007) and then a `NoteStore` call for it.
- **Find files without scanning.** Do not call `getFiles()` or `getMarkdownFiles()` in a hot path (an event handler, a render, a loop). `list` scans once; keep it behind `LayoutReady` and a debounce, as the file count does.
- **Errors.** The store's failures are tagged `AppError`s with texts in both catalogs. A failure your `change` decides on (a conflict) is your module's error and needs its own text.
- **Tests.** Use the in-memory adapter (`memoryNoteStore()` from `src/infrastructure/memory/notes`, also in `testRuntime().notes`) to seed notes, switch failures on and look behind the port.

## Checklist for a new view

Each item needs a passing test:

- [ ] Disable → enable → disable in one session, and unload while load is pending: nothing leaks, and the second load behaves like the first.
- [ ] `data.json` missing, corrupt, partially invalid, or from a newer version: the plugin still loads, invalid fields fall back one by one, and a read-only file is never written.
- [ ] A host theme switch while the view is open: the view follows it without reopening.
- [ ] The view in a pop-out window: its app, portals and theme binding live in the leaf's `ownerDocument`.
- [ ] Two views open, one closed: the other keeps working.

A view with routes also restores its route from the view state, falls back to the start route for a broken one, and keeps its own route beside a second view (`tests/dom/infrastructure/shell/view-state.test.ts`, `tests/e2e/specs/navigation.e2e.ts`).
