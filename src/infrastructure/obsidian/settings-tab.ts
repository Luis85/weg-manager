import { Effect } from "effect";
import { PluginSettingTab, type App, type Plugin, type SettingDefinitionItem } from "obsidian";
import type { AppRuntime } from "../../application/app-services";
import { ReadOnlySettingsError, type UpdateSettingsError } from "../../application/errors";
import { Notifier } from "../../application/ports";
import type { SettingsService } from "../../application/settings-service";
import { setLogLevel, updateGreeting } from "../../application/use-cases";
import { describeError } from "../../application/user-messages";
import { validatePatch, type LogLevel, type Settings } from "../../domain/settings";
import { runSafely } from "./run";
import type { SettingsMirror } from "./settings-mirror";

type Key = "greeting" | "logLevel";

/** German labels for the dropdown; the stored values stay `error`, `warn`, `info`, `debug`. */
const LOG_LEVEL_LABELS = {
  error: "Fehler",
  warn: "Warnungen",
  info: "Informationen",
  debug: "Details",
} satisfies Record<LogLevel, string>;

const updates: Record<
  Key,
  (value: unknown) => Effect.Effect<Settings, UpdateSettingsError, SettingsService>
> = {
  greeting: (value) => updateGreeting(String(value)),
  logLevel: (value) => setLogLevel(value as LogLevel),
};

/**
 * Obsidian's declarative settings API (1.13+): searchable, rendered by Obsidian. Values come from
 * the settings mirror; every change goes through a use case, validated by the domain rule.
 */
export class ShellSettingTab extends PluginSettingTab {
  constructor(
    app: App,
    plugin: Plugin,
    private readonly runtime: AppRuntime,
    private readonly mirror: SettingsMirror,
  ) {
    super(app, plugin);
  }

  override getSettingDefinitions(): SettingDefinitionItem[] {
    const readOnly = this.mirror.status.readOnlyReason;
    const disabled = readOnly !== undefined;
    const items: SettingDefinitionItem[] = [
      {
        name: "Begrüßung",
        desc: "Text, den der Befehl „Begrüßung anzeigen“ zeigt.",
        control: {
          type: "text",
          key: "greeting",
          disabled,
          validate: (value: string) => this.issueFor({ greeting: value }),
        },
      },
      {
        name: "Protokollstufe",
        desc: "Wie ausführlich das Plugin in die Entwicklerkonsole schreibt.",
        control: {
          type: "dropdown",
          key: "logLevel",
          options: LOG_LEVEL_LABELS,
          disabled,
        },
      },
    ];
    if (readOnly !== undefined) {
      const message = describeError(new ReadOnlySettingsError({ reason: readOnly }));
      items.push({ name: message.title, desc: message.detail, searchable: false });
    }
    return items;
  }

  override getControlValue(key: string): unknown {
    return this.mirror.settings()[key as Key];
  }

  override setControlValue(key: string, value: unknown): Promise<void> {
    const update = updates[key as Key];
    return runSafely(
      this.runtime,
      update(value).pipe(
        Effect.asVoid,
        Effect.catch((error: UpdateSettingsError) =>
          Notifier.use((notifier) => notifier.notify(describeError(error))),
        ),
      ),
    ).then(() => undefined);
  }

  private issueFor(patch: Partial<Settings>): string | undefined {
    const result = validatePatch(this.mirror.settings(), patch);
    return result.ok ? undefined : result.issues.join(" ");
  }
}
