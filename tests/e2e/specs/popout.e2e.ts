import { browser, expect } from "@wdio/globals";
import { describe, it } from "mocha";
import {
  ROOT,
  VIEW_TYPE,
  installConsoleSpy,
  openView,
  pluginProblems,
  setColorScheme,
} from "../support";

/** The window handle of the pop-out, i.e. the one that is not Obsidian's main window. */
const popoutHandle = async (main: string): Promise<string> => {
  let handle: string | undefined;
  await browser.waitUntil(
    async () => {
      handle = (await browser.getWindowHandles()).find((candidate) => candidate !== main);
      return handle !== undefined;
    },
    { timeoutMsg: "no pop-out window appeared" },
  );
  return handle ?? "";
};

/** Gap G4: a view in a pop-out window lives entirely in that window's document. */
describe("view in a pop-out window", function () {
  it("moves the surface, its portal and its dialogs into the pop-out's document", async function () {
    await installConsoleSpy();
    await openView();
    const main = await browser.getWindowHandle();
    await browser.executeObsidian(async ({ app }, type) => {
      const leaf = app.workspace.getLeavesOfType(type)[0];
      if (leaf) app.workspace.moveLeafToPopout(leaf);
    }, VIEW_TYPE);

    const placement = await browser.executeObsidian(({ app }, type) => {
      const view = app.workspace.getLeavesOfType(type)[0]?.view;
      const doc = view?.containerEl.ownerDocument;
      const root = doc?.querySelector(".weg-manager-root");
      return {
        otherDocument: doc !== undefined && doc !== document,
        rootInPopout: root !== null && root !== undefined,
        portalInPopout: root?.querySelector(":scope > .weg-manager-portal") != null,
        rootInMain: document.querySelector(".weg-manager-root") !== null,
      };
    }, VIEW_TYPE);
    expect(placement).toEqual({
      otherDocument: true,
      rootInPopout: true,
      portalInPopout: true,
      rootInMain: false,
    });

    await browser.switchToWindow(await popoutHandle(main));
    const root = browser.$(ROOT);
    await expect(root.$("[data-testid=communities-screen] h2")).toHaveText("Gemeinschaften");
    await root.$("[data-testid=community-add]").click();
    await expect(root.$("[data-testid=community-form]")).toBeDisplayed();
    const dialog = await browser.executeObsidian(({ app }, type) => {
      const view = app.workspace.getLeavesOfType(type)[0]?.view;
      const doc = view?.containerEl.ownerDocument;
      const form = doc?.querySelector("[data-testid=community-form]");
      return {
        inPopout: form !== null && form !== undefined,
        inPortal: form?.closest(".weg-manager-portal") != null,
        inMain:
          app.workspace.containerEl.ownerDocument.querySelector("[data-testid=community-form]") !==
          null,
      };
    }, VIEW_TYPE);
    expect(dialog).toEqual({ inPopout: true, inPortal: true, inMain: false });
    await browser.keys("Escape");
    await expect(root.$("[data-testid=community-form]")).not.toExist();

    await setColorScheme("dark");
    await expect(root).toHaveElementClass("dark");
    await setColorScheme("light");
    await expect(root).toHaveElementClass("light");
    await browser.switchToWindow(main);
  });

  it("closes the pop-out cleanly", async function () {
    const main = await browser.getWindowHandle();
    await browser.executeObsidian(({ app }, type) => {
      app.workspace.getLeavesOfType(type)[0]?.detach();
    }, VIEW_TYPE);
    await browser.waitUntil(async () => (await browser.getWindowHandles()).length === 1, {
      timeoutMsg: "pop-out window stayed open",
    });
    expect(await browser.getWindowHandle()).toBe(main);
    expect(await pluginProblems()).toEqual([]);
  });
});
