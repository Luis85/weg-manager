import { browser, expect } from "@wdio/globals";
import { describe, it } from "mocha";
import {
  ROOT,
  installConsoleSpy,
  openView,
  pluginProblems,
  readData,
  reloadPlugin,
  setColorScheme,
  settingsTabContent,
  writeData,
} from "../support";

/** WebDriver key codes; `Key` from `@wdio/globals` has no type the e2e lint can resolve. */
const KEY = { ctrl: "\uE009", backspace: "\uE003", enter: "\uE007" } as const;

/** The greeting field of the open view's form, edited from the keyboard. */
const greetingInput = () => browser.$(ROOT).$("[data-testid=greeting-input]");

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

/** Gaps G2, G3 and G5: the real settings tab, the greeting form, theme switching and CSS. */
describe("settings and theme in Obsidian", function () {
  it("keeps only the plugin settings in the native settings tab (PBI-49)", async function () {
    await installConsoleSpy();
    expect(await settingsTabContent()).toEqual({ names: ["Protokollstufe"], inputs: 0 });
  });

  it("saves a greeting from the view's form and shows it", async function () {
    await openView();
    await greetingInput().setValue("Moin aus dem Test");
    await browser.$(ROOT).$("button[type=submit]").click();
    await browser.waitUntil(async () => (await readData())?.["greeting"] === "Moin aus dem Test", {
      timeoutMsg: "data.json never received the new greeting",
    });
    await expect(browser.$(ROOT).$("[data-testid=greeting]")).toHaveText("Moin aus dem Test");
  });

  it("never writes an empty greeting", async function () {
    const input = greetingInput();
    await input.click();
    await browser.keys([KEY.ctrl, "a"]);
    await browser.keys(KEY.backspace);
    await expect(input).toHaveValue("");
    await expect(browser.$(ROOT)).toHaveText(
      expect.stringContaining("Die Begrüßung muss 1 bis 200 Zeichen lang sein."),
    );
    await browser.keys(KEY.enter);
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
