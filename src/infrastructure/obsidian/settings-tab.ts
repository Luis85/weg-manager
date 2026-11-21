import { Effect } from "effect";
import { PluginSettingTab, type App, type Plugin, type SettingDefinitionItem } from "obsidian";
import type { AppRuntime } from "../../application/app-services";
import { ReadOnlySettingsError, type UpdateSettingsError } from "../../application/errors";
import { Messages, Notifier } from "../../application/ports";
import type { SettingsService } from "../../application/settings-service";
import { setLogLevel, updateGreeting } from "../../application/use-cases";
import { describeIssues, greetingOf, type Catalog } from "../../application/i18n";
import { describeError } from "../../application/user-messages";
import { validatePatch, type LogLevel, type Settings } from "../../domain/settings";
import { runSafely } from "./run";
import type { SettingsMirror } from "./settings-mirror";

type Key = "greeting" | "logLevel";

const updates: Record<
  Key,
  (value: unknown) => Effect.Effect<Settings, UpdateSettingsError, SettingsService | Messages>
> = {
  greeting: (value) => updateGreeting(String(value)),
  logLevel: (value) => setLogLevel(value as LogLevel),
};

/**
 * Obsidian's declarative settings API (1.13+): searchable, rendered by Obsidian. Values come from
 * the settings mirror; every change goes through a use case, validated by the domain rule. Texts
 * come from the catalog of the UI language.
 */
export class ShellSettingTab extends PluginSettingTab {
  constructor(
    app: App,
    plugin: Plugin,
    private readonly runtime: AppRuntime,
    private readonly mirror: SettingsMirror,
    private readonly messages: Catalog,
  ) {
    super(app, plugin);
  }

  override getSettingDefinitions(): SettingDefinitionItem[] {
    const readOnly = this.mirror.status().readOnlyReason;
    const disabled = readOnly !== undefined;
    const texts = this.messages.settingsTab;
    const items: SettingDefinitionItem[] = [
      {
        name: texts.greeting.name,
        desc: texts.greeting.desc,
        control: {
          type: "text",
          key: "greeting",
          disabled,
          validate: (value: string) => this.issueFor({ greeting: value }),
        },
      },
      {
        name: texts.logLevel.name,
        desc: texts.logLevel.desc,
        control: {
          type: "dropdown",
          key: "logLevel",
          options: { ...texts.logLevel.labels },
          disabled,
        },
      },
    ];
    if (readOnly !== undefined) {
      const message = describeError(new ReadOnlySettingsError({ reason: readOnly }), this.messages);
      items.push({ name: message.title, desc: message.detail, searchable: false });
    }
    return items;
  }

  override getControlValue(key: string): unknown {
    const settings = this.mirror.settings();
    return key === "greeting" ? greetingOf(settings, this.messages) : settings[key as Key];
  }

  override setControlValue(key: string, value: unknown): Promise<void> {
    const update = updates[key as Key];
    return runSafely(
      this.runtime,
      update(value).pipe(
        Effect.asVoid,
        Effect.catch((error: UpdateSettingsError) =>
          Notifier.use((notifier) => notifier.notify(describeError(error, this.messages))),
        ),
      ),
    ).then(() => undefined);
  }

  private issueFor(patch: Partial<Settings>): string | undefined {
    const result = validatePatch(this.mirror.settings(), patch);
    return result.ok ? undefined : describeIssues(result.issues, this.messages);
  }
}
