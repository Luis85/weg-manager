import { afterEach, describe, expect, it } from "vitest";
import { de } from "../../../../src/application/messages";
import { NoteStore } from "../../../../src/application/notes";
import { openRoute, type Memory } from "../../../support/communities/screen";
import { AW, TODO_FOLDER, matterId, matterNote, todoNote } from "../../../support/matters/fixture";
import { closeAll, vault } from "../../../support/matters/screen";

afterEach(closeAll);

const t = de.week;
const WEEKS = "WEG Manager/Wochen";

/** Matter 5 overdue, 6 acute, 7 without a date; a to-do for matter 5; a source this week. */
const seed =
  (extra: (notes: Memory) => void = () => undefined) =>
  (notes: Memory) => {
    vault(
      ["A.md", matterNote(5, { outcome: "Lampe ersetzt", due_on: "2026-11-20" }), ""],
      ["B.md", matterNote(6, { outcome: "Tür repariert", due_on: "2026-11-27" }), ""],
      ["C.md", matterNote(7, { outcome: "Dach geprüft" }), ""],
    )(notes);
    notes.seed(
      `${TODO_FOLDER}/Firma anrufen.md`,
      todoNote(1, "Firma anrufen", { matter_id: matterId(5), due_on: "2026-11-28" }),
    );
    notes.seed("WEG Manager/Quellen/Angebot.md", {
      schema: "weg-manager.source/v1",
      id: "source-00000000-0000-4000-8000-000000000071",
      subject: "Angebot",
      kind: "mail",
      community_id: AW,
      received_on: "2026-11-24",
      origin: "Mail der Verwaltung",
    });
    extra(notes);
  };

/** The week screen on Thursday 2026-11-26, weeks starting on Monday. */
const openWeek = async (extra?: (notes: Memory) => void, initial?: Record<string, unknown>) => {
  const screen = await openRoute({ name: "week" }, "week-screen", {
    seed: seed(extra),
    today: "2026-11-26",
    ...(initial === undefined ? {} : { store: { initial } }),
  });
  await screen.until(() => expect(screen.all("week-deadline")).toHaveLength(3));
  return screen;
};

const sentences = (screen: Awaited<ReturnType<typeof openWeek>>) =>
  screen.all("briefing-sentence").map((each) => each.textContent.trim());

describe("the week (PBI-13)", () => {
  it("shows the week from Monday with the deadlines of the next 14 days, overdue first", async () => {
    const screen = await openWeek();
    expect(screen.text("week-title")).toBe(t.screen.title("2026-11-23"));
    expect(
      screen.all("week-deadline").map((each) => each.textContent.replace(/\s+/g, " ").trim()),
    ).toEqual([
      "2026-11-20 · überfällig · AW 005 Lampe ersetzt",
      "2026-11-27 · akut · AW 006 Tür repariert",
      "2026-11-28 · akut · Firma anrufen",
    ]);
    expect(
      screen.all("week-todo").map((each) => each.textContent.replace(/\s+/g, " ").trim()),
    ).toEqual(["Firma anrufen · 2026-11-28"]);
    expect(screen.text("week-target")).toBe(t.screen.timeTarget(60));
  });

  it("words at most seven sentences, each naming its matters (criterion 1)", async () => {
    const screen = await openWeek();
    expect(sentences(screen)).toEqual([
      t.briefing.sentences.overdue(1, "AW 005"),
      t.briefing.sentences.acute(1, "AW 006"),
      t.briefing.sentences["ask-date"](1, "AW 007"),
      t.briefing.sentences["todos-open"](1, "Firma anrufen"),
      t.briefing.sentences.clarify(2, "AW 006, AW 007"),
      t.briefing.sentences["sources-new"](1, "Angebot"),
    ]);
  });

  it("shows what it rests on: computed on opening, sources, unchecked and gaps (criterion 2)", async () => {
    const screen = await openWeek();
    expect(screen.text("week-computed")).toContain("2026-11-26");
    expect(screen.text("week-computed")).toContain("beim Öffnen berechnet");
    expect(screen.text("week-sources")).toBe(
      `${t.coverage.sources(1, 1)} · ${t.coverage.unchecked(1)} · ${t.coverage.withoutDate(1)}`,
    );
  });

  it("starts the week on the day the settings name (criterion 5)", async () => {
    const screen = await openWeek(undefined, {
      schemaVersion: 1,
      weekStart: "thursday",
      acuteDays: 0,
    });
    expect(screen.text("week-title")).toBe(t.screen.title("2026-11-26"));
    expect(screen.all("week-deadline")[1]?.textContent).toContain("bald");
  });

  it("saves the briefing text as the week note and shows it (criterion 4)", async () => {
    const screen = await openWeek();
    await screen.click(screen.q("briefing-edit"));
    const area = screen.q("briefing-text") as HTMLTextAreaElement;
    expect(area.value.split("\n")).toEqual(sentences(screen));
    area.value = "Lampe und Tür klären.";
    area.dispatchEvent(new Event("input"));
    await screen.click(screen.q("briefing-save"));
    await screen.until(() =>
      expect(screen.text("briefing-saved")).toContain("Lampe und Tür klären."),
    );
    const notes = await screen.runtime.runPromise(NoteStore.use((store) => store.list));
    expect(notes.find((note) => note.path === `${WEEKS}/2026-11-23.md`)?.frontmatter).toMatchObject(
      {
        schema: "weg-manager.week/v1",
        week_of: "2026-11-23",
      },
    );
    expect(screen.notes.body(`${WEEKS}/2026-11-23.md`)).toBe("Lampe und Tür klären.\n");
  });

  it("refuses to overwrite a briefing changed outside the plugin", async () => {
    const screen = await openWeek((notes) =>
      notes.seed(
        `${WEEKS}/2026-11-23.md`,
        {
          schema: "weg-manager.week/v1",
          id: "week-00000000-0000-4000-8000-000000000081",
          week_of: "2026-11-23",
        },
        "Alt\n",
      ),
    );
    await screen.until(() => expect(screen.text("briefing-saved")).toContain("Alt"));
    await screen.click(screen.q("briefing-edit"));
    screen.notes.seed(
      `${WEEKS}/2026-11-23.md`,
      {
        schema: "weg-manager.week/v1",
        id: "week-00000000-0000-4000-8000-000000000081",
        week_of: "2026-11-23",
      },
      "Von außen\n",
    );
    const area = screen.q("briefing-text") as HTMLTextAreaElement;
    area.value = "Neu";
    area.dispatchEvent(new Event("input"));
    await screen.click(screen.q("briefing-save"));
    await screen.until(() =>
      expect(screen.text("briefing-form")).toContain(de.week.errors.changed.title),
    );
    expect(screen.notes.body(`${WEEKS}/2026-11-23.md`)).toBe("Von außen\n");
  });
});
