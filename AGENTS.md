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
- **Tests first:** write the failing test, see it fail, then implement. Projects, the Obsidian double, support Layers and the real-Obsidian e2e suite (`npm run test:e2e`, under `xvfb-run -a` on headless Linux): `docs/engineering/testing.md`. A change to lifecycle, settings tab, theme or pop-out behaviour needs a passing e2e run.
- **Layers:** `domain` ← `application` ← `infrastructure/obsidian` and `presentation`; lint and fallow enforce them. `obsidian` only in `src/infrastructure/obsidian/**`, `main.ts`, `bootstrap.ts`. In presentation, `effect` only in `src/presentation/runtime/`; components call use cases through `useEffectAction`.
- **New feature:** follow `docs/engineering/adding-a-feature.md`, including its five-item view checklist.
- **Errors:** every expected failure is a tagged `AppError` with a `describeError` text (German, du-form, cause then action); bugs go through `reportDefect`. No note content in logs. Details: `docs/engineering/error-handling.md`.
- **Forms:** TanStack Form for every presentation form, validators call the domain rule. The settings tab stays on Obsidian's native settings API.
- **CSS ownership:** Tailwind classes carry the `wm:` prefix; import Nuxt UI components explicitly from `@nuxt/ui/components/*.vue`; a newly used Nuxt UI component goes into the `@source` lists in `src/styles/app.css`, a new icon into `SHELL_ICONS` in `vite.shared.ts`. Nothing may write to `document.head`.
- **Obsidian guidelines:** no `innerHTML`, no default hotkeys, `console` only in `src/infrastructure/logging/`, listeners through `this.register*`, command ids without the plugin id.
- **Effect 4:** services are `Context.Service` classes, errors `Schema.TaggedError`; check `node_modules/effect/dist/*.d.ts` rather than Effect 3 habits.
- **Limits:** 400 lines of code per source file, 450 per test file (ESLint `max-lines`).
- **Commits:** Conventional Commits (`feat:`, `fix:`, `test:`, `build:`, `ci:`, `docs:`, `chore:`).
