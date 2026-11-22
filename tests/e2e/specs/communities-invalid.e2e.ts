import { browser, expect } from "@wdio/globals";
import { describe, it } from "mocha";
import {
  FOLDER,
  community,
  communityText,
  expectFormClosed,
  expectListed,
  expectSummary,
  fileText,
  fillForm,
  openSection,
  saveForm,
  writeNotes,
} from "../communities";
import { ROOT, installConsoleSpy, leafCount, openView, pluginProblems } from "../support";
import { de } from "../texts";

const NOTES: Readonly<Record<string, string>> = {
  "Gut.md": communityText(community(1, { name: "Gut", short_code: "GUT" })),
  "Farbe.md": communityText(community(2, { name: "Farbe", short_code: "FA", color: "cyan" })),
  "Kürzel A.md": communityText(community(3, { name: "Kürzel A", short_code: "KZ", color: "blue" })),
  "Kürzel B.md": communityText(community(4, { name: "Kürzel B", short_code: "KZ", color: "rust" })),
  "Kopie A.md": communityText(community(5, { name: "Kopie A", short_code: "KA", color: "pink" })),
  "Kopie B.md": communityText(community(5, { name: "Kopie B", short_code: "KB", color: "olive" })),
  "Kaputt.md": "---\nschema: weg-manager.community/v1\nname: [nicht geschlossen\n---\n",
};

/** The issue texts the row of `name` shows. */
const issuesOf = (name: string) =>
  browser.executeObsidian(
    (_, selector, wanted) => {
      const rows = [...document.querySelectorAll(`${selector} [data-testid=community]`)];
      const row = rows.find(
        (candidate) =>
          candidate.querySelector("[data-testid=community-name]")?.textContent?.trim() === wanted,
      );
      return [...(row?.querySelectorAll("[data-testid=community-issues] li") ?? [])].map(
        (item) => item.textContent?.trim() ?? "",
      );
    },
    ROOT,
    name,
  );

const duplicateCode = (other: string) =>
  de.communities.issues["short-code.duplicate"](
    { key: "short_code", code: "short-code.duplicate", value: "KZ", other },
    de.communities.fields.short_code,
  );
const duplicateId = (other: string) =>
  de.notes.recordIssues["id.duplicate"]({ code: "id.duplicate", other: `${FOLDER}/${other}` });
const missingColor = de.communities.issues["color.unknown"](
  { key: "color", code: "color.unknown", value: "cyan" },
  de.communities.fields.color,
);

/** DF-23: broken notes are shown with their issues and never disturb the others. */
describe("communities: notes that break the file contract", function () {
  it("lists each with its issue beside the valid one", async function () {
    await installConsoleSpy();
    await writeNotes(Object.entries(NOTES).map(([name, text]) => [`${FOLDER}/${name}`, text]));
    await openView();
    await expectListed(["Farbe", "Gut", "Kopie A", "Kopie B", "Kürzel A", "Kürzel B"]);
    expect(await issuesOf("Gut")).toEqual([]);
    expect(await issuesOf("Farbe")).toEqual([missingColor]);
    expect(await issuesOf("Kürzel A")).toEqual([duplicateCode("Kürzel B")]);
    expect(await issuesOf("Kürzel B")).toEqual([duplicateCode("Kürzel A")]);
    expect(await issuesOf("Kopie A")).toEqual([duplicateId("Kopie B.md")]);
    expect(await issuesOf("Kopie B")).toEqual([duplicateId("Kopie A.md")]);
    await expect(browser.$(ROOT).$("[data-testid=unindexed-notes]")).not.toExist();
    // The notes of no known type are the section "Datenprobleme", counted beside its entry.
    await expect(browser.$(ROOT).$("[data-testid=data-issues-count]")).toHaveText(
      expect.stringContaining(de.notes.dataIssues.count(1)),
    );
    await openSection(de.notes.dataIssues.title);
    await expect(browser.$(ROOT).$("[data-testid=unindexed-notes]")).toHaveText(
      expect.stringContaining(`${FOLDER}/Kaputt.md`),
    );
    await expect(browser.$(ROOT).$("[data-testid=unindexed-notes]")).toHaveText(
      expect.stringContaining(
        de.notes.unindexedIssues["frontmatter.unreadable"]({ code: "frontmatter.unreadable" }),
      ),
    );
  });

  it("still saves the valid one and repairs a broken field, writing nothing else", async function () {
    const root = browser.$(ROOT);
    await openSection(de.communities.screen.title);
    await expectListed(["Farbe", "Gut", "Kopie A", "Kopie B", "Kürzel A", "Kürzel B"]);
    await root.$(`button[aria-label='${de.communities.screen.editLabel("Gut")}']`).click();
    await fillForm({ kind: "Haus" });
    await saveForm();
    await expectFormClosed();
    expect(await fileText(`${FOLDER}/Gut.md`)).toBe(
      communityText(community(1, { name: "Gut", short_code: "GUT", kind: "Haus" })),
    );
    // The list follows the write a moment later; click on the next card once it has.
    await expectSummary("Gut", de.communities.screen.summary("Haus", "Einheiten"));
    await root.$(`button[aria-label='${de.communities.screen.editLabel("Farbe")}']`).click();
    await fillForm({ color: "amber" });
    await saveForm();
    await expectFormClosed();
    expect(await fileText(`${FOLDER}/Farbe.md`)).toBe(
      communityText(community(2, { name: "Farbe", short_code: "FA", color: "amber" })),
    );
    // The list follows the write a moment later and the card loses its issue line, which moves
    // everything below it; a click sent before that lands where a button used to be.
    await browser.waitUntil(async () => (await issuesOf("Farbe")).length === 0, {
      timeoutMsg: "the repaired community kept its issue in the list",
    });
    const untouched = ["Kürzel A.md", "Kürzel B.md", "Kopie A.md", "Kopie B.md", "Kaputt.md"];
    expect(await Promise.all(untouched.map((name) => fileText(`${FOLDER}/${name}`)))).toEqual(
      untouched.map((name) => NOTES[name]),
    );
  });

  it("opens a note it cannot write in another tab, and the view stays open", async function () {
    const activeFile = () =>
      browser.executeObsidian(({ app }) => app.workspace.getActiveFile()?.path ?? null);
    await openSection(de.notes.dataIssues.title);
    const opener = browser
      .$(ROOT)
      .$("[data-testid=unindexed-notes]")
      .$(`button[aria-label='${de.notes.openNote.labelFor(`${FOLDER}/Kaputt.md`)}']`);
    await opener.click();
    await browser.waitUntil(async () => (await activeFile()) === `${FOLDER}/Kaputt.md`, {
      timeoutMsg: "the note never became the active file",
    });
    expect(await leafCount()).toBe(1);
    await openView();
    await openSection(de.communities.screen.title);
    const readOnly = browser
      .$(ROOT)
      .$(`button[aria-label='${de.notes.openNote.labelFor("Kopie A")}']`);
    await readOnly.click();
    await browser.waitUntil(async () => (await activeFile()) === `${FOLDER}/Kopie A.md`, {
      timeoutMsg: "the read-only community's note never became the active file",
    });
    expect(await leafCount()).toBe(1);
  });

  it("logged no error or warning from the plugin and no uncaught error", async function () {
    expect(await pluginProblems()).toEqual([]);
  });
});
