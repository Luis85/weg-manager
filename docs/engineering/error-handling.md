# Error handling

Decision record: [ADR 0003](../adr/0003-error-handling-and-twelve-factor.md).

## Two kinds of failure

| Kind | What it is | Where it goes |
| --- | --- | --- |
| **Expected failure** | A tagged error in the Effect error channel, part of the `AppError` union in `src/application/errors.ts` | `describeError(error, messages)` turns it into a `UserMessage` in the UI language, which a notice or an `ErrorNotice.vue` shows |
| **Defect** | A bug: a thrown exception, `Effect.die`, or a Vue render error | `reportDefect(cause)` logs it with an incident id and shows only that id |

The user never sees a stack trace, a path, a raw `error.message` or note content.

## Adding an expected failure

1. Add a `Schema.TaggedError` class to `src/application/errors.ts` and add it to `AppError`.
2. `describeError` is exhaustive over `_tag`, so typecheck now fails until you add the new case to `src/application/user-messages.ts`. Its title and detail go into `Catalog` (`src/application/i18n/catalog.ts`) and into both `de.ts` and `en.ts`; typecheck fails until both have them.
3. Add a test in `tests/unit/application/user-messages.test.ts` for the exact German text (and the English one where it matters), and run the property test against leaks, which runs for both catalogs.
4. Return the error from the port or service that can fail. Components get it in `useEffectAction(...).error` and `.message`.

## Writing a message

Every message exists in German and English ([ADR 0005](../adr/0005-ui-language.md)); Obsidian's language picks one. German uses the du-form, English sentence case as in Obsidian. Both state first the cause, then the action (handoff HO-06). No reassurance texts. A domain rule returns an issue code (`SettingsIssue`), never a sentence; `describeIssue` words it.

| | Title | Detail |
| --- | --- | --- |
| Good | Notizen nicht lesbar | Die Dateien im Vault konnten nicht gelesen werden. Versuche es erneut. |
| Bad | Fehler | ENOENT: no such file or directory, open '/vault/Ahornweg/Punkt 12.md' |
| Bad | Keine Sorge! | Deine Daten sind sicher. Etwas ist schiefgelaufen. |

`action` (`retry`, `open-settings`, `copy-diagnostics`) becomes a button in `ErrorNotice.vue`, but only where the parent provides a handler. `copy-diagnostics` is built in.

## The defect path

Every boundary catches defects and calls `reportDefect`, once:

- bootstrap;
- command callbacks (`runSafely`);
- `useEffectAction`;
- the Vue `errorHandler` of each surface;
- unload (`reportUnloadFailure`, used when the runtime itself is gone).

`reportDefect` logs `defect.reported` at `error` level with the cause and a six-character incident id (0–9, A–Z), then notifies `describeDefect(id, messages)`. An interruption, for example an unload during a pending action, is not a defect and stays silent.

## Logging

- `Logger` takes structured entries `{ level, event, context?, incidentId? }`.
- Event names are stable and dotted: `settings.load.failed`, `plugin.loaded`, `defect.reported`.
- The level comes from the `logLevel` setting (default `warn`); development builds log everything.
- The only `console` use in shipped code is `src/infrastructure/logging/console-sink.ts`. `info` goes to `console.debug`, because Obsidian's guidelines allow only warn, error and debug.
- Never put note content in a log entry.

## Diagnostics

The `copy-diagnostics` command builds a plain-text report and puts it on the clipboard: plugin version, API version, platform, UI language, settings status and issues, log level, and the last 50 log entries. The report stays German in every UI language, so support reads one format; only the confirmation notice follows the UI language.

`redact` replaces the values of the keys `content`, `body`, `text`, `path` and `name`, and any string longer than 200 characters, with `[redacted]`. `tests/unit/application/diagnostics.test.ts` pins the exact format.
