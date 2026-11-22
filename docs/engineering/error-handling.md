# Error handling

Decision record: [ADR 0003](../adr/0003-error-handling-and-twelve-factor.md).

## Two kinds of failure

| Kind | What it is | Where it goes |
| --- | --- | --- |
| **Expected failure** | A tagged error in the Effect error channel, part of the `AppError` union in `src/application/errors.ts`, which joins the modules' error unions | `describeError(error, messages)` turns it into a `UserMessage` in the UI language, which a notice or an `ErrorNotice.vue` shows |
| **Defect** | A bug: a thrown exception, `Effect.die`, or a Vue render error | `reportDefect(cause)` logs it with an incident id and shows only that id |

The user never sees a stack trace, a path, a raw `error.message` or note content.

## Adding an expected failure

1. Add a `Schema.TaggedError` class to the module's `errors.ts` (for the notes module `src/application/notes/errors.ts`) and add it to the module's error union (`NotesError`) and to the tag record its manifest names (`NOTES_ERROR_TAG_KEYS`; typecheck fails until it does). `AppError` (`src/application/errors.ts`) is the union of the modules' unions, from their manifests (`src/application/<module>/module.ts`).
2. The module's describer is exhaustive over `_tag`, so typecheck now fails until you add the new case to it (`describeNotesError` in `src/application/notes/user-messages.ts`). Its title and detail go into the module's catalog type (`NotesCatalog` in `src/application/notes/i18n/catalog.ts`) and into both `de.ts` and `en.ts`; typecheck fails until both have them. A new module names its tags and its describer in its manifest (`errors: { tags, describe }`); its union then joins `AppError`, and `describeError` (`src/application/user-messages.ts`) hands each of its errors to that describer.
3. Add a test for the exact German text (and the English one where it matters): `tests/unit/application/notes/user-messages.test.ts` for the notes module, `tests/unit/application/shell/user-messages.test.ts` for the shell, `tests/unit/application/communities/i18n.test.ts` for communities. The first two also hold the property test against leaks, which runs for both catalogs.
4. Return the error from the port or service that can fail. Components get it in `.error` and `.message` of `useQuery(...)` or `useCommand(...)` for the template, and as the outcome `run` resolves to: `{ _tag: "success", value }`, `{ _tag: "failure", error, message }`, `{ _tag: "defect" }` (already reported) or `{ _tag: "interrupted" }`. Code that goes on after `await run(...)` decides on the outcome, never on the refs (a defect leaves `error` empty, too). A run clears `value`, `error` and `message` when it starts. A command that fails after its view closed shows the message as a notice.

## Writing a message

