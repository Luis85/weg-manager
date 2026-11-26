// @ts-check
import { execFileSync } from "node:child_process";
import { appendFileSync, readFileSync } from "node:fs";
import { isCli } from "./is-cli.mjs";

/**
 * @typedef {{ event: string; ref: string; refName: string; inputVersion: string; manifestVersion: string }} Start
 */

const BARE_VERSION = /^[0-9]+\.[0-9]+\.[0-9]+$/;

/**
 * The version a release run is for: the input of a start by hand (only on `main`; `current` is
 * the version in manifest.json), or the name of the pushed tag. Matched as one string, so a value
 * with a line break cannot pass. The input is never echoed.
 * @param {Start} start
 * @returns {string}
 */
export const resolveReleaseTag = ({ event, ref, refName, inputVersion, manifestVersion }) => {
  let tag = refName;
  if (event === "workflow_dispatch") {
    if (ref !== "refs/heads/main") {
      throw new Error(`Start the release on main, not on ${refName}.`);
    }
    tag = inputVersion === "current" ? manifestVersion : inputVersion;
  }
  if (!BARE_VERSION.test(tag)) throw new Error("The version must be a bare x.y.z, without a v.");
  return tag;
};

/** The version in manifest.json, read at the repository root. */
const readManifestVersion = () => {
  /** @type {{ version?: unknown }} */
  const manifest = JSON.parse(readFileSync(new URL("../manifest.json", import.meta.url), "utf8"));
  return typeof manifest.version === "string" ? manifest.version : "";
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
 * The tag of the run from the environment of the step, or why there is none.
 * @param {Record<string, string | undefined>} env
 * @param {() => string} manifestVersion
 * @returns {{ value: string; problem?: undefined } | { value?: undefined; problem: string }}
 */
const tagOf = (env, manifestVersion) => {
  try {
    const value = resolveReleaseTag({
      event: env["EVENT"] ?? "",
      ref: env["REF"] ?? "",
      refName: env["REF_NAME"] ?? "",
      inputVersion: env["INPUT_VERSION"] ?? "",
      manifestVersion: manifestVersion(),
    });
    return { value };
  } catch (error) {
    return { problem: error instanceof Error ? error.message : String(error) };
  }
};

/**
 * The "Resolve the version" step of release.yml. A start by hand creates the tag with the release,
 * so the tag must not exist yet (the checkout fetched every tag; the release job asks GitHub again),
 * unless it is a dry run (`DRY_RUN`), which builds and checks everything and publishes nothing.
 * A start by hand is a full release unless `PRERELEASE` asks for a pre-release (Obsidian and its
 * directory read only full releases); a pushed tag of major version 0 stays a pre-release.
 * Writes `tag`, `prerelease` and `publish` to the step output.
 * @param {Record<string, string | undefined>} env
 * @param {(tag: string) => boolean} [tagExists]
 * @param {() => string} [manifestVersion]
 * @returns {string | undefined} what went wrong, if anything
 */
export const runResolve = (env, tagExists = gitHasTag, manifestVersion = readManifestVersion) => {
  const byHand = env["EVENT"] === "workflow_dispatch";
  const dryRun = byHand && env["DRY_RUN"] === "true";
  const tag = tagOf(env, manifestVersion);
  if (tag.problem !== undefined) return tag.problem;
  if (byHand && !dryRun && tagExists(tag.value)) {
    return `Tag ${tag.value} already exists. A version is released once; bump the version for a new release.`;
  }
  const output = env["GITHUB_OUTPUT"];
  if (output === undefined) return "GITHUB_OUTPUT is not set";
  const prerelease = byHand ? env["PRERELEASE"] === "true" : tag.value.startsWith("0.");
  appendFileSync(output, `tag=${tag.value}\nprerelease=${prerelease}\npublish=${!dryRun}\n`);
  return undefined;
};

if (isCli(import.meta.url)) {
  const problem = runResolve(process.env);
  if (problem !== undefined) {
    console.error(`::error title=Release version::${problem}`);
    process.exitCode = 1;
  }
}
