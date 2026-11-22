import { browser, expect } from "@wdio/globals";
import { describe, it } from "mocha";
import {
  ROOT,
  expectNotice,
  installConsoleSpy,
  logLevelControl,
  openView,
  pluginProblems,
  readData,
  reloadPlugin,
  setColorScheme,
  settingsTabContent,
  writeData,
} from "../support";
import { de } from "../texts";

/** Theme classes on the root and the colours Obsidian and the surface resolve to. */
const sample = () =>
  browser.execute((selector) => {
    const root = document.querySelector<HTMLElement>(selector);
    const screen = root?.querySelector<HTMLElement>("[data-testid=communities-screen]");
    const probe = document.createElement("div");
    probe.style.backgroundColor = "var(--background-primary)";
    document.body.append(probe);
    const hostBackground = getComputedStyle(probe).backgroundColor;
    probe.remove();
    return {
      dark: root?.classList.contains("dark") ?? false,
      light: root?.classList.contains("light") ?? false,
      uiBg: root ? getComputedStyle(root).getPropertyValue("--ui-bg").trim() : "",
      hostBg: getComputedStyle(document.body).getPropertyValue("--background-primary").trim(),
      rootBackground: root ? getComputedStyle(root.firstElementChild ?? root).backgroundColor : "",
      hostBackground,
      screenText: screen ? getComputedStyle(screen).color : "",
      teal: root ? getComputedStyle(root).getPropertyValue("--wm-community-teal").trim() : "",
    };
  }, ROOT);

/** Gaps G2, G3 and G5: the real settings tab, theme switching and CSS. */
describe("settings and theme in Obsidian", function () {
  it("keeps only the plugin settings in the native settings tab (PBI-49)", async function () {
    await installConsoleSpy();
    expect(await settingsTabContent()).toEqual({
      names: [de.shell.settingsTab.logLevel.name],
      inputs: 0,
    });
  });

  it("saves the log level chosen in the settings tab to data.json", async function () {
    expect(await logLevelControl("debug")).toEqual({ value: "debug", disabled: false });
    await browser.waitUntil(async () => (await readData())?.["logLevel"] === "debug", {
      timeoutMsg: "data.json never received the new log level",
    });
    expect(await logLevelControl()).toEqual({ value: "debug", disabled: false });
  });

  it("follows Obsidian's light/dark switch and takes its colours from the theme", async function () {
    await openView();
    await expect(browser.$(ROOT).$("[data-testid=communities-screen]")).toBeDisplayed();
    await setColorScheme("light");
    await browser.waitUntil(async () => (await sample()).light, {
      timeoutMsg: "root never turned light",
    });
    const light = await sample();
    expect(light).toMatchObject({ light: true, dark: false, teal: "#0f766e" });
    expect(light.uiBg).toBe(light.hostBg);

    await setColorScheme("dark");
    await browser.waitUntil(async () => (await sample()).dark, {
      timeoutMsg: "root never turned dark",
    });
    const dark = await sample();
    expect(dark).toMatchObject({ light: false, teal: "#2bb3a3" });
    expect(dark.uiBg).toBe(dark.hostBg);
    expect(dark.hostBg).not.toBe(light.hostBg);
    expect(dark.screenText).not.toBe(light.screenText);

    await setColorScheme("light");
  });

  it("shows settings from a newer version read-only and never overwrites them", async function () {
    const newer = { schemaVersion: 99, logLevel: "error" };
    await writeData(newer);
    await reloadPlugin();
    expect((await settingsTabContent()).names).toEqual([
      de.shell.settingsTab.logLevel.name,
      de.shell.errors.readOnly.title,
    ]);
    expect(await logLevelControl("info")).toMatchObject({ disabled: true });
    await expectNotice(de.shell.errors.readOnly.title);
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
