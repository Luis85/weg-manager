import { afterEach, describe, expect, it } from "vitest";
import { de } from "../../../../src/application/messages";
import { NoteStore } from "../../../../src/application/notes";
import { AW, FOLDER, MANAGER, matterNote } from "../../../support/matters/fixture";
import { TG, choose, closeAll, openMatters as open, vault } from "../../../support/matters/screen";

afterEach(closeAll);

const t = de.matters;

describe("the matters screen", () => {
  it("lists matters newest number first with the short code, facts and the check mark", async () => {
    const screen = await open(
      vault(
        ["A.md", matterNote(7, { outcome: "Lampe ersetzt", due_on: "2026-11-20" })],
        ["B.md", matterNote(41, { outcome: "Tor repariert", community_id: TG, kind: "question" })],
      ),
    );
    await screen.until(() => expect(screen.names()).toEqual(["Tor repariert", "Lampe ersetzt"]));
    const [gate, lamp] = screen.all("matter");
    expect(gate?.querySelector("[data-testid=matter-number]")?.textContent.trim()).toBe("TG 041");
    expect(gate?.querySelector("[data-testid=matter-check]")?.textContent.trim()).toBe(
      t.checkMarks.ask_for_date,
    );
    expect(lamp?.querySelector("[data-testid=matter-number]")?.textContent.trim()).toBe("AW 007");
    expect(lamp?.querySelector("[data-testid=matter-check]")?.textContent.trim()).toBe(
      t.checkMarks.overdue,
    );
    expect(lamp?.querySelector("[data-testid=matter-facts]")?.textContent).toContain(
      `offen · Zusage Verwaltung · Beleuchtung · ${t.screen.due("2026-11-20")}`,
    );
    expect(lamp?.textContent).toContain(t.screen.responsible("Verwaltung"));
  });

  it("searches and filters by topic, status, community and responsible (criterion 3)", async () => {
    const screen = await open(
      vault(
        ["A.md", matterNote(1, { outcome: "Lampe ersetzt" })],
        [
          "B.md",
          matterNote(2, {
            outcome: "Tor repariert",
            topic: "Tor",
            status: "done",
            done_on: "2026-11-01",
          }),
        ],
        ["C.md", matterNote(3, { outcome: "Garage gereinigt", community_id: TG })],
      ),
    );
    await screen.until(() => expect(screen.names()).toHaveLength(3));
    await screen.type("matter-search", "lampe");
    expect(screen.names()).toEqual(["Lampe ersetzt"]);
    expect(screen.text("matters-shown")).toBe(t.screen.shown(1, 3));
    await screen.type("matter-search", "");
    await choose(screen.q("filter-topic"), "Tor");
    expect(screen.names()).toEqual(["Tor repariert"]);
    await choose(screen.q("filter-topic"), "");
    await choose(screen.q("filter-status"), "open");
    expect(screen.names()).toEqual(["Garage gereinigt", "Lampe ersetzt"]);
    await choose(screen.q("filter-community"), TG);
    expect(screen.names()).toEqual(["Garage gereinigt"]);
    await choose(screen.q("filter-responsible"), MANAGER);
    expect(screen.names()).toEqual(["Garage gereinigt"]);
    await choose(screen.q("filter-status"), "done");
    expect(screen.names()).toEqual([]);
    expect(screen.text("matters-shown")).toBe(t.screen.noMatch);
  });

  it("captures a matter with the next number, the source gap allowed", async () => {
    const screen = await open(vault(["A.md", matterNote(40)]));
    await screen.click(screen.q("matter-add"));
    expect(screen.text("number-hint")).toBe(t.form.numberHint);
    await choose(screen.q("field-community_id"), AW);
    await choose(screen.q("field-kind"), "question");
    await screen.type("field-topic", "Heizung");
    await screen.type("field-outcome", "Die Heizung läuft wieder");
    await choose(screen.q("field-responsible_id"), MANAGER);
    await screen.click(screen.q("source-unknown"));
    await screen.type("field-next_step", "Verwaltung anrufen");
    await screen.click(screen.q("matter-save"));
    await screen.until(() => expect(screen.q("matter-form")).toBeUndefined());
    const notes = await screen.runtime.runPromise(NoteStore.use((store) => store.list));
    const written = notes.find((note) => note.path === `${FOLDER}/Die Heizung läuft wieder.md`);
    expect(written?.frontmatter).toMatchObject({
      number: 41,
      community_id: AW,
      kind: "question",
      topic: "Heizung",
      status: "open",
      source: "unknown",
      responsible_id: MANAGER,
    });
    await screen.until(() =>
      expect(screen.q("matter-source-gap")?.textContent.trim()).toBe(t.screen.sourceGap),
    );
  });

  it("refuses a done matter without its day, at the field", async () => {
    const screen = await open(vault(["A.md", matterNote(5, { outcome: "Lampe ersetzt" })]));
    await screen.until(() => expect(screen.names()).toEqual(["Lampe ersetzt"]));
    await screen.click(screen.q("matter-edit"));
    await choose(screen.q("field-status"), "done");
    await screen.click(screen.q("matter-save"));
    expect(screen.q("matter-form")?.textContent).toContain(
      t.issues["done-on.missing"]({ key: "done_on", code: "done-on.missing" }, t.fields.done_on),
    );
  });
});
