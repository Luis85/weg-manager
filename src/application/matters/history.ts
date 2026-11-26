import { Effect, Result } from "effect";
import {
  BOARD_ACTOR,
  appendEntry,
  parseHistory,
  validateEntry,
  validateStatusChange,
  type EntryKind,
  type HistoryEntry,
  type MatterStatus,
} from "../../domain/matters";
import { IdGenerator, NoteStore, type FrontmatterPatch } from "../notes";
import { today } from "../shell";
import { InvalidHistoryEntryError, InvalidStatusChangeError } from "./errors";
import { matterRecords, type Matter } from "./list";

/** Where the matter's note is now: found by its id, so a note renamed meanwhile is found. */
const pathOf = (matter: Matter) =>
  Effect.map(
    matterRecords.list,
    ({ records }) =>
      records.find((row) => row.id !== undefined && row.id === matter.id)?.path ?? matter.path,
  );

/** The matter's history from its note's body, as the file holds it now (DV-03, PBI-12). */
export const matterHistory = (matter: Matter) =>
  Effect.gen(function* () {
    const path = yield* pathOf(matter);
    return parseHistory(yield* (yield* NoteStore).readBody(path));
  });

/** A short id for a new entry: the first part of a fresh UUID. */
const entryId = IdGenerator.use((ids) => ids.uuid).pipe(Effect.map((uuid) => uuid.slice(0, 8)));

/** A day the form holds: trimmed, blank as unknown. */
const dayOf = (text: string): string | undefined => (text.trim() === "" ? undefined : text.trim());

/** Writes `entry` into the history section, with `patch` on the frontmatter, in one write. */
const write = (matter: Matter, entry: HistoryEntry, patch: FrontmatterPatch) =>
  Effect.gen(function* () {
    const path = yield* pathOf(matter);
    return yield* (yield* NoteStore).update(
      path,
      () => Result.succeed(patch),
      (body, eol) => appendEntry(body, entry, eol),
    );
  });

/** What a person adds to the history by hand. */
export type EntryInput = {
  readonly kind: EntryKind;
  readonly text: string;
  readonly occurred_on: string;
  /** `board` or a contact's id. */
  readonly actor: string;
  readonly source: string;
  /** The id of the entry this one corrects. */
  readonly corrects?: string | undefined;
};

/**
 * Adds an entry to the matter's history (PBI-12): checked, recorded today with a fresh id, and
 * appended to the section; entries are never changed (owner decision 26.11.2026).
 */
export const addHistoryEntry = (matter: Matter, input: EntryInput) =>
  Effect.gen(function* () {
    const issues = validateEntry(input);
    if (issues.length > 0) return yield* Effect.fail(new InvalidHistoryEntryError({ issues }));
    const entry: HistoryEntry = {
      id: yield* entryId,
      occurred_on: dayOf(input.occurred_on),
      text: input.text,
      kind: input.kind,
      actor: input.actor,
      source: dayOf(input.source),
      corrects: input.corrects,
      recorded_on: yield* today,
    };
    return yield* write(matter, entry, { set: {}, remove: [] });
  });

/** A status change as the dialog holds it. */
export type StatusChangeInput = {
  readonly to: MatterStatus;
  readonly reason: string;
  readonly source: string;
  readonly done_on: string;
};

/**
 * Changes a matter's status with its reason (PBI-08): the status, the done day (set for done,
 * removed otherwise) and a `status_change` entry in one atomic write. A matter closed with a
 * source, reopened with a reason; a new due date or a partial delivery never does this by itself.
 */
export const changeStatus = (matter: Matter, input: StatusChangeInput) =>
  Effect.gen(function* () {
    const issues = validateStatusChange({ ...input, from: matter.values.status });
    if (issues.length > 0) return yield* Effect.fail(new InvalidStatusChangeError({ issues }));
    const day = yield* today;
    const done = input.to === "done" ? input.done_on.trim() : undefined;
    const entry: HistoryEntry = {
      id: yield* entryId,
      occurred_on: done ?? day,
      text: input.reason,
      kind: "status_change",
      actor: BOARD_ACTOR,
      status: input.to,
      source: dayOf(input.source),
      recorded_on: day,
    };
    const patch: FrontmatterPatch =
      done === undefined
        ? { set: { status: input.to }, remove: ["done_on"] }
        : { set: { status: input.to, done_on: done }, remove: [] };
    return yield* write(matter, entry, patch);
  });
