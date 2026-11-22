import { afterEach, describe, expect, it, vi } from "vitest";
import { eventually } from "../support/wait";

vi.mock("obsidian", () => import("@test/obsidian"));

const { App, createTestPlugin } = await import("@test/obsidian");
const { default: WegManagerPlugin } = await import("../../src/main");

type TestApp = ReturnType<typeof createTestPlugin>["app"];

const listeners = (app: TestApp) => ({
  vault: app.vault.listenerCount(),
  metadataCache: app.metadataCache.listenerCount(),
  workspace: app.workspace.listenerCount(),
});

const NONE = { vault: 0, metadataCache: 0, workspace: 0 };
const ONE_LOAD = { vault: 4, metadataCache: 2, workspace: 2 };

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
      expect(listeners(app)).toEqual(ONE_LOAD);
      plugin.unload();
      expect(listeners(app)).toEqual(NONE);
    };
    await cycle();
    await cycle();
  });

  it("are removed synchronously by unload, before the runtime has finished disposing", async () => {
    const { plugin, registry, app } = createTestPlugin(WegManagerPlugin);
    await registry.load();
    plugin.unload();
    expect(listeners(app)).toEqual(NONE);
  });

  it("survive the old runtime's late dispose after a quick re-enable", async () => {
    const app = new App();
    const releases = [app.vault, app.metadataCache, app.workspace].map((events) =>
      vi.spyOn(events, "offref"),
    );
    const released = () => releases.reduce((total, spy) => total + spy.mock.calls.length, 0);
    const first = createTestPlugin(WegManagerPlugin, { app });
    await first.registry.load();
    first.plugin.unload();
    // Unload released each of the first load's refs once; the runtime's own finalizer, which runs
    // later and asynchronously, releases each of them again. Wait for that second round.
    const afterUnload = released();
    expect(afterUnload).toBe(ONE_LOAD.vault + ONE_LOAD.metadataCache + ONE_LOAD.workspace);
    const second = createTestPlugin(WegManagerPlugin, { app });
    await second.registry.load();
    await eventually(() => expect(released()).toBe(2 * afterUnload));
    expect(listeners(app)).toEqual(ONE_LOAD);
    second.plugin.unload();
    expect(listeners(app)).toEqual(NONE);
  });

  it("are all removed when the plugin unloads while settings are still loading", async () => {
    const { plugin, registry, app } = createTestPlugin(WegManagerPlugin);
    registry.holdLoadData();
    const loading = registry.load();
    plugin.unload();
    registry.releaseLoadData();
    await loading;
    expect(listeners(app)).toEqual(NONE);
  });

  it("are all removed when bootstrap fails, without unloading the plugin", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { registry, app } = createTestPlugin(WegManagerPlugin);
    registry.failNextAddCommand();
    await expect(registry.load()).rejects.toThrow("addCommand failed");
    expect(listeners(app)).toEqual(NONE);
  });
});
