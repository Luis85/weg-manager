import { describe, expect, it } from "vitest";

/**
 * The guard plugin lives in the root Vitest config and reaches the projects by inheritance.
 * This pins that it does: a suite that forgets the test double must fail loudly.
 */
describe("obsidian guard", () => {
  it("refuses the real obsidian package in a suite without the test double", async () => {
    await expect(import("obsidian")).rejects.toThrow("OBSIDIAN_REQUIRES_TEST_DOUBLE");
  });

  it("resolves the test double by its alias", async () => {
    const double = await import("@test/obsidian");
    expect(typeof double.Plugin).toBe("function");
  });
});
