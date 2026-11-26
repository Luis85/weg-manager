import { describe, expect, it } from "vitest";
import {
  TODO_STATUSES,
  clarificationList,
  todoGroup,
  todoType,
  validateTodo,
} from "../../../../src/domain/matters";

const AW = "community-3f2b8c1e-7a44-4d0b-9c2e-5b1f0a6d9e21";
const TG = "community-00000000-0000-4000-8000-000000000066";
const MATTER = "matter-5d6e7f80-9a1b-4c2d-8e3f-4a5b6c7d8e9f";
const FIRM = "contact-9a1d2c3b-4e5f-4a6b-8c7d-0e1f2a3b4c5d";
const NOTE = {
  schema: "weg-manager.todo/v1",
  id: "todo-1b2c3d4e-5f60-4a1b-8c2d-3e4f5a6b7c8d",
  title: "Rechnung prüfen",
  community_id: AW,
  responsible: "board",
  status: "open",
};
const decode = (frontmatter: Record<string, unknown>) =>
  todoType.decode({ path: "WEG Manager/To-dos/Rechnung prüfen.md", frontmatter });
/** A form input: every field as text, blank by default. */
const input = (extra: Partial<Record<string, string>> = {}) => ({
  title: "Rechnung prüfen",
  community_id: AW,
  matter_id: "",
  responsible: "board",
  status: "open",
  due_on: "",
  follow_up_on: "",
  reason: "",
  ...extra,
});

describe("the to-do note type (weg-manager.todo/v1)", () => {
  it("is version 1 of `todo` with its keys in file order, filed in To-dos", () => {
    expect([todoType.type, todoType.version, todoType.folder]).toEqual(["todo", 1, "To-dos"]);
    expect(todoType.keys).toEqual([
      "title",
      "community_id",
      "matter_id",
      "responsible",
      "status",
      "due_on",
      "follow_up_on",
      "reason",
    ]);
    expect(TODO_STATUSES).toEqual(["open", "waiting", "done", "dropped"]);
  });

  it("reads a valid to-do, without a matter, and refuses an unknown status and responsible", () => {
    expect(decode(NOTE)).toMatchObject({ kind: "editable", issues: [] });
    const broken = decode({ ...NOTE, status: "started", responsible: "Hausmeister" });
    expect(broken).toMatchObject({
      issues: [
        { key: "responsible", code: "responsible.invalid" },
        { key: "status", code: "status.unknown" },
      ],
    });
  });

  it("accepts a contact as responsible", () => {
    expect(decode({ ...NOTE, responsible: FIRM })).toMatchObject({ issues: [] });
  });
});

describe("the to-do rules (PBI-10 criterion 2)", () => {
  it("passes an open to-do and refuses one without a title", () => {
    expect(validateTodo(input(), { matterCommunities: new Map() })).toEqual([]);
    expect(validateTodo(input({ title: " " }), { matterCommunities: new Map() })).toEqual([
      { key: "title", code: "field.missing" },
    ]);
  });

  it("needs a reason and a follow-up date to wait", () => {
    expect(validateTodo(input({ status: "waiting" }), { matterCommunities: new Map() })).toEqual([
      { key: "follow_up_on", code: "follow-up.missing" },
      { key: "reason", code: "reason.missing" },
    ]);
    const waiting = input({ status: "waiting", follow_up_on: "2026-12-01", reason: "Angebot" });
    expect(validateTodo(waiting, { matterCommunities: new Map() })).toEqual([]);
  });

  it("needs a reason to drop", () => {
    expect(validateTodo(input({ status: "dropped" }), { matterCommunities: new Map() })).toEqual([
      { key: "reason", code: "reason.missing" },
    ]);
  });

  it("refuses a matter of another community", () => {
    const context = { matterCommunities: new Map([[MATTER, TG]]) };
    expect(validateTodo(input({ matter_id: MATTER }), context)).toEqual([
      { key: "matter_id", code: "matter.other-community" },
    ]);
    const same = { matterCommunities: new Map([[MATTER, AW]]) };
    expect(validateTodo(input({ matter_id: MATTER }), same)).toEqual([]);
  });
});

describe("the to-do groups", () => {
  // 2026-11-26 is a Thursday: this week runs to Sunday 2026-11-29.
  const TODAY = "2026-11-26";
  it("groups by the next date: overdue, this week, later; closed apart", () => {
    expect(todoGroup({ status: "open", due_on: "2026-11-25" }, TODAY)).toBe("overdue");
    expect(todoGroup({ status: "open", due_on: "2026-11-26" }, TODAY)).toBe("week");
    expect(todoGroup({ status: "open", due_on: "2026-11-29" }, TODAY)).toBe("week");
    expect(todoGroup({ status: "open", due_on: "2026-11-30" }, TODAY)).toBe("later");
    expect(todoGroup({ status: "open" }, TODAY)).toBe("later");
    expect(todoGroup({ status: "done", due_on: "2026-11-01" }, TODAY)).toBe("closed");
    expect(todoGroup({ status: "dropped" }, TODAY)).toBe("closed");
  });

  it("takes a waiting to-do's follow-up date, not its due date", () => {
    const waiting = {
      status: "waiting",
      due_on: "2026-11-01",
      follow_up_on: "2026-12-10",
    } as const;
    expect(todoGroup(waiting, TODAY)).toBe("later");
  });

  it("ends the week on Sunday, also from a Sunday", () => {
    expect(todoGroup({ status: "open", due_on: "2026-11-29" }, "2026-11-29")).toBe("week");
    expect(todoGroup({ status: "open", due_on: "2026-11-30" }, "2026-11-29")).toBe("later");
  });
});

describe("the clarification list (PBI-10 criterion 4)", () => {
  const matter = (id: string, status: "open" | "unclear" | "done") => ({ id, values: { status } });
  it("holds the open and unclear matters without an open or waiting to-do", () => {
    const matters = [
      matter("m1", "open"),
      matter("m2", "unclear"),
      matter("m3", "open"),
      matter("m4", "done"),
      matter("m5", "open"),
    ];
    const todos = [
      { values: { matter_id: "m3", status: "waiting" } },
      { values: { matter_id: "m5", status: "done" } },
      { values: { matter_id: "m1", status: "dropped" } },
    ] as const;
    expect(clarificationList(matters, todos).map((each) => each.id)).toEqual(["m1", "m2", "m5"]);
  });
});
