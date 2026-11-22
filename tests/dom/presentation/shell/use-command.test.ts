import { flushPromises } from "@vue/test-utils";
import { Effect } from "effect";
import { afterEach, describe, expect, it } from "vitest";
import { VaultReadError } from "../../../../src/application/shell/errors";
import { SettingsService } from "../../../../src/application/shell/settings-service";
import { setLogLevel } from "../../../../src/application/shell/use-cases";
import { encodeSettings } from "../../../../src/domain/shell";
import { useCommand } from "../../../../src/presentation/shell";
import { host, runtimes } from "../../../support/composable";

const { make, disposeAll } = runtimes();

afterEach(disposeAll);

/** Lets pending promise callbacks and fibers run. */
const settle = async () => {
  await flushPromises();
  await new Promise((resolve) => setTimeout(resolve, 0));
  await flushPromises();
};

const defects = (logger: { entries(): readonly { event: string }[] }) =>
  logger.entries().filter((entry) => entry.event === "defect.reported");

/** A command whose effect waits for the source, then records that it ran to its end. */
const counting =
  (source: { readonly read: Effect.Effect<number, VaultReadError> }, counted: number[]) => () =>
    Effect.tap(source.read, (count) => Effect.sync(() => counted.push(count)));

describe("useCommand while the scope is alive", () => {
  it("stores a success value and clears pending", async () => {
    const { runtime, source } = make();
    const { exposed } = host(runtime, () => useCommand(() => source.read));
    const running = exposed.run();
    expect(exposed.pending.value).toBe(true);
    await expect(running).resolves.toEqual({ _tag: "success", value: 3 });
    expect(exposed.pending.value).toBe(false);
    expect(exposed.value.value).toBe(3);
    expect(exposed.error.value).toBeUndefined();
  });

  it("puts a typed failure and its message into error and message, without a notice", async () => {
    const { runtime, notifier } = make();
    const failure = new VaultReadError({ cause: new Error("x") });
    const { exposed } = host(runtime, () => useCommand(() => Effect.fail(failure)));
    const outcome = await exposed.run();
    expect(outcome).toEqual({ _tag: "failure", error: failure, message: exposed.message.value });
    expect(exposed.error.value).toBe(failure);
    expect(exposed.message.value?.title).toBe("Notizen nicht lesbar");
    expect(notifier.messages()).toEqual([]);
  });

  it("reports a defect exactly once and leaves error empty", async () => {
    const { runtime, notifier, logger } = make();
    const { exposed } = host(runtime, () =>
      useCommand(() => Effect.die(new Error("boom")) as Effect.Effect<never, VaultReadError>),
    );
    await expect(exposed.run()).resolves.toEqual({ _tag: "defect" });
    expect(exposed.error.value).toBeUndefined();
    expect(exposed.message.value).toBeUndefined();
    expect(notifier.messages()).toHaveLength(1);
    expect(defects(logger)).toHaveLength(1);
  });

  it("reports a throw while building the effect once, without rejecting", async () => {
    const { runtime, notifier, logger } = make();
    const { exposed } = host(runtime, () =>
      useCommand((): Effect.Effect<number, VaultReadError> => {
        throw new Error("build exploded");
      }),
    );
    await expect(exposed.run()).resolves.toEqual({ _tag: "defect" });
    expect(exposed.pending.value).toBe(false);
    expect(notifier.messages()).toHaveLength(1);
    expect(defects(logger)).toHaveLength(1);
  });

  it("clears the previous failure when it runs again", async () => {
    const { runtime, source } = make({ source: "fail" });
    const { exposed } = host(runtime, () => useCommand(() => source.read));
    await exposed.run();
    expect(exposed.error.value?._tag).toBe("VaultReadError");
    source.set(5);
    await exposed.run();
    expect(exposed.error.value).toBeUndefined();
    expect(exposed.message.value).toBeUndefined();
    expect(exposed.value.value).toBe(5);
  });

  it("clears the previous value when it runs again, so a failure after a success reads none", async () => {
    const { runtime, source } = make();
    source.hold();
    const { exposed } = host(runtime, () => useCommand(() => source.read));
    source.release();
    await exposed.run();
    expect(exposed.value.value).toBe(3);
    source.hold();
    source.set("fail");
    const running = exposed.run();
    expect(exposed.value.value).toBeUndefined();
    source.release();
    await expect(running).resolves.toMatchObject({ _tag: "failure" });
    expect(exposed.value.value).toBeUndefined();
  });

  it("resolves a defect after a success as a defect, with no value left", async () => {
    const { runtime } = make();
    let die = false;
    const { exposed } = host(runtime, () =>
      useCommand(() => (die ? Effect.die(new Error("boom")) : Effect.succeed(1))),
    );
    await exposed.run();
    die = true;
    await expect(exposed.run()).resolves.toEqual({ _tag: "defect" });
    expect(exposed.value.value).toBeUndefined();
    expect(exposed.error.value).toBeUndefined();
  });

  it("treats a disposed runtime as a defect it cannot report, without rejecting", async () => {
    const { runtime, source } = make();
    const { exposed } = host(runtime, () => useCommand(() => source.read));
    await runtime.dispose();
    await expect(exposed.run()).resolves.toEqual({ _tag: "defect" });
    expect(exposed.error.value).toBeUndefined();
  });
});

