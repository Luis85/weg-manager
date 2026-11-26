import { describe, expect, it } from "vitest";
import { decisionSelection, type SelectionInput } from "../../../../src/domain/week";

// 2026-11-26 is a Thursday; the week from Monday ends on Sunday 2026-11-29.
const TODAY = "2026-11-26";

const matter = (id: string, extra: Record<string, unknown> = {}) =>
  ({
    id,
    values: { status: "open", community_id: "aw", ...extra },
  }) as SelectionInput["matters"][number];
const input = (matters: SelectionInput["matters"], budget = 7): SelectionInput => ({
  today: TODAY,
  weekStart: "monday",
  acuteDays: 2,
  budget,
  matters,
});

describe("the decision selection (PBI-14)", () => {
  it("puts overdue ones and those due by the end of the week or the acute deadline outside the budget", () => {
    const selection = decisionSelection(
      input([
        matter("late", { due_on: "2026-11-20" }),
        matter("sunday", { due_on: "2026-11-29" }),
        matter("monday", { due_on: "2026-11-30" }),
      ]),
    );
    expect(selection.urgent.map((card) => [card.id, card.reason])).toEqual([
      ["late", "overdue"],
      ["sunday", "due-this-week"],
    ]);
    expect(selection.selected.map((card) => card.id)).toEqual(["monday"]);
  });

  it("reaches the acute deadline beyond the week's end", () => {
    const selection = decisionSelection({
      ...input([matter("next-tuesday", { due_on: "2026-12-01" })]),
      today: "2026-11-29",
      acuteDays: 2,
    });
    expect(selection.urgent.map((card) => card.id)).toEqual(["next-tuesday"]);
  });

  it("keeps nine urgent cases visible beside seven regular ones (criterion 3)", () => {
    const urgent = Array.from({ length: 9 }, (_, n) => matter(`u${n}`, { due_on: "2026-11-27" }));
    const regular = Array.from({ length: 10 }, (_, n) =>
      matter(`r${n}`, {
        due_on: `2026-12-${String(10 + n)}`,
        community_id: n % 2 === 0 ? "aw" : "tg",
      }),
    );
    const selection = decisionSelection(input([...regular, ...urgent]));
    expect(selection.urgent).toHaveLength(9);
    expect(selection.selected.map((card) => card.id)).toEqual([
      "r0",
      "r1",
      "r2",
      "r3",
      "r4",
      "r5",
      "r6",
    ]);
    expect(selection.backlog.map((card) => card.id)).toEqual(["r7", "r8", "r9"]);
  });

  it("counts the budget over all communities together (criterion 1)", () => {
    const matters = [matter("a", { community_id: "aw" }), matter("b", { community_id: "tg" })];
    expect(decisionSelection(input(matters, 1)).selected.map((card) => card.id)).toHaveLength(1);
  });

  it("ranks by the nearest due date, then by age; an unknown age stays unknown (criterion 2)", () => {
    const selection = decisionSelection(
      input([
        matter("no-date-young", { promised_on: "2026-11-20" }),
        matter("no-date-unknown"),
        matter("due-later", { due_on: "2026-12-20" }),
        matter("no-date-old", { promised_on: "2026-09-01" }),
        matter("due-sooner", { due_on: "2026-12-05" }),
      ]),
    );
    expect(selection.selected.map((card) => [card.id, card.reason, card.age])).toEqual([
      ["due-sooner", "due", undefined],
      ["due-later", "due", undefined],
      ["no-date-old", "age", 86],
      ["no-date-young", "age", 6],
      ["no-date-unknown", "age-unknown", undefined],
    ]);
  });

  it("leaves out matters that are done, obsolete or have no id", () => {
    const selection = decisionSelection(
      input([
        matter("done", { status: "done" }),
        matter("gone", { status: "obsolete" }),
        matter("unclear", { status: "unclear" }),
        { id: undefined, values: { status: "open" } },
      ]),
    );
    expect(
      [...selection.urgent, ...selection.selected, ...selection.backlog].map((card) => card.id),
    ).toEqual(["unclear"]);
  });
});
