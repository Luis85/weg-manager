import { Effect } from "effect";
import { afterEach, describe, expect, it, vi } from "vitest";
import { viewOf } from "../support/obsidian/real";
import { preloadSurface } from "../support/preload";

vi.mock("obsidian", () => import("@test/obsidian"));

const { createTestPlugin, failNextNotice, recordedNotices } = await import("@test/obsidian");
const { default: WegManagerPlugin } = await import("../../src/main");
const { bootstrap, SHELL_VIEW_TYPE } = await import("../../src/bootstrap");
await preloadSurface();

type Registry = ReturnType<typeof createTestPlugin>["registry"];

const counts = (registry: Registry) => ({
  commands: registry.commands.size,
  views: registry.views.size,
  settingTabs: registry.settingTabs.length,
  ribbonIcons: registry.ribbonIcons.length,
});

const EMPTY = { commands: 0, views: 0, settingTabs: 0, ribbonIcons: 0 };
const noticeTexts = () => recordedNotices().map((notice) => notice.text);
const loaded = async (options: { data?: unknown; failLoadData?: boolean } = {}) => {
  const created = createTestPlugin(WegManagerPlugin, options);
  await created.registry.load();
  return created;
};

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  document.body.replaceChildren();
});

describe("plugin lifecycle", () => {
  it("registers two commands, one view, one settings tab and one ribbon icon", async () => {
    const { registry, plugin } = await loaded();
    expect(counts(registry)).toEqual({ commands: 2, views: 1, settingTabs: 1, ribbonIcons: 1 });
    expect([...registry.commands.keys()].toSorted()).toEqual(["copy-diagnostics", "open-view"]);
    expect([...registry.views.keys()]).toEqual([SHELL_VIEW_TYPE]);
    // Obsidian saves this id in workspace.json, so a rename would orphan every saved tab.
    expect(SHELL_VIEW_TYPE).toBe("weg-manager-view");
    for (const command of registry.commands.values()) expect(command.hotkeys).toBeUndefined();
    plugin.unload();
  });

  it("reports a dying command with an incident id and stays usable", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal("navigator", { clipboard: { writeText: () => Promise.resolve() } });
    const { registry, plugin } = await loaded();
    failNextNotice();
    await registry.runCommand("copy-diagnostics");
    expect(noticeTexts()).toEqual([expect.stringMatching(/Unerwarteter Fehler.*[0-9A-Z]{6}/s)]);
    expect(error).toHaveBeenCalledTimes(1);
    expect(error.mock.calls[0]?.[1]).toBe("defect.reported");
    await registry.runCommand("copy-diagnostics");
    expect(noticeTexts().at(-1)).toContain("Diagnose kopiert");
    plugin.unload();
  });

  it("copies the diagnostics report and confirms", async () => {
    const writeText = vi.fn<(text: string) => Promise<void>>().mockResolvedValue();
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    const { registry, plugin } = await loaded();
    await registry.runCommand("copy-diagnostics");
    expect(writeText).toHaveBeenCalledTimes(1);
    expect(writeText.mock.calls[0]?.[0]).toContain("Plugin-Version: 0.1.0");
    expect(noticeTexts().at(-1)).toContain("Diagnose kopiert");
    plugin.unload();
  });

  it("shows the clipboard message when copying fails", async () => {
    vi.stubGlobal("navigator", { clipboard: { writeText: () => Promise.reject(new Error("no")) } });
    const { registry, plugin } = await loaded();
    await registry.runCommand("copy-diagnostics");
    expect(noticeTexts().at(-1)).toContain("Diagnose nicht kopiert");
    plugin.unload();
  });

  it("adds the ribbon icon once, also for an old data.json that still has showRibbonIcon", async () => {
    const { registry, plugin, app } = await loaded({ data: { showRibbonIcon: false } });
    expect(registry.ribbonIcons.map(({ icon, title }) => ({ icon, title }))).toEqual([
      { icon: "layout-dashboard", title: "WEG Manager" },
    ]);
    app.workspace.leftRibbon.onChange();
    expect(document.querySelectorAll('[aria-label="WEG Manager"]')).toHaveLength(1);
    expect(noticeTexts()).toEqual([]);
    plugin.unload();
  });

  it("releases everything on unload", async () => {
    const { registry, plugin } = await loaded();
    plugin.unload();
    expect(counts(registry)).toEqual(EMPTY);
    expect(document.body.children).toHaveLength(0);
  });

  it("behaves the same on a second load and leaves nothing after the second unload", async () => {
    const { registry, plugin } = await loaded();
    const first = counts(registry);
    plugin.unload();
    await registry.load();
    expect(counts(registry)).toEqual(first);
    plugin.unload();
    expect(counts(registry)).toEqual(EMPTY);
    expect(document.body.children).toHaveLength(0);
  });

  it("registers nothing when unloaded while settings are still loading", async () => {
    const { registry, plugin } = createTestPlugin(WegManagerPlugin);
    registry.holdLoadData();
    const loading = registry.load();
    plugin.unload();
    registry.releaseLoadData();
    await loading;
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(counts(registry)).toEqual(EMPTY);
    expect(document.body.children).toHaveLength(0);
  });

  it("loads read-only with one notice when data.json is unreadable", async () => {
    const { registry, plugin } = await loaded({ failLoadData: true });
    expect(registry.commands.size).toBe(2);
    expect(noticeTexts()).toEqual([expect.stringContaining("schreibgeschützt")]);
    plugin.unload();
  });

  it("disposes what it created and shows a plain defect message when a registration throws", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { registry, app } = createTestPlugin(WegManagerPlugin);
    registry.failNextAddCommand();
    await expect(registry.load()).rejects.toThrow("addCommand failed");
    // The ribbon icon comes after the commands, so a failure there never adds one; Obsidian
    // would not remove it after a failed onload. A re-render of the ribbon shows none either.
    app.workspace.leftRibbon.onChange();
    expect(app.workspace.leftRibbon.items).toEqual([]);
    expect(counts(registry)).toEqual(EMPTY);
    expect(document.body.children).toHaveLength(0);
    expect(noticeTexts()).toEqual([
      expect.stringMatching(/Unerwarteter Fehler in WEG Manager.*[0-9A-Z]{6}/s),
    ]);
    expect(noticeTexts()[0]).not.toContain("addCommand");
  });

  it("removes the commands it added when a later registration throws", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { registry, plugin } = createTestPlugin(WegManagerPlugin);
    const remove = vi.spyOn(plugin, "removeCommand");
    vi.spyOn(plugin, "addRibbonIcon").mockImplementation(() => {
      throw new Error("ribbon failed");
    });
    await expect(registry.load()).rejects.toThrow("ribbon failed");
    expect(remove.mock.calls.map(([id]) => id).toSorted()).toEqual([
      "copy-diagnostics",
      "open-view",
    ]);
    expect(counts(registry)).toEqual(EMPTY);
    expect(noticeTexts()).toEqual([
      expect.stringMatching(/Unerwarteter Fehler in WEG Manager.*[0-9A-Z]{6}/s),
    ]);
  });

  it("removes the command it added when the second one fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { registry } = createTestPlugin(WegManagerPlugin);
    registry.failNextAddCommand({ after: 1 });
    await expect(registry.load()).rejects.toThrow("addCommand failed");
    expect(counts(registry)).toEqual(EMPTY);
  });
});

