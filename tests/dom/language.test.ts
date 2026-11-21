import { flushPromises } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("obsidian", () => import("@test/obsidian"));

const { DEFAULT_TEST_LANGUAGE, createTestPlugin, recordedNotices, settingsIn, setLanguage } =
  await import("@test/obsidian");
const { default: WegManagerPlugin } = await import("../../src/main");
const { SHELL_VIEW_TYPE, reportUnloadFailure } = await import("../../src/bootstrap");

const settle = async () => {
  await flushPromises();
  await new Promise((resolve) => setTimeout(resolve, 0));
  await flushPromises();
};

const loaded = async (language: string, data?: unknown) => {
  setLanguage(language);
  const created = createTestPlugin(WegManagerPlugin, { data });
  await created.registry.load();
  return created;
};

const commandNames = (registry: ReturnType<typeof createTestPlugin>["registry"]) =>
  Object.fromEntries([...registry.commands.values()].map(({ id, name }) => [id, name]));

const openTab = async (registry: ReturnType<typeof createTestPlugin>["registry"]) => {
  const tab = registry.settingTabs[0]!;
  tab.display();
  await vi.waitFor(() => expect(settingsIn(tab.containerEl).length).toBeGreaterThanOrEqual(1));
  const rows = settingsIn(tab.containerEl);
  const control = <T>(index: number): T => {
    const component = rows[index]?.components[0];
    if (component === undefined) throw new Error(`no control in row ${index}`);
    return component as T;
  };
  return { rows, control };
};

const tabTexts = async (registry: ReturnType<typeof createTestPlugin>["registry"]) => {
  const { rows, control } = await openTab(registry);
  const { selectEl } = control<{ selectEl: HTMLSelectElement }>(0);
  return {
    names: rows.map((row) => row.nameEl.textContent),
    levels: [...selectEl.options].map((option) => option.text),
  };
};

afterEach(() => {
  setLanguage(DEFAULT_TEST_LANGUAGE);
  vi.restoreAllMocks();
  document.body.replaceChildren();
});

describe("UI language follows Obsidian", () => {
  it("names commands, ribbon and settings in German for German Obsidian", async () => {
    const { registry, plugin } = await loaded("de");
    expect(commandNames(registry)).toEqual({
      "open-view": "Ansicht öffnen",
      "show-greeting": "Begrüßung anzeigen",
      "copy-diagnostics": "Diagnose kopieren",
    });
    expect(registry.ribbonIcons.map(({ title }) => title)).toEqual(["WEG Manager"]);
    expect(await tabTexts(registry)).toEqual({
      names: ["Protokollstufe"],
      levels: ["Fehler", "Warnungen", "Informationen", "Details"],
    });
    plugin.unload();
  });

  it.each(["en", "fr", "en-GB"])(
    "names commands, ribbon and settings in English for %s",
    async (language) => {
      const { registry, plugin } = await loaded(language);
      expect(commandNames(registry)).toEqual({
        "open-view": "Open view",
        "show-greeting": "Show greeting",
        "copy-diagnostics": "Copy diagnostics",
      });
      // The product name in every language, so the entry id does not change with the language.
      expect(registry.ribbonIcons.map(({ title }) => title)).toEqual(["WEG Manager"]);
      expect(await tabTexts(registry)).toEqual({
        names: ["Log level"],
        levels: ["Errors", "Warnings", "Information", "Details"],
      });
      plugin.unload();
    },
  );

  it("shows the old stored default as the German default greeting", async () => {
    const old = { schemaVersion: 1, greeting: "Hello from WEG Manager", logLevel: "warn" };
    const { registry, plugin } = await loaded("de", old);
    await registry.runCommand("show-greeting");
    expect(recordedNotices().at(-1)?.text).toContain("Hallo von WEG Manager");
    expect(registry.saved).toEqual([]);
    plugin.unload();
  });

  it("keeps a typed greeting in English", async () => {
    const { registry, plugin } = await loaded("en", { greeting: "Moin" });
    await registry.runCommand("show-greeting");
    expect(recordedNotices().at(-1)?.text).toContain("Moin");
    plugin.unload();
  });

  it("reports a failed load in English", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    setLanguage("en");
    const { registry } = createTestPlugin(WegManagerPlugin);
    registry.failNextAddCommand();
    await expect(registry.load()).rejects.toThrow("addCommand failed");
    expect(registry.ribbonIcons).toHaveLength(0);
    expect(recordedNotices().at(-1)?.text).toMatch(/Unexpected error in WEG Manager/);
  });

  it("reports an unload failure in the current language", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    setLanguage("en");
    reportUnloadFailure(new Error("late"));
    expect(recordedNotices().at(-1)?.text).toMatch(/Unexpected error in WEG Manager.*error code/s);
  });

  it("renders the view in English, Nuxt UI's labels included", async () => {
    const { app, plugin } = await loaded("en");
    const leaf = app.workspace.getLeaf(true);
    await leaf.setViewState({ type: SHELL_VIEW_TYPE });
    await settle();
    const root = document.querySelector(".weg-manager-root")!;
    await vi.waitFor(() => expect(root.querySelector("[data-testid=file-count]")).not.toBeNull());
    expect(root.querySelector("[data-testid=greeting]")?.textContent.trim()).toBe(
      "Hello from WEG Manager",
    );
    expect(root.querySelector("[data-testid=file-count]")?.textContent.trim()).toMatch(
      /^\d+ Markdown files? in the vault$/,
    );
    expect(root.querySelector("button[type=submit]")?.textContent.trim()).toBe("Save");
    [...root.querySelectorAll("button")].find((b) => b.textContent.includes("About"))?.click();
    await settle();
    const dialog = root.querySelector("[role=dialog]");
    expect(dialog?.textContent).toContain("About WEG Manager");
    const labels = [...(dialog?.querySelectorAll("button") ?? [])].map((button) =>
      button.getAttribute("aria-label"),
    );
    expect(labels).toContain("Close");
    plugin.unload();
  });
});
