# Pre-feature improvement plan

- Date: 2026-11-21
- Reviewed: PR #4 at `e10ce37` (branch `claude/upbeat-lovelace-v4rir1`), all of `src/`, `harness/`, `configs/`, `scripts/`, the workflows, `docs/engineering/`, ADR 0001–0005, the handoff, and the product backlog as the source of what features will demand.
- Status (2026-11-21): every step of the plan has landed; this documentation step (4.1, PBI-59) is the last. Section 4 says where each step landed, section 5 which readiness criteria are met and what is still open. Sections 1 to 3 are the review as it was written; section 6 lists what the owner decided since.
- Review round (2026-11-22): four independent reviews of the result and the fixes that followed are in section 8.

## Verdict

The shell is sound for what it covers: host lifecycle, CSS isolation, error taxonomy, UI language and the quality gate are built carefully and proven in real Obsidian. Keep all of it.

It is not yet a foundation for the product, because **the walking skeleton walks the wrong path**. It hardens `data.json` settings end to end, while K-14 (festgelegt) puts every piece of product data into Markdown notes with frontmatter. The path the first feature needs (vault note → decode → index → routed view → write back → external edit) does not exist in any layer. Three things should change before feature work starts:

1. Fix two confirmed defects in patterns that every feature will copy (section 2).
2. Decide and build the missing groundwork: module structure, vault data path, navigation (sections 3 and 4).
3. Replace the demo slice with one real tracer slice through the vault (step 4.6).

## 1. Evidence

Run on `e10ce37` in this container on 2026-11-21:

| Check | Result |
| --- | --- |
| `npm run verify` | passed, exit 0: 339 tests, statements 96.97 %, branches 93.07 %, `main.js` 556 KB, `styles.css` 61 KB |
| `xvfb-run -a npm run test:e2e` | passed, exit 0: 6 spec files, 23 tests, real Obsidian |
| Probe: interrupt a settings update while a promise-based save is in flight | **defect confirmed** (finding A1) |
| Probe: diagnostics report after `reportDefect(new TypeError(...))` | **defect confirmed** (finding A2) |
| `npm run test:mutation` | not run |
| Manual checks in a personal vault, mobile | not run |

Both probes were throwaway tests, deleted after the run. Each becomes the failing test of its fix.

## 2. Confirmed defects

### A1. An interrupted write leaves disk and memory out of step

- `useEffectAction` aborts the running effect when the component's scope ends and when `run` is called again (`src/presentation/runtime/use-runtime.ts:82`, `:101`).
- `SettingsService.update` is interruptible between `store.save` and setting the ref (`src/application/settings-service.ts:95-107`). `plugin.saveData` is a promise and cannot be cancelled.
- Probe result with a store shaped like the real adapter: `exit: Failure | disk: {"greeting":"Moin"} | memory: {"greeting":null}`. The file has the new value; every open view and the settings tab keep the old one. Obsidian does not call `onExternalSettingsChange` for the plugin's own save, so nothing repairs it until the next load.
- Today this needs a view closed during a save, so it is rare. It matters because `useEffectAction` is the documented way to run every use case, and the next writes are `processFrontMatter` calls on the user's notes.

### A2. The diagnostics report redacts every defect cause

- `reportDefect` logs `name: message\nstack` as one string (`src/application/defects.ts:5-9`); `redact` replaces any string over 200 characters (`src/application/diagnostics.ts:14`). A real stack is always longer.
- Probe result, last line of the report: `ERROR defect.reported (T-1) {"cause":"[redacted]"}`. ADR 0003 says diagnostics "replace console digging"; for a defect the report carries the incident id and nothing else.
- The reverse case leaks: a thrown non-`Error`, or an `Error` without a stack, under 200 characters passes through unredacted. Obsidian's own messages name files ("File already exists: …"), and B-NFR-07 forbids names and full paths in diagnostics.
- Root cause for both: redaction is a deny-list by key name and string length over untyped context.

## 3. Gaps against what the first features need

Ranked by how much feature code would have to be rewritten if the gap were closed later.

