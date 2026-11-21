import { assert, describe, it } from "@effect/vitest";
import { Effect, Fiber, Layer, Stream } from "effect";
import { SettingsService, SettingsServiceLive } from "../../../src/application/settings-service";
import { DEFAULT_SETTINGS } from "../../../src/domain/settings";
import { inMemoryStore, recordingNotifier, type StoreOptions } from "../../support/layers";

const setup = (options: StoreOptions = {}) => {
  const store = inMemoryStore(options);
  const notifier = recordingNotifier();
  const layer = SettingsServiceLive.pipe(
    Layer.provide(Layer.mergeAll(store.layer, notifier.layer)),
  );
  return { store, notifier, layer };
};

describe("SettingsService", () => {
  it.effect("starts from defaults on an empty store without saving or notifying", () => {
    const { store, notifier, layer } = setup();
    return Effect.gen(function* () {
      const service = yield* SettingsService;
      assert.deepStrictEqual(yield* service.current, DEFAULT_SETTINGS);
      assert.deepStrictEqual(yield* service.status, { writable: true, issues: [] });
      assert.deepStrictEqual(store.saved(), []);
      assert.deepStrictEqual(notifier.messages(), []);
    }).pipe(Effect.provide(layer));
  });

  it.effect("falls back for one invalid field, notifies once and saves nothing", () => {
    const { store, notifier, layer } = setup({
      initial: { schemaVersion: 1, greeting: 7, showRibbonIcon: false, logLevel: "warn" },
    });
    return Effect.gen(function* () {
      const service = yield* SettingsService;
      const current = yield* service.current;
      assert.strictEqual(current.greeting, DEFAULT_SETTINGS.greeting);
      assert.strictEqual(current.showRibbonIcon, false);
      assert.strictEqual(notifier.messages().length, 1);
      assert.strictEqual(notifier.messages()[0]?.severity, "warning");
      assert.deepStrictEqual(store.saved(), []);
      assert.strictEqual((yield* service.status).issues.length, 1);
    }).pipe(Effect.provide(layer));
  });

  it.effect("updates, saves exactly once and emits the change", () => {
    const { store, layer } = setup();
    return Effect.gen(function* () {
      const service = yield* SettingsService;
      const collected = yield* Effect.forkChild(Stream.runCollect(Stream.take(service.changes, 2)));
      yield* Effect.yieldNow;
      const updated = yield* service.update({ greeting: "Yo" });
      assert.strictEqual(updated.greeting, "Yo");
      assert.deepStrictEqual(store.saved(), [{ ...DEFAULT_SETTINGS, greeting: "Yo" }]);
      const emitted = yield* Fiber.join(collected);
      assert.deepStrictEqual(
        Array.from(emitted).map((settings) => settings.greeting),
        [DEFAULT_SETTINGS.greeting, "Yo"],
      );
    }).pipe(Effect.provide(layer));
  });

  it.effect("rejects an invalid patch without touching the store", () => {
    const { store, layer } = setup();
    return Effect.gen(function* () {
      const service = yield* SettingsService;
      const error = yield* Effect.flip(service.update({ greeting: "" }));
      assert.strictEqual(error._tag, "InvalidSettingsError");
      assert.deepStrictEqual(store.saved(), []);
      assert.deepStrictEqual(yield* service.current, DEFAULT_SETTINGS);
    }).pipe(Effect.provide(layer));
  });

  it.effect("is read-only for settings from a newer version and never writes", () => {
    const { store, notifier, layer } = setup({ initial: { schemaVersion: 2, greeting: "Neu" } });
    return Effect.gen(function* () {
      const service = yield* SettingsService;
      assert.strictEqual((yield* service.status).writable, false);
      const error = yield* Effect.flip(service.update({ greeting: "Yo" }));
      assert.deepStrictEqual(
        { tag: error._tag, reason: error._tag === "ReadOnlySettingsError" ? error.reason : null },
        { tag: "ReadOnlySettingsError", reason: "newer-version" },
      );
      assert.deepStrictEqual(store.saved(), []);
      assert.strictEqual(notifier.messages().length, 1);
    }).pipe(Effect.provide(layer));
  });

  it.effect("loads defaults read-only when the store cannot be read", () => {
    const { store, notifier, layer } = setup({ failLoad: true });
    return Effect.gen(function* () {
      const service = yield* SettingsService;
      assert.deepStrictEqual(yield* service.current, DEFAULT_SETTINGS);
      assert.deepStrictEqual(yield* service.status, {
        writable: false,
        issues: [],
        readOnlyReason: "unreadable",
      });
      assert.strictEqual(notifier.messages().length, 1);
      const error = yield* Effect.flip(service.update({ greeting: "Yo" }));
      assert.deepStrictEqual(
        { tag: error._tag, reason: error._tag === "ReadOnlySettingsError" ? error.reason : null },
        { tag: "ReadOnlySettingsError", reason: "unreadable" },
      );
      assert.deepStrictEqual(store.saved(), []);
    }).pipe(Effect.provide(layer));
  });

  it.effect("keeps the current value when saving fails", () => {
    const { layer } = setup({ failSave: true });
    return Effect.gen(function* () {
      const service = yield* SettingsService;
      const error = yield* Effect.flip(service.update({ greeting: "Yo" }));
      assert.strictEqual(error._tag, "StorageError");
      assert.deepStrictEqual(yield* service.current, DEFAULT_SETTINGS);
    }).pipe(Effect.provide(layer));
  });

  it.effect("applies concurrent updates in order and keeps both", () => {
    const { store, layer } = setup();
    return Effect.gen(function* () {
      const service = yield* SettingsService;
      yield* Effect.all(
        [service.update({ greeting: "Eins" }), service.update({ showRibbonIcon: false })],
        {
          concurrency: "unbounded",
        },
      );
      const current = yield* service.current;
      assert.strictEqual(current.greeting, "Eins");
      assert.strictEqual(current.showRibbonIcon, false);
      assert.strictEqual(store.saved().length, 2);
      assert.deepStrictEqual(store.saved()[1], current);
    }).pipe(Effect.provide(layer));
  });
});
