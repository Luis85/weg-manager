import { Effect } from "effect";
import { PluginSettingTab, type App, type Plugin, type SettingDefinitionItem } from "obsidian";
import type { AppRuntime } from "../../../application/app-services";
import {
  Notifier,
  ReadOnlySettingsError,
  describeShellError,
  setLogLevel,
  setWeekSettings,
  type ShellCatalog,
  type UpdateSettingsError,
  type WeekSettingKey,
} from "../../../application/shell";
import { WEEKDAYS, WEEK_LIMITS, type LogLevel, type Settings } from "../../../domain/shell";
import { detailFragment } from "./notices";
import { runSafely } from "./run";
import type { SettingsMirror } from "./settings-mirror";

/** The steps of the time target the dropdown offers, in minutes. */
const MINUTE_STEPS = [15, 30, 45, 60, 75, 90, 120, 150, 180, 240];

/** Every whole number from `min` to `max`. */
const range = ({ min, max }: { readonly min: number; readonly max: number }) =>
  Array.from({ length: max - min + 1 }, (_, index) => min + index);

/** Dropdown options of numbers, the stored value among them even when it is no step. */
const numberOptions = (values: readonly number[], current: number, label: (n: number) => string) =>
  Object.fromEntries(
    [...new Set([...values, current])].toSorted((a, b) => a - b).map((n) => [String(n), label(n)]),
  );

const WEEK_KEYS: ReadonlySet<string> = new Set<WeekSettingKey>([
  "weekStart",
  "weekMinutes",
  "weekDecisions",
  "acuteDays",
]);

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
      ...this.weekDefinitions(readOnly !== undefined),
    ];
    if (readOnly !== undefined) {
      const message = describeShellError(
        new ReadOnlySettingsError({ reason: readOnly }),
        this.messages,
      );
      items.push({ name: message.title, desc: detailFragment(message), searchable: false });
    }
    return items;
  }

  /** The weekly work (PBI-13 criterion 5), each a dropdown, so no value outside its range. */
  private weekDefinitions(disabled: boolean): SettingDefinitionItem[] {
    const texts = this.messages.settingsTab;
    const current = this.mirror.settings();
    const dropdown = (key: WeekSettingKey, options: Record<string, string>) => ({
      type: "dropdown" as const,
      key,
      options,
      disabled,
    });
    return [
      {
        name: texts.weekStart.name,
        desc: texts.weekStart.desc,
        control: dropdown(
          "weekStart",
          Object.fromEntries(WEEKDAYS.map((day) => [day, texts.weekStart.labels[day]])),
        ),
      },
      {
        name: texts.weekMinutes.name,
        desc: texts.weekMinutes.desc,
        control: dropdown(
          "weekMinutes",
          numberOptions(MINUTE_STEPS, current.weekMinutes, (n) => texts.weekMinutes.minutes(n)),
        ),
      },
      {
        name: texts.weekDecisions.name,
        desc: texts.weekDecisions.desc,
        control: dropdown(
          "weekDecisions",
          numberOptions(range(WEEK_LIMITS.weekDecisions), current.weekDecisions, String),
        ),
      },
      {
        name: texts.acuteDays.name,
        desc: texts.acuteDays.desc,
        control: dropdown(
          "acuteDays",
          numberOptions(range(WEEK_LIMITS.acuteDays), current.acuteDays, (n) =>
            texts.acuteDays.days(n),
          ),
        ),
      },
    ];
  }

  override getControlValue(key: string): unknown {
    const settings = this.mirror.settings();
    if (key === "logLevel") return settings.logLevel;
    return WEEK_KEYS.has(key) ? String(settings[key as WeekSettingKey]) : undefined;
  }

  override setControlValue(key: string, value: unknown): Promise<void> {
    if (key !== "logLevel" && !WEEK_KEYS.has(key)) return Promise.resolve();
    const change =
      key === "logLevel"
        ? setLogLevel(value as LogLevel)
        : setWeekSettings(weekPatch(key as WeekSettingKey, String(value)));
    return runSafely(
      this.runtime,
      change.pipe(
        Effect.asVoid,
        Effect.catch((error: UpdateSettingsError) =>
          Notifier.use((notifier) => notifier.notify(describeShellError(error, this.messages))),
        ),
      ),
    ).then(() => undefined);
  }
}

/** A week setting from its dropdown value: the day as written, a number as a number. */
const weekPatch = (key: WeekSettingKey, value: string): Partial<Settings> =>
  key === "weekStart" ? { weekStart: value as Settings["weekStart"] } : { [key]: Number(value) };
