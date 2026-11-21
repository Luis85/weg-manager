import { Effect, Fiber, Stream } from "effect";
import type { AppRuntime } from "../../application/app-services";
import { SettingsService, type SettingsStatus } from "../../application/settings-service";
import type { Settings } from "../../domain/settings";

export type SettingsMirror = {
  /** The latest settings, readable synchronously (Obsidian's settings API reads values sync). */
  readonly settings: () => Settings;
  readonly status: SettingsStatus;
  stop(): Promise<void>;
};

/** Follows `SettingsService.changes` for the lifetime of one plugin load. */
export const mirrorSettings = async (runtime: AppRuntime): Promise<SettingsMirror> => {
  const snapshot = await runtime.runPromise(
    SettingsService.use((service) =>
      Effect.all({ settings: service.current, status: service.status }),
    ),
  );
  let current = snapshot.settings;
  const fiber = runtime.runFork(
    SettingsService.use((service) =>
      Stream.runForEach(service.changes, (next) =>
        Effect.sync(() => {
          current = next;
        }),
      ),
    ),
  );
  return {
    settings: () => current,
    status: snapshot.status,
    stop: async () => {
      await runtime.runPromise(Fiber.interrupt(fiber)).catch(() => undefined);
    },
  };
};
