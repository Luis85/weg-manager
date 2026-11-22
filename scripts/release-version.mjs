// @ts-check
import { execFileSync } from "node:child_process";
import { appendFileSync } from "node:fs";
import { isCli } from "./is-cli.mjs";

/** @typedef {{ event: string; ref: string; refName: string; inputVersion: string }} Start */

const BARE_VERSION = /^[0-9]+\.[0-9]+\.[0-9]+$/;

/**
 * The version a release run is for: the input of a start by hand (only on `main`), or the name of
 * the pushed tag. Matched as one string, so a value with a line break cannot pass. The input is
 * never echoed.
 * @param {Start} start
 * @returns {string}
 */
export const resolveReleaseTag = ({ event, ref, refName, inputVersion }) => {
  let tag = refName;
  if (event === "workflow_dispatch") {
    if (ref !== "refs/heads/main") {
      throw new Error(`Start the release on main, not on ${refName}.`);
    }
    tag = inputVersion;
  }
  if (!BARE_VERSION.test(tag)) throw new Error("The version must be a bare x.y.z, without a v.");
  return tag;
};

/** @param {string} tag */
const gitHasTag = (tag) => {
  try {
    execFileSync("git", ["rev-parse", "-q", "--verify", `refs/tags/${tag}`], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
};

/**
 * The "Resolve the version" step of release.yml. A start by hand creates the tag with the release,
 * so the tag must not exist yet (the checkout fetched every tag; the release job asks GitHub again).
 * Writes `tag=<x.y.z>` to the step output.
 * @param {Record<string, string | undefined>} env
 * @param {(tag: string) => boolean} [tagExists]
 * @returns {string | undefined} what went wrong, if anything
 */
export const runResolve = (env, tagExists = gitHasTag) => {
  const event = env["EVENT"] ?? "";
  let tag;
  try {
    tag = resolveReleaseTag({
      event,
      ref: env["REF"] ?? "",
      refName: env["REF_NAME"] ?? "",
      inputVersion: env["INPUT_VERSION"] ?? "",
    });
  } catch (error) {
    return error instanceof Error ? error.message : String(error);
  }
  if (event === "workflow_dispatch" && tagExists(tag)) {
    return `Tag ${tag} already exists. A version is released once; bump the version for a new release.`;
  }
  const output = env["GITHUB_OUTPUT"];
  if (output === undefined) return "GITHUB_OUTPUT is not set";
  appendFileSync(output, `tag=${tag}\n`);
  return undefined;
};

if (isCli(import.meta.url)) {
  const problem = runResolve(process.env);
  if (problem !== undefined) {
    console.error(`::error title=Release version::${problem}`);
    process.exitCode = 1;
  }
}
