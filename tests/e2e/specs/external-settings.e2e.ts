import { browser, expect } from "@wdio/globals";
import { describe, it } from "mocha";
import {
  FOLDER,
  expectFormClosed,
  expectListed,
  fileText,
  fillForm,
  saveForm,
} from "../communities";
import {
  ROOT,
  installConsoleSpy,
  logLevelControl,
  openView,
  pluginProblems,
  readData,
  settingsTabContent,
  writeData,
} from "../support";
import { de, settingNames } from "../texts";

const INTRO = (folder: string) => de.communities.screen.intro(folder);

/** PBI-48: `data.json` changed outside Obsidian (Sync, another program) reaches the plugin. */
describe("settings changed outside Obsidian", function () {
  it("shows a root folder written to data.json from outside in the open view", async function () {
    await installConsoleSpy();
    await openView();
    const intro = browser.$(ROOT).$("[data-testid=communities-intro]");
    await expect(intro).toHaveText(INTRO("WEG Manager/Gemeinschaften"));
    await writeData({ schemaVersion: 1, rootFolder: "Beirat", logLevel: "info" });
    await expect(intro).toHaveText(INTRO("Beirat/Gemeinschaften"));
  });

  it("falls back from a hidden root folder, so a created community is listed", async function () {
    // Obsidian does not index a folder whose name starts with a dot: notes there would vanish.
    await writeData({ schemaVersion: 1, rootFolder: ".weg", logLevel: "info" });
    const intro = browser.$(ROOT).$("[data-testid=communities-intro]");
    await expect(intro).toHaveText(INTRO("WEG Manager/Gemeinschaften"));
    await browser.$(ROOT).$("[data-testid=community-add]").click();
    await fillForm({
      name: "Ahornweg 12",
      short_code: "AW",
      kind: "WEG",
      unit_label: "Einheiten",
      color: "teal",
    });
    await saveForm();
    await expectFormClosed();
    await expectListed(["Ahornweg 12"]);
    expect(await fileText(`${FOLDER}/Ahornweg 12.md`)).not.toBeNull();
    expect(await fileText(".weg/Gemeinschaften/Ahornweg 12.md")).toBeNull();
  });

  it("shows a log level written from outside in the settings tab", async function () {
    expect(await logLevelControl()).toEqual({ value: "info", disabled: false });
    await writeData({ schemaVersion: 1, rootFolder: "Beirat", logLevel: "debug" });
    await browser.waitUntil(async () => (await logLevelControl()).value === "debug", {
      timeoutMsg: "the settings tab never showed the new log level",
    });
  });

  it("turns read-only for a file from a newer version and never overwrites it", async function () {
    const newer = { schemaVersion: 99, logLevel: "error" };
    await writeData(newer);
    await browser.waitUntil(async () => (await logLevelControl()).disabled === true, {
      timeoutMsg: "the settings tab never turned read-only",
    });
    expect((await settingsTabContent()).names).toEqual([
      ...settingNames(),
      de.shell.errors.readOnly.title,
    ]);
    await logLevelControl("info");
    // "Never overwrites" is a negative check, and a late save would make it pass empty. So let
    // the plugin prove it has followed the file after the refused change: a second file from a
    // newer version, written from outside, reaches the tab, and only then must `data.json` still
    // be that file (a save of the refused change would have replaced it).
    const later = { schemaVersion: 100, logLevel: "warn" };
    await writeData(later);
    await browser.waitUntil(async () => (await logLevelControl()).value === "warn", {
      timeoutMsg: "the settings tab never showed the later file's log level",
    });
    expect(await readData()).toEqual(later);
  });

  it("logged no error or warning from the plugin and no uncaught error", async function () {
    expect(await pluginProblems()).toEqual([]);
  });
});
