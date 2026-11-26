import { Effect, Result } from "effect";
import { communityList } from "../communities";
import {
  NO_SHORT_CODE_FOLDER,
  fileLink,
  filedName,
  linkedPath,
  sourceType,
  sourceValues,
  validateSource,
  type SourceFieldIssue,
  type SourceFields,
  type SourceInput,
  type SourceKind,
} from "../../domain/matters";
import type { MissingReference, RecordIssue } from "../../domain/notes";
import {
  LocalFiles,
  NoteStore,
  VaultFiles,
  defineRecords,
  recordFolder,
  type PickedFile,
  type RecordRow,
} from "../notes";
import { SettingsService, today } from "../shell";
import { InvalidSourceError } from "./errors";
import { matterCommunities } from "./list";

/** An issue of a source field: the codec's, the rules', or a missing community or matter. */
export type SourceIssue =
  SourceFieldIssue | (MissingReference & { readonly key: "community_id" | "matter_ids" });

/** An issue of a source note: of the note as a whole, or of one field (by key). */
export type SourceNoteIssue = RecordIssue | SourceIssue;

/** One source note as the screen shows it. */
export type Source = RecordRow<SourceFields, SourceIssue>;

/** The newest day first; one without a day last. */
const byDay = (a: Source, b: Source): number =>
  (b.values.received_on ?? "").localeCompare(a.values.received_on ?? "");

/**
 * The source records (ADR 0007, PBI-11): named and filed by their subject in `<rootFolder>/
 * Quellen/`, the newest first. A source is never deleted; its originals stay unchanged.
 */
const sourceRecords = defineRecords({
  type: sourceType,
  title: "subject",
  fallbackName: () => "Quelle",
  log: "sources",
  issue: (issue): SourceIssue => issue as SourceIssue,
  between: (sources) => sources.toSorted(byDay),
});

/** The sources now, for `useStream`. Never suspends. */
export const sourceList = sourceRecords.list;

/** The sources: the current list first, then each change. */
export const sourceListChanges = sourceRecords.changes;

/** What a capture needs to place its originals: the community, the kind, the subject, the day. */
export type Filing = {
  readonly community_id: string;
  readonly kind: SourceKind;
  readonly subject: string;
  readonly received_on: string;
};

/** Where the originals of a source go: `<rootFolder>/Quellen/<short code>/`. */
const folderOf = (community: string) =>
  Effect.gen(function* () {
    const { rootFolder } = yield* (yield* SettingsService).current;
    const { records } = yield* communityList;
    const code =
      records.find((each) => each.id === community)?.values.short_code ?? NO_SHORT_CODE_FOLDER;
    return `${recordFolder(rootFolder, sourceType)}/${code}`;
  });

/** The filed names of `files` on `day` (WCS filing rule). */
const filedNames = (filing: Filing, day: string, files: readonly { readonly name: string }[]) =>
  files.map((file) => filedName(day, filing.kind, filing.subject.trim(), file.name));

/** The day of a capture: the day it was received, else today. */
const dayOf = (filing: Filing) =>
  filing.received_on.trim() === "" ? today : Effect.succeed(filing.received_on.trim());

/**
 * The vault paths the originals `files` would get (PBI-11 criterion 5), shown before saving: in
 * the community's sources folder, named by the filing rule, never over a file that is there.
 */
export const plannedPaths = (filing: Filing, files: readonly { readonly name: string }[]) =>
  Effect.gen(function* () {
    if (files.length === 0 || filing.community_id === "") return [];
    const folder = yield* folderOf(filing.community_id);
    const names = filedNames(filing, yield* dayOf(filing), files);
    const store = yield* VaultFiles;
    const planned: string[] = [];
    // One after another, as the capture writes them: each planned path counts as taken.
    for (const name of names) planned.push(yield* store.freePath(folder, name, planned));
    return planned;
  });

/** Whether every picked file can be moved, not only copied: on the desktop, with a path. */
export const canMove = (files: readonly PickedFile[]) =>
  Effect.flatMap(LocalFiles, (local) =>
    Effect.map(
      Effect.forEach(files, (file) => local.movable(file)),
      (each) => each.length > 0 && each.every(Boolean),
    ),
  );

/** A capture as the dialog holds it (PBI-11). */
export type Capture = {
  readonly input: SourceInput;
  /** The message text or the note of a conversation: the note's body. */
  readonly text: string;
  readonly files: readonly PickedFile[];
  /** Move the originals into the vault instead of copying them (desktop only). */
  readonly move: boolean;
};

/** The body of a new source: the text with the note's line breaks, ending in one. */
const bodyOf = (text: string) => (_body: string, eol: string) =>
  `${text.trim().replace(/\r?\n/g, eol)}${eol}`;

/**
 * Captures a source (PBI-11): the rules, then each original copied into the community's sources
 * folder (never over another file), the note with its links and the text, and, for a move, each
 * original outside the vault removed once everything is written. A failed removal is
 * `LocalFileRemoveError`: the source and its copies stay. No mail connector is involved.
 */
export const captureSource = (capture: Capture) =>
  Effect.gen(function* () {
    const issues = validateSource(capture.input, { matterCommunities: yield* matterCommunities });
    if (issues.length > 0) return yield* Effect.fail(new InvalidSourceError({ issues }));
    const draft = sourceValues(capture.input);
    const filing = capture.input as unknown as Filing;
    const folder = yield* folderOf(filing.community_id);
    const names = filedNames(filing, yield* dayOf(filing), capture.files);
    const store = yield* VaultFiles;
    const links: string[] = [];
    for (const [index, file] of capture.files.entries()) {
      links.push(fileLink(yield* store.write(folder, names[index] ?? file.name, file.bytes)));
    }
    const values = sourceType.parse({ ...draft, files: [...(draft.files ?? []), ...links] });
    if (Result.isFailure(values)) {
      return yield* Effect.die(new Error("validateSource passed values the source type rejects."));
    }
    const note = yield* sourceRecords.create(values.success);
    if (capture.text.trim() !== "") {
      yield* (yield* NoteStore).update(note.path, () => Result.succeed({}), bodyOf(capture.text));
    }
    if (capture.move) {
      const local = yield* LocalFiles;
      yield* Effect.forEach(capture.files, (file) => local.remove(file), { discard: true });
    }
    return note;
  });

const IMAGE = /\.(png|jpe?g|gif|webp|svg|bmp|avif)$/i;

/** An original of a source as the matter's file shows it (criterion 6). */
type SourceFile = {
  readonly path: string;
  readonly name: string;
  readonly missing: boolean;
  /** Where the view shows an image from; none for another file or a missing one. */
  readonly image: string | undefined;
};

/** The originals of `source`, each with whether it is there and, for an image, its address. */
export const sourceFiles = (source: Source) =>
  Effect.gen(function* () {
    const store = yield* VaultFiles;
    return yield* Effect.forEach(source.values.files ?? [], (entry) =>
      Effect.gen(function* () {
        const path = linkedPath(entry);
        const url = yield* store.resourceUrl(path);
        const file: SourceFile = {
          path,
          name: path.slice(path.lastIndexOf("/") + 1),
          missing: url === undefined,
          image: url !== undefined && IMAGE.test(path) ? url : undefined,
        };
        return file;
      }),
    );
  });

/** The message text of `source`: its note's body as the file holds it. */
export const sourceText = (source: Source) =>
  Effect.flatMap(NoteStore, (store) => store.readBody(source.path));

/** Opens an original in a new Obsidian tab. */
export const openSourceFile = (path: string) =>
  Effect.flatMap(VaultFiles, (store) => store.open(path));
