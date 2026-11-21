import { Cause, Effect, Exit, Stream } from "effect";
import { onScopeDispose, shallowRef, type ShallowRef } from "vue";
import type { AppServices } from "../../../application/app-services";
import type { AppEvent } from "../../../application/events";
import { EventBus, SettingsService, type SettingsStatus } from "../../../application/shell";
import type { Settings } from "../../../domain/shell";
import { reportVueError, useRuntime } from "./use-runtime";

/** Runs `effect` until the component's scope ends; a defect is reported once, an interrupt not. */
const runInScope = (effect: Effect.Effect<void, never, AppServices>): void => {
  const runtime = useRuntime();
  const controller = new AbortController();
  void runtime.runPromiseExit(effect, { signal: controller.signal }).then(
    (exit) =>
      Exit.isFailure(exit) && !Cause.hasInterruptsOnly(exit.cause)
        ? reportVueError(runtime, Cause.squash(exit.cause))
        : undefined,
    // The runtime is disposed (plugin unload): there is nothing left to follow or report to.
    () => undefined,
  );
  onScopeDispose(() => controller.abort());
};

/**
 * Follows a value that a use case hands out: `read` gives it now, `changes` every later value. The
 * ref holds `read`'s value from the first render on, then each value of `changes`, until the
 * component's scope ends and interrupts the stream.
 *
 * - `read` must not suspend (it runs synchronously while the component sets up). A defect there
 *   throws in setup, and the surface reports it once.
 * - A defect in `changes` is reported once; the ref keeps its last value.
 * - A stream that emits the current value first (`SubscriptionRef.changes`) closes the gap between
 *   `read` and the subscription.
 */
export const useStream = <A>(
  read: Effect.Effect<A, never, AppServices>,
  changes: Stream.Stream<A, never, AppServices>,
): Readonly<ShallowRef<A>> => {
  const value = shallowRef(useRuntime().runSync(read));
  runInScope(
    Stream.runForEach(changes, (next) =>
      Effect.sync(() => {
        value.value = next;
      }),
    ),
  );
  return value;
};

const settingsChanges = Stream.unwrap(
  SettingsService.use((service) => Effect.succeed(service.changes)),
);
const statusChanges = Stream.unwrap(
  SettingsService.use((service) => Effect.succeed(service.statusChanges)),
);

/** The current settings, following every change until the component's scope ends. */
export const useSettings = (): Readonly<ShallowRef<Settings>> =>
  useStream(
    SettingsService.use((service) => service.current),
    settingsChanges,
  );

/** Whether settings can be written and why not, following every reload of the settings. */
export const useSettingsStatus = (): Readonly<ShallowRef<SettingsStatus>> =>
  useStream(
    SettingsService.use((service) => service.status),
    statusChanges,
  );

/**
 * Calls `handler` for every `AppEvent` from now until the component's scope ends. A throwing
 * handler is reported as a defect and the subscription keeps running.
 */
export const useAppEvents = (handler: (event: AppEvent) => void): void => {
  const runtime = useRuntime();
  runInScope(
    Effect.scoped(
      EventBus.use((bus) =>
        Effect.flatMap(bus.subscribe, (events) =>
          Stream.runForEach(events, (event) =>
            Effect.sync(() => {
              try {
                handler(event);
              } catch (error) {
                void reportVueError(runtime, error);
              }
            }),
          ),
        ),
      ),
    ),
  );
};
