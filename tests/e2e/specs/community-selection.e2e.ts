import { browser, expect } from "@wdio/globals";
import { describe, it } from "mocha";
import { FOLDER, community, communityText, expectListed, writeNote } from "../communities";
import { ROOT, VIEW_TYPE, installConsoleSpy, openView, pluginProblems } from "../support";

const AW = communityText(community(1, { name: "Ahornweg 12", short_code: "AW" }));
const TG = communityText(
  community(2, { name: "Tiefgarage", short_code: "TG", color: "violet", kind: "Tiefgarage" }),
);
const BA = communityText(community(3, { name: "Birkenallee", short_code: "BA", color: "blue" }));

/** The selected community's text in each open view, in view order (`""` for none). */
const selectedInViews = () =>
  browser.executeObsidian((_, selector) => {
    return [...document.querySelectorAll(selector)].map((root) => {
      const pressed = root.querySelector("[data-testid=community-option][aria-checked=true]");
      if (pressed === null) return "";
      const code = pressed.querySelector("[data-testid=community-badge]")?.textContent?.trim();
      const name = pressed.querySelector("[data-testid=community-option-name]")?.textContent;
      return `${code ?? ""} ${name?.trim() ?? ""}`;
    });
  }, ROOT);

const expectSelected = (expected: readonly string[]) =>
  browser.waitUntil(
    async () => JSON.stringify(await selectedInViews()) === JSON.stringify(expected),
    { timeoutMsg: `the views never showed ${JSON.stringify(expected)} as selected` },
  );

/** Clicks `name` in the first view's switch. */
const choose = (name: string) =>
  browser.execute(
    (selector, wanted) => {
      const options = document
        .querySelector(selector)
        ?.querySelectorAll<HTMLButtonElement>("[data-testid=community-option]");
      [...(options ?? [])]
        .find(
          (option) =>
            option.querySelector("[data-testid=community-option-name]")?.textContent?.trim() ===
            wanted,
        )
        ?.click();
    },
    ROOT,
    name,
  );

/** The first view's request for a choice. */
const choiceText = () =>
  browser.execute(
    (selector) =>
      document
        .querySelector(selector)
        ?.querySelector("[data-testid=community-choice]")
        ?.textContent?.trim() ?? "",
    ROOT,
  );

/** ADR 0008, PBI-56: one selection for every open view, kept per device across a restart. */
describe("the community selection in Obsidian", function () {
  it("selects the only community and keeps it when a second one arrives", async function () {
    await installConsoleSpy();
    await writeNote(`${FOLDER}/Ahornweg 12.md`, AW);
    await openView();
    await expectSelected(["AW Ahornweg 12"]);
    await writeNote(`${FOLDER}/Tiefgarage.md`, TG);
    await expectListed(["Ahornweg 12", "Tiefgarage"]);
    await expectSelected(["AW Ahornweg 12"]);
  });

  it("shows one selection in two views, whichever view changes it", async function () {
    await browser.executeObsidian(async ({ app }, type) => {
      await app.workspace.getLeaf("tab").setViewState({ type, active: true });
    }, VIEW_TYPE);
    await expect(browser.$$(ROOT)).toBeElementsArrayOfSize(2);
    await expectSelected(["AW Ahornweg 12", "AW Ahornweg 12"]);
    await choose("Tiefgarage");
    await expectSelected(["TG Tiefgarage", "TG Tiefgarage"]);
  });

  it("keeps the selection on this device across a restart", async function () {
    await browser.reloadObsidian();
    await installConsoleSpy();
    await openView();
    await expectListed(["Ahornweg 12", "Tiefgarage"]);
    await browser.waitUntil(async () => (await selectedInViews())[0] === "TG Tiefgarage", {
      timeoutMsg: "the restored view never showed Tiefgarage as selected",
    });
  });

  it("asks for a choice once the selected community is gone and two are left", async function () {
    await writeNote(`${FOLDER}/Birkenallee.md`, BA);
    await expectListed(["Ahornweg 12", "Birkenallee", "Tiefgarage"]);
    await browser.executeObsidian(async ({ app }, path) => {
      const file = app.vault.getFileByPath(path);
      if (file !== null) await app.fileManager.trashFile(file);
    }, `${FOLDER}/Tiefgarage.md`);
    await expectListed(["Ahornweg 12", "Birkenallee"]);
    await browser.waitUntil(async () => (await selectedInViews())[0] === "", {
      timeoutMsg: "the view kept a selection",
    });
    expect(await choiceText()).toBe("Wähle die Gemeinschaft, in der du arbeitest.");
  });

  it("logged no error or warning from the plugin and no uncaught error", async function () {
    expect(await pluginProblems()).toEqual([]);
  });
});
