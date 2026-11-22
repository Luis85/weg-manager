import { Effect, Result, Stream } from "effect";
import {
  MAX_NAME_ATTEMPTS,
  clashName,
  followsTitle,
  recordFileName,
  type FieldDeclaration,
  type NoteFields,
  type NoteType,
  type RecordFieldIssue,
  type RecordValues,
} from "../../domain/notes";
import { Logger, Messages, Notifier, SettingsService } from "../shell";
import { NoteWriteRefusedError } from "./errors";
import { recordFolder } from "./folders";
import type { NotesCatalog } from "./i18n/catalog";
import { noteChanges, noteSnapshot } from "./index-use-cases";
import { NoteStore, type Note } from "./ports";
import {
  fileNameOf,
  recordRows,
  type KeyedIssue,
  type RecordRow,
  type RowRules,
} from "./record-list";
import { editChange, newRecordFrontmatter } from "./records";

/** The keys of the required text fields of `F`: what can name a record. */
export type TitleKey<F extends NoteFields> = {
  [K in keyof F & string]: F[K] extends FieldDeclaration<string, string, true> ? K : never;
}[keyof F & string];

/** What a feature says about its records; `defineRecords` turns it into lists and writes. */
export type RecordKind<F extends NoteFields, Issue extends KeyedIssue> = RowRules<F, Issue> & {
  /** The note type; its `folder` is where new records go, below the root folder. */
  readonly type: NoteType<F>;
  /** The required text field that names a record: its file name, its place in a list, notices. */
  readonly title: TitleKey<F>;
  /** The file name when the title leaves nothing usable: a value that is never blank. */
  readonly fallbackName: (values: RecordValues<F>) => string;
  /** The first part of the module's log events (`<log>.rename.failed`). */
  readonly log: string;
};

/**
 * Confirms a write with a short notice through the `Notifier` (handoff: a toast only confirms a
 * short-lived success; failures stay at the form). The title says it all.
 */
const confirm = (title: (notices: NotesCatalog["notices"]) => string) =>
  Effect.gen(function* () {
    const { notes } = yield* Messages;
    yield* (yield* Notifier).notify({ severity: "info", title: title(notes.notices), detail: "" });
  });

/**
 * Gives the note the file name `target`; a taken name gets ` (2)`, ` (3)`, … up to the hundredth.
 * A rename that fails keeps the note where it is and is logged (`<log>.rename.failed`, no data):
 * the record is saved, and the file name is only for people. The note it returns is the one just
 * written at the path of the rename: `NoteStore.rename` gives the frontmatter as the store reads
 * it after the move, which in Obsidian can still be the state before the save.
 */
const renameTo = (note: Note, target: string, log: string) =>
  Effect.gen(function* () {
    const store = yield* NoteStore;
    for (let attempt = 1; attempt <= MAX_NAME_ATTEMPTS; attempt += 1) {
      const renamed = yield* Effect.result(store.rename(note.path, clashName(target, attempt)));
      if (Result.isSuccess(renamed)) return { ...note, path: renamed.success.path };
      if (renamed.failure._tag !== "NotePathTakenError") break;
    }
    yield* (yield* Logger).log({ level: "warn", event: `${log}.rename.failed` });
    return note;
  });

/**
 * The records of one note type as a feature uses them (ADR 0007): the list a view follows, and
 * create, update and delete through `NoteStore`, each confirmed by a notice. The feature checks
 * its own rules first and hands over valid values; this does the rest the same for every record:
 *
 * - `create(values)`: a fresh id, the note named after its title in `<rootFolder>/<folder>/`; a
 *   taken file name gets ` (2)`.
 * - `update(row, values)`: the per-field merge with an outside edit inside the atomic write
 *   (`editChange`), then the file follows the title while it still carries the old one
 *   (`followsTitle`); save and rename run as one uninterruptible command.
 * - `remove(row)`: to Obsidian's trash.
 *
 * Update and delete find a note renamed meanwhile by its id; while another note carries the same
 * id, both are read-only and the write is refused (`duplicate-id`) rather than guessing which note
 * the form loaded. A note that is gone is `NoteNotFoundError`.
 */
export const defineRecords = <F extends NoteFields, Issue extends KeyedIssue = RecordFieldIssue<F>>(
  kind: RecordKind<F, Issue>,
) => {
  type Row = RecordRow<F, Issue>;
  const { type, title, log } = kind;
  const { shownName, toList } = recordRows(kind);
  const titleOf = (values: RecordValues<F>) => values[title] as string;

  /** The list now, for `useStream`. Never suspends. */
  const list = Effect.map(noteSnapshot(type), toList);
  /** The list: the current one first, then each change. */
  const changes = Stream.map(noteChanges(type), toList);

  /** Where the record lives now: by its id, and refused while another note carries the id too. */
  const pathOf = (row: Row) =>
    Effect.flatMap(noteSnapshot(type), ({ byId }) => {
      const found = row.id === undefined ? undefined : byId.get(row.id);
      return found?.issues.some((issue) => issue.code === "id.duplicate")
        ? Effect.fail(new NoteWriteRefusedError({ reason: "duplicate-id" }))
        : Effect.succeed(found?.path ?? row.path);
    });

  /** The file follows a new title while it carries the old one; a name the user gave it stays. */
  const followTitle = (note: Note, before: Row, values: RecordValues<F>) => {
    const old = before.values[title] as string | undefined;
    if (old === undefined || old === titleOf(values)) return Effect.succeed(note);
    // The fallback the old file name was made with: the note's own value, else the new one.
    const fallback = kind.fallbackName({ ...values, ...before.values });
    if (!followsTitle(fileNameOf(note.path), old, fallback)) return Effect.succeed(note);
    return renameTo(note, recordFileName(titleOf(values), kind.fallbackName(values)), log);
  };

  const create = (values: RecordValues<F>) =>
    Effect.gen(function* () {
      const { rootFolder } = yield* (yield* SettingsService).current;
      const frontmatter = yield* newRecordFrontmatter(type, values);
      const note = yield* (yield* NoteStore).create({
        folder: recordFolder(rootFolder, type),
        name: recordFileName(titleOf(values), kind.fallbackName(values)),
        frontmatter,
      });
      yield* confirm((notices) => notices.created(titleOf(values)));
      return note;
    });

  const update = (row: Row, values: RecordValues<F>) =>
    Effect.gen(function* () {
      const path = yield* pathOf(row);
      const store = yield* NoteStore;
      // One command: an unload while the save is written still lets the file follow the title.
      const note = yield* Effect.uninterruptible(
        Effect.flatMap(store.update(path, editChange(type, row.frontmatter, values)), (written) =>
          followTitle(written, row, values),
        ),
      );
      yield* confirm((notices) => notices.saved(titleOf(values)));
      return note;
    });

  const remove = (row: Row) =>
    Effect.gen(function* () {
      const path = yield* pathOf(row);
      yield* NoteStore.use((store) => store.trash(path));
      yield* confirm((notices) => notices.deleted(shownName(row)));
    });

  return { type, toList, list, changes, shownName, create, update, remove };
};
