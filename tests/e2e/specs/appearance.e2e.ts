import { browser, expect } from "@wdio/globals";
import { mkdirSync, writeFileSync } from "node:fs";
import { describe, it } from "mocha";
import { COMMUNITY_COLORS } from "../../../src/domain/communities";
import { BOUNDARY_CONTRAST, TEXT_CONTRAST, contrast, floor2 } from "../../support/contrast";
import {
  measureFieldBoundaries,
  measurePalette,
  measureTexts,
  overflow,
  parkPointer,
  stylesOf,
  useScheme,
  type Measured,
} from "../appearance";
import {
  FOLDER,
  community,
  communityText,
  expectListed,
  openSection,
  writeNotes,
} from "../communities";
import { ROOT, installConsoleSpy, openView, pluginProblems } from "../support";

/** A legal name of exactly 100 characters (the name rule's maximum), a German compound first. */
const LONG_NAME =
  "Wohnungseigentümergemeinschaft Ahornweg 12–16 und Birkenallee 3, Vorderhaus mit Hinterhaus und Hof 7";

const NOTES = (
  [
    [
      "Ahornweg 12.md",
      communityText(community(1, { name: "Ahornweg 12", short_code: "AW", color: "teal" })),
    ],
    [
      "Tiefgarage Ahornweg.md",
      communityText(
        community(2, { name: "Tiefgarage Ahornweg", short_code: "TG", color: "violet" }),
      ),
    ],
    [
      "Doppelt.md",
      communityText(community(3, { name: "Doppelt", short_code: "AW", color: "blue" })),
    ],
    [
      "Lang.md",
      communityText(community(4, { name: LONG_NAME, short_code: "WEG", color: "olive" })),
    ],
    [
      "Aus der Zukunft.md",
      communityText({
        ...community(5, { name: "Aus der Zukunft" }),
        schema: "weg-manager.community/v2",
      }),
    ],
    ["Kaputt.md", "---\nschema: weg-manager.community/v1\nname: [nicht geschlossen\n---\n"],
  ] satisfies [string, string][]
).map(([name, text]): [string, string] => [`${FOLDER}/${name}`, text]);

const SCHEMES = ["light", "dark"] as const;

/** The least luminance contrast between amber's fill and rust's or olive's, in each theme. */
const AMBER_APART = 1.25;

/** Every measurement, for the report beside the e2e logs. */
const measured: Record<string, Measured[]> = {};

/** Measures the texts inside `scope` in both themes and returns those under 4.5:1. */
const textsInBothSchemes = async (state: string, scope = ROOT) => {
  const all: Measured[] = [];
  for (const scheme of SCHEMES) {
    await useScheme(scheme);
    await parkPointer();
    const texts = await measureTexts(scope);
    measured[`${state}-${scheme}`] = texts;
    all.push(...texts.map((text) => ({ ...text, text: `${scheme}: ${text.text}` })));
  }
  await useScheme("light");
  return all;
};

/** Checks every text field's boundary at 3:1 in both themes. */
const fieldsInBothSchemes = async (state: string) => {
  for (const scheme of SCHEMES) {
    await useScheme(scheme);
    await parkPointer();
    const fields = await measureFieldBoundaries();
    measured[`${state}-${scheme}`] = fields;
    expect(fields.length).toBe(4);
    expect(fields.filter((field) => field.ratio < BOUNDARY_CONTRAST)).toEqual([]);
  }
  await useScheme("light");
};

const failing = (texts: readonly Measured[], minimum = TEXT_CONTRAST) =>
  texts.filter((text) => text.ratio < minimum);

/** The kinds of text a reviewer found under 4.5:1; each must be among the measured texts. */
const kindsIn = (
  texts: readonly Measured[],
  kinds: Readonly<Record<string, (m: Measured) => boolean>>,
) =>
  Object.entries(kinds)
    .filter(([, matches]) => texts.some(matches))
    .map(([kind]) => kind);

const testid = (id: string) => (text: Measured) => text.testid === id;
/** The switch's option for the community called `name`. */
const option = (name: string) =>
  browser
    .$(ROOT)
    .$(
      `.//button[@data-testid="community-option"][.//*[@data-testid="community-option-name" and normalize-space()="${name}"]]`,
    );

