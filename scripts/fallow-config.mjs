// @ts-check
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { format, resolveConfig } from "prettier";
import { fallowConfig } from "../configs/fallow.config.mjs";
import { readModules } from "./modules.mjs";

const ROOT = fileURLToPath(new URL("..", import.meta.url));

/** The file fallow reads, written from `configs/fallow.config.mjs` and the module list. */
export const FALLOW_JSON = `${ROOT}configs/fallow.json`;

export const STALE =
  "configs/fallow.json does not match the module list: run `npm run fallow:config`.";

/** @param {string} folder @param {string} module */
const onDisk = (folder, module) => existsSync(`${ROOT}src/${folder}/${module}`);

/**
 * The text of `configs/fallow.json` for the module list and the module folders, formatted as
 * Prettier formats the file, so the same list and folders always give the same text.
 * @param {{ modules?: readonly string[]; has?: (folder: string, module: string) => boolean }} [options]
 *   the module list (`APP_MODULES` by default) and whether a module has a folder in a layer (on disk)
 */
export const fallowJson = async ({ modules = readModules().all, has = onDisk } = {}) => {
  const options = (await resolveConfig(FALLOW_JSON)) ?? {};
  return format(JSON.stringify(fallowConfig({ modules, has }), null, 2), {
    ...options,
    filepath: FALLOW_JSON,
  });
};

/**
 * Writes `path`, or with `check` only compares it: the message when the file is not what would be
 * written, else `undefined`.
 * @param {{ check: boolean; path?: string; expected?: string }} options
 */
export const syncFallowJson = async ({ check, path = FALLOW_JSON, expected }) => {
  const text = expected ?? (await fallowJson());
  if (!check) {
    writeFileSync(path, text);
    return undefined;
  }
  const actual = existsSync(path) ? readFileSync(path, "utf8") : "";
  return actual === text ? undefined : STALE;
};

const isCli =
  process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isCli) {
  const message = await syncFallowJson({ check: process.argv.includes("--check") });
  if (message !== undefined) {
    console.error(message);
    process.exitCode = 1;
  }
}
