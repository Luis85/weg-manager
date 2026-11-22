import { browser, expect } from "@wdio/globals";
import { describe, it } from "mocha";
import { expectFormClosed, fillForm, filesIn } from "../communities";
import { ROOT, installConsoleSpy, openView, pluginProblems } from "../support";
import { de } from "../texts";

const t = de.notes.discard;

const form = () => browser.$(ROOT).$("[data-testid=community-form]");
const question = () => browser.$(ROOT).$("[data-testid=discard-dialog]");
const button = (label: string) => browser.$(ROOT).$(`button=${label}`);

/** The accessible name of the focused element, or its text. */
const focusedName = () =>
  browser.execute(() => {
    const element = document.activeElement;
    return element?.getAttribute("aria-label") ?? element?.textContent?.trim() ?? "";
  });

/** The accessible name of the question's dialog: the text of the element that labels it. */
const questionName = () =>
  browser.execute((selector) => {
    const dialog = document
      .querySelector(`${selector} [data-testid=discard-dialog]`)
      ?.closest("[role=dialog]");
    const id = dialog?.getAttribute("aria-labelledby") ?? "";
    return document.getElementById(id)?.textContent?.trim() ?? "";
  }, ROOT);

/**
 * A click beside the sheet: on its overlay near its left edge, as a person clicks into the view
 * behind it (the overlay's centre lies under the sheet).
 */
const clickOutside = async () => {
  const overlay = browser.$(ROOT).$("[data-slot=overlay]");
  await overlay.waitForDisplayed();
  const { width } = await overlay.getSize();
  await overlay.click({ x: -Math.floor(width / 2) + 20 });
};

/** Opens the create sheet and waits until its Name field has the focus. */
const openCreate = async () => {
  await browser.$(ROOT).$("[data-testid=community-add]").click();
  await expect(browser.$(ROOT).$("[data-testid=field-name]")).toBeFocused();
};

/**
 * PBI-72 in real Obsidian: a record sheet with unsaved input asks before Escape or a click beside
 * it discards the input, with keep editing first; without input it closes as before.
 */
describe("communities: asking before typed input is discarded", function () {
  it("asks on Escape with typed input, and keeps editing on Escape in the question", async function () {
    await installConsoleSpy();
    await openView();
    await expect(browser.$(ROOT).$("[data-testid=communities-empty]")).toBeDisplayed();
    await openCreate();
    await fillForm({ name: "Tiefgarage" });
    await browser.keys("Escape");
    await expect(question()).toBeDisplayed();
    expect(await questionName()).toBe(t.title);
    await browser.waitUntil(async () => (await focusedName()) === t.keep, {
      timeoutMsg: "the focus never reached keep editing",
    });
    await expect(form()).toBeDisplayed();
    await browser.keys("Escape");
    await expect(question()).not.toExist();
    await expect(browser.$(ROOT).$("[data-testid=field-name]")).toHaveValue("Tiefgarage");
  });

  it("asks on a click beside the sheet with typed input, and discards on request", async function () {
    await clickOutside();
    await expect(question()).toBeDisplayed();
    await expect(form()).toBeDisplayed();
    await button(t.confirm).click();
    await expectFormClosed();
    await expect(question()).not.toExist();
    expect(await filesIn("WEG Manager")).toEqual([]);
  });

  it("closes on Escape and on a click beside it without a question when nothing was typed", async function () {
    await openCreate();
    await browser.keys("Escape");
    await expectFormClosed();
    await expect(question()).not.toExist();
    await openCreate();
    await clickOutside();
    await expectFormClosed();
    await expect(question()).not.toExist();
  });

  it("logged no error or warning from the plugin and no uncaught error", async function () {
    expect(await pluginProblems()).toEqual([]);
  });
});
