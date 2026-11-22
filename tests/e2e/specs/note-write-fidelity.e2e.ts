import { browser, expect } from "@wdio/globals";
import { Result } from "effect";
import { array, constantFrom, oneof, sample, string } from "fast-check";
import { describe, it } from "mocha";
import { splitNoteText } from "../../../src/domain/notes/note-text";
import { yamlEntry } from "../../../src/domain/notes/yaml-text";
import {
  FOLDER,
  community,
  communityText,
  expectFormClosed,
  expectListed,
  expectSummary,
  fileText,
  fillForm,
  saveForm,
  writeNote,
} from "../communities";
import { ROOT, installConsoleSpy, openView, pluginProblems } from "../support";
import { de } from "../texts";

const BOM = "\uFEFF";

/**
 * Saves the community `name` through the form with another kind, as a person does, and returns
 * once the view shows the saved kind: the list follows the write a moment later, and the next
 * click must not land on a card that is about to be redrawn.
 */
const saveKind = async (name: string, kind: string) => {
  await browser
    .$(ROOT)
    .$(`button[aria-label='${de.communities.screen.editLabel(name)}']`)
    .click();
  await expect(browser.$(ROOT).$("[data-testid=community-form]")).toBeDisplayed();
  await fillForm({ kind });
  await saveForm();
  await expectFormClosed();
  await expectSummary(name, de.communities.screen.summary(kind, "Einheiten"));
};

/** Waits until the file's text is `expected`; the form closes before the write lands. */
const expectText = async (path: string, expected: string) => {
  // On a timeout the assertion below shows the difference.
  await browser.waitUntil(async () => (await fileText(path)) === expected).catch(() => undefined);
  expect(await fileText(path)).toBe(expected);
};

/**
 * DV-01 in real Obsidian: a save changes only the lines of the keys it writes. Every other byte
 * stays: comments, unknown keys in their form, key order, quoting, line breaks, a BOM, the body.
 * `fileText` reads the file's bytes through the adapter, so a BOM shows.
 */
