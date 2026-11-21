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

const RIBBON = '.side-dock-ribbon-action[aria-label="WEG Manager öffnen"]';

/** Gaps G1 and G6: real load/unload cycles and a clean console. */
describe("plugin lifecycle in Obsidian", function () {
  it("opens the view with the greeting and the vault's file count", async function () {
    await installConsoleSpy();
    await openView();
    const root = browser.$(ROOT);
    await expect(root).toBeDisplayed();
    await expect(root.$("[data-testid=greeting]")).toHaveText("Hello from WEG Manager");
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
    await expect(browser.$(ROOT).$("[data-testid=greeting]")).toHaveText("Hello from WEG Manager");
  });

  it("leaves nothing behind after three disable/enable cycles", async function () {
    for (let cycle = 1; cycle <= 3; cycle += 1) {
      await obsidianPage.disablePlugin(PLUGIN_ID);
      await expect(browser.$$(ROOT)).toBeElementsArrayOfSize(0);
      await expect(browser.$$(RIBBON)).toBeElementsArrayOfSize(0);
      const commands = await browser.executeObsidian(
        ({ app }, id) =>
          Object.keys(
            (app as unknown as { commands: { commands: Record<string, unknown> } }).commands
              .commands,
          ).filter((command) => command.startsWith(`${id}:`)),
        PLUGIN_ID,
      );
      expect(commands).toEqual([]);

      await obsidianPage.enablePlugin(PLUGIN_ID);
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
