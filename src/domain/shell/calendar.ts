/**
 * A calendar day as `YYYY-MM-DD`, the form a `date` field holds: two days compare as text in the
 * order of time, so "overdue" is `due < today` (glossary: today).
 */
export type CalendarDay = string;

/** Longer than any day in any time zone (25 hours across a daylight saving change, at most). */
const LONGER_THAN_A_DAY_MS = 27 * 3_600_000;

/** An IANA time zone, or `undefined` for the platform's default zone. */
export type TimeZone = string | undefined;

const dayFormat = (zone: TimeZone) =>
  new Intl.DateTimeFormat("en-US", {
    ...(zone === undefined ? {} : { timeZone: zone }),
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

const dayIn = (format: Intl.DateTimeFormat, time: number): CalendarDay => {
  // The format asks for these three parts, so every result has them.
  const { year, month, day } = Object.fromEntries(
    format.formatToParts(time).map(({ type, value }) => [type, value]),
  ) as Record<"year" | "month" | "day", string>;
  return `${year.padStart(4, "0")}-${month}-${day}`;
};

/**
 * The calendar day of `time` in the IANA time zone `zone` (`undefined`: the platform's default);
 * with the machine's own zone, the user's local day, not UTC's.
 */
export const localDay = (time: Date, zone: TimeZone): CalendarDay =>
  dayIn(dayFormat(zone), time.getTime());

/**
 * The milliseconds from `time` to the first instant of a later day in `zone`: 24 hours from a
 * midnight, 23 or 25 across a daylight saving change, and to 01:00 where a change skips midnight
 * itself. Found by halving, so it holds for every zone the platform knows.
 */
export const untilNextLocalMidnight = (time: Date, zone: TimeZone): number => {
  const format = dayFormat(zone);
  const start = time.getTime();
  const today = dayIn(format, start);
  // `low` is still today, `high` is a later day.
  let low = 0;
  let high = LONGER_THAN_A_DAY_MS;
  while (high - low > 1) {
    const middle = Math.floor((low + high) / 2);
    if (dayIn(format, start + middle) > today) high = middle;
    else low = middle;
  }
  return high;
};
