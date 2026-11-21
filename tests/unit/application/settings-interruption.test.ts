import { assert, describe, it } from "@effect/vitest";
import { Effect, Exit, Fiber, Layer, ManagedRuntime } from "effect";
import { SettingsService, SettingsServiceLive } from "../../../src/application/settings-service";
import { DEFAULT_SETTINGS } from "../../../src/domain/settings";
import {
  inMemoryStore,
  recordingNotifier,
  testMessages,
  type StoreOptions,
} from "../../support/layers";

const setup = (options: StoreOptions = {}) => {
  const store = inMemoryStore({ uncancellableSaves: true, ...options });
  const notifier = recordingNotifier();
  const layer = SettingsServiceLive.pipe(
    Layer.provide(Layer.mergeAll(store.layer, notifier.layer, testMessages)),
  );
  return { store, notifier, layer };
};

/** Lets pending promise callbacks and fibers run. */
const settle = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

/** Polls until `ready()` holds; fails the test after a few rounds. */
const until = async (ready: () => boolean, rounds = 20): Promise<void> => {
  if (ready() || rounds === 0) return assert.isTrue(ready());
  await settle();
  return until(ready, rounds - 1);
};

describe("SettingsService under interruption", () => {
  it("keeps disk and memory equal when an update is interrupted during its save", async () => {
    const { store, layer } = setup();
    const runtime = ManagedRuntime.make(layer);
    try {
      store.holdSaves();
      const controller = new AbortController();
      const running = runtime.runPromiseExit(
        SettingsService.use((service) => service.update({ greeting: "Moin" })),
        { signal: controller.signal },
      );
      await until(() => store.heldSaves() === 1);
      controller.abort();
      await settle();
      store.releaseSaves();
      const exit = await running;
      await settle();
      assert.isTrue(Exit.isFailure(exit));
      assert.deepStrictEqual(store.stored(), { ...DEFAULT_SETTINGS, greeting: "Moin" });
      assert.deepStrictEqual(
        await runtime.runPromise(SettingsService.use((service) => service.current)),
        { ...DEFAULT_SETTINGS, greeting: "Moin" },
      );
    } finally {
      await runtime.dispose();
    }
  });

  it.effect("drops an update interrupted while it waits for an earlier one", () => {
    const { store, layer } = setup();
    return Effect.gen(function* () {
      const service = yield* SettingsService;
      store.holdSaves();
      const first = yield* Effect.forkChild(service.update({ greeting: "Erste" }));
      const second = yield* Effect.forkChild(service.update({ greeting: "Zweite" }));
      yield* Effect.promise(() => until(() => store.heldSaves() === 1));
      const interrupting = yield* Effect.forkChild(Fiber.interrupt(second));
      yield* Effect.promise(settle);
      store.releaseSaves();
      yield* Fiber.join(first);
      yield* Effect.promise(settle);
      yield* Fiber.join(interrupting);
      assert.deepStrictEqual(store.saved(), [{ ...DEFAULT_SETTINGS, greeting: "Erste" }]);
      assert.strictEqual((yield* service.current).greeting, "Erste");
    }).pipe(Effect.provide(layer));
  });

  it.effect("finishes a reload interrupted while it announces the new status", () => {
    const { store, notifier, layer } = setup();
    return Effect.gen(function* () {
      const service = yield* SettingsService;
      store.writeExternally({ greeting: "", logLevel: "debug" });
      notifier.hold();
      const reloading = yield* Effect.forkChild(service.reload);
      yield* Effect.promise(() => until(() => notifier.held() === 1));
      const interrupting = yield* Effect.forkChild(Fiber.interrupt(reloading));
      yield* Effect.promise(settle);
      notifier.release();
      yield* Fiber.join(interrupting);
      assert.strictEqual(notifier.messages()[0]?.title, "Einstellungen teilweise zurückgesetzt");
      assert.strictEqual((yield* service.status).issues.length, 1);
      assert.deepStrictEqual(yield* service.current, { ...DEFAULT_SETTINGS, logLevel: "debug" });
    }).pipe(Effect.provide(layer));
  });
});
