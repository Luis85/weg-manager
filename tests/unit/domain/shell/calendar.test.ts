import { assert, date, property } from "fast-check";
import { describe, expect, it } from "vitest";
import { localDay, untilNextLocalMidnight } from "../../../../src/domain/shell";
import { inTimeZone, testsInTimeZone } from "../../../support/shell/time-zone";

const HOUR = 3_600_000;

describe("localDay", () => {
  it("is the day of the machine's time zone, not of UTC", () => {
    const time = new Date("2026-11-22T23:30:00Z");
    expect(localDay(time)).toBe("2026-11-22");
    inTimeZone("Europe/Berlin", () => expect(localDay(time)).toBe("2026-11-23"));
    inTimeZone("America/Los_Angeles", () => {
      expect(localDay(new Date("2026-11-23T07:30:00Z"))).toBe("2026-11-22");
    });
  });

  it("writes YYYY-MM-DD, with leading zeros", () => {
    expect(localDay(new Date("2026-01-05T00:00:00Z"))).toBe("2026-01-05");
    expect(localDay(new Date("2026-12-31T23:59:59.999Z"))).toBe("2026-12-31");
    const early = new Date("2026-01-05T12:00:00Z");
    early.setFullYear(999);
    expect(localDay(early)).toBe("0999-01-05");
  });
});

describe("untilNextLocalMidnight", () => {
  it("counts the milliseconds to the next local midnight", () => {
    expect(untilNextLocalMidnight(new Date("2026-11-22T12:00:00Z"))).toBe(12 * HOUR);
    expect(untilNextLocalMidnight(new Date("2026-11-22T23:59:59.999Z"))).toBe(1);
    expect(untilNextLocalMidnight(new Date("2026-11-22T00:00:00Z"))).toBe(24 * HOUR);
  });

  it("follows the local time zone and its daylight saving days", () => {
    inTimeZone("Europe/Berlin", () => {
      expect(untilNextLocalMidnight(new Date("2026-11-22T12:00:00Z"))).toBe(11 * HOUR);
      // 29.03.2026 has 23 hours, 25.10.2026 has 25.
      expect(untilNextLocalMidnight(new Date(2026, 2, 29))).toBe(23 * HOUR);
      expect(untilNextLocalMidnight(new Date(2026, 9, 25))).toBe(25 * HOUR);
    });
  });
});

describe("calendar properties", () => {
  const times = date({
    min: new Date("1970-01-02T00:00:00Z"),
    max: new Date("2100-01-01T00:00:00Z"),
    noInvalidDate: true,
  });

  describe.each(["UTC", "Europe/Berlin", "America/Sao_Paulo", "Australia/Lord_Howe"])(
    "in %s",
    (zone) => {
      testsInTimeZone(zone);

      it("moves from any time to the start of the next local day", () => {
        assert(
          property(times, (time) => {
            const wait = untilNextLocalMidnight(time);
            const next = new Date(time.getTime() + wait);
            expect(wait).toBeGreaterThan(0);
            expect(localDay(new Date(next.getTime() - 1))).toBe(localDay(time));
            expect(localDay(next) > localDay(time)).toBe(true);
          }),
        );
      });
    },
  );
});
