import { assert, describe, it } from "@effect/vitest";
import { Effect, Layer, Stream } from "effect";
import {
  SettingsService,
  SettingsServiceLive,
  type SettingsStatus,
} from "../../../../src/application/shell/settings-service";
import { DEFAULT_SETTINGS, type Settings } from "../../../../src/domain/shell/settings";
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

/** Records every value of `changes` and `statusChanges` from now on, including the current one. */
const record = Effect.gen(function* () {
  const service = yield* SettingsService;
  const settings: Settings[] = [];
  const statuses: SettingsStatus[] = [];
  yield* Effect.forkChild(
    Stream.runForEach(service.changes, (next) => Effect.sync(() => settings.push(next))),
  );
  yield* Effect.forkChild(
    Stream.runForEach(service.statusChanges, (next) => Effect.sync(() => statuses.push(next))),
  );
  yield* Effect.yieldNow;
  return { service, settings, statuses };
});

/** Lets the forked recorders take what was published. */
const drain = Effect.repeat(Effect.yieldNow, { times: 5 });

const WRITABLE: SettingsStatus = { writable: true, issues: [] };

describe("SettingsService.reload", () => {
  it.effect("publishes a valid external change once, without saving or notifying", () => {
    const { store, notifier, layer } = setup({ initial: { rootFolder: "Alt" } });
    return Effect.gen(function* () {
      const { service, settings, statuses } = yield* record;
      store.writeExternally({ schemaVersion: 1, rootFolder: "Neu", logLevel: "info" });
      yield* service.reload;
      yield* drain;
      assert.deepStrictEqual(
        settings.map((value) => value.rootFolder),
        ["Alt", "Neu"],
      );
      assert.deepStrictEqual(yield* service.current, {
        ...DEFAULT_SETTINGS,
        schemaVersion: 1,
        rootFolder: "Neu",
        logLevel: "info",
      });
      assert.deepStrictEqual(statuses, [WRITABLE]);
      assert.deepStrictEqual(store.saved(), []);
      assert.deepStrictEqual(notifier.messages(), []);
    }).pipe(Effect.provide(layer));
  });

  it.effect("publishes nothing when the file holds the same values", () => {
    const { store, layer } = setup({ initial: { rootFolder: "Gleich" } });
    return Effect.gen(function* () {
      const { service, settings, statuses } = yield* record;
      store.writeExternally({ schemaVersion: 1, rootFolder: "Gleich" });
      yield* service.reload;
      yield* service.reload;
      yield* drain;
      assert.strictEqual(settings.length, 1);
      assert.strictEqual(statuses.length, 1);
    }).pipe(Effect.provide(layer));
  });

  it.effect("falls back for an invalid field, reports the issue and keeps writing", () => {
    const { store, notifier, layer } = setup();
    return Effect.gen(function* () {
      const { service, statuses } = yield* record;
      store.writeExternally({ rootFolder: "", logLevel: "debug" });
      yield* service.reload;
      yield* drain;
      const current = yield* service.current;
      assert.strictEqual(current.rootFolder, DEFAULT_SETTINGS.rootFolder);
      assert.strictEqual(current.logLevel, "debug");
      assert.strictEqual(statuses.length, 2);
      assert.deepStrictEqual(statuses[1]?.writable, true);
      assert.strictEqual(statuses[1]?.issues.length, 1);
      assert.strictEqual(notifier.messages()[0]?.title, "Einstellungen teilweise zurückgesetzt");
      const updated = yield* service.update({ rootFolder: "Wieder gültig" });
      assert.strictEqual(updated.rootFolder, "Wieder gültig");
    }).pipe(Effect.provide(layer));
  });

  it.effect("switches to read-only for a file from a newer version and never writes it", () => {
    const { store, notifier, layer } = setup({ initial: { rootFolder: "Alt" } });
    return Effect.gen(function* () {
      const { service, statuses } = yield* record;
      store.writeExternally({ schemaVersion: 2, rootFolder: "Zukunft" });
      yield* service.reload;
      yield* drain;
      assert.strictEqual(statuses.at(-1)?.readOnlyReason, "newer-version");
      assert.strictEqual((yield* service.status).writable, false);
      assert.strictEqual(notifier.messages().at(-1)?.title, "Einstellungen schreibgeschützt");
      const error = yield* Effect.flip(service.update({ rootFolder: "Yo" }));
      assert.strictEqual(error._tag, "ReadOnlySettingsError");
      assert.deepStrictEqual(store.saved(), []);
    }).pipe(Effect.provide(layer));
  });

  it.effect("switches to read-only when the file cannot be read, and back once it can", () => {
    const { store, notifier, layer } = setup({ initial: { rootFolder: "Alt" } });
    return Effect.gen(function* () {
      const { service, statuses } = yield* record;
      store.setFailLoad(true);
      yield* service.reload;
      yield* drain;
      assert.deepStrictEqual(statuses.at(-1), {
        writable: false,
        issues: [],
        readOnlyReason: "unreadable",
      });
      assert.strictEqual(notifier.messages().length, 1);
      const error = yield* Effect.flip(service.update({ rootFolder: "Yo" }));
      assert.strictEqual(error._tag, "ReadOnlySettingsError");

      store.setFailLoad(false);
      store.writeExternally({ rootFolder: "Wieder da" });
      yield* service.reload;
      yield* drain;
      assert.deepStrictEqual(statuses.at(-1), WRITABLE);
      assert.strictEqual((yield* service.current).rootFolder, "Wieder da");
      assert.deepStrictEqual(store.saved(), []);
    }).pipe(Effect.provide(layer));
  });

  it.effect("does not repeat a notice for a reload that changes nothing", () => {
    const { store, notifier, layer } = setup({ initial: { schemaVersion: 2 } });
    return Effect.gen(function* () {
      const service = yield* SettingsService;
      assert.strictEqual(notifier.messages().length, 1);
      store.writeExternally({ schemaVersion: 2 });
      yield* service.reload;
      assert.strictEqual(notifier.messages().length, 1);
    }).pipe(Effect.provide(layer));
  });
});
