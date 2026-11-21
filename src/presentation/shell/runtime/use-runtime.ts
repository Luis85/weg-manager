import { Cause, Effect, Exit, Option } from "effect";
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
import type { AppRuntime, AppServices } from "../../../application/app-services";
import type { AppError } from "../../../application/errors";
import type { Catalog } from "../../../application/messages";
import { Messages, Notifier, reportDefect, type UserMessage } from "../../../application/shell";
import { describeError } from "../../../application/user-messages";

/**
 * The runtime folder is the only place in presentation that imports `effect`. Components run reads
 * through `useQuery` and state changes through `useCommand`, follow streams through `useStream`
 * (`use-stream.ts`) and take texts from `useMessages`; they never see an Effect value.
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

/**
 * The message catalog of the UI language. It is fixed for one plugin load (Obsidian restarts on a
 * language change), so it is a plain value, not a ref.
 */
export const useMessages = (): Catalog =>
  useRuntime().runSync(Messages.useSync((catalog) => catalog));

/** Routes a defect to `reportDefect`; never rejects (the runtime may already be disposed). */
export const reportVueError = (runtime: AppRuntime, cause: unknown): Promise<void> =>
  runtime.runPromise(reportDefect(cause)).then(
    () => undefined,
    () => undefined,
  );

/** A use case as a component runs it. `run` never rejects. */
export type UseCase<Args extends unknown[], A, E> = {
  run(...args: Args): Promise<void>;
  readonly pending: Readonly<Ref<boolean>>;
  readonly value: Readonly<ShallowRef<A | undefined>>;
  readonly error: Readonly<ShallowRef<E | undefined>>;
  readonly message: Readonly<ShallowRef<UserMessage | undefined>>;
};

type UseCaseFn<Args extends unknown[], A, E> = (...args: Args) => Effect.Effect<A, E, AppServices>;

/** Runs `fn(...args)`; a throw while building the effect and a disposed runtime become defects. */
const exitOf = <Args extends unknown[], A, E>(
  runtime: AppRuntime,
  fn: UseCaseFn<Args, A, E>,
  args: Args,
  options?: { readonly signal: AbortSignal },
): Promise<Exit.Exit<A, E>> =>
  runtime
    .runPromiseExit(
      Effect.suspend(() => fn(...args)),
      options,
    )
    .catch((cause: unknown) => Exit.die(cause));

/**
 * Hands a finished run to `success` or `failure`; reports a defect once; ignores an interruption.
 * Never rejects.
 */
const outcome = async <A, E extends AppError>(
  runtime: AppRuntime,
  exit: Exit.Exit<A, E>,
  success: (value: A) => void,
  failure: (error: E) => Promise<void> | void,
): Promise<void> => {
  if (Exit.isSuccess(exit)) return success(exit.value);
  if (Cause.hasInterruptsOnly(exit.cause)) return undefined;
  const error = Cause.findErrorOption(exit.cause);
  if (Option.isSome(error)) return failure(error.value);
  return reportVueError(runtime, Cause.squash(exit.cause));
};

/** The refs of one use case in a component, and how a run's outcome lands in them. */
const useOutcomeRefs = <Args extends unknown[], A, E extends AppError>() => {
  const runtime = useRuntime();
  const messages = useMessages();
  const pending = shallowRef(false);
  const value = shallowRef<A | undefined>();
  const error = shallowRef<E | undefined>();
  const message = shallowRef<UserMessage | undefined>();
  return {
    runtime,
    messages,
    start: () => {
      pending.value = true;
      error.value = undefined;
      message.value = undefined;
    },
    settle: (exit: Exit.Exit<A, E>): Promise<void> => {
      pending.value = false;
      return outcome(
        runtime,
        exit,
        (next) => {
          value.value = next;
        },
        (failure) => {
          error.value = failure;
          message.value = describeError(failure, messages);
        },
      );
    },
    view: (run: (...args: Args) => Promise<void>): UseCase<Args, A, E> => ({
      run,
      pending: readonly(pending),
      value: readonly(value) as Readonly<ShallowRef<A | undefined>>,
      error: readonly(error) as Readonly<ShallowRef<E | undefined>>,
      message: readonly(message),
    }),
  };
};

/**
 * Runs a use case that only reads. The latest call wins: a second `run` interrupts the first, and
 * the scope ending interrupts a pending run and drops its result. A typed failure lands in `error`
 * and `message`; a defect is reported once and leaves `error` empty.
 */
export const useQuery = <Args extends unknown[], A, E extends AppError>(
  fn: UseCaseFn<Args, A, E>,
): UseCase<Args, A, E> => {
  const refs = useOutcomeRefs<Args, A, E>();
  let alive = true;
  let current: AbortController | undefined;

  onScopeDispose(() => {
    alive = false;
    current?.abort();
  });

  const run = async (...args: Args): Promise<void> => {
    current?.abort();
    const controller = new AbortController();
    current = controller;
    refs.start();
    const exit = await exitOf(refs.runtime, fn, args, { signal: controller.signal });
    if (!alive || current !== controller) return;
    current = undefined;
    await refs.settle(exit);
  };

  return refs.view(run);
};

/**
 * Runs a use case that changes state. Nothing in the component interrupts it: neither a second
 * `run` nor the scope ending. Only disposing the runtime (plugin unload) does.
 *
 * - A `run` while one is pending starts nothing and returns the pending run's promise; its
 *   arguments are ignored. Disable the control on `pending`.
 * - While the scope lives, the outcome lands as in `useQuery`.
 * - After the scope ended, the run still completes and the component's refs stay untouched. A
 *   success is silent, a typed failure becomes a notice through `Notifier`, a defect is reported
 *   once.
 */
export const useCommand = <Args extends unknown[], A, E extends AppError>(
  fn: UseCaseFn<Args, A, E>,
): UseCase<Args, A, E> => {
  const refs = useOutcomeRefs<Args, A, E>();
  const { runtime, messages } = refs;
  let alive = true;
  let inFlight: Promise<void> | undefined;

  onScopeDispose(() => {
    alive = false;
  });

  const notify = (error: E): Promise<void> =>
    runtime
      .runPromise(Notifier.use((notifier) => notifier.notify(describeError(error, messages))))
      .then(
        () => undefined,
        () => undefined,
      );

  const execute = async (args: Args): Promise<void> => {
    const exit = await exitOf(runtime, fn, args);
    await (alive ? refs.settle(exit) : outcome(runtime, exit, () => undefined, notify));
  };

  const run = (...args: Args): Promise<void> => {
    if (inFlight === undefined) {
      refs.start();
      inFlight = execute(args).finally(() => {
        inFlight = undefined;
      });
    }
    return inFlight;
  };

  return refs.view(run);
};
