import { assert, describe, it } from "@effect/vitest";
import { Duration, Effect, Exit, Layer, Scope } from "effect";
import { TestClock } from "effect/testing";
import { vi } from "vitest";
import { AppEvent } from "../../../../src/application/events";
import {
  recordingEventBus,
  recordingLogger,
  recordingNotifier,
  sequentialIncidents,
  testMessages,
} from "../../../support/layers";

vi.mock("obsidian", () => import("@test/obsidian"));

const { Plugin, createTestPlugin } = await import("@test/obsidian");
const { hostEventsLayer, VAULT_READY_DEADLINE } =
  await import("../../../../src/infrastructure/obsidian/shell/events");

class Bare extends Plugin {}

const DEADLINE = Duration.toMillis(VAULT_READY_DEADLINE);
const NEVER = "Nie.md";

const layoutReady = AppEvent.LayoutReady();
const vaultReady = AppEvent.VaultReady();
const changed = (path: string) => AppEvent.MetadataChanged({ path, extension: "md" });
const fallbackLog = (missing: number) => ({
  level: "warn" as const,
  event: "vault.ready.fallback",
  data: { missing },
});

/**
 * A vault of two indexed notes and `NEVER`, a file Obsidian never gets to (the double's
 * `withholdIndex`). The layout is not ready yet unless asked.
 */
const vaultWithAFileNeverIndexed = async (layoutIsReady = false) => {
  const { plugin, app } = createTestPlugin(Bare);
  app.metadataCache.withholdIndex(NEVER);
  for (const path of ["Ahornweg.md", NEVER, "Privat.md"])
    app.vault.seedFile(path, "---\na: 1\n---\n");
  await app.metadataCache.whenIndexed();
  app.workspace.layoutReady = layoutIsReady;
  return { plugin, app };
};

type TestApp = Awaited<ReturnType<typeof vaultWithAFileNeverIndexed>>["app"];

/** The adapter on a scope the test closes itself, under the test's clock. */
const start = (plugin: InstanceType<typeof Bare>, app: TestApp) =>
  Effect.gen(function* () {
    const bus = recordingEventBus();
    const logger = recordingLogger();
    const layer = hostEventsLayer(plugin as never).pipe(
      Layer.provideMerge(
        Layer.mergeAll(
          bus.layer,
          logger.layer,
          recordingNotifier().layer,
          sequentialIncidents(),
          testMessages,
        ),
      ),
    );
    const scope = yield* Scope.make();
    yield* Layer.buildWithScope(layer, scope);
    return {
      bus,
      logger,
      close: Scope.close(scope, Exit.void),
      listeners: () =>
        app.vault.listenerCount() +
        app.metadataCache.listenerCount() +
        app.workspace.listenerCount(),
    };
  });

/** Lets the adapter's fiber take a signal and start its next wait before the clock moves. */
const hop = Effect.repeat(Effect.yieldNow, { times: 10 });
const advance = (millis: number) => Effect.andThen(hop, TestClock.adjust(millis));
const macrotask = Effect.promise(() => new Promise((resolve) => setTimeout(resolve, 0)));
const indexed = (app: TestApp) => Effect.promise(() => app.metadataCache.whenIndexed());

