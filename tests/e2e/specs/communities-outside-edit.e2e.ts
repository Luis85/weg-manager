import { browser, expect } from "@wdio/globals";
import { describe, it } from "mocha";
import {
  FOLDER,
  community,
  communityText,
  expectFormClosed,
  expectListed,
  expectSummary,
  fileText,
  fillForm,
  saveForm,
  writeNote,
} from "../communities";
import { ROOT, installConsoleSpy, openView, pluginProblems } from "../support";
import { de } from "../texts";

const PATH = `${FOLDER}/Ahornweg 12.md`;
const AW = community(1, { name: "Ahornweg 12", short_code: "AW" });

/** The note's text with `change` on top of `AW`. */
const text = (change: Readonly<Record<string, string>> = {}) =>
  communityText({ ...AW, ...change }, "Notizen\n");

/** What the card of `AW` shows under its name for a kind (the unit label is the one of `AW`). */
const shows = (kind: string, unitLabel = "Einheiten") =>
  expectSummary("Ahornweg 12", de.communities.screen.summary(kind, unitLabel));

const openEdit = async () => {
  await browser
    .$(ROOT)
    .$(`button[aria-label='${de.communities.screen.editLabel("Ahornweg 12")}']`)
    .click();
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
    // The card behind the sheet follows the note: the user types after the view knows the change.
    await shows("WEG", "Wohnungen");
    await fillForm({ kind: "Haus" });
    await saveForm();
    await expectFormClosed();
    expect(await fileText(PATH)).toBe(text({ kind: "Haus", unit_label: "Wohnungen" }));
  });

  it("writes nothing on a conflict, shows the values and saves the user's choice", async function () {
    await writeNote(PATH, text());
    // The form starts from what the view knows. Opened before the view followed the write, it
    // would start from the kind of the test before and find no conflict below.
    await shows("WEG");
    await openEdit();
    await writeNote(PATH, text({ kind: "Tiefgarage" }));
    await shows("Tiefgarage");
    await fillForm({ kind: "Haus" });
    await saveForm();
    const conflict = browser.$(ROOT).$("[data-testid=conflict-kind]");
    // The conflict takes the focus to its heading: Save, which held it, does nothing now.
    await expect(browser.$(ROOT).$("[data-testid=record-conflict] h3")).toBeFocused();
    await expect(conflict).toHaveText(expect.stringContaining(de.notes.conflict.loaded("WEG")));
    await expect(conflict).toHaveText(expect.stringContaining(de.notes.conflict.mine("Haus")));
    await expect(conflict).toHaveText(
      expect.stringContaining(de.notes.conflict.theirs("Tiefgarage")),
    );
    expect(await fileText(PATH)).toBe(text({ kind: "Tiefgarage" }));
    await conflict.$("[data-testid=choose-theirs]").click();
    await browser.$(ROOT).$("[data-testid=conflict-apply]").click();
    await expectFormClosed();
    expect(await fileText(PATH)).toBe(text({ kind: "Tiefgarage" }));
  });

  it("saves the user's value when the user keeps it", async function () {
    await openEdit();
    await writeNote(PATH, text({ kind: "Garage" }));
    await shows("Garage");
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
