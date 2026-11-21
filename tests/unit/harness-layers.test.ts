import { assert, describe, it } from "@effect/vitest";
import { Effect, Exit, Fiber } from "effect";
import { TestClock } from "effect/testing";
import { countMarkdownFiles, updateGreeting } from "../../src/application/use-cases";
import type { UserMessage } from "../../src/application/user-messages";
import {
  HARNESS_FILE_COUNT,
  SLOW_MS,
  harnessLayer,
  parseScenario,
  type Scenario,
} from "../../harness/layers";

const count = (scenario: Scenario) =>
  Effect.exit(countMarkdownFiles).pipe(Effect.provide(harnessLayer(scenario)));

describe("harnessLayer", () => {
  it.effect("counts 42 files by default and 0 when empty", () =>
    Effect.gen(function* () {
      assert.deepStrictEqual(yield* count("default"), Exit.succeed(HARNESS_FILE_COUNT));
      assert.deepStrictEqual(yield* count("empty"), Exit.succeed(0));
    }),
  );

  it.effect("fails the count with VaultReadError in the error scenario", () =>
    Effect.gen(function* () {
      const exit = yield* count("error");
      assert.isTrue(Exit.isFailure(exit));
      const error = yield* Effect.flip(
        countMarkdownFiles.pipe(Effect.provide(harnessLayer("error"))),
      );
      assert.strictEqual(error._tag, "VaultReadError");
    }),
  );

  it.effect("answers after 1500 ms in the slow scenario", () =>
    Effect.gen(function* () {
      const fiber = yield* Effect.forkChild(
        countMarkdownFiles.pipe(Effect.provide(harnessLayer("slow"))),
      );
      yield* TestClock.adjust(SLOW_MS - 1);
      assert.isUndefined(fiber.pollUnsafe());
      yield* TestClock.adjust(1);
      assert.strictEqual(yield* Fiber.join(fiber), HARNESS_FILE_COUNT);
    }),
  );

  it.effect("rejects greeting updates as read-only and says so on load", () =>
    Effect.gen(function* () {
      const messages: UserMessage[] = [];
      const layer = harnessLayer("readonly", { notify: (message) => messages.push(message) });
      const error = yield* Effect.flip(updateGreeting("Moin").pipe(Effect.provide(layer)));
      assert.strictEqual(error._tag, "ReadOnlySettingsError");
      assert.strictEqual(messages[0]?.title, "Einstellungen schreibgeschützt");
    }),
  );

  it.effect("saves greetings in the default scenario", () =>
    Effect.gen(function* () {
      const settings = yield* updateGreeting("Moin").pipe(Effect.provide(harnessLayer("default")));
      assert.strictEqual(settings.greeting, "Moin");
    }),
  );

  it.effect("reports a clipboard failure as ClipboardError", () =>
    Effect.gen(function* () {
      const { Clipboard } = yield* Effect.promise(() => import("../../src/application/ports"));
      const layer = harnessLayer("default");
      const error = yield* Effect.flip(
        Clipboard.use((clipboard) => clipboard.write("x")).pipe(Effect.provide(layer)),
      );
      assert.strictEqual(error._tag, "ClipboardError");
      const writes: string[] = [];
      const ok = harnessLayer("default", {
        writeClipboard: async (text) => {
          writes.push(text);
        },
      });
      yield* Clipboard.use((clipboard) => clipboard.write("y")).pipe(Effect.provide(ok));
      assert.deepStrictEqual(writes, ["y"]);
    }),
  );
});

describe("parseScenario", () => {
  it("accepts known scenarios and falls back to default", () => {
    assert.strictEqual(parseScenario("slow"), "slow");
    assert.strictEqual(parseScenario("readonly"), "readonly");
    assert.strictEqual(parseScenario("nope"), "default");
    assert.strictEqual(parseScenario(null), "default");
  });
});
