import { assert, describe, it } from "@effect/vitest";
import { Effect } from "effect";
import { afterEach, vi } from "vitest";
import { Incidents, LogSink } from "../../../src/application/ports";
import { consoleSinkLayer } from "../../../src/infrastructure/logging/console-sink";
import { incidentsLayer } from "../../../src/infrastructure/logging/incidents";

const LEVELS = ["error", "warn", "info", "debug"] as const;

const call = (level: string) => [
  "[weg-manager]",
  `e.${level}`,
  { context: { n: 1 }, incidentId: "AB12CD" },
];

afterEach(() => {
  vi.restoreAllMocks();
});

describe("consoleSinkLayer", () => {
  it.effect("writes error and warn to their console methods and info and debug to debug", () =>
    Effect.gen(function* () {
      const spies = {
        error: vi.spyOn(console, "error").mockImplementation(() => {}),
        warn: vi.spyOn(console, "warn").mockImplementation(() => {}),
        debug: vi.spyOn(console, "debug").mockImplementation(() => {}),
      };
      const sink = yield* LogSink;
      for (const level of LEVELS) {
        sink.write({ level, event: `e.${level}`, context: { n: 1 }, incidentId: "AB12CD" });
      }
      assert.deepStrictEqual(spies.error.mock.calls, [call("error")]);
      assert.deepStrictEqual(spies.warn.mock.calls, [call("warn")]);
      assert.deepStrictEqual(spies.debug.mock.calls, [call("info"), call("debug")]);
    }).pipe(Effect.provide(consoleSinkLayer)),
  );
});

describe("incidentsLayer", () => {
  it.effect("creates short upper-case ids that differ", () =>
    Effect.gen(function* () {
      const incidents = yield* Incidents;
      const ids = new Set<string>();
      for (let index = 0; index < 20; index += 1) {
        const id = yield* incidents.nextId;
        assert.match(id, /^[0-9A-Z]{6}$/);
        ids.add(id);
      }
      assert.isAbove(ids.size, 15);
    }).pipe(Effect.provide(incidentsLayer)),
  );
});
