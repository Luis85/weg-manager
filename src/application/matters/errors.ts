import { Schema } from "effect";
import { MatterFieldIssue } from "../../domain/matters";

/**
 * A matter the user wants to save breaks a rule: a field rule of the note type, a number another
 * matter has, or the rule between status and done day. Nothing was written. The form shows each
 * issue at its field. Its message is empty and nothing logs it.
 */
export class InvalidMatterError extends Schema.TaggedError<InvalidMatterError>()(
  "InvalidMatterError",
  { issues: Schema.Array(MatterFieldIssue) },
) {}

/** Every expected failure of the matters module. Each needs a text in its describer. */
export type MattersError = InvalidMatterError;

/** One key per member of `MattersError`; typecheck fails while one is missing or extra. */
export const MATTERS_ERROR_TAG_KEYS = {
  InvalidMatterError: true,
} satisfies Record<MattersError["_tag"], true>;
