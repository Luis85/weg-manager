// @ts-check
import { execFileSync } from "node:child_process";

/**
 * `prepare`: points git at .githooks so pre-push runs the gate. Does nothing in CI or outside a
 * git work tree (for example when installed from a tarball).
 * @param {NodeJS.ProcessEnv} env
 * @param {(args: string[]) => string} git
 * @returns {string} what happened
 */
export const installHooks = (env, git) => {
  if (env["CI"] || env["TF_BUILD"] || env["GITHUB_ACTIONS"]) return "skipped: CI";
  try {
    if (git(["rev-parse", "--is-inside-work-tree"]).trim() !== "true") return "skipped: no git";
  } catch {
    return "skipped: no git";
  }
  git(["config", "core.hooksPath", ".githooks"]);
  return "installed: core.hooksPath=.githooks";
};

const runGit = (/** @type {string[]} */ args) =>
  execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });

if (process.argv[1]?.endsWith("install-hooks.mjs")) {
  console.log(`install-hooks: ${installHooks(process.env, runGit)}`);
}
