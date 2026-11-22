import { Effect, Layer } from "effect";
import { Today, makeToday } from "../../../application/shell";
import type { CalendarDay } from "../../../domain/shell";

/**
 * `Today` in memory, for tests and the harness: the day it starts with, until `set` makes another
 * the day; every service built from the layer reads it and publishes the change at once, as the
 * plugin's adapter does at local midnight. No timer.
 */
export const memoryToday = (initial: CalendarDay) => {
  let day = initial;
  const checks = new Set<Effect.Effect<CalendarDay>>();
  const layer = Layer.effect(
    Today,
    Effect.gen(function* () {
      const { today, check } = yield* makeToday(Effect.sync(() => day));
      yield* Effect.acquireRelease(
        Effect.sync(() => checks.add(check)),
        () => Effect.sync(() => checks.delete(check)),
      );
      return today;
    }),
  );
  return {
    layer,
    /** From now on it is `next`; each service built from the layer publishes it. */
    set: (next: CalendarDay): void => {
      day = next;
      for (const check of checks) Effect.runSync(check);
    },
  };
};
