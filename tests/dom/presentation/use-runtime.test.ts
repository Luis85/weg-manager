import { flushPromises, mount } from "@vue/test-utils";
import { Effect } from "effect";
import { afterEach, describe, expect, it } from "vitest";
import { defineComponent, h } from "vue";
import type { AppRuntime } from "../../../src/application/app-services";
import { VaultReadError } from "../../../src/application/errors";
import { countMarkdownFiles, updateGreeting } from "../../../src/application/use-cases";
import {
  provideRuntime,
  reportVueError,
  useEffectAction,
  useRuntime,
  useSettings,
} from "../../../src/presentation/runtime/use-runtime";
import { testRuntime } from "../../support/runtime";

const runtimes: AppRuntime[] = [];

const host = <T>(runtime: AppRuntime, setup: () => T) => {
  let exposed: T | undefined;
  const wrapper = mount(
    defineComponent({
      setup() {
        exposed = setup();
        return () => h("div");
      },
    }),
    { global: { plugins: [{ install: (app) => provideRuntime(app, runtime) }] } },
  );
  if (exposed === undefined) throw new Error("setup did not run");
  return { wrapper, exposed };
};

const make = () => {
  const test = testRuntime();
  runtimes.push(test.runtime);
  return test;
};

afterEach(async () => {
  await Promise.all(runtimes.splice(0).map((runtime) => runtime.dispose()));
});

describe("useEffectAction", () => {
  it("stores a success value and clears pending", async () => {
    const { runtime } = make();
    const { exposed } = host(runtime, () => useEffectAction(() => countMarkdownFiles));
    const running = exposed.run();
    expect(exposed.pending.value).toBe(true);
    await running;
    expect(exposed.pending.value).toBe(false);
    expect(exposed.value.value).toBe(3);
    expect(exposed.error.value).toBeUndefined();
  });

  it("puts a typed failure and its message into error and message", async () => {
    const { runtime, notifier } = make();
    const failure = new VaultReadError({ cause: new Error("x") });
    const { exposed } = host(runtime, () => useEffectAction(() => Effect.fail(failure)));
    await exposed.run();
    expect(exposed.error.value).toBe(failure);
    expect(exposed.message.value?.title).toBe("Notizen nicht lesbar");
    expect(notifier.messages()).toEqual([]);
  });

  it("reports a defect exactly once and leaves error empty", async () => {
    const { runtime, notifier, logger } = make();
    const { exposed } = host(runtime, () =>
      useEffectAction(() => Effect.die(new Error("boom")) as Effect.Effect<never, VaultReadError>),
    );
    await exposed.run();
    expect(exposed.error.value).toBeUndefined();
    expect(exposed.message.value).toBeUndefined();
    expect(notifier.messages()).toHaveLength(1);
    expect(logger.entries().filter((entry) => entry.event === "defect.reported")).toHaveLength(1);
  });

  it("interrupts the first run when a second starts", async () => {
    const { runtime, vault } = make();
    vault.hold();
    const { exposed } = host(runtime, () => useEffectAction(() => countMarkdownFiles));
    const first = exposed.run();
    await flushPromises();
    expect(vault.held()).toBe(1);
    const second = exposed.run();
    await first;
    expect(exposed.pending.value).toBe(true);
    expect(exposed.value.value).toBeUndefined();
    vault.set(9);
    vault.release();
    await second;
    expect(vault.held()).toBe(0);
    expect(exposed.value.value).toBe(9);
    expect(exposed.pending.value).toBe(false);
  });

  it("drops a result that arrives after unmount", async () => {
    const { runtime, vault, notifier } = make();
    vault.hold();
    const { wrapper, exposed } = host(runtime, () => useEffectAction(() => countMarkdownFiles));
    const running = exposed.run();
    await flushPromises();
    wrapper.unmount();
    vault.release();
    await running;
    expect(exposed.value.value).toBeUndefined();
    expect(exposed.pending.value).toBe(true);
    expect(notifier.messages()).toEqual([]);
  });

  it("treats a disposed runtime as a defect it cannot report, without rejecting", async () => {
    const { runtime } = make();
    const { exposed } = host(runtime, () => useEffectAction(() => countMarkdownFiles));
    await runtime.dispose();
    await expect(exposed.run()).resolves.toBeUndefined();
    expect(exposed.error.value).toBeUndefined();
  });
});

describe("useSettings and useRuntime", () => {
  it("follows settings changes until the scope ends", async () => {
    const { runtime } = make();
    const { wrapper, exposed } = host(runtime, () => useSettings());
    expect(exposed.value.greeting).toBe("Hello from WEG Manager");
    await runtime.runPromise(updateGreeting("Moin"));
    await flushPromises();
    expect(exposed.value.greeting).toBe("Moin");
    wrapper.unmount();
    await runtime.runPromise(updateGreeting("Später"));
    await flushPromises();
    expect(exposed.value.greeting).toBe("Moin");
  });

  it("throws outside a mounted surface", () => {
    expect(() => mount(defineComponent({ setup: () => (useRuntime(), () => h("div")) }))).toThrow(
      "useRuntime() outside a mounted surface",
    );
  });

  it("never rejects when reporting into a disposed runtime", async () => {
    const { runtime } = make();
    await runtime.dispose();
    await expect(reportVueError(runtime, new Error("late"))).resolves.toBeUndefined();
  });
});
