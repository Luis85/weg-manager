import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("obsidian", () => import("@test/obsidian"));

const { createTestPlugin, settingsIn } = await import("@test/obsidian");
const { default: WegManagerPlugin } = await import("../../src/main");

type Text = { simulateInput(value: string): unknown; getValue(): string; disabled: boolean };
type Control = { disabled: boolean };

const openTab = async (data?: unknown) => {
  const { registry, plugin } = createTestPlugin(WegManagerPlugin, { data });
  await registry.load();
  const tab = registry.settingTabs[0]!;
  tab.display();
  await vi.waitFor(() => expect(settingsIn(tab.containerEl).length).toBeGreaterThanOrEqual(2));
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
  it("renders greeting and log level", async () => {
    const { rows, plugin } = await openTab({ greeting: "Moin" });
    expect(rows().map((row) => row.nameEl.textContent)).toEqual(["Begrüßung", "Protokollstufe"]);
    expect(control<Text>(rows(), 0).getValue()).toBe("Moin");
    plugin.unload();
  });

  it("saves an edited greeting", async () => {
    const { rows, registry, plugin } = await openTab();
    control<Text>(rows(), 0).simulateInput("Servus");
    await vi.waitFor(() => expect(registry.saved.at(-1)).toMatchObject({ greeting: "Servus" }));
    plugin.unload();
  });

  it("shows the issue under the greeting and saves nothing for an invalid value", async () => {
    const { rows, registry, plugin } = await openTab();
    control<Text>(rows(), 0).simulateInput("   ");
    await vi.waitFor(() =>
      expect(rows()[0]?.validationEl.textContent).toContain("Die Begrüßung muss 1 bis 200 Zeichen"),
    );
    expect(registry.saved).toEqual([]);
    plugin.unload();
  });

  it("labels the log levels in German and keeps the stored values", async () => {
    const { rows, plugin } = await openTab({ logLevel: "info" });
    const { selectEl } = control<{ selectEl: HTMLSelectElement }>(rows(), 1);
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
    control<{ simulateSelect(value: string): unknown }>(rows(), 1).simulateSelect("debug");
    await vi.waitFor(() => expect(registry.saved.at(-1)).toMatchObject({ logLevel: "debug" }));
    plugin.unload();
  });

  it("disables every control and explains why when settings are read-only", async () => {
    const { rows, tab, plugin } = await openTab({ schemaVersion: 2 });
    for (const row of rows().slice(0, 2)) {
      expect(row.components.every((component: Control) => component.disabled)).toBe(true);
    }
    expect(tab.containerEl.textContent).toContain("neueren Version");
    plugin.unload();
  });

  it("does not duplicate rows when shown again", async () => {
    const { rows, tab, plugin } = await openTab();
    tab.hide();
    tab.display();
    tab.display();
    expect(rows()).toHaveLength(2);
    plugin.unload();
  });
});
