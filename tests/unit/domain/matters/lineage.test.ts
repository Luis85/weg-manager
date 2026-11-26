import { describe, expect, it } from "vitest";
import { mergeConflicts, validateMerge, validateSplit } from "../../../../src/domain/matters";

const AW = "community-3f2b8c1e-7a44-4d0b-9c2e-5b1f0a6d9e21";
const TG = "community-7c0d5e2a-1b3f-4c8d-9e0a-2b4c6d8e0f1a";
const FIRM = "contact-9a1d2c3b-4e5f-4a6b-8c7d-0e1f2a3b4c5d";
const part = (outcome: string) => ({
  outcome,
  responsible_id: FIRM,
  due_on: "",
  status: "open" as const,
  next_step: "Nachfragen",
});

describe("validateSplit (PBI-06)", () => {
  it("needs two parts at least, a reason, and each part complete", () => {
    expect(validateSplit({ reason: "Zwei Mängel", parts: [part("A"), part("B")] })).toEqual([]);
    expect(validateSplit({ reason: "", parts: [part("A")] })).toEqual([
      { part: undefined, code: "reason.missing" },
      { part: undefined, code: "parts.too-few" },
    ]);
    expect(
      validateSplit({
        reason: "x",
        parts: [
          { ...part(""), responsible_id: "" },
          { ...part("B"), due_on: "30.11.", next_step: " " },
        ],
      }),
    ).toEqual([
      { part: 0, code: "outcome.missing" },
      { part: 0, code: "responsible.missing" },
      { part: 1, code: "due-on.invalid" },
      { part: 1, code: "next-step.missing" },
    ]);
  });
});

describe("validateMerge (PBI-07)", () => {
  const target = { id: "matter-1", community_id: AW, status: "open" as const };
  it("merges two matters of one community, neither closed by a merge", () => {
    expect(
      validateMerge(target, { id: "matter-2", community_id: AW, status: "open" }, "Dublette"),
    ).toEqual([]);
  });

  it("refuses another community, the same matter, a merged one and a missing reason (criterion 3)", () => {
    expect(
      validateMerge(target, { id: "matter-2", community_id: TG, status: "open" }, "x"),
    ).toEqual(["merge.other-community"]);
    expect(validateMerge(target, target, "x")).toEqual(["merge.same-matter"]);
    expect(
      validateMerge(
        target,
        { id: "matter-2", community_id: AW, status: "obsolete", merged_into_id: "matter-9" },
        "x",
      ),
    ).toEqual(["merge.already-merged"]);
    expect(
      validateMerge(target, { id: "matter-2", community_id: AW, status: "open" }, " "),
    ).toEqual(["reason.missing"]);
  });
});

describe("mergeConflicts", () => {
  it("names each field where both have a value and they differ", () => {
    expect(
      mergeConflicts(
        { outcome: "Lampe ersetzt", due_on: "2026-11-30", responsible_id: FIRM, next_step: "A" },
        { outcome: "Lampe ersetzt", due_on: "2026-12-15", next_step: "B", source: "Mail" },
      ),
    ).toEqual([
      { key: "due_on", target: "2026-11-30", duplicate: "2026-12-15" },
      { key: "source", target: undefined, duplicate: "Mail" },
      { key: "next_step", target: "A", duplicate: "B" },
    ]);
  });
});
