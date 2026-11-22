// @ts-check
import { readFileSync, writeFileSync } from "node:fs";
import { isCli } from "./is-cli.mjs";

/** @typedef {{ version: string; minAppVersion: string } & Record<string, unknown>} Manifest */

const SEMVER = /^(\d+)\.(\d+)\.(\d+)$/;

/** @param {string} version */
const parts = (version) => {
  const match = SEMVER.exec(version);
  if (match === null) throw new Error(`"${version}" is not a plain x.y.z version`);
  return match.slice(1).map(Number);
};

/** @param {string} a @param {string} b */
const greater = (a, b) => {
  const [left, right] = [parts(a), parts(b)];
  for (let index = 0; index < 3; index += 1) {
    const difference = (left[index] ?? 0) - (right[index] ?? 0);
    if (difference !== 0) return difference > 0;
  }
  return false;
};

/**
 * Carries the package.json version into manifest.json and versions.json.
 * @param {string} pkgVersion
 * @param {Manifest} manifest
 * @param {Record<string, string>} versions
 * @returns {{ manifest: Manifest; versions: Record<string, string> }}
 */
export const bumpVersion = (pkgVersion, manifest, versions) => {
  if (!greater(pkgVersion, manifest.version)) {
    throw new Error(`${pkgVersion} is not greater than the current ${manifest.version}`);
  }
  return {
    manifest: { ...manifest, version: pkgVersion },
    versions: { ...versions, [pkgVersion]: manifest.minAppVersion },
  };
};

const read = (/** @type {string} */ file) => JSON.parse(readFileSync(file, "utf8"));

if (isCli(import.meta.url)) {
  const next = bumpVersion(
    read("package.json").version,
    read("manifest.json"),
    read("versions.json"),
  );
  writeFileSync("manifest.json", `${JSON.stringify(next.manifest, null, 2)}\n`);
  writeFileSync("versions.json", `${JSON.stringify(next.versions, null, 2)}\n`);
  console.log(`version-bump ✓ manifest.json and versions.json at ${next.manifest.version}`);
}
