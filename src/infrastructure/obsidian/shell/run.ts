import { Effect } from "effect";
import type { AppRuntime, AppServices } from "../../../application/app-services";
import { reportUnexpected } from "../../../application/shell";

/**
 * Runs an effect that has no expected failures left. A defect is reported once and an
 * interruption (plugin unloading) is silent (`reportUnexpected`); either resolves `undefined`.
 * Never rejects.
 */
export const runSafely = <A>(
  runtime: AppRuntime,
  effect: Effect.Effect<A, never, AppServices>,
): Promise<A | undefined> =>
  runtime
    .runPromise(
      effect.pipe(Effect.catchCause((cause) => Effect.as(reportUnexpected(cause), undefined))),
    )
    .catch(() => undefined);
