import { describe, expect, it } from "vitest";
import {
  FORMAT_STAGES,
  FULL_STAGES,
  STAGES,
  exitCode,
  runGate,
  runStages,
  spawnStep,
  summary,
} from "../../../scripts/verify.mjs";

type Step = (typeof STAGES)[number][number];
type Outcome = { code: number; output: string };

// Lets the continuation of runStages run before the test looks at what started next.
const tick = () => new Promise((next) => setTimeout(next, 0));

/**
 * A runner whose steps end when the test says so, to prove what runs together and what waits.
 * `started` lists the steps in the order they were started, `buffered` how each was asked to run.
 */
const controlled = () => {
  const started: string[] = [];
  const buffered: Record<string, boolean> = {};
  const ends = new Map<string, (outcome: Outcome) => void>();
  const ended = new Set<string>();
  const spawn = (step: Step, buffer: boolean) =>
    new Promise<Outcome>((done) => {
      started.push(step.name);
      buffered[step.name] = buffer;
      ends.set(step.name, done);
    });
  const settle = (name: string, code: number, output: string) => {
    const done = ends.get(name);
    if (done === undefined) throw new Error(`${name} was not started`);
    ended.add(name);
    done({ code, output });
  };
  const end = async (name: string, code = 0, output = "") => {
    settle(name, code, output);
    await tick();
  };
  const endAll = async (names: string[]) => {
    for (const name of names) settle(name, 0, "");
    await tick();
  };
  /** Ends what runs now, and what starts next, until the run is over. */
  const drain = async (): Promise<void> => {
    const running = started.filter((name) => !ended.has(name));
    if (running.length === 0) return;
    await endAll(running);
    await drain();
  };
  return { spawn, started, buffered, end, endAll, drain };
};

const GROUP_STAGE = STAGES[0] ?? [];
const ALONE = STAGES[1]?.[0] ?? { name: "?", command: "", args: [] };
const GROUP = ["format:check", "lint", "typecheck", "check:versions"];
const REST = ["test:coverage", "analyze", "build", "check:dist", "check:notices"];

describe("the gate's stages", () => {
  it("runs the four independent checks together, then the rest in order", () => {
    expect(STAGES.map((stage) => stage.map((step) => step.name))).toEqual([
      GROUP,
      ...REST.map((name) => [name]),
    ]);
    expect(STAGES[0]?.[0]).toEqual({
      name: "format:check",
      command: "npm",
      args: ["run", "format:check"],
    });
  });

  it("builds before the two checks that read dist/", () => {
    const order = STAGES.flat().map((step) => step.name);
    expect(order.indexOf("build")).toBeLessThan(order.indexOf("check:dist"));
    expect(order.indexOf("build")).toBeLessThan(order.indexOf("check:notices"));
  });

  it("adds mutation testing last, and only to the full run", () => {
    expect(FULL_STAGES.slice(0, -1)).toEqual(STAGES);
    expect(FULL_STAGES.at(-1)?.map((step) => step.name)).toEqual(["test:mutation"]);
    expect(STAGES.flat().some((step) => step.name === "test:mutation")).toBe(false);
  });

  it("has a format-only gate for pushes that change documents only", () => {
    expect(FORMAT_STAGES.flat().map((step) => step.name)).toEqual(["format:check"]);
  });
});

