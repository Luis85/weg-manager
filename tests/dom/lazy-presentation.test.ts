import { flushPromises } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";

/** Which presentation modules have been evaluated so far, in order. */
const evaluated = vi.hoisted((): string[] => []);

vi.mock("obsidian", () => import("@test/obsidian"));
vi.mock("vue", async (importOriginal) => {
  evaluated.push("vue");
  return importOriginal();
});
vi.mock("../../src/presentation/shell/mount", async (importOriginal) => {
  evaluated.push("mount");
  return importOriginal();
});

const { createTestPlugin } = await import("@test/obsidian");
const { default: WegManagerPlugin } = await import("../../src/main");

afterEach(() => {
  document.body.replaceChildren();
});

/** Vue, Nuxt UI and TanStack Form are evaluated when the first view opens, not on plugin load. */
describe("lazy presentation", () => {
  it("loads the plugin without evaluating Vue, then mounts it when a view opens", async () => {
    const { plugin, registry } = createTestPlugin(WegManagerPlugin, { data: { greeting: "Moin" } });
    await registry.load();
    expect(evaluated).toEqual([]);

    await registry.runCommand("open-view");
    await flushPromises();
    expect(evaluated).toContain("mount");
    expect(evaluated).toContain("vue");
    expect(document.body.textContent).toContain("Moin");
    plugin.unload();
  });
});
