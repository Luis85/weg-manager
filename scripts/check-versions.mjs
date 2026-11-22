// @ts-check
import { readFileSync } from "node:fs";
import { isCli } from "./is-cli.mjs";

/** @typedef {{ version: string; minAppVersion: string } & Record<string, unknown>} Manifest */

/**
 * The `versions.json` rule: it has an entry for the manifest version, equal to its `minAppVersion`.
 * @param {Manifest} manifest
 * @param {Record<string, string>} versions
 * @returns {string | undefined} what is wrong, if anything
 */
export const versionsEntryProblem = (manifest, versions) => {
  const minAppVersion = versions[manifest.version];
  if (minAppVersion === undefined) {
    return `versions.json has no entry for ${manifest.version} (run "npm version" so the bump adds it)`;
  }
  if (minAppVersion !== manifest.minAppVersion) {
    return `versions.json maps ${manifest.version} to "${minAppVersion}", but manifest.json has minAppVersion "${manifest.minAppVersion}"`;
  }
  return undefined;
};

/**
 * Every version rule that needs no build and no dependency: package.json and manifest.json carry
 * the same version, `versions.json` has its entry, and a tag, when given, equals the manifest
 * version (bare x.y.z, no `v`).
 * @param {{ packageVersion: string; manifest: Manifest; versions: Record<string, string>; tag?: string | undefined }} input
 * @returns {string[]}
 */
export const versionProblems = ({ packageVersion, manifest, versions, tag }) => {
  /** @type {string[]} */
  const problems = [];
  if (packageVersion !== manifest.version) {
    problems.push(
      `package.json has version ${packageVersion}, but manifest.json has ${manifest.version}`,
    );
  }
  if (tag !== undefined) {
    if (tag.startsWith("v")) problems.push(`tag "${tag}" must not start with "v"`);
    else if (tag !== manifest.version) {
      problems.push(`tag ${tag} does not match manifest version ${manifest.version}`);
    }
  }
  const entry = versionsEntryProblem(manifest, versions);
  if (entry !== undefined) problems.push(entry);
  return problems;
};

const read = (/** @type {string} */ file) => JSON.parse(readFileSync(file, "utf8"));

if (isCli(import.meta.url)) {
  const index = process.argv.indexOf("--tag");
  const tag = index === -1 ? undefined : process.argv[index + 1];
  const problems = versionProblems({
    packageVersion: read("package.json").version,
    manifest: read("manifest.json"),
    versions: read("versions.json"),
    tag,
  });
  for (const problem of problems) console.error(`check:versions ✗ ${problem}`);
  if (problems.length === 0)
    console.log("check:versions ✓ package.json, manifest.json and versions.json agree");
  process.exitCode = problems.length === 0 ? 0 : 1;
}
