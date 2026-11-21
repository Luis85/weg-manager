import { Effect, Fiber, Stream } from "effect";
import type { AppRuntime } from "../../application/app-services";
import { SettingsService, type SettingsStatus } from "../../application/settings-service";
import type { Settings } from "../../domain/settings";

export type SettingsMirror = {
  /** The latest settings, readable synchronously (Obsidian's settings API reads values sync). */
  readonly settings: () => Settings;
  readonly status: SettingsStatus;
  /** Calls `listener` on every change after the current value; returns an unsubscribe. */
  subscribe(listener: (settings: Settings) => void): () => void;
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
  const listeners = new Set<(settings: Settings) => void>();
  const fiber = runtime.runFork(
    SettingsService.use((service) =>
      // The stream starts with the value at subscription time; skip it only if nothing changed in between.
      Stream.runForEach(service.changes, (next) =>
        Effect.sync(() => {
          if (next === current) return;
          current = next;
          for (const listener of Array.from(listeners)) listener(next);
        }),
      ),
    ),
  );
  return {
    settings: () => current,
    status: snapshot.status,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    stop: async () => {
      listeners.clear();
      await runtime.runPromise(Fiber.interrupt(fiber)).catch(() => undefined);
    },
  };
};
