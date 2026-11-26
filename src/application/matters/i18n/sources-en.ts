import { sourceLineIssues, type SourcesCatalog } from "./sources-catalog";

const oneLine = (label: string, max: number) =>
  `Enter one line of at most ${max} characters for "${label}".`;

/** English, sentence case: first the cause, then the action. */
export const sourcesEn: SourcesCatalog = {
  kinds: {
    mail: "Mail",
    letter: "Letter",
    portal: "Portal message",
    conversation: "Conversation",
    meeting: "Meeting",
    document: "Document",
    other: "Other",
  },
  fields: {
    subject: "Subject",
    kind: "Kind",
    community_id: "Community",
    matter_ids: "Matters",
    received_on: "Received on",
    origin: "Origin",
    message_ref: "Message id",
    link: "Source link",
    files: "Originals",
  },
  missing: {
    subject: "Enter a subject.",
    kind: "Choose a kind.",
    community_id: "Choose a community.",
    origin: 'Say where the source comes from, such as "mail from the manager".',
  },
  issues: {
    ...sourceLineIssues(oneLine),
    "kind.unknown": () => "The plugin does not know this kind. Choose one from the list.",
    "matter.other-community": () =>
      "A matter belongs to another community. Assign only matters of this community.",
  },
  title: "Sources",
  none: "No source for this matter yet.",
  add: "Capture source",
  form: {
    title: "Capture source",
    text: "Message text or conversation note",
    textHint: "Paste the text or write down what was said.",
    originHint: 'Who sent or said it to whom, such as "mail from the manager to the board".',
    linkHint: "A web address or a path in the vault.",
    pick: "Original files",
    pickHint: "You can pick several files, also from outside the vault.",
    copy: "Copy into the sources folder",
    move: "Move into the sources folder",
    moveHint: "The original outside is removed once the copy is in the vault.",
    moveUnavailable: "Moving works on the desktop only; the files are copied.",
    targets: "The files are filed as:",
    save: "Capture",
    cancel: "Cancel",
  },
  openFile: "Open in Obsidian",
  openFileLabel: (name) => `Open ${name} in Obsidian`,
  missingFile: "File missing",
  noText: "No text captured.",
  received: (day) => `received ${day}`,
  error: {
    title: "Source not captured",
    detail: "Some details are missing or do not fit. Correct the marked fields and capture again.",
  },
};
