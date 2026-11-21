import { Schema } from "effect";
import { SettingsIssue } from "../../domain/shell";

/** Reading or writing `data.json` failed. */
export class StorageError extends Schema.TaggedError<StorageError>()("StorageError", {
  cause: Schema.Defect(),
}) {}

/** Settings may not be written: they come from a newer version or could not be read. */
export class ReadOnlySettingsError extends Schema.TaggedError<ReadOnlySettingsError>()(
  "ReadOnlySettingsError",
  { reason: Schema.Literals(["newer-version", "unreadable"]) },
) {}

/** A settings patch broke a domain rule; the message catalog words each issue. */
export class InvalidSettingsError extends Schema.TaggedError<InvalidSettingsError>()(
  "InvalidSettingsError",
  { issues: Schema.Array(SettingsIssue) },
) {}

/** The vault could not be read. */
export class VaultReadError extends Schema.TaggedError<VaultReadError>()("VaultReadError", {
  cause: Schema.Defect(),
}) {}

/** The system clipboard rejected a write. */
export class ClipboardError extends Schema.TaggedError<ClipboardError>()("ClipboardError", {
  cause: Schema.Defect(),
}) {}

export type UpdateSettingsError = StorageError | ReadOnlySettingsError | InvalidSettingsError;

/** Every expected failure of the shell. Each member needs a text in `describeShellError`. */
export type ShellError =
  StorageError | ReadOnlySettingsError | InvalidSettingsError | VaultReadError | ClipboardError;
