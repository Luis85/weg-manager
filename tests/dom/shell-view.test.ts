import { flushPromises } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SCOPE_CLASS } from "../../src/presentation/scope";

vi.mock("obsidian", () => import("@test/obsidian"));

const { createTestPlugin, WorkspaceLeaf } = await import("@test/obsidian");
const { default: WegManagerPlugin } = await import("../../src/main");
const { bootstrap, SHELL_VIEW_TYPE } = await import("../../src/bootstrap");
const { ShellView } = await import("../../src/infrastructure/obsidian/shell-view");

const settle = async () => {
  await flushPromises();
  await new Promise((resolve) => setTimeout(resolve, 0));
  await flushPromises();
};

const loaded = async () => {
  const created = createTestPlugin(WegManagerPlugin, { data: { greeting: "Moin" } });
  await created.registry.load();
  return created;
};

const shellLeaves = (app: { workspace: { getLeavesOfType(type: string): unknown[] } }) =>
  app.workspace.getLeavesOfType(SHELL_VIEW_TYPE);

afterEach(() => {
  document.body.replaceChildren();
  vi.restoreAllMocks();
});

describe("ShellView", () => {
  it("describes itself to the workspace", async () => {
    const { app, plugin, registry } = await loaded();
    await registry.runCommand("open-view");
    const view = app.workspace.getLeavesOfType(SHELL_VIEW_TYPE)[0]?.view;
    expect(view?.getViewType()).toBe(SHELL_VIEW_TYPE);
    expect(view?.getDisplayText()).toBe("WEG Manager");
    expect(view?.getIcon()).toBe("layout-dashboard");
    plugin.unload();
  });

  it("mounts the surface once on open and releases it on close", async () => {
    const { app, plugin, registry } = await loaded();
    await registry.runCommand("open-view");
    await settle();
    const leaf = app.workspace.getLeavesOfType(SHELL_VIEW_TYPE)[0];
    const view = leaf?.view as InstanceType<typeof ShellView> | undefined;
    expect(view?.contentEl.classList.contains(SCOPE_CLASS)).toBe(true);
    expect(view?.contentEl.textContent).toContain("Moin");
    const children = view?.contentEl.children.length;
    await view?.onOpen();
    expect(view?.contentEl.children.length).toBe(children);
    await leaf?.detach();
    expect(view?.contentEl.children).toHaveLength(0);
    expect(view?.contentEl.classList.contains(SCOPE_CLASS)).toBe(false);
    await view?.onClose();
    plugin.unload();
  });

  it("reveals the existing leaf instead of opening a second one", async () => {
    const { app, plugin, registry } = await loaded();
    await registry.runCommand("open-view");
    await registry.runCommand("open-view");
    expect(shellLeaves(app)).toHaveLength(1);
    expect(app.workspace.revealed).toHaveLength(2);
    expect(app.workspace.revealed[0]).toBe(app.workspace.revealed[1]);
    plugin.unload();
  });

  it("opens from the ribbon icon", async () => {
    const { app, plugin, registry } = await loaded();
    registry.ribbonIcons[0]?.el.click();
    await vi.waitFor(() => expect(shellLeaves(app)).toHaveLength(1));
    plugin.unload();
  });

  it("closes every open view before the runtime is disposed", async () => {
    const { plugin, app } = createTestPlugin(WegManagerPlugin);
    const handle = await bootstrap(plugin);
    const first = app.workspace.getLeaf(true);
    const second = WorkspaceLeaf.openIn(
      app.workspace,
      document.implementation.createHTMLDocument(),
    );
    await first.setViewState({ type: SHELL_VIEW_TYPE });
    await second.setViewState({ type: SHELL_VIEW_TYPE });
    await settle();
    const contents = [first, second].map(
      (leaf) => (leaf.view as unknown as InstanceType<typeof ShellView>).contentEl,
    );
    const atDispose: number[] = [];
    const dispose = handle.runtime.dispose.bind(handle.runtime);
    vi.spyOn(handle.runtime, "dispose").mockImplementation(() => {
      atDispose.push(...contents.map((el) => el.children.length));
      return dispose();
    });
    await handle.dispose();
    expect(atDispose).toEqual([0, 0]);
    plugin.unload();
  });

  it("leaves nothing behind when the plugin unloads with a view open", async () => {
    const { app, plugin, registry } = await loaded();
    await registry.runCommand("open-view");
    await settle();
    plugin.unload();
    await settle();
    expect(shellLeaves(app)).toHaveLength(0);
    expect(document.body.children).toHaveLength(0);
  });
});
