import { flushPromises } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("obsidian", () => import("@test/obsidian"));

const { createTestPlugin, recordedNotices } = await import("@test/obsidian");
const { default: WegManagerPlugin } = await import("../../src/main");

type External = { onExternalSettingsChange(): Promise<void> };

const settle = async () => {
  await flushPromises();
  await new Promise((resolve) => setTimeout(resolve, 0));
  await flushPromises();
};

/** A loaded plugin with its view open, and the way Obsidian reports a changed `data.json`. */
const withOpenView = async (data: unknown = { greeting: "Moin" }) => {
  const created = createTestPlugin(WegManagerPlugin, { data });
  await created.registry.load();
  await created.registry.runCommand("open-view");
  await settle();
  // The screen loads lazily, the first time a view shows it.
  await vi.waitFor(() => expect(document.querySelector("[data-testid=greeting]")).not.toBeNull());
  const external = created.plugin as unknown as External;
  const arrive = async (next: unknown) => {
    created.registry.writeExternally(next);
    await external.onExternalSettingsChange();
    await settle();
  };
  return { ...created, external, arrive };
};

const greeting = () => document.querySelector("[data-testid=greeting]")?.textContent.trim();
const readOnlyHint = () => document.querySelector("[data-testid=read-only-hint]");
const submit = () => document.querySelector<HTMLButtonElement>("button[type=submit]");
const noticeTexts = () => recordedNotices().map((notice) => notice.text);

afterEach(() => {
  vi.restoreAllMocks();
  document.body.replaceChildren();
});

describe("settings changed outside Obsidian", () => {
  it("shows the new greeting in the open view without writing data.json", async () => {
    const { plugin, registry, arrive } = await withOpenView();
    expect(greeting()).toBe("Moin");
    await arrive({ greeting: "Von außen" });
    expect(greeting()).toBe("Von außen");
    expect(registry.saved).toEqual([]);
    expect(noticeTexts()).toEqual([]);
    plugin.unload();
  });

  it("turns the open view read-only for a file from a newer version and never writes it", async () => {
    const { plugin, registry, arrive } = await withOpenView();
    expect(readOnlyHint()).toBeNull();
    await arrive({ schemaVersion: 2, greeting: "Zukunft" });
    expect(readOnlyHint()?.textContent).toContain("neueren Version");
    expect(submit()?.disabled).toBe(true);
    expect(noticeTexts()).toEqual([expect.stringContaining("schreibgeschützt")]);
    expect(registry.saved).toEqual([]);
    plugin.unload();
  });

  it("turns read-only when data.json cannot be read, and writable again once it can", async () => {
    const { plugin, registry, external, arrive } = await withOpenView();
    registry.setFailLoadData(true);
    await external.onExternalSettingsChange();
    await settle();
    expect(readOnlyHint()?.textContent).toContain("nicht lesbar");
    registry.setFailLoadData(false);
    await arrive({ greeting: "Wieder da" });
    expect(readOnlyHint()).toBeNull();
    expect(greeting()).toBe("Wieder da");
    expect(registry.saved).toEqual([]);
    plugin.unload();
  });

  it("waits for a load that is still reading settings, then reloads", async () => {
    const { plugin, registry } = createTestPlugin(WegManagerPlugin, { data: { greeting: "Alt" } });
    registry.holdLoadData();
    const loading = registry.load();
    registry.writeExternally({ greeting: "Neu" });
    const reloading = (plugin as unknown as External).onExternalSettingsChange();
    registry.releaseLoadData();
    await loading;
    await reloading;
    await registry.runCommand("show-greeting");
    expect(noticeTexts().at(-1)).toContain("Neu");
    plugin.unload();
  });

  it("does nothing once the plugin is unloaded", async () => {
    const { plugin, registry, external } = await withOpenView();
    plugin.unload();
    const loadData = vi.spyOn(plugin as unknown as { loadData(): Promise<unknown> }, "loadData");
    registry.writeExternally({ greeting: "Zu spät" });
    await expect(external.onExternalSettingsChange()).resolves.toBeUndefined();
    expect(loadData).not.toHaveBeenCalled();
  });

  it("does nothing after a failed bootstrap", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { plugin, registry } = createTestPlugin(WegManagerPlugin);
    registry.failNextAddCommand();
    await expect(registry.load()).rejects.toThrow("addCommand failed");
    const notices = noticeTexts().length;
    await expect(
      (plugin as unknown as External).onExternalSettingsChange(),
    ).resolves.toBeUndefined();
    expect(noticeTexts()).toHaveLength(notices);
  });
});
