import { Array as Arr, Order } from "effect";
import type {
  Frontmatter,
  NoteFields,
  PartialValues,
  RecordFieldIssue,
  RecordIssue,
} from "../../domain/notes";
import type { IndexStatus, IndexedNote, NoteSnapshot } from "./note-index";

/** A field's issue as a feature reports it: language-free, by its key (ADR 0005). */
export type KeyedIssue = { readonly key: string; readonly code: string };

/** One record note as a list, a form and a dialog show it. */
export type RecordRow<F extends NoteFields, Issue extends KeyedIssue = RecordFieldIssue<F>> = {
  readonly path: string;
  /** The file name without folder and `.md`: what to show when the title cannot be read. */
  readonly fileName: string;
  /** `undefined` when the note has no valid id of its type. */
  readonly id: string | undefined;
  /** False for a read-only note: a newer version, no identity, a duplicate id. */
  readonly editable: boolean;
  /** The valid values; a broken or missing field is left out and named in `issues`. */
  readonly values: PartialValues<F>;
  readonly issues: readonly (RecordIssue | Issue)[];
  /** The frontmatter as read: what a form loads and saves against (ADR 0007). */
  readonly frontmatter: Frontmatter;
};

/** The records of one type with the index's status, sorted as people read their titles. */
export type RecordList<Row> = IndexStatus & { readonly records: readonly Row[] };

/** The file name of a note's path, without folder and `.md`. */
export const fileNameOf = (path: string): string =>
  path.slice(path.lastIndexOf("/") + 1).replace(/\.md$/, "");

/** How a list is built from the index: the title's key and the feature's additions. */
export type RowRules<F extends NoteFields, Issue extends KeyedIssue> = {
  readonly title: keyof F & string;
  /** The issue with the data its sentence needs (an unknown colour's text); default: as it is. */
  readonly issue?: (issue: RecordFieldIssue<F>, frontmatter: Frontmatter) => Issue;
  /** The issues between records (a duplicate short code), over the sorted rows. */
  readonly between?: (
    rows: readonly RecordRow<F, Issue>[],
    shownName: (row: RecordRow<F, Issue>) => string,
  ) => readonly RecordRow<F, Issue>[];
};

/** The name a list shows for a record: its title, else its file name. */
const titleOf =
  <F extends NoteFields, Issue extends KeyedIssue>(title: keyof F & string) =>
  (row: RecordRow<F, Issue>): string =>
    (row.values[title] as string | undefined) ?? row.fileName;

/**
 * The rows of an index snapshot: each note with its issues, sorted by title as people read it in
 * the product's language (case and accents second, numbers by value: `Weg 9` before `Weg 10`),
 * the path deciding between equal titles so the order is the same on every device; then the
 * feature's issues between records.
 */
export const recordRows = <F extends NoteFields, Issue extends KeyedIssue>(
  rules: RowRules<F, Issue>,
) => {
  const shownName = titleOf<F, Issue>(rules.title);
  const byTitle: Order.Order<RecordRow<F, Issue>> = Order.combine(
    Order.make((a: RecordRow<F, Issue>, b: RecordRow<F, Issue>) => {
      const order = shownName(a).localeCompare(shownName(b), "de", { numeric: true });
      return Math.sign(order) as -1 | 0 | 1;
    }),
    Order.mapInput(Order.String, (row: RecordRow<F, Issue>) => row.path),
  );
  const withData = (issue: IndexedNote<F>["issues"][number], frontmatter: Frontmatter) =>
    "key" in issue && rules.issue !== undefined
      ? rules.issue(issue, frontmatter)
      : (issue as RecordIssue | Issue);
  const rowOf = (note: IndexedNote<F>): RecordRow<F, Issue> => ({
    path: note.path,
    fileName: fileNameOf(note.path),
    id: note.id,
    editable: note.kind === "editable",
    values: note.values,
    issues: note.issues.map((issue) => withData(issue, note.frontmatter)),
    frontmatter: note.frontmatter,
  });
  /** Needs only the status and the notes of a snapshot, so a test can hand them in plainly. */
  const toList = (snapshot: Omit<NoteSnapshot<F>, "byId">): RecordList<RecordRow<F, Issue>> => {
    const rows = Arr.sort(snapshot.notes.map(rowOf), byTitle);
    return {
      ready: snapshot.ready,
      failure: snapshot.failure,
      records: rules.between === undefined ? rows : rules.between(rows, shownName),
    };
  };
  return { shownName, toList };
};
