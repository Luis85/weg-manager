import { parseRecordId } from "../notes";
import { communityType } from "./community-type";

/** What the selection rule needs to know of a community: its id and whether it has an issue. */
type SelectionCandidate = {
  readonly id: string | undefined;
  readonly issues: readonly unknown[];
};

/**
 * The communities that can be selected (owner decision, 22.11.2026): each one without any issue,
 * once, in the order given. A read-only note always has an issue (a newer version, no valid id, a
 * duplicate id), and so does an editable one with a broken field or a duplicate short code: it is
 * listed with its issue, but no view works in it until it is repaired.
 */
export const selectableIds = (communities: readonly SelectionCandidate[]): string[] => [
  ...new Set(
    communities.flatMap(({ id, issues }) => (id === undefined || issues.length > 0 ? [] : [id])),
  ),
];

/**
 * The community selection rule (ADR 0008, PBI-56): the stored community while it can be selected;
 * otherwise the only one if there is exactly one, else none, and the frame asks for a choice.
 * `ids` are the communities that can be selected (`selectableIds`); a stored value that is none of
 * them (gone, with an issue for now, or written by another version) counts as nothing stored.
 */
export const selectedCommunity = (stored: unknown, ids: readonly string[]): string | undefined => {
  const kept = ids.find((id) => id === stored);
  if (kept !== undefined) return kept;
  return ids.length === 1 ? ids[0] : undefined;
};

/**
 * Whether a stored selection is a community's id, whether its note exists now or not: a choice to
 * keep while the note is gone or has an issue for a moment (Sync, broken YAML while typing), not
 * to replace.
 */
export const isCommunityChoice = (stored: unknown): boolean =>
  parseRecordId(stored)?.type === communityType.type;
