import { afterEach, describe, expect, it } from "vitest";
import { de } from "../../../../src/application/messages";
import {
  FOLDER,
  closeAll,
  communityNote,
  fill,
  openCommunities,
  save,
  settle,
  type OpenScreen,
} from "../../../support/communities/screen";

// The record kit asks before a sheet with unsaved input closes (PBI-72), on every way to close it:
// Escape, a pointer-down outside, the sheet's close control and the form's cancel button. The
// community sheet is the kit's only record screen, so it carries the proof for every record form.

afterEach(closeAll);

const t = de.communities;
const d = de.notes.discard;

const AW = communityNote(1, { name: "Ahornweg 12", short_code: "AW" });

const active = () => document.activeElement as HTMLElement | null;
const form = (screen: OpenScreen) => screen.q("community-form");
const question = (screen: OpenScreen) => screen.q("discard-dialog");

/** Escape where the focus is, as a keyboard sends it. */
const escape = async () => {
  const target = active() ?? document.body;
  target.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  await settle();
};

/** A pointer-down outside the sheet, as a click into another pane starts. */
const pointerOutside = async (screen: OpenScreen) => {
  const outside = screen.q("communities-intro") ?? document.body;
  outside.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
  outside.dispatchEvent(new PointerEvent("pointerup", { bubbles: true }));
  outside.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  await settle();
};

const sheetClose = (screen: OpenScreen) =>
  screen.click(screen.root.querySelector<HTMLElement>("[data-slot=close]") ?? undefined);
const cancel = (screen: OpenScreen) => screen.click(screen.button(t.form.cancel));

const WAYS: readonly [string, (screen: OpenScreen) => Promise<void>][] = [
  ["Escape", () => escape()],
  ["a pointer-down outside the sheet", pointerOutside],
  ["the sheet's close control", sheetClose],
  ["the form's cancel button", cancel],
];

/** The sheet of a new community, open, with the focus where the sheet puts it. */
const creating = async () => {
  const screen = await openCommunities();
  await screen.click(screen.q("community-add"));
  await screen.until(() => expect(active()).toBe(screen.input("field-name")));
  return screen;
};

describe("closing a record sheet without unsaved input", () => {
  it.each(WAYS)("closes on %s without a question", async (_, close) => {
    const screen = await creating();
    await close(screen);
    await screen.until(() => expect(form(screen)).toBeUndefined());
    expect(question(screen)).toBeUndefined();
  });

  it("closes without a question after a successful save", async () => {
    const screen = await openCommunities({ seed: (notes) => notes.seed(`${FOLDER}/A.md`, AW) });
    await screen.click(screen.q("community-edit"));
    await fill(screen, { kind: "Haus" });
    await save(screen);
    await screen.until(() => expect(form(screen)).toBeUndefined());
    expect(question(screen)).toBeUndefined();
  });
});

describe("closing a record sheet with unsaved input", () => {
  it.each(WAYS)("asks on %s and keeps the input", async (_, close) => {
    const screen = await creating();
    await fill(screen, { name: "Tiefgarage" });
    await close(screen);
    await screen.until(() => expect(question(screen)).toBeDefined());
    expect(form(screen)).toBeDefined();
    expect(screen.input("field-name").value).toBe("Tiefgarage");
  });

  it("asks in a named modal dialog with the focus on keep editing", async () => {
    const screen = await creating();
    await fill(screen, { name: "Tiefgarage" });
    await escape();
    await screen.until(() => expect(active()).toBe(screen.button(d.keep)));
    const dialog = question(screen)?.closest("[role=dialog]");
    expect(dialog?.getAttribute("aria-modal")).toBe("true");
    const title = document.getElementById(dialog?.getAttribute("aria-labelledby") ?? "");
    expect(title?.textContent.trim()).toBe(d.title);
    expect(dialog?.textContent).toContain(d.detail);
    expect(screen.button(d.confirm)).toBeDefined();
  });

  it("keeps editing on that button, with the input and the focus where they were", async () => {
    const screen = await creating();
    await fill(screen, { name: "Tiefgarage" });
    screen.input("field-name").focus();
    await escape();
    await screen.until(() => expect(active()).toBe(screen.button(d.keep)));
    await screen.click(screen.button(d.keep));
    await screen.until(() => expect(question(screen)).toBeUndefined());
    expect(screen.input("field-name").value).toBe("Tiefgarage");
    await screen.until(() => expect(active()).toBe(screen.input("field-name")));
  });

  it("keeps editing on Escape in the question", async () => {
    const screen = await creating();
    await fill(screen, { name: "Tiefgarage" });
    screen.button(t.form.cancel)?.focus();
    await cancel(screen);
    await screen.until(() => expect(active()).toBe(screen.button(d.keep)));
    await escape();
    await screen.until(() => expect(question(screen)).toBeUndefined());
    expect(screen.input("field-name").value).toBe("Tiefgarage");
    await screen.until(() => expect(active()).toBe(screen.button(t.form.cancel)));
  });

  it("discards the input and closes the sheet, the focus back on what opened it", async () => {
    const screen = await creating();
    await fill(screen, { name: "Tiefgarage" });
    await escape();
    await screen.until(() => expect(question(screen)).toBeDefined());
    await screen.click(screen.button(d.confirm));
    await screen.until(() => expect(form(screen)).toBeUndefined());
    expect(question(screen)).toBeUndefined();
    await screen.until(() => expect(active()).toBe(screen.q("community-add")));
    await screen.click(screen.q("community-add"));
    await screen.until(() => expect(screen.input("field-name").value).toBe(""));
  });
});
