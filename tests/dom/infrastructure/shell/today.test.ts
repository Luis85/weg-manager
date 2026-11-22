import { assert, describe, it } from "@effect/vitest";
import { Context, Effect, Exit, Layer, Scope, Stream } from "effect";
import { afterEach, vi } from "vitest";
import { Today } from "../../../../src/application/shell";
import { START, todayContract } from "../../../support/shell/contract-today";
import { manualClock } from "../../../support/shell/manual-clock";
import {
  recordingLogger,
  recordingNotifier,
  sequentialIncidents,
  testMessages,
} from "../../../support/layers";
import { asObsidianPlugin } from "../../../support/obsidian/real";

vi.mock("obsidian", () => import("@test/obsidian"));

const { createTestPlugin, Plugin } = await import("@test/obsidian");
const { DAY_CHECK_MAX_MS, todayLayer } =
  await import("../../../../src/infrastructure/obsidian/shell/today");

class Bare extends Plugin {}

const SECOND = 1_000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;

/** Noon UTC of a `YYYY-MM-DD` day. */
const noonOf = (day: string) => new Date(`${day}T12:00:00Z`);

/** The day of `time` in the process's default zone, as `Intl` reads it without a zone. */
const defaultDay = (time: Date) => time.toLocaleDateString("en-CA");

/**
 * The adapter without a clock handed in (`windowClock`, the plugin's), on a machine whose zone is
 * `zone` and whose clock shows `at`; the test's `afterEach` puts both back.
 */
const onMachine = (zone: string, at: string) => {
  process.env["TZ"] = zone;
  vi.useFakeTimers({ now: new Date(at), toFake: ["Date"] });
  const { plugin } = createTestPlugin(Bare);
  plugin.load();
  return todayLayer(asObsidianPlugin(plugin));
};

/** The adapter on a loaded plugin double, over a clock and a zone the test moves. */
const setup = (start: Date, zone = "UTC") => {
  const { plugin } = createTestPlugin(Bare);
  plugin.load();
  const time = manualClock(start, zone);
  return { plugin, time, layer: todayLayer(asObsidianPlugin(plugin), time.clock) };
};

const reporting = Layer.mergeAll(
  recordingLogger().layer,
  recordingNotifier().layer,
  sequentialIncidents(),
  testMessages,
);

todayContract("Obsidian", () => {
  const { time, layer } = setup(noonOf(START));
  return {
    layer,
    moveTo: (day) => time.setClock(noonOf(day)),
    pass: () => time.advance(DAY_CHECK_MAX_MS),
  };
});

const settle = Effect.forEach(Array.from({ length: 10 }), () => Effect.yieldNow, {
  discard: true,
});

/** Builds the adapter in a scope of its own; `days` is what its changes emitted so far. */
const started = (layer: ReturnType<typeof setup>["layer"]) =>
  Effect.gen(function* () {
    const scope = yield* Scope.make();
    const today = Context.get(
      yield* Layer.buildWithScope(layer.pipe(Layer.provide(reporting)), scope),
      Today,
    );
    const days: string[] = [];
    yield* Effect.forkIn(
      Stream.runForEach(today.changes, (day) => Effect.sync(() => days.push(day))),
      scope,
    );
    yield* settle;
    return { today, days, scope };
  });

/** Moves the clock by `ms`, awake, and lets the published days arrive. */
const advance = (time: ReturnType<typeof manualClock>, ms: number) =>
  Effect.andThen(
    Effect.sync(() => time.advance(ms)),
    settle,
  );

