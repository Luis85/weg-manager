import { Effect, Layer, ManagedRuntime } from "effect";
import type { AppRuntime } from "../../src/application/app-services";
import { deviceStoreInMemory } from "../../src/application/shell/device-store";
import { memoryNoteStore, sequentialIdGenerator } from "../../src/infrastructure/memory/notes";
import { InvalidSettingsError } from "../../src/application/shell/errors";
import { messagesLayer } from "../../src/application/messages";
import type { Language } from "../../src/application/shell/i18n/catalog";
import { SettingsService, SettingsServiceLive } from "../../src/application/shell/settings-service";
import type { SettingsIssue } from "../../src/domain/shell/settings";
import {
  controllableVault,
  inMemoryStore,
  recordingClipboard,
  recordingEventBus,
  recordingLogger,
  recordingNotifier,
  sequentialIncidents,
  testHostInfo,
  type StoreOptions,
} from "./layers";

export type TestRuntimeOptions = {
  readonly store?: StoreOptions;
  readonly vault?: number | "fail";
  /** Every settings update fails with these issues, as if the service rejected the value. */
  readonly rejectUpdates?: readonly SettingsIssue[];
  /** The UI language; German by default, so the exact-text tests pin the product's language. */
  readonly language?: Language;
};

const rejecting = (issues: readonly SettingsIssue[]) =>
  Layer.effect(
    SettingsService,
    SettingsService.useSync((base) =>
      SettingsService.of({
        ...base,
        update: () => Effect.fail(new InvalidSettingsError({ issues: [...issues] })),
      }),
    ),
  );

/** An `AppRuntime` built from the in-memory support layers, plus handles to inspect them. */
export const testRuntime = (options: TestRuntimeOptions = {}) => {
  const store = inMemoryStore(options.store);
  const notifier = recordingNotifier();
  const vault = controllableVault(options.vault ?? 3);
  const logger = recordingLogger();
  const clipboard = recordingClipboard();
  const events = recordingEventBus();
  const notes = memoryNoteStore();
  const messages = messagesLayer(options.language ?? "de");
  const live = SettingsServiceLive.pipe(
    Layer.provide(Layer.mergeAll(store.layer, notifier.layer, messages)),
  );
  const settings =
    options.rejectUpdates === undefined
      ? live
      : rejecting(options.rejectUpdates).pipe(Layer.provide(live));
  const layer = Layer.mergeAll(
    settings,
    notifier.layer,
    vault.layer,
    logger.layer,
    sequentialIncidents(),
    clipboard.layer,
    testHostInfo,
    messages,
    events.layer,
    notes.layer,
    deviceStoreInMemory(),
    sequentialIdGenerator().layer,
  );
  const runtime: AppRuntime = ManagedRuntime.make(layer);
  return { runtime, store, notifier, vault, logger, clipboard, events, notes };
};
