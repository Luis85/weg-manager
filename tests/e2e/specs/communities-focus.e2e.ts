import { browser, expect } from "@wdio/globals";
import { describe, it } from "mocha";
import {
  FOLDER,
  community,
  communityText,
  expectListed,
  fillForm,
  writeNote,
} from "../communities";
import { ROOT, installConsoleSpy, openView, pluginProblems } from "../support";

/** What has the focus: its test id or tag, and its accessible name or text. */
const focused = () =>
  browser.execute(() => {
    const element = document.activeElement;
    if (element === null) return "none";
    const id = element.getAttribute("data-testid") ?? element.tagName.toLowerCase();
    const name = element.getAttribute("aria-label") ?? element.textContent?.trim() ?? "";
    return `${id}: ${name}`.slice(0, 80);
  });

const expectFocus = (expected: string) =>
  browser.waitUntil(async () => (await focused()) === expected, {
    timeoutMsg: `the focus never reached "${expected}"`,
  });

/** Whether the plugin's frame is inert and the open dialog says it is modal. */
const modality = () =>
  browser.execute((selector) => {
    const root = document.querySelector(selector);
    return {
      frameInert: root?.querySelector("[data-testid=app-frame]")?.hasAttribute("inert") ?? null,
      ariaModal: root?.querySelector("[role=dialog]")?.getAttribute("aria-modal") ?? null,
    };
  }, ROOT);

/** The names of the elements the Tab key reaches inside the open dialog, in order. */
const tabOrder = async (steps: number) => {
  const order: string[] = [];
  for (let step = 0; step < steps; step += 1) {
    order.push(await focused());
    await browser.keys("Tab");
  }
  return order;
};

/**
 * WCAG 2.4.3, 3.3.1, 4.1.3 in real Obsidian: where the focus lands when the sheet and the dialog
 * open and close, after a create, an edit, a delete and a failed submit; that both are modal (the
 * frame inert, `aria-modal`) and keep the focus inside.
 */
describe("communities: focus and modality", function () {
  it("opens the sheet modal with the focus on Name and keeps Tab inside", async function () {
    await installConsoleSpy();
    await openView();
    const root = browser.$(ROOT);
    await expect(root.$("[data-testid=communities-empty]")).toBeDisplayed();
    await root.$("[data-testid=community-add]").click();
    await expectFocus("field-name: ");
    expect(await modality()).toEqual({ frameInert: true, ariaModal: "true" });
    const order = await tabOrder(16);
    // From the last control Tab wraps around to the first one in the sheet, never to the frame.
    expect(order.every((entry) => !entry.startsWith("community-add"))).toBe(true);
    expect(order.filter((entry) => entry === "field-name: ")).toHaveLength(2);
    await browser.keys("Escape");
    await expectFocus("community-add: Gemeinschaft anlegen");
    expect(await modality()).toEqual({ frameInert: false, ariaModal: null });
  });

  it("sums up a failed submit and puts the focus on the first invalid field", async function () {
    const root = browser.$(ROOT);
    await root.$("[data-testid=community-add]").click();
    await expectFocus("field-name: ");
    await fillForm({ short_code: "AW" });
    await root.$("[data-testid=community-save]").click();
    await expect(root.$("[data-testid=form-summary]")).toHaveText(
      expect.stringContaining("Einige Angaben fehlen oder passen nicht."),
    );
    await expect(root.$("[data-testid=form-summary]")).toHaveAttribute("role", "alert");
    await expectFocus("field-name: ");
  });

  it("puts the focus on the new card's edit button after a create", async function () {
    await fillForm({ name: "Ahornweg 12", kind: "WEG", unit_label: "Einheiten" });
    await browser.$(ROOT).$("[data-testid=community-save]").click();
    await expectListed(["Ahornweg 12"]);
    await expectFocus("community-edit: Ahornweg 12 bearbeiten");
    expect(await modality()).toEqual({ frameInert: false, ariaModal: null });
  });

  it("stays on the card after its name and file changed", async function () {
    const root = browser.$(ROOT);
    await root.$("button[aria-label='Ahornweg 12 bearbeiten']").click();
    await expectFocus("field-name: ");
    await fillForm({ name: "Ahornweg 14" });
    await root.$("[data-testid=community-save]").click();
    await expectListed(["Ahornweg 14"]);
    await expectFocus("community-edit: Ahornweg 14 bearbeiten");
  });

  it("opens the delete dialog on Abbrechen, and after the delete goes to the create action", async function () {
    const root = browser.$(ROOT);
    await root.$("button[aria-label='Ahornweg 14 löschen']").click();
    await expectFocus("button: Abbrechen");
    expect(await modality()).toEqual({ frameInert: true, ariaModal: "true" });
    await browser.keys("Escape");
    await expectFocus("community-remove: Ahornweg 14 löschen");
    await root.$("button[aria-label='Ahornweg 14 löschen']").click();
    await root.$("[data-testid=delete-confirm]").click();
    await expect(root.$("[data-testid=communities-empty]")).toBeDisplayed();
    await expectFocus("community-add: Gemeinschaft anlegen");
  });

  it("puts the focus on a read-only card's heading when nothing else is there", async function () {
    await writeNote(
      `${FOLDER}/Zukunft.md`,
      communityText({ ...community(7, { name: "Zukunft" }), schema: "weg-manager.community/v2" }),
    );
    await expectListed(["Zukunft"]);
    await expect(browser.$(ROOT).$("[data-testid=community-name]")).toHaveAttribute(
      "tabindex",
      "-1",
    );
  });

  it("logged no error or warning from the plugin and no uncaught error", async function () {
    expect(await pluginProblems()).toEqual([]);
  });
});
