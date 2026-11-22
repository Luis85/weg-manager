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
  fileText,
  fillForm,
  saveForm,
  writeNote,
} from "../communities";
import { ROOT, installConsoleSpy, openView, pluginProblems } from "../support";

const BOM = "﻿";

/** Saves the community `name` through the form with another kind, as a person does. */
const saveKind = async (name: string, kind: string) => {
  await browser.$(ROOT).$(`button[aria-label='${name} bearbeiten']`).click();
  await expect(browser.$(ROOT).$("[data-testid=community-form]")).toBeDisplayed();
  await fillForm({ kind });
  await saveForm();
  await expectFormClosed();
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
    const before = communityText(
      community(1, { name: "Ahornweg 12", short_code: "AW" }),
      "Body\n",
    ).replace(
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
    );
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

  it("writes values that Obsidian's parseYaml reads back exactly", async function () {
    const tricky = array(
      oneof(
        constantFrom("yes", "null", "~", "01067", "1.10", ": ", " #", "'", '"', "-", "\t", "\n"),
        constantFrom("12:30", "2024-01-01", "\u0085", " ", "﻿", "😀", "\\", "[", "&"),
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
    ];
    const found = texts.map((text) => {
      const note = splitNoteText(text);
      return Result.isSuccess(note) && note.success.block !== undefined;
    });
    const cached = await browser.executeObsidian(async ({ app }, notes) => {
      const files = await Promise.all(
        notes.map((text, index) => app.vault.create(`Fences ${index}.md`, text)),
      );
      await new Promise((resolve) => setTimeout(resolve, 500));
      return files.map(
        (file) =>
          app.metadataCache
            .getFileCache(file)
            ?.sections?.some((section) => section.type === "yaml") ?? false,
      );
    }, texts.map(String));
    expect(found).toEqual(cached);
  });

  it("logged no error or warning from the plugin and no uncaught error", async function () {
    expect(await pluginProblems()).toEqual([]);
  });
});
