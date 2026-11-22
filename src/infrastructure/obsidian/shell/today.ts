import { Effect, Layer } from "effect";
import type { Plugin } from "obsidian";
import {
  Today,
  makeToday,
  reportUnexpected,
  type Incidents,
  type Logger,
  type Messages,
  type Notifier,
} from "../../../application/shell";
import { localDay, untilNextLocalMidnight } from "../../../domain/shell";

/**
 * The clock the adapter reads, the machine's time zone (an IANA name) and the timers it sets; the
 * window's, unless a test hands in one.
 */
export type DayClock = {
  now(): Date;
  zone(): string;
  setTimeout(run: () => void, ms: number): number;
  clearTimeout(id: number): void;
};

const windowClock: DayClock = {
  now: () => new Date(),
  // Read on each look, so a zone the user changes while Obsidian runs counts once the platform has it.
  zone: () => Intl.DateTimeFormat().resolvedOptions().timeZone,
  setTimeout: (run, ms) => window.setTimeout(run, ms),
  clearTimeout: (id) => window.clearTimeout(id),
};

/**
 * The longest the adapter waits between two looks at the clock. A timer counts the time the machine
 * is awake, not the clock: after a change of the system clock, or a sleep across midnight, the new
 * day is published within this long, and a read of `current` is right at once.
 */
export const DAY_CHECK_MAX_MS = 60_000;

/**
 * `Today` over the machine's clock, in its time zone (`localDay`). One timer at a time, set
 * to the next local midnight but never further than `DAY_CHECK_MAX_MS`; each time it fires the
 * adapter reads the clock, publishes a new day and sets the next. The timer is cleared by
 * `plugin.register`, synchronously in Obsidian's `unload()`, and when the runtime's scope closes, so
 * a bootstrap that fails or is aborted leaves none behind. A defect goes to `reportDefect`.
 */
export const todayLayer = (plugin: Plugin, clock: DayClock = windowClock) =>
  Layer.effect(
    Today,
    Effect.gen(function* () {
      const context = yield* Effect.context<Incidents | Logger | Messages | Notifier>();
      const { today, check } = yield* makeToday(
        Effect.sync(() => localDay(clock.now(), clock.zone())),
      );
      let timer: number | undefined;
      let active = true;

      const stop = (): void => {
        active = false;
        if (timer !== undefined) clock.clearTimeout(timer);
        timer = undefined;
      };
      const tick = (): void => {
        timer = undefined;
        if (!active) return;
        // The exit is dropped: it is a failure only if the defect path itself failed.
        Effect.runSyncExitWith(context)(Effect.catchCause(check, reportUnexpected));
        schedule();
      };
      const schedule = (): void => {
        const wait = Math.min(untilNextLocalMidnight(clock.now(), clock.zone()), DAY_CHECK_MAX_MS);
        timer = clock.setTimeout(tick, wait);
      };

      yield* Effect.acquireRelease(
        Effect.sync(() => {
          plugin.register(stop);
          schedule();
        }),
        () => Effect.sync(stop),
      );
      return today;
    }),
  );
