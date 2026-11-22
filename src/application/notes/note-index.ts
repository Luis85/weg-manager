// Stryker disable StringLiteral: the only string here is a service key; it only has to be unique and tests cannot observe its text.
import { Context, type Effect, type Stream } from "effect";
import type {
  DecodedNote,
  EditableRecord,
  NoteFields,
  NoteInput,
  NoteType,
  ReadOnlyRecord,
  UnindexedIssue,
} from "../../domain/notes";
import type { NoteIndexReadError } from "./errors";

/**
 * What the index needs of a note type: its name, its decode, and its fields, whose references it
 * checks against the records of every type. Every `defineNoteType` result is one. The application
 * root composes them (`src/application/note-types.ts`).
 */
export type IndexedType = {
  readonly type: string;
  readonly fields: NoteFields;
  readonly decode: (note: NoteInput) => DecodedNote<NoteFields>;
};

/** The note types of every feature module, each name once. */
export type NoteTypeRegistry = readonly IndexedType[];

/** A record of type `F` as the index holds it: decoded, with duplicate ids marked. */
export type IndexedNote<F extends NoteFields> = EditableRecord<F> | ReadOnlyRecord<F>;

/** A note the user must see that belongs to no registered type, with the reason. */
export type UnindexedNote = { readonly path: string; readonly issue: UnindexedIssue };

/**
 * How far the index is. `ready` turns true once `VaultReady` was seen and a build succeeded.
 * `failure` is set when a read failed; the notes are then the last ones read, and only a rebuild
 * that succeeds clears it.
 */
export type IndexStatus = {
  readonly ready: boolean;
  readonly failure: NoteIndexReadError | undefined;
};

/**
 * The notes of one type, sorted by path (code-unit order), with the index's status, and the same
 * notes by id (`byId`), built once per published snapshot, so a route or a reference finds its
 * record without a scan. A note without a valid id is only in `notes`. An id that several notes
 * carry gives the first of them by path: like each of them, it is read-only with `id.duplicate`,
 * so a write through it is refused.
 */
export type NoteSnapshot<F extends NoteFields> = IndexStatus & {
  readonly notes: readonly IndexedNote<F>[];
  readonly byId: ReadonlyMap<string, IndexedNote<F>>;
};

/** The notes of no registered type, sorted by path, with the index's status. */
export type UnindexedSnapshot = IndexStatus & { readonly notes: readonly UnindexedNote[] };

/**
 * The decoded records of every registered note type, built from the notes alone (ADR 0007): at
 * `VaultReady`, then kept up to date by the vault's file events. Each read is a pair a view follows
 * with `useStream`: the snapshot now (never suspends) and a stream that emits it first and then
 * every change. A type that is not registered is a defect.
 */
export class NoteIndex extends Context.Service<
  NoteIndex,
  {
    snapshot<F extends NoteFields>(type: NoteType<F>): Effect.Effect<NoteSnapshot<F>>;
    changes<F extends NoteFields>(type: NoteType<F>): Stream.Stream<NoteSnapshot<F>>;
    readonly unindexed: Effect.Effect<UnindexedSnapshot>;
    readonly unindexedChanges: Stream.Stream<UnindexedSnapshot>;
    /**
     * Reads every note again and replaces the index; done once the new snapshots are published.
     * Before `VaultReady` it waits for the first build.
     */
    readonly rebuild: Effect.Effect<void>;
  }
>()("weg-manager/application/NoteIndex") {}
