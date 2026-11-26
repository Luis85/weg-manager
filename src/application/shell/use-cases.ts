import { Effect } from "effect";
import type { EditableSettings, LogLevel } from "../../domain/shell";
import { buildDiagnostics } from "./diagnostics";
import { Clipboard, Messages, Notifier } from "./ports";
import { SettingsService } from "./settings-service";
import { ISSUES_URL } from "./i18n/catalog";
import { describeShellError } from "./user-messages";

/** The only application API of the shell that presentation and the settings tab call. */

export const setLogLevel = (logLevel: LogLevel) =>
  SettingsService.use((settings) => settings.update({ logLevel }));

export const copyDiagnostics = Effect.gen(function* () {
  const notifier = yield* Notifier;
  const { shell: messages } = yield* Messages;
  const report = yield* buildDiagnostics;
  yield* (yield* Clipboard).write(report).pipe(
    Effect.andThen(
      notifier.notify({ severity: "info", ...messages.diagnosticsCopied, link: ISSUES_URL }),
    ),
    Effect.catchTag("ClipboardError", (error) =>
      notifier.notify(describeShellError(error, messages)),
    ),
  );
});

/** Changes the settings of the weekly work (PBI-13 criterion 5), all or nothing. */
export const setWeekSettings = (patch: Partial<Pick<EditableSettings, WeekSettingKey>>) =>
  SettingsService.use((settings) => settings.update(patch));

/** The settings of the weekly work, edited in Obsidian's settings tab. */
export type WeekSettingKey = "weekStart" | "weekMinutes" | "weekDecisions" | "acuteDays";
