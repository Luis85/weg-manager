import type { AppError } from "./errors";
import type { Catalog } from "./messages";
import { describeNotesError, isNotesError } from "./notes";
import { describeShellError, type UserMessage } from "./shell";

/**
 * The text of any expected failure, in the UI language: each error goes to its module's describer
 * with that module's part of the catalog. Exhaustive by type: an error union added to `AppError`
 * without a describer here is not assignable to the last describer's parameter. A second module
 * narrows first, as `isNotesError` does here.
 */
export const describeError = (error: AppError, messages: Catalog): UserMessage =>
  isNotesError(error)
    ? describeNotesError(error, messages.notes)
    : describeShellError(error, messages.shell);
