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
      detail:
        "The properties at the top of the note are malformed, so WEG Manager can't change them. Open the note, fix its properties, then save again.",
    },
    write: {
      title: "Note not saved",
      detail: "Obsidian couldn't write the note. Try again.",
    },
    trash: {
      title: "Note not deleted",
      detail: "Obsidian couldn't move the note to the trash. Try again.",
    },
    editConflict: {
      title: "Note changed while you were editing",
      detail:
        "The note was also changed outside this form, in fields you edited. Choose the value to keep for each, then save again.",
    },
    writeRefused: {
      title: "Can't save the note",
      detail: {
        "other-type":
          "The note is no longer a record of this type. Check its schema property in Obsidian.",
        "newer-version":
          "The note was saved by a newer version of WEG Manager in the meantime, for example on another device. Update WEG Manager, then open the note again.",
        identity:
          "The note's id was changed, so it now belongs to another record. Close the form and open it again.",
        "duplicate-id":
          "Another note has the same id, so it's unclear which one is meant. Delete the duplicate note in Obsidian, then try again.",
        "migration-failed":
          "The note couldn't be converted to the current version. Open the note and check its properties.",
        layout:
          "The note's properties are written in a form WEG Manager can't change without changing other lines too. In Obsidian, write each property on a line of its own as key: value between two --- lines, then save again.",
      },
    },
    indexRead: {
      title: "Couldn't read notes",
      detail: "Obsidian couldn't read every note, so the list may be incomplete. Try again.",
    },
  },
  openNote: {
    label: "Open in Obsidian",
    labelFor: (name) => `Open ${name} in Obsidian`,
  },
  conflict: {
    title: "Note changed while you were editing",
    detail:
      "These fields were also changed outside this form, for example on another device. Choose the value to keep for each, then save.",
    loaded: (value) => `When you opened it: ${value}`,
    mine: (value) => `Your entry: ${value}`,
    theirs: (value) => `Now in the note: ${value}`,
    apply: "Save choice",
    empty: "(empty)",
  },
  deletion: {
    detail: (name) => `“${name}” will be moved to Obsidian's trash, where you can restore it.`,
    confirm: "Move to trash",
    cancel: "Cancel",
  },
  dataIssues: {
    otherNotes: "Other WEG Manager notes",
  },
  notices: {
    created: (name) => `“${name}” created`,
    saved: (name) => `“${name}” saved`,
    deleted: (name) => `“${name}” moved to the trash`,
  },
  recordIssues: {
    "schema.malformed": () =>
      "The schema property is malformed, so the note is read-only. Open the note and fix its schema property.",
    "schema.newer": () =>
      "The note was saved by a newer version of WEG Manager, for example on another device, so it's read-only here. Update WEG Manager to edit it.",
    "migration.failed": () =>
      "The note couldn't be converted to the current version, so it's read-only. Open the note and check its properties.",
    "id.missing": () =>
      "The note has no id property, so it's read-only. Restore the id in Obsidian, for example from a backup.",
    "id.malformed": () =>
      "The note's id property isn't valid, so it's read-only. Restore the original id in Obsidian.",
    "id.other-type": () =>
      "The note's id belongs to another type, so it's read-only. Check schema and id in Obsidian.",
    "id.duplicate": ({ other }) =>
      `The note “${other}” has the same id, so both are read-only. Delete the duplicate note in Obsidian.`,
  },
  fieldIssues: {
    "field.missing": (label) => `“${label}” is missing. Enter a value.`,
    "field.text": (label) => `“${label}” isn't text. Enter text.`,
    "field.number": (label) => `“${label}” isn't a number. Enter a number.`,
    "field.checkbox": (label) => `“${label}” isn't a checkbox value. Check or uncheck it.`,
    "field.date": (label) => `“${label}” isn't a valid date. Enter a date as YYYY-MM-DD.`,
    "field.list": (label) => `“${label}” isn't a list of text. Enter a list.`,
  },
  unindexedIssues: {
    "schema.malformed": () =>
      "The schema property is malformed, so WEG Manager can't tell the note's type. Open the note and fix its schema property.",
    "schema.unknown-type": ({ type }) =>
      `The note is marked as type “${type}”, which this version of WEG Manager doesn't know. Update WEG Manager or fix the schema property in Obsidian.`,
    "frontmatter.unreadable": () =>
      "The properties at the top of the note are malformed, so WEG Manager can't read them. Open the note and fix its properties.",
  },
};
