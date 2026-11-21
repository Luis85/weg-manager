import { Effect, Layer, Result } from "effect";
import {
  NoteNotFoundError,
  NotePathTakenError,
  NoteStore,
  NoteUnreadableError,
  applyPatch,
  checkNoteName,
  copyFrontmatter,
  createNote,
  recordNotes,
  renamedNotePath,
  writeCommand,
  type Frontmatter,
  type FrontmatterChange,
  type NewNote,
  type Note,
} from "../../../application/notes";
import { VaultReadError } from "../../../application/shell";
import { normalizePath } from "./normalize-path";

/**
 * Marks every failure this adapter makes up. `npm run check:dist` refuses a `main.js` that holds
 * it, so the in-memory adapter can never ship in the plugin.
 */
export const TEST_ONLY_MARKER = "weg-manager/test-only";

/** A note as the memory holds it: `undefined` frontmatter means YAML that cannot be parsed. */
type Stored = { readonly frontmatter: Frontmatter | undefined; readonly body: string };

/** How a seed gives a note's frontmatter: a map, none at all, or broken YAML. */
type SeedFrontmatter = Frontmatter | "none" | "broken";

const folderOf = (path: string): string => {
  const slash = path.lastIndexOf("/");
  return slash === -1 ? "/" : path.slice(0, slash);
};

const ancestors = (folder: string): string[] =>
  folder === "/"
    ? []
    : folder.split("/").map((_, index, segments) => segments.slice(0, index + 1).join("/"));

const madeUp = (what: string) => new Error(`${TEST_ONLY_MARKER}: ${what}`);

/**
 * The `NoteStore` for tests and the browser harness: a vault in memory that keeps what the
 * Obsidian adapter keeps (frontmatter key order, unknown keys, the body) and fails as it fails. It
 * passes the same contract suite (`tests/support/notes/contract.ts`). Reads see every write at
 * once, where Obsidian's metadata cache lags a moment behind.
 *
 * Its handles seed notes as an outside editor would, look behind the port, and switch failures
 * on: `setFailReads`, `setFailWrites`, and `holdWrites` to keep every write waiting, as a slow disk
 * would, until `releaseWrites`.
 */
export const memoryNoteStore = () => {
  const notes = new Map<string, Stored>();
  const folders = new Set<string>();
  let failReads = false;
  let failWrites = false;
  let open = true;
  let waiting: (() => void)[] = [];

  const taken = (path: string) => notes.has(path) || folders.has(path);
  const addFolders = (folder: string) => {
    for (const ancestor of ancestors(folder)) folders.add(ancestor);
  };

  const read = <A>(run: () => A) =>
    Effect.suspend(() =>
      failReads
        ? Effect.fail(new VaultReadError({ cause: madeUp("read failed") }))
        : Effect.sync(run),
    );

  const find = (path: string) => {
    const normalized = normalizePath(path);
    const stored = notes.get(normalized);
    return stored === undefined
      ? Effect.fail(new NoteNotFoundError())
      : Effect.succeed({ path: normalized, stored });
  };

  /** Waits like a disk while writes are held, then fails as a read-only disk would. */
  const disk = async () => {
    await new Promise<void>((resolve) => {
      if (open) resolve();
      else waiting.push(resolve);
    });
    if (failWrites) throw madeUp("write failed");
  };

  /** Applies `apply` after the disk; once started it completes, as Obsidian's writes do. */
  const write = <A, E>(apply: () => Result.Result<A, E>) =>
    writeCommand(async () => {
      await disk();
      return apply();
    });

  const create = (note: NewNote) =>
    createNote(note, normalizePath, taken, async ({ folder, path, frontmatter }, body) => {
      await disk();
      addFolders(folder);
      notes.set(path, { frontmatter, body });
    });

  const update = <E>(path: string, change: FrontmatterChange<E>) =>
    Effect.flatMap(find(path), (found) =>
      write((): Result.Result<Note, E | NoteUnreadableError> => {
        const current = notes.get(found.path) ?? found.stored;
        if (current.frontmatter === undefined) {
          return Result.fail(new NoteUnreadableError({ cause: madeUp("broken YAML") }));
        }
        const decided = change(copyFrontmatter(current.frontmatter));
        if (Result.isFailure(decided)) return Result.fail(decided.failure);
        const next = { ...copyFrontmatter(current.frontmatter) };
        applyPatch(next, decided.success);
        notes.set(found.path, { frontmatter: next, body: current.body });
        return Result.succeed<Note>({ path: found.path, frontmatter: copyFrontmatter(next) });
      }),
    );

  const trash = (path: string) =>
    Effect.flatMap(find(path), (found) =>
      write(() => {
        notes.delete(found.path);
        return Result.succeed(undefined);
      }),
    );

  const rename = (path: string, newName: string) =>
    Effect.gen(function* () {
      const found = yield* find(path);
      yield* checkNoteName(newName);
      const target = renamedNotePath(found.path, newName, normalizePath);
      const note = { path: target, frontmatter: copyFrontmatter(found.stored.frontmatter) };
      if (target === found.path) return note;
      if (taken(target)) return yield* new NotePathTakenError();
      return yield* write(() => {
        notes.delete(found.path);
        notes.set(target, found.stored);
        return Result.succeed<Note>(note);
      });
    });

  const layer = Layer.succeed(NoteStore)(
    NoteStore.of({
      list: read(() =>
        recordNotes([...notes].map(([path, { frontmatter }]) => ({ path, frontmatter }))),
      ),
      read: (path) =>
        Effect.flatMap(find(path), (found) =>
          read(() => ({
            path: found.path,
            frontmatter: copyFrontmatter(found.stored.frontmatter),
          })),
        ),
      create,
      update,
      trash,
      rename,
    }),
  );

  return {
    layer,
    /** Writes a note as a person, Sync or an agent would: no checks, no waiting. */
    seed: (path: string, frontmatter: SeedFrontmatter, body = ""): void => {
      addFolders(folderOf(path));
      notes.set(path, {
        frontmatter:
          frontmatter === "broken"
            ? undefined
            : copyFrontmatter(frontmatter === "none" ? {} : frontmatter),
        body,
      });
    },
    body: (path: string): string | undefined => notes.get(path)?.body,
    isFolder: (path: string): boolean => folders.has(path),
    setFailReads: (fail: boolean): void => {
      failReads = fail;
    },
    setFailWrites: (fail: boolean): void => {
      failWrites = fail;
    },
    holdWrites: (): void => {
      open = false;
    },
    releaseWrites: (): void => {
      open = true;
      const queued = waiting;
      waiting = [];
      for (const resume of queued) resume();
    },
    heldWrites: (): number => waiting.length,
  };
};
