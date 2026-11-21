import { browser, expect } from "@wdio/globals";
import { describe, it } from "mocha";
import { obsidianPage } from "wdio-obsidian-service";
import { PLUGIN_ID } from "../support";

const TITLE = "WEG Manager öffnen";
const RIBBON = `.side-dock-ribbon-action[aria-label="${TITLE}"]`;

/** Live entries of the plugin in Obsidian's ribbon list (those that still have button or callback). */
const ribbonEntries = () =>
  browser.executeObsidian(
    ({ app }, id, title) => {
      type Item = { id: string; buttonEl?: HTMLElement; callback?: unknown };
      const { items } = app.workspace.leftRibbon as unknown as { items: Item[] };
      return items.filter(
        (item) =>
          item.id === `${id}:${title}` &&
          (item.buttonEl !== undefined || item.callback !== undefined),
      ).length;
    },
    PLUGIN_ID,
    TITLE,
  );

/**
 * A failed bootstrap removes its ribbon icon through Obsidian's internal
 * `leftRibbon.removeRibbonAction` (research table #12). This spec makes the plugin's first
 * `addCommand` throw, without a test hook in the plugin, so a rename of that internal API fails here.
 */
describe("ribbon icon after a failed bootstrap in Obsidian", function () {
  it("keeps Obsidian's internal removeRibbonAction available", async function () {
    const kind = await browser.executeObsidian(
      ({ app }) =>
        typeof (app.workspace.leftRibbon as unknown as { removeRibbonAction?: unknown })
          .removeRibbonAction,
    );
    expect(kind).toBe("function");
  });

  it("leaves no ribbon icon behind when a registration throws", async function () {
    await obsidianPage.disablePlugin(PLUGIN_ID);
    const failed = await browser.executeObsidian(async ({ app, obsidian }, id) => {
      const proto = obsidian.Plugin.prototype as unknown as {
        addCommand: (this: { manifest: { id: string } }, command: unknown) => unknown;
      };
      const original = proto.addCommand;
      let thrown = false;
      proto.addCommand = function (command) {
        if (this.manifest.id === id) {
          proto.addCommand = original;
          thrown = true;
          throw new Error("addCommand failed (e2e)");
        }
        return original.call(this, command);
      };
      const plugins = (
        app as unknown as { plugins: { enablePlugin(id: string): Promise<unknown> } }
      ).plugins;
      try {
        await plugins.enablePlugin(id);
      } catch {
        // Whether Obsidian rethrows a failing onload or only logs it does not matter here.
      } finally {
        proto.addCommand = original;
      }
      return thrown;
    }, PLUGIN_ID);
    expect(failed).toBe(true);
    expect(await ribbonEntries()).toBe(0);
    await browser.executeObsidian(({ app }) => {
      (app.workspace.leftRibbon as unknown as { onChange(save: boolean): void }).onChange(false);
    });
    await expect(browser.$$(RIBBON)).toBeElementsArrayOfSize(0);
  });

  it("shows the ribbon icon exactly once after the next regular enable", async function () {
    await obsidianPage.disablePlugin(PLUGIN_ID);
    await obsidianPage.enablePlugin(PLUGIN_ID);
    expect(await ribbonEntries()).toBe(1);
    await expect(browser.$$(RIBBON)).toBeElementsArrayOfSize(1);
  });
});
