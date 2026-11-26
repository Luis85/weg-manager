import { browser, expect } from "@wdio/globals";
import { describe, it } from "mocha";
import { community, communityText, fileText, writeNote } from "../communities";
import { ROOT, expectNotice, installConsoleSpy, openView, pluginProblems } from "../support";
import { de } from "../texts";

const FOLDER = "WEG Manager/Kontakte";
const PATH = `${FOLDER}/Erika Beispiel.md`;
const AW = community(1, { name: "Ahornweg", short_code: "AW" });
const ID = /^id: (contact-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/m;

const names = () =>
  browser
    .$(ROOT)
    .$$("[data-testid=contact-name]")
    .map((element) => element.getText());

/** PBI-02: a contact is created with a role and marked inactive as a note, in real Obsidian. */
describe("contacts: create with a role, mark inactive", function () {
  it("opens the contacts from the frame's navigation", async function () {
    await installConsoleSpy();
    await writeNote("WEG Manager/Gemeinschaften/Ahornweg.md", communityText(AW));
    await openView();
    const root = browser.$(ROOT);
    await root.$("[data-testid=frame-navigation]").$(`button*=${de.contacts.route}`).click();
    await expect(root.$("[data-testid=contacts-empty]")).toBeDisplayed();
  });

  it("creates an owner, who is private, as a note with the role by community id", async function () {
    const root = browser.$(ROOT);
    await root.$("[data-testid=contact-add]").click();
    await root.$("[data-testid=field-name]").setValue("Erika Beispiel");
    await root.$("[data-testid=role-add]").click();
    await root.$("[data-testid=role-role]").selectByAttribute("value", "owner");
    await expect(root.$("[data-testid=field-private]")).toBeSelected();
    await expect(root.$("[data-testid=field-private]")).toHaveAttribute("aria-disabled", "true");
    await root.$("[data-testid=field-email]").setValue("erika@example.org");
    await root.$("[data-testid=contact-save]").click();
    await expect(root.$("[data-testid=contact-form]")).not.toExist();
    await expectNotice(de.notes.notices.created("Erika Beispiel"));
    await browser.waitUntil(async () => (await names()).join() === "Erika Beispiel");
    const text = (await fileText(PATH)) ?? "";
    const id = ID.exec(text)?.[1] ?? "";
    expect(id).not.toBe("");
    expect(text).toBe(
      [
        "---",
        "schema: weg-manager.contact/v1",
        `id: ${id}`,
        "name: Erika Beispiel",
        "kind: person",
        "roles:",
        `  - ${AW.id}:owner`,
        "email: erika@example.org",
        "private: true",
        "---",
        "",
      ].join("\n"),
    );
    await expect(root.$("[data-testid=contact-roles]")).toHaveText(
      expect.stringContaining(de.contacts.screen.roleIn(de.contacts.roles.owner, "AW")),
    );
    await expect(root.$("[data-testid=contact-private]")).toBeDisplayed();
  });

  it("marks the contact inactive: the note stays, the list hides it until asked", async function () {
    const root = browser.$(ROOT);
    await root.$("[data-testid=contact-edit]").click();
    await root.$("[data-testid=field-inactive]").click();
    await root.$("[data-testid=contact-save]").click();
    await expect(root.$("[data-testid=contact-form]")).not.toExist();
    await expect(root.$("[data-testid=hidden-inactive]")).toHaveText(
      de.contacts.screen.hiddenInactive(1),
    );
    expect(await names()).toEqual([]);
    expect(await fileText(PATH)).toContain("inactive: true");
    await root.$("[data-testid=show-inactive]").click();
    await browser.waitUntil(async () => (await names()).join() === "Erika Beispiel");
  });

  it("logged no error or warning from the plugin and no uncaught error", async function () {
    expect(await pluginProblems()).toEqual([]);
  });
});
