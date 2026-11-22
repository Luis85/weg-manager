import { Array as Arr, Equal, Order } from "effect";
import {
  markDuplicateIds,
  parseSchemaMarker,
  type NoteFields,
  type UnindexedIssue,
} from "../../domain/notes";
import type { IndexedNote, IndexedType, UnindexedNote } from "./note-index";
import type { Note } from "./ports";

type AnyRecord = IndexedNote<NoteFields>;

/**
 * The note the index tracks at one path: a record of a registered type, or a note of none
 * (`GLOSSARY.md`: a record, never an "entry").
 */
export type TrackedNote =
  | { readonly kind: "record"; readonly type: string; readonly note: AnyRecord }
  | { readonly kind: "unindexed"; readonly note: UnindexedNote };

/** The registered types by name. */
export type TypesByName = ReadonlyMap<string, IndexedType>;

export const trackedUnindexed = (path: string, issue: UnindexedIssue): TrackedNote => ({
  kind: "unindexed",
  note: { path, issue },
});

/**
 * What the index makes of a note `list` or `read` returned: a record of its registered type, a
 * note with an unreadable or unknown marker, or nothing (no record at all). `previous` is the note
 * tracked at the path so far: when the frontmatter is the same, it is kept as it is, so an
 * unchanged note stays the same object and publishes nothing.
 */
export const trackedNoteOf = (
  types: TypesByName,
  note: Note,
  previous?: TrackedNote,
): TrackedNote | undefined => {
  if (previous?.kind === "record" && Equal.equals(previous.note.frontmatter, note.frontmatter)) {
    return previous;
  }
  const marker = parseSchemaMarker(note.frontmatter["schema"]);
  if (marker.kind === "none") return undefined;
  if (marker.kind === "malformed") return trackedUnindexed(note.path, { code: "schema.malformed" });
  const type = types.get(marker.type);
  if (type === undefined) {
    return trackedUnindexed(note.path, { code: "schema.unknown-type", type: marker.type });
  }
  // The marker names this type, so decode never answers `not-this-type`.
  return { kind: "record", type: marker.type, note: type.decode(note) as AnyRecord };
};

const byPath = Order.mapInput(Order.String, (tracked: TrackedNote) => tracked.note.path);

/** What the index publishes, before the status is added: the notes per type and the others. */
export type Contents = {
  readonly records: ReadonlyMap<string, readonly AnyRecord[]>;
  readonly unindexed: readonly UnindexedNote[];
};

/**
 * The notes per registered type and the unindexed ones, each sorted by path, after
 * `markDuplicateIds` over the records of every type: an id is unique across types too.
 */
export const contentsOf = (types: TypesByName, trackedNotes: Iterable<TrackedNote>): Contents => {
  const sorted = Arr.sort(Arr.fromIterable(trackedNotes), byPath);
  const records: Extract<TrackedNote, { kind: "record" }>[] = [];
  const unindexed: UnindexedNote[] = [];
  for (const tracked of sorted) {
    if (tracked.kind === "record") records.push(tracked);
    else unindexed.push(tracked.note);
  }
  const marked = markDuplicateIds(records.map((tracked) => tracked.note));
  const byType = new Map<string, AnyRecord[]>(Arr.map([...types.keys()], (name) => [name, []]));
  records.forEach((tracked, at) => byType.get(tracked.type)?.push(marked[at] as AnyRecord));
  return { records: byType, unindexed };
};

/**
 * True when two lists hold the same notes: the same objects, or equal ones (a duplicate is marked
 * anew on every pass). Cheap for the common case: an unchanged note is the same object, and
 * `Equal.equals` answers for the same object at once.
 */
export const sameNotes = <A>(left: readonly A[], right: readonly A[]): boolean =>
  left.length === right.length && left.every((note, at) => Equal.equals(note, right[at]));
