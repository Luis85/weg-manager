import { afterEach, describe, expect, it } from "vitest";
import { de } from "../../../../src/application/messages";
import { NoteStore } from "../../../../src/application/notes";
import {
  FOLDER,
  closeAll,
  communityNote,
  openCommunities,
  type Memory,
  type OpenScreen,
} from "../../../support/communities/screen";

afterEach(closeAll);

const t = de.communities;
const n = de.notes;

const TWO = (notes: Memory) => {
  notes.seed(`${FOLDER}/A.md`, communityNote(1, { name: "Ahornweg 12", short_code: "AW" }));
  notes.seed(
    `${FOLDER}/T.md`,
    communityNote(2, { name: "Tiefgarage", short_code: "TG", color: "violet" }),
  );
};

const paths = (screen: OpenScreen) =>
  screen.runtime
    .runPromise(NoteStore.use((store) => store.list))
    .then((notes) => notes.map((note) => note.path));

describe("deleting a community", () => {
  it("says the note was not deleted when Obsidian cannot move it to the trash", async () => {
    const screen = await openCommunities({ seed: TWO });
    await screen.click(screen.button(t.screen.removeLabel("Ahornweg 12")));
    expect(screen.q("delete-confirm")?.textContent.trim()).toBe(n.deletion.confirm);
    screen.notes.setFailWrites(true);
    await screen.click(screen.q("delete-confirm"));
    const alert = screen.root.querySelector("[role=dialog] [role=alert]");
    expect(alert?.textContent).toContain(de.notes.errors.trash.title);
    expect(alert?.textContent).toContain(de.notes.errors.trash.detail);
    expect(await paths(screen)).toEqual([`${FOLDER}/A.md`, `${FOLDER}/T.md`]);
  });

  it("asks first, and cancelling deletes nothing", async () => {
    const screen = await openCommunities({ seed: TWO });
    await screen.click(screen.button("Ahornweg 12 löschen"));
    const dialog = screen.root.querySelector("[role=dialog]");
    expect(dialog?.textContent).toContain("Gemeinschaft löschen");
    expect(dialog?.textContent).toContain(n.deletion.detail("Ahornweg 12"));
    await screen.click(screen.button("Abbrechen"));
    expect(screen.q("delete-dialog")).toBeUndefined();
    expect(await paths(screen)).toEqual([`${FOLDER}/A.md`, `${FOLDER}/T.md`]);
  });

  it("moves the note to the trash on confirm, and the list drops it", async () => {
    const screen = await openCommunities({ seed: TWO });
    await screen.click(screen.button("Ahornweg 12 löschen"));
    await screen.click(screen.q("delete-confirm"));
    await screen.until(() => expect(screen.q("delete-dialog")).toBeUndefined());
    expect(await paths(screen)).toEqual([`${FOLDER}/T.md`]);
    await screen.until(() => expect(screen.names()).toEqual(["Tiefgarage"]));
  });

  it("keeps the dialog open with the reason when the note is gone", async () => {
    const screen = await openCommunities({ seed: TWO });
    await screen.click(screen.button("Ahornweg 12 löschen"));
    await screen.runtime.runPromise(NoteStore.use((store) => store.trash(`${FOLDER}/A.md`)));
    await screen.click(screen.q("delete-confirm"));
    expect(screen.root.querySelector("[role=dialog] [role=alert]")?.textContent).toContain(
      "Notiz nicht gefunden",
    );
  });

  it("disables the confirmation while the delete runs", async () => {
    const screen = await openCommunities({ seed: TWO });
    await screen.click(screen.button("Ahornweg 12 löschen"));
    screen.notes.holdWrites();
    await screen.click(screen.q("delete-confirm"));
    const confirm = screen.q("delete-confirm") as HTMLButtonElement;
    expect([confirm.disabled, confirm.getAttribute("aria-disabled")]).toEqual([false, "true"]);
    await screen.click(confirm);
    expect(screen.notes.heldWrites()).toBe(1);
    screen.notes.releaseWrites();
    await screen.until(() => expect(screen.q("delete-dialog")).toBeUndefined());
  });

  it("keeps a delete cancelled while it runs out of the next community's dialog", async () => {
    const screen = await openCommunities({ seed: TWO });
    await screen.click(screen.button("Ahornweg 12 löschen"));
    screen.notes.holdWrites();
    await screen.click(screen.q("delete-confirm"));
    await screen.click(screen.button("Abbrechen"));
    await screen.click(screen.button("Tiefgarage löschen"));
    const dialog = () => screen.root.querySelector("[role=dialog]");
    expect(dialog()?.textContent).toContain(n.deletion.detail("Tiefgarage"));
    expect(screen.q("delete-confirm")?.getAttribute("aria-disabled")).toBeNull();
    screen.notes.releaseWrites();
    await screen.until(() => expect(screen.names()).toEqual(["Tiefgarage"]));
    expect(dialog()?.textContent).toContain(n.deletion.detail("Tiefgarage"));
  });

  it("shows no earlier community's failure in the next dialog", async () => {
    const screen = await openCommunities({ seed: TWO });
    await screen.click(screen.button("Ahornweg 12 löschen"));
    await screen.runtime.runPromise(NoteStore.use((store) => store.trash(`${FOLDER}/A.md`)));
    await screen.click(screen.q("delete-confirm"));
    expect(screen.root.querySelector("[role=dialog] [role=alert]")).not.toBeNull();
    await screen.click(screen.button("Abbrechen"));
    await screen.click(screen.button("Tiefgarage löschen"));
    expect(screen.root.querySelector("[role=dialog] [role=alert]")).toBeNull();
  });
});
