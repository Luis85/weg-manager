---
type: Research
status: entwurf
scope: mvp
date: 2026-11-21
---

# Plugin research: Obsidian best practices vs. this repo

**Question.** What are the current (2026-11-21) best practices for Obsidian community plugins, and where does `weg-manager` fall short?

**Sources, pinned:**
- [obsidian-developer-docs @ `1c26772`](https://github.com/obsidianmd/obsidian-developer-docs/tree/1c26772ac13d6e9870c865936d389fdfe694e742/en) (2026-10-21), cited as *DevDocs*. Published at docs.obsidian.md.
- [eslint-plugin @ `a998a59`](https://github.com/obsidianmd/eslint-plugin/tree/a998a5992b7bf9b6f3e0fe1e61a3ad180546f4a5) (2026-11-14). This is `eslint-plugin-obsidianmd` 0.6.0, the latest on npm (published 2026-11-14).
- [obsidian-sample-plugin @ `07ceb81`](https://github.com/obsidianmd/obsidian-sample-plugin/tree/07ceb81d1fb3384af611ebf665a1ec42a7e5926d).
- [obsidian-releases @ `cdf3619`](https://github.com/obsidianmd/obsidian-releases/tree/cdf3619e8bb9e5e34be04b9808bd3e5ad3f7406d).
- `node_modules/obsidian/obsidian.d.ts` 1.14.4.
- The [Obsidian changelog](https://obsidian.md/changelog/): 1.15.1 Desktop went public on 2026-11-12.

**Method.** I read the docs above and checked the repo's code. I built `dist/` (541 KB `main.js`, 62 KB `styles.css`; two builds gave identical bytes) and ran `eslint --print-config`. I also ran the plugin's `recommended` config on files the community scanner would see, and ran a rolldown lazy-import experiment.

## Result: top improvements

1. **High: a committed file would fail the directory's security scan.** `.claude/skills/archify/explainer/reader.js` assigns `innerHTML` at lines 455, 533 and 620.
   - Run with `recommended`, it gives 3 × `no-unsanitized/property` errors (checked).
   - The scanner files these as security findings and always rates them as errors. Its fixed ignore list does not cover `.claude/` or `.js` files. ([scanner config](https://github.com/obsidianmd/eslint-plugin/blob/a998a5992b7bf9b6f3e0fe1e61a3ad180546f4a5/docs/configuration.md#community-plugin-scanner-configuration), [FAQ](https://github.com/obsidianmd/obsidian-developer-docs/blob/1c26772ac13d6e9870c865936d389fdfe694e742/en/Community%20directory/Frequently%20asked%20questions.md))
   - The local gate hides this, because `eslint.config.mjs:25` ignores `.claude/**`.
   - **Fix:** keep agent tooling out of the scanned plugin repo. Either move it out of the repo, or use the private-source-repo option in [Manage your plugin](https://github.com/obsidianmd/obsidian-developer-docs/blob/1c26772ac13d6e9870c865936d389fdfe694e742/en/Community%20directory/Manage%20your%20plugin%20or%20theme.md). Add a `lint:scanner` step that runs `obsidianmd.configs.recommended` with *only* the scanner's ignore list.
2. **High: Vue components get no obsidianmd rules.** `eslint --print-config src/presentation/components/ShellApp.vue` lists zero `obsidianmd/*` rules.
   - The plugin's blocks are scoped to `**/*.{ts,js,…}` (eslint `lib/index.ts:447-523`). Its docs say to add rules back yourself for `.vue` files ([configuration.md](https://github.com/obsidianmd/eslint-plugin/blob/a998a5992b7bf9b6f3e0fe1e61a3ad180546f4a5/docs/configuration.md#core-js-rules-apply-only-to-js-and-ts-files)).
   - So the `AGENTS.md` rules (no `innerHTML`, `activeDocument`, `createEl`, timers) are not enforced in `src/presentation/components/*.vue`. These files are where most future UI code will live.
   - **Fix:** add an `eslint.config.mjs` block for `**/*.vue` that turns on the obsidianmd recommended rules (the type-aware ones too, since the Vue parser has `project`). Also turn on `vue/no-v-html: error`.
3. **Medium: the release has no build-provenance attestation.** `.github/workflows/release.yml:10-11` grants only `contents: write`, and there is no `actions/attest` step.
   - The official release workflow adds `id-token: write`, `attestations: write` and `actions/attest@v4` over `main.js`, `manifest.json` and `styles.css`. It says this is "recommended when you submit a plugin" ([Release with GitHub Actions](https://github.com/obsidianmd/obsidian-developer-docs/blob/1c26772ac13d6e9870c865936d389fdfe694e742/en/Plugins/Releasing/Release%20your%20plugin%20with%20GitHub%20Actions.md)).
   - **Fix:** add that step before `gh release create`.
4. **Medium: all of Vue and Nuxt UI is evaluated at plugin load.**
   - `src/bootstrap.ts:17` imports `releaseAll` from `presentation/mount`, and `src/infrastructure/obsidian/shell-view.ts:3` imports `mountSurface` statically. So Vue, Nuxt UI, reka-ui, VueUse, TanStack Form and tailwind-merge all run inside `onload`, even if the view is never opened.
   - DevDocs says to keep `onload` to registrations and to minify for release ([Optimize plugin load time](https://github.com/obsidianmd/obsidian-developer-docs/blob/1c26772ac13d6e9870c865936d389fdfe694e742/en/Plugins/Guides/Optimize%20plugin%20load%20time.md)).
   - Verified: with `codeSplitting: false`, Vite 8/rolldown turns a dynamic `import()` into a lazy `__esmMin` init wrapper. The module's top-level code runs only on the first `import()`.
   - **Fix:**
     - Move `releaseAll` into a presentation-free module.
     - Load `mount.ts` with `await import()` in `ShellView.onOpen`.
     - Measure before and after with Settings → General → Advanced → startup timer.
5. **Medium: Obsidian listeners are not tied to the plugin's own cleanup.**
   - `src/infrastructure/obsidian/events.ts:66-130` removes `vault`, `metadataCache` and `workspace` listeners with `offref` only when the Effect scope closes. `src/main.ts:21-24` starts that dispose without awaiting it.
   - So after `onunload` the listeners stay attached until an async chain finishes, and a quick re-enable can briefly run two runtimes.
   - DevDocs: register through `registerEvent` "so they're cleaned up when the plugin is disabled" ([Manage plugin lifecycle](https://github.com/obsidianmd/obsidian-developer-docs/blob/1c26772ac13d6e9870c865936d389fdfe694e742/en/Plugins/Guides/Manage%20plugin%20lifecycle.md)). The repo's own `AGENTS.md` says "listeners through `this.register*`".
   - **Fix:** also call `plugin.registerEvent(ref)` for each ref, keeping `offref` for the failed-bootstrap path. Calling `offref` twice is a no-op; this is not verified in Obsidian's source.

Also Medium: there is no `onExternalSettingsChange`, so a `data.json` changed by Sync is not reloaded. Details in §Settings.

## Practice table

| # | Practice | Source | Repo status | Gap | Improvement |
|---|---|---|---|---|---|
| 1 | Scanner lints every non-ignored `.ts`/`.js` file; `no-unsanitized` = security error | eslint-plugin [configuration.md §scanner](https://github.com/obsidianmd/eslint-plugin/blob/a998a5992b7bf9b6f3e0fe1e61a3ad180546f4a5/docs/configuration.md#community-plugin-scanner-configuration) | `.claude/skills/archify/explainer/reader.js:455,533,620` fail; `harness/main.ts` gives warnings (`document.*`, lines 12-43) | **High** | Keep tooling out of the scanned repo; add a local scanner-equivalent lint |
| 2 | Lint Vue SFCs with Obsidian rules yourself | eslint-plugin configuration.md §"Core JS rules apply only to JS and TS files" | No obsidianmd rules on `*.vue` (print-config) | **High** | Add a `**/*.vue` block with the obsidianmd rules and `vue/no-v-html` |
| 3 | Attest release assets | DevDocs *Release your plugin with GitHub Actions* | `release.yml` has no attest step | **Medium** | `actions/attest@v4` plus `id-token`/`attestations: write` |
| 4 | Keep `onload` light; production, minified build; defer startup UI to `onLayoutReady` | DevDocs *Optimize plugin load time*; *self-critique checklist* §Performance | Minified (`vite.config.ts:36`), no work at startup, but presentation is imported eagerly (`bootstrap.ts:17`, `shell-view.ts:3`) | **Medium** | Dynamic `import()` of `mount.ts` in `onOpen`; measure |
| 5 | Register Obsidian events via `registerEvent` | DevDocs *Manage plugin lifecycle*; *Plugin guidelines* §Resource management | `offref` on async dispose (`events.ts:125-129`, `main.ts:21`) | **Medium** | Add `plugin.registerEvent(ref)` |
| 6 | React to settings changed outside Obsidian (Sync) | `obsidian.d.ts:7367` `onExternalSettingsChange` (@since 1.5.7); DevDocs *Manifest* note | Not implemented (`grep` finds nothing in `src/`) | **Medium** | Implement it in `main.ts`; reload through `SettingsService`; call `tab.update()` |
| 7 | `isDesktopOnly` must match reality; README must not over-promise | DevDocs *Mobile development*, *Submission requirements* | `manifest.json:8` is `true`; README §Mobil (lines 54-60) shows mobile screens; decision K-09 asks for mobile | **Medium** | Mark the README mobile section as "planned"; add mobile e2e (`emulateMobile`) before lifting the flag |
| 8 | README states purpose and how to use; its excerpt is shown on the listing | DevDocs *Submit your plugin* §Before you begin | README has concept, prototype and dev sections, but no install/usage section | Low | Add "Installation" and "Benutzung"; an English summary is advisable |
| 9 | Description ≤ 250 chars, ends with ".", ideally starts with an action verb; follows the (English) style guide | DevDocs *Submission requirements* | 105 chars, ends with ".", German noun phrase (`manifest.json:6`) | Low | e.g. "Track open items, weekly work and follow-ups for German condominium (WEG) advisory boards." (see Open questions) |
| 10 | UI fonts via `--font-ui-*` | DevDocs *CSS variables/Foundations/Typography* | Tailwind `rem` scale (`--wm-text-sm: .875rem` in `dist/styles.css`) | Low | Map `--wm-text-xs/sm/base/lg` to `--font-ui-smaller/small/medium/large` in `tokens.css` |
| 11 | No hardcoded colours; use Obsidian variables | DevDocs *Plugin guidelines* §No hardcoded styling | Roles are mapped to Obsidian vars (`src/styles/tokens.css`); leftover Tailwind/Nuxt literals (`--wm-tw-ring-offset-color:#fff`, `--ui-chart-*` hex fallbacks, `--wm-color-old-neutral-*`) | Low | Override the ring-offset colour with `var(--background-primary)`; drop unused palettes |
| 12 | Avoid private API | DevDocs *Plugin guidelines* (global `app`, `activeLeaf`) by analogy | `ribbon.ts:15` casts `workspace.leftRibbon` to call undocumented `removeRibbonAction` | Low | Keep it on the failure path only (as now); cover it with an e2e test so a rename shows up. Resolved 2026-11-21: the icon is added after the commands, so the call is gone |
| 13 | App language via `getLanguage()` (1.8.7+) | `obsidian.d.ts:5075-5081`; rule `prefer-get-language` | German hard-wired; Nuxt UI `de` locale fixed (`ShellApp.vue:3,15`) | Low | Fine for the MVP; when English is added, choose by `getLanguage()`; use `moment` from `obsidian` for dates |
| 14 | "Less is safer": keep dependencies few | DevDocs *self-critique checklist* §Security | Effect, Vue, Nuxt UI (reka-ui, VueUse, tailwind-merge, Iconify), TanStack Form | Low | Record the trade-off in ADR 0001; audit before submission |
| 15 | View: build content in `onOpen`, `contentEl.empty()`; persist state via `getState`/`setState` | DevDocs *Views* | `shell-view.ts:34-39` appends without emptying; stateless | Low | `this.contentEl.empty()` before mounting; add state once the view shows a WEG or Punkt |
| 16 | Vault writes: `Vault.process`, `FileManager.processFrontMatter`, `trashFile`, `normalizePath`, no `getFiles()` scans, Vault over Adapter | DevDocs *Plugin guidelines* §Vault; *self-critique checklist* §API usage | Not yet applicable: only `getMarkdownFiles().length` (`layers.ts:39`), debounced (`recount.ts`) | Info | Make these the only write paths of the future `VaultWriter` port; frontmatter notes are the product's data model |

## Details by area

### Load time and bundle
- **Rule.** Only registrations in `onload`; release a minified production build; put startup work in `onLayoutReady`. Listening to `vault.on('create')` before the layout is ready fires once for every file ([DevDocs](https://github.com/obsidianmd/obsidian-developer-docs/blob/1c26772ac13d6e9870c865936d389fdfe694e742/en/Plugins/Guides/Optimize%20plugin%20load%20time.md)).
- **What complies:**
  - `onload` loads `data.json`, builds the Effect runtime and registers things (`bootstrap.ts:79-114`).
  - Host events are held back until `onLayoutReady` (`events.ts:40-58, 133-137`).
  - Minified, CJS, a single file.
- **The gap: everything is evaluated at require time.** Rough source-size shares from the source map: effect 2.7 MB, @vue/runtime-core 281 KB, @vueuse/core 274 KB, reka-ui 205 KB, @tanstack/form-core 120 KB, @nuxt/ui 110 KB, tailwind-merge 108 KB. These are source sizes, not minified sizes.
- **Lazy loading works in a single-file bundle.** Dynamic `import()` with `codeSplitting: false` compiles to a lazy `init_*()` wrapper (tested in the scratchpad with this repo's Vite 8). Bootstrap still needs Effect, so only the presentation half can be deferred.
- **Parse cost.** V8 compiles `main.js` in about 44 ms in Node 24. This is not an Obsidian number.

### Views and leaves
- **Complies with:**
  - Deferred views (1.7.2+). `openView` uses `getLeavesOfType()[0]` without casting `leaf.view`, then `await workspace.revealLeaf(leaf)` (`bootstrap.ts:34-40`) ([Defer views](https://github.com/obsidianmd/obsidian-developer-docs/blob/1c26772ac13d6e9870c865936d389fdfe694e742/en/Plugins/Guides/Defer%20views.md)).
  - Opens in the root split with `getLeaf(true)`, as [Workspace](https://github.com/obsidianmd/obsidian-developer-docs/blob/1c26772ac13d6e9870c865936d389fdfe694e742/en/Plugins/User%20interface/Workspace.md) advises.
  - No `detachLeavesOfType` on unload.
  - The factory `(leaf) => new ShellView(...)` keeps no view reference (`bootstrap.ts:105`).
- **Pop-out windows.** `mountSurface` and `bindHostTheme` use `root.ownerDocument` and its `defaultView.MutationObserver` (`mount.ts:42`, `theme.ts:22`), as [Support pop-out windows](https://github.com/obsidianmd/obsidian-developer-docs/blob/1c26772ac13d6e9870c865936d389fdfe694e742/en/Plugins/Guides/Support%20pop-out%20windows.md) asks.
- `events.ts:11` reads `activeDocument.body`. That is fine for the theme class.

### Lifecycle and events
See top item 5. Ribbon icon and commands are left to Obsidian on a normal unload, which is correct (`bootstrap.ts:92-102`).

### Settings
- **Complies with:**
  - Declarative `getSettingDefinitions` with overridden `getControlValue` and `setControlValue` (`settings-tab.ts:45-92`), as in [Settings §Custom settings storage](https://github.com/obsidianmd/obsidian-developer-docs/blob/1c26772ac13d6e9870c865936d389fdfe694e742/en/Plugins/User%20interface/Settings.md).
  - No headings, sentence case, `validate` calls the domain rule.
  - Stored data is re-validated on read (`domain/settings.ts:60-72`). This matches the doc's warning that "`validate` is a UI gate".
- **Gaps:**
  - No `onExternalSettingsChange` (table #6).
  - The read-only notice row is computed once when the tab is built; if the status can change, call `this.update()`. Whether it can change at runtime is not verified.

### Commands
Complies:
- `callback` for unconditional commands.
- No hotkeys.
- Ids without the plugin id (`commands.ts:6, 26-28`).
- Names without the plugin name.

These are the `commands/*` rules in `recommended` and the [Plugin guidelines §Commands](https://github.com/obsidianmd/obsidian-developer-docs/blob/1c26772ac13d6e9870c865936d389fdfe694e742/en/Plugins/Releasing/Plugin%20guidelines.md#commands).

### Styling and theming
- **Complies with:**
  - Every selector in `dist/styles.css` is scoped under `.weg-manager-root`, which `check-dist.mjs:60-72` enforces. No `@layer` survives. Nothing writes to `document.head`.
  - Tokens map to documented Obsidian variables (`--background-*`, `--text-*`, `--interactive-accent`, `--radius-s`, `--layer-modal`; all present in DevDocs *CSS variables/Foundations*).
  - Dark and light follow the `theme-dark` body class.
- **Gaps:** font scale (table #10) and literal leftovers (table #11).

### Accessibility
- DevDocs has no plugin accessibility page. I found only theme mentions.
- The repo already has `aria-live`/`aria-busy` (`ShellPanel.vue:60-66`), `:focus-visible` outlines and a `forced-colors` fallback (`bridge.css`).
- No gap against a primary Obsidian source.

### Mobile
- `isDesktopOnly: true` (`manifest.json:8`). The bundle has no Node or Electron requires: `check-dist.mjs:31-34` allows only host externals, and the built output has only `require("obsidian")`. No regex lookbehind was found in `dist/main.js`.
- So the only blocker is verification ([Mobile development](https://github.com/obsidianmd/obsidian-developer-docs/blob/1c26772ac13d6e9870c865936d389fdfe694e742/en/Plugins/Getting%20started/Mobile%20development.md)). The README should not imply mobile works yet (table #7).

### Security and policies
- **Complies with:**
  - No `innerHTML`, `eval` or `new Function` in `src/`. The notice is built with `createFragment` (`notices.ts:8-12`).
  - No network: `check-dist.mjs:35-37` checks this, and the README says "ohne Konto, Netz und KI".
  - No telemetry. MIT LICENSE. Lock file committed. `main.js` is not committed.
- **Bundle `innerHTML`.** `dist/main.js` contains 9 `innerHTML` uses from Vue runtime-dom and the Iconify SVG renderer. The scanner skips bundled output under `dist/`, so they are not reported. Not using `v-html` keeps them dormant; enforce that with gap #2.
- [Developer policies](https://github.com/obsidianmd/obsidian-developer-docs/blob/1c26772ac13d6e9870c865936d389fdfe694e742/en/Community%20directory/Developer%20policies.md).

### Release and submission
- **The process changed.** Submission now goes through [community.obsidian.md](https://community.obsidian.md), with automated review in four parts: Manifest, Releases, Source code, Build verification. The scanner builds with the first of `build`, `build:plugin` or `compile` ([Submit your plugin](https://github.com/obsidianmd/obsidian-developer-docs/blob/1c26772ac13d6e9870c865936d389fdfe694e742/en/Plugins/Releasing/Submit%20your%20plugin.md), FAQ). The old PR to `obsidian-releases` is no longer the path; that README now links to the docs.
- **Complies with:**
  - Bare semver tag equal to `manifest.version` (`package-release.mjs:18-23`).
  - Exactly three assets (`release.yml:41-42`).
  - `versions.json` maps `0.1.0 → 1.15.1`.
  - `minAppVersion` 1.15.1 is the latest public desktop release (changelog, 2026-11-12), and the docs say to use the latest when unsure.
  - The `id` contains no "obsidian" and does not end in "plugin".
  - `fundingUrl` is absent, which is correct when you take no donations.
  - The build is reproducible locally (identical SHA-256 over two builds).
- **Beta testing.** DevDocs recommends BRAT ([Beta-testing plugins](https://github.com/obsidianmd/obsidian-developer-docs/blob/1c26772ac13d6e9870c865936d389fdfe694e742/en/Plugins/Releasing/Beta-testing%20plugins.md)). The repo already produces BRAT-compatible releases. Optionally document BRAT in `docs/engineering/releasing.md`.

### API deprecations
- `obsidian.d.ts` 1.14.4 has 15 `@deprecated` tags: `setWarning`, `getDoc`, `editorViewField`, `iterateCacheRefs`, `MarkdownRenderer.renderMarkdown`, `close`, `Notice.noticeEl`, `PluginSettingTab.display`, `setDynamicTooltip`, `rightRibbon`, `activeLeaf`, `splitActiveLeaf`, the old `duplicateLeaf`, `getUnpinnedLeaf` and the old `setActiveLeaf`.
- The repo calls none of them.
- APIs it uses, all current: `addRibbonIcon`, `addCommand`/`removeCommand`, `addSettingTab`, `registerView`, `loadData`/`saveData`, `getLeavesOfType`, `getLeaf(true)`, `setViewState`, `revealLeaf` (Promise since 1.7.2), `onLayoutReady`, `Events.on`/`offref`, `getMarkdownFiles`, `Notice`, `createFragment`, `ItemView.getIcon`, `getSettingDefinitions`/`getControlValue`/`setControlValue` (1.13.0), `apiVersion`, `Platform`, `activeDocument`.
- The only non-public one was `leftRibbon.removeRibbonAction` (table #12); it is gone since 2026-11-21.

## Complies already (short)
No default hotkeys · command ids and names · declarative settings, no headings · no deprecated APIs · deferred-view-safe leaf access, awaited `revealLeaf` · no leaf detaching on unload · `create` events gated until the layout is ready · `createFragment` instead of `innerHTML` · console only in `infrastructure/logging`, info→debug, default level `warn` · no network, no telemetry · scoped CSS on Obsidian variables, nothing written to `document.head` · pop-out-aware mounting · `window.setTimeout` · release with exactly three assets, matching tag, `versions.json` · minified, reproducible build · `main.js` not committed · lock file · MIT LICENSE · latest `eslint-plugin-obsidianmd` (0.6.0) · `minAppVersion` = current public app.

## Open questions / unverified
- **Is `.claude/` really scanned?** Inferred from the documented fixed ignore list. I did not run the directory's *Review branch* preview scan. Run it to confirm item 1.
- **Build-verification details are not documented:** which Node version the scanner uses, and whether it compares `dist/` or root output. With `engine-strict=true` and `engines.node >=24` (`.npmrc`, `package.json:9`), the scanner's `npm install` would fail on an older Node.
- **Is a German `description`/README acceptable?** The docs only say to follow the (English) style guide. `name` should "prefer English" (*Manifest*). There is no explicit language rule for descriptions.
- **Real load-time cost in Obsidian** of the eager Vue/Nuxt UI evaluation: not measured. The 44 ms is a Node compile proxy, and the bundle shares are source sizes.
- **Calling `offref` and `registerEvent` cleanup on the same ref:** that it is harmless is assumed, not verified.
- **Does Obsidian finish an async `onload` before it restores saved leaves?** `registerView` runs after `await loadData()`; the sample plugin does the same. Not verified from Obsidian's source.
- **Accessibility:** no primary Obsidian guidance for plugins was found.
