import { afterEach, describe, expect, it } from "vitest";
import { NoteStore } from "../../../../src/application/notes";
import {
  FOLDER,
  closeAll,
  communityNote,
  fill,
  openCommunities,
  save,
  type OpenScreen,
} from "../../../support/communities/screen";

afterEach(closeAll);

const PATH = `${FOLDER}/Ahornweg 12.md`;
const AW = communityNote(1, { name: "Ahornweg 12", short_code: "AW" });

const read = (screen: OpenScreen, path = PATH) =>
  screen.runtime.runPromise(NoteStore.use((store) => store.read(path)));
const paths = (screen: OpenScreen) =>
  screen.runtime
    .runPromise(NoteStore.use((store) => store.list))
    .then((notes) => notes.map((note) => note.path));

/** The app with Ahornweg 12 (and `extra` notes), its form open. */
const editing = async (frontmatter: Record<string, unknown> = AW) => {
  const screen = await openCommunities({
    seed: (notes) => notes.seed(PATH, frontmatter, "Notizen\n"),
  });
  await screen.click(screen.q("community-edit"));
  expect(screen.q("community-form")).toBeDefined();
  return screen;
};

describe("editing a community", () => {
  it("loads the note's values, keeps the short code fixed and says so", async () => {
    const screen = await editing();
    expect(screen.root.querySelector("[role=dialog]")?.textContent).toContain(
      "Gemeinschaft bearbeiten",
    );
    expect(
      ["name", "short_code", "kind", "unit_label"].map((key) => screen.input(`field-${key}`).value),
    ).toEqual(["Ahornweg 12", "AW", "WEG", "Einheiten"]);
    expect(screen.input("field-short_code").readOnly).toBe(true);
    expect(screen.q("community-form")?.textContent).toContain(
      "Das Kürzel ist nach dem Anlegen fest.",
    );
    const teal = screen.root.querySelector<HTMLInputElement>("input[type=radio][value=teal]");
    expect([teal?.checked, teal?.disabled]).toEqual([true, false]);
  });

  it("saves a change, renames the file with the name and keeps the body", async () => {
    const screen = await editing();
    await fill(screen, { name: "Ahornweg 12a", kind: "Haus" });
    await save(screen);
    await screen.until(() => expect(screen.q("community-form")).toBeUndefined());
    expect(await paths(screen)).toEqual([`${FOLDER}/Ahornweg 12a.md`]);
    expect((await read(screen, `${FOLDER}/Ahornweg 12a.md`)).frontmatter).toEqual({
      ...AW,
      name: "Ahornweg 12a",
      kind: "Haus",
    });
    expect(screen.notes.body(`${FOLDER}/Ahornweg 12a.md`)).toBe("Notizen\n");
    await screen.until(() => expect(screen.names()).toEqual(["Ahornweg 12a"]));
  });

  it("merges an outside change to another field", async () => {
    const screen = await editing();
    screen.notes.seed(PATH, { ...AW, unit_label: "Wohnungen" });
    await fill(screen, { kind: "Haus" });
    await save(screen);
    await screen.until(() => expect(screen.q("community-form")).toBeUndefined());
    expect((await read(screen)).frontmatter).toEqual({
      ...AW,
      kind: "Haus",
      unit_label: "Wohnungen",
    });
  });

  it("shows a conflict per field and saves the note's value when the user takes it", async () => {
    const screen = await editing();
    screen.notes.seed(PATH, { ...AW, kind: "Tiefgarage" });
    await fill(screen, { kind: "Haus", unit_label: "Wohnungen" });
    await save(screen);
    const conflict = screen.q("community-conflict");
    expect(conflict?.querySelector("h3")?.textContent.trim()).toBe("Notiz inzwischen geändert");
    expect(
      [...(screen.q("conflict-kind")?.querySelectorAll("legend, p, label") ?? [])].map((part) =>
        part.textContent.trim(),
      ),
    ).toEqual(["Art", "Beim Öffnen: WEG", "Deine Eingabe: Haus", "In der Notiz: Tiefgarage"]);
    expect(screen.all("conflict-kind")).toHaveLength(1);
    expect((screen.q("community-save") as HTMLButtonElement).disabled).toBe(true);
    expect((await read(screen)).frontmatter).toEqual({ ...AW, kind: "Tiefgarage" });
    await screen.click(
      screen.q("conflict-kind")?.querySelector("[data-testid=choose-theirs]") ?? undefined,
    );
    await screen.click(screen.q("conflict-apply"));
    await screen.until(() => expect(screen.q("community-form")).toBeUndefined());
    expect((await read(screen)).frontmatter).toEqual({
      ...AW,
      kind: "Tiefgarage",
      unit_label: "Wohnungen",
    });
  });

  it("saves the user's value when the user keeps it", async () => {
    const screen = await editing();
    screen.notes.seed(PATH, { ...AW, kind: "Tiefgarage" });
    await fill(screen, { kind: "Haus" });
    await save(screen);
    await screen.click(screen.q("conflict-apply"));
    await screen.until(() => expect(screen.q("community-form")).toBeUndefined());
    expect((await read(screen)).frontmatter).toEqual({ ...AW, kind: "Haus" });
  });

  it("takes an empty note value into an editable form that saves once the field is valid", async () => {
    const screen = await editing();
    // Someone empties the property in Obsidian while the form is open.
    screen.notes.seed(PATH, { ...AW, kind: null });
    await fill(screen, { kind: "Haus" });
    await save(screen);
    await screen.click(
      screen.q("conflict-kind")?.querySelector("[data-testid=choose-theirs]") ?? undefined,
    );
    await screen.click(screen.q("conflict-apply"));
    expect(screen.q("community-conflict")).toBeUndefined();
    expect(screen.input("field-kind").value).toBe("");
    expect(screen.q("community-form")?.textContent).toContain("„Art“ fehlt. Gib einen Wert ein.");
    const saveButton = () => screen.q("community-save") as HTMLButtonElement;
    expect(saveButton().disabled).toBe(false);
    expect((await read(screen)).frontmatter).toEqual({ ...AW, kind: null });
    await fill(screen, { kind: "Reihenhaus" });
    await save(screen);
    await screen.until(() => expect(screen.q("community-form")).toBeUndefined());
    expect((await read(screen)).frontmatter).toEqual({ ...AW, kind: "Reihenhaus" });
  });

  it("tells the user when the note is gone, and keeps the input", async () => {
    const screen = await editing();
    await screen.runtime.runPromise(NoteStore.use((store) => store.trash(PATH)));
    await fill(screen, { kind: "Haus" });
    await save(screen);
    const alert = screen.q("community-form")?.querySelector("[role=alert]");
    expect(alert?.textContent).toContain("Notiz nicht gefunden");
    expect(alert?.textContent).toContain(
      "Die Notiz wurde verschoben oder gelöscht. Prüfe, ob sie noch im Vault liegt.",
    );
    expect(screen.input("field-kind").value).toBe("Haus");
  });

  it("shows a broken field's raw value and issue until the user repairs it", async () => {
    const screen = await editing({ ...AW, short_code: "a1", unit_label: 12 });
    expect(screen.input("field-short_code").readOnly).toBe(false);
    expect(screen.input("field-short_code").value).toBe("a1");
    expect(screen.input("field-unit_label").value).toBe("12");
    const form = () => screen.q("community-form")?.textContent ?? "";
    expect(form()).toContain(
      "„Kürzel“ hat nicht 2 bis 5 Zeichen aus A–Z und 0–9. Gib ein solches Kürzel ein.",
    );
    expect(form()).toContain(
      "„Einheitenbezeichnung“ ist leer, länger als 50 Zeichen oder mehrzeilig.",
    );
    await fill(screen, { short_code: "a1b", unit_label: "Einheiten" });
    expect(form()).not.toContain("„Einheitenbezeichnung“ ist leer");
    await save(screen);
    await screen.until(() => expect(screen.q("community-form")).toBeUndefined());
    expect((await read(screen)).frontmatter).toEqual({ ...AW, short_code: "A1B" });
  });
});
