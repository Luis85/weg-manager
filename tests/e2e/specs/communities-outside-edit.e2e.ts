import { browser, expect } from "@wdio/globals";
import { describe, it } from "mocha";
import {
  FOLDER,
  community,
  communityText,
  expectFormClosed,
  expectListed,
  fileText,
  fillForm,
  saveForm,
  writeNote,
} from "../communities";
import { ROOT, installConsoleSpy, openView, pluginProblems } from "../support";

const PATH = `${FOLDER}/Ahornweg 12.md`;
const AW = community(1, { name: "Ahornweg 12", short_code: "AW" });

/** The note's text with `change` on top of `AW`. */
const text = (change: Readonly<Record<string, string>> = {}) =>
  communityText({ ...AW, ...change }, "Notizen\n");

const openEdit = async () => {
  await browser.$(ROOT).$("button[aria-label='Ahornweg 12 bearbeiten']").click();
  await expect(browser.$(ROOT).$("[data-testid=community-form]")).toBeDisplayed();
};

/** ADR 0007, DF-23: an outside edit while the form is open is merged or offered as a choice. */
describe("communities: an outside edit while the form is open", function () {
  it("merges an outside change to another field", async function () {
    await installConsoleSpy();
    await writeNote(PATH, text());
    await openView();
    await expectListed(["Ahornweg 12"]);
    await openEdit();
    await writeNote(PATH, text({ unit_label: "Wohnungen" }));
    await browser.pause(300);
    await fillForm({ kind: "Haus" });
    await saveForm();
    await expectFormClosed();
    expect(await fileText(PATH)).toBe(text({ kind: "Haus", unit_label: "Wohnungen" }));
  });

  it("writes nothing on a conflict, shows the values and saves the user's choice", async function () {
    await writeNote(PATH, text());
    await browser.pause(300);
    await openEdit();
    await writeNote(PATH, text({ kind: "Tiefgarage" }));
    await browser.pause(300);
    await fillForm({ kind: "Haus" });
    await saveForm();
    const conflict = browser.$(ROOT).$("[data-testid=conflict-kind]");
    // The conflict takes the focus to its heading: Save, which held it, does nothing now.
    await expect(browser.$(ROOT).$("[data-testid=record-conflict] h3")).toBeFocused();
    await expect(conflict).toHaveText(expect.stringContaining("Beim Öffnen: WEG"));
    await expect(conflict).toHaveText(expect.stringContaining("Deine Eingabe: Haus"));
    await expect(conflict).toHaveText(expect.stringContaining("Jetzt in der Notiz: Tiefgarage"));
    expect(await fileText(PATH)).toBe(text({ kind: "Tiefgarage" }));
    await conflict.$("[data-testid=choose-theirs]").click();
    await browser.$(ROOT).$("[data-testid=conflict-apply]").click();
    await expectFormClosed();
    expect(await fileText(PATH)).toBe(text({ kind: "Tiefgarage" }));
  });

  it("saves the user's value when the user keeps it", async function () {
    await openEdit();
    await writeNote(PATH, text({ kind: "Garage" }));
    await browser.pause(300);
    await fillForm({ kind: "Haus" });
    await saveForm();
    await expect(browser.$(ROOT).$("[data-testid=record-conflict]")).toBeDisplayed();
    await browser.$(ROOT).$("[data-testid=conflict-apply]").click();
    await expectFormClosed();
    expect(await fileText(PATH)).toBe(text({ kind: "Haus" }));
  });

  it("logged no error or warning from the plugin and no uncaught error", async function () {
    expect(await pluginProblems()).toEqual([]);
  });
});
