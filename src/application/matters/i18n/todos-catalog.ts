import type { TodoFieldIssue, TodoGroup, TodoKey, TodoStatus } from "../../../domain/matters";
import type { IssueSentences } from "../../notes";

type Text = { readonly title: string; readonly detail: string };

/** The texts of the to-dos (PBI-10): the segment, the quick entry, the form and the groups. */
export type TodosCatalog = {
  /** The segment switch of the matters screen. */
  readonly segments: { readonly matters: string; readonly todos: string; readonly label: string };
  readonly intro: (folder: string) => string;
  readonly empty: string;
  readonly loading: string;
  readonly quick: {
    readonly label: string;
    readonly placeholder: string;
    readonly add: string;
  };
  readonly groups: Readonly<Record<TodoGroup, string>>;
  readonly statuses: Readonly<Record<TodoStatus, string>>;
  readonly fields: Readonly<Record<TodoKey, string>>;
  readonly missing: Partial<Readonly<Record<TodoKey, string>>>;
  readonly issues: IssueSentences<TodoFieldIssue>;
  readonly board: string;
  readonly noMatter: string;
  readonly edit: string;
  editLabel(title: string): string;
  readonly done: string;
  doneLabel(title: string): string;
  /** A card's lines. */
  due(day: string): string;
  followUp(day: string): string;
  responsible(name: string): string;
  reason(text: string): string;
  readonly form: {
    readonly createTitle: string;
    readonly editTitle: string;
    readonly save: string;
    readonly cancel: string;
    readonly choose: string;
    readonly statusHint: string;
  };
  /** The clarification list (PBI-10 criterion 4). */
  readonly clarification: {
    readonly title: string;
    readonly hint: string;
    readonly none: string;
    readonly add: string;
    addLabel(matter: string): string;
  };
  /** A matter's to-dos in its history panel. */
  readonly ofMatter: { readonly title: string; readonly none: string };
  readonly error: Text;
};
