// @ts-check
import { spawn as nodeSpawn } from "node:child_process";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

/** @typedef {{ name: string; command: string; args: string[] }} Step */
/** @typedef {{ name: string; code: number; ms: number }} StepResult */
/** @typedef {(command: string, args: string[]) => Promise<number>} Spawn */

const npm = (/** @type {string} */ script) => ({
  name: script,
  command: "npm",
  args: ["run", script],
});

/**
 * The single quality gate, in order: cheap and fast checks first. `check:dist` and `check:notices`
 * read the fresh `dist/`, so they come after `build`.
 */
export const STEPS = [
  "format:check",
  "lint",
  "typecheck",
  "test:coverage",
  "analyze",
  "build",
  "check:dist",
  "check:notices",
].map(npm);

/** `verify:full` adds mutation testing. */
export const FULL_STEPS = [...STEPS, npm("test:mutation")];

/** @type {Spawn} */
const spawnInherit = (command, args) =>
  new Promise((done) => {
    // npm is a .cmd shim on Windows, which only starts through a shell.
    const child = nodeSpawn(command, args, {
      stdio: "inherit",
      shell: process.platform === "win32",
    });
    child.on("error", () => done(1));
    child.on("close", (code) => done(code ?? 1));
  });

/**
 * Runs the steps one after the other and stops at the first non-zero exit code.
 * @param {Step[]} steps
 * @param {Spawn} [spawn]
 * @returns {Promise<StepResult[]>} one result per step that ran
 */
export const runSteps = async (steps, spawn = spawnInherit) => {
  /** @type {StepResult[]} */
  const results = [];
  // Strictly one after the other: a later step must not start after an earlier one failed.
  const runFrom = async (/** @type {number} */ index) => {
    const step = steps[index];
    if (step === undefined) return;
    const started = Date.now();
    const code = await spawn(step.command, step.args);
    results.push({ name: step.name, code, ms: Date.now() - started });
    if (code === 0) await runFrom(index + 1);
  };
  await runFrom(0);
  return results;
};

/**
 * @param {StepResult[]} results
 * @param {Step[]} steps
 */
export const summary = (results, steps) => {
  const rows = steps.map((step) => {
    const result = results.find((entry) => entry.name === step.name);
    if (result === undefined) return `  -  ${step.name.padEnd(14)} not run`;
    const mark = result.code === 0 ? "ok" : "FAIL";
    return `  ${mark.padEnd(4)} ${step.name.padEnd(14)} ${(result.ms / 1000).toFixed(1)} s`;
  });
  return ["verify summary:", ...rows].join("\n");
};

const isCli =
  process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isCli) {
  const steps = process.argv.includes("--full") ? FULL_STEPS : STEPS;
  const results = await runSteps(steps);
  console.log(summary(results, steps));
  process.exitCode = results.find((result) => result.code !== 0)?.code ?? 0;
}
