import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("obsidian", () => import("@test/obsidian"));

const { createTestPlugin } = await import("@test/obsidian");
const { default: WegManagerPlugin } = await import("../../src/main");

type App = ReturnType<typeof createTestPlugin>["app"];

const listeners = (app: App) => ({
  vault: app.vault.listenerCount(),
  metadataCache: app.metadataCache.listenerCount(),
  workspace: app.workspace.listenerCount(),
});

const NONE = { vault: 0, metadataCache: 0, workspace: 0 };

afterEach(() => {
  vi.restoreAllMocks();
  document.body.replaceChildren();
});

/** Host event listeners belong to the runtime: every way a load ends removes all of them. */
describe("host event listeners across the plugin lifecycle", () => {
  it("are registered on load and all removed on unload, cycle after cycle", async () => {
    const { plugin, registry, app } = createTestPlugin(WegManagerPlugin);
    const cycle = async () => {
      await registry.load();
      expect(listeners(app)).toEqual({ vault: 4, metadataCache: 1, workspace: 2 });
      plugin.unload();
      await vi.waitFor(() => expect(listeners(app)).toEqual(NONE));
    };
    await cycle();
    await cycle();
  });

  it("are all removed when the plugin unloads while settings are still loading", async () => {
    const { plugin, registry, app } = createTestPlugin(WegManagerPlugin);
    registry.holdLoadData();
    const loading = registry.load();
    plugin.unload();
    registry.releaseLoadData();
    await loading;
    await vi.waitFor(() => expect(listeners(app)).toEqual(NONE));
  });

  it("are all removed when bootstrap fails, without unloading the plugin", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { registry, app } = createTestPlugin(WegManagerPlugin);
    registry.failNextAddCommand();
    await expect(registry.load()).rejects.toThrow("addCommand failed");
    expect(listeners(app)).toEqual(NONE);
  });
});
