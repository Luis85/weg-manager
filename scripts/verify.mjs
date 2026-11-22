// @ts-check
import { spawn as nodeSpawn } from "node:child_process";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

/** @typedef {{ name: string; command: string; args: string[] }} Step */
/** @typedef {Step[]} Stage steps that start together; the next stage starts when all of them ended */
/** @typedef {{ name: string; code: number; ms: number }} StepResult */
/** @typedef {{ code: number; output: string }} Outcome `output` is what a buffered step printed */
/**
 * Starts one step. `buffer` asks for its output to be collected and returned instead of shown at
 * once, so that steps running together do not interleave their lines.
 * @typedef {(step: Step, buffer: boolean) => Promise<Outcome>} Spawn
 */
/** @typedef {(text: string) => void} Print */

const npm = (/** @type {string} */ script) => ({
  name: script,
  command: "npm",
  args: ["run", script],
});

/**
 * Independent of each other, so they start together. Lint (type-aware ESLint) is the longest and
 * sets the pace.
 */
const PARALLEL = ["format:check", "lint", "typecheck"].map(npm);

/**
 * Run after the group, one at a time. `check:dist` and `check:notices` read the fresh `dist/`, so
 * they come after `build`.
 */
const SERIAL = ["test:coverage", "analyze", "build", "check:dist", "check:notices"].map(npm);

/** The gate: the independent checks together, then each of the others alone. */
export const STAGES = [PARALLEL, ...SERIAL.map((step) => [step])];

/** `verify:full` adds mutation testing. */
export const FULL_STAGES = [...STAGES, [npm("test:mutation")]];

/** The single step of a push that changes documents only (see `pre-push.mjs`). */
export const FORMAT_STAGES = [[npm("format:check")]];

/** @type {Spawn} */
export const spawnStep = (step, buffer) =>
  new Promise((done) => {
    /** @type {string[]} */
    const chunks = [];
    // A step that runs alone keeps the terminal (live output, colours, progress). One in a group
    // writes into a buffer; a pipe is no terminal, so colours are asked for.
    const color = process.stdout.isTTY && process.env["NO_COLOR"] === undefined;
    // npm is a .cmd shim on Windows, which only starts through a shell.
    const child = nodeSpawn(step.command, step.args, {
      stdio: buffer ? ["ignore", "pipe", "pipe"] : "inherit",
      shell: process.platform === "win32",
      env: buffer && color ? { ...process.env, FORCE_COLOR: "1" } : process.env,
    });
    child.stdout?.on("data", (chunk) => chunks.push(String(chunk)));
    child.stderr?.on("data", (chunk) => chunks.push(String(chunk)));
    child.on("error", (error) => done({ code: 1, output: `${chunks.join("")}${error.message}\n` }));
    child.on("close", (code) => done({ code: code ?? 1, output: chunks.join("") }));
  });

/**
 * Runs the stages one after the other; the steps of a stage run together. A buffered step's output
 * is printed whole when that step ends. A stage with a failed step is finished (the others show
 * their results too), and then nothing after it starts.
 * @param {Stage[]} stages
 * @param {Spawn} [spawn]
 * @param {Print} [print]
 * @returns {Promise<StepResult[]>} one result per step that ran, in stage order
 */
export const runStages = async (stages, spawn = spawnStep, print = printToStdout) => {
  /** @type {StepResult[]} */
  const results = [];
  /** @param {number} index */
  const runFrom = async (index) => {
    const stage = stages[index];
    if (stage === undefined) return;
    // A stage of one step keeps the terminal; steps that share a stage must not interleave.
    const buffer = stage.length > 1;
    const ran = await Promise.all(
      stage.map(async (step) => {
        const started = Date.now();
        const { code, output } = await spawn(step, buffer);
        const ms = Date.now() - started;
        if (buffer) print(framed(step.name, code, ms, output));
        return { name: step.name, code, ms };
      }),
    );
    results.push(...ran);
    // Strictly after the stage: a later step must not start once a step of this one failed.
    if (ran.every((result) => result.code === 0)) await runFrom(index + 1);
  };
  await runFrom(0);
  return results;
};

/** @type {Print} */
const printToStdout = (text) => {
  process.stdout.write(text);
};

/**
 * A buffered step's output with a header and a footer, so that it can be told apart.
 * @param {string} name
 * @param {number} code
 * @param {number} ms
 * @param {string} output
 */
const framed = (name, code, ms, output) => {
  const body = output === "" || output.endsWith("\n") ? output : `${output}\n`;
  return `\n--- ${name} ---\n${body}--- ${name}: ${code === 0 ? "ok" : `FAIL (exit ${code})`}, ${(ms / 1000).toFixed(1)} s ---\n`;
};

/**
 * @param {StepResult[]} results
 * @param {Step[]} steps
 * @param {number} [totalMs] wall-clock time of the whole run
 */
export const summary = (results, steps, totalMs) => {
  const rows = steps.map((step) => {
    const result = results.find((entry) => entry.name === step.name);
    if (result === undefined) return `  -  ${step.name.padEnd(14)} not run`;
    const mark = result.code === 0 ? "ok" : "FAIL";
    return `  ${mark.padEnd(4)} ${step.name.padEnd(14)} ${(result.ms / 1000).toFixed(1)} s`;
  });
  const total =
    totalMs === undefined ? [] : [`  ${"total".padEnd(19)}${(totalMs / 1000).toFixed(1)} s`];
  return ["verify summary:", ...rows, ...total].join("\n");
};

/**
 * The exit code of a run: the code of the first failed step in stage order, else 0.
 * @param {StepResult[]} results
 */
export const exitCode = (results) => results.find((result) => result.code !== 0)?.code ?? 0;

/**
 * Runs a gate, prints its summary and returns the exit code.
 * @param {Stage[]} stages
 * @param {{ spawn: Spawn; print: Print }} [io]
 * @returns {Promise<number>}
 */
export const runGate = async (stages, io = { spawn: spawnStep, print: printToStdout }) => {
  const started = Date.now();
  const results = await runStages(stages, io.spawn, io.print);
  io.print(`${summary(results, stages.flat(), Date.now() - started)}\n`);
  return exitCode(results);
};

const isCli =
  process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isCli) {
  process.exitCode = await runGate(process.argv.includes("--full") ? FULL_STAGES : STAGES);
}
