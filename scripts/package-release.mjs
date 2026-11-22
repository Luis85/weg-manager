// @ts-check
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { CSS_PREFIX, checkDist } from "./check-dist.mjs";
import { NOTICES_FILE } from "./third-party-notices.mjs";

export const RELEASE_FILES = ["main.js", "manifest.json", "styles.css"];

/** @param {string} file the checked-in notices file; `npm run verify` checks that it is current */
const assertNotices = (file) => {
  if (!existsSync(file)) throw new Error(`${NOTICES_FILE} is missing (run "npm run notices")`);
  if (readFileSync(file, "utf8").trim() === "") throw new Error(`${NOTICES_FILE} is empty`);
};

/**
 * Stages `<outDir>/<plugin-id>/` with exactly the files Obsidian loads, and the third-party notices
 * file beside that folder (`<outDir>/THIRD-PARTY-NOTICES.txt`), so that the folder a user copies
 * into a vault stays the three plugin files. Before it copies anything it re-runs the `check:dist`
 * invariants on `distDir` (a stale or development build must not be packaged) and checks that `<rootDir>/versions.json` has the manifest version, mapped to its
 * `minAppVersion`. A tag, when given, must equal the manifest version (bare x.y.z, no `v`).
 * @param {{ distDir: string; outDir: string; rootDir: string; tag?: string | undefined }} options
 * @returns {{ folder: string; notices: string; version: string }}
 */
export const packageRelease = ({ distDir, outDir, rootDir, tag }) => {
  const missing = RELEASE_FILES.filter((file) => !existsSync(join(distDir, file)));
  if (missing.length > 0) throw new Error(`missing in ${distDir}: ${missing.join(", ")}`);
  const manifest = JSON.parse(readFileSync(join(distDir, "manifest.json"), "utf8"));
  if (tag !== undefined) {
    if (tag.startsWith("v")) throw new Error(`tag "${tag}" must not start with "v"`);
    if (tag !== manifest.version) {
      throw new Error(`tag ${tag} does not match manifest version ${manifest.version}`);
    }
  }
  const rootManifest = JSON.parse(readFileSync(join(rootDir, "manifest.json"), "utf8"));
  const violations = checkDist(distDir, rootManifest, { id: rootManifest.id, prefix: CSS_PREFIX });
  if (violations.length > 0) {
    throw new Error(`${distDir} fails check:dist: ${violations.join("; ")}`);
  }
  const versions = JSON.parse(readFileSync(join(rootDir, "versions.json"), "utf8"));
  const minAppVersion = versions[manifest.version];
  if (minAppVersion === undefined) {
    throw new Error(
      `versions.json has no entry for ${manifest.version} (run "npm version" so the bump adds it)`,
    );
  }
  if (minAppVersion !== manifest.minAppVersion) {
    throw new Error(
      `versions.json maps ${manifest.version} to "${minAppVersion}", but manifest.json has minAppVersion "${manifest.minAppVersion}"`,
    );
  }
  const noticesSource = join(rootDir, NOTICES_FILE);
  assertNotices(noticesSource);
  const folder = join(outDir, manifest.id);
  rmSync(folder, { recursive: true, force: true });
  mkdirSync(folder, { recursive: true });
  for (const file of RELEASE_FILES) copyFileSync(join(distDir, file), join(folder, file));
  const notices = join(outDir, NOTICES_FILE);
  copyFileSync(noticesSource, notices);
  return { folder, notices, version: manifest.version };
};

const isCli =
  process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isCli) {
  const index = process.argv.indexOf("--tag");
  const tag = index === -1 ? undefined : process.argv[index + 1];
  const { folder, notices, version } = packageRelease({
    distDir: "dist",
    outDir: "release",
    rootDir: ".",
    tag,
  });
  console.log(`release ✓ ${version} staged in ${folder}, notices in ${notices}`);
}
