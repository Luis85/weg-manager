// @ts-check
import { realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";

/**
 * Whether a script was started as the program (`node scripts/x.mjs`) and not imported. Compares real
 * paths, because `import.meta.url` is always the real path while `process.argv[1]` is what the
 * caller typed: through a symlink the two differ and a plain comparison silently runs nothing.
 * (`import.meta.main` would do the same, but needs Node 24.2 and `engines` says `>=24`.)
 * @param {string} metaUrl the script's `import.meta.url`
 * @param {string | undefined} [argv1] the started script, `process.argv[1]` by default
 * @returns {boolean}
 */
export const isCli = (metaUrl, argv1 = process.argv[1]) => {
  if (argv1 === undefined) return false;
  try {
    return realpathSync(argv1) === realpathSync(fileURLToPath(metaUrl));
  } catch {
    return false;
  }
};
