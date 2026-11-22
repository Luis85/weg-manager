import { browser, expect } from "@wdio/globals";
import { describe, it } from "mocha";
import { WORKSPACE_FACTS } from "../../support/workspace-fidelity";
import { workspaceScenario } from "../../support/workspace-scenario";
import { ROOT, VIEW_TYPE, installConsoleSpy, openView, pluginProblems } from "../support";

/** Each plugin tab as the plugin sees it: deferred or built, and its route. */
const pluginTabs = () =>
  browser.executeObsidian(
    ({ app }, type) =>
      app.workspace.getLeavesOfType(type).map((leaf) => ({
        deferred: leaf.isDeferred,
        route: leaf.getViewState().state?.["route"] ?? null,
      })),
    VIEW_TYPE,
  );

/**
 * Tabs and views in real Obsidian: the scenario the double is held to
 * (`tests/dom/workspace-fidelity.test.ts`), then the plugin itself with a tab Obsidian deferred
 * at a restart.
 */
describe("tabs and views in Obsidian", function () {
  it("opens, reuses, closes, defers and restores tabs as the double does", async function () {
    await installConsoleSpy();
    expect(await browser.executeObsidian(workspaceScenario)).toEqual(WORKSPACE_FACTS);
    expect(await pluginProblems()).toEqual([]);
  });

  it("shows a tab deferred at a restart on its saved route when the view is opened", async function () {
    // The plugin's tab on the data issues, in the background behind a note, saved and restarted.
    await browser.executeObsidian(async ({ app }, type) => {
      for (const leaf of app.workspace.getLeavesOfType(type)) leaf.detach();
      await app.workspace
        .getLeaf("tab")
        .setViewState({ type, state: { route: { name: "settings", section: "data-issues" } } });
      const note = app.vault.getFileByPath("Willkommen.md");
      if (note === null) throw new Error("no note");
      await app.workspace.getLeaf("tab").openFile(note, { active: true });
      await (app.workspace as unknown as { saveLayout(): Promise<void> }).saveLayout();
    }, VIEW_TYPE);
    await browser.reloadObsidian();
    expect(await pluginTabs()).toEqual([
      { deferred: true, route: { name: "settings", section: "data-issues" } },
    ]);
    await expect(browser.$$(ROOT)).toBeElementsArrayOfSize(0);
    await installConsoleSpy();
    await openView();
    await expect(browser.$(ROOT).$("[data-testid=data-issues-screen]")).toBeDisplayed();
    expect(await pluginTabs()).toEqual([
      { deferred: false, route: { name: "settings", section: "data-issues" } },
    ]);
    expect(await pluginProblems()).toEqual([]);
  });
});
