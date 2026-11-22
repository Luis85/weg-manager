import { afterEach, describe, expect, it } from "vitest";
import { SELECTION_KEY } from "../../../../src/application/communities";
import { NoteStore } from "../../../../src/application/notes";
import { DeviceStore } from "../../../../src/application/shell";
import { appSurface } from "../../../../src/presentation/app-surface";
import { memoryNavigation } from "../../../../src/presentation/shell/host";
import {
  FOLDER,
  closeAll,
  communityId,
  communityNote,
  openCommunities,
  settle,
  type Memory,
  type OpenScreen,
} from "../../../support/communities/screen";
import { mountApp } from "../../../support/surface";

afterEach(closeAll);

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

const options = (root: ParentNode) => [
  ...root.querySelectorAll<HTMLButtonElement>("[data-testid=community-option]"),
];
const pressed = (root: ParentNode) =>
  options(root).map((button) => [
    [...button.querySelectorAll("*")]
      .filter((element) => element.children.length === 0)
      .map((element) => element.textContent.trim())
      .filter((text) => text !== "")
      .join(" "),
    button.getAttribute("aria-pressed"),
  ]);
const storedSelection = (screen: OpenScreen) =>
  screen.runtime.runPromise(DeviceStore.use((store) => store.read(SELECTION_KEY)));

describe("deleting a community", () => {
  it("asks first, and cancelling deletes nothing", async () => {
    const screen = await openCommunities({ seed: TWO });
    await screen.click(screen.button("Ahornweg 12 löschen"));
    const dialog = screen.root.querySelector("[role=dialog]");
    expect(dialog?.textContent).toContain("Gemeinschaft löschen");
    expect(dialog?.textContent).toContain(
      "„Ahornweg 12“ kommt in den Papierkorb, den du in Obsidian eingestellt hast.",
    );
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
    expect((screen.q("delete-confirm") as HTMLButtonElement).disabled).toBe(true);
    screen.notes.releaseWrites();
    await screen.until(() => expect(screen.q("delete-dialog")).toBeUndefined());
  });
});

describe("the community switch", () => {
  it("says there is no community yet", async () => {
    const screen = await openCommunities();
    const group = screen.q("community-switch");
    expect([group?.getAttribute("role"), group?.getAttribute("aria-label")]).toEqual([
      "group",
      "Gemeinschaft",
    ]);
    expect(group?.textContent).toContain("Noch keine Gemeinschaft");
    expect(options(screen.root)).toEqual([]);
  });

  it("selects the only community, with its short code, colour and name", async () => {
    const screen = await openCommunities({
      seed: (notes) =>
        notes.seed(`${FOLDER}/A.md`, communityNote(1, { name: "Ahornweg 12", short_code: "AW" })),
    });
    await screen.until(() => expect(pressed(screen.root)).toEqual([["AW Ahornweg 12", "true"]]));
    const badge = options(screen.root)[0]?.querySelector<HTMLElement>(
      "[data-testid=community-badge]",
    );
    expect(badge?.dataset["communityColor"]).toBe("teal");
    expect(screen.text("community-choice")).toBe("");
    expect(await storedSelection(screen)).toBe(communityId(1));
  });

  it("asks for a choice among two, and every view follows the choice", async () => {
    const screen = await openCommunities({ seed: TWO });
    expect(pressed(screen.root)).toEqual([
      ["AW Ahornweg 12", "false"],
      ["TG Tiefgarage", "false"],
    ]);
    const choice = screen.q("community-choice");
    expect([choice?.getAttribute("role"), choice?.textContent.trim()]).toEqual([
      "status",
      "Wähle die Gemeinschaft, in der du arbeitest.",
    ]);
    const second = document.createElement("div");
    document.body.append(second);
    const close = mountApp(second, screen.runtime, {
      navigation: memoryNavigation(appSurface),
    });
    await settle();
    await screen.click(options(screen.root)[1]);
    expect(pressed(screen.root)).toEqual([
      ["AW Ahornweg 12", "false"],
      ["TG Tiefgarage", "true"],
    ]);
    await screen.until(() =>
      expect(pressed(second)).toEqual([
        ["AW Ahornweg 12", "false"],
        ["TG Tiefgarage", "true"],
      ]),
    );
    expect(screen.text("community-choice")).toBe("");
    expect(await storedSelection(screen)).toBe(communityId(2));
    close();
  });

  it("keeps the choice stored for the device", async () => {
    const screen = await openCommunities({
      seed: TWO,
      device: { [SELECTION_KEY]: communityId(2) },
    });
    expect(pressed(screen.root)).toEqual([
      ["AW Ahornweg 12", "false"],
      ["TG Tiefgarage", "true"],
    ]);
  });
});
