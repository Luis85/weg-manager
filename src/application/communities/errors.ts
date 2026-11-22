import { Schema } from "effect";
import { CommunityFieldIssue } from "../../domain/communities";

/**
 * A community the user wants to save breaks a rule: a field rule of the note type, a short code
 * another community has, or a colour another community uses. Nothing was written. The form shows
 * each issue at its field. The issues hold codes and keys and, where the sentence needs them, the
 * taken short code with the other community's name or the unknown colour as written: note content
 * for the form, as in `NoteEditConflictError`. Its message is empty and nothing logs it.
 */
export class InvalidCommunityError extends Schema.TaggedError<InvalidCommunityError>()(
  "InvalidCommunityError",
  { issues: Schema.Array(CommunityFieldIssue) },
) {}

/** Every expected failure of the communities module. Each needs a text in its describer. */
export type CommunitiesError = InvalidCommunityError;

/** One key per member of `CommunitiesError`; typecheck fails while one is missing or extra. */
const COMMUNITIES_ERROR_TAG_KEYS = {
  InvalidCommunityError: true,
} satisfies Record<CommunitiesError["_tag"], true>;

export const COMMUNITIES_ERROR_TAGS: ReadonlySet<string> = new Set(
  Object.keys(COMMUNITIES_ERROR_TAG_KEYS),
);
