import { parseRecordId } from "../notes";
import { communityType } from "./community-type";

/**
 * The community selection rule (ADR 0008, PBI-56): the stored community while it exists; with
 * nothing stored or the stored one gone, the only community if there is exactly one, otherwise
 * none, and the frame asks for a choice. `ids` are the communities that can be selected; a stored
 * value that is none of them (gone, or written by another version) counts as nothing stored.
 */
export const selectedCommunity = (stored: unknown, ids: readonly string[]): string | undefined => {
  const kept = ids.find((id) => id === stored);
  if (kept !== undefined) return kept;
  return ids.length === 1 ? ids[0] : undefined;
};

/**
 * Whether a stored selection is a community's id, whether its note exists now or not: a choice to
 * keep while the note is gone for a moment (Sync, broken YAML while typing), not to replace.
 */
export const isCommunityChoice = (stored: unknown): boolean =>
  parseRecordId(stored)?.type === communityType.type;
