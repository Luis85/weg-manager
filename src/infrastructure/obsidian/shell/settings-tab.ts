import { Effect } from "effect";
import { PluginSettingTab, type App, type Plugin, type SettingDefinitionItem } from "obsidian";
import type { AppRuntime } from "../../../application/app-services";
import {
  Notifier,
  ReadOnlySettingsError,
  describeShellError,
  setLogLevel,
  type ShellCatalog,
  type UpdateSettingsError,
} from "../../../application/shell";
import type { LogLevel } from "../../../domain/shell";
import { runSafely } from "./run";
import type { SettingsMirror } from "./settings-mirror";

/**
 * Obsidian's declarative settings API (1.13+): searchable, rendered by Obsidian. It holds only the
 * plugin-wide technical settings; feature data such as the communities is edited in the plugin's
 * views (PBI-49). Values come from the settings mirror; every change goes through a use case.
 * Texts come from the catalog of the UI language.
 */
export class ShellSettingTab extends PluginSettingTab {
  constructor(
    app: App,
    plugin: Plugin,
    private readonly runtime: AppRuntime,
    private readonly mirror: SettingsMirror,
    private readonly messages: ShellCatalog,
  ) {
    super(app, plugin);
  }

  override getSettingDefinitions(): SettingDefinitionItem[] {
    const readOnly = this.mirror.status().readOnlyReason;
    const texts = this.messages.settingsTab;
    const items: SettingDefinitionItem[] = [
      {
        name: texts.logLevel.name,
        desc: texts.logLevel.desc,
        control: {
          type: "dropdown",
          key: "logLevel",
          options: { ...texts.logLevel.labels },
          disabled: readOnly !== undefined,
        },
      },
    ];
    if (readOnly !== undefined) {
      const message = describeShellError(
        new ReadOnlySettingsError({ reason: readOnly }),
        this.messages,
      );
      items.push({ name: message.title, desc: message.detail, searchable: false });
    }
    return items;
  }

  override getControlValue(key: string): unknown {
    return key === "logLevel" ? this.mirror.settings().logLevel : undefined;
  }

  override setControlValue(key: string, value: unknown): Promise<void> {
    if (key !== "logLevel") return Promise.resolve();
    return runSafely(
      this.runtime,
      setLogLevel(value as LogLevel).pipe(
        Effect.asVoid,
        Effect.catch((error: UpdateSettingsError) =>
          Notifier.use((notifier) => notifier.notify(describeShellError(error, this.messages))),
        ),
      ),
    ).then(() => undefined);
  }
}
