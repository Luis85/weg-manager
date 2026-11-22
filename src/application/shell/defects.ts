import { Cause, Effect } from "effect";
import { toLoggedError } from "./logged-error";
import { Incidents, Logger, Messages, Notifier } from "./ports";
import { describeDefect } from "./user-messages";

/**
 * The single exit for bugs: logs the cause (name, message, frames) with a fresh incident id and shows the user only that id.
 * Every boundary (bootstrap, commands, Vue error handler, actions, unload) routes defects here.
 */
export const reportDefect = (cause: unknown) =>
  Effect.gen(function* () {
    const incidentId = yield* (yield* Incidents).nextId;
    yield* (yield* Logger).log({
      level: "error",
      event: "defect.reported",
      error: toLoggedError(cause),
      incidentId,
    });
    const message = describeDefect(incidentId, (yield* Messages).shell);
    yield* (yield* Notifier).notify(message);
    return message;
  });

/**
 * The one policy for a cause no caller expected (ADR 0003): an interruption (an unload, a newer
 * query, a closed view) stays silent; anything else is squashed to one value and reported once
 * through `reportDefect`. Every boundary that ends an effect applies it: commands (`runSafely`),
 * the host event adapter, and the presentation runtime (`useQuery`, `useCommand`, `useStream`).
 * `Effect.catchCause(reportUnexpected)` ends a guarded effect with nothing.
 */
export const reportUnexpected = (cause: Cause.Cause<unknown>) =>
  Cause.hasInterruptsOnly(cause) ? Effect.void : Effect.asVoid(reportDefect(Cause.squash(cause)));
