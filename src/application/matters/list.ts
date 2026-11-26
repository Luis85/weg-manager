import {
  duplicateNumbers,
  matterType,
  type MatterFieldIssue,
  type MatterFields,
} from "../../domain/matters";
import type { MissingReference, RecordIssue } from "../../domain/notes";
import { defineRecords, type RecordRow } from "../notes";

/** An issue of a matter field: the codec's, the rules', or a missing community or contact. */
export type MatterIssue =
  | MatterFieldIssue
  // The two reference fields: the index adds `reference.missing` only there.
  | (MissingReference & { readonly key: "community_id" | "responsible_id" });

/** An issue of a matter note: of the note as a whole, or of one field (by key). */
export type MatterNoteIssue = RecordIssue | MatterIssue;

/** One matter note as the screen shows it. */
export type Matter = RecordRow<MatterFields, MatterIssue>;

const DUPLICATE = { key: "number", code: "number.duplicate" } as const;

/** `number.duplicate` on every matter whose number another one has (a sync, DV-03). */
const markDuplicateNumbers = (matters: readonly Matter[]): Matter[] => {
  const numbers = matters.flatMap((matter) =>
    matter.values.number === undefined ? [] : [matter.values.number],
  );
  const duplicates = duplicateNumbers(numbers);
  return matters.map((matter) =>
    matter.values.number !== undefined && duplicates.has(matter.values.number)
      ? { ...matter, issues: [...matter.issues, DUPLICATE] }
      : matter,
  );
};

/** Newest number first; a matter without a valid number last. */
const byNumber = (a: Matter, b: Matter): number => (b.values.number ?? 0) - (a.values.number ?? 0);

/**
 * The matter records (ADR 0007): named and filed by their outcome, `Vorgang <number>` when the
 * outcome leaves no usable file name. The list marks duplicate numbers and shows the newest
 * number first. Matters are never deleted (ENT-04).
 */
export const matterRecords = defineRecords({
  type: matterType,
  title: "outcome",
  fallbackName: (values) => `Vorgang ${String(values.number)}`,
  log: "matters",
  issue: (issue): MatterIssue => issue as MatterIssue,
  between: (matters) => markDuplicateNumbers(matters).toSorted(byNumber),
});

/** The name a list shows: the matter's outcome, else its file name. */
export const shownName = matterRecords.shownName;
