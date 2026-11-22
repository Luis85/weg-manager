import type { Effect } from "effect";

/**
 * What the NoteStore contract (`tests/support/notes/contract-*.ts`) takes from `@effect/vitest`
 * and `vitest`, for the probe plugin, which runs the contract inside Obsidian
 * (`contract-runner.ts`): `configs/vite.probe.config.ts` resolves both packages to this module.
 * `describe` and `it.effect` only collect the cases; `assert` has the six checks the contract
 * uses, with chai's meaning (deep equality is strict: same prototype, same own keys, `Object.is`
 * leaves); `vi` has the two helpers the contract uses.
 */

/** One case of the contract: its name with the names of the blocks around it, and its effect. */
export type ContractCase = {
  readonly name: string;
  readonly run: () => Effect.Effect<unknown, unknown>;
};

const cases: ContractCase[] = [];
const blocks: string[] = [];

export const describe = (name: string, body: () => void): void => {
  blocks.push(name);
  try {
    body();
  } finally {
    blocks.pop();
  }
};

export const it = {
  effect: (name: string, run: () => Effect.Effect<unknown, unknown>): void => {
    cases.push({ name: [...blocks, name].join(" > "), run });
  },
};

/** The cases collected so far, and none after. */
export const collectedCases = (): ContractCase[] => cases.splice(0);

const deepEqual = (a: unknown, b: unknown): boolean => {
  if (Object.is(a, b)) return true;
  if (typeof a !== "object" || typeof b !== "object" || a === null || b === null) return false;
  if (Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) return false;
  const keys = Object.keys(a);
  return (
    keys.length === Object.keys(b).length &&
    keys.every(
      (key) => Object.hasOwn(b, key) && deepEqual(Reflect.get(a, key), Reflect.get(b, key)),
    )
  );
};

const ensure = (holds: boolean, what: string, actual: unknown, ...expected: unknown[]) => {
  if (holds) return;
  const shown = (value: unknown) => {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  };
  const wanted = expected.length > 0 ? `, expected ${shown(expected[0])}` : "";
  throw new Error(`${what}: got ${shown(actual)}${wanted}`);
};

export const assert = {
  deepStrictEqual: (actual: unknown, expected: unknown) =>
    ensure(deepEqual(actual, expected), "deepStrictEqual", actual, expected),
  strictEqual: (actual: unknown, expected: unknown) =>
    ensure(Object.is(actual, expected), "strictEqual", actual, expected),
  isTrue: (actual: unknown) => ensure(actual === true, "isTrue", actual),
  isFalse: (actual: unknown) => ensure(actual === false, "isFalse", actual),
  isUndefined: (actual: unknown) => ensure(actual === undefined, "isUndefined", actual),
  instanceOf: (actual: unknown, type: abstract new (...args: never[]) => unknown) =>
    ensure(actual instanceof type, `instanceOf ${type.name}`, actual),
};

type Mock<A extends unknown[], R> = ((...args: A) => R) & { mock: { calls: A[] } };

export const vi = {
  fn: <F extends (...args: never[]) => unknown>(implementation: F) => {
    const calls: Parameters<F>[] = [];
    const mock = (...args: Parameters<F>) => {
      calls.push(args);
      return implementation(...args) as ReturnType<F>;
    };
    return Object.assign(mock, { mock: { calls } }) as Mock<Parameters<F>, ReturnType<F>>;
  },
  /** Polls `check` until it stops throwing, as Vitest's `vi.waitFor`. */
  waitFor: async <T>(
    check: () => T,
    { timeout, interval }: { readonly timeout: number; readonly interval: number },
  ): Promise<T> => {
    const deadline = Date.now() + timeout;
    for (;;) {
      try {
        return check();
      } catch (error) {
        if (Date.now() > deadline) throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, interval));
    }
  },
};
