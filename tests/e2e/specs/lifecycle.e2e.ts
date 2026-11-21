import { browser, expect } from "@wdio/globals";
import { describe, it } from "mocha";
import { obsidianPage } from "wdio-obsidian-service";
import {
  PLUGIN_ID,
  ROOT,
  VIEW_TYPE,
  installConsoleSpy,
  leafCount,
  openView,
  pluginProblems,
} from "../support";

const RIBBON = '.side-dock-ribbon-action[aria-label="WEG Manager"]';

/**
 * The plugin's live entries in Obsidian's ribbon list, which also feeds the ribbon's context menu.
 * Obsidian keeps a released entry (for order and hidden state) but drops its button and callback.
 */
const ribbonEntries = () =>
  browser.executeObsidian(({ app }, id) => {
    type Item = { id: string; buttonEl?: HTMLElement; callback?: unknown };
    const { items } = app.workspace.leftRibbon as unknown as { items: Item[] };
    return items.filter(
      (item) =>
        item.id === `${id}:WEG Manager` &&
        (item.buttonEl !== undefined || item.callback !== undefined),
    ).length;
  }, PLUGIN_ID);

/** Gaps G1 and G6: real load/unload cycles and a clean console. */
describe("plugin lifecycle in Obsidian", function () {
  it("opens the view with the greeting and the vault's file count", async function () {
    await installConsoleSpy();
    expect(await ribbonEntries()).toBe(1);
    await openView();
    const root = browser.$(ROOT);
    await expect(root).toBeDisplayed();
    await expect(root.$("[data-testid=greeting]")).toHaveText("Hallo von WEG Manager");
    await expect(root.$("[data-testid=file-count]")).toHaveText("3 Markdown-Dateien im Vault");
  });

  it("reveals the open view instead of opening a second one", async function () {
    await openView();
    expect(await leafCount()).toBe(1);
  });

  it("keeps one view working when a second one is closed", async function () {
    await browser.executeObsidian(async ({ app }, type) => {
      await app.workspace.getLeaf("tab").setViewState({ type, active: true });
    }, VIEW_TYPE);
    await expect(browser.$$(ROOT)).toBeElementsArrayOfSize(2);
    await browser.executeObsidian(({ app }, type) => {
      app.workspace.getLeavesOfType(type).at(-1)?.detach();
    }, VIEW_TYPE);
    await expect(browser.$$(ROOT)).toBeElementsArrayOfSize(1);
    await expect(browser.$(ROOT).$("[data-testid=greeting]")).toHaveText("Hallo von WEG Manager");
  });

  it("shows one view and one ribbon icon after each of three disable/enable cycles", async function () {
    for (let cycle = 1; cycle <= 3; cycle += 1) {
      // Obsidian itself removes ribbon icon and commands on unload; that is not checked here.
      await obsidianPage.disablePlugin(PLUGIN_ID);
      await expect(browser.$$(ROOT)).toBeElementsArrayOfSize(0);

      await obsidianPage.enablePlugin(PLUGIN_ID);
      await expect(browser.$$(RIBBON)).toBeElementsArrayOfSize(1);
      expect(await ribbonEntries()).toBe(1);
      // A re-render of the ribbon keeps exactly one icon.
      await browser.executeObsidian(({ app }) => {
        (app.workspace.leftRibbon as unknown as { onChange(save: boolean): void }).onChange(false);
      });
      await expect(browser.$$(RIBBON)).toBeElementsArrayOfSize(1);
      await openView();
      await expect(browser.$$(ROOT)).toBeElementsArrayOfSize(1);
      await expect(browser.$(ROOT).$("[data-testid=file-count]")).toHaveText(
        "3 Markdown-Dateien im Vault",
      );
    }
  });

  it("logged no error or warning from the plugin and no uncaught error", async function () {
    expect(await pluginProblems()).toEqual([]);
  });
});
