import { describe, expect, it } from "vitest";
import { releaseAll } from "../../../src/presentation/release";

describe("releaseAll", () => {
  it("runs every release in reverse order and rethrows the first error", () => {
    const calls: string[] = [];
    const releases = [
      () => calls.push("a"),
      () => {
        calls.push("b");
        throw new Error("b failed");
      },
      () => {
        calls.push("c");
        throw new Error("c failed");
      },
    ];
    expect(() => releaseAll(releases)).toThrow("c failed");
    expect(calls).toEqual(["c", "b", "a"]);
  });

  it("does nothing for an empty list", () => {
    expect(() => releaseAll([])).not.toThrow();
  });
});
