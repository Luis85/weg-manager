import { browser, expect } from "@wdio/globals";
import { describe, it } from "mocha";
import { DIFFICULT_FACTS } from "../../support/notes/difficult-fidelity";
import { DIFFICULT_NOTES } from "../../support/notes/difficult-notes";
import { difficultScenario } from "../../support/notes/difficult-scenario";
import { cacheIdle, installConsoleSpy, pluginProblems } from "../support";

/**
 * The scenario "note with difficult frontmatter" in real Obsidian: nested properties, block
 * scalars and multi-line texts, wikilinks, `tags` and `aliases` in their forms, comments,
 * duplicate keys, anchors, empty values, a BOM with CRLF, tabs. The same expectation holds the
 * double (`tests/unit/support/obsidian-double.test.ts`).
 */
describe("notes with difficult frontmatter in Obsidian", function () {
  it("are read by the cache, parseYaml and the NoteStore adapter as the double reads them", async function () {
    await cacheIdle();
    await installConsoleSpy();
    const report = await browser.executeObsidian(difficultScenario, DIFFICULT_NOTES);
    expect(report).toEqual(DIFFICULT_FACTS);
    expect(await pluginProblems()).toEqual([]);
  });
});
