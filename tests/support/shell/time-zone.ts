import { afterEach, beforeEach } from "vitest";

/** Sets the IANA time zone `zone`; the returned function brings back the one before. */
const switchTo = (zone: string): (() => void) => {
  const previous = process.env["TZ"];
  process.env["TZ"] = zone;
  return () => {
    if (previous === undefined) delete process.env["TZ"];
    else process.env["TZ"] = previous;
  };
};

/**
 * Runs `run` in the IANA time zone `zone`, as the user's machine would be set, and brings back the
 * zone before: Node reads `process.env.TZ` again on each assignment. The test config starts every
 * run in UTC.
 */
export const inTimeZone = (zone: string, run: () => void): void => {
  const restore = switchTo(zone);
  try {
    run();
  } finally {
    restore();
  }
};

/** Runs every test of the surrounding `describe` in `zone`. */
export const testsInTimeZone = (zone: string): void => {
  let restore: (() => void) | undefined;
  beforeEach(() => {
    restore = switchTo(zone);
  });
  afterEach(() => restore?.());
};
