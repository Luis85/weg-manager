import { afterEach, describe, expect, it } from "vitest";
import { de } from "../../../../src/application/messages";
import { NoteStore } from "../../../../src/application/notes";
import { communityId, communityNote } from "../../../support/communities/fixture";
import { contactId, contactNote } from "../../../support/contacts/fixture";
import { closeContacts, openContacts, type ContactsScreen } from "../../../support/contacts/screen";
import type { Memory } from "../../../support/communities/screen";

afterEach(closeContacts);

const t = de.contacts;
const AW = communityId(101);
const TG = communityId(102);
const FOLDER = "WEG Manager/Kontakte";

/** Two communities, Ahornweg (AW) and Tiefgarage (TG), and `contacts`. */
const vault =
  (...contacts: [string, Record<string, unknown>][]) =>
  (notes: Memory) => {
    notes.seed(
      "WEG Manager/Gemeinschaften/Ahornweg.md",
      communityNote(101, { name: "Ahornweg", short_code: "AW" }),
    );
    notes.seed(
      "WEG Manager/Gemeinschaften/Tiefgarage.md",
      communityNote(102, { name: "Tiefgarage", short_code: "TG", color: "blue" }),
    );
    for (const [path, frontmatter] of contacts) notes.seed(`${FOLDER}/${path}`, frontmatter);
  };

const contactsIn = async (screen: ContactsScreen) => {
  const notes = await screen.runtime.runPromise(NoteStore.use((store) => store.list));
  return notes.filter((note) => note.path.startsWith(FOLDER));
};

