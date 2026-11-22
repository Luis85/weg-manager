import { flushPromises } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { appSurface } from "../../../../src/presentation/app-surface";
import { runtimes } from "../../../support/composable";
import { preloadSurface } from "../../../support/preload";
import { eventually } from "../../../support/wait";
import { asDoubleView, asObsidianLeaf, viewOf } from "../../../support/obsidian/real";

vi.mock("obsidian", () => import("@test/obsidian"));

const { App } = await import("@test/obsidian");
const { ShellView, SHELL_VIEW_TYPE } =
  await import("../../../../src/infrastructure/obsidian/shell/shell-view");

await preloadSurface();

const { make, disposeAll } = runtimes();

const settle = async () => {
  await flushPromises();
  await new Promise((resolve) => setTimeout(resolve, 0));
  await flushPromises();
};

type AppView = InstanceType<typeof ShellView<typeof appSurface.start>>;

/** A view of the plugin's own surface, restored from `state` as Obsidian restores a layout. */
const restored = async (state: unknown) => {
  const { runtime, vaultReady } = make();
  await vaultReady();
  const app = new App();
  app.workspace.registerViewCreator(SHELL_VIEW_TYPE, (leaf) =>
    asDoubleView(new ShellView(asObsidianLeaf(leaf), runtime, new Set(), appSurface)),
  );
  const leaf = app.workspace.getLeaf(true);
  await leaf.setViewState({ type: SHELL_VIEW_TYPE, state: state as Record<string, unknown> });
  await settle();
  return viewOf<AppView>(leaf);
};

/** Waits until the view shows the section whose root carries `testid`. */
const showing = (view: AppView, testid: string) =>
  eventually(() => expect(view.contentEl.querySelector(`[data-testid=${testid}]`)).not.toBeNull());

afterEach(async () => {
  document.body.replaceChildren();
  await disposeAll();
});

describe("a saved view state on the settings screen (ADR 0008, amendment 22.11.2026)", () => {
  it("opens the communities section from the state the earlier versions stored", async () => {
    const view = await restored({ route: { name: "settings", section: "communities" } });
    await showing(view, "communities-screen");
    expect(view.getState()).toStrictEqual({
      route: { name: "settings", section: "communities" },
    });
  });

  it("opens the data issues section from its state", async () => {
    const view = await restored({ route: { name: "settings", section: "data-issues" } });
    await showing(view, "data-issues-screen");
    expect(view.getState()).toStrictEqual({
      route: { name: "settings", section: "data-issues" },
    });
  });

  it("falls back to the start route for a section no module contributes", async () => {
    const view = await restored({ route: { name: "settings", section: "contacts" } });
    await showing(view, "communities-screen");
    expect(view.getState()).toStrictEqual({ route: appSurface.start });
  });
});
