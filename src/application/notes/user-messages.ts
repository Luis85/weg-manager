import type { UserMessage } from "../shell";
import type { NotesError } from "./errors";
import type { NotesCatalog } from "./i18n/catalog";

/** The errors whose message has a detail per issue or reason, worded below. */
type DetailedTag = "InvalidNoteNameError" | "NoteWriteRefusedError";

/** The texts of the catalog that are one title and one detail. */
type PlainText = {
  [Key in keyof NotesCatalog["errors"]]: NotesCatalog["errors"][Key] extends {
    readonly detail: string;
  }
    ? Key
    : never;
}[keyof NotesCatalog["errors"]];

/**
 * Every other notes error: its text, its severity and whether the user can retry. Typecheck fails
 * until a new error has its line here or a case below.
 */
const PLAIN: {
  readonly [Tag in Exclude<NotesError["_tag"], DetailedTag>]: {
    readonly text: PlainText;
    readonly severity: UserMessage["severity"];
    readonly retry: boolean;
  };
} = {
  NoteNotFoundError: { text: "notFound", severity: "warning", retry: false },
  NotePathTakenError: { text: "pathTaken", severity: "warning", retry: false },
  NoteUnreadableError: { text: "unreadable", severity: "warning", retry: false },
  NoteWriteError: { text: "write", severity: "error", retry: true },
  NoteTrashError: { text: "trash", severity: "error", retry: true },
  NoteOpenError: { text: "open", severity: "error", retry: true },
  NoteEditConflictError: { text: "editConflict", severity: "warning", retry: false },
  NoteIndexReadError: { text: "indexRead", severity: "warning", retry: true },
  LocalFileRemoveError: { text: "localRemove", severity: "warning", retry: false },
};

/** The text of a notes error. `describeError` (`src/application/user-messages.ts`) hands it here. */
export const describeNotesError = (error: NotesError, messages: NotesCatalog): UserMessage => {
  const { errors } = messages;
  if (error._tag === "InvalidNoteNameError") {
    return {
      severity: "warning",
      title: errors.invalidName.title,
      detail: errors.invalidName.detail[error.issue],
    };
  }
  if (error._tag === "NoteWriteRefusedError") {
    return {
      severity: "warning",
      title: errors.writeRefused.title,
      detail: errors.writeRefused.detail[error.reason],
    };
  }
  const { text, severity, retry } = PLAIN[error._tag];
  const { title, detail } = errors[text];
  return retry ? { severity, title, detail, action: "retry" } : { severity, title, detail };
};
