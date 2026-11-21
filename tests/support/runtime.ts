import { Effect, Layer, ManagedRuntime } from "effect";
import type { AppRuntime } from "../../src/application/app-services";
import { InvalidSettingsError } from "../../src/application/errors";
import { SettingsService, SettingsServiceLive } from "../../src/application/settings-service";
import {
  controllableVault,
  inMemoryStore,
  recordingClipboard,
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
  readonly rejectUpdates?: readonly string[];
};

const rejecting = (issues: readonly string[]) =>
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
  const live = SettingsServiceLive.pipe(Layer.provide(Layer.merge(store.layer, notifier.layer)));
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
  );
  const runtime: AppRuntime = ManagedRuntime.make(layer);
  return { runtime, store, notifier, vault, logger, clipboard };
};
