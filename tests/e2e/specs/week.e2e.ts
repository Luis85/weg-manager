import { browser, expect } from "@wdio/globals";
import { describe, it } from "mocha";
import { community, fileText, writeNote } from "../communities";
import { MANAGER, writeCommunityAndManager } from "../matters";
import { ROOT, installConsoleSpy, openView, pluginProblems } from "../support";
import { de } from "../texts";

const AW = community(1, { name: "Ahornweg", short_code: "AW" });
const lines = (...parts: string[]) => [...parts, ""].join("\n");

/** The first day of this week, weeks starting on Monday, in the machine's local time. */
const monday = () => {
  const now = new Date();
  const back = (now.getDay() + 6) % 7;
  const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() - back);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${day.getFullYear()}-${pad(day.getMonth() + 1)}-${pad(day.getDate())}`;
};

/**
 * PBI-13: the week view computes the briefing from the vault when it opens, in real Obsidian, and
 * saves the edited text as the week note of this week.
 */
describe("week", function () {
  it("opens the week with an overdue matter in the briefing and the deadlines", async function () {
    await installConsoleSpy();
    await writeCommunityAndManager(AW);
    await writeNote(
      "WEG Manager/Vorgänge/Lampe ersetzt.md",
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
        "due_on: 2026-01-05",
        "status: open",
        "source: Mail",
        "next_step: Nachfragen",
        "---",
      ),
    );
    await openView();
    const root = browser.$(ROOT);
    await root.$("[data-testid=frame-navigation]").$(`button*=${de.week.route}`).click();
    await expect(root.$("[data-testid=week-title]")).toHaveText(de.week.screen.title(monday()));
    await expect(root.$("[data-testid=briefing-sentences]")).toHaveText(
      expect.stringContaining(de.week.briefing.sentences.overdue(1, "AW 005")),
    );
    await expect(root.$("[data-testid=week-deadline]")).toHaveText(
      expect.stringContaining("Lampe ersetzt"),
    );
    await expect(root.$("[data-testid=week-computed]")).toHaveText(
      expect.stringContaining("beim Öffnen berechnet"),
    );
    // PBI-14: an overdue matter is an urgent decision on top of the budget.
    await expect(root.$("[data-testid=decision-urgent]")).toHaveText(
      expect.stringContaining("AW 005 Lampe ersetzt"),
    );
    await expect(root.$("[data-testid=decisions-budget]")).toHaveText(
      de.week.decisions.budget(0, 7),
    );
  });

  it("saves the edited briefing as this week's note", async function () {
    const root = browser.$(ROOT);
    await root.$("[data-testid=briefing-edit]").click();
    await root.$("[data-testid=briefing-text]").setValue("Lampe klären.");
    await root.$("[data-testid=briefing-save]").click();
    await expect(root.$("[data-testid=briefing-saved]")).toHaveText(
      expect.stringContaining("Lampe klären."),
    );
    const path = `WEG Manager/Wochen/${monday()}.md`;
    await browser.waitUntil(async () => ((await fileText(path)) ?? "").includes("Lampe klären."));
    const text = (await fileText(path)) ?? "";
    expect(text).toContain("schema: weg-manager.week/v1\n");
    expect(text).toContain(`week_of: ${monday()}\n`);
  });

  it("logged no error or warning from the plugin and no uncaught error", async function () {
    expect(await pluginProblems()).toEqual([]);
  });
});
