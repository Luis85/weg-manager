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
    editConflict: {
      title: "Note changed meanwhile",
      detail:
        "The note was changed outside the form, also in fields you edited. Choose the value to keep for each of those fields, then save again.",
    },
    writeRefused: {
      title: "Can't save the note",
      detail: {
        "other-type":
          "The note is no longer a record of this type. Check its schema property in Obsidian.",
        "newer-version":
          "A newer plugin version saved the note meanwhile. Update WEG Manager, then open the note again.",
        identity:
          "The note's id changed meanwhile, so it's no longer the same record. Open the note again.",
        "migration-failed":
          "The note couldn't be converted to the current schema version. Check its properties in Obsidian.",
      },
    },
  },
  recordIssues: {
    "schema.malformed": () =>
      "The schema property can't be read, so the note is read-only. Fix it in Obsidian as the file contract describes.",
    "schema.newer": ({ version }) =>
      `The note comes from a newer plugin version (schema version ${version}), so it's read-only. Update WEG Manager to edit it.`,
    "migration.failed": ({ from }) =>
      `The note couldn't be converted from schema version ${from} to the current one, so it's read-only. Check its properties in Obsidian.`,
    "id.missing": () =>
      "The note has no id property, so it's read-only. Restore the id in Obsidian, for example from a backup.",
    "id.malformed": () =>
      "The note's id property isn't valid, so it's read-only. Restore the original id in Obsidian.",
    "id.other-type": () =>
      "The note's id belongs to another type, so it's read-only. Check schema and id in Obsidian.",
    "id.duplicate": () =>
      "Another note has the same id, so both are read-only. Delete the duplicate note in Obsidian.",
  },
  fieldIssues: {
    "field.missing": (label) => `“${label}” is missing. Enter a value.`,
    "field.text": (label) => `“${label}” isn't text. Enter text.`,
    "field.number": (label) => `“${label}” isn't a number. Enter a number.`,
    "field.checkbox": (label) => `“${label}” isn't a checkbox value. Check or uncheck it.`,
    "field.date": (label) => `“${label}” isn't a valid date. Enter a date as YYYY-MM-DD.`,
    "field.list": (label) => `“${label}” isn't a list of text. Enter a list.`,
  },
};
