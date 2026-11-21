import { browser, expect } from "@wdio/globals";
import { afterEach, describe, it } from "mocha";
import {
  ROOT,
  installConsoleSpy,
  openView,
  pluginProblems,
  readData,
  reloadPlugin,
  setColorScheme,
  writeData,
} from "../support";

const openPluginSettings = () =>
  browser.executeObsidian(({ app }) => {
    const setting = (app as unknown as { setting: { open(): void; openTabById(id: string): void } })
      .setting;
    setting.open();
    setting.openTabById("weg-manager");
  });

const closeSettings = () =>
  browser.executeObsidian(({ app }) => {
    (app as unknown as { setting: { close(): void } }).setting.close();
  });

/**
 * Edits the greeting in the real declarative settings tab. Obsidian 1.15 renders settings
 * outside the main document, so the field is reached through the tab's own element and edited
 * with the events a keyboard edit fires.
 */
const typeGreeting = (value: string) =>
  browser.executeObsidian(async ({ app }, next) => {
    const tab = (app as unknown as { setting: { activeTab?: { containerEl: HTMLElement } } })
      .setting.activeTab;
    const item = [...(tab?.containerEl.querySelectorAll(".setting-item") ?? [])].find(
      (el) => el.querySelector(".setting-item-name")?.textContent === "Begrüßung",
    );
    const input = item?.querySelector("input");
    if (!input) throw new Error("greeting field not found in the settings tab");
    input.focus();
    input.value = next;
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
    input.blur();
    await new Promise((resolve) => setTimeout(resolve, 100));
  }, value);

/** The text of every notice Obsidian currently shows, in any of its documents. */
const noticeTexts = () =>
  browser.executeObsidian(() =>
    [document, activeDocument].flatMap((doc) =>
      [...doc.querySelectorAll(".notice")].map((el) => el.textContent ?? ""),
    ),
  );

/** Theme classes on the root and the colours Obsidian and the surface resolve to. */
const sample = () =>
  browser.execute((selector) => {
    const root = document.querySelector<HTMLElement>(selector);
    const card = root?.querySelector<HTMLElement>("[data-testid=greeting]")?.closest("div");
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
      cardText: card ? getComputedStyle(card).color : "",
    };
  }, ROOT);

/** Gaps G2, G3 and G5: the real settings tab, theme switching and Obsidian's CSS. */
describe("settings and theme in Obsidian", function () {
  afterEach(closeSettings);

  it("saves a greeting from the native settings tab and shows it in the open view", async function () {
    await installConsoleSpy();
    await openView();
    await openPluginSettings();
    await typeGreeting("Moin aus dem Test");
    await browser.waitUntil(async () => (await readData())?.["greeting"] === "Moin aus dem Test", {
      timeoutMsg: "data.json never received the new greeting",
    });
    await closeSettings();
    await expect(browser.$(ROOT).$("[data-testid=greeting]")).toHaveText("Moin aus dem Test");
  });

  it("never writes an empty greeting", async function () {
    await openPluginSettings();
    await typeGreeting("");
    await browser.pause(500);
    expect((await readData())?.["greeting"]).toBe("Moin aus dem Test");
  });

  it("follows Obsidian's light/dark switch and takes its colours from the theme", async function () {
    await setColorScheme("light");
    const light = await sample();
    expect(light).toMatchObject({ light: true, dark: false });
    expect(light.uiBg).toBe(light.hostBg);

    await setColorScheme("dark");
    await browser.waitUntil(async () => (await sample()).dark, {
      timeoutMsg: "root never turned dark",
    });
    const dark = await sample();
    expect(dark.light).toBe(false);
    expect(dark.uiBg).toBe(dark.hostBg);
    expect(dark.hostBg).not.toBe(light.hostBg);
    expect(dark.cardText).not.toBe(light.cardText);

    await setColorScheme("light");
  });

  it("shows settings from a newer version read-only and never overwrites them", async function () {
    const newer = { schemaVersion: 99, greeting: "Aus der Zukunft" };
    await writeData(newer);
    await reloadPlugin();
    await openView();
    const root = browser.$(ROOT);
    await expect(root.$("[data-testid=read-only-hint]")).toBeDisplayed();
    await expect(root.$("button[type=submit]")).toBeDisabled();
    expect((await noticeTexts()).some((text) => text.includes("schreibgeschützt"))).toBe(true);
    expect(await readData()).toEqual(newer);
  });

  it("logged no error or warning from the plugin and no uncaught error", async function () {
    expect(await pluginProblems()).toEqual([]);
  });
});
