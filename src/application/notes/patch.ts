import type { FrontmatterPatch } from "./ports";

/**
 * Applies `patch` to `target` in place, as Obsidian's `processFrontMatter` expects: a changed key
 * keeps its position, a new one is appended, every other key stays. Values are copied, so the
 * caller keeps its own. What a `FrontmatterPatch` means, on plain data; it touches no note.
 */
export const applyPatch = (target: Record<string, unknown>, patch: FrontmatterPatch): void => {
  const set = patch.set ?? {};
  if (patch.remove !== undefined) {
    for (const key of patch.remove) {
      if (!Object.hasOwn(set, key)) Reflect.deleteProperty(target, key);
    }
  }
  for (const [key, value] of Object.entries(set)) target[key] = structuredClone(value);
};