Every message exists in German and English ([ADR 0005](../adr/0005-ui-language.md)); Obsidian's language picks one. German uses the du-form, English sentence case as in Obsidian. Both state first the cause, then the action (design handoff note HO-06, `docs/design/handoff/06 - Texte und Begriffe.md`). No reassurance texts. A domain rule returns an issue code (`SettingsIssue`, `NoteIssue`, `CommunityFieldIssue`), never a sentence; the module's `describe` functions word it (see [UI language](architecture.md#ui-language)).

| | Title | Detail |
| --- | --- | --- |
| Good | Notizen nicht lesbar | Die Dateien im Vault konnten nicht gelesen werden. Versuche es erneut. |
| Bad | Fehler | ENOENT: no such file or directory, open '/vault/Ahornweg/Punkt 12.md' |
| Bad | Keine Sorge! | Deine Daten sind sicher. Etwas ist schiefgelaufen. |

`action` (`retry`, `open-settings`, `copy-diagnostics`) becomes a button in `ErrorNotice.vue`, but only where the parent provides a handler. `copy-diagnostics` is built in.

A message that asks the user to report a problem names the plugin's GitHub page in its detail and carries `link: ISSUES_URL` (`src/application/shell/i18n/catalog.ts`, the one place of `https://github.com/Luis85/weg-manager/issues`): the defect, unreadable settings and the "Diagnose kopiert" confirmation. The user attaches the diagnostics report, which holds no note content. The Obsidian notice and the settings tab build the link with DOM APIs (`createEl("a")`), `ErrorNotice.vue` with a template; nothing uses `innerHTML`. The link opens in the browser (`target="_blank"`, `rel="noopener"`). The detail itself never holds the URL, so it stays free of `/`.

A write that succeeds is confirmed by a short notice through `Notifier` (`severity: "info"`, the title alone, e.g. „Ahornweg 12“ gespeichert); the communities use cases send it after the write (design handoff 02: a toast only confirms a short-lived success, a failure stays as an alert at the form).

## The defect path

Every boundary catches defects and calls `reportDefect`, once:

- bootstrap;
- command callbacks (`runSafely`);
- `useQuery`, `useCommand` and `useStream`;
- the Vue `errorHandler` of each surface;
- the host event adapter (`hostEventsLayer`) and the note index's builds and batches;
- unload (`reportUnloadFailure`, used when the runtime itself is gone).

The boundaries that end an effect (commands, the host event adapter, `useQuery`, `useCommand`, `useStream`) share one policy for a cause they did not expect: `reportUnexpected(cause)` (`src/application/shell/defects.ts`) stays silent for an interruption and reports anything else once, squashed to one value (`Cause.squash`). `Effect.catchCause(reportUnexpected)` guards an effect; the presentation runtime runs it on a run's `Exit`.

`reportDefect` logs `defect.reported` at `error` level with the cause as a `LoggedError` (`toLoggedError`, see Logging) and a six-character incident id (0–9, A–Z), then notifies `describeDefect(id, messages)`. An interruption, for example an unload during a pending action, is not a defect and stays silent.

## Logging

- `Logger` takes structured entries `{ level, event, data?, error?, incidentId? }`. There is no free-form context.
- `data` holds counts and flags only (`number | boolean`). Anything categorical goes into the dotted `event` name, never into a string value.
- `error` is a `LoggedError`: `{ name, message, frames }`. `toLoggedError(cause)` (`src/application/shell/logged-error.ts`) builds it from anything that was thrown. It is the only way to put a cause into a log entry.
  - `name` is the error's `name` if it is a plain identifier (a letter, then letters, digits, `_`, `$` or `.`, at most 64 characters). Otherwise it is `Error`. A cause that is not an `Error` is named `NonError`.
  - `message` is the raw message, or `String(cause)`. It goes to the console sink only, never into the diagnostics report.
  - `frames` come from the stack, at most 10. Each frame keeps the function name (if it is made of code characters only) and the file's last path segment with `:line:col`. Directories and query strings are dropped. A line that is not a V8 frame (`at fn (location)`, `at location`) or a JavaScriptCore/Firefox frame (`fn@location`) is dropped, which covers the `Name: message` line and every line of a multi-line message.
- Event names are stable and dotted: `settings.load.failed`, `plugin.loaded`, `defect.reported`.
- The level comes from the `logLevel` setting (default `warn`); development builds log everything.
- The only `console` use in shipped code is `src/infrastructure/logging/console-sink.ts`. `info` goes to `console.debug`, because Obsidian's guidelines allow only warn, error and debug.
- Never put note content in a log entry. The types make this hard to do by accident: `data` cannot hold a string, and the message is kept out of the report.

## Diagnostics

The `copy-diagnostics` command builds a plain-text report and puts it on the clipboard: plugin version, API version, platform, UI language, settings status and issues, log level, and the last 50 log entries. The report stays German in every UI language, so support reads one format; only the confirmation notice follows the UI language.

The report prints, for each entry: the timestamp, level, event, incident id, `data` as JSON, and the error's `name` with its sanitised frames (one per line, indented). It never prints `message`. This is an allow-list by type: nothing in the report is a free-form string. There is no `redact` step and no length rule. A new field on `LogEntry` must be a type that is safe to print, and the report must be taught to print it on purpose.

`tests/unit/application/shell/diagnostics.test.ts` pins the exact format. `tests/unit/application/shell/diagnostics-leaks.test.ts` runs a defect through the report and checks, also with property tests, that neither the message nor any directory of a stack location appears in it.
