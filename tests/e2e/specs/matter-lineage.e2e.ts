import { browser, expect } from "@wdio/globals";
import { describe, it } from "mocha";
import { community, communityText, fileText, writeNote } from "../communities";
import { ROOT, installConsoleSpy, openView, pluginProblems } from "../support";
import { de } from "../texts";

const AW = community(1, { name: "Ahornweg", short_code: "AW" });
const MANAGER = "contact-00000000-0000-4000-8000-0000000000c9";
const SOURCE = "WEG Manager/Vorgänge/Lampen.md";
const TWIN = "WEG Manager/Vorgänge/Lampe doppelt.md";
const lines = (...parts: string[]) => [...parts, ""].join("\n");

/** A matter note of AW with `number`, `outcome` and the given `id` suffix. */
const matterText = (suffix: string, number: number, outcome: string, next: string) =>
  lines(
    "---",
    "schema: weg-manager.matter/v1",
    `id: matter-00000000-0000-4000-8000-0000000000${suffix}`,
    `number: ${number}`,
    `community_id: ${AW.id}`,
    "kind: manager_promise",
    "topic: Beleuchtung",
    `outcome: ${outcome}`,
    `responsible_id: ${MANAGER}`,
    "status: open",
    "source: Mail",
    `next_step: ${next}`,
    "---",
  );

/** The card whose name is `outcome`: the card holds the name's column. */
const card = (outcome: string) =>
  browser.$(ROOT).$(`h3*=${outcome}`).parentElement().parentElement();

/** Fills part `index` of the split form: `outcome`, the manager, a next step. */
const fillPart = async (index: number, outcome: string) => {
  const part = browser.$(ROOT).$$("[data-testid=split-part]")[index];
  if (part === undefined) throw new Error(`no part ${index}`);
  await part.$("[data-testid=part-outcome]").setValue(outcome);
  await part.$("[data-testid=part-responsible]").selectByAttribute("value", MANAGER);
  await part.$("[data-testid=part-next]").setValue("Nachfragen");
};

/**
 * PBI-06 and PBI-07: a collective matter is split into parts with new numbers, and a duplicate is
 * merged into its target, in real Obsidian; each source becomes obsolete with its lineage.
 */
describe("matters: split and merge", function () {
  it("splits a matter into two parts with new numbers", async function () {
    await installConsoleSpy();
    await writeNote("WEG Manager/Gemeinschaften/Ahornweg.md", communityText(AW));
    await writeNote(
      "WEG Manager/Kontakte/Verwaltung.md",
      lines(
        "---",
        "schema: weg-manager.contact/v1",
        `id: ${MANAGER}`,
        "name: Verwaltung",
        "kind: company",
        "roles:",
        `  - ${AW.id}:manager`,
        "---",
      ),
    );
    await writeNote(SOURCE, matterText("01", 5, "Lampen ersetzt", "Nachfragen"));
    await writeNote(TWIN, matterText("02", 6, "Lampe doppelt", "Termin"));
    await openView();
    const root = browser.$(ROOT);
    await root.$("[data-testid=frame-navigation]").$(`button*=${de.matters.route}`).click();
    await card("Lampen ersetzt").$("[data-testid=matter-history-toggle]").click();
    await root.$("[data-testid=split-start]").click();
    await fillPart(0, "Lampe Flur");
    await fillPart(1, "Lampe Keller");
    await root.$("[data-testid=split-reason]").setValue("Zwei Lampen");
    await root.$("[data-testid=split-apply]").click();
    await browser.waitUntil(async () =>
      ((await fileText(SOURCE)) ?? "").includes("split_into_ids"),
    );
    const text = (await fileText(SOURCE)) ?? "";
    expect(text).toContain("status: obsolete\n");
    expect(text).toMatch(/- \d{4}-\d{2}-\d{2} Zwei Lampen \[kind:: split\] \[actor:: board\]/);
    const flur = (await fileText("WEG Manager/Vorgänge/Lampe Flur.md")) ?? "";
    expect(flur).toContain("number: 7\n");
    expect(flur).toContain("split_from_id: matter-00000000-0000-4000-8000-000000000001\n");
    await expect(root.$(`p*=${de.matters.lineage.splitInto("AW 007, AW 008")}`)).toBeDisplayed();
  });

  it("merges a duplicate into its target, the chosen value taken", async function () {
    const root = browser.$(ROOT);
    await card("Lampe Flur").$("[data-testid=matter-history-toggle]").click();
    await root.$("[data-testid=merge-start]").click();
    await root
      .$("[data-testid=merge-duplicate]")
      .selectByAttribute("value", "matter-00000000-0000-4000-8000-000000000002");
    await root.$("[data-testid=merge-take-next_step]").click();
    await root.$("[data-testid=merge-reason]").setValue("Doppelt erfasst");
    await root.$("[data-testid=merge-apply]").click();
    await browser.waitUntil(async () => ((await fileText(TWIN)) ?? "").includes("merged_into_id"));
    expect((await fileText(TWIN)) ?? "").toContain("status: obsolete\n");
    const target = (await fileText("WEG Manager/Vorgänge/Lampe Flur.md")) ?? "";
    expect(target).toContain("next_step: Termin\n");
    expect(target).toContain("[kind:: merge]");
  });

  it("logged no error or warning from the plugin and no uncaught error", async function () {
    expect(await pluginProblems()).toEqual([]);
  });
});
