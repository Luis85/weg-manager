import { afterEach, describe, expect, it } from "vitest";
import { de } from "../../../../src/application/messages";
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
const n = de.notes;

const AW = communityNote(1, { name: "Ahornweg 12", short_code: "AW" });
const VALID = {
  name: "Tiefgarage Ahornweg",
  short_code: "tg",
  kind: "Tiefgarage",
  unit_label: "Stellplätze",
  color: "violet",
};

const active = () => document.activeElement as HTMLElement | null;
const frame = (screen: OpenScreen) => screen.q("app-frame");
const cardOf = (screen: OpenScreen, name: string) =>
  screen.all("community").find((card) => card.textContent.includes(name));

/** Waits until the focus is on `expected()`, which the index may show only a moment later. */
const focusOn = (screen: OpenScreen, expected: () => Element | null | undefined) =>
  screen.until(() => {
    const element = expected();
    expect(element).toBeDefined();
    expect(active()).toBe(element);
  });

describe("the sheet and the dialog are modal", () => {
  it("opens the sheet with the focus on Name, says it is modal and makes the frame inert", async () => {
    const screen = await openCommunities();
    expect(frame(screen)?.hasAttribute("inert")).toBe(false);
    await screen.click(screen.q("community-add"));
    await focusOn(screen, () => screen.input("field-name"));
    expect(screen.root.querySelector("[role=dialog]")?.getAttribute("aria-modal")).toBe("true");
    expect(frame(screen)?.hasAttribute("inert")).toBe(true);
    await screen.click(screen.button(t.form.cancel));
    expect(frame(screen)?.hasAttribute("inert")).toBe(false);
  });

  it("opens the delete dialog with the focus on Abbrechen", async () => {
    const screen = await openCommunities({ seed: (notes) => notes.seed(`${FOLDER}/A.md`, AW) });
    await screen.click(screen.button(t.screen.removeLabel("Ahornweg 12")));
    await focusOn(screen, () => screen.button(n.deletion.cancel));
    expect(screen.root.querySelector("[role=dialog]")?.getAttribute("aria-modal")).toBe("true");
    expect(frame(screen)?.hasAttribute("inert")).toBe(true);
  });
});

describe("the focus after a sheet or dialog", () => {
  it("goes to the new card's edit button after a create from the empty state", async () => {
    const screen = await openCommunities();
    await screen.click(screen.q("community-add"));
    await fill(screen, VALID);
    await save(screen);
    await focusOn(screen, () => screen.button(t.screen.editLabel("Tiefgarage Ahornweg")));
    expect(active()?.getAttribute("data-testid")).toBe("community-edit");
  });

  it("goes back to the create action when the sheet is cancelled", async () => {
    const screen = await openCommunities({ seed: (notes) => notes.seed(`${FOLDER}/A.md`, AW) });
    await screen.click(screen.q("community-add"));
    await screen.click(screen.button(t.form.cancel));
    await focusOn(screen, () => screen.q("community-add"));
    expect(screen.q("community-form")).toBeUndefined();
  });

  it("stays on the edited card when its name, and so its file, changes", async () => {
    const screen = await openCommunities({ seed: (notes) => notes.seed(`${FOLDER}/A.md`, AW) });
    const card = cardOf(screen, "Ahornweg 12");
    await screen.click(screen.q("community-edit"));
    await fill(screen, { name: "Ahornweg 14" });
    await save(screen);
    await screen.until(() => expect(screen.names()).toEqual(["Ahornweg 14"]));
    await focusOn(screen, () => screen.button(t.screen.editLabel("Ahornweg 14")));
    // Keyed by id: the same card, not a new one for the new path.
    expect(cardOf(screen, "Ahornweg 14")).toBe(card);
  });

  it("goes back to the card's delete button when the dialog is cancelled", async () => {
    const screen = await openCommunities({ seed: (notes) => notes.seed(`${FOLDER}/A.md`, AW) });
    await screen.click(screen.button(t.screen.removeLabel("Ahornweg 12")));
    await screen.click(screen.button(n.deletion.cancel));
    await focusOn(screen, () => screen.button(t.screen.removeLabel("Ahornweg 12")));
    expect(screen.q("delete-dialog")).toBeUndefined();
  });

  it("goes to the create action after a delete, also when the list is empty then", async () => {
    const screen = await openCommunities({ seed: (notes) => notes.seed(`${FOLDER}/A.md`, AW) });
    await screen.click(screen.button(t.screen.removeLabel("Ahornweg 12")));
    await screen.click(screen.q("delete-confirm"));
    await screen.until(() => expect(screen.q("communities-empty")).toBeDefined());
    await focusOn(screen, () => screen.q("community-add"));
  });

  it("goes to the conflict's heading when an outside edit collides with the user's", async () => {
    const screen = await openCommunities({ seed: (notes) => notes.seed(`${FOLDER}/A.md`, AW) });
    await screen.click(screen.q("community-edit"));
    screen.notes.seed(`${FOLDER}/A.md`, { ...AW, kind: "Tiefgarage" });
    await fill(screen, { kind: "Haus" });
    (screen.q("community-save") as HTMLButtonElement).focus();
    await save(screen);
    const heading = screen.q("record-conflict")?.querySelector("h3");
    expect([heading?.textContent.trim(), heading?.getAttribute("tabindex")]).toEqual([
      n.conflict.title,
      "-1",
    ]);
    expect(active()).toBe(heading);
  });
});

