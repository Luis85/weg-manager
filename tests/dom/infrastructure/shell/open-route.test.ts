import { flushPromises } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { runtimes } from "../../../support/composable";
import { preloadSurface } from "../../../support/preload";
import { testSurface, type TestRoute } from "../../../support/surface";
import { asDoubleView, asObsidianLeaf, asObsidianWorkspace } from "../../../support/obsidian/real";

vi.mock("obsidian", () => import("@test/obsidian"));

const { App, ItemView, WorkspaceLeaf } = await import("@test/obsidian");
const { ShellView, SHELL_VIEW_TYPE } =
  await import("../../../../src/infrastructure/obsidian/shell/shell-view");
const { openRoute } = await import("../../../../src/infrastructure/obsidian/shell/open-route");
await preloadSurface();

const { make, disposeAll } = runtimes();

const NOTE_VIEW_TYPE = "markdown";

class NoteView extends ItemView {
  getViewType(): string {
    return NOTE_VIEW_TYPE;
  }
  getDisplayText(): string {
    return "a note";
  }
}

const settle = async () => {
  await flushPromises();
  await new Promise((resolve) => setTimeout(resolve, 0));
  await flushPromises();
};

/**
 * A workspace as Obsidian behaves for the two calls `openRoute` can make: `getLeaf(true)` is a new
 * tab, `getLeaf(false)` is the tab the user is in, which a view opened there replaces. The user's
 * tab shows a note. The double's own `getLeaf` ignores its argument, so it is replaced here.
 */
const workspaceWithANoteOpen = async () => {
  const { runtime } = make();
  const app = new App();
  const surfaces = new Set<() => void>();
  app.workspace.registerViewCreator(NOTE_VIEW_TYPE, (leaf) => new NoteView(leaf));
  app.workspace.registerViewCreator(SHELL_VIEW_TYPE, (leaf) =>
    asDoubleView(new ShellView<TestRoute>(asObsidianLeaf(leaf), runtime, surfaces, testSurface())),
  );
  const usersTab = app.workspace.getLeaf(true);
  await usersTab.setViewState({ type: NOTE_VIEW_TYPE });
  const newTab = app.workspace.getLeaf.bind(app.workspace);
  vi.spyOn(app.workspace, "getLeaf").mockImplementation((newLeaf) =>
    newLeaf === undefined || newLeaf === false ? usersTab : newTab(newLeaf),
  );
  return { app, usersTab };
};

afterEach(async () => {
  vi.restoreAllMocks();
  document.body.replaceChildren();
  await disposeAll();
});

describe("openRoute", () => {
  it("opens the view in a new tab and leaves the tab the user is in alone", async () => {
    const { app, usersTab } = await workspaceWithANoteOpen();
    await openRoute(asObsidianWorkspace(app.workspace), { name: "second" });
    await settle();
    expect(usersTab.getViewState().type).toBe(NOTE_VIEW_TYPE);
    const opened = app.workspace.getLeavesOfType(SHELL_VIEW_TYPE);
    expect(opened).toHaveLength(1);
    expect(opened[0]).not.toBe(usersTab);
  });

  it("does the same without a route", async () => {
    const { app, usersTab } = await workspaceWithANoteOpen();
    await openRoute(asObsidianWorkspace(app.workspace));
    await settle();
    expect(usersTab.getViewState().type).toBe(NOTE_VIEW_TYPE);
    expect(app.workspace.getLeavesOfType(SHELL_VIEW_TYPE)).toHaveLength(1);
  });

  it("asks Obsidian to make the tab it sets up the active one", async () => {
    const { app } = await workspaceWithANoteOpen();
    const setViewState = vi.spyOn(WorkspaceLeaf.prototype, "setViewState");
    await openRoute(asObsidianWorkspace(app.workspace), { name: "second" });
    await settle();
    expect(setViewState).toHaveBeenCalledWith(
      expect.objectContaining({ type: SHELL_VIEW_TYPE, active: true }),
    );
  });

  it("sets a route on the view that is open with one view state, which activates the tab too", async () => {
    const { app } = await workspaceWithANoteOpen();
    await openRoute(asObsidianWorkspace(app.workspace));
    await settle();
    const setViewState = vi.spyOn(WorkspaceLeaf.prototype, "setViewState");
    await openRoute(asObsidianWorkspace(app.workspace), { name: "item", id: "7" });
    await settle();
    expect(setViewState).toHaveBeenCalledTimes(1);
    expect(setViewState).toHaveBeenCalledWith({
      type: SHELL_VIEW_TYPE,
      active: true,
      state: { route: { name: "item", id: "7" } },
    });
  });
});
