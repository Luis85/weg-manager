import { Effect, Fiber, Stream } from "effect";
import type { AppRuntime } from "../../../application/app-services";
import { SettingsService, type SettingsStatus } from "../../../application/shell";
import type { Settings } from "../../../domain/shell";

export type SettingsMirror = {
  /** The latest settings, readable synchronously (Obsidian's settings API reads values sync). */
  readonly settings: () => Settings;
  /** The latest status: whether settings can be written, and why not. */
  readonly status: () => SettingsStatus;
  /** Reads settings and status from the service now, e.g. right after a reload. */
  refresh(): Promise<void>;
  stop(): Promise<void>;
};

const snapshotOf = SettingsService.use((service) =>
  Effect.all({ settings: service.current, status: service.status }),
);

/** Follows `SettingsService.changes` and `statusChanges` for the lifetime of one plugin load. */
export const mirrorSettings = async (runtime: AppRuntime): Promise<SettingsMirror> => {
  let snapshot = await runtime.runPromise(snapshotOf);
  const fiber = runtime.runFork(
    SettingsService.use((service) =>
      Effect.all(
        [
          Stream.runForEach(service.changes, (settings) =>
            Effect.sync(() => {
              snapshot = { ...snapshot, settings };
            }),
          ),
          Stream.runForEach(service.statusChanges, (status) =>
            Effect.sync(() => {
              snapshot = { ...snapshot, status };
            }),
          ),
        ],
        { concurrency: "unbounded", discard: true },
      ),
    ),
  );
  return {
    settings: () => snapshot.settings,
    status: () => snapshot.status,
    refresh: async () => {
      snapshot = await runtime.runPromise(snapshotOf);
    },
    stop: async () => {
      await runtime.runPromise(Fiber.interrupt(fiber)).catch(() => undefined);
    },
  };
};
