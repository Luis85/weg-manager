import { afterEach, describe, expect, it, vi } from "vitest";
import { preloadSurface } from "../support/preload";
import { WORKSPACE_FACTS } from "../support/workspace-fidelity";
import { workspaceScenario } from "../support/workspace-scenario";

vi.mock("obsidian", () => import("@test/obsidian"));

const { createTestPlugin } = await import("@test/obsidian");
const { asObsidian, obsidianView } = await import("../support/obsidian/real");
const { workspaceProbe } = await import("../support/shell/workspace-probe");
const { SHELL_VIEW_TYPE } = await import("../../src/infrastructure/obsidian/shell/shell-view");
const { SHELL_VIEW_TYPE: PROBE_VIEW_TYPE } = await import("../e2e/probe-plugin/shell-view-type");
const { default: WegManagerPlugin } = await import("../../src/main");
await preloadSurface();

const unloads: (() => void)[] = [];

afterEach(() => {
  for (const unload of unloads.splice(0)) unload();
  document.body.replaceChildren();
});

/**
 * The double's workspace against real Obsidian: the scenario and expectation of
 * `tests/e2e/specs/workspace.e2e.ts`, here with the real plugin loaded on the double and its real
 * `openRoute`.
 */
describe("the Obsidian double's workspace", () => {
  it("opens, reuses, closes, defers and restores tabs as Obsidian does", async () => {
    const { plugin, registry, app } = createTestPlugin(WegManagerPlugin);
    await registry.load();
    unloads.push(() => plugin.unload());
    const real = asObsidian(app);
    const context = {
      app: real,
      obsidian: { View: obsidianView },
      plugins: { noteStoreProbe: { workspace: workspaceProbe(real) } },
    };
    expect(await workspaceScenario(context)).toEqual(WORKSPACE_FACTS);
  });

  it("gives the probe plugin's openRoute the plugin's view type", () => {
    expect(PROBE_VIEW_TYPE).toBe(SHELL_VIEW_TYPE);
  });
});
