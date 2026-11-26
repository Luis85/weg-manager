import { describe, expect, it } from "vitest";
import {
  checkMark,
  duplicateNumbers,
  matchesFilter,
  matterValues,
  nextNumber,
  validateMatter,
  type MatterInput,
} from "../../../../src/domain/matters";

const AW = "community-3f2b8c1e-7a44-4d0b-9c2e-5b1f0a6d9e21";
const TG = "community-7c0d5e2a-1b3f-4c8d-9e0a-2b4c6d8e0f1a";
const FIRM = "contact-9a1d2c3b-4e5f-4a6b-8c7d-0e1f2a3b4c5d";
const OTHER = "matter-00000000-0000-4000-8000-000000000009";

const input = (change: Partial<MatterInput> = {}): MatterInput => ({
  number: 41,
  community_id: AW,
  kind: "manager_promise",
  topic: " Beleuchtung ",
  outcome: "Die Lampe ist ersetzt.",
  responsible_id: FIRM,
  promised_on: "",
  due_on: "2026-11-30",
  follow_up_on: "",
  status: "open",
  done_on: "",
  source: "Mail",
  next_step: "Nachfragen.",
  message_ref: "",
  link: "",
  ...change,
});

const context = { others: [{ id: OTHER, number: 7 }] };

describe("nextNumber and duplicateNumbers", () => {
  it("gives the highest number plus one, 1 for none", () => {
    expect(nextNumber([3, 41, 7])).toBe(42);
    expect(nextNumber([])).toBe(1);
  });

  it("finds each number that more than one matter has", () => {
    expect([...duplicateNumbers([1, 2, 2, 3, 3, 3])]).toEqual([2, 3]);
  });
});

describe("matterValues", () => {
  it("trims texts and drops blank ones", () => {
    expect(matterValues(input())).toMatchObject({ topic: "Beleuchtung", promised_on: undefined });
  });
});

describe("validateMatter", () => {
  it("passes a valid matter", () => {
    expect(validateMatter(input(), context)).toEqual([]);
  });

  it("refuses a number another matter has, unless the matter had it", () => {
    expect(validateMatter(input({ number: 7 }), context)).toEqual([
      { key: "number", code: "number.taken" },
    ]);
    expect(validateMatter(input({ number: 7 }), { ...context, loaded: { number: 7 } })).toEqual([]);
  });

  it("needs the day it was done when done, and no such day otherwise", () => {
    expect(validateMatter(input({ status: "done" }), context)).toEqual([
      { key: "done_on", code: "done-on.missing" },
    ]);
    expect(validateMatter(input({ status: "done", done_on: "2026-12-01" }), context)).toEqual([]);
    expect(validateMatter(input({ done_on: "2026-12-01" }), context)).toEqual([
      { key: "done_on", code: "done-on.not-done" },
    ]);
  });

  it("reports the field rules first, one issue per field", () => {
    expect(
      validateMatter(input({ topic: "", kind: "mangel", responsible_id: "", due_on: "30.11." }), context),
    ).toEqual([
      { key: "kind", code: "kind.unknown" },
      { key: "topic", code: "field.missing" },
      { key: "responsible_id", code: "field.missing" },
      { key: "due_on", code: "field.date" },
    ]);
  });

  it("refuses an outcome too long for a file name, unless the matter had it", () => {
    const outcome = "日".repeat(100);
    expect(validateMatter(input({ outcome }), context)).toEqual([
      { key: "outcome", code: "outcome.too-long" },
    ]);
    expect(validateMatter(input({ outcome }), { ...context, loaded: { outcome } })).toEqual([]);
  });
});

describe("checkMark", () => {
  const today = "2026-11-26";
  it("is overdue for an open or unclear matter whose due date has passed", () => {
    expect(checkMark({ status: "open", due_on: "2026-11-25" }, today)).toBe("overdue");
    expect(checkMark({ status: "unclear", due_on: "2026-11-25" }, today)).toBe("overdue");
    expect(checkMark({ status: "open", due_on: "2026-11-26" }, today)).toBeUndefined();
    expect(checkMark({ status: "done", due_on: "2026-11-01" }, today)).toBeUndefined();
  });

  it("asks for a date when an open matter has none", () => {
    expect(checkMark({ status: "open" }, today)).toBe("ask_for_date");
    expect(checkMark({ status: "unclear" }, today)).toBeUndefined();
    expect(checkMark({ status: "obsolete" }, today)).toBeUndefined();
  });
});

describe("matchesFilter", () => {
  const values = {
    number: 41,
    community_id: AW,
    topic: "Beleuchtung",
    outcome: "Die Lampe ist ersetzt.",
    next_step: "Nachfragen.",
    responsible_id: FIRM,
    status: "open" as const,
  };
  it("matches everything without a filter", () => {
    expect(matchesFilter(values, {})).toBe(true);
  });

  it("searches topic, outcome, next step and number, ignoring case", () => {
    expect(matchesFilter(values, { search: "lampe" })).toBe(true);
    expect(matchesFilter(values, { search: "041" })).toBe(true);
    expect(matchesFilter(values, { search: "heizung" })).toBe(false);
  });

  it("filters by topic, status, community and responsible", () => {
    expect(matchesFilter(values, { topic: "Beleuchtung", status: "open", community: AW, responsible: FIRM })).toBe(true);
    expect(matchesFilter(values, { community: TG })).toBe(false);
    expect(matchesFilter(values, { status: "done" })).toBe(false);
    expect(matchesFilter(values, { topic: "Heizung" })).toBe(false);
    expect(matchesFilter(values, { responsible: OTHER })).toBe(false);
  });
});
