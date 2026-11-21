import { browser, expect } from "@wdio/globals";
import { describe, it } from "mocha";
import {
  FOLDER,
  expectFormClosed,
  expectListed,
  fileText,
  filesIn,
  fillForm,
  saveForm,
  useVaultTrash,
  writeNote,
} from "../communities";
import { ROOT, installConsoleSpy, openView, pluginProblems } from "../support";

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
        "„Kürzel“ hat nicht 2 bis 5 Zeichen aus A–Z und 0–9. Gib ein solches Kürzel ein.",
      ),
    );
    await expect(form).toHaveText(expect.stringContaining("„Farbe“ fehlt. Gib einen Wert ein."));
    await expect(root.$("input[type=radio][value=teal]")).toBeDisabled();
    await browser.keys("Escape");
    await expectFormClosed();
    expect(await filesIn("WEG Manager")).toEqual([PATH]);
  });

  it("saves an edit and renames the file, keeping unknown keys and the body", async function () {
    const before = (await fileText(PATH)) ?? "";
    await writeNote(
      PATH,
      before.replace("unit_label: Einheiten\n", "unit_label: Einheiten\nreviewer: Agent\n") +
        "# Eigene Notizen\n",
    );
    await browser.pause(300);
    const root = browser.$(ROOT);
    await root.$("button[aria-label='Ahornweg 12 bearbeiten']").click();
    await expect(root.$("[data-testid=field-short_code]")).toHaveAttribute("readonly");
    await fillForm({ name: "Ahornweg 12a", kind: "Haus" });
    await saveForm();
    await expectFormClosed();
    await expectListed(["Ahornweg 12a"]);
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
        "unit_label: Einheiten",
        "reviewer: Agent",
        "---",
        "# Eigene Notizen",
        "",
      ].join("\n"),
    );
  });

  it("deletes after a confirmation into the trash set in Obsidian", async function () {
    const root = browser.$(ROOT);
    await root.$("button[aria-label='Ahornweg 12a löschen']").click();
    await expect(root.$("[role=dialog]")).toHaveText(
      expect.stringContaining(
        "„Ahornweg 12a“ kommt in den Papierkorb, den du in Obsidian eingestellt hast.",
      ),
    );
    await root.$("[data-testid=delete-confirm]").click();
    await expect(root.$("[data-testid=communities-empty]")).toBeDisplayed();
    expect(await filesIn("WEG Manager")).toEqual([]);
    expect(await fileText(".trash/Ahornweg 12a.md")).toContain(`id: ${id}`);
  });

  it("logged no error or warning from the plugin and no uncaught error", async function () {
    expect(await pluginProblems()).toEqual([]);
  });
});
