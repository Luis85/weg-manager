import { Effect } from "effect";
import type { LogLevel } from "../../domain/shell";
import { buildDiagnostics } from "./diagnostics";
import { Clipboard, Messages, Notifier } from "./ports";
import { SettingsService } from "./settings-service";
import { describeShellError } from "./user-messages";

/** The only application API of the shell that presentation and the settings tab call. */

export const setLogLevel = (logLevel: LogLevel) =>
  SettingsService.use((settings) => settings.update({ logLevel }));

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
