import { browser, expect } from "@wdio/globals";
import { describe, it } from "mocha";
import {
  PLUGIN_ID,
  ROOT,
  installConsoleSpy,
  openView,
  pluginProblems,
  readData,
  reloadPlugin,
  settingsTabContent,
  writeData,
} from "../support";

/** Obsidian's language as `getLanguage()` reports it. */
const obsidianLanguage = () => browser.executeObsidian(({ obsidian }) => obsidian.getLanguage());

/**
 * Switches Obsidian's language as its own setting does (`localStorage` key `language`). Obsidian
 * asks for a restart; the plugin picks the language on its next load, so a reload is enough.
 */
const switchLanguage = async (language: string) => {
  await browser.executeObsidian((_, code) => {
    // App-wide, not per vault, so not `app.saveLocalStorage`.
    window.localStorage.setItem("language", code);
  }, language);
  await reloadPlugin();
};

const commandNames = () =>
  browser.executeObsidian(({ app }, id) => {
    const { commands } = (
      app as unknown as { commands: { commands: Record<string, { name: string }> } }
    ).commands;
    return Object.entries(commands)
      .filter(([key]) => key.startsWith(`${id}:`))
      .map(([, command]) => command.name)
      .toSorted();
  }, PLUGIN_ID);

const noticeTexts = () =>
  browser.executeObsidian(() =>
    [...document.querySelectorAll(".notice")].map((el) => el.textContent ?? ""),
  );

/** ADR 0005: the plugin speaks Obsidian's language, German or else English. */
describe("UI language in Obsidian", function () {
  it("runs German like the Obsidian of this suite and ignores an old greeting in data.json", async function () {
    await installConsoleSpy();
    expect(await obsidianLanguage()).toBe("de");
    const old = { schemaVersion: 1, greeting: "Hello from WEG Manager", logLevel: "warn" };
    await writeData(old);
    await reloadPlugin();
    await openView();
    await expect(browser.$(ROOT).$("[data-testid=communities-screen] h2")).toHaveText(
      "Gemeinschaften",
    );
    expect(await readData()).toEqual(old);
    expect(await noticeTexts()).toEqual([]);
  });

  it("switches to English on the next load once Obsidian is English", async function () {
    await switchLanguage("en");
    expect(await obsidianLanguage()).toBe("en");
    await openView();
    const root = browser.$(ROOT);
    await expect(root.$("[data-testid=communities-screen] h2")).toHaveText("Communities");
    await expect(root.$("[data-testid=communities-empty] p")).toHaveText(
      "Your communities appear here, such as a homeowners' association (WEG) and its underground car park.",
    );
    await expect(root.$("[data-testid=frame-navigation] li button[aria-current=page]")).toHaveText(
      "Settings",
    );
    await root.$("[data-testid=community-add]").click();
    await expect(root.$("[data-testid=community-save]")).toHaveText("Save");
    await browser.keys("Escape");
    // The product name in every language, so the ribbon entry keeps its id.
    await expect(
      browser.$$('.side-dock-ribbon-action[aria-label="WEG Manager"]'),
    ).toBeElementsArrayOfSize(1);
    // Obsidian puts the plugin's name in front of each command name.
    expect(await commandNames()).toEqual([
      "WEG Manager: Copy diagnostics",
      "WEG Manager: Open view",
    ]);
    expect((await settingsTabContent()).names).toEqual([
      "Log level",
      "Start of the week",
      "Time target of the week",
      "Regular decisions per week",
      "Deadline for acute problems",
    ]);
  });

  it("shows notices in English", async function () {
    await writeData({ schemaVersion: 99 });
    await browser.waitUntil(
      async () => (await noticeTexts()).some((text) => text.includes("Settings are read-only")),
      { timeoutMsg: "no English read-only notice" },
    );
  });

  it("logged no error or warning from the plugin and no uncaught error", async function () {
    expect(await pluginProblems()).toEqual([]);
  });
});
