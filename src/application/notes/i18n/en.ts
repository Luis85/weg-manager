import type { NotesCatalog } from "./catalog";

/** English, sentence case as in Obsidian: first the cause, then the action. */
export const notesEn: NotesCatalog = {
  errors: {
    notFound: {
      title: "Note not found",
      detail: "The note was moved or deleted. Check that it's still in the vault.",
    },
    pathTaken: {
      title: "Name already taken",
      detail: "The folder already has a note with this name. Choose another name.",
    },
    invalidName: {
      title: "Can't use this name",
      detail: {
        empty: "The name is empty. Enter a name.",
        "forbidden-character":
          "The name contains a character that file names can't hold, such as a slash or a colon. Remove it.",
        "leading-dot":
          "The name starts with a dot, so Obsidian would hide the note. Remove the dot.",
      },
    },
    unreadable: {
      title: "Can't read properties",
      detail: "The note's properties aren't valid YAML. Fix them in Obsidian, then try again.",
    },
    write: {
      title: "Note not saved",
      detail: "Obsidian couldn't write the note. Try again.",
    },
  },
};
