import { describe, expect, it } from "vitest";
import { NoteNotFoundError } from "../../../src/application/notes";
import { assert, vi as shim } from "../../e2e/probe-plugin/contract-shim";

/** The probe's stand-in for chai's `assert` must fail where chai's fails, or the contract in Obsidian passes empty. */
describe("the contract shim's assert", () => {
  it("passes on equal values and fails on any difference, deep and strict", () => {
    expect(() =>
      assert.deepStrictEqual({ a: [1, { b: "x" }] }, { a: [1, { b: "x" }] }),
    ).not.toThrow();
    for (const [actual, expected] of [
      [{ a: 1 }, { a: 2 }],
      [{ a: 1 }, { a: 1, b: undefined }],
      [
        [1, 2],
        [2, 1],
      ],
      [[1], { 0: 1 }],
      [{ a: "1" }, { a: 1 }],
      [new NoteNotFoundError(), {}],
    ] as const) {
      expect(() => assert.deepStrictEqual(actual, expected)).toThrow("deepStrictEqual");
    }
    expect(() => assert.strictEqual("a", "a")).not.toThrow();
    expect(() => assert.strictEqual({}, {})).toThrow("strictEqual");
    expect(() => assert.isTrue(1)).toThrow("isTrue");
    expect(() => assert.isFalse(0)).toThrow("isFalse");
    expect(() => assert.isUndefined(null)).toThrow("isUndefined");
    expect(() => assert.instanceOf(new NoteNotFoundError(), NoteNotFoundError)).not.toThrow();
    expect(() => assert.instanceOf({}, NoteNotFoundError)).toThrow("instanceOf");
  });

  it("records the calls of a mock and polls until a check holds", async () => {
    const mock = shim.fn((n: number) => n + 1);
    expect(mock(1)).toBe(2);
    expect(mock.mock.calls).toEqual([[1]]);
    let polls = 0;
    await expect(
      shim.waitFor(
        () => {
          polls += 1;
          if (polls < 3) throw new Error("not yet");
          return polls;
        },
        { timeout: 1000, interval: 1 },
      ),
    ).resolves.toBe(3);
    await expect(
      shim.waitFor(
        () => {
          throw new Error("never");
        },
        { timeout: 5, interval: 1 },
      ),
    ).rejects.toThrow("never");
  });
});
