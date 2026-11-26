import { Effect, Result } from "effect";
import { weekType, type WeekFields } from "../../domain/week";
import { NoteStore, defineRecords, type RecordRow } from "../notes";
import { WeekChangedError } from "./errors";

/** One week note as the screen shows it. */
export type WeekNote = RecordRow<WeekFields, never>;

/**
 * The week notes (ADR 0007, PBI-13): one per week, named and filed by its first day in
 * `<rootFolder>/Wochen/`. A week note is never deleted.
 */
const weekRecords = defineRecords({
  type: weekType,
  title: "week_of",
  fallbackName: () => "Woche",
  log: "weeks",
  issue: (issue) => issue as never,
});

/** The week notes now, for `useStream`. Never suspends. */
export const weekList = weekRecords.list;

/** The week notes: the current list first, then each change. */
export const weekListChanges = weekRecords.changes;

/** The briefing text of `week` as its note holds it now. */
export const weekText = (week: WeekNote) =>
  Effect.flatMap(NoteStore, (store) => store.readBody(week.path));

/** The note's body: the text with the note's line breaks, ending in one. */
const textBody = (text: string, eol: string) => `${text.trim().replace(/\r?\n/g, eol)}${eol}`;

/**
 * Saves the briefing text of the week from `weekOf` (PBI-13, owner decision 26.11.2026): a new
 * week note, or the body of `week` replaced, but only while it is still the text the form loaded
 * (`loaded`); otherwise `WeekChangedError` and nothing is written. The body is the briefing's.
 */
export const saveWeekText = (input: {
  readonly weekOf: string;
  readonly week: WeekNote | undefined;
  readonly loaded: string;
  readonly text: string;
}) =>
  Effect.gen(function* () {
    const store = yield* NoteStore;
    const path = input.week?.path ?? (yield* weekRecords.create({ week_of: input.weekOf })).path;
    let changed = false;
    const note = yield* store.update(
      path,
      () => Result.succeed({}),
      (body, eol) => {
        if (input.week !== undefined && body.trim() !== input.loaded.trim()) {
          changed = true;
          return body;
        }
        return textBody(input.text, eol);
      },
    );
    if (changed) return yield* Effect.fail(new WeekChangedError());
    return note;
  });
