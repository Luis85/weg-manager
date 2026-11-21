import { Effect, Layer } from "effect";
import type { AppServices } from "../src/application/app-services";
import { AppEvent } from "../src/application/events";
import { appNoteTypes } from "../src/application/note-types";
import { noteIndexLayer } from "../src/application/notes";
import { messagesLayer } from "../src/application/messages";
import {
  Clipboard,
  ClipboardError,
  deviceStoreInMemory,
  EventBus,
  EventBusLive,
  HostInfo,
  LoggerLive,
  Notifier,
  SettingsServiceLive,
  SettingsStore,
  StorageError,
  VaultReadError,
  VaultReader,
  type Language,
  type UserMessage,
} from "../src/application/shell";
import { memoryNoteStore, sequentialIdGenerator } from "../src/infrastructure/memory/notes";
import { consoleSinkLayer } from "../src/infrastructure/logging/console-sink";
import { incidentsLayer } from "../src/infrastructure/logging/incidents";

export const SCENARIOS = ["default", "empty", "error", "slow", "readonly"] as const;
export type Scenario = (typeof SCENARIOS)[number];

export const SLOW_MS = 1500;
export const HARNESS_FILE_COUNT = 42;

/** `?scenario=` value → scenario; anything unknown is `default`. */
export const parseScenario = (value: string | null | undefined): Scenario =>
  SCENARIOS.find((scenario) => scenario === value) ?? "default";

export type HarnessOptions = {
  /** Where notices go (the harness page renders them). */
  readonly notify?: (message: UserMessage) => void;
  /** Clipboard writer; defaults to one that fails, as outside a secure context. */
  readonly writeClipboard?: (text: string) => Promise<void>;
  /** UI language (`?lang=`); German by default. */
  readonly language?: Language;
};

const vaultFor = (scenario: Scenario) => {
  switch (scenario) {
    case "empty":
      return Effect.succeed(0);
    case "error":
      return Effect.fail(new VaultReadError({ cause: new Error("harness: vault unavailable") }));
    case "slow":
      return Effect.as(Effect.sleep(SLOW_MS), HARNESS_FILE_COUNT);
    default:
      return Effect.succeed(HARNESS_FILE_COUNT);
  }
};

/** Settings kept in memory; `readonly` starts from a file written by a newer plugin version. */
const storeFor = (scenario: Scenario) => {
  let data: unknown = scenario === "readonly" ? { schemaVersion: 99 } : undefined;
  return Layer.succeed(SettingsStore)({
    load: Effect.sync(() => data),
    save: (next: unknown) =>
      scenario === "readonly"
        ? Effect.fail(new StorageError({ cause: new Error("harness: read-only") }))
        : Effect.sync(() => {
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
  const adapters = Layer.mergeAll(
    storeFor(scenario),
    notifier,
    Layer.succeed(VaultReader)({ markdownFileCount: vaultFor(scenario) }),
    Layer.succeed(Clipboard)({
      write: (text: string) =>
        Effect.tryPromise({
          try: () => write(text),
          catch: (cause) => new ClipboardError({ cause }),
        }),
    }),
    Layer.succeed(HostInfo)({ pluginVersion: "harness", apiVersion: "none", platform: "browser" }),
    messagesLayer(options.language ?? "de"),
    deviceStoreInMemory(),
  );
  const settings = SettingsServiceLive.pipe(Layer.provideMerge(adapters));
  const logger = LoggerLive({ developmentMode: true }).pipe(Layer.provide(consoleSinkLayer));
  const shell = Layer.mergeAll(
    logger.pipe(Layer.provideMerge(settings)),
    incidentsLayer,
    EventBusLive,
  );
  const notes = noteIndexLayer(appNoteTypes).pipe(
    Layer.provideMerge(
      Layer.merge(memoryNoteStore().layer, sequentialIdGenerator().layer).pipe(
        Layer.provideMerge(shell),
      ),
    ),
  );
  // Built last, as the host event adapter is in the plugin: the browser has no metadata cache to
  // wait for, so the vault is ready at once and the index builds from the in-memory notes.
  return vaultReadyAtOnce.pipe(Layer.provideMerge(notes));
};

const vaultReadyAtOnce = Layer.effectDiscard(
  EventBus.use((bus) =>
    Effect.andThen(bus.publish(AppEvent.LayoutReady()), bus.publish(AppEvent.VaultReady())),
  ),
);