| # | Gap | Evidence in the code | What the backlog asks for |
| --- | --- | --- | --- |
| B1 | **No vault data path.** | `VaultReader` has one member, `markdownFileCount` (`src/application/ports.ts:23`). The Obsidian double's `Vault` knows only `getMarkdownFiles`; `MetadataCache` is an empty `Events`; there is no `fileManager`. The harness has no vault at all. | K-14, DF-22, DF-23, PBI-31, PBI-41: notes are the source of truth, with a versioned schema, unknown properties preserved, read-only on a newer schema, no silent overwrite of external edits, indexes rebuildable from notes. |
| B2 | **One file per concern per layer.** | `ports.ts`, `errors.ts` (`AppError`), `events.ts` (`AppEvent`), `use-cases.ts`, `user-messages.ts` (`describeError`), `i18n/catalog.ts` + `de.ts` + `en.ts`, `app-services.ts`, `obsidian/layers.ts`, and `domain/settings.ts` as the only domain file. The catalog is already 82 lines for one demo feature; `i18n.test.ts` is 164. | 18 MVP entities and 37 stories, a 400-line limit, and parallel agent worktrees. Every feature would edit the same eight files. |
| B3 | **One view, one panel, no navigation.** | `ShellView` mounts `ShellPanel`; `mountSurface` takes no route; no `getState`/`setState`. | `design/handoff/03`: one registered view with internal routes (`lage`, `woche/<schritt>`, `punkte`, `punkt/<id>`, …), state restored through `getState()/setState()`, 11 commands, a community filter that persists across views. |
| B4 | **The presentation bridge only knows settings.** | `useFollowing` is hard-wired to `SettingsService` (`use-runtime.ts:129-148`). There is no way to follow an index query, and `useEffectAction` gives reads and writes the same "latest call wins" semantics (the cause of A1). | Lists that follow the vault, forms that must not lose a write, drafts per form (`handoff/03`, PBI-41 AC6). |
| B5 | **`LayoutReady` is treated as "vault state is readable".** | `adding-a-feature.md` step 2 says to wait for `LayoutReady`; `hostEventsLayer` maps `metadataCache` `changed` only (`src/infrastructure/obsidian/events.ts:106`, `:143`). | An index built from frontmatter reads `metadataCache`. Obsidian finishes indexing after the layout is ready on a cold or externally changed vault and signals it with `resolved`. To be proven in e2e before the index is designed around it. |
| B6 | **No reference-vault performance check.** | No fixture, no timing test. | F-21 B-NFR-04/05: 2,000 notes, 200 Punkte; first overview within 5 s, filter within 300 ms, save within 500 ms. |
| B7 | **Mobile is required by the product and switched off in the plugin.** | `manifest.json` `isDesktopOnly: true`; no mobile e2e. | K-09 (im-entwurf) and PBI-33: the full weekly routine on a phone. Every view built before this is settled is built untested for it. |
| B8 | **Settings decoding is written by hand per field and has no migration step.** | `decodeFields`, `greetingField`, `logLevelField` in `src/domain/settings.ts`; `SETTINGS_VERSION` only detects "newer". | Settings will grow (storage folders per `VIEW-07`, the active community). Lower priority than B1: product data does not live here. |

## 4. The plan

Sizes are relative: S is one focused change with its tests, M touches several layers, L is a design plus its implementation. Each step is one pull request against `main` and ends with `npm run verify` at exit 0; steps that touch lifecycle, view or vault behaviour also need a passing e2e run.

**Merge first.** Done: PR #4 was squash-merged on 2026-11-21; the plan ran as small pull requests against `main`. The *Landed* column names the pull request of each step.

### Phase 1: fix the defects (no decisions needed)

**Done** in PR #6, merged on 2026-11-21.

| Step | Change | Done when | Size | Landed |
| --- | --- | --- | --- | --- |
| 1.1 | Writes run to completion. Make save-then-set in `SettingsService.update` uninterruptible. Split `useEffectAction` into a query form (latest wins, interrupted on scope end) and a command form (never interrupted by scope end or a second call; a second call while pending is refused or queued, to be decided in the step). | The A1 probe is a unit test that fails on today's code and passes; a dom test closes a view during a held save and finds disk and memory equal. | S | PR #6. A second call while one is pending returns the pending run. |
| 1.2 | Typed diagnostics. Log context becomes an allow-list type (ids, counts, codes, booleans). A defect entry carries the error name and stack frames; the free-text message stays in the console entry and is left out of the report. Delete the length rule. | The A2 probe is a test: the report for a defect shows name and frames; the existing property test also covers non-`Error` causes that contain a path. ADR 0003 and `error-handling.md` updated. | S | PR #6 |

