import { describe, expect, it } from "vitest";
import { asWritten, eitherOrder, inExpectedOrder } from "../../support/notes/event-order";

const EXPECTED = {
  step: { result: 1, events: ["create", eitherOrder("changed", ["modify", "done"]), "end"] },
  other: ["a", "b"],
};

const matches = (report: unknown) =>
  JSON.stringify(inExpectedOrder(report, EXPECTED)) === JSON.stringify(asWritten(EXPECTED));

describe("eitherOrder", () => {
  it("accepts both orders of a pair, each run in its own order", () => {
    expect(asWritten(EXPECTED)).toEqual({
      step: { result: 1, events: ["create", "changed", "modify", "done", "end"] },
      other: ["a", "b"],
    });
    for (const events of [
      ["create", "changed", "modify", "done", "end"],
      ["create", "modify", "done", "changed", "end"],
    ]) {
      expect(matches({ step: { result: 1, events }, other: ["a", "b"] })).toBe(true);
    }
  });

  it("rejects any other order, a missing or extra event, and order outside the pair", () => {
    for (const events of [
      ["create", "done", "modify", "changed", "end"],
      ["create", "modify", "changed", "done", "end"],
      ["create", "changed", "modify", "end"],
      ["create", "changed", "modify", "done", "end", "late"],
      ["changed", "modify", "done", "create", "end"],
    ]) {
      expect(matches({ step: { result: 1, events }, other: ["a", "b"] })).toBe(false);
    }
    expect(
      matches({
        step: { result: 1, events: ["create", "changed", "modify", "done", "end"] },
        other: ["b", "a"],
      }),
    ).toBe(false);
  });
});
