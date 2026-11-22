import { browser, expect } from "@wdio/globals";
import { describe, it } from "mocha";
import {
  FOLDER,
  community,
  communityText,
  expectFormClosed,
  expectListed,
  fileText,
  fillForm,
  saveForm,
  writeNotes,
} from "../communities";
import { ROOT, installConsoleSpy, openView, pluginProblems } from "../support";

const NOTES: Readonly<Record<string, string>> = {
  "Gut.md": communityText(community(1, { name: "Gut", short_code: "GUT" })),
  "Farbe.md": communityText(community(2, { name: "Farbe", short_code: "FA", color: "amber" })),
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

const DUPLICATE_CODE =
  "Eine andere Gemeinschaft hat dasselbe Kürzel. Gib einer der beiden ein anderes.";
const duplicateId = (other: string) =>
  `Die Notiz „${FOLDER}/${other}“ hat dieselbe „id“, deshalb sind beide schreibgeschützt. Lösche die doppelte Notiz in Obsidian.`;

/** DF-23: broken notes are shown with their issues and never disturb the others. */
describe("communities: notes that break the file contract", function () {
  it("lists each with its issue beside the valid one", async function () {
    await installConsoleSpy();
    await writeNotes(Object.entries(NOTES).map(([name, text]) => [`${FOLDER}/${name}`, text]));
    await openView();
    await expectListed(["Farbe", "Gut", "Kopie A", "Kopie B", "Kürzel A", "Kürzel B"]);
    expect(await issuesOf("Gut")).toEqual([]);
    expect(await issuesOf("Farbe")).toEqual([
      "„Farbe“ ist keine Farbe der Palette. Wähle eine Farbe aus.",
    ]);
    expect(await issuesOf("Kürzel A")).toEqual([DUPLICATE_CODE]);
    expect(await issuesOf("Kürzel B")).toEqual([DUPLICATE_CODE]);
    expect(await issuesOf("Kopie A")).toEqual([duplicateId("Kopie B.md")]);
    expect(await issuesOf("Kopie B")).toEqual([duplicateId("Kopie A.md")]);
    await expect(browser.$(ROOT).$("[data-testid=unindexed-notes]")).toHaveText(
      expect.stringContaining(`${FOLDER}/Kaputt.md`),
    );
    await expect(browser.$(ROOT).$("[data-testid=unindexed-notes]")).toHaveText(
      expect.stringContaining(
        "Die Eigenschaften oben in der Notiz sind fehlerhaft geschrieben, deshalb kann WEG Manager sie nicht lesen. Öffne die Notiz und korrigiere die Eigenschaften.",
      ),
    );
  });

  it("still saves the valid one and repairs a broken field, writing nothing else", async function () {
    const root = browser.$(ROOT);
    await root.$("button[aria-label='Gut bearbeiten']").click();
    await fillForm({ kind: "Haus" });
    await saveForm();
    await expectFormClosed();
    expect(await fileText(`${FOLDER}/Gut.md`)).toBe(
      communityText(community(1, { name: "Gut", short_code: "GUT", kind: "Haus" })),
    );
    await root.$("button[aria-label='Farbe bearbeiten']").click();
    await fillForm({ color: "cyan" });
    await saveForm();
    await expectFormClosed();
    expect(await fileText(`${FOLDER}/Farbe.md`)).toBe(
      communityText(community(2, { name: "Farbe", short_code: "FA", color: "cyan" })),
    );
    const untouched = ["Kürzel A.md", "Kürzel B.md", "Kopie A.md", "Kopie B.md", "Kaputt.md"];
    expect(await Promise.all(untouched.map((name) => fileText(`${FOLDER}/${name}`)))).toEqual(
      untouched.map((name) => NOTES[name]),
    );
  });

  it("logged no error or warning from the plugin and no uncaught error", async function () {
    expect(await pluginProblems()).toEqual([]);
  });
});
