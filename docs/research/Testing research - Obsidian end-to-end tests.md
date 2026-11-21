---
type: Research
status: umgesetzt
scope: mvp
date: 2026-11-21
---

# Testing research: Obsidian end-to-end tests

Researched on **21 Nov 2026**. Sources are primary only: tool repositories and source at a pinned commit, npm registry metadata, Obsidian's own help, developer docs and terms, Playwright and WebdriverIO docs, and GitHub's runner docs. Probes ran in a scratch directory outside the repo. No package was installed into the repo.

## Result

> **Implemented on 2026-11-21.** Option A now runs as `npm run test:e2e` with the three specs from the first slice ([testing.md](../engineering/testing.md)), on app 1.15.1 with installers 1.5.8 and 1.15.1. Several open points below are settled by that run. `executeObsidian`, `obsidianPage.enablePlugin`/`disablePlugin`, `app.changeTheme`, `app.setting.open`/`openTabById` and `moveLeafToPopout` all work. In 1.15.1 the settings tab does not render as a `.modal` in the main document, so the spec edits the field through `app.setting.activeTab.containerEl`.

**Recommendation: adopt `wdio-obsidian-service` (WebdriverIO + Mocha) as a separate `test:e2e` suite in its own CI job. Keep it out of `npm run verify`.**

- It is the only option that downloads, sandboxes and drives a real Obsidian app (any app version, any installer version) on Linux CI without extra glue.
- It covers every desktop gap in the list below. Mobile emulation is available for later.
- Playwright's `_electron.launch` does **not** fit. Obsidian's installers ship with the Electron fuse that Playwright needs turned off (measured below). Playwright via `connectOverCDP` is possible but leaves all the Obsidian-specific glue to us.
- Obsidian's own CLI (`obsidian eval`, `dev:errors`, `dev:console`) and the Vitest-based `obsidian-e2e` library are useful additions, but neither provisions Obsidian versions on CI by itself.

## The gaps

From [testing.md → Manual checks in Obsidian](../engineering/testing.md) and [architecture.md](../engineering/architecture.md). The in-memory `obsidian` double and the browser harness cannot cover these:

| # | Gap | Today |
| --- | --- | --- |
| G1 | Real plugin load, enable and disable cycles (`onload`/`onunload`, `bootstrap` dispose order, no Vue app outliving the runtime) | manual check 1, 6 |
| G2 | The real declarative settings tab (`getSettingDefinitions`, Obsidian 1.13+) and persistence to `data.json` | manual check 5 |
| G3 | Real light/dark switching (`theme-dark`/`theme-light` on the owner body → `bindHostTheme`) | manual check 2 |
| G4 | Views in pop-out windows (a separate `ownerDocument`, portal and dialogs in the same document) | manual check 3, 4 |
| G5 | Real Obsidian CSS against our styles scoped under `.weg-manager-root` | none |
| G6 | Console cleanliness (no `[weg-manager]` errors or warnings, no uncaught errors) | manual check 7 |
| G7 | Later: mobile (`isDesktopOnly: true` today) | none |

## Option A: `wdio-obsidian-service` (WebdriverIO)

