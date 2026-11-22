import { afterEach, describe, expect, it } from "vitest";
import { de } from "../../../../src/application/messages";
import {
  FOLDER,
  closeAll,
  communityNote,
  openSettings,
  type Memory,
} from "../../../support/communities/screen";

afterEach(closeAll);

const n = de.notes;

const SEEDED = (notes: Memory) => {
  notes.seed(`${FOLDER}/A.md`, communityNote(1, { name: "A" }));
  notes.seed("WEG Manager/Gemeinschaften/Kaputt.md", "broken");
  notes.seed("Irgendwo/Fremd.md", { schema: "weg-manager.punkt" });
  notes.seed("Irgendwo/Kaputt außen.md", "broken");
};

/** What a screen reader hears of an element: its text without the parts hidden from it. */
const heard = (element: Element): string => {
  const copy = element.cloneNode(true) as Element;
  for (const hidden of copy.querySelectorAll("[aria-hidden=true]")) hidden.remove();
  return copy.textContent.replace(/\s+/g, " ").trim();
};

/** The entries of the settings screen's navigation: label and badge as a screen reader hears. */
const sections = (root: ParentNode) =>
  [...root.querySelectorAll("[data-testid=settings-sections] button")].map((button) => ({
    text: heard(button),
    current: button.getAttribute("aria-current"),
  }));

describe("the data issues section (Datenprobleme)", () => {
  it("lists notes of no known type with their issue, and no record", async () => {
    const screen = await openSettings("data-issues", { seed: SEEDED });
    expect(screen.root.querySelector("h2")?.textContent).toBe(n.dataIssues.title);
    const section = screen.q("unindexed-notes");
    expect(section?.querySelector("h3")?.textContent).toBe(n.dataIssues.otherNotes);
    expect(
      [...(section?.querySelectorAll("li") ?? [])].map((item) =>
        [...item.querySelectorAll(":scope > span")]
          .map((part) => part.textContent.trim())
          .join(" | "),
      ),
    ).toEqual([
      `Irgendwo/Fremd.md | ${n.unindexedIssues["schema.malformed"]({ code: "schema.malformed" })}`,
      `WEG Manager/Gemeinschaften/Kaputt.md | ${n.unindexedIssues["frontmatter.unreadable"]({ code: "frontmatter.unreadable" })}`,
    ]);
    expect(screen.q("community")).toBeUndefined();
    expect(screen.q("data-issues-none")).toBeUndefined();
  });

  it("opens each other note in Obsidian", async () => {
    const screen = await openSettings("data-issues", { seed: SEEDED });
    const openers = screen.all("open-note");
    expect(openers.map((button) => button.getAttribute("aria-label"))).toEqual([
      n.openNote.labelFor("Irgendwo/Fremd.md"),
      n.openNote.labelFor("WEG Manager/Gemeinschaften/Kaputt.md"),
    ]);
    await screen.click(openers[1]);
    await screen.click(openers[0]);
    expect(screen.notes.opened()).toEqual([
      "WEG Manager/Gemeinschaften/Kaputt.md",
      "Irgendwo/Fremd.md",
    ]);
  });

  it("says so when a note to open is gone", async () => {
    const screen = await openSettings("data-issues", {
      seed: (notes) => notes.seed("Irgendwo/Fremd.md", { schema: "weg-manager.punkt" }),
    });
    screen.notes.removeOutside("Irgendwo/Fremd.md");
    await screen.click(screen.q("open-note"));
    expect(screen.q("unindexed-notes")?.querySelector("[role=alert]")?.textContent).toContain(
      n.errors.notFound.title,
    );
  });

  it("says when every note can be read", async () => {
    const screen = await openSettings("data-issues", {
      seed: (notes) => notes.seed(`${FOLDER}/A.md`, communityNote(1, { name: "A" })),
    });
    expect(screen.text("data-issues-none")).toBe(n.dataIssues.none);
    expect(screen.q("unindexed-notes")).toBeUndefined();
  });

  it("shows the index's failure with a retry", async () => {
    const screen = await openSettings("data-issues", {
      ready: false,
      seed: (notes) => notes.setFailReads(true),
    });
    await screen.vaultReady();
    await screen.until(() =>
      expect(screen.q("data-issues-failure")?.textContent).toContain(n.errors.indexRead.title),
    );
    screen.notes.setFailReads(false);
    await screen.click(screen.button(de.shell.actions.retry));
    await screen.until(() => expect(screen.q("data-issues-none")).toBeDefined());
    expect(screen.q("data-issues-failure")).toBeUndefined();
  });
});

describe("the settings navigation of the app", () => {
  it("leads to the communities and the data issues, with the count of notes beside it", async () => {
    const screen = await openSettings("communities", { seed: SEEDED });
    await screen.until(() =>
      expect(sections(screen.root)).toEqual([
        { text: de.communities.route, current: "page" },
        { text: `${n.dataIssues.title} ${n.dataIssues.count(2)}`, current: null },
      ]),
    );
    const navigation = screen.root.querySelector("[data-testid=settings-sections]");
    expect(navigation?.getAttribute("aria-label")).toBe(de.shell.frame.settingsSections);
    expect(screen.q("data-issues-count")?.querySelector("[aria-hidden=true]")?.textContent).toBe(
      "2",
    );
    await screen.click(screen.root.querySelectorAll("[data-testid=settings-sections] button")[1]);
    await screen.until(() => expect(screen.q("data-issues-screen")).toBeDefined());
    expect(screen.q("communities-screen")).toBeUndefined();
    expect(sections(screen.root).map((entry) => entry.current)).toEqual([null, "page"]);
  });

  it("shows no count while every note can be read", async () => {
    const screen = await openSettings("communities", {
      seed: (notes) => notes.seed(`${FOLDER}/A.md`, communityNote(1, { name: "A" })),
    });
    expect(sections(screen.root).map((entry) => entry.text)).toEqual([
      de.communities.route,
      n.dataIssues.title,
    ]);
    expect(screen.q("data-issues-count")).toBeUndefined();
  });

  it("names the sections and the count in English in an English Obsidian", async () => {
    const screen = await openSettings("communities", { language: "en", seed: SEEDED });
    await screen.until(() =>
      expect(sections(screen.root).map((entry) => entry.text)).toEqual([
        "Communities",
        "Data issues 2 notes",
      ]),
    );
  });
});
