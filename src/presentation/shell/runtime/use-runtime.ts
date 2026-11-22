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
import {
  Messages,
  Notifier,
  reportDefect,
  reportUnexpected,
  type UserMessage,
} from "../../../application/shell";
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

const settled = (run: Promise<unknown>): Promise<void> =>
  run.then(
    () => undefined,
    () => undefined,
  );

/** Routes a defect to `reportDefect`; never rejects (the runtime may already be disposed). */
export const reportVueError = (runtime: AppRuntime, cause: unknown): Promise<void> =>
  settled(runtime.runPromise(reportDefect(cause)));

/**
 * Applies the policy for an unexpected cause (`reportUnexpected`: an interruption is silent,
 * anything else is reported once); never rejects (the runtime may already be disposed).
 */
export const reportCause = (runtime: AppRuntime, cause: Cause.Cause<unknown>): Promise<void> =>
  settled(runtime.runPromise(reportUnexpected(cause)));

/**
 * How one run of a use case ended, as `run` resolves it. The refs hold the same for templates;
 * code that goes on after `await run(...)` reads this, not the refs.
 *
 * - `success` with the use case's value;
 * - `failure` with the typed error and its text in the UI language;
 * - `defect`: a bug, reported once through `reportDefect`, or a runtime that is gone;
 * - `interrupted`: the run was cancelled (a newer query, the scope ending, the plugin unloading)
 *   and its result dropped.
 */
export type RunOutcome<A, E> =
  | { readonly _tag: "success"; readonly value: A }
  | { readonly _tag: "failure"; readonly error: E; readonly message: UserMessage }
  | { readonly _tag: "defect" }
  | { readonly _tag: "interrupted" };

const DEFECT = { _tag: "defect" } as const;
const INTERRUPTED = { _tag: "interrupted" } as const;

/** A use case as a component runs it. `run` never rejects; it resolves to the run's outcome. */
export type UseCase<Args extends unknown[], A, E> = {
  run(...args: Args): Promise<RunOutcome<A, E>>;
  readonly pending: Readonly<Ref<boolean>>;
  readonly value: Readonly<ShallowRef<A | undefined>>;
  readonly error: Readonly<ShallowRef<E | undefined>>;
  readonly message: Readonly<ShallowRef<UserMessage | undefined>>;
};

/** A use case as components hand it to `useCommand` and `useQuery`: arguments in, an effect out. */
export type UseCaseFn<Args extends unknown[], A, E> = (
  ...args: Args
) => Effect.Effect<A, E, AppServices>;

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

/** The outcome of a finished run; reports a defect once, an interruption not. Never rejects. */
const outcomeOf = async <A, E extends AppError>(
  runtime: AppRuntime,
  messages: Catalog,
  exit: Exit.Exit<A, E>,
): Promise<RunOutcome<A, E>> => {
  if (Exit.isSuccess(exit)) return { _tag: "success", value: exit.value };
  const error = Cause.findErrorOption(exit.cause);
  if (Option.isSome(error)) {
    return { _tag: "failure", error: error.value, message: describeError(error.value, messages) };
  }
  await reportCause(runtime, exit.cause);
  // The policy above decided what to report; this only names what it decided.
  return Cause.hasInterruptsOnly(exit.cause) ? INTERRUPTED : DEFECT;
};

/**
 * The refs of one use case in a component. A run clears `value`, `error` and `message` when it
 * starts, so they only ever hold the outcome of the latest run.
 */
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
      value.value = undefined;
      error.value = undefined;
      message.value = undefined;
    },
    settle: (outcome: RunOutcome<A, E>): RunOutcome<A, E> => {
      pending.value = false;
      if (outcome._tag === "success") value.value = outcome.value;
      if (outcome._tag === "failure") {
        error.value = outcome.error;
        message.value = outcome.message;
      }
      return outcome;
    },
    view: (run: (...args: Args) => Promise<RunOutcome<A, E>>): UseCase<Args, A, E> => ({
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
 * the scope ending interrupts a pending run and drops its result; that run resolves
 * `interrupted`. A typed failure lands in `error` and `message`; a defect is reported once and
 * leaves `error` empty.
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

  const run = async (...args: Args): Promise<RunOutcome<A, E>> => {
    current?.abort();
    const controller = new AbortController();
    current = controller;
    refs.start();
    const exit = await exitOf(refs.runtime, fn, args, { signal: controller.signal });
    if (!alive || current !== controller) return INTERRUPTED;
    current = undefined;
    return refs.settle(await outcomeOf(refs.runtime, refs.messages, exit));
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
 *   once. `run` resolves to the outcome either way.
 */
export const useCommand = <Args extends unknown[], A, E extends AppError>(
  fn: UseCaseFn<Args, A, E>,
): UseCase<Args, A, E> => {
  const refs = useOutcomeRefs<Args, A, E>();
  const { runtime, messages } = refs;
  let alive = true;
  let inFlight: Promise<RunOutcome<A, E>> | undefined;

  onScopeDispose(() => {
    alive = false;
  });

  const notify = (message: UserMessage): Promise<void> =>
    runtime.runPromise(Notifier.use((notifier) => notifier.notify(message))).then(
      () => undefined,
      () => undefined,
    );

  const execute = async (args: Args): Promise<RunOutcome<A, E>> => {
    const outcome = await outcomeOf(runtime, messages, await exitOf(runtime, fn, args));
    if (alive) return refs.settle(outcome);
    if (outcome._tag === "failure") await notify(outcome.message);
    return outcome;
  };

  const run = (...args: Args): Promise<RunOutcome<A, E>> => {
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