describe("bootstrap handle", () => {
  it("disposes the runtime", async () => {
    const { plugin } = createTestPlugin(WegManagerPlugin);
    const handle = await bootstrap(plugin);
    await handle.runtime.runPromise(Effect.void);
    await handle.dispose();
    await expect(handle.runtime.runPromise(Effect.void)).rejects.toThrow(/dispos/i);
  });

  it("disposes the runtime and rethrows when one release throws", async () => {
    const { plugin, app } = createTestPlugin(WegManagerPlugin);
    const handle = await bootstrap(plugin);
    const leaf = app.workspace.getLeaf(true);
    await leaf.setViewState({ type: SHELL_VIEW_TYPE });
    const { contentEl } = viewOf<{ contentEl: HTMLElement }>(leaf);
    vi.spyOn(contentEl.classList, "remove").mockImplementation(() => {
      throw new Error("surface release failed");
    });
    await expect(handle.dispose()).rejects.toThrow("surface release failed");
    await expect(handle.runtime.runPromise(Effect.void)).rejects.toThrow(/dispos/i);
  });

  it("keeps the commands and ribbon icon of a quick re-enable when the old load is disposed late", async () => {
    const { plugin, registry } = createTestPlugin(WegManagerPlugin);
    const first = await bootstrap(plugin);
    const second = await bootstrap(plugin);
    await first.dispose();
    expect(registry.commands.size).toBe(2);
    expect(registry.ribbonIcons).toHaveLength(1);
    await second.dispose();
  });
});