/**
 * How the plugin looks in Obsidian's default theme (WCAG 2.2 AA 1.4.3, 1.4.10, 1.4.11): Obsidian's
 * base rules do not reach into the plugin's lists, headings and buttons, every text reaches 4.5:1
 * on its background in light and dark, form fields 3:1, and a long name fits 320 px.
 */
describe("appearance in Obsidian's default theme", function () {
  before(async function () {
    await installConsoleSpy();
    // Room for the frame's sidebar layout (860 px) in the default window.
    await browser.executeObsidian(({ app }) => {
      app.workspace.leftSplit.collapse();
      app.workspace.rightSplit.collapse();
    });
    await writeNotes(NOTES);
    await openView();
    await expectListed([
      "Ahornweg 12",
      "Aus der Zukunft",
      "Doppelt",
      "Tiefgarage Ahornweg",
      LONG_NAME,
    ]);
  });

  after(function () {
    mkdirSync("reports/e2e", { recursive: true });
    writeFileSync("reports/e2e/appearance-contrast.json", JSON.stringify(measured, null, 1));
  });

  it("keeps the short code of every palette colour at 4.5:1 and amber apart from rust and olive", async function () {
    const fills: Record<string, Record<string, number>> = {};
    for (const scheme of SCHEMES) {
      await useScheme(scheme);
      const badges = await measurePalette(COMMUNITY_COLORS);
      expect(badges.map((badge) => badge.color)).toEqual([...COMMUNITY_COLORS]);
      expect(badges.filter((badge) => badge.ratio < TEXT_CONTRAST)).toEqual([]);
      const amber = badges.find((badge) => badge.color === "amber");
      expect(amber).toBeDefined();
      // The luminance contrast of amber's fill against each other fill, for the report. Amber has
      // to stay apart from its nearest neighbours in hue, rust and olive, by brightness too.
      const against = Object.fromEntries(
        badges
          .filter((badge) => badge.color !== "amber")
          .map((badge) => [badge.color, floor2(contrast(badge.fill, amber?.fill ?? badge.fill))]),
      );
      fills[scheme] = against;
      measured[`palette-${scheme}`] = badges.map(({ color, ratio }) => ({
        text: color,
        testid: "community-badge",
        ratio,
      }));
      expect(Math.min(against["rust"] ?? 0, against["olive"] ?? 0)).toBeGreaterThanOrEqual(
        AMBER_APART,
      );
    }
    await useScheme("light");
    mkdirSync("reports/e2e", { recursive: true });
    writeFileSync("reports/e2e/amber-fills.json", JSON.stringify(fills, null, 1));
  });

  it("starts the plugin's lists, headings and paragraphs from zero", async function () {
    const lists = await stylesOf("ul, ol", ["list-style-type", "padding-left", "margin-top"]);
    expect(lists.length).toBeGreaterThanOrEqual(4);
    for (const list of lists) {
      expect(list).toMatchObject({
        "list-style-type": "none",
        "padding-left": "0px",
        "margin-top": "0px",
      });
    }
    const blocks = await stylesOf("h2, h3, p", ["margin-top", "margin-bottom"]);
    expect(blocks.length).toBeGreaterThanOrEqual(4);
    for (const block of blocks)
      expect(block).toMatchObject({ "margin-top": "0px", "margin-bottom": "0px" });
  });

  it("gives ghost buttons only what their variant says, not Obsidian's button chrome", async function () {
    await parkPointer();
    // The frame shows no history controls until there is a step; the switch offers the two
    // communities without issues (Ahornweg 12 and Doppelt share a short code, one is newer).
    await expect(browser.$(ROOT).$("[data-testid=frame-history]")).not.toExist();
    const ghosts = [
      ...(await stylesOf("[data-testid=community-option]", ["background-color", "box-shadow"])),
      ...(await stylesOf("[data-testid=community-remove]", ["background-color", "box-shadow"])),
    ];
    expect(ghosts.length).toBe(2 + 4);
    for (const ghost of ghosts) {
      expect(ghost).toMatchObject({ "background-color": "rgba(0, 0, 0, 0)", "box-shadow": "none" });
    }
  });

  it("keeps every text of the list at 4.5:1, warnings and the primary action included", async function () {
    const texts = await textsInBothSchemes("list");
    expect(failing(texts)).toEqual([]);
    expect(
      kindsIn(texts, {
        choice: testid("community-choice"),
        issue: testid("community-issues"),
        count: testid("data-issues-count"),
        remove: testid("community-remove"),
        add: testid("community-add"),
      }),
    ).toEqual(["choice", "issue", "count", "remove", "add"]);
  });

  it("keeps every text of the data issues section at 4.5:1, its issues and current entry included", async function () {
    await openSection("Datenprobleme");
    const texts = await textsInBothSchemes("data-issues");
    expect(failing(texts)).toEqual([]);
    expect(
      kindsIn(texts, {
        problem: (text) => text.testid === "unindexed-notes" && !text.text.endsWith(".md"),
        path: (text) => text.testid === "unindexed-notes" && text.text.endsWith(".md"),
        section: (text) =>
          text.testid === "settings-sections" && text.text.includes("Datenprobleme"),
      }),
    ).toEqual(["problem", "path", "section"]);
    // The current section is marked by a bar too, not by its colour alone.
    const [current] = await stylesOf("[data-testid=settings-sections] button[aria-current=page]", [
      "box-shadow",
    ]);
    expect(current?.["box-shadow"]).not.toBe("none");
    // The frame's entry stays the current page on this section too, with its bar.
    const [entry] = await stylesOf("[data-testid=frame-navigation] button[aria-current=page]", [
      "box-shadow",
    ]);
    expect(entry?.["box-shadow"]).not.toBe("none");
    await openSection("Gemeinschaften");
    await expectListed([
      "Ahornweg 12",
      "Aus der Zukunft",
      "Doppelt",
      "Tiefgarage Ahornweg",
      LONG_NAME,
    ]);
  });

  it("marks the selected community and the current page beyond colour, at 4.5:1", async function () {
    await option("Tiefgarage Ahornweg").click();
    await expect(option("Tiefgarage Ahornweg")).toHaveAttribute("aria-checked", "true");
    const texts = await textsInBothSchemes("selected");
    expect(failing(texts)).toEqual([]);
    expect(
      kindsIn(texts, {
        selected: (text) =>
          text.testid === "community-option-name" && text.text.endsWith("Tiefgarage Ahornweg"),
        marker: testid("community-selected"),
        page: (text) => text.testid === "frame-navigation" && text.text.endsWith("Einstellungen"),
      }),
    ).toEqual(["selected", "marker", "page"]);
    // Not by colour alone: a check mark on the selected option, "Aktuell" on its card, a bar on
    // the current page.
    await expect(option("Tiefgarage Ahornweg").$("[data-testid=community-option-check]")).toExist();
    await expect(option(LONG_NAME).$("[data-testid=community-option-check]")).not.toExist();
    await expect(browser.$(ROOT).$("[data-testid=community-selected]")).toHaveText("Aktuell");
    const [current] = await stylesOf("[data-testid=frame-navigation] button[aria-current=page]", [
      "box-shadow",
    ]);
    expect(current?.["box-shadow"]).not.toBe("none");
  });

  it("fits a 100-character name: truncated in the switch with its full name, wrapped on its card", async function () {
    expect(LONG_NAME).toHaveLength(100);
    const fits = () =>
      browser.execute(
        (selector, name) => {
          const root = document.querySelector(selector);
          const nav = root?.querySelector("nav")?.getBoundingClientRect();
          const button = root?.querySelector(`[data-testid=community-option][title="${name}"]`);
          const label = button?.querySelector<HTMLElement>("[data-testid=community-option-name]");
          const title = [
            ...(root?.querySelectorAll<HTMLElement>("[data-testid=community-name]") ?? []),
          ].find((element) => element.textContent?.trim() === name);
          return {
            inNav: (button?.getBoundingClientRect().right ?? Infinity) <= (nav?.right ?? 0) + 0.5,
            truncated:
              label !== null && label !== undefined && label.scrollWidth > label.clientWidth,
            titleFits: title !== undefined && title.scrollWidth <= title.clientWidth,
          };
        },
        ROOT,
        LONG_NAME,
      );
    // Wide: the navigation is a 224 px sidebar.
    expect(await fits()).toEqual({ inNav: true, truncated: true, titleFits: true });
    expect(await overflow()).toEqual({ scroll: 0, past: [] });

    await browser.execute((selector) => {
      document.querySelector<HTMLElement>(selector)?.style.setProperty("max-width", "320px");
    }, ROOT);
    await browser.pause(300);
    expect(await fits()).toEqual({ inNav: true, truncated: true, titleFits: true });
    expect(await overflow()).toEqual({ scroll: 0, past: [] });
    await browser.execute((selector) => {
      document.querySelector<HTMLElement>(selector)?.style.removeProperty("max-width");
    }, ROOT);
  });

  it("keeps the create sheet's errors at 4.5:1 and its fields at 3:1, the colour fieldset unindented", async function () {
    await browser.$(ROOT).$("[data-testid=community-add]").click();
    await expect(browser.$(ROOT).$("[data-testid=community-form]")).toBeDisplayed();
    // The sheet opens with the focus on Name. Measure the fields at rest: a focused one shows its
    // focus by Obsidian's 3 px outline in the accent colour, not by this boundary.
    await browser.execute(() => {
      (document.activeElement as HTMLElement | null)?.blur();
    });
    await fieldsInBothSchemes("fields");
    await browser.$(ROOT).$("[data-testid=community-save]").click();
    const sheet = `${ROOT} [role=dialog]`;
    await browser.waitUntil(
      async () =>
        (await measureTexts(sheet)).some((text) => text.text.includes("Gib einen Namen ein.")),
      { timeoutMsg: "the sheet never showed the missing fields" },
    );
    const texts = await textsInBothSchemes("sheet", sheet);
    expect(failing(texts)).toEqual([]);
    expect(
      kindsIn(texts, {
        error: (text) => text.text.includes("Gib einen Namen ein."),
        summary: testid("form-summary"),
        save: testid("community-save"),
      }),
    ).toEqual(["error", "summary", "save"]);

    // An invalid field draws its boundary in the error colour, which has to reach 3:1 as well.
    // The failed submit put the focus on the first invalid field: measure them at rest again.
    await browser.execute(() => {
      (document.activeElement as HTMLElement | null)?.blur();
    });
    await fieldsInBothSchemes("fields-invalid");

    const [fieldset] = await stylesOf("fieldset", [
      "border-top-width",
      "padding-left",
      "margin-left",
      "min-width",
    ]);
    expect(fieldset).toMatchObject({
      "border-top-width": "0px",
      "padding-left": "0px",
      "margin-left": "0px",
      "min-width": "0px",
    });
    const [legend] = await stylesOf("legend", ["padding-left"]);
    expect(legend).toMatchObject({ "padding-left": "0px" });
    await browser.keys("Escape");
    await expect(browser.$(ROOT).$("[data-testid=community-form]")).not.toExist();
  });

  it("keeps the delete confirmation and its failure at 4.5:1", async function () {
    await browser.$(ROOT).$("[aria-label='Doppelt löschen']").click();
    await expect(browser.$(ROOT).$("[data-testid=delete-confirm]")).toBeDisplayed();
    const dialog = `${ROOT} [role=alertdialog], ${ROOT} [role=dialog]`;
    const texts = await textsInBothSchemes("delete", dialog);
    expect(failing(texts)).toEqual([]);
    expect(kindsIn(texts, { confirm: testid("delete-confirm") })).toEqual(["confirm"]);

    // The note vanishes before the confirmation: the dialog shows the failure as an alert.
    await browser.executeObsidian(async ({ app }, path) => {
      const file = app.vault.getFileByPath(path);
      if (file !== null) await app.vault.delete(file);
    }, `${FOLDER}/Doppelt.md`);
    await browser.$(ROOT).$("[data-testid=delete-confirm]").click();
    await expect(browser.$(ROOT).$("[role=dialog] [role=alert]")).toBeDisplayed();
    const failure = await textsInBothSchemes(
      "delete-failure",
      `${ROOT} [role=dialog] [role=alert]`,
    );
    expect(failure.length).toBeGreaterThan(0);
    expect(failing(failure)).toEqual([]);
    await browser.keys("Escape");
  });

  it("logged no error or warning from the plugin and no uncaught error", async function () {
    expect(await pluginProblems()).toEqual([]);
  });
});
