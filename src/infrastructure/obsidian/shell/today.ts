import { Effect, Exit, Layer } from "effect";
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
import { localDay, untilNextLocalMidnight, type TimeZone } from "../../../domain/shell";

/**
 * The zone "today" is counted in (PBI-09 criterion 3, owner decision 26.11.2026): Europe/Berlin,
 * wherever the machine is, so a due date without a time is overdue from the next day there.
 */
const BUSINESS_TIME_ZONE = "Europe/Berlin";

/**
 * The clock the adapter reads, the time zone it counts days in (an IANA name) and the timers it
 * sets; the window's, unless a test hands in one.
 */
export type DayClock = {
  now(): Date;
  zone(): string;
  setTimeout(run: () => void, ms: number): number;
  clearTimeout(id: number): void;
};

const windowClock: DayClock = {
  now: () => new Date(),
  zone: () => BUSINESS_TIME_ZONE,
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
 * The clock's zone when the platform accepts it, else `undefined`: the system's default zone. A
 * zone `Intl` rejects (`Etc/Unknown`), or a zone that cannot be read, would otherwise fail the
 * first look at the clock, and with it the runtime's Layer and the plugin load.
 */
const usableZone = (clock: DayClock): TimeZone => {
  try {
    const zone = clock.zone();
    new Intl.DateTimeFormat("en-US", { timeZone: zone }).format(0);
    return zone;
  } catch {
    return undefined;
  }
};

/**
 * `Today` over the machine's clock, the day in `BUSINESS_TIME_ZONE` (`localDay`). One timer at a time, set
 * to the next local midnight but never further than `DAY_CHECK_MAX_MS`; each time it fires the
 * adapter reads the clock, publishes a new day and sets the next. The timer is cleared by
 * `plugin.register`, synchronously in Obsidian's `unload()`, and when the runtime's scope closes, so
 * a bootstrap that fails or is aborted leaves none behind. A defect goes to `reportDefect`, also
 * one while the next look is planned: the timer is then set for `DAY_CHECK_MAX_MS`, so it never
 * stops. A zone the platform rejects counts as the system's default zone (`usableZone`).
 */
export const todayLayer = (plugin: Plugin, clock: DayClock = windowClock) =>
  Layer.effect(
    Today,
    Effect.gen(function* () {
      const context = yield* Effect.context<Incidents | Logger | Messages | Notifier>();
      const { today, check } = yield* makeToday(
        Effect.sync(() => localDay(clock.now(), usableZone(clock))),
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
      /** How long until the next look: the next local midnight, at most `DAY_CHECK_MAX_MS`. */
      const nextWait = Effect.sync(() =>
        Math.min(untilNextLocalMidnight(clock.now(), usableZone(clock)), DAY_CHECK_MAX_MS),
      ).pipe(Effect.catchCause((cause) => Effect.as(reportUnexpected(cause), DAY_CHECK_MAX_MS)));
      const schedule = (): void => {
        const wait = Effect.runSyncExitWith(context)(nextWait);
        timer = clock.setTimeout(tick, Exit.isSuccess(wait) ? wait.value : DAY_CHECK_MAX_MS);
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
