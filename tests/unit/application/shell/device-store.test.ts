import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { deviceStoreInMemory } from "../../../../src/application/shell/device-store";
import { DeviceStore, type DeviceValue } from "../../../../src/application/shell/ports";

const run = <A>(
  effect: Effect.Effect<A, never, DeviceStore>,
  initial?: Readonly<Record<string, DeviceValue>>,
) => Effect.runPromise(effect.pipe(Effect.provide(deviceStoreInMemory(initial))));

describe("deviceStoreInMemory", () => {
  it("reads undefined for a key that was never written", async () => {
    expect(await run(DeviceStore.use((store) => store.read("community")))).toBeUndefined();
  });

  it("reads back what was written, per key", async () => {
    const read = await run(
      Effect.gen(function* () {
        const store = yield* DeviceStore;
        yield* store.write("community", { id: "ahornweg" });
        yield* store.write("other", 3);
        return [yield* store.read("community"), yield* store.read("other")];
      }),
    );
    expect(read).toEqual([{ id: "ahornweg" }, 3]);
  });

  it("keeps falsy values", async () => {
    const read = await run(
      Effect.gen(function* () {
        const store = yield* DeviceStore;
        yield* store.write("a", false);
        yield* store.write("b", 0);
        yield* store.write("c", "");
        yield* store.write("d", null);
        return [
          yield* store.read("a"),
          yield* store.read("b"),
          yield* store.read("c"),
          yield* store.read("d"),
        ];
      }),
    );
    expect(read).toEqual([false, 0, "", null]);
  });

  it("forgets a key written as undefined", async () => {
    const read = await run(
      Effect.gen(function* () {
        const store = yield* DeviceStore;
        yield* store.write("community", "ahornweg");
        yield* store.write("community", undefined);
        return yield* store.read("community");
      }),
    );
    expect(read).toBeUndefined();
  });

  it("stores a copy, as local storage does", async () => {
    const value = { ids: ["a"] };
    const read = await run(
      Effect.gen(function* () {
        const store = yield* DeviceStore;
        yield* store.write("list", value);
        value.ids.push("b");
        const first = yield* store.read("list");
        (first as { ids: string[] }).ids.push("c");
        return yield* store.read("list");
      }),
    );
    expect(read).toEqual({ ids: ["a"] });
  });

  it("starts from the values it is given", async () => {
    const read = await run(
      DeviceStore.use((store) => store.read("community")),
      { community: "ahornweg" },
    );
    expect(read).toBe("ahornweg");
  });
});
