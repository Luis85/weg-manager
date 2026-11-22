import { assert, describe, it } from "@effect/vitest";
import { Context, Effect, Exit, Layer, Option, Scope, Stream } from "effect";
import { Today } from "../../../../src/application/shell";
import { memoryToday } from "../../../../src/infrastructure/memory/shell";
import { START, todayContract } from "../../../support/shell/contract-today";

todayContract("in memory", () => {
  const memory = memoryToday(START);
  return { layer: memory.layer, moveTo: memory.set, pass: () => {} };
});

/** The day a service last published: the head of its changes. */
const published = (service: Today["Service"]) =>
  Effect.map(Stream.runHead(service.changes), Option.getOrThrow);

describe("memoryToday", () => {
  it.effect("tells every service built from it, and none whose scope has closed", () => {
    const memory = memoryToday(START);
    return Effect.gen(function* () {
      const first = yield* Scope.make();
      const second = yield* Scope.make();
      const one = Context.get(yield* Layer.buildWithScope(memory.layer, first), Today);
      const two = Context.get(yield* Layer.buildWithScope(memory.layer, second), Today);
      memory.set("2026-11-23");
      assert.strictEqual(yield* published(one), "2026-11-23");
      yield* Scope.close(first, Exit.void);
      memory.set("2026-11-24");
      assert.strictEqual(yield* published(one), "2026-11-23");
      assert.strictEqual(yield* published(two), "2026-11-24");
      yield* Scope.close(second, Exit.void);
    });
  });
});
