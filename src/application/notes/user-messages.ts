import type { AppError } from "../errors";
import type { UserMessage } from "../shell";
import { NOTES_ERROR_TAGS, type NotesError } from "./errors";
import type { NotesCatalog } from "./i18n/catalog";

/** True for an error of the notes module; `describeError` narrows with it. */
export const isNotesError = (error: AppError): error is NotesError =>
  NOTES_ERROR_TAGS.has(error._tag);

/** The text of a notes error. `describeError` (`src/application/user-messages.ts`) hands it here. */
export const describeNotesError = (error: NotesError, messages: NotesCatalog): UserMessage => {
  const { errors } = messages;
  switch (error._tag) {
    case "NoteNotFoundError":
      return { severity: "warning", ...errors.notFound };
    case "NotePathTakenError":
      return { severity: "warning", ...errors.pathTaken };
    case "InvalidNoteNameError":
      return {
        severity: "warning",
        title: errors.invalidName.title,
        detail: errors.invalidName.detail[error.issue],
      };
    case "NoteUnreadableError":
      return { severity: "warning", ...errors.unreadable };
    case "NoteWriteError":
      return { severity: "error", ...errors.write, action: "retry" };
    case "NoteTrashError":
      return { severity: "error", ...errors.trash, action: "retry" };
    case "NoteEditConflictError":
      return { severity: "warning", ...errors.editConflict };
    case "NoteWriteRefusedError":
      return {
        severity: "warning",
        title: errors.writeRefused.title,
        detail: errors.writeRefused.detail[error.reason],
      };
    case "NoteIndexReadError":
      return { severity: "warning", ...errors.indexRead, action: "retry" };
  }
};
