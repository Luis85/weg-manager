import { isRecordFrontmatter } from "../../domain/notes";
import type { Frontmatter, FrontmatterPatch, Note } from "./ports";

/**
 * Applies `patch` to `target` in place, as Obsidian's `processFrontMatter` expects: a changed key
 * keeps its position, a new one is appended, every other key stays. Values are copied, so the
 * caller keeps its own.
 */
export const applyPatch = (target: Record<string, unknown>, patch: FrontmatterPatch): void => {
  const set = patch.set ?? {};
  for (const key of patch.remove ?? []) {
    if (!Object.hasOwn(set, key)) Reflect.deleteProperty(target, key);
  }
  for (const [key, value] of Object.entries(set)) target[key] = structuredClone(value);
};

/** A deep copy, so nothing a caller does reaches the store's (or Obsidian's) own object. */
export const copyFrontmatter = (frontmatter: Frontmatter | null | undefined): Frontmatter =>
  frontmatter === null || frontmatter === undefined ? {} : structuredClone(frontmatter);

type Candidate = { readonly path: string; readonly frontmatter: Frontmatter | undefined };

const byPath = (a: Note, b: Note): number => {
  if (a.path === b.path) return 0;
  return a.path < b.path ? -1 : 1;
};

/** The records among `candidates`, each with its own copy, sorted by path (code-unit order). */
export const recordNotes = (candidates: Iterable<Candidate>): Note[] => {
  const notes: Note[] = [];
  for (const { path, frontmatter } of candidates) {
    if (frontmatter !== undefined && isRecordFrontmatter(frontmatter)) {
      notes.push({ path, frontmatter: copyFrontmatter(frontmatter) });
    }
  }
  return notes.toSorted(byPath);
};
