/**
 * A calendar day as `YYYY-MM-DD`, the form a `date` field holds: two days compare as text in the
 * order of time, so "overdue" is `due < today` (glossary: today).
 */
export type CalendarDay = string;

const pad = (value: number, digits: number): string => String(value).padStart(digits, "0");

/** The calendar day of `time` in the machine's own time zone, the user's local day. */
export const localDay = (time: Date): CalendarDay =>
  `${pad(time.getFullYear(), 4)}-${pad(time.getMonth() + 1, 2)}-${pad(time.getDate(), 2)}`;

/**
 * The milliseconds from `time` to the start of the next local day: 24 hours from a midnight, 23 or
 * 25 across a daylight saving change, and to 01:00 where a change skips midnight itself.
 */
export const untilNextLocalMidnight = (time: Date): number => {
  const next = new Date(time.getTime());
  next.setHours(24, 0, 0, 0);
  return next.getTime() - time.getTime();
};
