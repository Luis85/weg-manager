import { Effect } from "effect";
import { clashName, noteNameIssue } from "../../domain/notes";
import { InvalidNoteNameError, NotePathTakenError } from "./errors";
import { copyFrontmatter } from "./frontmatter";
import type { Frontmatter, NewNote } from "./ports";

/** How many names `freeNotePath` tries: `Name`, `Name (2)`, … `Name (100)`. */
export const MAX_NAME_ATTEMPTS = 100;

/** The adapter's `normalizePath` (Obsidian's, or the in-memory copy of it). */
export type Normalize = (path: string) => string;

const notePath = (folder: string, name: string, normalize: Normalize): string =>
  normalize(`${folder}/${name}.md`);

/** Fails with `InvalidNoteNameError` when `name` cannot become a file name. */
export const checkNoteName = (name: string): Effect.Effect<void, InvalidNoteNameError> => {
  const issue = noteNameIssue(name);
  return issue === undefined ? Effect.void : Effect.fail(new InvalidNoteNameError({ issue }));
};

/**
 * The first free path for a new note `name` in `folder`: `Name.md`, else `Name (2).md`, and so
 * on. `taken` says whether a file or folder already lies at a path.
 */
export const freeNotePath = (
  folder: string,
  name: string,
  normalize: Normalize,
  taken: (path: string) => boolean,
): Effect.Effect<string, NotePathTakenError> => {
  for (let attempt = 1; attempt <= MAX_NAME_ATTEMPTS; attempt += 1) {
    const path = notePath(folder, clashName(name, attempt), normalize);
    if (!taken(path)) return Effect.succeed(path);
  }
  return Effect.fail(new NotePathTakenError());
};

/** The path of the note at `path` after a rename to `newName`, in the same folder. */
export const renamedNotePath = (path: string, newName: string, normalize: Normalize): string =>
  notePath(path.slice(0, Math.max(path.lastIndexOf("/"), 0)), newName, normalize);

/** Where and with what a new note is written. */
export type PlannedNote = {
  readonly folder: string;
  readonly path: string;
  readonly frontmatter: Frontmatter;
};

/** Checks the name, normalizes the folder and picks the first free path for `note`. */
export const planNewNote = (
  note: NewNote,
  normalize: Normalize,
  taken: (path: string) => boolean,
): Effect.Effect<PlannedNote, InvalidNoteNameError | NotePathTakenError> =>
  Effect.gen(function* () {
    yield* checkNoteName(note.name);
    const folder = normalize(note.folder);
    const path = yield* freeNotePath(folder, note.name, normalize, taken);
    return { folder, path, frontmatter: copyFrontmatter(note.frontmatter) };
  });
