import { Effect } from "effect";
import type { LogLevel } from "../../domain/shell";
import { buildDiagnostics } from "./diagnostics";
import { greetingOf } from "./i18n/describe";
import { Clipboard, Messages, Notifier, VaultReader } from "./ports";
import { SettingsService } from "./settings-service";
import { describeShellError } from "./user-messages";

/** The only application API that presentation calls. */

/**
 * Saves a greeting the user typed. The default greeting of the UI language is stored as "not
 * customised", so it keeps following the language (ADR 0005).
 */
export const updateGreeting = (greeting: string) =>
  Effect.gen(function* () {
    const { defaultGreeting } = (yield* Messages).shell;
    const settings = yield* SettingsService;
    return yield* settings.update({
      greeting: greeting.trim() === defaultGreeting ? null : greeting,
    });
  });

export const setLogLevel = (logLevel: LogLevel) =>
  SettingsService.use((settings) => settings.update({ logLevel }));

export const showGreeting = Effect.gen(function* () {
  const { shell: messages } = yield* Messages;
  const settings = yield* (yield* SettingsService).current;
  yield* (yield* Notifier).notify({
    severity: "info",
    title: "WEG Manager",
    detail: greetingOf(settings, messages),
  });
});

export const countMarkdownFiles = VaultReader.use((vault) => vault.markdownFileCount);

export const copyDiagnostics = Effect.gen(function* () {
  const notifier = yield* Notifier;
  const { shell: messages } = yield* Messages;
  const report = yield* buildDiagnostics;
  yield* (yield* Clipboard).write(report).pipe(
    Effect.andThen(notifier.notify({ severity: "info", ...messages.diagnosticsCopied })),
    Effect.catchTag("ClipboardError", (error) =>
      notifier.notify(describeShellError(error, messages)),
    ),
  );
});
