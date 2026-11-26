import { Effect, Result } from "effect";
import {
  BOARD_ACTOR,
  matterType,
  nextNumber,
  validateMerge,
  validateSplit,
  type HistoryEntry,
  type MergeKey,
  type SplitPart,
} from "../../domain/matters";
import { today } from "../shell";
import { InvalidMergeError, InvalidSplitError } from "./errors";
import { entryId, write } from "./history";
import { matterRecords, type Matter } from "./list";

/** A split as the dialog holds it (PBI-06). */
export type SplitInput = { readonly reason: string; readonly parts: readonly SplitPart[] };

/** The entry that closes a source: kind `split` or `merge`, status obsolete, the related matters. */
const closingEntry = (
  kind: "split" | "merge",
  reason: string,
  related: readonly string[],
  status: "obsolete" | undefined,
) =>
  Effect.gen(function* () {
    const day = yield* today;
    const entry: HistoryEntry = {
      id: yield* entryId,
      occurred_on: day,
      text: reason,
      kind,
      actor: BOARD_ACTOR,
      status,
      related,
      recorded_on: day,
    };
    return entry;
  });

/** The values of a new part: its own fields, the source's community, kind, topic and source. */
const partValues = (source: Matter, part: SplitPart, number: number) => {
  const { community_id, kind, topic, source: origin } = source.values;
  const due = part.due_on.trim();
  const draft = {
    number,
    community_id,
    kind,
    topic,
    outcome: part.outcome.trim(),
    responsible_id: part.responsible_id,
    ...(due === "" ? {} : { due_on: due }),
    status: part.status,
    source: origin,
    next_step: part.next_step.trim(),
    split_from_id: source.id,
  };
  const values = matterType.parse(draft);
  return Result.isSuccess(values)
    ? Effect.succeed(values.success)
    : Effect.die(new Error("validateSplit passed a part the matter type rejects."));
};

/**
 * Splits a collective matter into parts (PBI-06): each part a new matter with its own number,
 * outcome, due date or clarification status, responsible and next step, inheriting community,
 * kind, topic and source, with `split_from_id`; then the source becomes obsolete with
 * `split_into_ids` and a `split` entry naming the parts. Closing a part closes no other.
 */
export const splitMatter = (source: Matter, input: SplitInput) =>
  Effect.gen(function* () {
    const closed =
      source.values.split_into_ids !== undefined || source.values.merged_into_id !== undefined;
    const issues = closed
      ? [{ part: undefined, code: "split.closed" as const }]
      : validateSplit(input);
    if (issues.length > 0) return yield* Effect.fail(new InvalidSplitError({ issues }));
    const { records } = yield* matterRecords.list;
    let number = nextNumber(
      records.flatMap((row) => (row.values.number === undefined ? [] : [row.values.number])),
    );
    const ids: string[] = [];
    for (const part of input.parts) {
      const note = yield* matterRecords.create(yield* partValues(source, part, number));
      ids.push(String(note.frontmatter["id"]));
      number += 1;
    }
    const entry = yield* closingEntry("split", input.reason, ids, "obsolete");
    return yield* write(source, entry, {
      set: { status: "obsolete", split_into_ids: ids },
      remove: ["done_on"],
    });
  });

/** A merge as the dialog holds it (PBI-07): the reason and, per differing field, whose value. */
export type MergeInput = {
  readonly reason: string;
  readonly choices: Partial<Readonly<Record<MergeKey, "target" | "duplicate">>>;
};

/**
 * Merges a duplicate into its target (PBI-07): the target takes the duplicate's value of each
 * field the person chose so, gains the duplicate in `merged_from_ids` and a `merge` entry; the
 * duplicate becomes obsolete with `merged_into_id` and a `merge` entry naming the target. Each
 * history stays in its own note. Matters of different communities are never merged.
 */
export const mergeMatters = (target: Matter, duplicate: Matter, input: MergeInput) =>
  Effect.gen(function* () {
    const issues = validateMerge(
      { id: target.id, ...target.values },
      { id: duplicate.id, ...duplicate.values },
      input.reason,
    );
    if (issues.length > 0) return yield* Effect.fail(new InvalidMergeError({ issues }));
    const targetId = target.id ?? "";
    const duplicateId = duplicate.id ?? "";
    const taken: Record<string, unknown> = {};
    for (const [key, side] of Object.entries(input.choices)) {
      const value = duplicate.values[key as MergeKey];
      if (side === "duplicate" && value !== undefined) taken[key] = value;
    }
    const intoTarget = yield* closingEntry("merge", input.reason, [duplicateId], undefined);
    yield* write(target, intoTarget, {
      set: { ...taken, merged_from_ids: [...(target.values.merged_from_ids ?? []), duplicateId] },
      remove: [],
    });
    const intoDuplicate = yield* closingEntry("merge", input.reason, [targetId], "obsolete");
    return yield* write(duplicate, intoDuplicate, {
      set: { status: "obsolete", merged_into_id: targetId },
      remove: ["done_on"],
    });
  });