describe("the contacts screen", () => {
  it("lists contacts with kind, company, roles by short code and the private mark", async () => {
    const screen = await openContacts({
      seed: vault(
        [
          "Verwaltung.md",
          contactNote(1, AW, { name: "Verwaltung", kind: "company", roles: [`${AW}:manager`] }),
        ],
        [
          "Erika.md",
          contactNote(2, AW, {
            name: "Erika",
            organization_id: contactId(1),
            roles: [`${AW}:board`, `${TG}:owner`],
            private: true,
          }),
        ],
      ),
    });
    await screen.until(() => expect(screen.names()).toEqual(["Erika", "Verwaltung"]));
    const [erika, firm] = screen.all("contact");
    expect(erika?.querySelector("[data-testid=contact-summary]")?.textContent).toContain(
      `Person · ${t.screen.worksFor("Verwaltung")}`,
    );
    expect(erika?.querySelector("[data-testid=contact-roles]")?.textContent).toContain(
      "Beirat (AW)",
    );
    expect(erika?.querySelector("[data-testid=contact-roles]")?.textContent).toContain(
      "Eigentümer (TG)",
    );
    expect(erika?.querySelector("[data-testid=contact-private]")?.textContent).toContain(
      t.screen.private,
    );
    expect(firm?.querySelector("[data-testid=contact-summary]")?.textContent).toContain(
      t.screen.people("Erika"),
    );
    expect(screen.text("contacts-intro")).toBe(t.screen.intro("WEG Manager/Kontakte"));
  });

  it("hides inactive contacts until asked, and says how many it hides", async () => {
    const screen = await openContacts({
      seed: vault(
        ["A.md", contactNote(1, AW, { name: "A" })],
        ["B.md", contactNote(2, AW, { name: "B", inactive: true })],
      ),
    });
    await screen.until(() => expect(screen.names()).toEqual(["A"]));
    expect(screen.text("hidden-inactive")).toBe(t.screen.hiddenInactive(1));
    await screen.click(screen.q("show-inactive"));
    expect(screen.names()).toEqual(["A", "B"]);
    expect(screen.q("contact-inactive")?.textContent).toContain(t.screen.inactive);
  });

  it("shows a missing private mark on an owner as an issue (criterion 10)", async () => {
    const screen = await openContacts({
      seed: vault(["E.md", contactNote(1, AW, { name: "E", roles: [`${TG}:owner`] })]),
    });
    await screen.until(() =>
      expect(screen.text("contact-issues")).toBe(
        t.issues["private.missing"]({ key: "private", code: "private.missing" }, "Privat"),
      ),
    );
  });

  it("creates a person with a role, and says so when another contact has the name", async () => {
    const screen = await openContacts({
      seed: vault(["Max.md", contactNote(1, AW, { name: "Max Muster" })]),
    });
    await screen.click(screen.q("contact-add"));
    await screen.type("field-name", "max muster");
    expect(screen.text("same-name")).toBe(t.form.sameName("Max Muster"));
    await screen.type("field-name", "Erika Beispiel");
    expect(screen.q("same-name")).toBeUndefined();
    await screen.click(screen.q("role-add"));
    await screen.choose(screen.q("role-role"), "deputy");
    await screen.type("field-email", "erika@example.org");
    await screen.click(screen.q("contact-save"));
    await screen.until(() => expect(screen.q("contact-form")).toBeUndefined());
    const written = (await contactsIn(screen)).find(
      (note) => note.path === `${FOLDER}/Erika Beispiel.md`,
    );
    expect(written?.frontmatter).toMatchObject({
      name: "Erika Beispiel",
      kind: "person",
      roles: [`${AW}:deputy`],
      email: "erika@example.org",
    });
    expect(written?.frontmatter).not.toHaveProperty("private");
  });

  it("refuses a contact without a role, at the field", async () => {
    const screen = await openContacts({ seed: vault() });
    await screen.click(screen.q("contact-add"));
    await screen.type("field-name", "Ohne Rolle");
    await screen.click(screen.q("contact-save"));
    expect(screen.text("roles-error")).toBe(t.missing.roles);
    expect(screen.q("form-summary")).toBeDefined();
    expect(await contactsIn(screen)).toEqual([]);
  });

  it("sets the private mark with an owner role and keeps it (criterion 8)", async () => {
    const screen = await openContacts({ seed: vault() });
    await screen.click(screen.q("contact-add"));
    await screen.type("field-name", "Eigentümerin");
    await screen.click(screen.q("role-add"));
    await screen.choose(screen.q("role-role"), "owner");
    const mark = screen.q("field-private") as HTMLInputElement;
    expect([mark.checked, mark.getAttribute("aria-disabled")]).toEqual([true, "true"]);
    await screen.click(mark);
    expect((screen.q("field-private") as HTMLInputElement).checked).toBe(true);
    await screen.click(screen.q("contact-save"));
    await screen.until(async () =>
      expect((await contactsIn(screen))[0]?.frontmatter).toMatchObject({
        roles: [`${AW}:owner`],
        private: true,
      }),
    );
  });

  it("creates a new company with the person and links them (criterion 4)", async () => {
    const screen = await openContacts({ seed: vault() });
    await screen.click(screen.q("contact-add"));
    await screen.type("field-name", "Erika");
    await screen.choose(screen.q("field-organization_id"), "new");
    await screen.type("field-new-company", "Hausverwaltung Beispiel");
    await screen.click(screen.q("role-add"));
    await screen.choose(screen.q("role-role"), "manager");
    await screen.click(screen.q("contact-save"));
    await screen.until(() => expect(screen.names()).toEqual(["Erika", "Hausverwaltung Beispiel"]));
    const notes = await contactsIn(screen);
    const company = notes.find((note) => note.frontmatter["kind"] === "company");
    const person = notes.find((note) => note.frontmatter["kind"] === "person");
    expect(company?.frontmatter).toMatchObject({
      name: "Hausverwaltung Beispiel",
      roles: [`${AW}:manager`],
    });
    expect(person?.frontmatter["organization_id"]).toBe(company?.frontmatter["id"]);
  });

  it("offers a community only once in the roles, and nothing to add without communities", async () => {
    const screen = await openContacts({ seed: vault() });
    await screen.click(screen.q("contact-add"));
    await screen.click(screen.q("role-add"));
    await screen.click(screen.q("role-add"));
    const [first, second] = screen.all("role-community") as HTMLSelectElement[];
    expect([first?.value, second?.value]).toEqual([AW, TG]);
    expect([...(second?.options ?? [])].map((option) => option.value)).toEqual([TG]);
    expect(screen.q("role-add")).toBeUndefined();
    await screen.click(screen.q("role-remove"));
    expect(
      (screen.all("role-community") as HTMLSelectElement[]).map((select) => select.value),
    ).toEqual([TG]);
  });
});
