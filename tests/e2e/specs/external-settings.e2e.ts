import { browser, expect } from "@wdio/globals";
import { describe, it } from "mocha";
import { ROOT, installConsoleSpy, openView, pluginProblems, readData, writeData } from "../support";

/** PBI-48: `data.json` changed outside Obsidian (Sync, another program) reaches the open view. */
describe("settings changed outside Obsidian", function () {
  it("shows a greeting written to data.json from outside in the open view", async function () {
    await installConsoleSpy();
    await openView();
    const greeting = browser.$(ROOT).$("[data-testid=greeting]");
    await expect(greeting).toHaveText("Hello from WEG Manager");
    await writeData({ schemaVersion: 1, greeting: "Über Sync angekommen" });
    await expect(greeting).toHaveText("Über Sync angekommen");
  });

  it("turns read-only for a file from a newer version and never overwrites it", async function () {
    const newer = { schemaVersion: 99, greeting: "Aus der Zukunft" };
    await writeData(newer);
    const root = browser.$(ROOT);
    await expect(root.$("[data-testid=read-only-hint]")).toBeDisplayed();
    await expect(root.$("button[type=submit]")).toBeDisabled();
    expect(await readData()).toEqual(newer);
  });

  it("logged no error or warning from the plugin and no uncaught error", async function () {
    expect(await pluginProblems()).toEqual([]);
  });
});
