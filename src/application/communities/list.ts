import { Array as Arr, Order } from "effect";
import {
  duplicateShortCodes,
  type CommunityFieldIssue,
  type CommunityFields,
  type CommunityValues,
} from "../../domain/communities";
import type { RecordIssue } from "../../domain/notes";
import type { Frontmatter, IndexStatus, IndexedNote, NoteSnapshot } from "../notes";

/** An issue of a community note: of the note as a whole, or of one field (by key). */
export type CommunityNoteIssue = RecordIssue | CommunityFieldIssue;

/** One community note as the screen and the switch show it. */
export type Community = {
  readonly path: string;
  /** The file name without folder and `.md`: what to show when the name cannot be read. */
  readonly fileName: string;
  /** `undefined` when the note has no valid id of its type. */
  readonly id: string | undefined;
  /** False for a read-only note: a newer version, no identity, a duplicate id. */
  readonly editable: boolean;
  /** The valid values; a broken or missing field is left out and named in `issues`. */
  readonly values: Partial<CommunityValues>;
  readonly issues: readonly CommunityNoteIssue[];
  /** The frontmatter as read: what a form loads and saves against (ADR 0007). */
  readonly frontmatter: Frontmatter;
};

/** The communities with the index's status, sorted as people read names. */
export type CommunityList = IndexStatus & { readonly communities: readonly Community[] };

const DUPLICATE = { key: "short_code", code: "short-code.duplicate" } as const;

/** The file name of a note's path, without folder and `.md`. */
export const fileNameOf = (path: string): string =>
  path.slice(path.lastIndexOf("/") + 1).replace(/\.md$/, "");

/** The name a list shows: the community's name, else its file name. */
export const shownName = (community: Community): string =>
  community.values.name ?? community.fileName;

/**
 * Names compare as people read them in the product's language: case and accents second, numbers
 * by value (`Weg 9` before `Weg 10`). The path decides between equal names, so the order is the
 * same on every device.
 */
const byName: Order.Order<Community> = Order.combine(
  Order.make((a: Community, b: Community) => {
    const order = shownName(a).localeCompare(shownName(b), "de", { numeric: true });
    return Math.sign(order) as -1 | 0 | 1;
  }),
  Order.mapInput(Order.String, (community: Community) => community.path),
);

const communityOf = (note: IndexedNote<CommunityFields>, duplicates: ReadonlySet<string>) => {
  const code = note.values.short_code;
  const duplicate = code !== undefined && duplicates.has(code);
  const issues: CommunityNoteIssue[] = [...(note.issues as readonly CommunityNoteIssue[])];
  if (duplicate) issues.push(DUPLICATE);
  return {
    path: note.path,
    fileName: fileNameOf(note.path),
    id: note.id,
    editable: note.kind === "editable",
    values: note.values,
    issues,
    frontmatter: note.frontmatter,
  } satisfies Community;
};

/**
 * The communities of an index snapshot: each note with its issues, plus `short-code.duplicate` on
 * every community whose short code another one has (a duplicate made outside the plugin, PBI-56).
 */
export const toCommunityList = (snapshot: NoteSnapshot<CommunityFields>): CommunityList => {
  const duplicates = duplicateShortCodes(snapshot.notes.map((note) => note.values));
  return {
    ready: snapshot.ready,
    failure: snapshot.failure,
    communities: Arr.sort(
      snapshot.notes.map((note) => communityOf(note, duplicates)),
      byName,
    ),
  };
};

/**
 * Whether the form lets the user set the short code. It is fixed once given (PBI-56), unless the
 * note has none that is valid, or one another community has too: then the form repairs it.
 */
export const canChangeShortCode = (community: Community): boolean =>
  community.values.short_code === undefined ||
  community.issues.some((issue) => issue.code === "short-code.duplicate");
