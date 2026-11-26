import type { DeadlineState, SentenceCode } from "../../../domain/week";

type Text = { readonly title: string; readonly detail: string };

/**
 * Every text of the week module the user sees, for one language: the module's part of the app's
 * `Catalog` (`src/application/messages.ts`). Both languages are typed against it.
 */
export type WeekCatalog = {
  /** The frame's navigation entry of the week screen. */
  readonly route: string;
  readonly screen: {
    title(weekOf: string): string;
    readonly intro: string;
    /** When the briefing was computed: on opening, never by a background run (K-04). */
    computed(day: string, time: string): string;
    timeTarget(minutes: number): string;
    readonly loading: string;
  };
  readonly briefing: {
    readonly title: string;
    readonly computedTitle: string;
    readonly savedTitle: string;
    readonly edit: string;
    readonly editTitle: string;
    readonly hint: string;
    readonly save: string;
    readonly cancel: string;
    /** One sentence per code: its count and the records it names. */
    readonly sentences: Readonly<Record<SentenceCode, (count: number, refs: string) => string>>;
  };
  readonly deadlines: {
    readonly title: string;
    readonly none: string;
    readonly states: Readonly<Record<DeadlineState, string>>;
  };
  readonly todos: { readonly title: string; readonly none: string };
  readonly coverage: {
    readonly title: string;
    sources(count: number, thisWeek: number): string;
    unchecked(count: number): string;
    withoutSource(count: number): string;
    withoutDate(count: number): string;
    readonly noGaps: string;
    /** That no mailbox is read: the sources are what was captured (DF-08). */
    readonly scope: string;
  };
  readonly errors: { readonly changed: Text };
};
