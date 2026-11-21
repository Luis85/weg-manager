import { Effect } from "effect";
import { Incidents, Logger, Messages, Notifier } from "./ports";
import { describeDefect } from "./user-messages";

const describeCause = (cause: unknown): string => {
  if (cause instanceof Error)
    return `${cause.name}: ${cause.message}${cause.stack ? `\n${cause.stack}` : ""}`;
  return String(cause);
};

/**
 * The single exit for bugs: logs the cause with a fresh incident id and shows the user only that id.
 * Every boundary (bootstrap, commands, Vue error handler, actions, unload) routes defects here.
 */
export const reportDefect = (cause: unknown) =>
  Effect.gen(function* () {
    const incidentId = yield* (yield* Incidents).nextId;
    yield* (yield* Logger).log({
      level: "error",
      event: "defect.reported",
      context: { cause: describeCause(cause) },
      incidentId,
    });
    const message = describeDefect(incidentId, yield* Messages);
    yield* (yield* Notifier).notify(message);
    return message;
  });