### Phase 2: decide (ADRs, no feature code)

**Done** on 2026-11-21. The decisions are in `docs/adr/0006-module-structure.md`, `0007-vault-data-access.md` and `0008-navigation-and-view-state.md`. Where they differ from the recommendations in this table, the ADRs hold: code identifiers are English, and step 2.4 is dropped because mobile comes after the MVP.

| Step | Decision | Recommendation | Size | Landed |
| --- | --- | --- | --- | --- |
| 2.1 | **ADR 0006, module structure.** | Keep the four layers; slice each by module: `src/{domain,application,infrastructure/obsidian,presentation}/<module>/`. Each module owns its ports, errors, use cases, events and catalog fragment; the central files only compose (`AppError = ShellError \| GemeinschaftError`, `Catalog = { shell, gemeinschaft, … }`, `describeError` delegating per module). Lint and fallow rules: a module imports another module only through its `index.ts`. Also fix the language of domain identifiers (ADR 0004 already uses `PunktErstellt`, so German terms) and start `GLOSSARY.md` with the terms the tracer uses. | M | PR #7 (ADR 0006, `GLOSSARY.md`) |
| 2.2 | **ADR 0007, vault data access.** | One `NoteStore` port in domain terms, never `TFile`. Reads come from `metadataCache`, writes go through `processFrontMatter`/`vault.process` only. A note carries `schema: weg-manager.<type>/v<n>`, the convention the Gmail skill already ships. One generic codec: Effect Schema in, an entity or issue codes out, unknown keys preserved on write, newer version read-only. Conflict rule for an external edit while a form is open. Readiness is its own `AppEvent`, after `resolved` (B5). The index is a service fed by the `EventBus`, rebuildable at any time. | L | PR #7 (ADR 0007). The readiness signal is not `resolved`, which the measurement ruled out: PR #24 and ADR 0004's amendment. |
| 2.3 | **ADR 0008, navigation and view state.** | One `ItemView`; a small typed route union in application (`{ name: "punkt", id }`) rather than a router library; `getState`/`setState` serialise it; commands navigate through one use case. The community filter is a service with a stream, like settings. | M | PR #7 (ADR 0008), amended for the fixed tab in PR #22. |
| 2.4 | **Mobile stance.** | Keep `isDesktopOnly: true` until the first slice runs on a phone, but add the guard now: a mobile-emulation e2e smoke (`wdio-obsidian-service` supports it) and container-width breakpoints in the app frame. Needs the owner's answer on K-09 and O-02. | S | Dropped: mobile comes after the MVP (section 6). PR #20 aligned the product documents. |

### Phase 3: build the groundwork

| Step | Change | Done when | Size | Landed |
| --- | --- | --- | --- | --- |
| 3.1 | Restructure into modules per ADR 0006. Mechanical; the existing shell becomes module `shell`. | Gate green with no test changed except import paths; a planted cross-module import fails lint. | M | PR #15. The module rules are in ESLint, not oxlint (ADR 0006, amendment). |
| 3.2 | `NoteStore` port, the Obsidian adapter, and one in-memory adapter used by both the tests and the harness (today `tests/support/layers.ts` and `harness/layers.ts` each build their own fakes). Extend the Obsidian double with `getFileByPath`, `create`, `process`, `metadataCache.getFileCache`, `fileManager.processFrontMatter`/`trashFile`/`renameFile`, firing the same events as Obsidian. | Adapter tests against the double; one e2e spec creates, changes, renames and trashes a note through the adapter in real Obsidian and compares the events with the double's. | L | PR #21 |
| 3.3 | Note codec and schema versioning per ADR 0007. | Unit and property tests: round trip keeps unknown keys and key order; invalid YAML, a duplicate id and a newer schema each give an issue code and never a write; mutation score holds. | M | PR #23 |
| 3.4 | Index service: full build after readiness, incremental on file events, debounced, rebuild on demand. Reference-vault fixture generator (2,000 notes, 200 Punkte) and a timing test against B-NFR-04. | The e2e spec proves the readiness event on a cold vault; the timing test fails when the budget is exceeded. | L | PR #24 (the readiness event, the reference vault generator, the cold-vault e2e spec) and PR #25 (the index and its timing tests) |
| 3.5 | Presentation primitives: `useQuery`, `useCommand` (from 1.1), `useStream` replacing the settings-only `useFollowing`; routes and view state per ADR 0008; the app frame (navigation, community filter) with the first Nuxt UI table and sheet in the `@source` lists. | Dom tests for route restore and filter persistence; e2e: reopen Obsidian and land on the same route; pop-out and theme checks still pass. | M | PR #22. The history is the view's own, because a navigable tab let a file click replace the view (ADR 0008, amendment). No Nuxt UI table yet; the sheet came with 3.6. |
| 3.6 | **Tracer slice, replacing the demo.** The thinnest real path through everything above: list and create one entity as vault notes, follow an external edit, survive a newer schema. Then delete the greeting setting, the `show-greeting` command, the file count, the About dialog and `LEGACY_DEFAULT_GREETING` (compatibility with a 0.1.0 that was never released). | One e2e spec per behaviour; harness scenarios for empty, loaded, invalid note, read-only; `adding-a-feature.md` rewritten with this slice as its worked example. | L | PR #26 |

