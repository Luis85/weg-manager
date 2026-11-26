import { describe, expect, it } from "vitest";
import {
  DUE_CHECKS,
  DUE_KINDS,
  MATTER_KINDS,
  MATTER_STATUSES,
  matterType,
  shownNumber,
} from "../../../../src/domain/matters";

const ID = "matter-5d6e7f80-9a1b-4c2d-8e3f-4a5b6c7d8e9f";
const AW = "community-3f2b8c1e-7a44-4d0b-9c2e-5b1f0a6d9e21";
const FIRM = "contact-9a1d2c3b-4e5f-4a6b-8c7d-0e1f2a3b4c5d";
const NOTE = {
  schema: "weg-manager.matter/v1",
  id: ID,
  number: 41,
  community_id: AW,
  kind: "manager_promise",
  topic: "Beleuchtung",
  outcome: "Die Lampe ist ersetzt.",
  responsible_id: FIRM,
  status: "open",
  source: "Mail",
  next_step: "Nachfragen.",
};
const decode = (frontmatter: Record<string, unknown>) =>
  matterType.decode({ path: "WEG Manager/Vorgänge/Lampe.md", frontmatter });

describe("the matter note type (weg-manager.matter/v1)", () => {
  it("is version 1 of `matter` with its keys in file order, filed in Vorgänge", () => {
    expect([matterType.type, matterType.version, matterType.folder]).toEqual([
      "matter",
      1,
      "Vorgänge",
    ]);
    expect(matterType.keys).toEqual([
      "number",
      "community_id",
      "kind",
      "topic",
      "outcome",
      "responsible_id",
      "promised_on",
      "due_on",
      "due_kind",
      "due_source",
      "due_checked",
      "follow_up_on",
      "status",
      "done_on",
      "source",
      "next_step",
      "message_ref",
      "link",
    ]);
  });

  it("has the closed lists of kinds and statuses", () => {
    expect(MATTER_KINDS).toEqual([
      "manager_promise",
      "third_party_promise",
      "board_deadline",
      "legal_deadline",
      "question",
      "board_task",
    ]);
    expect(MATTER_STATUSES).toEqual(["open", "unclear", "done", "obsolete"]);
    expect(DUE_KINDS).toEqual(["promise", "contractual", "formal_deadline", "requested_reply"]);
    expect(DUE_CHECKS).toEqual(["confirmed", "proposed", "unknown"]);
  });

  it("shows a number with the short code, three digits at least", () => {
    expect(shownNumber("AW", 41)).toBe("AW 041");
    expect(shownNumber("TG", 1234)).toBe("TG 1234");
    expect(shownNumber(undefined, 7)).toBe("007");
  });

  it("reads a valid note, dates and optional texts included", () => {
    expect(
      decode({
        ...NOTE,
        promised_on: "2026-11-02",
        due_on: "2026-11-30",
        follow_up_on: "2026-11-20",
        message_ref: "<abc@example.org>",
        link: "Ablage/Angebot.pdf",
      }),
    ).toMatchObject({
      kind: "editable",
      id: ID,
      issues: [],
      values: { number: 41, status: "open" },
    });
  });

  it("names missing required fields", () => {
    const { topic: _t, next_step: _n, ...rest } = NOTE;
    expect(decode(rest)).toMatchObject({
      issues: [
        { key: "topic", code: "field.missing" },
        { key: "next_step", code: "field.missing" },
      ],
    });
  });

  it("reports each broken value with its own code", () => {
    const cases: [Record<string, unknown>, string, string][] = [
      [{ number: 0 }, "number", "number.invalid"],
      [{ number: 4.5 }, "number", "number.invalid"],
      [{ community_id: FIRM }, "community_id", "field.reference"],
      [{ responsible_id: AW }, "responsible_id", "field.reference"],
      [{ kind: "mangel" }, "kind", "kind.unknown"],
      [{ status: "not_kept" }, "status", "status.unknown"],
      [{ topic: "T".repeat(81) }, "topic", "topic.invalid"],
      [{ outcome: "zwei\nZeilen" }, "outcome", "outcome.invalid"],
      [{ due_on: "2026-02-30" }, "due_on", "field.date"],
      [{ source: "" }, "source", "source.invalid"],
      [{ next_step: "N".repeat(301) }, "next_step", "next-step.invalid"],
      [{ due_kind: "follow_up" }, "due_kind", "due-kind.unknown"],
      [{ due_checked: "ja" }, "due_checked", "due-checked.unknown"],
      [{ due_source: "S".repeat(101) }, "due_source", "due-source.invalid"],
    ];
    for (const [change, key, code] of cases) {
      expect(decode({ ...NOTE, ...change }), `${key}: ${JSON.stringify(change)}`).toMatchObject({
        issues: [{ key, code }],
      });
    }
  });
});
