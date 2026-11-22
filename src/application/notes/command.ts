import { Effect, Result } from "effect";
import { NoteWriteError } from "./errors";
import { copyFrontmatter } from "./frontmatter";
import { planNewNote, type Normalize, type PlannedNote, type SiblingsOf } from "./paths";
import type { NewNote, Note } from "./ports";

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
 * `NoteStore.create` for any adapter: checks the name, picks a free path (`siblingsOf` says what
 * the folder holds) and runs `write` as one command. `write` creates the folder when missing and
 * the note with `body`.
 */
export const createNote = (
  note: NewNote,
  normalize: Normalize,
  siblingsOf: SiblingsOf,
  write: (plan: PlannedNote, body: string) => Promise<void>,
) =>
  Effect.flatMap(planNewNote(note, normalize, siblingsOf), (plan) =>
    writeCommand(async () => {
      await write(plan, note.body ?? "");
      return Result.succeed<Note>({
        path: plan.path,
        frontmatter: copyFrontmatter(plan.frontmatter),
      });
    }),
  );
