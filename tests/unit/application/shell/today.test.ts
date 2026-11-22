import { assert, describe, it } from "@effect/vitest";
import { Effect, Fiber, Layer, Stream } from "effect";
import { Today, makeToday, today, todayChanges } from "../../../../src/application/shell";

/** A source of the local day that a test sets, and `makeToday` over it. */
const fromSource = (first: string) =>
  Effect.gen(function* () {
    let day = first;
    const made = yield* makeToday(Effect.sync(() => day));
    return {
      ...made,
      set: (next: string) => {
        day = next;
      },
    };
  });

describe("makeToday", () => {
  it.effect("reads the source on each read and publishes a new day once", () =>
    Effect.gen(function* () {
      const source = yield* fromSource("2026-11-22");
      const seen = yield* Effect.forkChild(Stream.runCollect(Stream.take(source.today.changes, 3)));
      yield* Effect.yieldNow;
      assert.strictEqual(yield* source.today.current, "2026-11-22");
      source.set("2026-11-23");
      assert.strictEqual(yield* source.today.current, "2026-11-23");
      assert.strictEqual(yield* source.today.current, "2026-11-23");
      source.set("2026-11-21");
      assert.strictEqual(yield* source.check, "2026-11-21");
      assert.deepStrictEqual(yield* Fiber.join(seen), ["2026-11-22", "2026-11-23", "2026-11-21"]);
    }),
  );

  it.effect("publishes nothing while the day stays the same", () =>
    Effect.gen(function* () {
      const source = yield* fromSource("2026-11-22");
      const seen: string[] = [];
      yield* Effect.forkChild(
        Stream.runForEach(source.today.changes, (day) => Effect.sync(() => seen.push(day))),
      );
      yield* Effect.yieldNow;
      yield* source.check;
      yield* source.today.current;
      yield* Effect.yieldNow;
      assert.deepStrictEqual(seen, ["2026-11-22"]);
    }),
  );
});

describe("the today use cases", () => {
  it.effect("read the service: the day now, and the day first, then each change", () =>
    Effect.gen(function* () {
      const source = yield* fromSource("2026-11-22");
      const layer = Layer.succeed(Today)(source.today);
      const first = yield* Effect.provide(Stream.runHead(todayChanges), layer);
      source.set("2026-11-23");
      assert.strictEqual(yield* Effect.provide(today, layer), "2026-11-23");
      assert.deepStrictEqual(first._tag, "Some");
      assert.strictEqual(first._tag === "Some" ? first.value : undefined, "2026-11-22");
    }),
  );
});
