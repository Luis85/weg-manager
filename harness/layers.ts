import { Effect, Layer } from "effect";
import type { AppServices } from "../src/application/app-services";
import { appServicesLayer } from "../src/application/app-services-layer";
import { AppEvent } from "../src/application/events";
import { NoteStore } from "../src/application/notes";
import {
  Clipboard,
  ClipboardError,
  EventBus,
  HostInfo,
  Notifier,
  SettingsStore,
  VaultReadError,
  type Language,
  type UserMessage,
} from "../src/application/shell";
import { memoryNoteStore, sequentialIdGenerator } from "../src/infrastructure/memory/notes";
import { localDay } from "../src/domain/shell";
import { deviceStoreInMemory, memoryToday } from "../src/infrastructure/memory/shell";
import { consoleSinkLayer } from "../src/infrastructure/logging/console-sink";
import { incidentsLayer } from "../src/infrastructure/logging/incidents";

/**
 * The states the harness can show (`?scenario=`): two communities, none, notes that break the
 * file contract, a note of a newer schema version, and the note index failing until a retry.
 */
export const SCENARIOS = ["loaded", "empty", "invalid", "readonly", "failure"] as const;
export type Scenario = (typeof SCENARIOS)[number];

/** `?scenario=` value → scenario; anything unknown is `loaded`. */
export const parseScenario = (value: string | null | undefined): Scenario =>
  SCENARIOS.find((scenario) => scenario === value) ?? "loaded";

export type HarnessOptions = {
  /** Where notices go (the harness page renders them). */
  readonly notify?: (message: UserMessage) => void;
  /** Clipboard writer; defaults to one that fails, as outside a secure context. */
  readonly writeClipboard?: (text: string) => Promise<void>;
  /** UI language (`?lang=`); German by default. */
  readonly language?: Language;
};

const HARNESS_FOLDER = "WEG Manager/Gemeinschaften";

/** A community note as the harness seeds it; `n` picks its id. */
const community = (n: number, values: Readonly<Record<string, unknown>>) => ({
  schema: "weg-manager.community/v1",
  id: `community-00000000-0000-4000-8000-${n.toString(16).padStart(12, "0")}`,
  ...values,
});

const AHORNWEG_VALUES = {
  name: "Ahornweg 12",
  short_code: "AW",
  color: "teal",
  kind: "WEG",
  unit_label: "Einheiten",
};
const TIEFGARAGE_VALUES = {
  name: "Tiefgarage Ahornweg",
  short_code: "TG",
  color: "violet",
  kind: "Tiefgarage",
  unit_label: "Stellplätze",
};
const AHORNWEG = community(101, AHORNWEG_VALUES);
const TIEFGARAGE = community(102, TIEFGARAGE_VALUES);

type Memory = ReturnType<typeof memoryNoteStore>;

/** The notes each scenario starts with, as Sync or a person put them into the vault. */
const seedFor = (scenario: Scenario, notes: Memory) => {
  const seed = (name: string, frontmatter: Parameters<Memory["seed"]>[1]) =>
    notes.seed(`${HARNESS_FOLDER}/${name}.md`, frontmatter);
  switch (scenario) {
    case "empty":
      return;
    case "invalid":
      seed("Ahornweg 12", AHORNWEG);
      seed(
        "Birkenallee",
        community(103, {
          ...AHORNWEG_VALUES,
          name: "Birkenallee",
          short_code: "BA",
          color: "cyan",
        }),
      );
      seed("Doppelt", community(104, { ...TIEFGARAGE_VALUES, name: "Doppelt", short_code: "AW" }));
      seed("Kaputt", "broken");
      notes.seed("Notizen/Fremd.md", { schema: "weg-manager.punkt" });
      return;
    case "readonly":
      seed("Ahornweg 12", AHORNWEG);
      seed("Aus der Zukunft", { ...TIEFGARAGE, schema: "weg-manager.community/v2" });
      return;
    case "failure":
    case "loaded":
      seed("Ahornweg 12", AHORNWEG);
      seed("Tiefgarage Ahornweg", TIEFGARAGE);
  }
};

/** In `failure`, the store's first `list` fails, so the index's first build fails until a retry. */
const failingOnce = (scenario: Scenario) =>
  Layer.effect(
    NoteStore,
    NoteStore.useSync((store) => {
      let failures = scenario === "failure" ? 1 : 0;
      return NoteStore.of({
        ...store,
        list: Effect.suspend(() => {
          if (failures === 0) return store.list;
          failures -= 1;
          return Effect.fail(
            new VaultReadError({ cause: new Error("harness: vault unavailable") }),
          );
        }),
      });
    }),
  );

/** Settings kept in memory, starting from the defaults. */
const settingsStore = () => {
  let data: unknown;
  return Layer.succeed(SettingsStore)({
    load: Effect.sync(() => data),
    save: (next: unknown) =>
      Effect.sync(() => {
        data = next;
      }),
  });
};

/**
 * Every application service for the harness: the real application Layers with browser
 * adapters instead of Obsidian's (Twelve-Factor X).
 */
export const harnessLayer = (
  scenario: Scenario,
  options: HarnessOptions = {},
): Layer.Layer<AppServices> => {
  const notifier = Layer.succeed(Notifier)({
    notify: (message: UserMessage) => Effect.sync(() => options.notify?.(message)),
  });
  const write =
    options.writeClipboard ?? (() => Promise.reject(new Error("harness: no clipboard")));
  const memory = memoryNoteStore();
  seedFor(scenario, memory);
  return appServicesLayer(
    {
      settingsStore: settingsStore(),
      notifier,
      clipboard: Layer.succeed(Clipboard)({
        write: (text: string) =>
          Effect.tryPromise({
            try: () => write(text),
            catch: (cause) => new ClipboardError({ cause }),
          }),
      }),
      hostInfo: Layer.succeed(HostInfo)({
        pluginVersion: "harness",
        apiVersion: "none",
        platform: "browser",
      }),
      deviceStore: deviceStoreInMemory(),
      incidents: incidentsLayer,
      logSink: consoleSinkLayer,
      // The browser's day when the page loads; the harness has no view open overnight.
      today: memoryToday(localDay(new Date(), Intl.DateTimeFormat().resolvedOptions().timeZone))
        .layer,
      noteStore: failingOnce(scenario).pipe(Layer.provideMerge(memory.layer)),
      idGenerator: sequentialIdGenerator().layer,
      noteOpener: memory.opener,
      // As the host event adapter is in the plugin: the browser has no metadata cache to wait
      // for, so the vault is ready at once and the index builds from the in-memory notes.
      hostEvents: vaultReadyAtOnce,
    },
    { language: options.language ?? "de", developmentMode: true },
  );
};

const vaultReadyAtOnce = Layer.effectDiscard(
  EventBus.use((bus) =>
    Effect.andThen(bus.publish(AppEvent.LayoutReady()), bus.publish(AppEvent.VaultReady())),
  ),
);
