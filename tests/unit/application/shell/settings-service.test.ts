import { assert, describe, it } from "@effect/vitest";
import { Effect, Fiber, Layer, Stream } from "effect";
import {
  SettingsService,
  SettingsServiceLive,
} from "../../../../src/application/shell/settings-service";
import { DEFAULT_SETTINGS } from "../../../../src/domain/shell/settings";
import {
  inMemoryStore,
  recordingNotifier,
  testMessages,
  type StoreOptions,
} from "../../../support/layers";

const setup = (options: StoreOptions = {}) => {
  const store = inMemoryStore(options);
  const notifier = recordingNotifier();
  const layer = SettingsServiceLive.pipe(
    Layer.provide(Layer.mergeAll(store.layer, notifier.layer, testMessages)),
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
      initial: { schemaVersion: 1, rootFolder: 7, logLevel: "debug" },
    });
    return Effect.gen(function* () {
      const service = yield* SettingsService;
      const current = yield* service.current;
      assert.strictEqual(current.rootFolder, DEFAULT_SETTINGS.rootFolder);
      assert.strictEqual(current.logLevel, "debug");
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
      const updated = yield* service.update({ logLevel: "debug" });
      assert.strictEqual(updated.logLevel, "debug");
      assert.deepStrictEqual(store.saved(), [{ schemaVersion: 1, logLevel: "debug" }]);
      const emitted = yield* Fiber.join(collected);
      assert.deepStrictEqual(
        Array.from(emitted).map((settings) => settings.logLevel),
        [DEFAULT_SETTINGS.logLevel, "debug"],
      );
    }).pipe(Effect.provide(layer));
  });

  it.effect(
    "ignores the greeting of an old file without an issue and drops it on the next save",
    () => {
      const old = { schemaVersion: 1, greeting: "Moin", logLevel: "warn" };
      const { store, notifier, layer } = setup({ initial: old });
      return Effect.gen(function* () {
        const service = yield* SettingsService;
        assert.deepStrictEqual(yield* service.current, DEFAULT_SETTINGS);
        assert.deepStrictEqual(yield* service.status, { writable: true, issues: [] });
        assert.deepStrictEqual(notifier.messages(), []);
        assert.deepStrictEqual(store.saved(), []);
        yield* service.update({ logLevel: "info" });
        assert.deepStrictEqual(store.saved(), [{ schemaVersion: 1, logLevel: "info" }]);
      }).pipe(Effect.provide(layer));
    },
  );

  it.effect("rejects an invalid patch without touching the store", () => {
    const { store, layer } = setup();
    return Effect.gen(function* () {
      const service = yield* SettingsService;
      const error = yield* Effect.flip(service.update({ rootFolder: "a/../b" }));
      assert.strictEqual(error._tag, "InvalidSettingsError");
      assert.deepStrictEqual(store.saved(), []);
      assert.deepStrictEqual(yield* service.current, DEFAULT_SETTINGS);
    }).pipe(Effect.provide(layer));
  });

  it.effect("is read-only for settings from a newer version and never writes", () => {
    const { store, notifier, layer } = setup({ initial: { schemaVersion: 2, logLevel: "info" } });
    return Effect.gen(function* () {
      const service = yield* SettingsService;
      assert.strictEqual((yield* service.status).writable, false);
      const error = yield* Effect.flip(service.update({ logLevel: "debug" }));
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
      const error = yield* Effect.flip(service.update({ logLevel: "debug" }));
      assert.deepStrictEqual(
        { tag: error._tag, reason: error._tag === "ReadOnlySettingsError" ? error.reason : null },
        { tag: "ReadOnlySettingsError", reason: "unreadable" },
      );
      assert.deepStrictEqual(store.saved(), []);
    }).pipe(Effect.provide(layer));
  });

  it.effect("exposes the root folder through current and changes, loaded from the file", () => {
    const { store, notifier, layer } = setup({
      initial: { schemaVersion: 1, rootFolder: " /Beirat/WEG/ " },
    });
    return Effect.gen(function* () {
      const service = yield* SettingsService;
      assert.strictEqual((yield* service.current).rootFolder, "Beirat/WEG");
      const first = yield* Stream.runHead(service.changes);
      assert.strictEqual(first._tag === "Some" ? first.value.rootFolder : null, "Beirat/WEG");
      assert.deepStrictEqual(notifier.messages(), []);
      assert.deepStrictEqual(store.saved(), []);
    }).pipe(Effect.provide(layer));
  });

  it.effect("keeps a custom root folder in the file when another setting is saved", () => {
    const { store, layer } = setup({ initial: { schemaVersion: 1, rootFolder: "Beirat/WEG" } });
    return Effect.gen(function* () {
      const service = yield* SettingsService;
      yield* service.update({ logLevel: "debug" });
      assert.deepStrictEqual(store.saved(), [
        { schemaVersion: 1, logLevel: "debug", rootFolder: "Beirat/WEG" },
      ]);
      assert.strictEqual((yield* service.current).rootFolder, "Beirat/WEG");
    }).pipe(Effect.provide(layer));
  });

  it.effect("falls back to the default root folder alone and notifies once", () => {
    const { notifier, layer } = setup({
      initial: { schemaVersion: 1, logLevel: "info", rootFolder: "a/../b" },
    });
    return Effect.gen(function* () {
      const service = yield* SettingsService;
      const current = yield* service.current;
      assert.strictEqual(current.rootFolder, "WEG Manager");
      assert.strictEqual(current.logLevel, "info");
      assert.deepStrictEqual((yield* service.status).issues, [
        { code: "rootFolder.invalid", max: 100 },
      ]);
      assert.strictEqual(notifier.messages().length, 1);
    }).pipe(Effect.provide(layer));
  });

  it.effect("keeps the current value when saving fails", () => {
    const { layer } = setup({ failSave: true });
    return Effect.gen(function* () {
      const service = yield* SettingsService;
      const error = yield* Effect.flip(service.update({ logLevel: "debug" }));
      assert.strictEqual(error._tag, "StorageError");
      assert.deepStrictEqual(yield* service.current, DEFAULT_SETTINGS);
    }).pipe(Effect.provide(layer));
  });

  it.effect("applies concurrent updates in order and keeps both", () => {
    const { store, layer } = setup();
    return Effect.gen(function* () {
      const service = yield* SettingsService;
      yield* Effect.all(
        [service.update({ rootFolder: "Beirat" }), service.update({ logLevel: "debug" })],
        {
          concurrency: "unbounded",
        },
      );
      const current = yield* service.current;
      assert.strictEqual(current.rootFolder, "Beirat");
      assert.strictEqual(current.logLevel, "debug");
      assert.strictEqual(store.saved().length, 2);
      assert.deepStrictEqual(store.saved()[1], {
        schemaVersion: 1,
        logLevel: "debug",
        rootFolder: "Beirat",
      });
    }).pipe(Effect.provide(layer));
  });
});
