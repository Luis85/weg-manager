import { LABEL_MAX_LENGTH, NAME_MAX_LENGTH } from "../../../domain/communities";
import type { CommunitiesCatalog } from "./catalog";

const oneLine = (label: string, max: number) =>
  `“${label}” is blank, longer than ${max} characters or more than one line. Enter one line of at most ${max} characters.`;

/** English, sentence case as in Obsidian: first the cause, then the action. */
export const communitiesEn: CommunitiesCatalog = {
  route: "Communities",
  screen: {
    title: "Communities",
    intro: (folder) => `Each community is a note in the folder “${folder}”.`,
    add: "Add community",
    loading: "Loading communities …",
    empty: "Your communities appear here, such as a WEG and its underground car park.",
    edit: "Edit",
    remove: "Delete",
    editLabel: (name) => `Edit ${name}`,
    removeLabel: (name) => `Delete ${name}`,
    readOnly: "Read-only",
    summary: (kind, unitLabel) => `${kind} · ${unitLabel}`,
    problems: "Notes with problems",
  },
  fields: {
    name: "Name",
    short_code: "Short code",
    color: "Color",
    kind: "Kind",
    unit_label: "Unit label",
  },
  shortCodeHint: "2 to 5 characters from A–Z and 0–9, fixed once created.",
  shortCodeFixed: "The short code is fixed once created.",
  colors: {
    teal: "Teal",
    violet: "Violet",
    blue: "Blue",
    rust: "Rust",
    slate: "Slate",
    cyan: "Cyan",
    pink: "Pink",
    olive: "Olive",
  },
  colorTaken: (color) => `${color}, already taken`,
  builtInKinds: [
    { kind: "WEG", unit_label: "Units" },
    { kind: "Underground car park", unit_label: "Parking spaces" },
  ],
  suggestions: "Suggestions",
  suggestion: ({ kind, unit_label }) => `${kind} · ${unit_label}`,
  form: {
    createTitle: "New community",
    editTitle: "Edit community",
    save: "Save",
    cancel: "Cancel",
  },
  conflict: {
    title: "Note changed meanwhile",
    detail:
      "These fields were also changed outside the form. Choose the value that applies for each field, then save.",
    loaded: (value) => `When opened: ${value}`,
    mine: "Your input",
    theirs: "In the note",
    apply: "Save choice",
    empty: "(empty)",
  },
  deletion: {
    title: "Delete community",
    detail: (name) => `“${name}” goes to the trash you set in Obsidian.`,
    confirm: "Delete",
    cancel: "Cancel",
  },
  switcher: {
    label: "Community",
    choose: "Choose the community you work in.",
    none: "No community yet",
  },
  issues: {
    "name.invalid": (label) => oneLine(label, NAME_MAX_LENGTH),
    "short-code.invalid": (label) =>
      `“${label}” isn't 2 to 5 characters from A–Z and 0–9. Enter such a short code.`,
    "short-code.taken": () => "Another community already has this short code. Choose another one.",
    "short-code.duplicate": () =>
      "Another community has the same short code. Give one of them another one.",
    "color.unknown": (label) => `“${label}” isn't a color of the palette. Choose a color.`,
    "color.taken": () => "Another community already uses this color. Choose another one.",
    "kind.invalid": (label) => oneLine(label, LABEL_MAX_LENGTH),
    "unit-label.invalid": (label) => oneLine(label, LABEL_MAX_LENGTH),
  },
  errors: {
    invalid: {
      title: "Community not saved",
      detail: "Some entries break the rules. Correct the marked fields and save again.",
    },
  },
};