describe("note write fidelity", function () {
  it("saves a changed kind by changing only its line, whatever else the note holds", async function () {
    await installConsoleSpy();
    const path = `${FOLDER}/Ahornweg 12.md`;
    const before = communityText(community(1, { name: "Ahornweg 12", short_code: "AW" }), "Body\n")
      .replace(
        "---\nschema",
        [
          "---",
          "# Kommentar des Beirats",
          "plz: 01067",
          "version: 1.10",
          "iban_nr: 12345678901234567890",
          "flow: [a, b]",
          "seit: 2024-01-01",
          "zeit: 12:30",
          "quoted: 'yes'",
          '"verwalter": "Müller & Söhne" # mit Kommentar',
          "liste:",
          "- eins",
          "-   zwei",
          "text: |",
          "  Zeile 1",
          "",
          "  Zeile 3",
          "schema",
        ].join("\n"),
      )
      .replace("kind: WEG", "kind: WEG  # Art des Objekts");
    await writeNote(path, before);
    await openView();
    await expectListed(["Ahornweg 12"]);
    await saveKind("Ahornweg 12", "Haus");
    await expectText(path, before.replace("kind: WEG", "kind: Haus"));
  });

  it("saves a note that starts with a BOM and keeps the BOM", async function () {
    const path = `${FOLDER}/Bom.md`;
    const before = `${BOM}${communityText(community(2, { name: "Bom", short_code: "BO", color: "blue" }), "Body\n")}`;
    await writeNote(path, before);
    await expectListed(["Ahornweg 12", "Bom"]);
    await saveKind("Bom", "Haus");
    await expectText(path, before.replace("kind: WEG", "kind: Haus"));
  });

  it("saves a note with CRLF line breaks and writes CRLF", async function () {
    const path = `${FOLDER}/Crlf.md`;
    const before = communityText(
      community(3, { name: "Crlf", short_code: "CR", color: "rust" }),
      "Body\nLine 2\n",
    ).replaceAll("\n", "\r\n");
    await writeNote(path, before);
    await expectListed(["Ahornweg 12", "Bom", "Crlf"]);
    await saveKind("Crlf", "Haus");
    await expectText(path, before.replace("kind: WEG", "kind: Haus"));
  });

  it("saves notes whose block closes with `----` or `---` and blanks, keeping that line", async function () {
    const closed = [
      ["Vier", community(4, { name: "Vier", short_code: "VI", color: "violet" }), "----"],
      ["Leer", community(5, { name: "Leer", short_code: "LE", color: "slate" }), "--- \t"],
    ] as const;
    const textOf = (fields: Readonly<Record<string, string>>, closing: string) =>
      communityText(fields, "Body\n").replace("---\nBody", `${closing}\nBody`);
    for (const [name, fields, closing] of closed) {
      await writeNote(`${FOLDER}/${name}.md`, textOf(fields, closing));
    }
    await expectListed(["Ahornweg 12", "Bom", "Crlf", "Leer", "Vier"]);
    for (const [name, fields, closing] of closed) {
      await saveKind(name, "Haus");
      await expectText(`${FOLDER}/${name}.md`, textOf({ ...fields, kind: "Haus" }, closing));
    }
  });

  it("writes values that Obsidian's parseYaml reads back exactly", async function () {
    const tricky = array(
      oneof(
        constantFrom("yes", "null", "~", "01067", "1.10", ": ", " #", "'", '"', "-", "\t", "\n"),
        constantFrom("12:30", "2024-01-01", "\u0085", " ", "\uFEFF", "😀", "\\", "[", "&"),
        string({ unit: "binary", maxLength: 3 }),
      ),
      { maxLength: 5 },
    ).map((parts) => parts.join(""));
    const texts = [
      ...sample(tricky, { numRuns: 600, seed: 21 }),
      ...sample(string({ unit: "binary" }), { numRuns: 300, seed: 11 }),
    ];
    const numbers = [
      "0",
      "-0",
      "1067",
      "1.1",
      "1e+21",
      "5e-324",
      "-12.5",
      "NaN",
      "Infinity",
      "-Infinity",
    ];
    const misread = await browser.executeObsidian(
      ({ obsidian }, textLines, numberLines) => {
        const read = (line: string): unknown =>
          (obsidian.parseYaml(line) as Record<string, unknown>)["k"];
        return [
          ...textLines.filter(([line, value]) => read(line) !== value).map(([line]) => line),
          ...numberLines
            .filter(([line, value]) => !Object.is(read(line), Number(value)))
            .map(([line]) => line),
        ];
      },
      texts.map((value) => [yamlEntry("k", value, "\n"), value] as const),
      numbers.map((value) => [yamlEntry("k", Number(value), "\n"), value] as const),
    );
    expect(misread).toEqual([]);
  });

  it("finds a frontmatter block where Obsidian's metadata cache finds one", async function () {
    const texts = [
      "---\na: 1\n---\nbody\n",
      "---\r\na: 1\r\n---\r\nbody\r\n",
      `${BOM}---\na: 1\n---\nbody\n`,
      `${BOM}---\r\na: 1\r\n---\r\nbody\r\n`,
      "---\na: 1\n---",
      "---\na: 1\n...\n---\nbody\n",
      "---\na: 1\n---\r\nbody\n",
      "# Title\n---\na: 1\n---\n",
      "\n---\na: 1\n---\n",
      "--- \na: 1\n---\n",
      "---\na: 1\nbody\n",
      "---\na: 1\n----\nbody\n",
      "---\na: 1\n---  \nbody\n",
      "---\r\na: 1\r\n---\t\r\nbody\r\n",
    ];
    const found = texts.map((text) => {
      const note = splitNoteText(text);
      return Result.isSuccess(note) && note.success.block !== undefined;
    });
    const paths = await browser.executeObsidian(async ({ app }, notes) => {
      const files = await Promise.all(
        notes.map((text, index) => app.vault.create(`Fences ${index}.md`, text)),
      );
      return files.map((file) => file.path);
    }, texts.map(String));
    // A new file has no cache entry until Obsidian has indexed it: wait for all of them.
    await browser.waitUntil(
      () =>
        browser.executeObsidian(
          ({ app }, files) =>
            files.every((path) => {
              const file = app.vault.getFileByPath(path);
              return file !== null && app.metadataCache.getFileCache(file) !== null;
            }),
          paths,
        ),
      { timeoutMsg: "Obsidian never indexed the notes with the fences" },
    );
    const cached = await browser.executeObsidian(
      ({ app }, files) =>
        files.map((path) => {
          const file = app.vault.getFileByPath(path);
          const cache = file === null ? null : app.metadataCache.getFileCache(file);
          return cache?.sections?.some((section) => section.type === "yaml") ?? false;
        }),
      paths,
    );
    expect(found).toEqual(cached);
  });

  it("logged no error or warning from the plugin and no uncaught error", async function () {
    expect(await pluginProblems()).toEqual([]);
  });
});
