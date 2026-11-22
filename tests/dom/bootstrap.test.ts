import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("obsidian", () => import("@test/obsidian"));

const { createTestPlugin, failNextNotice, Platform, recordedNotices } =
  await import("@test/obsidian");
const { default: WegManagerPlugin } = await import("../../src/main");
const { bootstrap } = await import("../../src/bootstrap");

const noticeTexts = () => recordedNotices().map((notice) => notice.text);

/** The events the plugin wrote to the console, with the method that wrote them. */
const consoleEvents = (
  spies: Record<"debug" | "warn" | "error", { mock: { calls: unknown[][] } }>,
) =>
  Object.entries(spies).flatMap(([method, spy]) =>
    spy.mock.calls.map((call) => `${method}:${String(call[1])}`),
  );

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  document.body.replaceChildren();
});

const spyConsole = () => ({
  debug: vi.spyOn(console, "debug").mockImplementation(() => {}),
  warn: vi.spyOn(console, "warn").mockImplementation(() => {}),
  error: vi.spyOn(console, "error").mockImplementation(() => {}),
});

describe("the log level of a plugin load", () => {
  it("logs every level whatever the log level setting says", async () => {
    vi.stubEnv("MODE", "development");
    const spies = spyConsole();
    const { plugin, registry } = createTestPlugin(WegManagerPlugin, {
      data: { logLevel: "error" },
    });
    await registry.load();
    expect(consoleEvents(spies)).toContain("debug:plugin.loaded");
    plugin.unload();
  });

  it("keeps to the log level setting in a production build", async () => {
    vi.stubEnv("MODE", "production");
    const spies = spyConsole();
    const { plugin, registry } = createTestPlugin(WegManagerPlugin, {
      data: { logLevel: "error" },
    });
    await registry.load();
    expect(consoleEvents(spies)).toEqual([]);
    plugin.unload();
  });

  it("logs the load in a production build once the log level setting allows info", async () => {
    vi.stubEnv("MODE", "production");
    const spies = spyConsole();
    const { plugin, registry } = createTestPlugin(WegManagerPlugin, { data: { logLevel: "info" } });
    await registry.load();
    expect(consoleEvents(spies)).toContain("debug:plugin.loaded");
    plugin.unload();
  });
});

describe("the diagnostics report", () => {
  it("names the platform Obsidian runs on", async () => {
    const original = { ...Platform };
    Object.assign(Platform, { isLinux: false, isWin: true });
    const writeText = vi.fn<(text: string) => Promise<void>>().mockResolvedValue();
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    try {
      const { plugin, registry } = createTestPlugin(WegManagerPlugin);
      await registry.load();
      await registry.runCommand("copy-diagnostics");
      expect(writeText.mock.calls[0]?.[0]).toContain("Plattform: desktop-windows");
      plugin.unload();
    } finally {
      Object.assign(Platform, original);
    }
  });
});

describe("a handle that was disposed", () => {
  it("leaves data.json, the notices and the settings tab alone when settings change outside", async () => {
    const { plugin, registry } = createTestPlugin(WegManagerPlugin);
    const handle = await bootstrap(plugin);
    const [tab] = registry.settingTabs;
    if (tab === undefined) throw new Error("no settings tab registered");
    tab.display();
    const rowBefore = tab.containerEl.firstElementChild;
    expect(rowBefore).not.toBeNull();
    await handle.dispose();
    const loadData = vi.spyOn(plugin, "loadData");
    registry.writeExternally({ logLevel: "debug" });
    await expect(handle.reloadSettings()).resolves.toBeUndefined();
    expect(loadData).not.toHaveBeenCalled();
    expect(noticeTexts()).toEqual([]);
    expect(tab.containerEl.firstElementChild).toBe(rowBefore);
  });

  it("is also quiet when it is disposed twice", async () => {
    const { plugin } = createTestPlugin(WegManagerPlugin);
    const handle = await bootstrap(plugin);
    await handle.dispose();
    await expect(handle.dispose()).resolves.toBeUndefined();
  });
});

describe("a failed load whose own report fails", () => {
  it("still shows the user one defect message with an incident code and logs it", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const { registry } = createTestPlugin(WegManagerPlugin);
    registry.failNextAddCommand();
    failNextNotice();
    await expect(registry.load()).rejects.toThrow("addCommand failed");
    expect(noticeTexts()).toEqual([
      expect.stringMatching(/Unerwarteter Fehler in WEG Manager.*[0-9A-Z]{6}/s),
    ]);
    const last = error.mock.calls.at(-1);
    expect(last?.[1]).toBe("plugin.unload.failed");
    expect(String((last?.[2] as { incidentId?: unknown } | undefined)?.incidentId)).toMatch(
      /^[0-9A-Z]{6}$/,
    );
  });
});
