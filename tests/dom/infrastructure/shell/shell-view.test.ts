import { flushPromises } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { appSurface } from "../../../../src/presentation/app-surface";
import { SCOPE_CLASS } from "../../../../src/presentation/shell/scope";
import { testRuntime } from "../../../support/runtime";
import { eventually } from "../../../support/wait";
import { preloadSurface } from "../../../support/preload";

vi.mock("obsidian", () => import("@test/obsidian"));

const { App, createTestPlugin, WorkspaceLeaf } = await import("@test/obsidian");
const { default: WegManagerPlugin } = await import("../../../../src/main");
const { bootstrap, SHELL_VIEW_TYPE } = await import("../../../../src/bootstrap");
const { ShellView } = await import("../../../../src/infrastructure/obsidian/shell/shell-view");
await preloadSurface();

const settle = async () => {
  await flushPromises();
  await new Promise((resolve) => setTimeout(resolve, 0));
  await flushPromises();
};

const loaded = async () => {
  const created = createTestPlugin(WegManagerPlugin, { data: { rootFolder: "Beirat" } });
  await created.registry.load();
  return created;
};

const noop = (): void => undefined;
/** A leaf of a fresh workspace, typed as the real one `ShellView` expects. */
const newLeaf = () => new App().workspace.getLeaf(true) as never;

/** A surface module whose loading the test finishes by hand, counting the mounts it performs. */
const deferredSurface = () => {
  let resolve: () => void = noop;
  const ready = new Promise<void>((done) => {
    resolve = done;
  });
  const surface = {
    mounted: 0,
    resolve: () => resolve(),
    load: async () => {
      await ready;
      return {
        mountSurface: () => {
          surface.mounted += 1;
          return () => undefined;
        },
      };
    },
  };
  return surface;
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
    await eventually(() => expect(view?.contentEl.textContent).toContain("Beirat/Gemeinschaften"));
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
    await eventually(() => expect(shellLeaves(app)).toHaveLength(1));
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

  it("empties the content element before it mounts", async () => {
    const { runtime } = testRuntime({ store: { initial: { rootFolder: "Beirat" } } });
    const view = new ShellView(newLeaf(), runtime, new Set(), appSurface);
    view.contentEl.append(document.createElement("p"));
    await view.onOpen();
    expect(view.contentEl.querySelector("p")).toBeNull();
    await eventually(() => expect(view.contentEl.textContent).toContain("Beirat/Gemeinschaften"));
    await view.onClose();
    await runtime.dispose();
  });

  it("mounts once the surface module has loaded", async () => {
    const { runtime } = testRuntime();
    const surface = deferredSurface();
    const surfaces = new Set<() => void>();
    const view = new ShellView(newLeaf(), runtime, surfaces, appSurface, surface.load);
    const opening = view.onOpen();
    expect(surfaces.size).toBe(1);
    surface.resolve();
    await opening;
    expect(surface.mounted).toBe(1);
    await view.onClose();
    expect(surfaces.size).toBe(0);
    await runtime.dispose();
  });

  it("does not mount when it closes while the surface is still loading", async () => {
    const { runtime } = testRuntime();
    const surface = deferredSurface();
    const surfaces = new Set<() => void>();
    const view = new ShellView(newLeaf(), runtime, surfaces, appSurface, surface.load);
    const opening = view.onOpen();
    await view.onClose();
    surface.resolve();
    await opening;
    expect(surface.mounted).toBe(0);
    expect(surfaces.size).toBe(0);
    await runtime.dispose();
  });

  it("does not mount when bootstrap releases its surfaces while the surface is loading", async () => {
    const { runtime } = testRuntime();
    const surface = deferredSurface();
    const surfaces = new Set<() => void>();
    const view = new ShellView(newLeaf(), runtime, surfaces, appSurface, surface.load);
    const opening = view.onOpen();
    for (const close of surfaces) close();
    surface.resolve();
    await opening;
    expect(surface.mounted).toBe(0);
    await view.onClose();
    await runtime.dispose();
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
