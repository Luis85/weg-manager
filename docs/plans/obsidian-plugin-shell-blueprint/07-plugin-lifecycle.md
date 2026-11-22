# Task 07 · Plugin entry and lifecycle

Phase A. Needs: Task 06.

**Goal.** Loading registers everything the plugin offers and returns fast; unloading releases everything in reverse order, also after a failed or aborted load; a second load behaves like the first. The settings tab holds only plugin-wide technical settings.

## Files

Create: `src/main.ts`, `src/bootstrap.ts`, `src/infrastructure/obsidian/shell/{run,commands,ribbon,settings-mirror,settings-tab,shell-view}.ts` (`shell-view.ts` is a bare `ItemView` under `SHELL_VIEW_TYPE = "<plugin-id>-view"` until Task 10). Tests: `tests/dom/lifecycle.test.ts`, `tests/dom/bootstrap.test.ts`, `tests/dom/external-settings.test.ts`, `tests/dom/language.test.ts`, `tests/dom/infrastructure/shell/{commands,settings-tab}.test.ts`, `tests/unit/infrastructure/shell/{run,settings-mirror}.test.ts`. Modify: `configs/fallow.config.mjs` (the zone and rule `composition`, without the presentation names, which follow in Task 09; Task 03 table), then `npm run fallow:config`.

## Steps

