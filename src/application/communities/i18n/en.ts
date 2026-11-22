import { LABEL_MAX_LENGTH, NAME_MAX_LENGTH } from "../../../domain/communities";
import type { CommunitiesCatalog } from "./catalog";

const oneLine = (label: string, max: number) =>
  `Enter one line of at most ${max} characters for “${label}”.`;

/** English, sentence case as in Obsidian: first the cause, then the action. */
export const communitiesEn: CommunitiesCatalog = {
  route: "Communities",
  screen: {
    title: "Communities",
    intro: (folder) => `Each community is a note in the folder “${folder}”.`,
    add: "Add community",
    loading: "Loading communities…",
    empty:
      "Your communities appear here, such as a homeowners' association (WEG) and its underground car park.",
    edit: "Edit",
    remove: "Delete",
    editLabel: (name) => `Edit ${name}`,
    removeLabel: (name) => `Delete ${name}`,
    readOnly: "Read-only",
    selected: "Current",
    summary: (kind, unitLabel) => `${kind} (${unitLabel})`,
    otherNotes: "Other WEG Manager notes",
    openNote: "Open in Obsidian",
    openNoteLabel: (name) => `Open ${name} in Obsidian`,
  },
  fields: {
    name: "Name",
    short_code: "Short code",
    color: "Color",
    kind: "Kind",
    unit_label: "Unit label",
  },
  noShortCode: "?",
  shortCodeHint: "2–5 letters or digits, e.g. AW. Can't be changed later.",
  shortCodeFixed: "The short code can't be changed after creation.",
  unitLabelHelp: "What the units are called, e.g. units or parking spaces.",
  colors: {
    teal: "Teal",
    violet: "Violet",
    blue: "Blue",
    rust: "Rust red",
    slate: "Slate gray",
    cyan: "Cyan",
    pink: "Pink",
    olive: "Olive",
  },
  colorTaken: (color) => `${color}, already in use`,
  preview: "Preview",
  builtInKinds: [
    { kind: "WEG", unit_label: "Units" },
    { kind: "Underground car park", unit_label: "Parking spaces" },
  ],
  suggestions: "Suggestions:",
  suggestion: ({ kind, unit_label }) => `${kind} · ${unit_label}`,
  form: {
    createTitle: "New community",
    editTitle: "Edit community",
    save: "Save",
    cancel: "Cancel",
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
    title: "Delete community",
    detail: (name) => `“${name}” will be moved to Obsidian's trash, where you can restore it.`,
    confirm: "Move to trash",
    cancel: "Cancel",
  },
  switcher: {
    label: "Community",
    loading: "Loading…",
    choose: "Choose the community you work in.",
    none: "No community yet",
    unavailable:
      "No community can be chosen while its entries are wrong. Fix them under “Communities”.",
  },
  missing: {
    name: "Enter a name.",
    short_code: "Enter a short code.",
    color: "Choose a color.",
    kind: "Enter a kind or choose a suggestion.",
    unit_label: "Enter what the units are called.",
  },
  issues: {
    "name.invalid": (_, label) => oneLine(label, NAME_MAX_LENGTH),
    "short-code.invalid": () => "The short code needs 2–5 letters (A–Z) or digits.",
    "short-code.taken": ({ value, other }) =>
      `“${other}” already uses ${value}. Choose another short code.`,
    "short-code.duplicate": ({ value, other }) =>
      `“${other}” has the same short code ${value}. Give one of them a different short code.`,
    "color.unknown": ({ value }) => `The saved color “${value}” isn't available. Choose a color.`,
    "color.taken": () => "Another community already uses this color. Choose another one.",
    "kind.invalid": (_, label) => oneLine(label, LABEL_MAX_LENGTH),
    "unit-label.invalid": (_, label) => oneLine(label, LABEL_MAX_LENGTH),
  },
  notices: {
    created: (name) => `“${name}” created`,
    saved: (name) => `“${name}” saved`,
    deleted: (name) => `“${name}” moved to the trash`,
  },
  errors: {
    invalid: {
      title: "Community not saved",
      detail: "Some entries are missing or invalid. Fix the marked fields and save again.",
    },
  },
};
