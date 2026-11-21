import { browser, expect } from "@wdio/globals";
import { describe, it } from "mocha";
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

/** PBI-48: `data.json` changed outside Obsidian (Sync, another program) reaches the plugin. */
describe("settings changed outside Obsidian", function () {
  it("shows a root folder written to data.json from outside in the open view", async function () {
    await installConsoleSpy();
    await openView();
    const intro = browser.$(ROOT).$("[data-testid=communities-intro]");
    await expect(intro).toHaveText(
      "Jede Gemeinschaft ist eine Notiz im Ordner „WEG Manager/Gemeinschaften“.",
    );
    await writeData({ schemaVersion: 1, rootFolder: "Beirat", logLevel: "info" });
    await expect(intro).toHaveText(
      "Jede Gemeinschaft ist eine Notiz im Ordner „Beirat/Gemeinschaften“.",
    );
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
      "Protokollstufe",
      "Einstellungen schreibgeschützt",
    ]);
    await logLevelControl("info");
    await browser.pause(300);
    expect(await readData()).toEqual(newer);
  });

  it("logged no error or warning from the plugin and no uncaught error", async function () {
    expect(await pluginProblems()).toEqual([]);
  });
});
