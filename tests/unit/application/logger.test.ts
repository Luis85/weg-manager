import { assert, describe, it } from "@effect/vitest";
import { Effect, Layer } from "effect";
import { LoggerLive } from "../../../src/application/logger";
import { Logger } from "../../../src/application/ports";
import { SettingsService, SettingsServiceLive } from "../../../src/application/settings-service";
import { inMemoryStore, recordingNotifier, recordingSink } from "../../support/layers";

const setup = (
  options: { readonly developmentMode?: boolean; readonly logLevel?: string } = {},
) => {
  const sink = recordingSink();
  const settings = SettingsServiceLive.pipe(
    Layer.provide(
      Layer.mergeAll(
        inMemoryStore({ initial: options.logLevel ? { logLevel: options.logLevel } : undefined })
          .layer,
        recordingNotifier().layer,
      ),
    ),
  );
  const layer = LoggerLive({ developmentMode: options.developmentMode ?? false }).pipe(
    Layer.provideMerge(Layer.mergeAll(settings, sink.layer)),
  );
  return { sink, layer };
};

describe("LoggerLive", () => {
  it.effect("drops info and debug entries at the default warn level", () => {
    const { sink, layer } = setup();
    return Effect.gen(function* () {
      const logger = yield* Logger;
      for (const level of ["error", "warn", "info", "debug"] as const) {
        yield* logger.log({ level, event: `test.${level}` });
      }
      assert.deepStrictEqual(
        sink.entries().map((entry) => entry.event),
        ["test.error", "test.warn"],
      );
      assert.deepStrictEqual(
        (yield* logger.recent).map((entry) => entry.event),
        ["test.error", "test.warn"],
      );
    }).pipe(Effect.provide(layer));
  });

  it.effect("follows a log level change without reload", () => {
    const { sink, layer } = setup();
    return Effect.gen(function* () {
      const logger = yield* Logger;
      const settings = yield* SettingsService;
      yield* logger.log({ level: "debug", event: "before" });
      yield* settings.update({ logLevel: "debug" });
      yield* logger.log({ level: "debug", event: "after" });
      assert.deepStrictEqual(
        sink.entries().map((entry) => entry.event),
        ["after"],
      );
    }).pipe(Effect.provide(layer));
  });

  it.effect("logs everything in development mode", () => {
    const { sink, layer } = setup({ developmentMode: true, logLevel: "error" });
    return Effect.gen(function* () {
      const logger = yield* Logger;
      yield* logger.log({ level: "debug", event: "dev.debug" });
      assert.deepStrictEqual(
        sink.entries().map((entry) => entry.event),
        ["dev.debug"],
      );
    }).pipe(Effect.provide(layer));
  });

  it.effect("keeps only the last 50 entries with a timestamp", () => {
    const { layer } = setup();
    return Effect.gen(function* () {
      const logger = yield* Logger;
      for (let index = 0; index < 60; index += 1) {
        yield* logger.log({ level: "warn", event: `e.${index}` });
      }
      const recent = yield* logger.recent;
      assert.strictEqual(recent.length, 50);
      assert.strictEqual(recent[0]?.event, "e.10");
      assert.strictEqual(recent[49]?.event, "e.59");
      assert.isNumber(recent[0]?.at);
    }).pipe(Effect.provide(layer));
  });
});
