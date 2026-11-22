import { Array as Arr, Effect, Order } from "effect";
import { clashKey, clashName, noteNameIssue } from "../../domain/notes";
import { copyFrontmatter } from "./frontmatter";
import {
  InvalidNoteNameError,
  NotePathTakenError,
  isInFolder,
  type Frontmatter,
  type NewNote,
} from "./index";

/** How many names `freeNotePath` tries: `Name`, `Name (2)`, … `Name (100)`. */
export const MAX_NAME_ATTEMPTS = 100;

/** The adapter's `normalizePath` (Obsidian's, or the in-memory copy of it). */
export type Normalize = (path: string) => string;

/** The paths of every file and folder directly in a normalized folder (`/` is the vault root). */
export type SiblingsOf = (folder: string) => readonly string[];

/** Whether a path clashes with one of `paths` (other than `except`), by `clashKey`. */
const clashesWith = (paths: readonly string[], except?: string) => {
  const keys = new Set(paths.filter((path) => path !== except).map(clashKey));
  return (path: string): boolean => keys.has(clashKey(path));
};

const folderOf = (path: string, normalize: Normalize): string =>
  normalize(path.slice(0, Math.max(path.lastIndexOf("/"), 0)));

const notePath = (folder: string, name: string, normalize: Normalize): string =>
  normalize(`${folder}/${name}.md`);

/** The paths of `paths` that lie in `folder` or below, sorted by code unit as `list` sorts. */
export const pathsInFolder = (paths: Iterable<string>, folder: string): string[] =>
  Arr.sort(
    Arr.filter(Arr.fromIterable(paths), (path) => isInFolder(path, folder)),
    Order.String,
  );

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
  notePath(folderOf(path, normalize), newName, normalize);

/**
 * The path for renaming the note at `path` to `newName`: refused when another entry of the folder
 * clashes with it (`clashKey`), allowed for the note's own name in another case.
 */
export const planRename = (
  path: string,
  newName: string,
  normalize: Normalize,
  siblingsOf: SiblingsOf,
): Effect.Effect<string, InvalidNoteNameError | NotePathTakenError> =>
  Effect.flatMap(checkNoteName(newName), () => {
    const target = renamedNotePath(path, newName, normalize);
    const taken = clashesWith(siblingsOf(folderOf(path, normalize)), path);
    // `taken` leaves the note's own path out, so its own name in another case is free.
    return taken(target) ? Effect.fail(new NotePathTakenError()) : Effect.succeed(target);
  });

/** Where and with what a new note is written. */
export type PlannedNote = {
  readonly folder: string;
  readonly path: string;
  readonly frontmatter: Frontmatter;
};

/**
 * Checks the name, normalizes the folder and picks the first path for `note` that clashes with
 * nothing in the folder (`clashKey`: case and Unicode form do not count).
 */
export const planNewNote = (
  note: NewNote,
  normalize: Normalize,
  siblingsOf: SiblingsOf,
): Effect.Effect<PlannedNote, InvalidNoteNameError | NotePathTakenError> =>
  Effect.gen(function* () {
    yield* checkNoteName(note.name);
    const folder = normalize(note.folder);
    const taken = clashesWith(siblingsOf(folder));
    const path = yield* freeNotePath(folder, note.name, normalize, taken);
    return { folder, path, frontmatter: copyFrontmatter(note.frontmatter) };
  });
