import { Effect } from "effect";
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
    const message = describeDefect(incidentId, yield* Messages);
    yield* (yield* Notifier).notify(message);
    return message;
  });
