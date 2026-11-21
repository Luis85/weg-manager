import type { NoteNameIssue } from "../../../domain/notes";

type Text = { readonly title: string; readonly detail: string };

/**
 * Every text of the notes module the user sees, for one language: the module's part of the app's
 * `Catalog` (`src/application/messages.ts`). Both languages are typed against it.
 */
export type NotesCatalog = {
  readonly errors: {
    readonly notFound: Text;
    readonly pathTaken: Text;
    readonly invalidName: {
      readonly title: string;
      readonly detail: Readonly<Record<NoteNameIssue, string>>;
    };
    readonly unreadable: Text;
    readonly write: Text;
  };
};
