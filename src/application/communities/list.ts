import {
  communityType,
  duplicateShortCodes,
  type CommunityFieldIssue,
  type CommunityFields,
} from "../../domain/communities";
import type { RecordIssue } from "../../domain/notes";
import { defineRecords, type Frontmatter, type RecordRow } from "../notes";

/** An issue of a community note: of the note as a whole, or of one field (by key). */
export type CommunityNoteIssue = RecordIssue | CommunityFieldIssue;

/** One community note as the screen and the switch show it. */
export type Community = RecordRow<CommunityFields, CommunityFieldIssue>;

const DUPLICATE = { key: "short_code", code: "short-code.duplicate" } as const;

/** A value of the note as text, as the user wrote it; anything but text, a number or a flag is "". */
const textOf = (value: unknown): string =>
  typeof value === "string" || typeof value === "number" || typeof value === "boolean"
    ? String(value)
    : "";

/**
 * `short-code.duplicate` on every community whose short code another one has (a duplicate made
 * outside the plugin, PBI-56), naming the first other community with that code.
 */
const markDuplicateShortCodes = (
  communities: readonly Community[],
  shownName: (community: Community) => string,
): Community[] => {
  const duplicates = duplicateShortCodes(communities.map((community) => community.values));
  return communities.map((community) => {
    const value = community.values.short_code;
    if (value === undefined || !duplicates.has(value)) return community;
    const other = communities.find(
      (candidate) => candidate !== community && candidate.values.short_code === value,
    );
    const name = other === undefined ? value : shownName(other);
    const issue = { ...DUPLICATE, value, other: name } satisfies CommunityNoteIssue;
    return { ...community, issues: [...community.issues, issue] };
  });
};

/**
 * The community records (ADR 0007): named and filed by their name, the short code when the name
 * leaves no usable file name. The list gives an unknown colour its saved text and marks duplicate
 * short codes; create, update and delete come from the notes module's record kit.
 */
export const communityRecords = defineRecords({
  type: communityType,
  title: "name",
  fallbackName: (values) => values.short_code,
  log: "communities",
  issue: (issue, frontmatter: Frontmatter): CommunityFieldIssue =>
    issue.code === "color.unknown"
      ? { key: "color", code: "color.unknown", value: textOf(frontmatter["color"]) }
      : (issue as CommunityFieldIssue),
  between: markDuplicateShortCodes,
});

/**
 * The communities of an index snapshot: each note with its issues, plus `short-code.duplicate` on
 * every community whose short code another one has, sorted as people read names.
 */
export const toCommunityList = communityRecords.toList;

/** The name a list shows: the community's name, else its file name. */
export const shownName = communityRecords.shownName;
