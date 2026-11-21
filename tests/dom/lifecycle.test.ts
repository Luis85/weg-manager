import { Effect } from "effect";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("obsidian", () => import("@test/obsidian"));

const { createTestPlugin, failNextNotice, recordedNotices, settingsIn } =
  await import("@test/obsidian");
const { default: WegManagerPlugin } = await import("../../src/main");
const { bootstrap, SHELL_VIEW_TYPE } = await import("../../src/bootstrap");

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
  it("registers three commands, one view, one settings tab and one ribbon icon", async () => {
    const { registry, plugin } = await loaded();
    expect(counts(registry)).toEqual({ commands: 3, views: 1, settingTabs: 1, ribbonIcons: 1 });
    expect([...registry.commands.keys()].toSorted()).toEqual([
      "copy-diagnostics",
      "open-view",
      "show-greeting",
    ]);
    expect([...registry.views.keys()]).toEqual([SHELL_VIEW_TYPE]);
    for (const command of registry.commands.values()) expect(command.hotkeys).toBeUndefined();
    plugin.unload();
  });

  it("shows the greeting", async () => {
    const { registry, plugin } = await loaded({ data: { greeting: "Moin" } });
    await registry.runCommand("show-greeting");
    expect(noticeTexts()).toEqual([expect.stringContaining("Moin")]);
    plugin.unload();
  });

  it("reports a dying command with an incident id and stays usable", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const { registry, plugin } = await loaded({ data: { greeting: "Moin" } });
    failNextNotice();
    await registry.runCommand("show-greeting");
    expect(noticeTexts()).toEqual([expect.stringMatching(/Unerwarteter Fehler.*[0-9A-Z]{6}/s)]);
    expect(error).toHaveBeenCalledTimes(1);
    expect(error.mock.calls[0]?.[1]).toBe("defect.reported");
    await registry.runCommand("show-greeting");
    expect(noticeTexts().at(-1)).toContain("Moin");
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

  it("hides and shows the ribbon icon from the settings tab without reload", async () => {
    const { registry, plugin } = await loaded();
    const tab = registry.settingTabs[0];
    tab?.display();
    await vi.waitFor(() => expect(settingsIn(tab!.containerEl)).toHaveLength(3));
    const toggle = settingsIn(tab!.containerEl)[1]?.components[0] as {
      simulateToggle(): unknown;
    };
    toggle.simulateToggle();
    await vi.waitFor(() => expect(registry.ribbonIcons).toHaveLength(0));
    toggle.simulateToggle();
    await vi.waitFor(() => expect(registry.ribbonIcons).toHaveLength(1));
    plugin.unload();
    expect(registry.ribbonIcons).toHaveLength(0);
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
    expect(registry.commands.size).toBe(3);
    expect(noticeTexts()).toEqual([expect.stringContaining("schreibgeschützt")]);
    plugin.unload();
  });

  it("disposes what it created and shows a plain defect message when a registration throws", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { registry } = createTestPlugin(WegManagerPlugin);
    registry.failNextAddCommand();
    await expect(registry.load()).rejects.toThrow("addCommand failed");
    expect(counts(registry)).toEqual(EMPTY);
    expect(noticeTexts()).toEqual([
      expect.stringMatching(/Unerwarteter Fehler in WEG Manager.*[0-9A-Z]{6}/s),
    ]);
    expect(noticeTexts()[0]).not.toContain("addCommand");
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
    const { plugin, registry } = createTestPlugin(WegManagerPlugin);
    const handle = await bootstrap(plugin);
    const icon = registry.ribbonIcons[0]?.el;
    expect(icon).toBeDefined();
    vi.spyOn(icon!, "remove").mockImplementation(() => {
      throw new Error("ribbon release failed");
    });
    await expect(handle.dispose()).rejects.toThrow("ribbon release failed");
    await expect(handle.runtime.runPromise(Effect.void)).rejects.toThrow(/dispos/i);
  });

  it("keeps the commands of a quick re-enable when the old load is disposed late", async () => {
    const { plugin, registry } = createTestPlugin(WegManagerPlugin);
    const first = await bootstrap(plugin);
    const second = await bootstrap(plugin);
    await first.dispose();
    expect(registry.commands.size).toBe(3);
    await second.dispose();
  });
});
