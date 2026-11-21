import { Cause, Effect, Exit, Option, Stream } from "effect";
import {
  inject,
  onScopeDispose,
  readonly,
  shallowRef,
  type App,
  type InjectionKey,
  type Ref,
  type ShallowRef,
} from "vue";
import type { AppRuntime, AppServices } from "../../application/app-services";
import { reportDefect } from "../../application/defects";
import type { AppError } from "../../application/errors";
import { EventBus } from "../../application/event-bus";
import type { AppEvent } from "../../application/events";
import { SettingsService, type SettingsStatus } from "../../application/settings-service";
import { describeError, type UserMessage } from "../../application/user-messages";
import type { Settings } from "../../domain/settings";

/**
 * The only presentation module that imports `effect`. Components run use cases through
 * `useEffectAction` and read state through `useSettings`; they never see an Effect value.
 */

const RUNTIME_KEY: InjectionKey<AppRuntime> = Symbol("weg-manager/runtime");

export const provideRuntime = (app: App, runtime: AppRuntime): void => {
  app.provide(RUNTIME_KEY, runtime);
};

export const useRuntime = (): AppRuntime => {
  const runtime = inject(RUNTIME_KEY);
  if (runtime === undefined) throw new Error("useRuntime() outside a mounted surface");
  return runtime;
};

/** Routes a defect to `reportDefect`; never rejects (the runtime may already be disposed). */
export const reportVueError = (runtime: AppRuntime, cause: unknown): Promise<void> =>
  runtime.runPromise(reportDefect(cause)).then(
    () => undefined,
    () => undefined,
  );

export type EffectAction<Args extends unknown[], A, E> = {
  run(...args: Args): Promise<void>;
  readonly pending: Readonly<Ref<boolean>>;
  readonly value: Readonly<ShallowRef<A | undefined>>;
  readonly error: Readonly<ShallowRef<E | undefined>>;
  readonly message: Readonly<ShallowRef<UserMessage | undefined>>;
};

/**
 * Runs a use case from a component. Never rejects: a typed failure lands in `error` and
 * `message`, a defect is reported once and leaves `error` empty, a result arriving after the
 * component's scope ended is dropped, and a second `run` interrupts the first.
 */
export const useEffectAction = <Args extends unknown[], A, E extends AppError>(
  fn: (...args: Args) => Effect.Effect<A, E, AppServices>,
): EffectAction<Args, A, E> => {
  const runtime = useRuntime();
  const pending = shallowRef(false);
  const value = shallowRef<A | undefined>();
  const error = shallowRef<E | undefined>();
  const message = shallowRef<UserMessage | undefined>();
  let alive = true;
  let current: AbortController | undefined;

  onScopeDispose(() => {
    alive = false;
    current?.abort();
  });

  const settle = (exit: Exit.Exit<A, E>): Promise<void> | undefined => {
    if (Exit.isSuccess(exit)) {
      value.value = exit.value;
      return undefined;
    }
    if (Cause.hasInterruptsOnly(exit.cause)) return undefined;
    const failure = Cause.findErrorOption(exit.cause);
    if (Option.isSome(failure)) {
      error.value = failure.value;
      message.value = describeError(failure.value);
      return undefined;
    }
    return reportVueError(runtime, Cause.squash(exit.cause));
  };

  const run = async (...args: Args): Promise<void> => {
    current?.abort();
    const controller = new AbortController();
    current = controller;
    pending.value = true;
    error.value = undefined;
    message.value = undefined;
    const exit = await runtime
      .runPromiseExit(
        Effect.suspend(() => fn(...args)),
        { signal: controller.signal },
      )
      .catch((cause: unknown) => Exit.die(cause));
    if (!alive || current !== controller) return;
    current = undefined;
    pending.value = false;
    await settle(exit);
  };

  return {
    run,
    pending: readonly(pending),
    value: readonly(value) as Readonly<ShallowRef<A | undefined>>,
    error: readonly(error) as Readonly<ShallowRef<E | undefined>>,
    message: readonly(message),
  };
};

/** The current settings, following every change until the component's scope ends. */
export const useSettings = (): Readonly<ShallowRef<Settings>> => {
  const runtime = useRuntime();
  const settings = shallowRef(runtime.runSync(SettingsService.use((service) => service.current)));
  const controller = new AbortController();
  void runtime
    .runPromiseExit(
      SettingsService.use((service) =>
        Stream.runForEach(service.changes, (next) =>
          Effect.sync(() => {
            settings.value = next;
          }),
        ),
      ),
      { signal: controller.signal },
    )
    .catch(() => undefined);
  onScopeDispose(() => controller.abort());
  return settings;
};

/**
 * Calls `handler` for every `AppEvent` from now until the component's scope ends. A throwing
 * handler is reported as a defect and the subscription keeps running.
 */
export const useAppEvents = (handler: (event: AppEvent) => void): void => {
  const runtime = useRuntime();
  const controller = new AbortController();
  void runtime
    .runPromiseExit(
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
      { signal: controller.signal },
    )
    .catch(() => undefined);
  onScopeDispose(() => controller.abort());
};

/** Whether settings can be written; fixed for one plugin load. */
export const useSettingsStatus = (): SettingsStatus =>
  useRuntime().runSync(SettingsService.use((service) => service.status));
