import { Schema } from "effect";
import { MatterFieldIssue } from "../../domain/matters";

const EntryIssue = Schema.Literals(["text.missing", "text.invalid", "occurred-on.invalid"]);
const StatusChangeIssue = Schema.Literals([
  "status.unchanged",
  "reason.missing",
  "source.missing",
  "done-on.missing",
  "done-on.invalid",
]);

/**
 * A matter the user wants to save breaks a rule: a field rule of the note type, a number another
 * matter has, or the rule between status and done day. Nothing was written. The form shows each
 * issue at its field. Its message is empty and nothing logs it.
 */
export class InvalidMatterError extends Schema.TaggedError<InvalidMatterError>()(
  "InvalidMatterError",
  { issues: Schema.Array(MatterFieldIssue) },
) {}

/** A history entry breaks a rule (no text, a day that is none); nothing was written. */
export class InvalidHistoryEntryError extends Schema.TaggedError<InvalidHistoryEntryError>()(
  "InvalidHistoryEntryError",
  { issues: Schema.Array(EntryIssue) },
) {}

/** A status change breaks a rule (PBI-08: reason, source, done day); nothing was written. */
export class InvalidStatusChangeError extends Schema.TaggedError<InvalidStatusChangeError>()(
  "InvalidStatusChangeError",
  { issues: Schema.Array(StatusChangeIssue) },
) {}

/** A due date change breaks a rule (PBI-09: reason, a real day); nothing was written. */
export class InvalidDueChangeError extends Schema.TaggedError<InvalidDueChangeError>()(
  "InvalidDueChangeError",
  { issues: Schema.Array(Schema.Literals(["reason.missing", "due-on.invalid"])) },
) {}

/** Every expected failure of the matters module. Each needs a text in its describer. */
export type MattersError =
  InvalidMatterError | InvalidHistoryEntryError | InvalidStatusChangeError | InvalidDueChangeError;

/** One key per member of `MattersError`; typecheck fails while one is missing or extra. */
export const MATTERS_ERROR_TAG_KEYS = {
  InvalidMatterError: true,
  InvalidHistoryEntryError: true,
  InvalidStatusChangeError: true,
  InvalidDueChangeError: true,
} satisfies Record<MattersError["_tag"], true>;
