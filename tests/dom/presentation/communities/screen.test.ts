import { afterEach, describe, expect, it } from "vitest";
import { de } from "../../../../src/application/messages";
import {
  FOLDER,
  closeAll,
  communityNote,
  openCommunities,
  type Memory,
} from "../../../support/communities/screen";

afterEach(closeAll);

const t = de.communities;
const n = de.notes;

const duplicateCode = (other: string) =>
  t.issues["short-code.duplicate"](
    { key: "short_code", code: "short-code.duplicate", value: "AW", other },
    "Kürzel",
  );
const duplicateId = (other: string) =>
  de.notes.recordIssues["id.duplicate"]({ code: "id.duplicate", other: `${FOLDER}/${other}` });

const TWO = (notes: Memory) => {
  notes.seed(
    `${FOLDER}/Tiefgarage.md`,
    communityNote(2, {
      name: "Tiefgarage Ahornweg",
      short_code: "TG",
      color: "violet",
      kind: "Tiefgarage",
      unit_label: "Stellplätze",
    }),
  );
  notes.seed(`${FOLDER}/Ahornweg.md`, communityNote(1, { name: "Ahornweg 12", short_code: "AW" }));
};

describe("the community settings", () => {
  it("shows a busy status once the index takes longer than 300 ms, then the empty state", async () => {
    const screen = await openCommunities({ ready: false });
    // Nothing in between for a read that is quick (handoff 02, B-NFR-04).
    expect(screen.q("communities-loading")).toBeUndefined();
    await screen.until(() => expect(screen.q("communities-loading")).toBeDefined());
    const loading = screen.q("communities-loading");
    expect(loading?.getAttribute("role")).toBe("status");
    expect(loading?.getAttribute("aria-busy")).toBe("true");
    expect(loading?.textContent.trim()).toBe("Gemeinschaften werden geladen …");
    expect(screen.q("community-add")).toBeDefined();
    expect((screen.q("community-add") as HTMLButtonElement).disabled).toBe(true);
    await screen.vaultReady();
    await screen.until(() => expect(screen.q("communities-empty")).toBeDefined());
    expect(screen.q("communities-empty")?.querySelector("p")?.textContent).toBe(
      "Hier erscheinen deine Gemeinschaften, etwa eine WEG und ihre Tiefgarage.",
    );
    expect(screen.q("communities-loading")).toBeUndefined();
    expect(screen.all("community-add")).toHaveLength(1);
  });

  it("names the folder of the notes from the root folder setting", async () => {
    const screen = await openCommunities({ store: { initial: { rootFolder: "Beirat" } } });
    expect(screen.root.querySelector("h2")?.textContent).toBe("Gemeinschaften");
    expect(screen.text("communities-intro")).toBe(
      "Jede Gemeinschaft ist eine Notiz im Ordner „Beirat/Gemeinschaften“.",
    );
  });

  it("shows the index's failure with a retry that reads the vault again", async () => {
    const screen = await openCommunities({ seed: (notes) => notes.setFailReads(true) });
    expect(screen.root.querySelector("[role=alert]")?.textContent).toContain(
      de.notes.errors.indexRead.title,
    );
    expect(screen.q("communities-loading")).toBeUndefined();
    screen.notes.setFailReads(false);
    await screen.click(screen.button("Erneut versuchen"));
    await screen.until(() => expect(screen.q("communities-empty")).toBeDefined());
    expect(screen.root.querySelector("[role=alert]")).toBeNull();
  });

  it("lists the communities by name with badge, kind and unit label and their actions", async () => {
    const screen = await openCommunities({ seed: TWO });
    expect(screen.names()).toEqual(["Ahornweg 12", "Tiefgarage Ahornweg"]);
    const badges = [
      ...(screen.q("communities")?.querySelectorAll<HTMLElement>("[data-testid=community-badge]") ??
        []),
    ];
    expect(badges.map((badge) => [badge.textContent, badge.dataset["communityColor"]])).toEqual([
      ["AW", "teal"],
      ["TG", "violet"],
    ]);
    expect(screen.all("community-summary").map((element) => element.textContent.trim())).toEqual([
      t.screen.summary("WEG", "Einheiten"),
      t.screen.summary("Tiefgarage", "Stellplätze"),
    ]);
    expect(screen.button("Ahornweg 12 bearbeiten")).toBeDefined();
    expect(screen.button("Tiefgarage Ahornweg löschen")).toBeDefined();
    expect(screen.q("communities")?.getAttribute("aria-label")).toBe("Gemeinschaften");
  });

  it("marks the selected community's card in words and with a mark, not by colour", async () => {
    const screen = await openCommunities({ seed: TWO });
    expect(screen.q("community-selected")).toBeUndefined();
    await screen.click(screen.all("community-option")[1]);
    const marked = screen
      .all("community")
      .map((card) => card.querySelector("[data-testid=community-selected]")?.textContent.trim());
    expect(marked).toEqual([undefined, t.screen.selected]);
    expect(screen.q("community-selected")?.querySelector("svg")?.getAttribute("aria-hidden")).toBe(
      "true",
    );
  });

  it("follows a note created outside the plugin", async () => {
    const screen = await openCommunities({ seed: TWO });
    screen.notes.seed(
      `${FOLDER}/Birke.md`,
      communityNote(3, { name: "Birkenallee", short_code: "BA", color: "blue" }),
    );
    await screen.until(() =>
      expect(screen.names()).toEqual(["Ahornweg 12", "Birkenallee", "Tiefgarage Ahornweg"]),
    );
  });

  it("shows a broken field's issue on an editable community", async () => {
    const screen = await openCommunities({
      seed: (notes) =>
        notes.seed(`${FOLDER}/A.md`, communityNote(1, { name: "A", color: "amber" })),
    });
    expect(screen.text("community-issues")).toBe(
      t.issues["color.unknown"]({ key: "color", code: "color.unknown", value: "amber" }, "Farbe"),
    );
    expect(screen.all("community-badge")[0]?.dataset["communityColor"]).toBe("none");
    expect(screen.q("community-edit")).toBeDefined();
    expect(screen.q("community-read-only")).toBeUndefined();
  });

  it("shows a newer note read-only with its issue and no actions", async () => {
    const screen = await openCommunities({
      seed: (notes) =>
        notes.seed(`${FOLDER}/Neu.md`, communityNote(1, { schema: "weg-manager.community/v2" })),
    });
    expect(screen.names()).toEqual(["Neu"]);
    expect(screen.text("community-read-only")).toBe("Schreibgeschützt");
    expect(screen.text("community-issues")).toBe(
      de.notes.recordIssues["schema.newer"]({ code: "schema.newer", version: 2 }),
    );
    expect(screen.q("community-edit")).toBeUndefined();
    expect(screen.q("community-remove")).toBeUndefined();
    expect(screen.all("community-badge")[0]?.textContent).toBe("?");
  });

  it("marks both communities of a duplicate short code and both notes of a duplicate id", async () => {
    const screen = await openCommunities({
      seed: (notes) => {
        notes.seed(`${FOLDER}/A.md`, communityNote(1, { name: "A", short_code: "AW" }));
        notes.seed(
          `${FOLDER}/B.md`,
          communityNote(2, { name: "B", short_code: "AW", color: "blue" }),
        );
        notes.seed(
          `${FOLDER}/C.md`,
          communityNote(3, { name: "C", short_code: "C1", color: "rust" }),
        );
        notes.seed(
          `${FOLDER}/D.md`,
          communityNote(3, { name: "D", short_code: "D1", color: "pink" }),
        );
      },
    });
    const issues = screen
      .all("community")
      .map((row) => row.querySelector("[data-testid=community-issues]")?.textContent.trim());
    expect(issues).toEqual([
      duplicateCode("B"),
      duplicateCode("A"),
      duplicateId("D.md"),
      duplicateId("C.md"),
    ]);
    expect(screen.all("community-read-only")).toHaveLength(2);
  });

  it("leaves the notes of no known type to the data issues section", async () => {
    const screen = await openCommunities({
      seed: (notes) => {
        notes.seed(`${FOLDER}/A.md`, communityNote(1, { name: "A" }));
        notes.seed("WEG Manager/Gemeinschaften/Kaputt.md", "broken");
        notes.seed("Irgendwo/Fremd.md", { schema: "weg-manager.punkt" });
      },
    });
    expect(screen.names()).toEqual(["A"]);
    expect(screen.q("unindexed-notes")).toBeUndefined();
  });

  it("opens each read-only community in Obsidian, and only those", async () => {
    const screen = await openCommunities({
      seed: (notes) => {
        notes.seed(`${FOLDER}/A.md`, communityNote(1, { name: "A" }));
        notes.seed(`${FOLDER}/Neu.md`, communityNote(2, { schema: "weg-manager.community/v2" }));
        notes.seed("Irgendwo/Fremd.md", { schema: "weg-manager.punkt" });
      },
    });
    const openers = screen.all("open-note");
    expect(openers.map((button) => button.getAttribute("aria-label"))).toEqual([
      n.openNote.labelFor("Neu"),
    ]);
    expect(openers.map((button) => button.textContent.trim())).toEqual([n.openNote.label]);
    await screen.click(openers[0]);
    expect(screen.notes.opened()).toEqual([`${FOLDER}/Neu.md`]);
  });

  it("speaks English in an English Obsidian", async () => {
    const screen = await openCommunities({ language: "en", seed: TWO });
    expect(screen.root.querySelector("h2")?.textContent).toBe("Communities");
    expect(screen.text("communities-intro")).toBe(
      "Each community is a note in the folder “WEG Manager/Gemeinschaften”.",
    );
    expect(screen.button("Edit Ahornweg 12")).toBeDefined();
    expect(screen.button("Add community")).toBeDefined();
  });
});