**Versions.** `wdio-obsidian-service` 3.5.0, `obsidian-launcher` 3.5.0 and `wdio-obsidian-reporter` 3.5.0 were all published on 2026-11-01. The packages were first published in Feb 2025 (`npm view … time`). Release 3.5.0 adds "Support Webdriverio 10" ([CHANGELOG](https://github.com/jesse-r-s-hines/wdio-obsidian-service/blob/0e7cc91eeda586d0c8a8b6f8713cb65d442556c2/CHANGELOG.md)). The peer dependencies are `webdriverio >=9.18.1` and `obsidian >=1.1.1`; Appium is optional (`npm view wdio-obsidian-service@3.5.0 peerDependencies peerDependenciesMeta`). The current WebdriverIO is `@wdio/cli` 10.2.0 (2026-11-06). Its engine range is `node >=24.22.1 <25 || …`, and the local Node is 24.22.3. The licence is MIT. `git shortlog` shows a single maintainer (Jesse Hines). A bot refreshes the version list every 8 hours (`cron: '22 */8 * * *'` in [update-obsidian-versions.yaml](https://github.com/jesse-r-s-hines/wdio-obsidian-service/blob/0e7cc91eeda586d0c8a8b6f8713cb65d442556c2/.github/workflows/update-obsidian-versions.yaml)). The upstream CI tests ubuntu, windows, macOS arm and ubuntu-arm ([test.yaml](https://github.com/jesse-r-s-hines/wdio-obsidian-service/blob/0e7cc91eeda586d0c8a8b6f8713cb65d442556c2/.github/workflows/test.yaml)).

**How it works** (read in the source):

- **Two-part download.** Obsidian desktop comes in two parts: the "installer" (the Electron binary) and the "app" (a JS bundle, `obsidian-<v>.asar`). The service lets you choose `appVersion` (`browserVersion`) and `installerVersion` separately. Each takes `latest`, `latest-beta` or `earliest`, and `earliest` means the `minAppVersion` from `manifest.json` ([service README](https://github.com/jesse-r-s-hines/wdio-obsidian-service/blob/0e7cc91eeda586d0c8a8b6f8713cb65d442556c2/packages/wdio-obsidian-service/README.md#obsidian-app-vs-installer-versions)).
- **Download sources.** Downloads come only from `github.com/obsidianmd/obsidian-releases/releases/` or `releases.obsidian.md/`, and a URL check enforces this ([launcher.ts L412–421](https://github.com/jesse-r-s-hines/wdio-obsidian-service/blob/0e7cc91eeda586d0c8a8b6f8713cb65d442556c2/packages/obsidian-launcher/src/launcher.ts#L412)).
- **Cache.** Everything is cached in `cacheDir`, for example `.obsidian-cache/obsidian-installer/linux-x64/Obsidian-<v>` and `obsidian-app/obsidian-<v>.asar`.
- **chromedriver.** chromedriver is fetched for the installer's Electron version through `@electron/get` ([launcher.ts `downloadChromedriver`](https://github.com/jesse-r-s-hines/wdio-obsidian-service/blob/0e7cc91eeda586d0c8a8b6f8713cb65d442556c2/packages/obsidian-launcher/src/launcher.ts#L519)).
- **Sandboxed launch.** Each instance gets a fresh `--user-data-dir`. The service writes `obsidian.json` with `updateDisabled: true` and the vault marked open. It links the asar into the config dir and sets localStorage to skip the changelog and enable community plugins ([launcher.ts `setupConfigDir`, L939–1000](https://github.com/jesse-r-s-hines/wdio-obsidian-service/blob/0e7cc91eeda586d0c8a8b6f8713cb65d442556c2/packages/obsidian-launcher/src/launcher.ts#L939)).
- **Driver.** The service rewrites the capability to Chrome: the binary is the Obsidian executable, `windowTypes: ["app","webview"]`, `--no-sandbox` on Linux, x11 preferred over Wayland, and WebDriver Classic is forced ("electron doesn't support BiDi yet") ([service.ts L258–291](https://github.com/jesse-r-s-hines/wdio-obsidian-service/blob/0e7cc91eeda586d0c8a8b6f8713cb65d442556c2/packages/wdio-obsidian-service/src/service.ts#L258)). Because this goes through chromedriver, it does **not** need the Node inspector fuse that blocks Playwright (see Option B).
- **Vault and plugin install.** `plugins: ["<dir>"]` copies `manifest.json` and `main.js` (both required) and `styles.css` (optional) into `.obsidian/plugins/<id>/`, then enables the plugin in `community-plugins.json`. It does not delete a `data.json` that the vault already has ([launcher.ts `installPlugins`, L697–752](https://github.com/jesse-r-s-hines/wdio-obsidian-service/blob/0e7cc91eeda586d0c8a8b6f8713cb65d442556c2/packages/obsidian-launcher/src/launcher.ts#L697)). For this repo, the plugin dir is our `dist/` folder. The vault is copied by default (`copy: true`).
- **API for code inside Obsidian.**
  - `browser.executeObsidian(({app, obsidian, plugins, require}, …args) => …)` runs a function inside Obsidian. The function is serialised, so it cannot capture closures ([browserCommands.ts L1–80](https://github.com/jesse-r-s-hines/wdio-obsidian-service/blob/0e7cc91eeda586d0c8a8b6f8713cb65d442556c2/packages/wdio-obsidian-service/src/browserCommands.ts)).
  - `browser.executeObsidianCommand(id)` runs a command, and `browser.reloadObsidian({vault, plugins})` restarts Obsidian.
  - `obsidianPage.enablePlugin`/`disablePlugin` wrap the internal `app.plugins.enablePluginAndSave`/`disablePluginAndSave`.
  - Other helpers: `setTheme` (community themes, not light/dark), `resetVault`, `read`/`write`, `loadWorkspaceLayout`, `getMainWindowHandle` (this one picks the main window among several handles), and `runObsidianCli` ([obsidianPage.ts](https://github.com/jesse-r-s-hines/wdio-obsidian-service/blob/0e7cc91eeda586d0c8a8b6f8713cb65d442556c2/packages/wdio-obsidian-service/src/pageobjects/obsidianPage.ts#L142)).
- **Beta versions.** These need an Obsidian Insiders (Catalyst) account. Set `OBSIDIAN_EMAIL`/`OBSIDIAN_PASSWORD` in the environment, and **2FA must be disabled**. The README suggests a separate account for CI. `obsidianBetaAvailable()` lets a config skip beta when there are no credentials ([service README → Obsidian Beta Versions](https://github.com/jesse-r-s-hines/wdio-obsidian-service/blob/0e7cc91eeda586d0c8a8b6f8713cb65d442556c2/packages/wdio-obsidian-service/README.md#obsidian-beta-versions)). Workflows triggered from forks get no secrets ([sample test.yaml](https://github.com/jesse-r-s-hines/wdio-obsidian-service-sample-plugin/blob/0e86de5b22d0b0a3d96cdd855162cdebde78b6f1/.github/workflows/test.yaml)).
- **Linux CI.** The sample workflow starts `Xvfb :99 -screen 0 1280x1024x24` and the window manager `herbstluftwm`. Its comment says that without a window manager "some Obsidian features won't work properly". It caches `.obsidian-cache` keyed on the resolved versions and sets `WDIO_MAX_INSTANCES: 2` ([sample test.yaml](https://github.com/jesse-r-s-hines/wdio-obsidian-service-sample-plugin/blob/0e86de5b22d0b0a3d96cdd855162cdebde78b6f1/.github/workflows/test.yaml)). Changelog 2.0.0 says the window manager was added "to fix some intermittent failures that only occurred in the CI tests". Xvfb is preinstalled on `ubuntu-24.04`, which is `ubuntu-latest` ([runner image readme](https://github.com/actions/runner-images/blob/main/images/ubuntu/Ubuntu2404-Readme.md), image 20261116; [runner-images README](https://github.com/actions/runner-images/blob/main/README.md)).
- **Mobile.** `emulateMobile: true` uses Obsidian's `app.emulateMobile` on desktop. A real Android app runs through Appium and an AVD with `maxInstances: 1`. iOS is not supported ([service README → Platform Support](https://github.com/jesse-r-s-hines/wdio-obsidian-service/blob/0e7cc91eeda586d0c8a8b6f8713cb65d442556c2/packages/wdio-obsidian-service/README.md#platform-support); [Obsidian: Mobile development](https://github.com/obsidianmd/obsidian-developer-docs/blob/1c26772ac13d6e9870c865936d389fdfe694e742/en/Plugins/Getting%20started/Mobile%20development.md)).
- **Test framework.** WebdriverIO runs Mocha, Jasmine or Cucumber, not Jest or Vitest, and the README uses Mocha throughout (service README → Test Frameworks).

**Concrete numbers for this repo.**

- **Download size.** `earliest` resolves the app to 1.14.4 (our `minAppVersion`). In the bundled list, 1.14.4 has `minInstallerVersion` 1.5.8 (Electron 28.2.3 / Chrome 120). The latest stable is 1.15.1 (Electron 43.8.9 / Chrome 150) ([obsidian-versions.json](https://github.com/jesse-r-s-hines/wdio-obsidian-service/blob/0e7cc91eeda586d0c8a8b6f8713cb65d442556c2/obsidian-versions.json), metadata timestamp 2026-11-12). Measured `Content-Length` values: app `obsidian-1.15.1.asar.gz` 8.6 MB, `obsidian-1.14.4.asar.gz` 9.2 MB, `Obsidian-1.15.1.AppImage` 138 MB and `Obsidian-1.5.8.AppImage` 113 MB. So a cold `earliest/earliest + latest/latest` matrix downloads about 270 MB once, and cache hits download nothing.
- **Runner.** The repo is public, so standard `ubuntu-latest` gives 4 CPUs and 16 GB RAM, free and unlimited ([GitHub docs: supported runners](https://github.com/github/docs/blob/main/data/reusables/actions/supported-github-runners.md)).

**Coverage.** The table below sets out how Option A reaches each gap. G5 is verified by computed-style asserts, and a screenshot diff can come later.

| Gap | How the suite reaches it |
| --- | --- |
| G1 | `enablePlugin`/`disablePlugin` cycles, then `executeObsidian` checks leaves, commands and the DOM |
| G2 | Drive the settings tab through the DOM, then `obsidianPage.read` on `data.json` |
| G3 | The internal `app.changeTheme`, or the Appearance setting through the DOM |
| G4 | The public `workspace.moveLeafToPopout` ([API](https://github.com/obsidianmd/obsidian-developer-docs/blob/1c26772ac13d6e9870c865936d389fdfe694e742/en/Reference/TypeScript%20API/Workspace/moveLeafToPopout.md)) plus window handles |
| G5 | Computed-style asserts inside the real app CSS |
| G6 | A console spy through `executeObsidian` |
| G7 | `emulateMobile` |

**Costs.** Setup is moderate. We add a WebdriverIO config, Mocha and its types, a separate tsconfig and a vault fixture. Maintenance is small: pin `wdio-obsidian-service` and `@wdio/*`, and bump them through Renovate or Dependabot like the other dependencies.

**Risks.**

- One maintainer.
- Helpers use internal Obsidian APIs (`app.plugins.*`, `app.customCss`), so a new Obsidian release can break them. The 8-hourly version bot and fast patch releases reduce this; 3.4.0, for example, fixed `latest` resolving to desktop-only and mobile-only releases.
- E2E is slower and less deterministic than Vitest.
- The beta matrix needs an account with 2FA turned off.

## Option B: Playwright and Electron

**Versions.** `playwright` and `@playwright/test` are at 1.65.1 (2026-11-13). Electron support is labelled **experimental**, lists v21+ as supported, and is JS only ([class-electron.md @ v1.65.1](https://github.com/microsoft/playwright/blob/v1.65.1/docs/src/electron-api/class-electron.md)).

**B1: `_electron.launch({ executablePath })` against the Obsidian binary does not work.**

- **What Playwright needs.** Playwright always passes `--inspect=0 --remote-debugging-port=0`. It then waits on stderr for `Debugger listening on ws://…` before it connects ([electron.ts L183, L270 @ v1.65.1](https://github.com/microsoft/playwright/blob/v1.65.1/packages/playwright-core/src/server/electron/electron.ts#L183)). Its docs say that if launch times out, you should check that the `EnableNodeCliInspectArguments` fuse "is **not** set to `false`".
- **What Obsidian ships.** I read the fuses with `@electron/fuses` 2.1.3 (`electron-fuses read --app`) from Obsidian's official Linux tarballs. The tarball's sha256 matches the digest in `obsidian-versions.json`. For both the **1.15.1** installer and the **1.5.8** installer, the tool reported `EnableNodeCliInspectArguments is Disabled`, `RunAsNode is Disabled` and `EnableNodeOptionsEnvironmentVariable is Disabled`.
- **Conclusion.** Playwright's main-process bridge cannot attach. The same fuse also limits WebdriverIO's generic `@wdio/electron-service` (10.4.1): its main-process features need this fuse, and only its renderer log capture works without it ([configuration.md L244, L269](https://github.com/webdriverio/desktop-mobile/blob/22f506b98ad81345b5164dec9ee20799feacc188/packages/electron-service/docs/configuration.md#L244)).
- **What I did not do.** I did not run an actual Playwright launch. The sandbox refused to start the Obsidian binary, so the timeout itself is inferred from Playwright's source and docs together with the measured fuse.

**B2: start Obsidian yourself with `--remote-debugging-port`, then `chromium.connectOverCDP`.**

- **Feasibility.** The remote-debugging port is a Chromium switch, not a Node fuse. `obsidian-launcher` itself launches Obsidian with `--remote-debugging-port=0` and drives it over CDP ([cdp.ts L54](https://github.com/jesse-r-s-hines/wdio-obsidian-service/blob/0e7cc91eeda586d0c8a8b6f8713cb65d442556c2/packages/obsidian-launcher/src/cdp.ts#L54)). Its CLI documents passing `-- --remote-debugging-port=9222` through ([launcher README → launch](https://github.com/jesse-r-s-hines/wdio-obsidian-service/blob/0e7cc91eeda586d0c8a8b6f8713cb65d442556c2/packages/obsidian-launcher/README.md#launch)).
- **Limits.** Playwright warns that CDP connections are "significantly lower fidelity" and that some features may break when the browser was not launched with its own arguments ([class-browsertype.md L140–158](https://github.com/microsoft/playwright/blob/v1.65.1/docs/src/api/class-browsertype.md#L140)).
- **What we would own.** We would write the glue: launch and cleanup, vault copy, plugin install, a readiness wait and pop-out page discovery. Using `obsidian-launcher` programmatically for the downloads reduces the work.
- **Gain and cost.** We would gain Playwright Test's runner, tracing and screenshot assertions. The cost is a homegrown fixture layer on a low-fidelity connection, which no one upstream tests against Obsidian.

## Option C: Obsidian's own CLI (official)

**Availability.** Obsidian ships a CLI that needs installer **1.12.7+**, the "Command line interface" setting turned on, and a running app ([Obsidian Help: Obsidian CLI](https://github.com/obsidianmd/obsidian-help/blob/ced32050c0d9d1e1f8d3faa19a8ba8474d75a32d/en/Extending%20Obsidian/Obsidian%20CLI.md)). It is the only official tooling aimed at plugin developers. I found no official end-to-end testing guide in the developer docs. The docs only say to develop in a separate vault ([Build a plugin](https://github.com/obsidianmd/obsidian-developer-docs/blob/1c26772ac13d6e9870c865936d389fdfe694e742/en/Plugins/Getting%20started/Build%20a%20plugin.md)).

**Developer commands.** `plugin:reload id=…`, `eval code=…`, `dev:errors` ("captured JavaScript errors"), `dev:console level=warn|error`, `dev:dom selector=…`, `dev:css`, `dev:screenshot`, `dev:mobile on|off` and `dev:cdp`.

**Fit.** These map directly onto G1 and G6, but the CLI is a command channel, not a test runner, and it launches nothing. `obsidian-launcher` writes `cli: true` into the sandbox config. Its README says the Obsidian CLI works against an instance it launched as long as only one instance runs at a time ([launcher README → Obsidian CLI](https://github.com/jesse-r-s-hines/wdio-obsidian-service/blob/0e7cc91eeda586d0c8a8b6f8713cb65d442556c2/packages/obsidian-launcher/README.md#obsidian-cli)). Inside wdio tests it is available as `obsidianPage.runObsidianCli`.

**Catch.** The CLI needs an installer from 1.12.7 onwards, so it does not work on the `earliest` installer (1.5.8) that Option A selects for our `minAppVersion`.

## Option D: `obsidian-e2e` (Vitest-based, community)

**Versions.** `obsidian-e2e` 0.15.0 (2026-10-24), MIT, 22 versions since March 2026. It declares `vitest ^5.0.0` as a peer dependency, which matches our Vitest 5 ([npm](https://www.npmjs.com/package/obsidian-e2e); [README](https://github.com/chhoumann/obsidian-e2e/blob/1e1923c973e034f49633607f026e325fa526e734/README.md)).

**How it works.**

- It is a thin library over the **global `obsidian` CLI** and a running Obsidian, with Vitest fixtures (`obsidian`, `vault`, `sandbox`, `plugin(id).reload()`, `data().patch()`).
- An instance runner gives each worktree its own vault and private `HOME`.
- On Linux it starts a private Xvfb when there is no `$DISPLAY`.
- Its capture tool starts Obsidian with `--remote-debugging-port=0`.
- It switches themes through the internal `app.changeTheme("obsidian"|"moonstone")` ([src/capture/page.ts L226](https://github.com/chhoumann/obsidian-e2e/blob/1e1923c973e034f49633607f026e325fa526e734/src/capture/page.ts#L226)).

**Limits.** It requires "Obsidian must be installed locally" and does **not** download Obsidian or run a version matrix. The README itself says: "Headless CI for desktop Obsidian is environment-specific". It also depends on the CLI's installer floor (1.12.7+).

**Fit.** It fits our Vitest habits and local agent loops well. It does not fit CI on its own.

## Comparison

| | A: wdio-obsidian-service | B1: Playwright `_electron` | B2: Playwright over CDP | C: Obsidian CLI | D: obsidian-e2e |
| --- | --- | --- | --- | --- | --- |
| Current version (date) | 3.5.0 (2026-11-01); wdio 10.2.0 | 1.65.1 (2026-11-13) | 1.65.1 | ships with Obsidian (installer ≥1.12.7) | 0.15.0 (2026-10-24) |
| Works with real Obsidian binary | yes (chromedriver) | **no**: inspect fuse disabled (measured) | yes (CDP port) | yes | yes (needs installed app) |
| Downloads/caches app + installer versions, `earliest`/`latest`/beta | yes | no | via `obsidian-launcher` only | no | no |
| Linux CI recipe | documented (Xvfb + herbstluftwm) | — | DIY | DIY | "environment-specific" |
| G1 lifecycle | ✓ | — | ✓ (DIY) | ✓ (`plugin:reload`, `eval`) | ✓ |
| G2 settings tab | ✓ | — | ✓ | partial (`eval`, `dev:dom`) | partial |
| G3 theme | ✓ (internal API or DOM) | — | ✓ | via `eval` | ✓ (capture) |
| G4 pop-out | ✓ (window handles, `moveLeafToPopout`) | — | probably (unverified) | via `eval` | unclear |
| G5 real CSS | ✓ computed styles; screenshots later | — | ✓ + `toHaveScreenshot` | `dev:css` | screenshots |
| G6 console | ✓ (spy via `executeObsidian`) | — | ✓ (`page.on('console')`) | ✓ `dev:errors`/`dev:console` | via CLI |
| G7 mobile | emulate + Android | — | emulate via `eval` | `dev:mobile` | Android emulator |
| Runner fit with this repo | Mocha (second runner) | — | Playwright Test (second runner) | n/a | Vitest |
| Win/macOS dev machines | yes (upstream CI on both) | — | yes | yes | yes (Linux/macOS documented) |
| Main risk | single maintainer, internal APIs | blocked | homegrown glue, low-fidelity CDP | no runner, installer floor | no provisioning, young |

## Recommended path

1. **Adopt Option A, pinned.** Add `wdio-obsidian-service`, `wdio-obsidian-reporter`, `@wdio/cli`, `@wdio/local-runner`, `@wdio/mocha-framework`, `@wdio/globals`, `mocha` and `@types/mocha`, all as exact devDependencies per [ADR 0001](../adr/0001-dependency-baseline.md).
2. **Layout.**
   - **Specs and config.** Specs go in `tests/e2e/specs/*.e2e.ts` and the config in `tests/e2e/wdio.conf.mts`.
   - **Plugin and vault.** Set `plugins: ["../../dist"]`; paths resolve relative to the config. The vault fixture is `tests/e2e/vaults/basic/`.
   - **`.gitignore`.** The file currently ignores every `.obsidian`, so it needs a `!tests/e2e/vaults/**/.obsidian` exception, plus a new `.obsidian-cache/` entry.
   - **Type checking.** `tsconfig.app.json` includes `tests/**/*.ts`, so exclude `tests/e2e/**` there and give e2e its own `tests/e2e/tsconfig.json` (types `@wdio/globals/types`, `@wdio/mocha-framework`, `wdio-obsidian-service`). Add that tsconfig to `typecheck`.
   - **fallow.** Add `tests/e2e/**` to `supportEntry`.
   - **Vitest.** Its `unit`/`dom` globs already skip the folder.
3. **Scripts.**
   - `test:e2e`: `npm run build && wdio run tests/e2e/wdio.conf.mts`.
   - `test:e2e:latest`: `OBSIDIAN_VERSIONS=latest/latest`, for a quick local run.
   - Do **not** add either to `verify` or `verify:full`. Both need a display, a download of about 270 MB and tens of seconds, which breaks the fast-gate idea in `scripts/verify.mjs`.
4. **CI job.** Add an `e2e` job to `ci.yml` that runs in parallel with `verify` on `ubuntu-latest` with `timeout-minutes: 15`:
   1. checkout, setup-node and `npm ci`.
   2. Resolve the versions to a key file, as the sample does, then `actions/cache` on `.obsidian-cache`.
   3. Start Xvfb and herbstluftwm.
   4. Run `npm run test:e2e` with `WDIO_MAX_INSTANCES=2`.
   5. Upload the wdio logs and screenshots on failure.
   - Use the matrix `earliest/earliest` and `latest/latest`. The first is app 1.14.4 on installer 1.5.8 (Chromium 120), which catches CSS or JS that the oldest supported Electron cannot handle.
   - Start the job as **not required**. After about two weeks without flakes, make it a required check.
   - Add `latest-beta` only to the nightly workflow, and only if a dedicated Catalyst account is accepted. Its credentials need 2FA off, which is a deliberate security trade-off.
5. **First slice: three specs.**
   - **`lifecycle.e2e.ts` (G1, G6).**
     - Install a spy on `console.error`/`console.warn`, `window.onerror` and `unhandledrejection` through `executeObsidian`.
     - Run `weg-manager:open-view` and expect one `.weg-manager-root` in a `weg-manager-view` leaf.
     - Open a second tab and close one.
     - Run `disablePlugin`/`enablePlugin("weg-manager")` three times. After each disable, expect no `.weg-manager-root`, no `weg-manager:*` commands and no leaves of the view type. After each enable, the view opens again.
     - Finally, assert that the spy saw no message starting with `[weg-manager]` and no uncaught error.
   - **`settings-and-theme.e2e.ts` (G2, G3, G5).**
     - Open Settings → WEG Manager through the DOM. Change the greeting to a value, then to empty, and read `.obsidian/plugins/weg-manager/data.json` back with `obsidianPage.read`.
     - With the view open, switch light → dark → light. Assert that `.weg-manager-root` gets `dark`/`light` and that one Nuxt UI surface's computed background and colour change and match the bridge variables.
     - A seeded `data.json` in the fixture with a newer version covers the read-only hint.
   - **`popout.e2e.ts` (G4).**
     - Open the view, then `app.workspace.moveLeafToPopout(leaf)` in `executeObsidian`.
     - Assert that `leaf.view.containerEl.ownerDocument !== document` and that `.weg-manager-root` and its portal element live in that document.
     - Switch the WebDriver window to the pop-out handle, open the About dialog by clicking, and assert that the dialog renders in the pop-out's document.
     - Close the pop-out and check the console spy.
6. **Docs.** When the specs land, update the manual checks in `testing.md`: checks 2–7 become automated, and only exploratory checks and mobile stay manual. Keep Obsidian's CLI (`runObsidianCli("dev:errors")`) for later work on `latest/latest` only, because of the installer floor. Revisit `obsidian-e2e` for local Vitest-style agent loops once it supports provisioning.

## Licence and terms

- **Licence.** Obsidian is "free for all purposes, including personal, commercial, and non-profit use" ([License overview](https://obsidian.md/license), updated 20 Feb 2025). The [Terms of Service](https://obsidian.md/terms) (same date) grant free commercial use.
- **What the terms forbid.** Among other things, they forbid "distribut[ing] or shar[ing] the Services or Software or mak[ing] any of them available for access by third parties" and modifying it.
- **What the terms don't cover.** They say nothing specific about automated testing or CI.
- **Reading for this repo.** Downloading the official assets from Obsidian's release hosts and running them unmodified in our own CI is ordinary use. Do not commit the binaries or upload them as workflow artifacts. Keep them in `actions/cache`, which only this repo can access. Beta builds are Catalyst early access, so they should never leave the cache. This is my reading of the terms, not legal advice, and Obsidian has published no statement on CI use.

## Open questions and unverified points

- **Playwright `_electron.launch` failing against Obsidian was not observed.** The sandbox refused to start the Obsidian binary. The conclusion rests on Playwright's source and docs plus the measured fuse state (1.15.1 and 1.5.8 installers only; I did not check other installers or the Windows and macOS builds).
- **No Obsidian run happened in this research.** That covers the CI job duration, flake rate, boot time and the behaviour of the WebdriverIO 10 + 3.5.0 combination on our Node 24. All time figures above are expectations, not measurements.
- **Pop-out pages over Playwright CDP (B2) are unverified.** I did not check whether they show up as pages.
- **The suggested settings-tab route is unverified.** The internal `app.setting.open()`/`openTabById` calls and the exact DOM of the declarative settings tab still need checking. The help also mentions an "Open settings in new window" option, which would move Settings into another window.
- **The light/dark switch is unverified.** `app.changeTheme("obsidian"|"moonstone")` is an internal API, seen only in `obsidian-e2e`'s source. The Appearance → Base color scheme setting is the public route.
- **Console capture is unverified.** I did not check whether WebDriver Classic `getLogs("browser")` works through chromedriver for Obsidian. Messages logged before a spy is installed, during the very first load, are therefore not covered by the recommended spy. The disable/enable cycles do cover later loads.
- **The Obsidian CLI's error buffer is unverified.** I did not confirm whether `dev:errors`/`dev:console` capture from app start or only from some later point.
- **`emulateMobile` with `isDesktopOnly: true` is unverified.** I did not check whether Obsidian still loads the plugin. This matters for G7 later.
- **Maintainer bus factor.** I could not read repository stars, issue counts or release notes through the GitHub API in this session (access refused). Maintenance figures come from the git history and npm.
