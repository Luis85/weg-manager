import { browser, expect } from "@wdio/globals";
import { describe, it } from "mocha";
import { community, fileText, writeNote } from "../communities";
import { MANAGER, writeCommunityAndManager } from "../matters";
import { ROOT, installConsoleSpy, openView, pluginProblems } from "../support";
import { de } from "../texts";

const AW = community(1, { name: "Ahornweg", short_code: "AW" });
const PATH = "WEG Manager/Vorgänge/Lampe ersetzt.md";
const lines = (...parts: string[]) => [...parts, ""].join("\n");
const ITEM = /^- \d{4}-\d{2}-\d{2} .* \[id:: [0-9a-f]{8}\]$/;

/**
 * PBI-08 and PBI-12: a status change writes the status, the done day and the history entry in one
 * write, and an entry added by hand goes after it, in real Obsidian; the user's text stays.
 */
describe("matters: history and status change", function () {
  it("opens a matter's history from its card", async function () {
    await installConsoleSpy();
    await writeCommunityAndManager(AW);
    await writeNote(
      PATH,
      lines(
        "---",
        "schema: weg-manager.matter/v1",
        "id: matter-00000000-0000-4000-8000-000000000001",
        "number: 5",
        `community_id: ${AW.id}`,
        "kind: manager_promise",
        "topic: Beleuchtung",
        "outcome: Lampe ersetzt",
        `responsible_id: ${MANAGER}`,
        "status: open",
        "source: Mail",
        "next_step: Nachfragen",
        "---",
        "Meine Notiz",
      ),
    );
    await openView();
    const root = browser.$(ROOT);
    await root.$("[data-testid=frame-navigation]").$(`button*=${de.matters.route}`).click();
    await root.$("[data-testid=matter-history-toggle]").click();
    await expect(root.$("[data-testid=history-empty]")).toBeDisplayed();
  });

  it("changes the status to done with reason, source and day, in one write", async function () {
    const root = browser.$(ROOT);
    await root.$("[data-testid=status-change]").click();
    await root.$("[data-testid=status-to]").selectByAttribute("value", "done");
    await root.$("[data-testid=status-reason]").setValue("Lampe ist ersetzt");
    await root.$("[data-testid=status-source]").setValue("Foto per Mail");
    await root.$("[data-testid=status-done_on]").setValue("2026-11-25");
    await root.$("[data-testid=status-apply]").click();
    await expect(root.$("[data-testid=status-form]")).not.toExist();
    await browser.waitUntil(async () => ((await fileText(PATH)) ?? "").includes("status_change"));
    const text = (await fileText(PATH)) ?? "";
    expect(text).toContain("status: done\n");
    expect(text).toContain("done_on: 2026-11-25\n");
    const body = text.slice(text.indexOf("---\nMeine Notiz") + 4);
    const [notiz, , heading, , item] = body.split("\n");
    expect([notiz, heading]).toEqual(["Meine Notiz", "## Verlauf"]);
    expect(item).toMatch(ITEM);
    expect(item).toContain(
      "- 2026-11-25 Lampe ist ersetzt [kind:: status_change] [actor:: board] [status:: done] [source:: Foto per Mail]",
    );
    await expect(root.$("[data-testid=matter-facts]")).toHaveText(
      expect.stringContaining(de.matters.statuses.done),
    );
  });

  it("adds an entry by hand after the first one", async function () {
    const root = browser.$(ROOT);
    await root.$("[data-testid=history-add]").click();
    await root.$("[data-testid=entry-kind]").selectByAttribute("value", "note");
    await root.$("[data-testid=entry-text]").setValue("Rechnung folgt");
    await root.$("[data-testid=entry-save]").click();
    await expect(root.$("[data-testid=entry-form]")).not.toExist();
    await browser.waitUntil(async () => ((await fileText(PATH)) ?? "").includes("Rechnung folgt"));
    const items = ((await fileText(PATH)) ?? "")
      .split("\n")
      .filter((line) => line.startsWith("- "));
    expect(items).toHaveLength(2);
    expect(items[1]).toMatch(/^- \? Rechnung folgt \[kind:: note\] \[actor:: board\]/);
  });

  it("changes the due date with a reason, the earlier one kept (PBI-09)", async function () {
    const root = browser.$(ROOT);
    await root.$("[data-testid=due-change]").click();
    await root.$("[data-testid=due-on]").setValue("2026-12-15");
    await root.$("[data-testid=due-kind]").selectByAttribute("value", "promise");
    await root.$("[data-testid=due-reason]").setValue("Neue Zusage");
    await root.$("[data-testid=due-apply]").click();
    await expect(root.$("[data-testid=due-form]")).not.toExist();
    await browser.waitUntil(async () => ((await fileText(PATH)) ?? "").includes("new_date"));
    const text = (await fileText(PATH)) ?? "";
    expect(text).toContain("due_on: 2026-12-15\n");
    expect(text).toContain("due_kind: promise\n");
    expect(text).toMatch(
      /- \d{4}-\d{2}-\d{2} Neue Zusage \[kind:: new_date\] \[actor:: board\] \[previous:: none\]/,
    );
  });

  it("logged no error or warning from the plugin and no uncaught error", async function () {
    expect(await pluginProblems()).toEqual([]);
  });
});
