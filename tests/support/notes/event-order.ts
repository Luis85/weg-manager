/**
 * Expected events in order, where two runs of events that Obsidian fires one way round in some
 * runs and the other way round in others are written as `eitherOrder(first, second)`: the
 * scenarios pin every order Obsidian keeps, and say so explicitly where it keeps none. Each run
 * keeps its own order. `inExpectedOrder(report, expected)` puts such a pair of the report into the
 * order the expectation writes it, and only when the report holds exactly those events one way
 * round or the other; `expect(inExpectedOrder(report, FACTS)).toEqual(asWritten(FACTS))` then
 * fails on any other difference, the order outside a pair included.
 */

/** Two runs of events that come in either order, each in its own order. */
export type EitherOrder = { readonly either: readonly [readonly string[], readonly string[]] };

const run = (events: string | readonly string[]) =>
  typeof events === "string" ? [events] : [...events];

export const eitherOrder = (
  first: string | readonly string[],
  second: string | readonly string[],
): EitherOrder => ({ either: [run(first), run(second)] });

const isPair = (value: unknown): value is EitherOrder =>
  typeof value === "object" && value !== null && "either" in value;

const same = (a: readonly unknown[], b: readonly unknown[]) =>
  JSON.stringify(a) === JSON.stringify(b);

/** `actual`'s events, each pair that `expected` allows either way put in the written order. */
const orderedEvents = (actual: readonly unknown[], expected: readonly unknown[]): unknown[] => {
  const result: unknown[] = [];
  let index = 0;
  for (const item of expected) {
    if (!isPair(item)) {
      if (index < actual.length) result.push(actual[index]);
      index += 1;
      continue;
    }
    const [first, second] = item.either;
    const written = [...first, ...second];
    const slice = actual.slice(index, index + written.length);
    result.push(...(same(slice, [...second, ...first]) ? written : slice));
    index += written.length;
  }
  return [...result, ...actual.slice(index)];
};

/** The report with every pair the expectation allows either way put into its written order. */
export const inExpectedOrder = (actual: unknown, expected: unknown): unknown => {
  if (Array.isArray(expected) && Array.isArray(actual)) {
    if (expected.some(isPair)) return orderedEvents(actual, expected);
    return actual.map((item: unknown, index) => inExpectedOrder(item, expected[index]));
  }
  if (typeof expected === "object" && expected !== null && typeof actual === "object" && actual) {
    return Object.fromEntries(
      Object.entries(actual).map(([key, value]) => [
        key,
        inExpectedOrder(value, (expected as Record<string, unknown>)[key]),
      ]),
    );
  }
  return actual;
};

/** The expectation as a report would read: each pair in the order written. */
export const asWritten = (expected: unknown): unknown => {
  if (Array.isArray(expected)) {
    return expected.flatMap((item: unknown) =>
      isPair(item) ? [...item.either[0], ...item.either[1]] : [asWritten(item)],
    );
  }
  if (typeof expected === "object" && expected !== null) {
    return Object.fromEntries(
      Object.entries(expected).map(([key, value]) => [key, asWritten(value)]),
    );
  }
  return expected;
};