describe("runStages", () => {
  it("starts format:check, lint, typecheck and check:versions at the same time", async () => {
    const run = controlled();
    const done = runStages(STAGES, run.spawn, () => undefined);
    await Promise.resolve();
    expect(run.started).toEqual(GROUP);
    await run.endAll(GROUP);
    // The rest starts one by one.
    expect(run.started).toEqual([...GROUP, "test:coverage"]);
    await run.endAll(["test:coverage"]);
    expect(run.started).toEqual([...GROUP, "test:coverage", "analyze"]);
    await run.drain();
    const results = await done;
    expect(results.map((result) => result.name)).toEqual([...GROUP, ...REST]);
    expect(results.every((result) => result.code === 0)).toBe(true);
  });

  it("waits for the slowest of the four before it starts test:coverage", async () => {
    const run = controlled();
    const done = runStages(STAGES, run.spawn, () => undefined);
    await run.end("format:check");
    await run.end("typecheck");
    await run.end("check:versions");
    expect(run.started).toEqual(GROUP);
    await run.end("lint");
    expect(run.started).toEqual([...GROUP, "test:coverage"]);
    await run.drain();
    await done;
  });

  it("lets the other two finish when one fails, then starts nothing after the group", async () => {
    const run = controlled();
    const printed: string[] = [];
    const done = runStages(STAGES, run.spawn, (text) => printed.push(text));
    await run.end("lint", 1, "lint output\n");
    // The group is not over yet: typecheck still runs and nothing else has started.
    expect(run.started).toEqual(GROUP);
    await run.end("format:check");
    await run.end("check:versions");
    await run.end("typecheck", 2, "type output\n");
    const results = await done;
    expect(run.started).toEqual(GROUP);
    expect(results).toEqual([
      expect.objectContaining({ name: "format:check", code: 0 }),
      expect.objectContaining({ name: "lint", code: 1 }),
      expect.objectContaining({ name: "typecheck", code: 2 }),
      expect.objectContaining({ name: "check:versions", code: 0 }),
    ]);
    expect(printed).toHaveLength(4);
  });

  it("stops after a failed step of a later stage and starts nothing after it", async () => {
    const run = controlled();
    const done = runStages(STAGES, run.spawn, () => undefined);
    await run.endAll(GROUP);
    await run.end("test:coverage");
    await run.end("analyze", 3);
    const results = await done;
    expect(run.started).toEqual([...GROUP, "test:coverage", "analyze"]);
    expect(results.at(-1)).toMatchObject({ name: "analyze", code: 3 });
  });

  it("asks the group for buffered output and a step that runs alone for the terminal", async () => {
    const run = controlled();
    const done = runStages(STAGES, run.spawn, () => undefined);
    await run.drain();
    await done;
    expect(GROUP.map((name) => run.buffered[name])).toEqual([true, true, true, true]);
    expect(REST.map((name) => run.buffered[name])).toEqual([false, false, false, false, false]);
  });

  it("prints each buffered step whole when it ends, in the order they end, never mixed", async () => {
    const run = controlled();
    const printed: string[] = [];
    const done = runStages([GROUP_STAGE], run.spawn, (text) => printed.push(text));
    await run.end("typecheck", 0, "types: 0 errors\n");
    expect(printed).toHaveLength(1);
    await run.end("lint", 1, "a.ts: error one\nb.ts: error two\n");
    await run.end("format:check", 0, "All matched files use Prettier code style!");
    await run.end("check:versions");
    await done;
    expect(printed).toHaveLength(4);
    expect(printed[0]).toMatch(
      /^\n--- typecheck ---\ntypes: 0 errors\n--- typecheck: ok, \d+\.\d s ---\n$/,
    );
    expect(printed[1]).toMatch(
      /^\n--- lint ---\na\.ts: error one\nb\.ts: error two\n--- lint: FAIL \(exit 1\), \d+\.\d s ---\n$/,
    );
    // Output without a final line break still ends its line before the footer.
    expect(printed[2]).toMatch(
      /^\n--- format:check ---\nAll matched files use Prettier code style!\n--- format:check: ok, \d+\.\d s ---\n$/,
    );
  });

  it("prints nothing for a step that ran on the terminal itself", async () => {
    const run = controlled();
    const printed: string[] = [];
    const done = runStages([[ALONE]], run.spawn, (text) => printed.push(text));
    await run.end("test:coverage");
    await done;
    expect(printed).toEqual([]);
  });
});

describe("exitCode", () => {
  it("is 0 when every step passed", () => {
    expect(exitCode([{ name: "lint", code: 0, ms: 1 }])).toBe(0);
  });

  it("is the code of the first failed step in stage order", () => {
    expect(
      exitCode([
        { name: "format:check", code: 0, ms: 1 },
        { name: "lint", code: 1, ms: 1 },
        { name: "typecheck", code: 2, ms: 1 },
      ]),
    ).toBe(1);
  });
});

describe("runGate", () => {
  it("returns non-zero when one step of the group fails, and still names every step", async () => {
    const run = controlled();
    const printed: string[] = [];
    const done = runGate(STAGES, { spawn: run.spawn, print: (text) => printed.push(text) });
    await run.end("format:check");
    await run.end("lint", 1);
    await run.end("typecheck", 2);
    await run.end("check:versions");
    expect(await done).toBe(1);
    const text = printed.at(-1) ?? "";
    for (const step of STAGES.flat()) expect(text).toContain(step.name);
    expect(text).toMatch(/FAIL lint/);
    expect(text).toMatch(/FAIL typecheck/);
    expect(text).toMatch(/-\s+test:coverage\s+not run/);
  });

  it("returns 0 after a clean run", async () => {
    const run = controlled();
    const done = runGate(FORMAT_STAGES, { spawn: run.spawn, print: () => undefined });
    await run.end("format:check");
    expect(await done).toBe(0);
  });
});

describe("summary", () => {
  it("marks passed, failed and skipped steps and the total", () => {
    const text = summary(
      [
        { name: "format:check", code: 0, ms: 1200 },
        { name: "lint", code: 1, ms: 300 },
      ],
      STAGES.flat().slice(0, 3),
      1500,
    );
    expect(text.split("\n")).toEqual([
      "verify summary:",
      "  ok   format:check   1.2 s",
      "  FAIL lint           0.3 s",
      "  -  typecheck      not run",
      "  total              1.5 s",
    ]);
  });

  it("leaves the total out when none is given", () => {
    expect(summary([], STAGES.flat().slice(0, 1))).toBe(
      "verify summary:\n  -  format:check   not run",
    );
  });
});

const node = (code: string): Step => ({ name: "probe", command: "node", args: ["-e", code] });

describe("spawnStep (real processes)", () => {
  it("collects what a buffered step wrote to stdout and stderr, and its exit code", async () => {
    const outcome = await spawnStep(
      node("console.log('out1');console.error('err1');process.exit(3)"),
      true,
    );
    expect(outcome.code).toBe(3);
    expect(outcome.output).toContain("out1");
    expect(outcome.output).toContain("err1");
  });

  it("returns exit 1 and the reason for a command that does not start", async () => {
    const outcome = await spawnStep(
      { name: "probe", command: "no-such-command-weg", args: [] },
      true,
    );
    expect(outcome.code).not.toBe(0);
  });
});
