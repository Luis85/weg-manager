import { assert, describe, it } from "@effect/vitest";
import { Effect } from "effect";
import { vi } from "vitest";
import { DeviceStore } from "../../../../src/application/shell/ports";
import { asObsidianPlugin } from "../../../support/obsidian/real";

vi.mock("obsidian", () => import("@test/obsidian"));

const { createTestPlugin, Plugin } = await import("@test/obsidian");
const { shellAdapters } = await import("../../../../src/infrastructure/obsidian/shell/layers");

class Bare extends Plugin {}

const setup = () => {
  const { plugin, app } = createTestPlugin(Bare);
  return { app, layer: shellAdapters(asObsidianPlugin(plugin)).deviceStore };
};

/** The Obsidian adapter of `DeviceStore`: the vault's local storage, not `data.json`. */
describe("DeviceStore in Obsidian", () => {
  it.effect("keeps a value in the vault's local storage under the plugin id", () => {
    const { app, layer } = setup();
    return Effect.gen(function* () {
      const store = yield* DeviceStore;
      yield* store.write("community", { id: "ahornweg" });
      assert.deepStrictEqual(yield* store.read("community"), { id: "ahornweg" });
      assert.deepStrictEqual(app.loadLocalStorage("weg-manager/community"), {
        value: { id: "ahornweg" },
      });
    }).pipe(Effect.provide(layer));
  });

  it.effect("keeps falsy values, which Obsidian's local storage would clear", () => {
    const { layer } = setup();
    return Effect.gen(function* () {
      const store = yield* DeviceStore;
      yield* store.write("flag", false);
      yield* store.write("count", 0);
      assert.strictEqual(yield* store.read("flag"), false);
      assert.strictEqual(yield* store.read("count"), 0);
    }).pipe(Effect.provide(layer));
  });

  it.effect("clears a key written as undefined", () => {
    const { app, layer } = setup();
    return Effect.gen(function* () {
      const store = yield* DeviceStore;
      yield* store.write("community", "ahornweg");
      yield* store.write("community", undefined);
      assert.isUndefined(yield* store.read("community"));
      assert.isNull(app.loadLocalStorage("weg-manager/community"));
    }).pipe(Effect.provide(layer));
  });

  it.effect("reads undefined for an entry it did not write", () => {
    const { app, layer } = setup();
    return Effect.gen(function* () {
      app.saveLocalStorage("weg-manager/community", "written by hand");
      app.saveLocalStorage("weg-manager/list", ["no", "envelope"]);
      app.localStorage.setRaw("weg-manager/broken", "{not json");
      const store = yield* DeviceStore;
      assert.isUndefined(yield* store.read("community"));
      assert.isUndefined(yield* store.read("list"));
      assert.isUndefined(yield* store.read("broken"));
      assert.isUndefined(yield* store.read("missing"));
    }).pipe(Effect.provide(layer));
  });
});