For 3.6 the entity is **Community (Gemeinschaft, PBI-01)**, released by the owner for this cut only: create, list, edit and delete (to Obsidian's trash) with name, short code, colour, kind and unit label, plus the community switch. Contacts, Punkte, address, owner languages and the first-start wizard stay out, and PBI-01 stays open.

### Phase 4: guardrails and hygiene (parallel to phase 3)

| Step | Change | Size | Landed |
| --- | --- | --- | --- |
| 4.1 | Docs: move the blueprint and the handoff to an archive note (sections 1–6 of the handoff describe a state that no longer exists); `architecture.md` and `adding-a-feature.md` follow ADR 0006–0008. | S | This step (PBI-59): the two plans are in `docs/plans/archive/`, every engineering guide was read as a whole and checked against the code, and the ADRs got amendments where later steps made them false. |
| 4.2 | Backlog: set PBI-48 and PBI-49 to done, rewrite PBI-50's criterion 1 (it names a `VaultEvents` port; the `EventBus` replaced it) and keep its indexing part open against step 3.4; give F-24 a release; file the steps of this plan as PBIs under F-24. | S | PR #7 filed PBI-48 to PBI-59 under F-24 (which has its release) and closed PBI-48 and PBI-49; PBI-50 closed with PR #25. F-24 stays open while PBI-58 criterion 5 is open. |
| 4.3 | Settings: a schema-driven decode with per-field fallback and a migration table, before the second real setting arrives (B8). | S | PR #19 (PBI-57; the root folder is the second setting) |
| 4.4 | CI: remove the duplicated `obsidian-guard` plugin that makes Vitest warn on every run (`configs/vitest.config.ts`); pin actions by commit SHA; add automated dependency updates, since every version is pinned exactly and three overrides wait for upstream; make `CI / e2e` required once phase 3 has added vault specs. | S | PR #8 (Vitest warning, actions pinned by SHA, Dependabot) and PR #16 (Dependabot ignores the blocked majors; the owner's decisions recorded). **Not done:** `CI / e2e` as a required check, a repository setting that is the owner's. |

### Order and dependencies

```text
merge PR #4
  └─ 1.1, 1.2                      (independent, start at once)
  └─ 2.1 ─ 3.1 ─┐
  └─ 2.2 ───────┼─ 3.2 ─ 3.3 ─ 3.4 ─┐
  └─ 2.3 ───────┴─ 3.5 ─────────────┴─ 3.6
  └─ 4.1–4.4                       (any time; 4.1 after 3.6 for the feature guide)
```

## 5. Ready for feature development when

Checked on 2026-11-21 against `71e39c4`. "Met" means the code and a test in the repository show it; the end-to-end specs ran in the pull request that added them (PR #26 for the communities specs) and were not run again for this check.

| Criterion | State | Evidence |
| --- | --- | --- |
| A write started by the user finishes or reports a failure; no test can produce disk and memory out of step. | Met | PR #6: `tests/unit/application/shell/settings-interruption.test.ts` (an interrupted update keeps disk and memory equal), the group *useCommand after the scope ended* in `tests/dom/presentation/shell/use-command.test.ts`. Note writes are uninterruptible too (PR #21): `tests/unit/application/notes/command.test.ts`. Open edge: the notice for a failed settings save after its view has closed says "Deine Eingabe ist erhalten", which is no longer true then. |
| The diagnostics report for a defect names the error and its frames and contains no name, path or note content. | Met | PR #6: `tests/unit/application/shell/diagnostics.test.ts`, `diagnostics-leaks.test.ts` (property tests), `logged-error.test.ts`. |
| A new feature adds a module folder per layer and touches only composition lines in shared files. | Met | PR #15 and the communities slice (PR #26): outside its own folders the slice changed the composing files listed in [adding a feature](../engineering/adding-a-feature.md), plus one capability for every feature (`check` in `src/domain/notes/codec.ts`). A planted cross-module import fails ESLint and fallow (see [architecture](../engineering/architecture.md#enforcement)). |
| One entity lives in the vault as notes, with a versioned schema, and an external edit, a newer schema and an invalid note each have a passing e2e spec. | Met | Communities (PR #26): `docs/contracts/DV-01 - Gemeinschaft v1.md`; `tests/e2e/specs/communities-outside-edit.e2e.ts`, `communities-newer-schema.e2e.ts`, `communities-invalid.e2e.ts`, `communities-crud.e2e.ts`. |
| The view restores its route after a restart, and the reference vault meets B-NFR-04 in a test. | Met | PR #22: `tests/e2e/specs/navigation.e2e.ts` (the view restored on its route after Obsidian restarts). PR #24 and PR #25: `scripts/reference-vault.mjs`, `tests/unit/application/notes/note-index-budget.test.ts`, `tests/e2e/specs/note-index.e2e.ts`. |
| No demo code ships: no greeting, no file count. | Met | PR #26 deleted the greeting setting, the `show-greeting` command, the file count and the About dialog. An old `greeting` key in `data.json` is dropped without a notice (`tests/e2e/specs/language.e2e.ts`). Two icons of the demo remain in `SHELL_ICONS` (`lucide:info`, `lucide:refresh-cw`) and are unused. |

### Not done

- **Manual checks in a personal vault:** keyboard-only use, a screen reader, other themes, other plugins. No person has done them (the list is in [testing](../engineering/testing.md#manual-checks-in-obsidian)); PBI-66.
- **`CI / e2e` as a required check.** It runs on every pull request but does not block. It is a repository setting of the owner ([github-setup](../engineering/github-setup.md)); PBI-58 criterion 5, PBI-67.
- **The 0.2.0 pre-release** for those manual checks. It has not been tagged; `manifest.json` is 0.1.0. Its tag will also be the first run of the release workflow (PBI-67).
- **Open robustness items** (PBI-65; a root folder inside a hidden folder, found in the review round, is fixed by PR #30):
  - `VaultReady` has no fallback if a Markdown file is never indexed; it would hold the index back. No such file was seen.
  - The known gap of PBI-52: an existing root folder whose name differs from the setting only in case (`weg manager/` for `WEG Manager/`) is not detected, and on Windows and macOS creating a note then fails as a write error.
  - The storage-failure notice after a closed view (see the first criterion).
- **Not part of this plan:** mobile (after the MVP), the other entities, and PBI-01 criteria 2 and 3, which need Punkte.

## 6. Owner decisions (2026-11-21)

| Topic | Decision | Recorded in |
| --- | --- | --- |
| Merging | PR #4 and PR #6 squash-merged. From here each step is its own pull request, merged once gate, e2e and mutation testing are green. | this plan |
| Mobile | After the MVP. K-09 and PBI-33 leave the MVP; step 2.4 is dropped. Layouts still follow container width. | K-09, PBI-33 |
| Tracer entity | Community (Gemeinschaft), the cut described under step 3.6. | PBI-01 comment, tracer PBI |
| Language | English frontmatter keys, value codes and code identifiers; German in the UI and `docs/`. | ADR 0006, `GLOSSARY.md` |
| Records | One note per record, recognised by `schema`, identified by a stable `id` (type plus UUID); readable numbers are a separate field. Root folder `WEG Manager/` as a setting without UI. | ADR 0007 |
| Outside edits | Merged per field; a field changed on both sides stops the save for the user to choose. | ADR 0007 |
| Navigation | One view, own typed routes, state kept by Obsidian. The tracer ships the app frame and one route; no placeholder screens. | ADR 0008 |
| Community selection | Stored per device, not synced; one selection for all views. | ADR 0008 |
| Short code | 2 to 5 characters, A–Z and digits, upper-case, unique, fixed after creation. | tracer PBI |
| Kind and unit label | Plain text on the note, with suggestions in the form. | tracer PBI |
| Demo slice | Deleted completely when the tracer lands. | tracer PBI |

## 7. Deliberately not in this plan

- **The stack.** Effect 4, Vue, Nuxt UI, TanStack Form and the gate stay as they are.
- **A client store (Pinia).** ADR 0002's rule still holds; the index and the filter are services with streams.
- **The vendored agent tooling and the community scan.** Decided on 2026-11-22: `.claude/skills` stays in the repository (section 8).
- **Money and payment logic.** B-NFR-03: not in the MVP.
- **The file contract's content** (fields, ids and file names per entity). That is product design under PBI-31 and PBI-41; this plan builds only the mechanism it will run on.

## 8. Review round (2026-11-22)

After the tracer (PR #26) four fresh reviewers looked at `0cb8292`, each on its own: architecture and design, correctness and robustness, UX and accessibility in real Obsidian 1.15.1, and tests, tooling and release readiness. Their findings were checked against the code before anything was changed. Clear defects were fixed by implementers, one pull request per step, each merged after the gate, the real-Obsidian suite and mutation testing were green. What is not fixed is in the backlog (PBI-60 to PBI-67).

### What the reviews found

- **Correctness:** seven defects, each reproduced. The worst: a save rewrote the user's own frontmatter keys (`plz: 01067` became `1067`, comments were dropped), against the file contract DV-01.
- **UX and accessibility:** in real Obsidian the screen showed list bullets, a 40 px indent and raised ghost buttons; warning text measured 2.95:1; focus was lost after every action. The browser harness hid this, because its host colours and base rules were not Obsidian's.
- **Architecture:** the core (note codec, `NoteStore`, index, event bus, lazy presentation) was judged sound. The gaps were boundary rules that contradicted ADR 0006, error tag lists the compiler did not check, and generic record handling living in `communities`.
- **Tests and tooling:** the release workflow held a write token while running `npm ci`, nothing kept a missing icon from being requested from Iconify's API, and the mutation score of 100 % does not cover the edge layers (82.75 % in the reviewer's own run).

### Merged

| PR | What |
| --- | --- |
| #27 | The closing docs step of this plan (PBI-59): engineering guides, ADRs and `AGENTS.md` match the code. |
| #28 | Boundary rules match ADR 0006 (feature modules may import each other; core modules cannot reach a feature through the composition files); a missing error tag is a type error; a note type missing from `appNoteTypes` fails a test. |
| #29 | A save changes only the frontmatter lines it writes, through `vault.process`; a BOM and the file's line endings stay; a text the line edit cannot handle safely is refused, not written. |
| #30 | Seven communities defects: a selection that survives a note being gone for a moment, no write or trash of a copy with the same id, a hidden root folder falls back, the conflict choice no longer dead-ends, untouched fields are not rewritten, one delete dialog per community, save and rename as one command. |
| #31 | Styles in real Obsidian: a base reset inside the plugin root, colours derived from host variables so every text reaches 4.5:1 (measured by an e2e spec), long names, and a harness whose host matches Obsidian. |
| #32 | The release in two jobs from `main` only, with 0.x as a pre-release; no icon request at runtime; three more lint rules; the nightly mutation run keeps its cache and reports a failure. |
| #33 | Composition seams: one service graph (`appServicesLayer`), commands composed in `appCommands`, the adapter kit of `notes` behind its own entry, command runs that resolve to their outcome. |
| #34 | The communities screen: focus and modality, only communities without issues selectable, texts in plain words that name their data, notices after writes, notes the plugin cannot write open in Obsidian. |
| #35 | The backlog notes PBI-60 to PBI-67 and the owner decisions of the first interview; an e2e spec waits for the list before it clicks. |
| #37 | Tests for the edge layers where planted mutations survived, a shared wait budget and counted work instead of wall-clock bounds, a second, non-gating mutation run for those layers with its own nightly job; the diagnostics name an iOS or Android app correctly. |
| #39 | Generic record handling moved from `communities` into `notes` in every layer (`defineRecords`, `useRecordForm`, `useRecordScreen`); the settings screen belongs to the shell and has one section per module, with the new section "Datenprobleme". |
| #40 | Third-party notices generated from the bundle (26 packages: 25 MIT, 1 ISC), checked by the gate, staged and attested as a fourth release asset. |
| #41 | The unhandled events `ActiveFileChanged` and `ColorSchemeChanged`, `isMarkdown` and the event bus's unused subscription are deleted (PBI-62, criterion 3). |
| #42 | `amber` replaces the community colour `cyan`; the main entry is "Einstellungen" and current on every settings section. |

### Still open before the 0.2.0 tag

One pull request each (owner decisions of the second interview):

1. The module manifest: two entries per module, the lint and fallow module lists generated from the one module list (PBI-60).
2. Write fixes and two rare cases: the closing lines `---` with trailing spaces and `----` are accepted, a comment at the end of a written line stays, a root folder that differs only in case is found, a file name is limited to 255 bytes (PBI-65).

The architecture diagram under `docs/archify/` is regenerated after the manifest; it does not hold the tag.

### Owner decisions (2026-11-22)

| Topic | Decision | Recorded in |
| --- | --- | --- |
| Short code | Stays fixed after creation; the form says so next to the field. | PBI-56 comment |
| Selection | Only communities without issues can be selected. | ADR 0008 amendment, PBI-56 comment |
| Primary colour | Obsidian's accent, darkened for contrast; the handoff's neutral primary is superseded. | PBI-56 comment, PBI-66 |
| German wording | "Vault", not "Tresor". | PBI-56 comment |
| Kind suggestions | Keep following the UI language. | PBI-56 comment |
| Help with defects | Texts point to the plugin's GitHub issues, not to "support". | PBI-56 comment |
| Groundwork | The architecture groundwork from the review is done before the 0.2.0 pre-release. | this plan |
| Agent skills | `.claude/skills` stays in the repository. | this plan |
| Dependabot | Action updates are reviewed and merged by an agent under the standing rule of 2026-11-21. | [github-setup](../engineering/github-setup.md) |

### Owner decisions (2026-11-22, second interview)

| Topic | Decision | Recorded in |
| --- | --- | --- |
| 0.2.0 tag | The agent pushes it once everything listed under "Before the 0.2.0 tag" is on `main` and CI there is green, and watches the first release run. | PBI-67 |
| Third-party notices | A generated file in the repository, kept current by the gate, attached to each release as a fourth asset; already in 0.2.0. | PBI-67 |
| Module manifest | Introduced now. Two entries per module (application side; screens, loaded late); lint and fallow lists generated. | PBI-60 |
| Unused machinery | `useQuery` and `useAppEvents` stay; the two unhandled events, `isMarkdown` and the unused subscription are deleted. | PBI-62 |
| Refused layouts | Only the two closing-line variants are learned; flow style, anchors and unusual keys stay refused. | PBI-65 |
| Line comment | A comment at the end of a written line is kept. | PBI-65 |
| Rare cases | Root folder case and the 255-byte limit before 0.2.0; the other three stay in the backlog. | PBI-65 |
| Contact role | One role per contact, plus the list of communities (O-D10). | ADR 0007 amendment, PBI-61 |
| Palette | `cyan` is replaced by `amber`. | PBI-66 |
| Design documents | Rewritten to the current state, diagrams included. | PBI-66 |
| `CI / e2e` required | Not yet. | PBI-67 |
| Main entry | The frame's main entry is "Einstellungen", current on every settings section. | ADR 0008 amendment |
| Data issues | Whether readable records with a problem of their own (duplicate id, newer version) are also listed under "Datenprobleme" is decided with the second record type. | this plan |
| After the tag | References and dates (PBI-61), the test double and e2e (PBI-63), gate and CI cost (PBI-64), while the owner checks 0.2.0. | this plan |

### Not fixed, in the backlog

| Note | What |
| --- | --- |
| PBI-60 | The module manifest: decided, before the 0.2.0 tag. |
| PBI-61 | References between records, lookup by id, a source for "today": after the tag. The contact role is decided. |
| PBI-62 | One index snapshot across types (with the second note type). The unused machinery is decided, before the 0.2.0 tag. |
| PBI-63 | Fidelity of the Obsidian double, fixed pauses and literal sentences in e2e specs. |
| PBI-64 | Run time and cost of the gate and CI. |
| PBI-65 | Four cases before the 0.2.0 tag; three stay open (no `VaultReady` fallback, two wrong messages). |
| PBI-66 | Manual accessibility checks, the focus ring on inputs, three small points from the UX step; the palette and the documents are decided. |
| PBI-67 | The first release: workflows that have never run; `CI / e2e` as a required check is postponed. |
