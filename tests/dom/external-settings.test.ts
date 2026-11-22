import { flushPromises } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { eventually } from "../support/wait";
import { preloadSurface } from "../support/preload";

vi.mock("obsidian", () => import("@test/obsidian"));

const { createTestPlugin, recordedNotices, settingsIn } = await import("@test/obsidian");
const { default: WegManagerPlugin } = await import("../../src/main");
await preloadSurface();

type Select = { selectEl: HTMLSelectElement; disabled?: boolean };

const settle = async () => {
  await flushPromises();
  await new Promise((resolve) => setTimeout(resolve, 0));
  await flushPromises();
};

const INTRO = "[data-testid=communities-intro]";

/** A loaded plugin with its view open, and the way Obsidian reports a changed `data.json`. */
const withOpenView = async (data: unknown = { rootFolder: "Beirat" }) => {
  const created = createTestPlugin(WegManagerPlugin, { data });
  await created.registry.load();
  await created.registry.runCommand("open-view");
  await settle();
  // The screen loads lazily, the first time a view shows it.
  await eventually(() => expect(document.querySelector(INTRO)).not.toBeNull());
  const external = created.plugin;
  const arrive = async (next: unknown) => {
    created.registry.writeExternally(next);
    await external.onExternalSettingsChange();
    await settle();
  };
  /** The settings tab's rows (names) and its log level dropdown, as Obsidian renders them now. */
  const tab = () => {
    const settingsTab = created.registry.settingTabs[0];
    if (settingsTab === undefined) throw new Error("no settings tab");
    settingsTab.display();
    const rows = settingsIn(settingsTab.containerEl);
    const select = rows[0]?.components[0] as Select | undefined;
    return {
      names: rows.map((row) => row.nameEl.textContent),
      value: select?.selectEl.value,
      disabled: select?.selectEl.disabled,
    };
  };
  return { ...created, external, arrive, tab };
};

const intro = () => document.querySelector(INTRO)?.textContent.trim();
const noticeTexts = () => recordedNotices().map((notice) => notice.text);

afterEach(() => {
  vi.restoreAllMocks();
  document.body.replaceChildren();
});

describe("settings changed outside Obsidian", () => {
  it("shows the new root folder in the open view without writing data.json", async () => {
    const { plugin, registry, arrive } = await withOpenView();
    expect(intro()).toBe("Jede Gemeinschaft ist eine Notiz im Ordner „Beirat/Gemeinschaften“.");
    await arrive({ rootFolder: "Von außen" });
    expect(intro()).toBe("Jede Gemeinschaft ist eine Notiz im Ordner „Von außen/Gemeinschaften“.");
    expect(registry.saved).toEqual([]);
    expect(noticeTexts()).toEqual([]);
    plugin.unload();
  });

  it("turns the settings read-only for a file from a newer version and never writes it", async () => {
    const { plugin, registry, arrive, tab } = await withOpenView();
    expect(tab()).toMatchObject({ names: ["Protokollstufe"], disabled: false });
    await arrive({ schemaVersion: 2, logLevel: "debug" });
    expect(tab()).toMatchObject({
      names: ["Protokollstufe", "Einstellungen schreibgeschützt"],
      disabled: true,
    });
    expect(noticeTexts()).toEqual([expect.stringContaining("schreibgeschützt")]);
    expect(registry.saved).toEqual([]);
    plugin.unload();
  });

  it("turns read-only when data.json cannot be read, and writable again once it can", async () => {
    const { plugin, registry, external, arrive, tab } = await withOpenView();
    registry.setFailLoadData(true);
    await external.onExternalSettingsChange();
    await settle();
    expect(tab().disabled).toBe(true);
    expect(noticeTexts()).toEqual([expect.stringContaining("nicht lesbar")]);
    registry.setFailLoadData(false);
    await arrive({ rootFolder: "Wieder da", logLevel: "info" });
    expect(tab()).toMatchObject({ names: ["Protokollstufe"], value: "info", disabled: false });
    expect(intro()).toContain("„Wieder da/Gemeinschaften“");
    expect(registry.saved).toEqual([]);
    plugin.unload();
  });

  it("waits for a load that is still reading settings, then reloads", async () => {
    const { plugin, registry } = createTestPlugin(WegManagerPlugin, { data: { logLevel: "info" } });
    registry.holdLoadData();
    const loading = registry.load();
    registry.writeExternally({ logLevel: "debug" });
    const reloading = plugin.onExternalSettingsChange();
    registry.releaseLoadData();
    await loading;
    await reloading;
    const settingsTab = registry.settingTabs[0];
    settingsTab?.display();
    const select = settingsIn(settingsTab?.containerEl ?? document.body)[0]?.components[0] as
      Select | undefined;
    expect(select?.selectEl.value).toBe("debug");
    plugin.unload();
  });

  it("does nothing once the plugin is unloaded", async () => {
    const { plugin, registry, external } = await withOpenView();
    plugin.unload();
    const loadData = vi.spyOn(plugin, "loadData");
    registry.writeExternally({ rootFolder: "Zu spät" });
    await expect(external.onExternalSettingsChange()).resolves.toBeUndefined();
    expect(loadData).not.toHaveBeenCalled();
  });

  it("does nothing after a failed bootstrap", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { plugin, registry } = createTestPlugin(WegManagerPlugin);
    registry.failNextAddCommand();
    await expect(registry.load()).rejects.toThrow("addCommand failed");
    const notices = noticeTexts().length;
    await expect(plugin.onExternalSettingsChange()).resolves.toBeUndefined();
    expect(noticeTexts()).toHaveLength(notices);
  });
});