describe("Today in Obsidian", () => {
  it.effect("looks at the clock at the next local midnight, and at least once a minute", () => {
    const { time, layer } = setup(new Date("2026-11-22T23:59:30Z"));
    return Effect.gen(function* () {
      yield* started(layer);
      assert.deepStrictEqual(time.pending(), [30 * SECOND]);
      yield* advance(time, 30 * SECOND);
      assert.deepStrictEqual(time.pending(), [DAY_CHECK_MAX_MS]);
    });
  });

  it.effect("publishes the new day at local midnight, each day once", () => {
    const { time, layer } = setup(new Date("2026-11-22T23:59:30Z"));
    return Effect.gen(function* () {
      const { today, days } = yield* started(layer);
      yield* advance(time, 29 * SECOND);
      assert.deepStrictEqual(days, ["2026-11-22"]);
      yield* advance(time, SECOND);
      assert.deepStrictEqual(days, ["2026-11-22", "2026-11-23"]);
      yield* advance(time, 48 * HOUR);
      assert.deepStrictEqual(days, ["2026-11-22", "2026-11-23", "2026-11-24", "2026-11-25"]);
      assert.strictEqual(yield* today.current, "2026-11-25");
    });
  });

  it.effect(
    "is right after the system clock is changed, at once on a read, else within a minute",
    () => {
      const { time, layer } = setup(noonOf("2026-11-22"));
      return Effect.gen(function* () {
        const { today, days } = yield* started(layer);
        time.setClock(noonOf("2026-12-24"));
        assert.strictEqual(yield* today.current, "2026-12-24");
        time.setClock(noonOf("2026-11-20"));
        yield* advance(time, MINUTE);
        assert.deepStrictEqual(days, ["2026-11-22", "2026-12-24", "2026-11-20"]);
      });
    },
  );

  it.effect("publishes the day after a sleep across midnight, though the timer slept too", () => {
    const { time, layer } = setup(new Date("2026-11-22T23:00:00Z"));
    return Effect.gen(function* () {
      const { today, days } = yield* started(layer);
      time.sleep(9 * HOUR);
      yield* advance(time, DAY_CHECK_MAX_MS);
      assert.deepStrictEqual(days, ["2026-11-22", "2026-11-23"]);
      assert.strictEqual(yield* today.current, "2026-11-23");
    });
  });

  it.effect("uses the machine's time zone, also one changed while it runs", () => {
    // 23:30 UTC is 00:30 of the next day in Berlin.
    const { time, layer } = setup(new Date("2026-11-22T23:30:00Z"), "Europe/Berlin");
    return Effect.gen(function* () {
      const { today, days } = yield* started(layer);
      assert.strictEqual(yield* today.current, "2026-11-23");
      time.setZone("America/Los_Angeles");
      yield* advance(time, MINUTE);
      assert.deepStrictEqual(days, ["2026-11-23", "2026-11-22"]);
    });
  });

  it.effect("changes the day at local midnight on a daylight saving day (Berlin)", () => {
    // 28.03.2026 23:59:30 in Berlin, an hour ahead of UTC; 29.03. has 23 hours.
    const { time, layer } = setup(new Date("2026-03-28T22:59:30Z"), "Europe/Berlin");
    return Effect.gen(function* () {
      const { days } = yield* started(layer);
      yield* advance(time, 30 * SECOND);
      yield* advance(time, 23 * HOUR - MINUTE);
      assert.deepStrictEqual(days, ["2026-03-28", "2026-03-29"]);
      yield* advance(time, MINUTE);
      assert.deepStrictEqual(days, ["2026-03-28", "2026-03-29", "2026-03-30"]);
    });
  });

  describe("a time zone the platform rejects", () => {
    // `Intl` refuses `Etc/Unknown` (Node 24); `resolvedOptions().timeZone` could still name it.
    const REJECTED = "Etc/Unknown";

    it.effect("falls back to the system's default zone, so the plugin still loads", () => {
      const { time, layer } = setup(noonOf("2026-11-22"), REJECTED);
      return Effect.gen(function* () {
        const { today } = yield* started(layer);
        assert.strictEqual(yield* today.current, defaultDay(noonOf("2026-11-22")));
        assert.strictEqual(time.pending().length, 1);
      });
    });

    it.effect("falls back as well when reading the zone throws", () => {
      const { time, layer } = setup(noonOf("2026-11-22"));
      time.clock.zone = () => {
        throw new RangeError("no zone");
      };
      return Effect.gen(function* () {
        const { today } = yield* started(layer);
        assert.strictEqual(yield* today.current, defaultDay(noonOf("2026-11-22")));
      });
    });

    it.effect("keeps looking at the clock when the zone turns bad while it runs", () => {
      const { time, layer } = setup(noonOf("2026-11-22"), "Europe/Berlin");
      return Effect.gen(function* () {
        const { days } = yield* started(layer);
        time.setZone(REJECTED);
        yield* advance(time, MINUTE);
        assert.strictEqual(time.pending().length, 1);
        time.setZone("Europe/Berlin");
        time.setClock(noonOf("2026-11-24"));
        yield* advance(time, MINUTE);
        assert.deepStrictEqual(days.at(-1), "2026-11-24");
      });
    });
  });

  it.effect("keeps its timer when a look at the clock throws, and reports the defect", () => {
    const { time, layer } = setup(noonOf("2026-11-22"));
    const logger = recordingLogger();
    const withLogger = layer.pipe(Layer.provide(logger.layer));
    return Effect.gen(function* () {
      const { days } = yield* started(withLogger);
      // An invalid date: every step of the look at the clock throws (`Invalid time value`).
      time.setClock(new Date(Number.NaN));
      yield* advance(time, MINUTE);
      assert.strictEqual(time.pending().length, 1);
      assert.isTrue(logger.entries().some((entry) => entry.level === "error"));
      time.setClock(noonOf("2026-11-23"));
      yield* advance(time, DAY_CHECK_MAX_MS);
      assert.deepStrictEqual(days, ["2026-11-22", "2026-11-23"]);
    });
  });

  describe("the machine's own clock and zone", () => {
    // No clock handed in: `windowClock`, the one the plugin runs on. The process's zone is set
    // to one far from UTC, so a UTC day in place of the local one fails here.
    afterEach(() => {
      vi.useRealTimers();
      process.env["TZ"] = "UTC";
    });

    it.effect("is the local day east of UTC (Kiritimati, UTC+14)", () =>
      Effect.gen(function* () {
        const { today, scope } = yield* started(
          onMachine("Pacific/Kiritimati", "2026-11-22T12:00:00Z"),
        );
        assert.strictEqual(yield* today.current, "2026-11-23");
        yield* Scope.close(scope, Exit.void);
      }),
    );

    it.effect("is the local day west of UTC (Los Angeles)", () =>
      Effect.gen(function* () {
        const { today, scope } = yield* started(
          onMachine("America/Los_Angeles", "2026-11-22T03:00:00Z"),
        );
        assert.strictEqual(yield* today.current, "2026-11-21");
        yield* Scope.close(scope, Exit.void);
      }),
    );
  });

  describe("unload", () => {
    it.effect("clears the timer synchronously when Obsidian unloads the plugin", () => {
      const { plugin, time, layer } = setup(noonOf("2026-11-22"));
      return Effect.gen(function* () {
        const { days, scope } = yield* started(layer);
        assert.strictEqual(time.pending().length, 1);
        plugin.unload();
        assert.deepStrictEqual(time.pending(), []);
        time.setClock(noonOf("2026-11-23"));
        yield* advance(time, 2 * DAY_CHECK_MAX_MS);
        assert.deepStrictEqual(days, ["2026-11-22"]);
        yield* Scope.close(scope, Exit.void);
        assert.deepStrictEqual(time.pending(), []);
      });
    });

    it.effect("clears the timer when the runtime's scope closes, without an unload", () => {
      const { time, layer } = setup(noonOf("2026-11-22"));
      return Effect.gen(function* () {
        const { scope } = yield* started(layer);
        yield* Scope.close(scope, Exit.void);
        assert.deepStrictEqual(time.pending(), []);
        yield* advance(time, 2 * DAY_CHECK_MAX_MS);
        assert.deepStrictEqual(time.pending(), []);
      });
    });
  });
});
