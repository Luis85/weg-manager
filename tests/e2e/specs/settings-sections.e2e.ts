import { browser, expect } from "@wdio/globals";
import { describe, it } from "mocha";
import { overflow } from "../appearance";
import {
  FOLDER,
  community,
  communityText,
  expectListed,
  openSection,
  writeNotes,
} from "../communities";
import { ROOT, VIEW_TYPE, installConsoleSpy, openView, pluginProblems } from "../support";

const SECTIONS = "[data-testid=settings-sections]";

/** The route in the first plugin view's state, as Obsidian keeps it. */
const route = () =>
  browser.executeObsidian(
    ({ app }, type) => app.workspace.getLeavesOfType(type)[0]?.getViewState().state?.["route"],
    VIEW_TYPE,
  );

/** Sets the first plugin view's state, as Obsidian does when it restores a layout. */
const restore = (state: unknown) =>
  browser.executeObsidian(
    async ({ app }, type, next) => {
      await app.workspace
        .getLeavesOfType(type)[0]
        ?.setViewState({ type, state: next as Record<string, unknown> });
    },
    VIEW_TYPE,
    state,
  );

/** The text of the focused element, or nothing when the focus is on the page. */
const focused = () => browser.execute(() => document.activeElement?.textContent?.trim() ?? "");

/** ADR 0008, amendment 22.11.2026: the shell's settings screen, one section per module. */
describe("the settings screen's sections in Obsidian", function () {
  it("shows the communities section under a navigation of every section", async function () {
    await installConsoleSpy();
    await writeNotes([
      [`${FOLDER}/Ahornweg 12.md`, communityText(community(1, { name: "Ahornweg 12" }))],
      [`${FOLDER}/Kaputt.md`, "---\nschema: weg-manager.community/v1\nname: [kaputt\n---\n"],
    ]);
    await openView();
    await expectListed(["Ahornweg 12"]);
    const navigation = browser.$(ROOT).$(SECTIONS);
    await expect(navigation).toHaveAttribute("aria-label", "Bereiche der Einstellungen");
    const entries = async () =>
      (await navigation.$$("button").map((entry) => entry.getText())).map((text) =>
        text.replace(/\s+/g, " "),
      );
    // The badge is a lazily loaded part and follows its own snapshot of the index, so it can come
    // a moment after the communities are listed.
    await browser.waitUntil(async () => (await entries())[1] !== "Datenprobleme", {
      timeoutMsg: "the data issues entry never showed its count",
    });
    expect(await entries()).toEqual(["Gemeinschaften", "Datenprobleme 1 1 Notiz"]);
    await expect(navigation.$("button*=Gemeinschaften")).toHaveAttribute("aria-current", "page");
    expect(await route()).toEqual({ name: "settings", section: "communities" });
  });

  it("opens the data issues as a route of its own and keeps the focus on the entry", async function () {
    await browser.$(ROOT).$(SECTIONS).$("button*=Datenprobleme").click();
    await expect(browser.$(ROOT).$("[data-testid=unindexed-notes]")).toHaveText(
      expect.stringContaining(`${FOLDER}/Kaputt.md`),
    );
    expect(await route()).toEqual({ name: "settings", section: "data-issues" });
    expect(await focused()).toContain("Datenprobleme");
    await expect(browser.$(ROOT).$("[data-testid=communities-screen]")).not.toExist();
    // The frame's one entry, "Einstellungen", is the current page on every section.
    await expect(
      browser.$(ROOT).$("[data-testid=frame-navigation] li button[aria-current=page]"),
    ).toHaveText("Einstellungen");
    // The frame's back control returns to the section before.
    await browser.$(ROOT).$("[data-testid=frame-navigation] button[aria-label='Zurück']").click();
    await expect(browser.$(ROOT).$("[data-testid=communities-screen]")).toBeDisplayed();
  });

  it("restores a saved section, and falls back to the start for one no module has", async function () {
    await restore({ route: { name: "settings", section: "data-issues" } });
    await expect(browser.$(ROOT).$("[data-testid=data-issues-screen]")).toBeDisplayed();
    await restore({ route: { name: "settings", section: "communities" } });
    await expect(browser.$(ROOT).$("[data-testid=communities-screen]")).toBeDisplayed();
    await restore({ route: { name: "settings", section: "contacts" } });
    expect(await route()).toEqual({ name: "settings", section: "communities" });
    await expect(browser.$(ROOT).$("[data-testid=communities-screen]")).toBeDisplayed();
  });

  it("reaches each entry with the keyboard and fits 320 px", async function () {
    await browser.execute((selector) => {
      document.querySelector<HTMLElement>(selector)?.style.setProperty("max-width", "320px");
    }, ROOT);
    await browser.execute((selector) => {
      document
        .querySelector<HTMLElement>(`${selector} [data-testid=settings-sections] button`)
        ?.focus();
    }, ROOT);
    expect(await focused()).toBe("Gemeinschaften");
    await browser.keys("Tab");
    expect(await focused()).toContain("Datenprobleme");
    await browser.keys("Enter");
    await expect(browser.$(ROOT).$("[data-testid=data-issues-screen]")).toBeDisplayed();
    expect(await focused()).toContain("Datenprobleme");
    expect(await overflow()).toEqual({ scroll: 0, past: [] });
    await browser.execute((selector) => {
      document.querySelector<HTMLElement>(selector)?.style.removeProperty("max-width");
    }, ROOT);
    await openSection("Gemeinschaften");
  });

  it("logged no error or warning from the plugin and no uncaught error", async function () {
    expect(await pluginProblems()).toEqual([]);
  });
});
