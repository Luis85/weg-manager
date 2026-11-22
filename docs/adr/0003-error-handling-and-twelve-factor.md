# ADR 0003 · Error handling and Twelve-Factor rules

- Status: accepted; texts amended by [ADR 0005](0005-ui-language.md) (German and English); diagnostics amended on 2026-11-21 (see the note at the end)
- Date: 2026-11-21

## Context

Users of this plugin are volunteer board members, not developers. A failure must tell them what happened and what to do, and it must never expose note content, paths or stack traces. Support then needs enough detail to fix the bug without access to the user's vault.

## Decision

### Error taxonomy

- **Expected failures** are tagged errors in the Effect error channel. Their union is `AppError`: `StorageError`, `ReadOnlySettingsError`, `InvalidSettingsError`, `VaultReadError`, `ClipboardError`.
- `describeError` is exhaustive over `_tag`, so a new error without a message is a type error.
- Texts are German, du-form, cause then action (handoff HO-06).
- **Defects** (bugs) go through `reportDefect` exactly once per boundary. It logs the cause with a six-character incident id and shows the user only that id and the diagnostics action.
- **Diagnostics** replace console digging. `copy-diagnostics` copies a report with the last 50 log entries. The report is built from typed fields only (event, counts and flags, the error's name and sanitised stack frames), never from free text, so it needs no redaction.

Details and the how-to: `docs/engineering/error-handling.md`.

### Twelve-Factor, adapted

| Factor | Rule |
| --- | --- |
| I Codebase | One repo, one plugin. `dist/` is built, never committed. |
| II Dependencies | Pinned exactly and declared. The host provides only `obsidian`, `electron`, `@codemirror/*`, `@lezer/*` and Node builtins. |
| III Config | Runtime config lives only in `data.json`, through `SettingsService` (validated, versioned). `src/**` reads no `process.env`, and of `import.meta.env` only `MODE` (lint-enforced). |
| IV Backing services | Vault, notifications, clipboard, logging and incident ids are ports with swappable Layers. |
| V Build, release, run | `npm run build` makes an immutable `dist/`. A release is the artifact for a tag equal to `manifest.version`. |
| VI Processes | No module-level mutable state in `src/**`. State belongs to the runtime of one plugin load or is persisted. |
| VII Port binding | Not applicable: a plugin serves nothing. |
| VIII Concurrency | Not applicable: Obsidian owns the process. |
| IX Disposability | `onload` returns quickly; `onunload` releases in reverse order, even after a failure. |
| X Dev/prod parity | The same application Layers run in Obsidian, the harness and the tests. |
| XI Logs | A structured `Logger` with dotted event names. The console sink is the only `console` use. |
| XII Admin processes | One-off maintenance runs as a command through the runtime. |

VII and VIII are listed so that nobody adds a local server or a worker without a new ADR. A plugin has no port to bind, and its process model belongs to Obsidian.

## Consequences

- Each new failure costs a tag, a message and a test. In return, every failure reaches the user in plain words.
- Message texts are pinned by tests, so changing the wording is a deliberate change.
- Incident ids are not cryptographic. They only correlate a notice with a log entry.

## Amendment, 2026-11-21: typed diagnostics

The first version redacted the report by key name and string length. That failed both ways. A real stack is longer than 200 characters, so a defect showed only `{"cause":"[redacted]"}`. A short message or a thrown string passed through, although it can name a file ("File already exists: Ahornweg/Punkt 12.md"), which B-NFR-07 forbids in diagnostics.

Decision: a log entry carries `data` (counts and flags) and `error` (`{ name, message, frames }`) instead of free-form `context`. `toLoggedError` reduces a cause to a strict-identifier name and frames that hold only the last path segment of a location. The diagnostics report prints name and frames, never the message. The raw message goes to the console sink only. `redact` and its length rule are deleted.

Consequence: a defect in a user's report shows its error type and where it happened, and the type system, not a filter, keeps note content and paths out. Details: `docs/engineering/error-handling.md`.

## Amendment, 2026-11-21: errors per module

The list of `AppError` members above is the shell's as first built. Since [ADR 0006](0006-module-structure.md) each module owns its tagged errors and their texts, and `AppError` is the union of the modules' error unions (`src/application/errors.ts`). `describeError` hands an error to its module's describer and stays exhaustive: an error without a text does not compile. The current members are in each module's `errors.ts`.

