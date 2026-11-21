import { assert, describe, it } from "@effect/vitest";
import { Effect, Layer } from "effect";
import { reportDefect } from "../../../src/application/defects";
import {
  recordingLogger,
  recordingNotifier,
  sequentialIncidents,
  testMessages,
} from "../../support/layers";

describe("reportDefect", () => {
  it.effect("logs the cause once, shows only the incident id and returns the message", () => {
    const logger = recordingLogger();
    const notifier = recordingNotifier();
    const layer = Layer.mergeAll(logger.layer, notifier.layer, sequentialIncidents(), testMessages);
    const cause = new Error("secret /vault/a.md");
    cause.stack = "Error: secret /vault/a.md\n    at run (plugin:weg-manager:12:34)";
    return Effect.gen(function* () {
      const message = yield* reportDefect(cause);

      const entries = logger.entries();
      assert.strictEqual(entries.length, 1);
      assert.strictEqual(entries[0]?.level, "error");
      assert.strictEqual(entries[0]?.incidentId, "T-1");
      assert.strictEqual(entries[0]?.event, "defect.reported");
      assert.deepStrictEqual(entries[0]?.error, {
        name: "Error",
        message: "secret /vault/a.md",
        frames: ["run (plugin:weg-manager:12:34)"],
      });
      assert.isUndefined(entries[0]?.data);

      assert.deepStrictEqual(notifier.messages(), [message]);
      assert.include(message.detail, "T-1");
      assert.notInclude(message.detail, "secret");
      assert.notInclude(message.title, "secret");
    }).pipe(Effect.provide(layer));
  });

  it.effect("gives every report its own incident id", () => {
    const logger = recordingLogger();
    const layer = Layer.mergeAll(
      logger.layer,
      recordingNotifier().layer,
      sequentialIncidents(),
      testMessages,
    );
    return Effect.gen(function* () {
      yield* reportDefect("first");
      yield* reportDefect("second");
      assert.deepStrictEqual(
        logger.entries().map((entry) => entry.incidentId),
        ["T-1", "T-2"],
      );
    }).pipe(Effect.provide(layer));
  });

  it.effect("logs name, message and frames of an Error and the text of anything else", () => {
    const logger = recordingLogger();
    const layer = Layer.mergeAll(
      logger.layer,
      recordingNotifier().layer,
      sequentialIncidents(),
      testMessages,
    );
    const withStack = new TypeError("bad");
    withStack.stack = "TypeError: bad\n    at here (main.js:1:2)";
    const withoutStack = new RangeError("far");
    withoutStack.stack = "";
    return Effect.gen(function* () {
      yield* reportDefect(withStack);
      yield* reportDefect(withoutStack);
      yield* reportDefect(42);
      assert.deepStrictEqual(
        logger.entries().map((entry) => entry.error),
        [
          { name: "TypeError", message: "bad", frames: ["here (main.js:1:2)"] },
          { name: "RangeError", message: "far", frames: [] },
          { name: "NonError", message: "42", frames: [] },
        ],
      );
    }).pipe(Effect.provide(layer));
  });
});
