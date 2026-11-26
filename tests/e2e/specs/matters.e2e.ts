import { browser, expect } from "@wdio/globals";
import { describe, it } from "mocha";
import { community, communityText, fileText, writeNote } from "../communities";
import { ROOT, expectNotice, installConsoleSpy, openView, pluginProblems } from "../support";
import { de } from "../texts";

const AW = community(1, { name: "Ahornweg", short_code: "AW" });
const MANAGER = "contact-00000000-0000-4000-8000-0000000000c9";
const PATH = "WEG Manager/Vorgänge/Die Lampe ist ersetzt.md";
const ID = /^id: (matter-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/m;

const names = () =>
  browser
    .$(ROOT)
    .$$("[data-testid=matter-name]")
    .map((element) => element.getText());

const lines = (...parts: string[]) => [...parts, ""].join("\n");

/** PBI-05: a matter is captured as a note with the next number, and found again, in Obsidian. */
describe("matters: capture and find", function () {
  it("opens the matters from the frame's navigation", async function () {
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
    await writeNote(
      "WEG Manager/Vorgänge/Alt.md",
      lines(
        "---",
        "schema: weg-manager.matter/v1",
        "id: matter-00000000-0000-4000-8000-000000000001",
        "number: 40",
        `community_id: ${AW.id}`,
        "kind: question",
        "topic: Heizung",
        "outcome: Alt",
        `responsible_id: ${MANAGER}`,
        "status: open",
        "source: Protokoll",
        "next_step: Warten",
        "---",
      ),
    );
    await openView();
    const root = browser.$(ROOT);
    await root.$("[data-testid=frame-navigation]").$(`button*=${de.matters.route}`).click();
    await browser.waitUntil(async () => (await names()).join() === "Alt");
  });

  it("captures a matter with the next number, named by its outcome", async function () {
    const root = browser.$(ROOT);
    await root.$("[data-testid=matter-add]").click();
    await root.$("[data-testid=field-community_id]").selectByAttribute("value", AW.id);
    await root.$("[data-testid=field-kind]").selectByAttribute("value", "manager_promise");
    await root.$("[data-testid=field-topic]").setValue("Beleuchtung");
    await root.$("[data-testid=field-outcome]").setValue("Die Lampe ist ersetzt.");
    await root.$("[data-testid=field-responsible_id]").selectByAttribute("value", MANAGER);
    await root.$("[data-testid=field-source]").setValue("Mail");
    await root.$("[data-testid=field-next_step]").setValue("Nachfragen");
    await root.$("[data-testid=matter-save]").click();
    await expect(root.$("[data-testid=matter-form]")).not.toExist();
    await expectNotice(de.notes.notices.created("Die Lampe ist ersetzt."));
    await browser.waitUntil(async () => (await names()).join() === "Die Lampe ist ersetzt.,Alt");
    const text = (await fileText(PATH)) ?? "";
    const id = ID.exec(text)?.[1] ?? "";
    expect(text).toBe(
      lines(
        "---",
        "schema: weg-manager.matter/v1",
        `id: ${id}`,
        "number: 41",
        `community_id: ${AW.id}`,
        "kind: manager_promise",
        "topic: Beleuchtung",
        "outcome: Die Lampe ist ersetzt.",
        `responsible_id: ${MANAGER}`,
        "status: open",
        "source: Mail",
        "next_step: Nachfragen",
        "---",
      ),
    );
    // Newest number first: the new matter's card is the first.
    const card = root.$("[data-testid=matters] > li:first-child");
    await expect(card.$("[data-testid=matter-number]")).toHaveText("AW 041");
    await expect(card.$("[data-testid=matter-check]")).toHaveText(
      de.matters.checkMarks.ask_for_date,
    );
  });

  it("finds a matter by search", async function () {
    const root = browser.$(ROOT);
    await root.$("[data-testid=matter-search]").setValue("heizung");
    await browser.waitUntil(async () => (await names()).join() === "Alt");
  });

  it("logged no error or warning from the plugin and no uncaught error", async function () {
    expect(await pluginProblems()).toEqual([]);
  });
});
