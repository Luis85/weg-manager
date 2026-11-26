import type { MattersCatalog } from "./catalog";
import { lineIssues } from "./line-issues";

const oneLine = (label: string, max: number) =>
  `Enter one line of at most ${max} characters for "${label}".`;

/** English, sentence case: first the cause, then the action. */
export const mattersEn: MattersCatalog = {
  route: "Matters",
  screen: {
    title: "Matters",
    intro: (folder) => `Each matter is a note in the folder "${folder}".`,
    add: "Add matter",
    loading: "Loading matters …",
    empty: "Your matters appear here: each promise, deadline, question or task with one outcome.",
    edit: "Edit",
    editLabel: (name) => `Edit ${name}`,
    readOnly: "Read-only",
    search: "Search",
    allTopics: "All topics",
    allStatuses: "All statuses",
    allCommunities: "All communities",
    allResponsible: "Everyone responsible",
    shown: (count, total) => `${count} of ${total} matters`,
    noMatch: "No matter fits the search and the filters.",
    due: (day) => `due ${day}`,
    noDue: "no due date",
    followUp: (day) => `follow up ${day}`,
    responsible: (name) => `Who: ${name}`,
    nextStep: (step) => `Next step: ${step}`,
    sourceGap: "Source unknown",
  },
  fields: {
    number: "Number",
    community_id: "Community",
    kind: "Kind",
    topic: "Topic",
    outcome: "Expected outcome",
    responsible_id: "Who",
    promised_on: "Promised on",
    due_on: "Due on",
    follow_up_on: "Follow-up date",
    status: "Status",
    done_on: "Done on",
    source: "Source",
    next_step: "Next step",
    message_ref: "Message reference",
    link: "Link",
  },
  kinds: {
    manager_promise: "Manager's promise",
    third_party_promise: "Third party's promise",
    board_deadline: "Board deadline",
    legal_deadline: "Legal deadline",
    question: "Question",
    board_task: "Board task",
  },
  statuses: { open: "open", unclear: "unclear", done: "done", obsolete: "obsolete" },
  checkMarks: { overdue: "overdue", ask_for_date: "ask for a date" },
  form: {
    createTitle: "New matter",
    editTitle: "Edit matter",
    save: "Save",
    cancel: "Cancel",
    choose: "Please choose",
    numberHint: "The number is given when you save.",
    sourceHint: "Such as a mail, minutes, a meeting or a talk.",
    sourceUnknown: "Source unknown",
    followUpHint: "Your own date to look again. It changes no due date.",
    noContacts: 'Add a contact under "Contacts" first.',
    noCommunities: 'Add a community under "Settings" first.',
  },
  missing: {
    community_id: "Choose a community.",
    kind: "Choose a kind.",
    topic: "Enter a topic.",
    outcome: "Enter the expected outcome in one sentence.",
    responsible_id: "Choose who is responsible.",
    status: "Choose a status.",
    source: 'Enter a source or choose "Source unknown".',
    next_step: "Enter the next step.",
  },
  issues: {
    ...lineIssues(oneLine),
    "number.invalid": () => "The number must be a whole number from 1.",
    "number.taken": () => "Another matter has this number already. Choose another one.",
    "number.duplicate": () =>
      "Another matter has the same number, for example after a sync. Give one of them a new number.",
    "kind.unknown": () => "The plugin does not know this kind. Choose one from the list.",
    "status.unknown": () => "The plugin does not know this status. Choose one from the list.",
    "outcome.too-long": (_, label) =>
      `"${label}" makes a file name that is too long, because some characters take more space. Shorten the text.`,
    "done-on.missing": () => "A done matter needs the day it was done.",
    "done-on.not-done": () =>
      'A done day belongs only to a done matter. Clear the day or set the status to "done".',
  },
  errors: {
    invalid: {
      title: "Matter not saved",
      detail: "Some details are missing or do not fit. Correct the marked fields and save again.",
    },
  },
};
