import { afterEach, describe, expect, it, vi } from "vitest";
import { eventually } from "../support/wait";

vi.mock("obsidian", () => import("@test/obsidian"));

const { createTestPlugin } = await import("@test/obsidian");
const { default: WegManagerPlugin } = await import("../../src/main");

/**
 * The window's timers that are set and have neither fired nor been cleared. The plugin's `Today`
 * adapter always waits on one; the runtime's own sleeps (the index's batches) come and go.
 */
const trackTimers = () => {
  /** Each pending timer's delay, by id. */
  const pending = new Map<number, number>();
  const set = window.setTimeout.bind(window);
  const clear = window.clearTimeout.bind(window);
  vi.spyOn(window, "setTimeout").mockImplementation(((
    run: (...args: unknown[]) => void,
    ms?: number,
    ...args: unknown[]
  ) => {
    const id: number = set(
      (...given: unknown[]) => {
        pending.delete(id);
        run(...given);
      },
      ms,
      ...args,
    );
    pending.set(id, ms ?? 0);
    return id;
  }) as typeof window.setTimeout);
  vi.spyOn(window, "clearTimeout").mockImplementation((id) => {
    // The id is whatever `setTimeout` returned: a number or Node's timer object.
    pending.delete(id as number);
    clear(id);
  });
  return pending;
};

afterEach(() => {
  vi.restoreAllMocks();
  document.body.replaceChildren();
});

/** Timers belong to the runtime, as the host event listeners do (`event-listeners.test.ts`). */
describe("the plugin's timers across the plugin lifecycle", () => {
  it("are all cleared once the plugin unloads, cycle after cycle", async () => {
    const pending = trackTimers();
    const { plugin, registry } = createTestPlugin(WegManagerPlugin);
    const cycle = async () => {
      await registry.load();
      // `Today` waits for the next look at the clock; `eventually` itself polls every 10 ms.
      await eventually(() => expect([...pending.values()].some((ms) => ms > 10)).toBe(true));
      plugin.unload();
      await eventually(() => expect(pending.size).toBe(0));
    };
    await cycle();
    await cycle();
  });

  it("are all cleared when the plugin unloads while settings are still loading", async () => {
    const pending = trackTimers();
    const { plugin, registry } = createTestPlugin(WegManagerPlugin);
    registry.holdLoadData();
    const loading = registry.load();
    plugin.unload();
    registry.releaseLoadData();
    await loading;
    await eventually(() => expect(pending.size).toBe(0));
  });
});
