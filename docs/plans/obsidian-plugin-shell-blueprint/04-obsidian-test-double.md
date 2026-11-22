# Task 04 · The Obsidian test double

Phase A. Needs: Task 02.

**Goal.** An in-memory double of the parts of the `obsidian` API the shell uses, so lifecycle, commands, settings tab and views run in Vitest. It copies Obsidian's behaviour, including the surprising parts this plan names; the vault half (vault, metadata cache, file manager) comes in Task 13 with the fidelity scenarios that compare it with real Obsidian (L31).

## Files

Create under `tests/support/obsidian/`: `index.ts`, `component.ts`, `events.ts`, `plugin.ts`, `app.ts`, `workspace.ts`, `views.ts`, `ribbon.ts`, `settings.ts`, `notice.ts`, `dom.ts`, `language.ts`, `paths.ts`, and `local-storage.ts` only with step 10. Create `tests/support/dom-setup.ts`, `tests/unit/support/obsidian-double.test.ts`, `tests/unit/support/test-manifest.test.ts`, `tests/dom/obsidian-guard.test.ts`.

Install (`devDependencies`): `happy-dom`. (`obsidian` is installed since Task 02.)

## Steps

- [ ] **0. The `dom` project.** Add it to `configs/vitest.config.ts` now (Task 02 step 6) with `setupFiles: ["tests/support/dom-setup.ts"]`; its first test is `tests/dom/obsidian-guard.test.ts`.
- [ ] **1. Opt-in.** A suite that needs the double writes `vi.mock("obsidian", () => import("@test/obsidian"))`; without it the Task 02 guard throws. Turn the `it.todo` alias case of `tests/unit/obsidian-guard.test.ts` into a test (`await import("@test/obsidian")` gives a `Plugin` function) and add the same pair of cases for the dom project (`tests/dom/obsidian-guard.test.ts`).
- [ ] **2. `Component`** with Obsidian's semantics: `load()`; `unload()` calls `onunload`, then runs `register` callbacks and releases `registerEvent` refs in reverse order; `registerDomEvent`, `registerInterval`. Test each order.
- [ ] **3. `Events`** with `on`, `off`, `offref` (by identity; an unknown or already removed ref is ignored, as in Obsidian), `trigger(name, ...args)`, and the test helper `listenerCount(name?)`.
- [ ] **4. `Plugin extends Component`** with `app`, `manifest`, `loadData`, `saveData`, `addCommand` (the id is prefixed `<plugin-id>:` as Obsidian does), `removeCommand`, `addRibbonIcon`, `addSettingTab`, `registerView`, `onExternalSettingsChange`; registrations are cleared by `unload()`. `TEST_MANIFEST` repeats `manifest.json`'s `id`, `minAppVersion` and `isDesktopOnly` (`tests/unit/support/test-manifest.test.ts` pins them equal). `createTestPlugin(PluginClass, options?)` returns `{ plugin, registry }`; `registry` exposes `commands`, `views`, `settingTabs`, `ribbonIcons`, `notices`, `saved`, `runCommand(id)`, `load()`, and the knobs `failNextAddCommand({ after? })`, `setFailLoadData`, `holdLoadData`/`releaseLoadData` (for "unload while load is pending"), `writeExternally(data)` (a `data.json` changed outside, as Sync does).
- [ ] **5. Ribbon** (`ribbon.ts`) as Obsidian 1.15.1 keeps it: entries in `app.workspace.leftRibbon.items` keyed `<plugin-id>:<title>`; `icon.remove()` removes the element but leaves the entry, which comes back on the ribbon's next `onChange()` (L27); a normal `unload()` removes the entry.
- [ ] **6. Workspace and views.** `App.workspace` is an `Events` with `layoutReady` (default `true`), `markLayoutReady()`, `onLayoutReady(cb)` (runs at once when ready), `getLeavesOfType`, `getLeaf(mode)` recording each mode in `workspace.leafRequests`, `revealLeaf`, `requestSaveLayout` counted in `workspace.layoutSaves`. `WorkspaceLeaf` with `openIn(document)` to simulate a pop-out, `setViewState` as in Obsidian 1.15.1 (a new view type opens the view, then the view gets the state; an open view of the same type is kept and only gets the new state), `openFile` recorded in `leaf.openedFiles`. `View`/`ItemView` with `contentEl`, `getState`/`setState`, `navigation` (default `false`), `onOpen`/`onClose`, and Obsidian's order: `onOpen` runs before `setState`.
- [ ] **7. Settings.** `PluginSettingTab` with the declarative API (`getSettingDefinitions`, `getControlValue`, `setControlValue`, `update()`, Obsidian 1.13 and later) and a renderer `settingsIn(tab)` that tests read; `Setting`, `TextComponent`, `ToggleComponent`, `DropdownComponent` for what the renderer builds; a `pending` handle that settles after each change, so tests wait on it, not on a timer (Task 09, *Waiting*).
- [ ] **8. Notices and DOM.** `Notice` recording each message (`recordedNotices`, `clearNotices`, `failNextNotice`). `installDomExtensions(window)` adds `empty`, `createEl`, `createDiv`, `createSpan`, `setText`, `addClass`, `removeClass`, `toggleClass` to `HTMLElement.prototype`; `tests/support/dom-setup.ts` calls it for the dom project. Presentation code never uses these (it runs in a plain browser in the harness).
- [ ] **9. Language and platform.** `getLanguage()` returns `DEFAULT_TEST_LANGUAGE` = `<test-language>`; `setLanguage(code)` switches it, and a suite that switches sets it back in `afterEach`. `apiVersion` = `<min-app-version>`. `Platform` with every flag the plugin reads (`isDesktop`, `isMobile`, `isDesktopApp`, `isMobileApp`, `isIosApp`, `isAndroidApp`, `isPhone`, `isTablet`, `isMacOS`, `isWin`, `isLinux`, `isSafari`).
- [ ] **10. Local storage** (`local-storage.ts`, on `App`): `loadLocalStorage(key)`/`saveLocalStorage(key, value)` storing JSON per vault; a falsy value clears the key, as Obsidian does; a broken entry reads as `null`; `app.localStorage.setRaw` plants a raw entry. Build this step only when the plugin has a per-device value (*What the shell leaves to the plugin* in the README); otherwise skip it and its case in step 12.
- [ ] **11. Paths.** `normalizePath` as Obsidian 1.15.1's: slashes and backslashes collapse to one `/`, leading and trailing ones go, an empty result is `/`, non-breaking spaces become spaces, NFC; it neither trims spaces nor resolves `.` or `..`. Task 13's e2e spec compares it with the real one. The vault-side files follow in Task 13.
- [ ] **12. The double's own test** (`tests/unit/support/obsidian-double.test.ts`): unload order, `offref` idempotence, the ribbon entry surviving `icon.remove()`, `setViewState` on an open view keeping the view, `onOpen` before `setState`, and the falsy local-storage value when step 10 was built. Task 13 adds the fidelity scenarios to this file.

## Rules for the double

- **Copy Obsidian, not an ideal.** Each behaviour above was measured in Obsidian 1.15.1; the ribbon is compared with real Obsidian by `lifecycle.e2e.ts` and `setViewState` by `navigation.e2e.ts` (Task 12). Where a later e2e spec (Task 12, Task 13) finds a difference, change the double and keep the expectation (L31).
- **Typed against the real API.** Untested proposal: write each class of the double with `satisfies Pick<…>` against the types of the `obsidian` package, so a drift from `obsidian.d.ts` fails typecheck; joined through casts (`as never`, `as unknown as`), a drift stays invisible. If a class cannot satisfy the real type without modelling far more of the API than the plugin uses, keep the cast for that class and name it in a comment.
- fallow's `unused-class-members` rule is off for `tests/support/obsidian/**` (Task 03): the double mirrors an API, not only what today's tests call.

## Done when

`npm run verify` exits 0, the guard tests pass in both projects, and the double's own tests pass. Commit `test: obsidian test double`.

Not modelled, and not compared with Obsidian beyond the log level dropdown and the read-only state of the settings tab: the rest of the settings renderer, lazily loaded background tabs, `getLeaf(false)` reuse and layout restore (see *Known gaps* in the README).
