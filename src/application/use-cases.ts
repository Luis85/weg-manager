import { Effect } from "effect";
import type { LogLevel } from "../domain/settings";
import { buildDiagnostics } from "./diagnostics";
import { Clipboard, Notifier, VaultReader } from "./ports";
import { SettingsService } from "./settings-service";
import { describeError } from "./user-messages";

/** The only application API that presentation calls. */

export const updateGreeting = (greeting: string) =>
  SettingsService.use((settings) => settings.update({ greeting }));

export const setLogLevel = (logLevel: LogLevel) =>
  SettingsService.use((settings) => settings.update({ logLevel }));

export const showGreeting = Effect.gen(function* () {
  const { greeting } = yield* (yield* SettingsService).current;
  yield* (yield* Notifier).notify({ severity: "info", title: "WEG Manager", detail: greeting });
});

export const countMarkdownFiles = VaultReader.use((vault) => vault.markdownFileCount);

export const copyDiagnostics = Effect.gen(function* () {
  const notifier = yield* Notifier;
  const report = yield* buildDiagnostics;
  yield* (yield* Clipboard).write(report).pipe(
    Effect.andThen(
      notifier.notify({
        severity: "info",
        title: "Diagnose kopiert",
        detail: "Füge den Bericht in deine Support-Anfrage ein.",
      }),
    ),
    Effect.catchTag("ClipboardError", (error) => notifier.notify(describeError(error))),
  );
});
