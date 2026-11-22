import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("obsidian", () => import("@test/obsidian"));

const { createTestPlugin, recordedNotices, settingsIn } = await import("@test/obsidian");
const { default: WegManagerPlugin } = await import("../../../../src/main");

type Select = { selectEl: HTMLSelectElement };
type Control = { disabled: boolean };
type External = { onExternalSettingsChange(): Promise<void> };

const openTab = async (data?: unknown) => {
  const { registry, plugin } = createTestPlugin(WegManagerPlugin, { data });
  await registry.load();
  const [tab] = registry.settingTabs;
  if (tab === undefined) throw new Error("no settings tab registered");
  tab.display();
  await vi.waitFor(() => expect(settingsIn(tab.containerEl).length).toBeGreaterThanOrEqual(1));
  return { registry, plugin, tab, rows: () => settingsIn(tab.containerEl) };
};

const control = <T>(rows: { components: unknown[] }[], index: number): T => {
  const component = rows[index]?.components[0];
  if (component === undefined) throw new Error(`no control in row ${index}`);
  return component as T;
};

afterEach(() => {
  document.body.replaceChildren();
});

describe("settings tab", () => {
  it("renders only the plugin settings: the greeting is edited in the view (PBI-49)", async () => {
    const { rows, tab, plugin } = await openTab({ greeting: "Moin" });
    expect(rows().map((row) => row.nameEl.textContent)).toEqual(["Protokollstufe"]);
    expect(tab.containerEl.querySelector("input")).toBeNull();
    plugin.unload();
  });

  it("labels the log levels in German and keeps the stored values", async () => {
    const { rows, plugin } = await openTab({ logLevel: "info" });
    const { selectEl } = control<Select>(rows(), 0);
    expect([...selectEl.options].map((option) => [option.value, option.text])).toEqual([
      ["error", "Fehler"],
      ["warn", "Warnungen"],
      ["info", "Informationen"],
      ["debug", "Details"],
    ]);
    expect(selectEl.value).toBe("info");
    plugin.unload();
  });

  it("saves the log level", async () => {
    const { rows, registry, plugin } = await openTab();
    control<{ simulateSelect(value: string): unknown }>(rows(), 0).simulateSelect("debug");
    await vi.waitFor(() => expect(registry.saved.at(-1)).toMatchObject({ logLevel: "debug" }));
    plugin.unload();
  });

  it("disables every control and explains why when settings are read-only", async () => {
    const { rows, tab, plugin } = await openTab({ schemaVersion: 2 });
    for (const row of rows().slice(0, 1)) {
      expect(row.components.every((component: Control) => component.disabled)).toBe(true);
    }
    expect(tab.containerEl.textContent).toContain("neueren Version");
    plugin.unload();
  });

  it("shows a log level that arrives from outside while it is open", async () => {
    const { rows, registry, plugin } = await openTab({ logLevel: "warn" });
    registry.writeExternally({ logLevel: "debug" });
    await (plugin as unknown as External).onExternalSettingsChange();
    expect(control<Select>(rows(), 0).selectEl.value).toBe("debug");
    expect(registry.saved).toEqual([]);
    plugin.unload();
  });

  it("turns read-only while open when a file from a newer version arrives", async () => {
    const { rows, tab, registry, plugin } = await openTab({ greeting: "Moin" });
    registry.writeExternally({ schemaVersion: 2, greeting: "Zukunft" });
    await (plugin as unknown as External).onExternalSettingsChange();
    for (const row of rows().slice(0, 1)) {
      expect(row.components.every((component: Control) => component.disabled)).toBe(true);
    }
    expect(tab.containerEl.textContent).toContain("neueren Version");
    expect(registry.saved).toEqual([]);
    plugin.unload();
  });

  it("answers only for its own control: another key has no value and changes nothing", async () => {
    const { tab, registry, plugin } = await openTab({ logLevel: "info" });
    expect(tab.getControlValue("logLevel")).toBe("info");
    expect(tab.getControlValue("rootFolder")).toBeUndefined();
    await tab.setControlValue("rootFolder", "debug");
    expect(registry.saved).toEqual([]);
    expect(recordedNotices()).toEqual([]);
    expect(tab.getControlValue("logLevel")).toBe("info");
    plugin.unload();
  });

  it("does not duplicate rows when shown again", async () => {
    const { rows, tab, plugin } = await openTab();
    tab.hide();
    tab.display();
    tab.display();
    expect(rows()).toHaveLength(1);
    plugin.unload();
  });
});
