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
  it("is listed read-only with its issue and offers no action", async function () {
    await installConsoleSpy();
    await writeNote(PATH, NEWER);
    await openView();
    await expectListed(["Zukunft"]);
    const row = browser.$(ROOT).$("[data-testid=community]");
    await expect(row.$("[data-testid=community-read-only]")).toHaveText("Schreibgeschützt");
    await expect(row.$("[data-testid=community-issues]")).toHaveText(
      "Die Notiz stammt aus einer neueren Plugin-Version (Schemaversion 2), deshalb ist sie schreibgeschützt. Aktualisiere WEG Manager, um sie zu bearbeiten.",
    );
    await expect(row.$("[data-testid=community-edit]")).not.toExist();
    await expect(row.$("[data-testid=community-remove]")).not.toExist();
  });

  it("is never written, also across a plugin reload and a selection", async function () {
    await browser.$(ROOT).$("[data-testid=community-option]").click();
    await reloadPlugin();
    await openView();
    await expectListed(["Zukunft"]);
    await browser.pause(500);
    expect(await fileText(PATH)).toBe(NEWER);
  });

  it("logged no error or warning from the plugin and no uncaught error", async function () {
    expect(await pluginProblems()).toEqual([]);
  });
});
