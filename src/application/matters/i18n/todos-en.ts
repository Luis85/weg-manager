import type { TodosCatalog } from "./todos-catalog";

const oneLine = (label: string) => `Enter one line of at most 300 characters for "${label}".`;

/** English, sentence case: first the cause, then the action. */
export const todosEn: TodosCatalog = {
  segments: { matters: "Matters", todos: "To-dos", label: "Matters or to-dos" },
  intro: (folder) =>
    `Each to-do is a note in the folder "${folder}". It fulfils no one else's promise.`,
  empty: "Your own steps appear here: what you do, apart from other people's promises.",
  loading: "Loading to-dos …",
  quick: {
    label: "New to-do",
    placeholder: "What needs doing?",
    add: "Add",
  },
  groups: { overdue: "Overdue", week: "This week", later: "Later", closed: "Done and dropped" },
  statuses: { open: "open", waiting: "waiting", done: "done", dropped: "dropped" },
  fields: {
    title: "What needs doing",
    community_id: "Community",
    matter_id: "Matter",
    responsible: "Who",
    status: "State",
    due_on: "Due on",
    follow_up_on: "Follow-up",
    reason: "Reason",
  },
  missing: {
    title: "Describe the step in one line.",
    community_id: "Choose a community.",
    responsible: "Choose who does the step.",
    status: "Choose a state.",
  },
  issues: {
    "title.invalid": (_, label) => oneLine(label),
    "reason.invalid": (_, label) => oneLine(label),
    "responsible.invalid": () => "Choose the board or a contact from the list.",
    "status.unknown": () => "The plugin does not know this state. Choose one from the list.",
    "reason.missing": () => "Give the reason: what you are waiting for or why the step is dropped.",
    "follow-up.missing": () => "Say when you will look again.",
    "matter.other-community": () =>
      "The matter belongs to another community. Choose a matter of this community.",
  },
  board: "Board",
  noMatter: "no matter",
  edit: "Edit",
  editLabel: (title) => `Edit ${title}`,
  done: "Done",
  doneLabel: (title) => `Mark ${title} as done`,
  due: (day) => `due ${day}`,
  followUp: (day) => `follow-up ${day}`,
  responsible: (name) => `Who: ${name}`,
  reason: (text) => `Reason: ${text}`,
  form: {
    createTitle: "Add to-do",
    editTitle: "Edit to-do",
    save: "Save",
    cancel: "Cancel",
    choose: "Please choose",
    statusHint: "Waiting needs a reason and a follow-up date, dropping a reason.",
  },
  clarification: {
    title: "To clarify",
    hint: "Open matters whose next step no open or waiting to-do carries.",
    none: "Every open matter has a to-do.",
    add: "Add to-do",
    addLabel: (matter) => `Add a to-do for ${matter}`,
  },
  ofMatter: { title: "To-dos", none: "No to-do for this matter yet." },
  error: {
    title: "To-do not saved",
    detail: "Some details are missing or do not fit. Correct the marked fields and save again.",
  },
};
