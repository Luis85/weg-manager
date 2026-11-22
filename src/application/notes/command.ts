import { Effect, Result } from "effect";
import { copyFrontmatter } from "./frontmatter";
import { NoteTrashError, NoteWriteError, type NewNote, type Note } from "./index";
import {
  planNewNote,
  type FoldersIn,
  type Normalize,
  type PlannedNote,
  type SiblingsOf,
} from "./paths";

/** What plugin code threw inside a vault write, carried past the vault call to `writeCommand`. */
class WriteDefect extends Error {
  constructor(readonly defect: unknown) {
    // Stryker disable next-line StringLiteral: the message is never shown; `writeCommand` dies with `defect`.
    super("plugin code threw inside a vault write");
  }
}

/**
 * Runs plugin code inside a vault write (a `vault.process` callback, a merge, a serialiser): what
 * it throws is a bug, so `writeCommand` dies with it instead of reporting a failed write the user
 * could retry.
 */
export const asDefect = <A>(run: () => A): A => {
  try {
    return run();
  } catch (defect) {
    throw new WriteDefect(defect);
  }
};

/**
 * True when a rejected vault write says the file is not there: Node's `ENOENT` (`code`), which
 * Obsidian's desktop adapter passes on unchanged. Measured in Obsidian 1.15.1: `vault.process`
 * on a file deleted outside rejects so while the vault still lists the file, until its file
 * watcher reports the delete. Only the `code` counts, never the message text.
 */
export const isFileGone = (rejection: unknown): boolean =>
  typeof rejection === "object" &&
  rejection !== null &&
  "code" in rejection &&
  rejection.code === "ENOENT";

type Settled<A, E> = { readonly result: Result.Result<A, E> } | { readonly rejected: unknown };

/**
 * Runs an adapter's vault write as a command: once the promise has started it is awaited, also
 * when the caller is interrupted, because a vault write cannot be cancelled and an interruption
 * must not leave the caller unsure whether it happened. A rejected promise is a `NoteWriteError`,
 * unless what rejected it came through `asDefect`: then the command dies with it. A typed failure
 * the write decided on itself comes back as `Result.fail`.
 */
export const writeCommand = <A, E>(
  write: () => Promise<Result.Result<A, E>>,
): Effect.Effect<A, E | NoteWriteError> =>
  Effect.uninterruptible(
    Effect.promise((): Promise<Settled<A, E>> =>
      write().then(
        (result) => ({ result }),
        (rejected: unknown) => ({ rejected }),
      ),
    ),
  ).pipe(
    Effect.flatMap((settled): Effect.Effect<A, E | NoteWriteError> => {
      if ("result" in settled) return Effect.fromResult(settled.result);
      const { rejected } = settled;
      return rejected instanceof WriteDefect
        ? Effect.die(rejected.defect)
        : Effect.fail(new NoteWriteError({ cause: rejected }));
    }),
  );

/**
 * `NoteStore.trash` for any adapter: runs `write` (the move to the trash) as a command; a rejected
 * move is a `NoteTrashError`, so the user reads that the note was not deleted, not that it was not
 * saved. What came through `asDefect` stays a defect.
 */
export const trashCommand = (write: () => Promise<unknown>): Effect.Effect<void, NoteTrashError> =>
  writeCommand(async () => {
    await write();
    return Result.succeed(undefined);
  }).pipe(Effect.mapError(({ cause }) => new NoteTrashError({ cause })));

/**
 * `NoteStore.create` for any adapter: checks the name, finds the folder in the vault's spelling
 * (`foldersIn` says which folders a folder holds), picks a free path (`siblingsOf` says what the
 * folder holds) and runs `write` as one command. `write` creates the folder when missing and
 * the note with `body`.
 */
export const createNote = (
  note: NewNote,
  normalize: Normalize,
  { siblingsOf, foldersIn }: { readonly siblingsOf: SiblingsOf; readonly foldersIn: FoldersIn },
  write: (plan: PlannedNote, body: string) => Promise<void>,
) =>
  Effect.flatMap(planNewNote(note, normalize, siblingsOf, foldersIn), (plan) =>
    writeCommand(async () => {
      await write(plan, note.body ?? "");
      return Result.succeed<Note>({
        path: plan.path,
        frontmatter: copyFrontmatter(plan.frontmatter),
      });
    }),
  );
