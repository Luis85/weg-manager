// @ts-check
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const RELEASE_FILES = ["main.js", "manifest.json", "styles.css"];

/**
 * Stages `<outDir>/<plugin-id>/` with exactly the files Obsidian loads. A tag, when given, must
 * equal the manifest version (bare x.y.z, no `v`).
 * @param {{ distDir: string; outDir: string; tag?: string | undefined }} options
 * @returns {{ folder: string; version: string }}
 */
export const packageRelease = ({ distDir, outDir, tag }) => {
  const missing = RELEASE_FILES.filter((file) => !existsSync(join(distDir, file)));
  if (missing.length > 0) throw new Error(`missing in ${distDir}: ${missing.join(", ")}`);
  const manifest = JSON.parse(readFileSync(join(distDir, "manifest.json"), "utf8"));
  if (tag !== undefined) {
    if (tag.startsWith("v")) throw new Error(`tag "${tag}" must not start with "v"`);
    if (tag !== manifest.version) {
      throw new Error(`tag ${tag} does not match manifest version ${manifest.version}`);
    }
  }
  const folder = join(outDir, manifest.id);
  rmSync(folder, { recursive: true, force: true });
  mkdirSync(folder, { recursive: true });
  for (const file of RELEASE_FILES) copyFileSync(join(distDir, file), join(folder, file));
  return { folder, version: manifest.version };
};

const isCli =
  process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isCli) {
  const index = process.argv.indexOf("--tag");
  const tag = index === -1 ? undefined : process.argv[index + 1];
  const { folder, version } = packageRelease({ distDir: "dist", outDir: "release", tag });
  console.log(`release ✓ ${version} staged in ${folder}`);
}