describe("a failed submit", () => {
  it("is summed up at the top and takes the focus to the first invalid field", async () => {
    const screen = await openCommunities();
    await screen.click(screen.q("community-add"));
    await fill(screen, { short_code: "AW", kind: "WEG" });
    await save(screen);
    const summary = screen.q("form-summary");
    expect(summary?.getAttribute("role")).toBe("alert");
    expect(summary?.textContent).toContain(t.errors.invalid.title);
    expect(summary?.textContent).toContain(t.errors.invalid.detail);
    expect(active()).toBe(screen.input("field-name"));
    expect(screen.input("field-name").getAttribute("aria-invalid")).toBe("true");
    await fill(screen, { name: "Ahornweg 12", unit_label: "Einheiten" });
    expect(screen.q("form-summary")).toBeUndefined();
  });

  it("puts the focus on the first free colour when the colour is the first invalid field", async () => {
    const screen = await openCommunities({
      seed: (notes) => {
        notes.seed(`${FOLDER}/A.md`, communityNote(1, { name: "A", color: "cyan" }));
        notes.seed(`${FOLDER}/B.md`, communityNote(2, { name: "B", short_code: "B2" }));
      },
    });
    await screen.click(screen.button(t.screen.editLabel("A")));
    await save(screen);
    expect(screen.q("color-field")?.getAttribute("aria-invalid")).toBe("true");
    // Teal is B's, so the first colour the user can take is violet.
    expect(active()).toBe(
      screen.root.querySelector("[data-testid=color-field] input[value=violet]"),
    );
  });
});

/** The defects the screen reported, as the log sink received them. */
const defects = (screen: OpenScreen) =>
  screen.logger.entries().filter((entry) => entry.event === "defect.reported");

describe("a defect while saving or deleting", () => {
  it("keeps the sheet open with the input, as anything but a success must", async () => {
    const screen = await openCommunities();
    await screen.click(screen.q("community-add"));
    await fill(screen, VALID);
    screen.notes.setDefectWrites(true);
    await save(screen);
    await screen.until(() => expect(defects(screen)).toHaveLength(1));
    expect(screen.q("community-form")).toBeDefined();
    expect(screen.input("field-name").value).toBe("Tiefgarage Ahornweg");
    expect(screen.notifier.messages().map((message) => message.title)).toEqual([
      de.shell.defect.title,
    ]);
  });

  it("keeps the delete dialog open and reports the defect once", async () => {
    const screen = await openCommunities({ seed: (notes) => notes.seed(`${FOLDER}/A.md`, AW) });
    await screen.click(screen.button(t.screen.removeLabel("Ahornweg 12")));
    screen.notes.setDefectWrites(true);
    await screen.click(screen.q("delete-confirm"));
    await screen.until(() => expect(defects(screen)).toHaveLength(1));
    expect(screen.q("delete-dialog")).toBeDefined();
    expect(screen.names()).toEqual(["Ahornweg 12"]);
  });
});
