import { describe, expect, it } from "vitest";
import { FULL_STEPS, STEPS, runSteps, summary } from "../../../scripts/verify.mjs";

const fakeSpawn = (codes: Record<string, number>) => {
  const started: string[] = [];
  const spawn = async (_command: string, args: string[]) => {
    const name = args[1] ?? "";
    started.push(name);
    return codes[name] ?? 0;
  };
  return { spawn, started };
};

describe("runSteps", () => {
  it("runs every step in order when all pass", async () => {
    const { spawn, started } = fakeSpawn({});
    const results = await runSteps(STEPS, spawn);
    expect(started).toEqual(STEPS.map((step) => step.name));
    expect(results.every((result) => result.code === 0)).toBe(true);
  });

  it("stops at the first failure, returns its code and starts nothing after it", async () => {
    const { spawn, started } = fakeSpawn({ typecheck: 2 });
    const results = await runSteps(STEPS, spawn);
    expect(started).toEqual(["format:check", "lint", "typecheck"]);
    expect(results.at(-1)).toMatchObject({ name: "typecheck", code: 2 });
  });

  it("orders the gate as the blueprint says and adds mutation only to the full run", () => {
    expect(STEPS.map((step) => step.name)).toEqual([
      "format:check",
      "lint",
      "typecheck",
      "test:coverage",
      "analyze",
      "build",
      "check:dist",
    ]);
    expect(FULL_STEPS.at(-1)?.name).toBe("test:mutation");
    expect(STEPS[0]).toEqual({
      name: "format:check",
      command: "npm",
      args: ["run", "format:check"],
    });
  });
});

describe("summary", () => {
  it("marks passed, failed and skipped steps", () => {
    const text = summary(
      [
        { name: "format:check", code: 0, ms: 1200 },
        { name: "lint", code: 1, ms: 300 },
      ],
      STEPS.slice(0, 3),
    );
    expect(text.split("\n")).toEqual([
      "verify summary:",
      "  ok   format:check   1.2 s",
      "  FAIL lint           0.3 s",
      "  -  typecheck      not run",
    ]);
  });
});
