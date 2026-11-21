import { Cause, Effect } from "effect";
import type { AppRuntime, AppServices } from "../../../application/app-services";
import { reportDefect } from "../../../application/shell";

/**
 * Runs an effect that has no expected failures left. A defect is reported once through
 * `reportDefect`; an interruption (plugin unloading) is silent. Never rejects.
 */
export const runSafely = <A>(
  runtime: AppRuntime,
  effect: Effect.Effect<A, never, AppServices>,
): Promise<A | undefined> =>
  runtime
    .runPromise(
      effect.pipe(
        Effect.catchCause((cause) =>
          Cause.hasInterruptsOnly(cause)
            ? Effect.succeed(undefined)
            : Effect.as(reportDefect(Cause.squash(cause)), undefined),
        ),
      ),
    )
    .catch(() => undefined);
