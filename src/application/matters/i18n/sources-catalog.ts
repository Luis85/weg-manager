import type { SourceFieldIssue, SourceKey, SourceKind } from "../../../domain/matters";
import type { IssueSentences } from "../../notes";

type Text = { readonly title: string; readonly detail: string };

/** The sentences of the one-line fields, from a language's `oneLine(label, max)`. */
export const sourceLineIssues = (oneLine: (label: string, max: number) => string) => ({
  "subject.invalid": (_: unknown, label: string) => oneLine(label, 120),
  "origin.invalid": (_: unknown, label: string) => oneLine(label, 100),
  "message-ref.invalid": (_: unknown, label: string) => oneLine(label, 300),
  "link.invalid": (_: unknown, label: string) => oneLine(label, 300),
});

/** The texts of the sources (PBI-11): the capture dialog and a matter's sources. */
export type SourcesCatalog = {
  readonly kinds: Readonly<Record<SourceKind, string>>;
  readonly fields: Readonly<Record<SourceKey, string>>;
  readonly missing: Partial<Readonly<Record<SourceKey, string>>>;
  readonly issues: IssueSentences<SourceFieldIssue>;
  /** The section in a matter's history panel. */
  readonly title: string;
  readonly none: string;
  readonly add: string;
  readonly form: {
    readonly title: string;
    readonly text: string;
    readonly textHint: string;
    readonly originHint: string;
    readonly linkHint: string;
    readonly pick: string;
    readonly pickHint: string;
    readonly copy: string;
    readonly move: string;
    readonly moveHint: string;
    readonly moveUnavailable: string;
    readonly targets: string;
    readonly save: string;
    readonly cancel: string;
  };
  /** A source in the list. */
  readonly openFile: string;
  openFileLabel(name: string): string;
  readonly missingFile: string;
  readonly noText: string;
  received(day: string): string;
  readonly error: Text;
};
