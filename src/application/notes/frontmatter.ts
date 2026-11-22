import { Array as Arr, Order } from "effect";
import { isRecordFrontmatter } from "../../domain/notes";
import type { Frontmatter, Note } from "./index";

/** A deep copy, so nothing a caller does reaches the store's (or Obsidian's) own object. */
export const copyFrontmatter = (frontmatter: Frontmatter | null | undefined): Frontmatter =>
  frontmatter === null || frontmatter === undefined ? {} : structuredClone(frontmatter);

type Candidate = { readonly path: string; readonly frontmatter: Frontmatter | undefined };

/** Code-unit order of the path, the same on every device and in every locale. */
const byPath: Order.Order<Note> = Order.mapInput(Order.String, (note: Note) => note.path);

/** The records among `candidates`, each with its own copy, sorted by path (code-unit order). */
export const recordNotes = (candidates: Iterable<Candidate>): Note[] => {
  const notes: Note[] = [];
  for (const { path, frontmatter } of candidates) {
    if (frontmatter !== undefined && isRecordFrontmatter(frontmatter)) {
      notes.push({ path, frontmatter: copyFrontmatter(frontmatter) });
    }
  }
  return Arr.sort(notes, byPath);
};
