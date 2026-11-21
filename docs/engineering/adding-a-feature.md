# Adding a feature

The walking skeleton (greeting and markdown file count) is the worked example. Each step lists the file it uses as a model and the test that comes **first**: write it, see it fail, then implement.

1. **Domain rule** (`src/domain/settings.ts`). Pure functions and Effect Schema, no services, no language: a broken rule is a `SettingsIssue` code with its data (`{ code: "greeting.length", max }`). Test: `tests/unit/domain/*.test.ts`, with the exact issues.
   - Word each new issue code in both catalogs (`src/application/i18n/de.ts`, `en.ts`) and pin both sentences in `tests/unit/application/i18n.test.ts`.
2. **Port, service, use case** (`src/application/`).
   - A new capability the host provides becomes a port in `ports.ts`.
   - A new expected failure becomes a tagged error, as described in [error-handling.md](error-handling.md).
   - The use case in `use-cases.ts` is the only API presentation calls.
   - A text the user sees (notice, command name, label) is a key in `Catalog` with a German and an English value; take the catalog with `yield* Messages`. Never write a literal user-visible string outside `src/application/i18n/`.
   - To react to vault or workspace changes, subscribe via `EventBus.on("FileCreated")` (or `subscribe` for a forked consumer) instead of listening to Obsidian. A new kind of event, including a domain event, becomes a member of `AppEvent` (see [ADR 0004](../adr/0004-event-system.md)). Wait for `LayoutReady` before reading the vault's state. In a component, use `useAppEvents(handler)` from `src/presentation/runtime/use-runtime.ts`, and debounce work that reacts to file changes (see `ShellPanel.vue`, which recounts 300 ms after a burst of Markdown changes).
   - Test: `tests/unit/application/*.test.ts` with the in-memory Layers from `tests/support/layers.ts`; `recordingEventBus()` records what was published.
3. **Adapter** (`src/infrastructure/obsidian/layers.ts`). This is the only place that touches the `obsidian` API. Add the Layer to `appLayer`. Test: `tests/dom/infrastructure/*.test.ts` against the Obsidian double. Extend the double in `tests/support/obsidian/` when the API you need is missing.
4. **Component** (`src/presentation/components/`).
   - Call the use case through `useEffectAction(useCase)`, read state through `useSettings()` and texts through `useMessages()`.
   - Render failures with `ErrorNotice.vue`.
   - Every form uses TanStack Form (`useForm`), and its validators call the domain rule (see `GreetingForm.vue`). Never duplicate a rule in a component.
   - Each setting has exactly one edit location: plugin-wide technical settings (the log level) in Obsidian's settings tab (`src/infrastructure/obsidian/settings-tab.ts`), feature data (the greeting) in the plugin's views. The other place shows the value read-only at most (PBI-49).
   - Import Nuxt UI components explicitly (`@nuxt/ui/components/Button.vue`). Prefix every Tailwind class with `wm:`.
   - A Nuxt UI component that is new to the plugin goes into the `@source` lists in `src/styles/app.css`. A new icon goes into `SHELL_ICONS` in `configs/vite.shared.ts`.
   - Test: `tests/dom/presentation/*.test.ts` through `mountSurface` with `testRuntime()` from `tests/support/runtime.ts` (German by default; `testRuntime({ language: "en" })` for English).
5. **Registration** (`src/bootstrap.ts`). Push an undo step for everything you register, so a failed bootstrap releases it. Test: `tests/dom/lifecycle.test.ts`.
6. **Harness scenario** (`harness/layers.ts`). Make the new states reachable through `?scenario=`. Test: `tests/unit/harness-layers.test.ts`.
7. **Gate.** `npm run verify` exits 0. Before pushing a change to domain or application, run `npm run test:mutation`.

## Writing to the vault

The shell only reads the vault so far. The first feature that writes notes adds a `VaultWriter` port in `src/application/ports.ts` and its adapter in `src/infrastructure/obsidian/`. That adapter is the only code that changes vault files, and it uses only these Obsidian APIs (DevDocs *Plugin guidelines* §Vault and the self-critique checklist):

- **Change a note's body** with `app.vault.process(file, fn)`. It reads and writes atomically, so a concurrent edit is not lost. Never `read` and then `modify`.
- **Change frontmatter** with `app.fileManager.processFrontMatter(file, fn)`. It keeps the YAML format and the rest of the note intact. Never edit the YAML as text. Frontmatter notes are the product's data model, so this is the common path.
- **Create a note** with `app.vault.create(path, data)`, and a folder with `app.vault.createFolder(path)`.
- **Delete a note** with `app.fileManager.trashFile(file)`. It respects the user's *Deleted files* setting. Never `vault.delete`.
- **Rename or move** with `app.fileManager.renameFile(file, newPath)`, so links are updated.
- **Build every path** with `normalizePath()`, including ones from settings or user input.
- **Use the Vault API, not `vault.adapter`.** The adapter skips Obsidian's cache and its safety checks. `data.json` stays with `loadData`/`saveData`.
- **Find files without scanning.** Do not call `getFiles()` or `getMarkdownFiles()` in a hot path (an event handler, a render, a loop). Use `getFileByPath`/`getAbstractFileByPath` for a known path and `metadataCache` for frontmatter. Keep any full scan behind `LayoutReady` and a debounce, as the file count does.

The port speaks in domain terms (a point, a contact, a draft), not in `TFile`. Each write that can fail (missing file, read-only vault) becomes a tagged `AppError` with a `describeError` text in both catalogs. Test the adapter against the Obsidian double, and extend the double with these methods when you need them.

## Checklist for a new view

Each item needs a passing test:

- [ ] Disable → enable → disable in one session, and unload while load is pending: nothing leaks, and the second load behaves like the first.
- [ ] `data.json` missing, corrupt, partially invalid, or from a newer version: the plugin still loads, invalid fields fall back one by one, and a read-only file is never written.
- [ ] A host theme switch while the view is open: the view follows it without reopening.
- [ ] The view in a pop-out window: its app, portals and theme binding live in the leaf's `ownerDocument`.
- [ ] Two views open, one closed: the other keeps working.
