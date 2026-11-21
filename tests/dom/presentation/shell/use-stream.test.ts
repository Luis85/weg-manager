import { flushPromises } from "@vue/test-utils";
import { Effect, Stream, SubscriptionRef } from "effect";
import { afterEach, describe, expect, it } from "vitest";
import { defineComponent, h } from "vue";
import { SettingsService } from "../../../../src/application/shell/settings-service";
import { setLogLevel, updateGreeting } from "../../../../src/application/shell/use-cases";
import { useSettings, useSettingsStatus, useStream } from "../../../../src/presentation/shell";
import { host, runtimes } from "../../../support/composable";
import { mountApp } from "../../../support/surface";

const { make, disposeAll } = runtimes();

afterEach(async () => {
  document.body.replaceChildren();
  await disposeAll();
});

const defects = (logger: { entries(): readonly { event: string }[] }) =>
  logger.entries().filter((entry) => entry.event === "defect.reported");

/** A value the test changes by hand, with the read and the stream a use case would hand out. */
const followed = (initial: number) => {
  const ref = Effect.runSync(SubscriptionRef.make(initial));
  return {
    read: SubscriptionRef.get(ref),
    changes: SubscriptionRef.changes(ref),
    set: (value: number) => Effect.runPromise(SubscriptionRef.set(ref, value)),
  };
};

describe("useStream", () => {
  it("has the current value on the first render, before the stream has run", () => {
    const { runtime } = make();
    const source = followed(7);
    const { exposed } = host(runtime, () => useStream(source.read, source.changes));
    expect(exposed.value).toBe(7);
  });

  it("follows every change until the scope ends", async () => {
    const { runtime } = make();
    const source = followed(1);
    const { wrapper, exposed } = host(runtime, () => useStream(source.read, source.changes));
    await flushPromises();
    await source.set(2);
    await flushPromises();
    expect(exposed.value).toBe(2);
    wrapper.unmount();
    await source.set(3);
    await flushPromises();
    expect(exposed.value).toBe(2);
  });

  it("keeps the last value and reports a defect of the stream once", async () => {
    const { runtime, logger, notifier } = make();
    const changes = Stream.concat(Stream.make(5), Stream.die(new Error("stream broke")));
    const { exposed } = host(runtime, () => useStream(Effect.succeed(4), changes));
    await flushPromises();
    await flushPromises();
    expect(exposed.value).toBe(5);
    expect(defects(logger)).toHaveLength(1);
    expect(notifier.messages()).toHaveLength(1);
  });

  it("reports nothing when the scope ends while the stream runs", async () => {
    const { runtime, logger } = make();
    const { wrapper } = host(runtime, () => useStream(Effect.succeed(1), Stream.never));
    await flushPromises();
    wrapper.unmount();
    await flushPromises();
    expect(defects(logger)).toEqual([]);
  });

  it("reports a broken read once through the surface", async () => {
    const { runtime, logger } = make();
    const Broken = defineComponent({
      setup() {
        const value = useStream(Effect.die(new Error("read broke")), Stream.never);
        return () => h("p", String(value.value));
      },
    });
    const root = document.createElement("div");
    document.body.append(root);
    const close = mountApp(root, runtime, { content: Broken });
    await flushPromises();
    await flushPromises();
    expect(defects(logger)).toHaveLength(1);
    close();
  });
});

describe("useSettings and useSettingsStatus", () => {
  it("follow the settings service", async () => {
    const { runtime } = make();
    const { exposed } = host(runtime, () => ({
      settings: useSettings(),
      status: useSettingsStatus(),
    }));
    expect(exposed.settings.value.greeting).toBeNull();
    expect(exposed.status.value.writable).toBe(true);
    await runtime.runPromise(updateGreeting("Moin"));
    await runtime.runPromise(setLogLevel("debug"));
    await flushPromises();
    expect(exposed.settings.value).toEqual({
      schemaVersion: 1,
      greeting: "Moin",
      logLevel: "debug",
    });
    const status = await runtime.runPromise(SettingsService.use((service) => service.status));
    expect(exposed.status.value).toEqual(status);
  });
});
