import { Effect } from "effect";
import { afterEach, describe, expect, it } from "vitest";
import type { AppRuntime } from "../../../src/application/app-services";
import { runSafely } from "../../../src/infrastructure/obsidian/run";
import { testRuntime } from "../../support/runtime";

const runtimes: AppRuntime[] = [];
const make = () => {
  const test = testRuntime();
  runtimes.push(test.runtime);
  return test;
};

afterEach(async () => {
  await Promise.all(runtimes.splice(0).map((runtime) => runtime.dispose()));
});

describe("runSafely", () => {
  it("returns the value of a successful effect", async () => {
    const { runtime } = make();
    await expect(runSafely(runtime, Effect.succeed(4))).resolves.toBe(4);
  });

  it("reports a defect once and resolves undefined", async () => {
    const { runtime, notifier } = make();
    await expect(runSafely(runtime, Effect.die(new Error("boom")))).resolves.toBeUndefined();
    expect(notifier.messages()).toHaveLength(1);
  });

  it("stays silent when interrupted", async () => {
    const { runtime, notifier, logger } = make();
    await expect(runSafely(runtime, Effect.interrupt)).resolves.toBeUndefined();
    expect(notifier.messages()).toEqual([]);
    expect(logger.entries()).toEqual([]);
  });

  it("resolves undefined when the runtime is already disposed", async () => {
    const { runtime } = make();
    await runtime.dispose();
    await expect(runSafely(runtime, Effect.succeed(1))).resolves.toBeUndefined();
  });
});
