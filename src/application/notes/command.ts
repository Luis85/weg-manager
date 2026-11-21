import { Effect, Result } from "effect";
import { NoteWriteError } from "./errors";
import { copyFrontmatter } from "./frontmatter";
import { planNewNote, type Normalize, type PlannedNote, type SiblingsOf } from "./paths";
import type { NewNote, Note } from "./ports";

/**
 * Runs an adapter's vault write as a command: once the promise has started it is awaited, also
 * when the caller is interrupted, because a vault write cannot be cancelled and an interruption
 * must not leave the caller unsure whether it happened. A rejected promise is a `NoteWriteError`;
 * a typed failure the write decided on itself comes back as `Result.fail`.
 */
export const writeCommand = <A, E>(
  write: () => Promise<Result.Result<A, E>>,
): Effect.Effect<A, E | NoteWriteError> =>
  Effect.uninterruptible(
    Effect.tryPromise({ try: write, catch: (cause) => new NoteWriteError({ cause }) }),
  ).pipe(Effect.flatMap((result) => Effect.fromResult(result)));

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
