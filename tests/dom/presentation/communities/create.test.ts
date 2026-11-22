import { de } from "../../../../src/application/messages";
import { afterEach, describe, expect, it } from "vitest";
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

const t = de.communities;

const VALID = {
  name: "Ahornweg 12",
  short_code: "aw",
  kind: "WEG",
  unit_label: "Einheiten",
  color: "teal",
};

const paths = async (screen: OpenScreen) =>
  (
    await screen.runtime.runPromise(
      (await import("../../../../src/application/notes")).NoteStore.use((store) => store.list),
    )
  ).map((note) => note.path);

const openForm = async (screen: OpenScreen) => {
  await screen.click(screen.q("community-add"));
  expect(screen.q("community-form")).toBeDefined();
};

describe("creating a community", () => {
  it("opens the form in a titled sheet from the empty state", async () => {
    const screen = await openCommunities();
    await openForm(screen);
    const dialog = screen.root.querySelector("[role=dialog]");
    expect(dialog?.textContent).toContain("Neue Gemeinschaft");
    // Nuxt UI's own labels follow the UI language too.
    expect(
      [...(dialog?.querySelectorAll("button") ?? [])].map((button) =>
        button.getAttribute("aria-label"),
      ),
    ).toContain("Schließen");
    const labels = [...(screen.q("community-form")?.querySelectorAll("label, legend") ?? [])]
      .map((element) => element.textContent.trim())
      .filter((text) =>
        ["Name", "Kürzel", "Farbe", "Art", "Einheitenbezeichnung"].some((label) =>
          text.startsWith(label),
        ),
      );
    // Every field is required: the inputs say so, no asterisk joins their names.
    expect(labels).toEqual(["Name", "Kürzel", "Farbe", "Art", "Einheitenbezeichnung"]);
    expect(
      ["name", "short_code", "kind", "unit_label"].map((key) =>
        screen.input(`field-${key}`).getAttribute("aria-required"),
      ),
    ).toEqual(["true", "true", "true", "true"]);
    const colors = screen.q("color-field");
    expect([colors?.getAttribute("role"), colors?.getAttribute("aria-required")]).toEqual([
      "radiogroup",
      "true",
    ]);
    expect(screen.input("field-short_code").readOnly).toBe(false);
    expect(screen.q("community-form")?.textContent).toContain(t.shortCodeHint);
    expect(screen.q("community-form")?.textContent).toContain(t.unitLabelHelp);
  });

  it("starts with the first free colour, shows whose the taken ones are and previews the badge", async () => {
    const screen = await openCommunities({
      seed: (notes) =>
        notes.seed(
          `${FOLDER}/A.md`,
          communityNote(1, { name: "A", short_code: "AW", color: "teal" }),
        ),
    });
    await openForm(screen);
    const radio = (color: string) =>
      screen.root.querySelector<HTMLInputElement>(`input[type=radio][value=${color}]`);
    expect([radio("teal")?.checked, radio("violet")?.checked]).toEqual([false, true]);
    const swatches = screen.all("color-swatch").map((swatch) => swatch.textContent.trim());
    expect(swatches.slice(0, 3)).toEqual(["AW", "", ""]);
    expect(screen.q("color-preview")).toBeUndefined();
    await fill(screen, { short_code: "tg" });
    const preview = screen
      .q("color-preview")
      ?.querySelector<HTMLElement>("[data-testid=community-badge]");
    expect([preview?.textContent, preview?.dataset["communityColor"]]).toEqual(["TG", "violet"]);
    expect(screen.text("color-preview")).toBe(`${t.preview} TG`);
  });

  it("keeps the short code's hint in view beside its issue", async () => {
    const screen = await openCommunities();
    await openForm(screen);
    await fill(screen, { short_code: "a" });
    const form = screen.q("community-form")?.textContent ?? "";
    expect(form).toContain(t.shortCodeHint);
    expect(form).toContain(
      t.issues["short-code.invalid"]({ key: "short_code", code: "short-code.invalid" }, "Kürzel"),
    );
  });

  it("writes the note and closes the sheet; the list shows it once indexed", async () => {
    const screen = await openCommunities();
    await openForm(screen);
    await fill(screen, VALID);
    expect(screen.input("field-short_code").value).toBe("AW");
    await save(screen);
    await screen.until(() => expect(screen.q("community-form")).toBeUndefined());
    const note = await screen.runtime.runPromise(
      (await import("../../../../src/application/notes")).NoteStore.use((store) =>
        store.read(`${FOLDER}/Ahornweg 12.md`),
      ),
    );
    expect(note.frontmatter).toEqual({
      schema: "weg-manager.community/v1",
      id: "community-00000000-0000-4000-8000-000000000001",
      name: "Ahornweg 12",
      short_code: "AW",
      color: "teal",
      kind: "WEG",
      unit_label: "Einheiten",
    });
    await screen.until(() => expect(screen.names()).toEqual(["Ahornweg 12"]));
  });

  it("shows the domain's issues at the fields and writes nothing", async () => {
    const screen = await openCommunities();
    await openForm(screen);
    await fill(screen, { name: "x", short_code: "a" });
    await screen.type("field-name", "");
    await save(screen);
    const form = screen.q("community-form")?.textContent ?? "";
    expect(form).toContain(t.missing.name);
    expect(form).toContain(
      t.issues["short-code.invalid"]({ key: "short_code", code: "short-code.invalid" }, "Kürzel"),
    );
    expect(form).not.toContain(t.missing.color);
    expect(form).toContain(t.missing.kind);
    expect(await paths(screen)).toEqual([]);
  });

  it("refuses a taken short code and disables a taken colour, saying so in its name", async () => {
    const screen = await openCommunities({
      seed: (notes) =>
        notes.seed(
          `${FOLDER}/A.md`,
          communityNote(1, { name: "A", short_code: "AW", color: "teal" }),
        ),
    });
    await openForm(screen);
    await fill(screen, { short_code: "aw" });
    expect(screen.q("community-form")?.textContent).toContain(
      t.issues["short-code.taken"](
        { key: "short_code", code: "short-code.taken", value: "AW", other: "A" },
        "Kürzel",
      ),
    );
    const teal = screen.root.querySelector<HTMLInputElement>("input[type=radio][value=teal]");
    const blue = screen.root.querySelector<HTMLInputElement>("input[type=radio][value=blue]");
    expect([teal?.disabled, teal?.getAttribute("aria-label")]).toEqual([
      true,
      t.colorTaken(t.colors.teal),
    ]);
    expect([blue?.disabled, blue?.getAttribute("aria-label")]).toEqual([false, "Blau"]);
    expect(screen.q("color-field")?.querySelector("legend")?.textContent).toBe("Farbe");
  });

  it("suggests the built-in kinds and the ones in use, and a chosen kind fills its unit label", async () => {
    const screen = await openCommunities({
      seed: (notes) =>
        notes.seed(
          `${FOLDER}/A.md`,
          communityNote(1, {
            name: "A",
            kind: "Stellplatzgemeinschaft",
            unit_label: "Stellplätze",
          }),
        ),
    });
    await openForm(screen);
    const suggestions = screen.q("kind-suggestions");
    const caption = suggestions?.querySelector("span");
    expect(caption?.textContent.trim()).toBe(t.suggestions);
    expect(suggestions?.getAttribute("aria-labelledby")).toBe(caption?.id);
    expect(
      [...(suggestions?.querySelectorAll("button") ?? [])].map((button) =>
        button.textContent.trim(),
      ),
    ).toEqual([
      "WEG · Einheiten",
      "Tiefgarage · Stellplätze",
      "Stellplatzgemeinschaft · Stellplätze",
    ]);
    await screen.click(screen.button("Tiefgarage · Stellplätze"));
    expect([screen.input("field-kind").value, screen.input("field-unit_label").value]).toEqual([
      "Tiefgarage",
      "Stellplätze",
    ]);
    await screen.type("field-kind", "WEG");
    expect(screen.input("field-unit_label").value).toBe("Einheiten");
    await screen.type("field-unit_label", "Wohnungen");
    expect(screen.input("field-unit_label").value).toBe("Wohnungen");
    await screen.type("field-kind", "Haus");
    expect(screen.input("field-unit_label").value).toBe("Wohnungen");
  });

  it("ignores Save while the write runs, without taking its focus", async () => {
    const screen = await openCommunities();
    await openForm(screen);
    await fill(screen, VALID);
    screen.notes.holdWrites();
    const button = screen.q("community-save") as HTMLButtonElement;
    button.focus();
    await save(screen);
    expect([button.disabled, button.getAttribute("aria-disabled")]).toEqual([false, "true"]);
    expect(document.activeElement).toBe(button);
    expect(screen.notes.heldWrites()).toBe(1);
    await save(screen);
    expect(screen.notes.heldWrites()).toBe(1);
    screen.notes.releaseWrites();
    await screen.until(() => expect(screen.q("community-form")).toBeUndefined());
    expect(await paths(screen)).toEqual([`${FOLDER}/Ahornweg 12.md`]);
  });

  it("shows a failed write, keeps the input and lets Save try again", async () => {
    const screen = await openCommunities();
    await openForm(screen);
    await fill(screen, VALID);
    screen.notes.setFailWrites(true);
    await save(screen);
    const alert = screen.q("community-form")?.querySelector("[role=alert]");
    expect(alert?.textContent).toContain(de.notes.errors.write.title);
    // One way to try again: Save. The alert offers no second one.
    expect(alert?.querySelector("button")).toBeNull();
    expect(screen.input("field-name").value).toBe("Ahornweg 12");
    screen.notes.setFailWrites(false);
    await save(screen);
    await screen.until(() => expect(screen.q("community-form")).toBeUndefined());
  });

  it("closes without writing on cancel", async () => {
    const screen = await openCommunities();
    await openForm(screen);
    await fill(screen, VALID);
    await screen.click(screen.button("Abbrechen"));
    expect(screen.q("community-form")).toBeUndefined();
    expect(await paths(screen)).toEqual([]);
  });
});
