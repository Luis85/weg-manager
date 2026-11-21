import { Effect, Result } from "effect";
import {
  recordId,
  type MergeFailure,
  type NoteFields,
  type NoteType,
  type RecordValues,
} from "../../domain/notes";
import { NoteEditConflictError, NoteWriteRefusedError } from "./errors";
import { IdGenerator, type Frontmatter, type FrontmatterChange } from "./ports";

/**
 * The frontmatter of a new record of `type` for `NoteStore.create`: a fresh id from `IdGenerator`,
 * then `schema`, `id` and the values in declaration order.
 */
export const newRecordFrontmatter = <F extends NoteFields>(
  type: NoteType<F>,
  values: RecordValues<F>,
): Effect.Effect<Frontmatter, never, IdGenerator> =>
  IdGenerator.use(({ uuid }) =>
    Effect.map(uuid, (fresh) => type.newFrontmatter(recordId(type.type, fresh), values)),
  );

const toError = (failure: MergeFailure): NoteEditConflictError | NoteWriteRefusedError =>
  failure._tag === "conflict"
    ? new NoteEditConflictError({ conflicts: failure.conflicts })
    : new NoteWriteRefusedError({ reason: failure.reason });

/**
 * Saves a form's edit through `NoteStore.update(path, editChange(type, base, edited))`: the
 * per-field merge runs on the note's frontmatter inside the atomic write (ADR 0007). `base` is the
 * frontmatter the form loaded, `edited` every field as saved. A conflict or a note that is no
 * longer the loaded record fails the update, and nothing is written.
 */
export const editChange =
  <F extends NoteFields>(
    type: NoteType<F>,
    base: Frontmatter,
    edited: RecordValues<F>,
  ): FrontmatterChange<NoteEditConflictError | NoteWriteRefusedError> =>
  (current) =>
    Result.mapError(type.merge(base, edited, current), toError);
