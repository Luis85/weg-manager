## Agent skills

### Issue tracker

Issues live as Obsidian backlog notes under `docs/` (PBIs in `docs/requirements/`, Tasks in `docs/tasks/`), not in GitHub Issues. See `docs/agents/issue-tracker.md`.

### Triage labels

The five default triage roles, stored in the `triage` frontmatter property (never in `tags`). See `docs/agents/triage-labels.md`.

### Diagrams (Archify)

Archify writes every diagram or explainer to `docs/archify/<type>-<slug>-<YYYYMMDD-HHMMSS>/`, never to `.archify/`; pass this folder as the output location to the `archify` skill, with `meta.output` relative to the repo root. The candidate (`candidate.json` / `candidate.archify.md`) and the `<slug>.html` stay together in that folder.

### Domain docs

Single-context: `GLOSSARY.md` and `docs/adr/` at the repo root; product decisions in `docs/decisions/` are read as context. See `docs/agents/domain.md`.

## Plugin code

The Obsidian plugin lives in `src/`; read `docs/engineering/architecture.md` before changing its structure.

- **Gate:** `npm run verify` must exit 0 before you call work done; read the exit code, never mask it. It stops at the first failing step. `npm run verify:full` adds mutation testing.
- **Tests first:** write the failing test, see it fail, then implement. Projects, the Obsidian double, support Layers and the real-Obsidian e2e suite (`npm run test:e2e`, under `xvfb-run -a` on headless Linux): `docs/engineering/testing.md`. A change to lifecycle, settings tab, theme, pop-out, view state or vault behaviour needs a passing e2e run.
- **Third-party notices:** a dependency that enters or leaves the bundle, or a changed licence text, turns `npm run verify` red at `check:notices`; run `npm run notices` and commit `THIRD-PARTY-NOTICES.txt` (generated, never hand-edited): `docs/engineering/releasing.md`.
- **Layers:** `domain` ← `application` ← `infrastructure/obsidian` and `presentation`; lint and fallow enforce them. `obsidian` only in `src/infrastructure/obsidian/**`, `main.ts`, `bootstrap.ts`. In presentation, `effect` only in `src/presentation/shell/runtime/`; components run reads through `useQuery` and state changes through `useCommand`.
- **Modules:** each layer is split into module folders, `src/<layer>/<module>/` (`src/infrastructure/obsidian/<module>/`); today `shell`, `notes` (also the record kit every record type uses: `defineRecords`, `useRecordForm`, `useRecordScreen`) and `communities`. Code outside a module folder imports it only through its `index.ts` (second entries: `presentation/shell/host.ts` for plugin-load code, `application/notes/adapter.ts` for `src/infrastructure/**` only, each presentation module's Vue-free `screens.ts` for `src/presentation/app-surface.ts` only), and the direction is feature → `notes` → `shell`; ESLint and fallow enforce both. A module registers itself with two manifests: `src/application/<module>/module.ts` (`defineModule`), listed in `APP_MODULES` (`src/application/modules.ts`, the one module list, from which the root files derive `AppError`, `Catalog`, `Route`, `AppServices` and the rest, and ESLint and `configs/fallow.json` their module lists), and `src/presentation/<module>/screens.ts`, entered in `MODULE_SCREENS` (`app-surface.ts`). Never edit `configs/fallow.json`: edit `configs/fallow.config.mjs` and run `npm run fallow:config`. Details: `docs/engineering/architecture.md` § Modules; worked example in `docs/engineering/adding-a-feature.md`.
- **New feature:** follow `docs/engineering/adding-a-feature.md`, including its checklist for a new view.
- **UI language:** all user-visible text comes from the typed catalogs, one part per module (`src/application/<module>/i18n/de.ts`, `en.ts`, composed in `src/application/messages.ts`), German or English as Obsidian's `getLanguage()` decides (German for `de`, English otherwise); a new text needs a key in both. The domain returns issue codes, never sentences. Presentation reads texts with `useMessages()`. Details: `docs/adr/0005-ui-language.md`.
- **Code language:** identifiers, events, frontmatter keys and value codes are English; German lives in the UI catalogs and `docs/`. `GLOSSARY.md` gives the English term for each German product term; add a term there before using it in code (`docs/adr/0006-module-structure.md`).
- **Vault data:** notes are records by `schema: weg-manager.<type>/v<n>` and a stable `id`; all vault access goes through the `NoteStore` port (`docs/adr/0007-vault-data-access.md`). A new note type needs a contract page in `docs/contracts/` and a line in `appNoteTypes` (`src/application/note-types.ts`). Navigation is a typed `Route` (`docs/adr/0008-navigation-and-view-state.md`).
- **Errors:** every expected failure is a tagged `AppError` with a `describeError` text in both catalogs (German du-form, English sentence case; cause then action); bugs go through `reportDefect`. No note content in logs. Details: `docs/engineering/error-handling.md`.
- **Forms:** TanStack Form for every presentation form, validators call the domain rule. The settings tab stays on Obsidian's native settings API.
- **One edit location per setting:** plugin-wide technical settings (e.g. log level) go in Obsidian's settings tab, feature data (e.g. a community) in the plugin's views; never both (PBI-49).
- **CSS ownership:** Tailwind classes carry the `wm:` prefix; import Nuxt UI components explicitly from `@nuxt/ui/components/*.vue`; a newly used Nuxt UI component goes into the `@source` lists in `src/styles/app.css`, a new icon into `SHELL_ICONS` in `configs/vite.shared.ts`. Nothing may write to `document.head`.
- **Obsidian guidelines:** no `innerHTML`, no default hotkeys, `console` only in `src/infrastructure/logging/`, listeners through `this.register*`, command ids without the plugin id. `.vue` files are linted with the obsidianmd rules too; `v-html` is banned.
- **Effect 4:** services are `Context.Service` classes, errors `Schema.TaggedError`; check `node_modules/effect/dist/*.d.ts` rather than Effect 3 habits.
- **Limits:** 400 lines of code per source file, 450 per test file (ESLint `max-lines`).
- **Commits:** Conventional Commits (`feat:`, `fix:`, `test:`, `build:`, `ci:`, `docs:`, `chore:`).
