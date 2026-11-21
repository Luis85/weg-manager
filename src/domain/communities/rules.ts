import { Schema } from "effect";
import { COMMUNITY_KEYS, communityType, type CommunityKey } from "./community-type";

/** What the community form holds: the text of each field as typed. */
export type CommunityInput = { readonly [K in CommunityKey]: string };

/** The values a form saves: trimmed, blank as unset, the short code upper-case. */
export type CommunityDraft = { readonly [K in CommunityKey]: string | undefined };

/**
 * Why a community's field cannot be saved, or why its note breaks the contract: the codec's codes
 * (`field.missing` and one per field) and the uniqueness rules between communities.
 */
const CommunityIssueCode = Schema.Literals([
  "field.missing",
  "name.invalid",
  "short-code.invalid",
  "short-code.taken",
  "short-code.duplicate",
  "color.unknown",
  "color.taken",
  "kind.invalid",
  "unit-label.invalid",
]);
export type CommunityIssueCode = typeof CommunityIssueCode.Type;

/** One field's issue, language-free; the catalog words it with the field's label. */
export const CommunityFieldIssue = Schema.Struct({
  key: Schema.Literals(COMMUNITY_KEYS),
  code: CommunityIssueCode,
});
export type CommunityFieldIssue = typeof CommunityFieldIssue.Type;

/** What the rules need to know of another community: its valid short code and colour, if any. */
export type OtherCommunity = {
  readonly short_code?: string | undefined;
  readonly color?: string | undefined;
};

export type CommunityRuleContext = {
  /** Every other community; the one being edited is not among them. */
  readonly others: readonly OtherCommunity[];
  /**
   * The values the edited community had when the form loaded it. A value kept as it was is not
   * checked against the others, so a duplicate made outside the plugin does not block a save.
   */
  readonly loaded?: OtherCommunity;
};

/** The short code as stored: what the user typed, trimmed and upper-case. */
export const normalizeShortCode = (value: string): string => value.trim().toUpperCase();

const blankAsUnset = (value: string): string | undefined => {
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
};

/** The values a form saves from what it holds. */
export const communityValues = (input: CommunityInput): CommunityDraft => ({
  name: blankAsUnset(input.name),
  short_code: blankAsUnset(normalizeShortCode(input.short_code)),
  color: blankAsUnset(input.color),
  kind: blankAsUnset(input.kind),
  unit_label: blankAsUnset(input.unit_label),
});

/** Each short code that more than one of `communities` has. */
export const duplicateShortCodes = (
  communities: readonly OtherCommunity[],
): ReadonlySet<string> => {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const { short_code } of communities) {
    if (short_code === undefined) continue;
    if (seen.has(short_code)) duplicates.add(short_code);
    seen.add(short_code);
  }
  return duplicates;
};

/** The colours `others` use; the form disables them. */
export const colorsInUse = (others: readonly OtherCommunity[]): ReadonlySet<string> =>
  new Set(others.flatMap(({ color }) => (color === undefined ? [] : [color])));

/** Whether `value` is taken by another community, unless the edited one had it already. */
const taken = (
  key: "short_code" | "color",
  value: string | undefined,
  context: CommunityRuleContext,
): boolean =>
  value !== undefined &&
  value !== context.loaded?.[key] &&
  context.others.some((other) => other[key] === value);

/**
 * The rules a community must meet to be saved (PBI-56): the field rules of the note type, a short
 * code no other community has, and a colour no other community uses. At most one issue per field,
 * in file order. The form's validators and the use cases call it, so the rule lives only here.
 */
export const validateCommunity = (
  input: CommunityInput,
  context: CommunityRuleContext,
): readonly CommunityFieldIssue[] => {
  const draft = communityValues(input);
  const broken = new Map(communityType.check(draft).map((issue) => [issue.key, issue.code]));
  const issues: CommunityFieldIssue[] = [];
  for (const key of communityType.keys) {
    const code = broken.get(key);
    if (code !== undefined) issues.push({ key, code });
    else if (key === "short_code" && taken(key, draft[key], context)) {
      issues.push({ key, code: "short-code.taken" });
    } else if (key === "color" && taken(key, draft[key], context)) {
      issues.push({ key, code: "color.taken" });
    }
  }
  return issues;
};
