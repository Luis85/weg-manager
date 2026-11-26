import { describe, expect, it } from "vitest";
import {
  BRIEFING_MAX_SENTENCES,
  addDays,
  weekBriefing,
  weekStartOf,
  weekType,
  type BriefingInput,
} from "../../../../src/domain/week";

// 2026-11-26 is a Thursday.
const TODAY = "2026-11-26";

const matter = (id: string, extra: Record<string, unknown> = {}) =>
  ({
    id,
    values: { status: "open", source: "Mail", due_on: "2026-12-20", ...extra },
  }) as BriefingInput["matters"][number];
const input = (extra: Partial<BriefingInput> = {}): BriefingInput => ({
  today: TODAY,
  weekStart: "monday",
  acuteDays: 2,
  matters: [],
  todos: [],
  sources: [],
  ...extra,
});

describe("the week", () => {
  it("starts on the configured day on or before today", () => {
    expect(weekStartOf(TODAY, "monday")).toBe("2026-11-23");
    expect(weekStartOf(TODAY, "thursday")).toBe("2026-11-26");
    expect(weekStartOf(TODAY, "friday")).toBe("2026-11-20");
    expect(weekStartOf(TODAY, "sunday")).toBe("2026-11-22");
  });

  it("counts days across a month and a year", () => {
    expect(addDays("2026-12-30", 3)).toBe("2027-01-02");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
  });

  it("is a week note type filed in Wochen, named by its first day", () => {
    expect([weekType.type, weekType.version, weekType.folder, weekType.keys]).toEqual([
      "week",
      1,
      "Wochen",
      ["week_of"],
    ]);
  });
});

describe("the deadlines of the next 14 days (PBI-13 criterion 1)", () => {
  it("lists open matters and to-dos due by today + 14, overdue first, acute marked", () => {
    const briefing = weekBriefing(
      input({
        matters: [
          matter("m-late", { due_on: "2026-11-20" }),
          matter("m-acute", { due_on: "2026-11-28" }),
          matter("m-soon", { due_on: "2026-12-10" }),
          matter("m-later", { due_on: "2026-12-11" }),
          matter("m-done", { due_on: "2026-11-27", status: "done" }),
        ],
        todos: [
          { id: "t-open", values: { status: "open", due_on: "2026-11-27" } },
          { id: "t-wait", values: { status: "waiting", follow_up_on: "2026-11-30" } },
          { id: "t-done", values: { status: "done", due_on: "2026-11-27" } },
        ],
      }),
    );
    expect(briefing.deadlines.map((each) => [each.id, each.day, each.state])).toEqual([
      ["m-late", "2026-11-20", "overdue"],
      ["t-open", "2026-11-27", "acute"],
      ["m-acute", "2026-11-28", "acute"],
      ["t-wait", "2026-11-30", "soon"],
      ["m-soon", "2026-12-10", "soon"],
    ]);
    expect(briefing.todos.map((todo) => todo.id)).toEqual(["t-open", "t-wait"]);
  });
});

describe("the briefing sentences (criterion 1)", () => {
  it("say what matters most, at most seven, each with its matters", () => {
    const briefing = weekBriefing(
      input({
        matters: [
          matter("m1", { due_on: "2026-11-20" }),
          matter("m2", { due_on: "2026-11-27" }),
          matter("m3", { due_on: undefined }),
          matter("m4", { source: "unknown" }),
        ],
        todos: [{ id: "t1", values: { status: "open", matter_id: "m1" } }],
        sources: [{ id: "s1", values: { received_on: "2026-11-24", matter_ids: [] } }],
      }),
    );
    expect(briefing.sentences.map((sentence) => [sentence.code, sentence.ids])).toEqual([
      ["overdue", ["m1"]],
      ["acute", ["m2"]],
      ["ask-date", ["m3"]],
      ["todos-open", ["t1"]],
      ["clarify", ["m2", "m3", "m4"]],
      ["sources-new", ["s1"]],
      ["source-gaps", ["m4"]],
    ]);
    expect(briefing.sentences.length).toBeLessThanOrEqual(BRIEFING_MAX_SENTENCES);
  });

  it("says that nothing is pending when nothing is", () => {
    expect(weekBriefing(input()).sentences).toEqual([{ code: "quiet", ids: [] }]);
  });
});

describe("the coverage (criterion 2)", () => {
  it("names the sources counted, the unchecked ones and the known gaps", () => {
    const briefing = weekBriefing(
      input({
        matters: [matter("m1", { due_on: undefined }), matter("m2", { source: "unknown" })],
        sources: [
          { id: "s1", values: { received_on: "2026-11-24", matter_ids: ["m1"] } },
          { id: "s2", values: { received_on: "2026-11-02", matter_ids: [] } },
        ],
      }),
    );
    expect(briefing.coverage).toEqual({
      weekOf: "2026-11-23",
      sources: 2,
      sourcesThisWeek: 1,
      unchecked: ["s2"],
      withoutSource: ["m2"],
      withoutDate: ["m1"],
    });
  });
});
