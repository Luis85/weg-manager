import { isCalendarDate } from "../notes";
import type { MatterKey, MatterStatus } from "./matter-type";

/** One part of a split as the dialog holds it (PBI-06 criterion 2). */
export type SplitPart = {
  readonly outcome: string;
  readonly responsible_id: string;
  readonly due_on: string;
  readonly status: "open" | "unclear";
  readonly next_step: string;
};

/** Why a split cannot be made: of the whole (`part` undefined) or of one part by its index. */
export type SplitIssue = {
  readonly part: number | undefined;
  readonly code:
    | "reason.missing"
    | "parts.too-few"
    | "outcome.missing"
    | "responsible.missing"
    | "due-on.invalid"
    | "next-step.missing";
};

const blank = (text: string): boolean => text.replace(/\s+/g, " ").trim() === "";

/** The issues of one part: its own outcome, responsible, due date or none, and next step. */
const partIssues = (part: SplitPart, index: number): SplitIssue[] => {
  const codes: SplitIssue["code"][] = [];
  if (blank(part.outcome)) codes.push("outcome.missing");
  if (blank(part.responsible_id)) codes.push("responsible.missing");
  const day = part.due_on.trim();
  if (day !== "" && !isCalendarDate(day)) codes.push("due-on.invalid");
  if (blank(part.next_step)) codes.push("next-step.missing");
  return codes.map((code) => ({ part: index, code }));
};

/**
 * The rules of a split (PBI-06): a reason, at least two parts, and each part with its own outcome,
 * responsible, due date or none, and next step.
 */
export const validateSplit = (input: {
  readonly reason: string;
  readonly parts: readonly SplitPart[];
}): readonly SplitIssue[] => [
  ...(blank(input.reason) ? [{ part: undefined, code: "reason.missing" as const }] : []),
  ...(input.parts.length < 2 ? [{ part: undefined, code: "parts.too-few" as const }] : []),
  ...input.parts.flatMap(partIssues),
];

/** What the merge rule needs of a matter. */
type MergeSide = {
  readonly id: string | undefined;
  readonly community_id?: string | undefined;
  readonly status?: MatterStatus | undefined;
  readonly merged_into_id?: string | undefined;
};

/** Why two matters cannot be merged. */
export type MergeIssue =
  "merge.same-matter" | "merge.other-community" | "merge.already-merged" | "reason.missing";

/**
 * The rules of a merge (PBI-07): two different matters of one community (criterion 3), neither
 * merged already, and a reason.
 */
export const validateMerge = (
  target: MergeSide,
  duplicate: MergeSide,
  reason: string,
): readonly MergeIssue[] => {
  if (target.id === duplicate.id) return ["merge.same-matter"];
  if (target.community_id !== duplicate.community_id) return ["merge.other-community"];
  if (target.merged_into_id !== undefined || duplicate.merged_into_id !== undefined) {
    return ["merge.already-merged"];
  }
  return blank(reason) ? ["reason.missing"] : [];
};

/** The fields a merge compares and lets the person choose (PBI-07 criterion 1). */
export const MERGE_KEYS = [
  "kind",
  "topic",
  "outcome",
  "responsible_id",
  "promised_on",
  "due_on",
  "due_kind",
  "due_source",
  "due_checked",
  "follow_up_on",
  "source",
  "next_step",
  "message_ref",
  "link",
] as const satisfies readonly MatterKey[];
export type MergeKey = (typeof MERGE_KEYS)[number];

/** One field where the duplicate has a value the target lacks or holds differently. */
export type MergeConflict = {
  readonly key: MergeKey;
  readonly target: string | undefined;
  readonly duplicate: string;
};

/** The fields to choose between, in `MERGE_KEYS` order; the target's value is the default. */
export const mergeConflicts = (
  target: Partial<Record<MergeKey, string>>,
  duplicate: Partial<Record<MergeKey, string>>,
): readonly MergeConflict[] =>
  MERGE_KEYS.flatMap((key) => {
    const theirs = duplicate[key];
    const ours = target[key];
    return theirs === undefined || theirs === ours
      ? []
      : [{ key, target: ours, duplicate: theirs }];
  });
