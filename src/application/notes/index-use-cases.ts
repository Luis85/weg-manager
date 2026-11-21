import { Effect, Stream } from "effect";
import type { NoteFields, NoteType } from "../../domain/notes";
import { NoteIndex } from "./note-index";

/**
 * The records of `type` now: a view's first value for `useStream`. Never suspends. A type that
 * no feature registered (`src/application/note-types.ts`) is a defect.
 */
export const noteSnapshot = <F extends NoteFields>(type: NoteType<F>) =>
  NoteIndex.use((index) => index.snapshot(type));

/** The records of `type`: the current snapshot first, then each change, for `useStream`. */
export const noteChanges = <F extends NoteFields>(type: NoteType<F>) =>
  Stream.unwrap(NoteIndex.use((index) => Effect.succeed(index.changes(type))));

/** The notes the user must see that belong to no registered type, now. */
export const unindexedSnapshot = NoteIndex.use((index) => index.unindexed);

/** The same, the current snapshot first, then each change. */
export const unindexedChanges = Stream.unwrap(
  NoteIndex.use((index) => Effect.succeed(index.unindexedChanges)),
);

/** Reads every note again; the retry of a view that shows the index's failure. */
export const rebuildNoteIndex = NoteIndex.use((index) => index.rebuild);
