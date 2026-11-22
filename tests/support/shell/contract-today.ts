import { assert, describe, it } from "@effect/vitest";
import { Effect, Layer, Stream } from "effect";
import { Today } from "../../../src/application/shell";
import type { CalendarDay } from "../../../src/domain/shell";
import { recordingLogger, recordingNotifier, sequentialIncidents, testMessages } from "../layers";

/** What the contract needs of one `Today` adapter, started on `START`. */
export type TodayDriver = {
  readonly layer: Layer.Layer<Today, never, Layer.Success<typeof reporting>>;
  /** From now on the machine says it is `day`; the adapter is not told. */
  readonly moveTo: (day: CalendarDay) => void;
  /** Gives the adapter the chance to notice by itself, as its timer does. */
  readonly pass: () => void;
};

export const START = "2026-11-22";

const reporting = Layer.mergeAll(
  recordingLogger().layer,
  recordingNotifier().layer,
  sequentialIncidents(),
  testMessages,
);

const settle = Effect.forEach(Array.from({ length: 10 }), () => Effect.yieldNow, {
  discard: true,
});

/** Runs `body` with the adapter's service and the days its `changes` emitted so far. */
const withToday = (
  driver: TodayDriver,
  body: (today: Today["Service"], seen: readonly CalendarDay[]) => Effect.Effect<void>,
) =>
  Effect.gen(function* () {
    const today = yield* Today;
    const seen: CalendarDay[] = [];
    yield* Effect.forkChild(
      Stream.runForEach(today.changes, (day) => Effect.sync(() => seen.push(day))),
    );
    yield* settle;
    yield* body(today, seen);
  }).pipe(Effect.provide(driver.layer.pipe(Layer.provide(reporting))));

/**
 * The behaviour every `Today` adapter shares (`docs/engineering/architecture.md`, Today): the day
 * now, the day first in `changes`, a new day on the next read and by the adapter itself, each new
 * day once, a day back too.
 */
export const todayContract = (name: string, make: () => TodayDriver) =>
  describe(`Today contract: ${name}`, () => {
    it.effect("gives the day it starts on, first in its changes", () => {
      const driver = make();
      return withToday(driver, (today, seen) =>
        Effect.gen(function* () {
          assert.strictEqual(yield* today.current, START);
          assert.deepStrictEqual(seen, [START]);
        }),
      );
    });

    it.effect("reads a new day on the next read and publishes it once", () => {
      const driver = make();
      return withToday(driver, (today, seen) =>
        Effect.gen(function* () {
          driver.moveTo("2026-11-23");
          assert.strictEqual(yield* today.current, "2026-11-23");
          assert.strictEqual(yield* today.current, "2026-11-23");
          driver.pass();
          yield* settle;
          assert.deepStrictEqual(seen, [START, "2026-11-23"]);
        }),
      );
    });

    it.effect("publishes a new day by itself, without a read", () => {
      const driver = make();
      return withToday(driver, (_, seen) =>
        Effect.gen(function* () {
          driver.moveTo("2026-11-23");
          driver.pass();
          yield* settle;
          assert.deepStrictEqual(seen, [START, "2026-11-23"]);
        }),
      );
    });

    it.effect("publishes a day back too, and nothing while the day stays", () => {
      const driver = make();
      return withToday(driver, (today, seen) =>
        Effect.gen(function* () {
          driver.moveTo("2026-11-21");
          driver.pass();
          driver.moveTo("2026-11-21");
          driver.pass();
          yield* today.current;
          yield* settle;
          assert.deepStrictEqual(seen, [START, "2026-11-21"]);
        }),
      );
    });
  });
