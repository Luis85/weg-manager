import { browser, expect } from "@wdio/globals";
import { describe, it } from "mocha";
import { community, communityText, fileText, writeNote } from "../communities";
import { ROOT, installConsoleSpy, openView, pluginProblems } from "../support";
import { de } from "../texts";

const AW = community(1, { name: "Ahornweg", short_code: "AW" });
const MANAGER = "contact-00000000-0000-4000-8000-0000000000c9";
const MATTER = "WEG Manager/Vorgänge/Lampe ersetzt.md";
const lines = (...parts: string[]) => [...parts, ""].join("\n");

/**
 * PBI-10: the board's own step is a to-do note of its own, added from the clarification list for
 * an open matter without one and done in one step, in real Obsidian; its matter stays open.
 */
describe("to-dos", function () {
  it("lists an open matter without a to-do in the clarification list", async function () {
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
      MATTER,
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
        "next_step: Firma anrufen",
        "---",
      ),
    );
    await openView();
    const root = browser.$(ROOT);
    await root.$("[data-testid=frame-navigation]").$(`button*=${de.matters.route}`).click();
    await root.$("[data-testid=segment-todos]").click();
    await expect(root.$("[data-testid=clarification-matter]")).toHaveText(
      expect.stringContaining("Lampe ersetzt"),
    );
  });

  it("adds a to-do for the matter, prefilled with its next step", async function () {
    const root = browser.$(ROOT);
    await root.$("[data-testid=clarification-add]").click();
    await expect(root.$("[data-testid=todo-title]")).toHaveValue("Firma anrufen");
    await root.$("[data-testid=todo-due_on]").setValue("2026-11-20");
    await root.$("[data-testid=todo-save]").click();
    await expect(root.$("[data-testid=clarification-none]")).toBeDisplayed();
    const text = (await fileText("WEG Manager/To-dos/Firma anrufen.md")) ?? "";
    expect(text).toContain("schema: weg-manager.todo/v1\n");
    expect(text).toContain("matter_id: matter-00000000-0000-4000-8000-000000000001\n");
    expect(text).toContain("responsible: board\n");
    await expect(root.$("[data-testid=todos-overdue]")).toHaveText(
      expect.stringContaining("Firma anrufen"),
    );
  });

  it("marks it done and leaves the matter open", async function () {
    const root = browser.$(ROOT);
    await root.$("[data-testid=todo-done]").click();
    await browser.waitUntil(async () =>
      ((await fileText("WEG Manager/To-dos/Firma anrufen.md")) ?? "").includes("status: done"),
    );
    expect((await fileText(MATTER)) ?? "").toContain("status: open\n");
    await expect(root.$("[data-testid=clarification-matter]")).toBeDisplayed();
  });

  it("logged no error or warning from the plugin and no uncaught error", async function () {
    expect(await pluginProblems()).toEqual([]);
  });
});
