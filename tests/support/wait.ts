import { vi } from "vitest";

/**
 * How long a test waits for something that needs more than a microtask: a lazily imported screen,
 * a runtime that finishes disposing. Vitest's default is 1 s, which a loaded machine (the gate
 * running beside another suite, Stryker) has missed. A wait that succeeds returns at once, so a
 * generous budget costs nothing; it stays below the 5 s test timeout, so a wait that never
 * succeeds fails with its own assertion instead of a bare timeout.
 */
export const WAIT_BUDGET_MS = 4000;

/** Polls `check` until it stops throwing, for at most `WAIT_BUDGET_MS`. */
export const eventually = <T>(check: () => T): Promise<T> =>
  vi.waitFor(check, { timeout: WAIT_BUDGET_MS, interval: 10 });
