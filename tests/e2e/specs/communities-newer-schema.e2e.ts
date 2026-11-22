import { browser, expect } from "@wdio/globals";
import { describe, it } from "mocha";
import {
  FOLDER,
  community,
  communityText,
  expectListed,
  fileText,
  writeNote,
} from "../communities";
import { ROOT, installConsoleSpy, openView, pluginProblems, reloadPlugin } from "../support";
import { de } from "../texts";

const PATH = `${FOLDER}/Zukunft.md`;
const NEWER = communityText(
  community(1, {
    schema: "weg-manager.community/v2",
    name: "Aus der Zukunft",
    region: "Nord",
  }),
  "Text einer neueren Version\n",
);

/** ADR 0007: a note of a newer schema version is shown read-only and never written. */
describe("communities: a note of a newer schema version", function () {
  it("is listed read-only with its issue and offers only to open it", async function () {
    await installConsoleSpy();
    await writeNote(PATH, NEWER);
    await openView();
    await expectListed(["Zukunft"]);
    const row = browser.$(ROOT).$("[data-testid=community]");
    await expect(row.$("[data-testid=community-read-only]")).toHaveText(
      de.communities.screen.readOnly,
    );
    await expect(row.$("[data-testid=community-issues]")).toHaveText(
      de.notes.recordIssues["schema.newer"]({ code: "schema.newer", version: 2 }),
    );
    await expect(row.$("[data-testid=community-edit]")).not.toExist();
    await expect(row.$("[data-testid=community-remove]")).not.toExist();
    // The only action: open the note in Obsidian to look at it there.
    await expect(row.$("[data-testid=open-note]")).toHaveText(de.notes.openNote.label);
  });

  it("is never offered in the switch, and never written across a plugin reload", async function () {
    await expect(browser.$(ROOT).$("[data-testid=community-option]")).not.toExist();
    await expect(browser.$(ROOT).$("[data-testid=community-switch]")).toHaveText(
      expect.stringContaining(de.communities.switcher.unavailable),
    );
    await reloadPlugin();
    await openView();
    await expectListed(["Zukunft"]);
    // "Never written" is a negative check, and a late write would make it pass empty. So let the
    // plugin prove it is alive and following the vault first: a note written afterwards reaches
    // its list, and the plugin has handled everything that came before it. Then the file must
    // still be the one the test wrote.
    await writeNote(`${FOLDER}/Gegenwart.md`, communityText(community(2, { name: "Gegenwart" })));
    await expectListed(["Gegenwart", "Zukunft"]);
    expect(await fileText(PATH)).toBe(NEWER);
  });

  it("logged no error or warning from the plugin and no uncaught error", async function () {
    expect(await pluginProblems()).toEqual([]);
  });
});
