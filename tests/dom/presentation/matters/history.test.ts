import { afterEach, describe, expect, it } from "vitest";
import { de } from "../../../../src/application/messages";
import { HISTORY_HEADING } from "../../../../src/domain/matters";
import { FOLDER, MANAGER, matterNote } from "../../../support/matters/fixture";
import { choose, closeAll, openMatters, vault } from "../../../support/matters/screen";

afterEach(closeAll);

const t = de.matters.history;
const PATH = `${FOLDER}/A.md`;
const OLD =
  "- 2026-11-10 Erste Anfrage [kind:: request] [actor:: board] [recorded:: 2026-11-10] [id:: aaaa0001]";

/** The matters screen with matter 5 (`body` its note's text) and its history open. */
const withHistory = async (body = "") => {
  const screen = await openMatters(
    vault(["A.md", matterNote(5, { outcome: "Lampe ersetzt" }), body]),
  );
  await screen.until(() => expect(screen.names()).toEqual(["Lampe ersetzt"]));
  await screen.click(screen.q("matter-history-toggle"));
  await screen.until(() => expect(screen.q("matter-history")).toBeDefined());
  return screen;
};

const entries = (screen: Awaited<ReturnType<typeof withHistory>>) =>
  screen.all("history-entry").map((entry) => entry.textContent.replace(/\s+/g, " ").trim());

describe("a matter's history", () => {
  it("opens empty, and adds an entry by hand, recorded today (PBI-12)", async () => {
    const screen = await withHistory();
    expect(screen.text("history-empty")).toBe(t.empty);
    expect(screen.q("matter-history-toggle")?.getAttribute("aria-expanded")).toBe("true");
    await screen.click(screen.q("history-add"));
    await screen.type("entry-text", "Anfrage per Mail");
    await screen.type("entry-day", "2026-11-20");
    await choose(screen.q("entry-actor"), MANAGER);
    await screen.type("entry-source", "Mail");
    await screen.click(screen.q("entry-save"));
    await screen.until(() => expect(entries(screen)).toHaveLength(1));
    expect(entries(screen)[0]).toBe(
      `2026-11-20 Anfrage per Mail ${t.meta(t.kinds.request, "Verwaltung", "Mail", "2026-11-26")}`,
    );
    expect(screen.notes.body(PATH)).toContain(
      `${HISTORY_HEADING}\n\n- 2026-11-20 Anfrage per Mail [kind:: request] [actor:: ${MANAGER}]`,
    );
  });

  it("refuses an entry without text, at the field", async () => {
    const screen = await withHistory();
    await screen.click(screen.q("history-add"));
    await screen.click(screen.q("entry-save"));
    expect(screen.q("entry-form")?.textContent).toContain(t.entryIssues["text.missing"]);
    expect(screen.notes.body(PATH)).toBe("");
  });

  it("changes the status with its reason, source and done day in one step (PBI-08)", async () => {
    const screen = await withHistory();
    await screen.click(screen.q("status-change"));
    await choose(screen.q("status-to"), "done");
    await screen.type("status-reason", "Lampe ist ersetzt");
    await screen.type("status-source", "Foto per Mail");
    await screen.type("status-done_on", "2026-11-25");
    await screen.click(screen.q("status-apply"));
    await screen.until(() => expect(screen.q("matter-facts")?.textContent).toContain("erledigt"));
    await screen.until(() => expect(entries(screen).join()).toContain("Lampe ist ersetzt"));
    expect(entries(screen)[0]).toContain(t.statusTo("erledigt"));
    expect(screen.q("matter-check")).toBeUndefined();
  });

  it("refuses to close a matter without a source, and writes nothing", async () => {
    const screen = await withHistory();
    await screen.click(screen.q("status-change"));
    await choose(screen.q("status-to"), "obsolete");
    await screen.type("status-reason", "entfällt");
    await screen.click(screen.q("status-apply"));
    expect(screen.q("status-form")?.textContent).toContain(t.statusIssues["source.missing"]);
    expect(screen.notes.body(PATH)).toBe("");
  });

  it("corrects an entry with a new one: the old one says corrected (criterion 3)", async () => {
    const screen = await withHistory(`${HISTORY_HEADING}\n\n${OLD}\n`);
    await screen.until(() => expect(entries(screen)).toHaveLength(1));
    await screen.click(screen.q("history-add"));
    await choose(screen.q("entry-kind"), "note");
    await screen.type("entry-text", "Die Anfrage ging am 11. raus");
    await choose(screen.q("entry-corrects"), "aaaa0001");
    await screen.click(screen.q("entry-save"));
    await screen.until(() => expect(entries(screen)).toHaveLength(2));
    expect(screen.q("history-corrected")?.textContent).toContain(t.corrected);
    expect(entries(screen)[1]).toContain(t.correction("Erste Anfrage"));
    expect(screen.notes.body(PATH)).toContain(OLD);
  });

  it("shows a line it cannot read as written", async () => {
    const screen = await withHistory(`${HISTORY_HEADING}\n\n- am Dienstag angerufen\n`);
    await screen.until(() => expect(entries(screen)[0]).toContain("- am Dienstag angerufen"));
    expect(entries(screen)[0]).toContain(t.unreadable);
  });

  it("changes the due date with a reason and keeps the earlier one in the history (PBI-09)", async () => {
    const screen = await openMatters(
      vault(["A.md", matterNote(5, { outcome: "Lampe ersetzt", due_on: "2026-11-30" }), ""]),
    );
    await screen.until(() => expect(screen.names()).toEqual(["Lampe ersetzt"]));
    await screen.click(screen.q("matter-history-toggle"));
    await screen.until(() => expect(screen.q("due-change")).toBeDefined());
    await screen.click(screen.q("due-change"));
    expect((screen.q("due-on") as HTMLInputElement).value).toBe("2026-11-30");
    await screen.type("due-on", "2026-12-15");
    await choose(screen.q("due-kind"), "promise");
    await screen.type("due-reason", "Neue Zusage per Mail");
    await screen.click(screen.q("due-apply"));
    await screen.until(() =>
      expect(screen.q("matter-facts")?.textContent).toContain(
        `${de.matters.screen.due("2026-12-15")} (Zusage)`,
      ),
    );
    await screen.until(() => expect(entries(screen)[0]).toContain(t.previous("2026-11-30")));
  });

  it("refuses a due date change without a reason", async () => {
    const screen = await withHistory();
    await screen.click(screen.q("due-change"));
    await screen.click(screen.q("due-apply"));
    expect(screen.q("due-form")?.textContent).toContain(t.dueIssues["reason.missing"]);
    expect(screen.notes.body(PATH)).toBe("");
  });
});