describe("VaultReady after a deadline", () => {
  it.effect("publishes VaultReady when a file never gets a cache entry, and logs how many", () =>
    Effect.gen(function* () {
      const { plugin, app } = yield* Effect.promise(() => vaultWithAFileNeverIndexed());
      const { bus, logger, close } = yield* start(plugin, app);
      app.workspace.markLayoutReady();
      yield* advance(DEADLINE - 1);
      assert.deepStrictEqual(bus.published(), [layoutReady]);
      yield* advance(1);
      assert.deepStrictEqual(bus.published(), [layoutReady, vaultReady]);
      assert.deepStrictEqual(logger.entries(), [fallbackLog(1)]);
      yield* close;
    }),
  );

  it.effect("counts every file still missing, and names none of them", () =>
    Effect.gen(function* () {
      const { plugin, app } = yield* Effect.promise(() => vaultWithAFileNeverIndexed());
      app.metadataCache.withholdIndex("Ordner/Auch nie.md");
      app.vault.seedFile("Ordner/Auch nie.md", "x");
      app.vault.seedFile("Bild.png", "x");
      yield* indexed(app);
      const { logger, close } = yield* start(plugin, app);
      app.workspace.markLayoutReady();
      yield* advance(DEADLINE);
      assert.deepStrictEqual(logger.entries(), [fallbackLog(2)]);
      assert.notInclude(JSON.stringify(logger.entries()), "Nie");
      yield* close;
    }),
  );

  it.effect(
    "publishes without a log when the file is gone by the deadline and no resolved came",
    () =>
      Effect.gen(function* () {
        const { plugin, app } = yield* Effect.promise(() => vaultWithAFileNeverIndexed());
        const { bus, logger, close } = yield* start(plugin, app);
        app.workspace.markLayoutReady();
        const never = app.vault.getFileByPath(NEVER);
        if (never === null) throw new Error(`no ${NEVER}`);
        // Removed from outside, as a file system watcher would: nothing fires `resolved`.
        app.vault.remove(never);
        yield* advance(DEADLINE);
        assert.deepStrictEqual(bus.published(), [
          layoutReady,
          AppEvent.FileDeleted({ path: NEVER, extension: "md" }),
          vaultReady,
        ]);
        assert.deepStrictEqual(logger.entries(), []);
        yield* close;
      }),
  );

  it.effect("counts the deadline from the layout, not from the start of the plugin", () =>
    Effect.gen(function* () {
      const { plugin, app } = yield* Effect.promise(() => vaultWithAFileNeverIndexed());
      const { bus, close } = yield* start(plugin, app);
      yield* advance(DEADLINE * 3);
      assert.deepStrictEqual(bus.published(), []);
      app.workspace.markLayoutReady();
      yield* advance(DEADLINE - 1);
      assert.deepStrictEqual(bus.published(), [layoutReady]);
      yield* advance(1);
      assert.deepStrictEqual(bus.published(), [layoutReady, vaultReady]);
      yield* close;
    }),
  );

  it.effect("waits the deadline again after each resolved, while Obsidian still indexes", () =>
    Effect.gen(function* () {
      const { plugin, app } = yield* Effect.promise(() => vaultWithAFileNeverIndexed());
      const { bus, close } = yield* start(plugin, app);
      app.workspace.markLayoutReady();
      yield* advance(DEADLINE - 1);
      app.metadataCache.trigger("resolved");
      yield* advance(DEADLINE - 1);
      app.metadataCache.trigger("resolved");
      yield* advance(DEADLINE - 1);
      assert.deepStrictEqual(bus.published(), [layoutReady]);
      yield* advance(1);
      assert.deepStrictEqual(bus.published(), [layoutReady, vaultReady]);
      yield* close;
    }),
  );

  it.effect("does nothing when the cache completes first: one VaultReady, no log", () =>
    Effect.gen(function* () {
      const { plugin, app } = yield* Effect.promise(() => vaultWithAFileNeverIndexed());
      const { bus, logger, close } = yield* start(plugin, app);
      app.workspace.markLayoutReady();
      yield* advance(DEADLINE - 1);
      app.metadataCache.restoreIndex(NEVER);
      yield* indexed(app);
      assert.deepStrictEqual(bus.published(), [layoutReady, changed(NEVER), vaultReady]);
      yield* advance(DEADLINE * 3);
      assert.deepStrictEqual(bus.published(), [layoutReady, changed(NEVER), vaultReady]);
      assert.deepStrictEqual(logger.entries(), []);
      yield* close;
    }),
  );

  it.effect("does not start a wait when the cache is complete at the layout", () =>
    Effect.gen(function* () {
      const { plugin, app } = yield* Effect.promise(() => vaultWithAFileNeverIndexed(true));
      app.metadataCache.restoreIndex(NEVER);
      yield* indexed(app);
      const { bus, logger, close } = yield* start(plugin, app);
      assert.deepStrictEqual(bus.published(), [layoutReady, vaultReady]);
      yield* advance(DEADLINE * 3);
      assert.deepStrictEqual(bus.published(), [layoutReady, vaultReady]);
      assert.deepStrictEqual(logger.entries(), []);
      yield* close;
    }),
  );

  it.effect("follows the file when Obsidian indexes it later, without a second VaultReady", () =>
    Effect.gen(function* () {
      const { plugin, app } = yield* Effect.promise(() => vaultWithAFileNeverIndexed());
      const { bus, logger, close } = yield* start(plugin, app);
      app.workspace.markLayoutReady();
      yield* advance(DEADLINE);
      app.metadataCache.restoreIndex(NEVER);
      yield* indexed(app);
      assert.deepStrictEqual(bus.published(), [layoutReady, vaultReady, changed(NEVER)]);
      yield* advance(DEADLINE * 3);
      app.metadataCache.trigger("resolved");
      yield* advance(DEADLINE * 3);
      assert.deepStrictEqual(bus.published(), [layoutReady, vaultReady, changed(NEVER)]);
      assert.deepStrictEqual(logger.entries(), [fallbackLog(1)]);
      yield* close;
    }),
  );

  it.effect("publishes once however long the vault stays incomplete", () =>
    Effect.gen(function* () {
      const { plugin, app } = yield* Effect.promise(() => vaultWithAFileNeverIndexed());
      const { bus, logger, close } = yield* start(plugin, app);
      app.workspace.markLayoutReady();
      for (let round = 0; round < 3; round += 1) {
        yield* advance(DEADLINE);
        app.metadataCache.trigger("resolved");
      }
      assert.deepStrictEqual(bus.published(), [layoutReady, vaultReady]);
      assert.deepStrictEqual(logger.entries(), [fallbackLog(1)]);
      yield* close;
    }),
  );

  it.effect("leaves no listener and no timer behind when the plugin unloads while it waits", () =>
    Effect.gen(function* () {
      const { plugin, app } = yield* Effect.promise(() => vaultWithAFileNeverIndexed());
      const { bus, logger, close, listeners } = yield* start(plugin, app);
      app.workspace.markLayoutReady();
      yield* advance(DEADLINE - 1);
      yield* close;
      assert.strictEqual(listeners(), 0);
      yield* advance(DEADLINE * 3);
      yield* macrotask;
      assert.deepStrictEqual(bus.published(), [layoutReady]);
      assert.deepStrictEqual(logger.entries(), []);
    }),
  );

  it.effect("does nothing when the plugin unloads before the layout is ready", () =>
    Effect.gen(function* () {
      const { plugin, app } = yield* Effect.promise(() => vaultWithAFileNeverIndexed());
      const { bus, logger, close, listeners } = yield* start(plugin, app);
      yield* close;
      assert.strictEqual(listeners(), 0);
      app.workspace.markLayoutReady();
      yield* advance(DEADLINE * 3);
      assert.deepStrictEqual(bus.published(), []);
      assert.deepStrictEqual(logger.entries(), []);
    }),
  );

  it.effect(
    "reports a failing cache read as a defect, and VaultReady still comes with the cache",
    () =>
      Effect.gen(function* () {
        const { plugin, app } = yield* Effect.promise(() => vaultWithAFileNeverIndexed());
        const { bus, logger, close } = yield* start(plugin, app);
        app.vault.failReads = true;
        app.workspace.markLayoutReady();
        yield* advance(DEADLINE);
        assert.deepStrictEqual(bus.published(), [layoutReady]);
        assert.deepStrictEqual(
          logger.entries().map((entry) => entry.event),
          ["defect.reported", "defect.reported"],
        );
        app.vault.failReads = false;
        app.metadataCache.restoreIndex(NEVER);
        yield* indexed(app);
        assert.deepStrictEqual(bus.published(), [layoutReady, changed(NEVER), vaultReady]);
        yield* close;
      }),
  );
});
