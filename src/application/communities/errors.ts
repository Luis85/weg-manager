import { Schema } from "effect";
import { CommunityFieldIssue } from "../../domain/communities";

/**
 * A community the user wants to save breaks a rule: a field rule of the note type, a short code
 * another community has, or a colour another community uses. Nothing was written. The form shows
 * each issue at its field; the issues hold codes and keys, no values.
 */
export class InvalidCommunityError extends Schema.TaggedError<InvalidCommunityError>()(
  "InvalidCommunityError",
  { issues: Schema.Array(CommunityFieldIssue) },
) {}

/** Every expected failure of the communities module. Each needs a text in its describer. */
export type CommunitiesError = InvalidCommunityError;

export const COMMUNITIES_ERROR_TAGS: ReadonlySet<string> = new Set<CommunitiesError["_tag"]>([
  "InvalidCommunityError",
]);
