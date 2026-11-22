import { browser, expect } from "@wdio/globals";
import { describe, it } from "mocha";
import {
  FOLDER,
  expectFormClosed,
  expectListed,
  expectSummary,
  fileText,
  filesIn,
  fillForm,
  saveForm,
  useVaultTrash,
  writeNote,
} from "../communities";
import { ROOT, expectNotice, installConsoleSpy, openView, pluginProblems } from "../support";
import { de } from "../texts";

const PATH = `${FOLDER}/Ahornweg 12.md`;
const ID = /^id: (community-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/m;

/** PBI-56: a community is created, edited and deleted as a note, in real Obsidian. */
describe("communities: create, edit and delete", function () {
  let id = "";

  it("creates a community from the form as a note named after it", async function () {
    await installConsoleSpy();
    await useVaultTrash();
    await openView();
    const root = browser.$(ROOT);
    await expect(root.$("[data-testid=communities-empty]")).toBeDisplayed();
    await root.$("[data-testid=community-add]").click();
    await fillForm({
      name: "Ahornweg 12",
      short_code: "aw",
      kind: "WEG",
      unit_label: "Einheiten",
      color: "teal",
    });
    await expect(root.$("[data-testid=field-short_code]")).toHaveValue("AW");
    await saveForm();
    await expectFormClosed();
    await expectListed(["Ahornweg 12"]);
    await expectNotice(de.notes.notices.created("Ahornweg 12"));
    const text = (await fileText(PATH)) ?? "";
    id = ID.exec(text)?.[1] ?? "";
    expect(id).not.toBe("");
    expect(text).toBe(
      [
        "---",
        "schema: weg-manager.community/v1",
        `id: ${id}`,
        "name: Ahornweg 12",
        "short_code: AW",
        "color: teal",
        "kind: WEG",
        "unit_label: Einheiten",
        "---",
        "",
      ].join("\n"),
    );
    expect(await filesIn("WEG Manager")).toEqual([PATH]);
  });

  it("never writes a community that breaks a rule", async function () {
    const root = browser.$(ROOT);
    await root.$("[data-testid=community-add]").click();
    await fillForm({ name: "Tiefgarage", short_code: "a", kind: "Tiefgarage" });
    await saveForm();
    const form = root.$("[data-testid=community-form]");
    await expect(form).toHaveText(
      expect.stringContaining(
        de.communities.issues["short-code.invalid"](
          { key: "short_code", code: "short-code.invalid" },
          de.communities.fields.short_code,
        ),
      ),
    );
    await expect(root.$("[data-testid=form-summary]")).toHaveText(
      expect.stringContaining(de.communities.errors.invalid.title),
    );
    // Teal is Ahornweg 12's: it is offered no more, and the form started on the next free one.
    await expect(root.$("input[type=radio][value=teal]")).toBeDisabled();
    await expect(root.$("input[type=radio][value=violet]")).toBeSelected();
    // The form holds typed input, so Escape asks first (PBI-72).
    await browser.keys("Escape");
    await root.$(`button=${de.notes.discard.confirm}`).click();
    await expectFormClosed();
    expect(await filesIn("WEG Manager")).toEqual([PATH]);
  });

  it("saves an edit and renames the file, keeping unknown keys and the body", async function () {
    const before = (await fileText(PATH)) ?? "";
    await writeNote(
      PATH,
      before.replace("unit_label: Einheiten\n", "unit_label: Wohnungen\nreviewer: Agent\n") +
        "# Eigene Notizen\n",
    );
    // The outside edit is not visible, but its unit label is: once the card shows it, the view has
    // read the note with the new key and the body, and the form opens on that.
    await expectSummary("Ahornweg 12", de.communities.screen.summary("WEG", "Wohnungen"));
    const root = browser.$(ROOT);
    await root.$(`button[aria-label='${de.communities.screen.editLabel("Ahornweg 12")}']`).click();
    await expect(root.$("[data-testid=field-short_code]")).toHaveAttribute("readonly");
    await fillForm({ name: "Ahornweg 12a", kind: "Haus" });
    await saveForm();
    await expectFormClosed();
    await expectListed(["Ahornweg 12a"]);
    await expectNotice(de.notes.notices.saved("Ahornweg 12a"));
    expect(await fileText(PATH)).toBeNull();
    expect(await fileText(`${FOLDER}/Ahornweg 12a.md`)).toBe(
      [
        "---",
        "schema: weg-manager.community/v1",
        `id: ${id}`,
        "name: Ahornweg 12a",
        "short_code: AW",
        "color: teal",
        "kind: Haus",
        "unit_label: Wohnungen",
        "reviewer: Agent",
        "---",
        "# Eigene Notizen",
        "",
      ].join("\n"),
    );
  });

  it("deletes after a confirmation into the trash set in Obsidian", async function () {
    const root = browser.$(ROOT);
    await root
      .$(`button[aria-label='${de.communities.screen.removeLabel("Ahornweg 12a")}']`)
      .click();
    await expect(root.$("[role=dialog]")).toHaveText(
      expect.stringContaining(de.notes.deletion.detail("Ahornweg 12a")),
    );
    await expect(root.$("[data-testid=delete-confirm]")).toHaveText(de.notes.deletion.confirm);
    await root.$("[data-testid=delete-confirm]").click();
    await expect(root.$("[data-testid=communities-empty]")).toBeDisplayed();
    await expectNotice(de.notes.notices.deleted("Ahornweg 12a"));
    expect(await filesIn("WEG Manager")).toEqual([]);
    expect(await fileText(".trash/Ahornweg 12a.md")).toContain(`id: ${id}`);
  });

  it("logged no error or warning from the plugin and no uncaught error", async function () {
    expect(await pluginProblems()).toEqual([]);
  });
});
