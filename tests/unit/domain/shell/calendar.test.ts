import { assert, date, property } from "fast-check";
import { describe, expect, it } from "vitest";
import { localDay, untilNextLocalMidnight } from "../../../../src/domain/shell";

const HOUR = 3_600_000;

describe("localDay", () => {
  it("is the day of the given time zone, not of UTC", () => {
    const time = new Date("2026-11-22T23:30:00Z");
    expect(localDay(time, "UTC")).toBe("2026-11-22");
    expect(localDay(time, "Europe/Berlin")).toBe("2026-11-23");
    expect(localDay(new Date("2026-11-23T07:30:00Z"), "America/Los_Angeles")).toBe("2026-11-22");
  });

  it("is the day of the platform's default zone without one (UTC in the tests)", () => {
    const time = new Date("2026-11-22T23:30:00Z");
    expect(localDay(time, undefined)).toBe("2026-11-22");
    expect(untilNextLocalMidnight(new Date("2026-11-22T12:00:00Z"), undefined)).toBe(12 * HOUR);
  });

  it("writes YYYY-MM-DD, with leading zeros", () => {
    expect(localDay(new Date("2026-01-05T00:00:00Z"), "UTC")).toBe("2026-01-05");
    expect(localDay(new Date("2026-12-31T23:59:59.999Z"), "UTC")).toBe("2026-12-31");
    expect(localDay(new Date("0999-01-05T12:00:00Z"), "UTC")).toBe("0999-01-05");
  });
});

describe("untilNextLocalMidnight", () => {
  it("counts the milliseconds to the next midnight of the time zone", () => {
    expect(untilNextLocalMidnight(new Date("2026-11-22T12:00:00Z"), "UTC")).toBe(12 * HOUR);
    expect(untilNextLocalMidnight(new Date("2026-11-22T23:59:59.999Z"), "UTC")).toBe(1);
    expect(untilNextLocalMidnight(new Date("2026-11-22T00:00:00Z"), "UTC")).toBe(24 * HOUR);
    expect(untilNextLocalMidnight(new Date("2026-11-22T12:00:00Z"), "Europe/Berlin")).toBe(
      11 * HOUR,
    );
  });

  it("follows daylight saving days and a change that skips midnight", () => {
    // In Berlin 29.03.2026 has 23 hours and 25.10.2026 has 25.
    expect(untilNextLocalMidnight(new Date("2026-03-28T23:00:00Z"), "Europe/Berlin")).toBe(
      23 * HOUR,
    );
    expect(untilNextLocalMidnight(new Date("2026-10-24T22:00:00Z"), "Europe/Berlin")).toBe(
      25 * HOUR,
    );
    // São Paulo skipped 04.11.2018 00:00: that day began at 01:00, 03:00 UTC.
    expect(untilNextLocalMidnight(new Date("2018-11-03T12:00:00Z"), "America/Sao_Paulo")).toBe(
      15 * HOUR,
    );
  });
});

describe("calendar properties", () => {
  const times = date({
    min: new Date("1970-01-02T00:00:00Z"),
    max: new Date("2100-01-01T00:00:00Z"),
    noInvalidDate: true,
  });

  it.each(["UTC", "Europe/Berlin", "America/Sao_Paulo", "Australia/Lord_Howe", "Pacific/Apia"])(
    "moves from any time to the first instant of a later day in %s",
    (zone) => {
      assert(
        property(times, (time) => {
          const wait = untilNextLocalMidnight(time, zone);
          const next = new Date(time.getTime() + wait);
          expect(wait).toBeGreaterThan(0);
          expect(localDay(new Date(next.getTime() - 1), zone)).toBe(localDay(time, zone));
          expect(localDay(next, zone) > localDay(time, zone)).toBe(true);
        }),
        { numRuns: 50 },
      );
    },
  );
});
