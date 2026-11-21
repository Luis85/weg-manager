import { flushPromises } from "@vue/test-utils";
import { Effect } from "effect";
import { afterEach, describe, expect, it } from "vitest";
import { VaultReadError } from "../../../../src/application/shell/errors";
import { SettingsService } from "../../../../src/application/shell/settings-service";
import { countMarkdownFiles, updateGreeting } from "../../../../src/application/shell/use-cases";
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

/** A command whose effect waits for the vault, then records that it ran to its end. */
const counting = (counted: number[]) => () =>
  Effect.tap(countMarkdownFiles, (count) => Effect.sync(() => counted.push(count)));

describe("useCommand while the scope is alive", () => {
  it("stores a success value and clears pending", async () => {
    const { runtime } = make();
    const { exposed } = host(runtime, () => useCommand(() => countMarkdownFiles));
    const running = exposed.run();
    expect(exposed.pending.value).toBe(true);
    await running;
    expect(exposed.pending.value).toBe(false);
    expect(exposed.value.value).toBe(3);
    expect(exposed.error.value).toBeUndefined();
  });

  it("puts a typed failure and its message into error and message, without a notice", async () => {
    const { runtime, notifier } = make();
    const failure = new VaultReadError({ cause: new Error("x") });
    const { exposed } = host(runtime, () => useCommand(() => Effect.fail(failure)));
    await exposed.run();
    expect(exposed.error.value).toBe(failure);
    expect(exposed.message.value?.title).toBe("Notizen nicht lesbar");
    expect(notifier.messages()).toEqual([]);
  });

  it("reports a defect exactly once and leaves error empty", async () => {
    const { runtime, notifier, logger } = make();
    const { exposed } = host(runtime, () =>
      useCommand(() => Effect.die(new Error("boom")) as Effect.Effect<never, VaultReadError>),
    );
    await exposed.run();
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
    await expect(exposed.run()).resolves.toBeUndefined();
    expect(exposed.pending.value).toBe(false);
    expect(notifier.messages()).toHaveLength(1);
    expect(defects(logger)).toHaveLength(1);
  });

  it("clears the previous failure when it runs again", async () => {
    const { runtime, vault } = make({ vault: "fail" });
    const { exposed } = host(runtime, () => useCommand(() => countMarkdownFiles));
    await exposed.run();
    expect(exposed.error.value?._tag).toBe("VaultReadError");
    vault.set(5);
    await exposed.run();
    expect(exposed.error.value).toBeUndefined();
    expect(exposed.message.value).toBeUndefined();
    expect(exposed.value.value).toBe(5);
  });

  it("treats a disposed runtime as a defect it cannot report, without rejecting", async () => {
    const { runtime } = make();
    const { exposed } = host(runtime, () => useCommand(() => countMarkdownFiles));
    await runtime.dispose();
    await expect(exposed.run()).resolves.toBeUndefined();
    expect(exposed.error.value).toBeUndefined();
  });
});

describe("useCommand runs once per pending call", () => {
  it("returns the pending run's promise for a second run and starts nothing new", async () => {
    const { runtime, vault } = make();
    vault.hold();
    const counted: number[] = [];
    const { exposed } = host(runtime, () => useCommand(counting(counted)));
    const first = exposed.run();
    await flushPromises();
    const second = exposed.run();
    expect(second).toBe(first);
    vault.release();
    await first;
    await settle();
    expect(counted).toEqual([3]);
    expect(exposed.value.value).toBe(3);
    expect(exposed.pending.value).toBe(false);
  });

  it("ignores the arguments of a run made while one is pending", async () => {
    const { runtime, store } = make({ store: { uncancellableSaves: true } });
    store.holdSaves();
    const { exposed } = host(runtime, () => useCommand(updateGreeting));
    const first = exposed.run("Eins");
    await settle();
    void exposed.run("Zwei");
    store.releaseSaves();
    await first;
    await settle();
    expect(store.saved()).toEqual([expect.objectContaining({ greeting: "Eins" })]);
    expect(exposed.value.value?.greeting).toBe("Eins");
  });

  it("starts a new execution once the previous one settled", async () => {
    const { runtime } = make();
    const counted: number[] = [];
    const { exposed } = host(runtime, () => useCommand(counting(counted)));
    await exposed.run();
    await exposed.run();
    expect(counted).toEqual([3, 3]);
  });
});

describe("useCommand after the scope ended", () => {
  it("runs to completion silently and leaves the component's refs alone", async () => {
    const { runtime, vault, notifier, logger } = make();
    vault.hold();
    const counted: number[] = [];
    const { wrapper, exposed } = host(runtime, () => useCommand(counting(counted)));
    const running = exposed.run();
    await flushPromises();
    wrapper.unmount();
    vault.release();
    await running;
    await settle();
    expect(counted).toEqual([3]);
    expect(exposed.pending.value).toBe(true);
    expect(exposed.value.value).toBeUndefined();
    expect(notifier.messages()).toEqual([]);
    expect(defects(logger)).toEqual([]);
  });

  it("saves the greeting into the store and the service alike", async () => {
    const { runtime, store } = make({ store: { uncancellableSaves: true } });
    store.holdSaves();
    const { wrapper, exposed } = host(runtime, () => useCommand(updateGreeting));
    const running = exposed.run("Moin");
    await settle();
    wrapper.unmount();
    store.releaseSaves();
    await running;
    await settle();
    expect(store.stored()).toEqual(expect.objectContaining({ greeting: "Moin" }));
    const current = await runtime.runPromise(SettingsService.use((service) => service.current));
    expect(encodeSettings(current)).toEqual(store.stored());
  });

  it("shows a typed failure as a notice and leaves the component's refs alone", async () => {
    const { runtime, store, notifier } = make({ store: { uncancellableSaves: true } });
    store.holdSaves();
    store.setFailSave(true);
    const { wrapper, exposed } = host(runtime, () => useCommand(updateGreeting));
    const running = exposed.run("Moin");
    await settle();
    wrapper.unmount();
    store.releaseSaves();
    await running;
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
    const { runtime, vault, notifier, logger } = make();
    vault.hold();
    const { wrapper, exposed } = host(runtime, () =>
      useCommand(() => Effect.andThen(countMarkdownFiles, Effect.die(new Error("late")))),
    );
    const running = exposed.run();
    await flushPromises();
    wrapper.unmount();
    vault.release();
    await running;
    await settle();
    expect(defects(logger)).toHaveLength(1);
    expect(notifier.messages()).toHaveLength(1);
    expect(exposed.error.value).toBeUndefined();
  });

  it("stays silent when the runtime is disposed meanwhile", async () => {
    const { runtime, vault, notifier, logger } = make();
    vault.hold();
    const { wrapper, exposed } = host(runtime, () => useCommand(() => countMarkdownFiles));
    const running = exposed.run();
    await flushPromises();
    wrapper.unmount();
    await runtime.dispose();
    await expect(running).resolves.toBeUndefined();
    expect(notifier.messages()).toEqual([]);
    expect(defects(logger)).toEqual([]);
  });
});