describe("useCommand runs once per pending call", () => {
  it("returns the pending run's promise for a second run and starts nothing new", async () => {
    const { runtime, source } = make();
    source.hold();
    const counted: number[] = [];
    const { exposed } = host(runtime, () => useCommand(counting(source, counted)));
    const first = exposed.run();
    await flushPromises();
    const second = exposed.run();
    expect(second).toBe(first);
    source.release();
    await expect(second).resolves.toEqual({ _tag: "success", value: 3 });
    await settle();
    expect(counted).toEqual([3]);
    expect(exposed.value.value).toBe(3);
    expect(exposed.pending.value).toBe(false);
  });

  it("ignores the arguments of a run made while one is pending", async () => {
    const { runtime, store } = make({ store: { uncancellableSaves: true } });
    store.holdSaves();
    const { exposed } = host(runtime, () => useCommand(setLogLevel));
    const first = exposed.run("debug");
    await settle();
    void exposed.run("error");
    store.releaseSaves();
    await first;
    await settle();
    expect(store.saved()).toEqual([expect.objectContaining({ logLevel: "debug" })]);
    expect(exposed.value.value?.logLevel).toBe("debug");
  });

  it("starts a new execution once the previous one settled", async () => {
    const { runtime, source } = make();
    const counted: number[] = [];
    const { exposed } = host(runtime, () => useCommand(counting(source, counted)));
    await exposed.run();
    await exposed.run();
    expect(counted).toEqual([3, 3]);
  });
});

describe("useCommand after the scope ended", () => {
  it("runs to completion silently and leaves the component's refs alone", async () => {
    const { runtime, source, notifier, logger } = make();
    source.hold();
    const counted: number[] = [];
    const { wrapper, exposed } = host(runtime, () => useCommand(counting(source, counted)));
    const running = exposed.run();
    await flushPromises();
    wrapper.unmount();
    source.release();
    await expect(running).resolves.toEqual({ _tag: "success", value: 3 });
    await settle();
    expect(counted).toEqual([3]);
    expect(exposed.pending.value).toBe(true);
    expect(exposed.value.value).toBeUndefined();
    expect(notifier.messages()).toEqual([]);
    expect(defects(logger)).toEqual([]);
  });

  it("saves the setting into the store and the service alike", async () => {
    const { runtime, store } = make({ store: { uncancellableSaves: true } });
    store.holdSaves();
    const { wrapper, exposed } = host(runtime, () => useCommand(setLogLevel));
    const running = exposed.run("info");
    await settle();
    wrapper.unmount();
    store.releaseSaves();
    await running;
    await settle();
    expect(store.stored()).toEqual(expect.objectContaining({ logLevel: "info" }));
    const current = await runtime.runPromise(SettingsService.use((service) => service.current));
    expect(encodeSettings(current)).toEqual(store.stored());
  });

  it("shows a typed failure as a notice and leaves the component's refs alone", async () => {
    const { runtime, store, notifier } = make({ store: { uncancellableSaves: true } });
    store.holdSaves();
    store.setFailSave(true);
    const { wrapper, exposed } = host(runtime, () => useCommand(setLogLevel));
    const running = exposed.run("info");
    await settle();
    wrapper.unmount();
    store.releaseSaves();
    await expect(running).resolves.toMatchObject({
      _tag: "failure",
      error: { _tag: "StorageError" },
      message: { title: "Einstellungen nicht gespeichert" },
    });
    await settle();
    expect(notifier.messages()).toEqual([
      {
        severity: "error",
        title: "Einstellungen nicht gespeichert",
        detail:
          "Die Einstellungsdatei konnte nicht geschrieben werden. Deine Eingabe ist erhalten. Speichere erneut.",
        action: "retry",
      },
    ]);
    expect(exposed.error.value).toBeUndefined();
    expect(exposed.message.value).toBeUndefined();
    expect(exposed.pending.value).toBe(true);
  });

  it("reports a defect exactly once", async () => {
    const { runtime, source, notifier, logger } = make();
    source.hold();
    const { wrapper, exposed } = host(runtime, () =>
      useCommand(() => Effect.andThen(source.read, Effect.die(new Error("late")))),
    );
    const running = exposed.run();
    await flushPromises();
    wrapper.unmount();
    source.release();
    await expect(running).resolves.toEqual({ _tag: "defect" });
    await settle();
    expect(defects(logger)).toHaveLength(1);
    expect(notifier.messages()).toHaveLength(1);
    expect(exposed.error.value).toBeUndefined();
  });

  it("stays silent when the runtime is disposed meanwhile", async () => {
    const { runtime, source, notifier, logger } = make();
    source.hold();
    const { wrapper, exposed } = host(runtime, () => useCommand(() => source.read));
    const running = exposed.run();
    await flushPromises();
    wrapper.unmount();
    await runtime.dispose();
    await expect(running).resolves.toEqual({ _tag: "interrupted" });
    expect(notifier.messages()).toEqual([]);
    expect(defects(logger)).toEqual([]);
  });
});
