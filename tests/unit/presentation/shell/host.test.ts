import { describe, expect, it, vi } from "vitest";

/** Which Vue-loading modules have been evaluated so far. */
const evaluated = vi.hoisted((): string[] => []);

vi.mock("vue", async (importOriginal) => {
  evaluated.push("vue");
  return importOriginal();
});
vi.mock("../../../../src/presentation/shell/mount", async (importOriginal) => {
  evaluated.push("mount");
  return importOriginal();
});
vi.mock("../../../../src/presentation/shell/index", async (importOriginal) => {
  evaluated.push("index");
  return importOriginal();
});

/**
 * `host.ts` is what bootstrap and the Obsidian adapters import at plugin load (ADR 0006): it and
 * everything it imports stay free of Vue. A planted `import "vue"` there fails this test.
 */
describe("presentation/shell/host", () => {
  it("offers releaseAll and loadSurface without evaluating Vue", async () => {
    const host = await import("../../../../src/presentation/shell/host");
    expect(typeof host.releaseAll).toBe("function");
    expect(typeof host.loadSurface).toBe("function");
    expect(evaluated).toEqual([]);
  });
});