- [ ] **1. `runSafely(runtime, effect)`** (`run.ts`): runs an effect and never rejects; an interruption is silent, anything unexpected goes to `reportUnexpected` once. Every command callback, settings control and bootstrap log goes through it. Test: `tests/unit/infrastructure/shell/run.test.ts`.
- [ ] **2. `registerCommands(plugin, runtime, appCommands, messages, open)`** (`commands.ts`): one `addCommand` per `PluginCommand`, no `hotkeys`, the name from the module's part of the catalog; `open: (route?: Route) => Promise<unknown>` (the route type is `never` until Task 10 adds `Route`); `open` actions call `open(route)`, `run` actions call `runSafely`. It returns the undo, and if one `addCommand` throws it removes what it added itself before rethrowing. Test: `tests/dom/infrastructure/shell/commands.test.ts`.
- [ ] **3. The settings mirror and tab.** `mirrorSettings(runtime)` (`settings-mirror.ts`) keeps a synchronous copy of `SettingsService.current` and `status` (Obsidian reads control values synchronously) with `refresh()` and `stop()`. `ShellSettingTab extends PluginSettingTab` (`settings-tab.ts`) uses the declarative API (`getSettingDefinitions`, `getControlValue`, `setControlValue`, with `validate`): one dropdown for the log level with labels from the catalog and the stored values unchanged; when the file is read-only, the dropdown is disabled and a row says why, with the issues link. It holds nothing a view edits (global constraint 15). Test: `tests/dom/infrastructure/shell/settings-tab.test.ts` (one control, the change saved through `setLogLevel`, read-only state, no duplicate rows after `update()`).
- [ ] **4. The ribbon** (`ribbon.ts`): `addRibbonIcon(plugin, open)` with the title `PRODUCT_NAME` in every language (Obsidian keys the entry `<plugin-id>:<title>`; a translated title would lose the user's position and hidden state; L27). The user hides it through the ribbon's context menu; there is no "show ribbon icon" setting.
- [ ] **5. `bootstrap(plugin, { signal })`** (`src/bootstrap.ts`) returns `{ runtime, reloadSettings, dispose }`. Tests first in `tests/dom/lifecycle.test.ts` and `tests/dom/bootstrap.test.ts`, then implement in this order:
  1. `makeRuntime(appLayer(plugin, { developmentMode: import.meta.env.MODE === "development", language: hostLanguage() }))`;
  2. `await mirrorSettings(runtime)` (the first use builds the Layers; `SettingsService` loads `data.json`); push `mirror.stop()` onto `undo`;
  3. **aborted?** (`signal.aborted`, checked as a function after each `await`) → dispose and return an inert handle that registers nothing;
  4. read `Messages` once; `registerCommands(…)`; push an undo that removes the commands **only if the load never finished** (on a normal unload Obsidian removes them, and removing by id could hit the commands of a quick re-enable; L28);
  5. create the settings tab; `addRibbonIcon` after everything that can fail (a normal unload releases the entry, which stays in `leftRibbon.items` without button and callback; after a failed `onload` nothing releases it, and there is no public API to remove it; L27);
  6. `addSettingTab`, then `registerView` last (Obsidian cannot unregister them one by one): now `registerView(SHELL_VIEW_TYPE, (leaf) => new ShellView(leaf))`, the bare view; Task 10 makes it `new ShellView(leaf, runtime, surfaces, appSurface)`. Create `const surfaces = new Set<() => void>()` now: from Task 10 each open view puts the close of its surface into it. Push an undo that empties the set and runs every close through `releaseAll` (Task 09; until then a loop that calls each), which therefore runs **first** on dispose, before the runtime goes;
  7. log `plugin.loaded`; mark started.
  `dispose` runs the undo steps in reverse order one after the other; a failing step does not stop the others or `runtime.dispose()`; the first error is rethrown at the end. If any step throws: `reportDefect(error)` (or `reportUnloadFailure` if the runtime is unusable), dispose, rethrow.
- [ ] **6. `reportUnloadFailure(cause)`**: the last resort when the runtime is gone: a random six-character id, one console-sink entry `plugin.unload.failed`, and the defect notice in the language `hostLanguage()` gives now.
- [ ] **7. `src/main.ts`**, composition only (`<PluginClass> extends Plugin`, default export; oxlint bans `effect` and Vue here): `onload` creates an `AbortController` and awaits `bootstrap(this, { signal })`; `onunload` (synchronous) aborts, then disposes the handle and reports a failing dispose through `reportUnloadFailure` (a failed bootstrap has reported itself); `onExternalSettingsChange` waits for a load still in progress and calls `handle.reloadSettings()`, which reruns `SettingsService.reload`, refreshes the mirror and calls the tab's `update()`; after an unload or a failed load it does nothing. Obsidian calls `onExternalSettingsChange` itself when its file watcher sees `data.json` change and the file's time differs from the plugin's last `loadData`/`saveData`; it is not called for the plugin's own save.
- [ ] **8. Lifecycle tests** (`tests/dom/lifecycle.test.ts`, `tests/dom/bootstrap.test.ts`, `tests/dom/external-settings.test.ts`):
  - after `load()`: the shell's commands, one view type, one settings tab, one ribbon entry;
  - a `run` command whose effect dies: one notice with an incident id, one `error` entry, the next command still works;
  - **disable → enable → disable on one instance**: counts after the second load equal the first; nothing survives the second unload;
  - **unload while load is pending** (`holdLoadData`, then `unload()`, then `releaseLoadData`): the runtime is disposed and nothing is registered;
  - `failLoadData`: the plugin loads, commands exist, one notice explains that settings are read-only;
  - `failNextAddCommand`: everything created so far is released, one defect notice (product name, incident id, no raw error), the error rethrown, no ribbon entry left behind;
  - `data.json` written from outside (`writeExternally`) then `onExternalSettingsChange`: the tab shows the new level; a newer-version file turns the tab read-only and is never written; an unreadable or partially invalid file falls back per field;
  - `getLanguage()` switched (`tests/dom/language.test.ts`): command names, tab and notices in the other language; the ribbon title unchanged.
  Task 13 adds `tests/dom/event-listeners.test.ts` (host event listeners across loads), once there are listeners to count.

## Done when

`npm run verify` exits 0 and every case of step 8 passes. The dispose order (surfaces closed before the runtime) gets its discriminating check in Task 10, once a view has a surface. Commit `feat: plugin lifecycle, commands, ribbon and settings tab`. Task 12 repeats the lifecycle cases in real Obsidian.
