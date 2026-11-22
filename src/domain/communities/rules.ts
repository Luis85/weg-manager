import { Schema } from "effect";
import { trimmedValues, type FormDraft, type FormInput } from "../notes";
import {
  COMMUNITY_COLORS,
  communityType,
  type CommunityColor,
  type CommunityFields,
} from "./community-type";

/** What the community form holds: the text of each field as typed. */
export type CommunityInput = FormInput<CommunityFields>;

/** The values a form saves: trimmed, blank as unset, the short code upper-case. */
export type CommunityDraft = FormDraft<CommunityFields>;

/** The issue codes whose sentence needs nothing but the field's label. */
const PlainIssueCode = Schema.Literals([
  "field.missing",
  "name.invalid",
  "short-code.invalid",
  "color.taken",
  "kind.invalid",
  "unit-label.invalid",
]);

/**
 * One field's issue, language-free; the catalog words it (ADR 0005: codes and data, never
 * sentences). Why a community's field cannot be saved, or why its note breaks the contract: the
 * codec's codes (`field.missing` and one per field) and the uniqueness rules between communities.
 * A short code that another community has carries that code (`value`) and the other community's
 * name (`other`); a colour that is no palette colour carries the saved text (`value`).
 */
export const CommunityFieldIssue = Schema.Union([
  Schema.Struct({ key: Schema.Literals(communityType.keys), code: PlainIssueCode }),
  Schema.Struct({
    key: Schema.Literal("short_code"),
    code: Schema.Literal("short-code.taken"),
    value: Schema.String,
    other: Schema.String,
  }),
  Schema.Struct({
    key: Schema.Literal("short_code"),
    code: Schema.Literal("short-code.duplicate"),
    value: Schema.String,
    other: Schema.String,
  }),
  Schema.Struct({
    key: Schema.Literal("color"),
    code: Schema.Literal("color.unknown"),
    value: Schema.String,
  }),
]);
export type CommunityFieldIssue = typeof CommunityFieldIssue.Type;

/**
 * What the rules need to know of another community: its valid short code and colour, if any, and
 * the name to show for it.
 */
export type OtherCommunity = {
  readonly name?: string | undefined;
  readonly short_code?: string | undefined;
  readonly color?: string | undefined;
};

export type CommunityRuleContext = {
  /**
   * The communities to compare with. The one being edited may be among them: its loaded values
   * are never checked (`loaded`).
   */
  readonly others: readonly OtherCommunity[];
  /**
   * The values the edited community had when the form loaded it. A value kept as it was is not
   * checked against the others, so a duplicate made outside the plugin does not block a save.
   */
  readonly loaded?: OtherCommunity | undefined;
};

/** The short code as stored: what the user typed, trimmed and upper-case. */
export const normalizeShortCode = (value: string): string => value.trim().toUpperCase();

/** The values a form saves from what it holds: every text trimmed, the short code upper-case. */
export const communityValues = (input: CommunityInput): CommunityDraft => {
  const values = trimmedValues(input);
  return { ...values, short_code: values.short_code?.toUpperCase() };
};

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

/**
 * The colours `others` use, each with the short code of the first community that uses it: the form
 * disables them and shows whose they are, so a taken colour does not rely on its shade alone.
 */
export const colorOwners = (
  others: readonly OtherCommunity[],
): ReadonlyMap<string, string | undefined> => {
  const owners = new Map<string, string | undefined>();
  for (const { color, short_code } of others) {
    if (color !== undefined && !owners.has(color)) owners.set(color, short_code);
  }
  return owners;
};

/** The first palette colour none of `others` uses: what a new community starts with. */
export const firstFreeColor = (others: readonly OtherCommunity[]): CommunityColor | undefined => {
  const owners = colorOwners(others);
  return COMMUNITY_COLORS.find((color) => !owners.has(color));
};

/** The other community that has `value` at `key`, unless the edited one had it already. */
const takenBy = (
  key: "short_code" | "color",
  value: string | undefined,
  context: CommunityRuleContext,
): OtherCommunity | undefined =>
  value === context.loaded?.[key]
    ? undefined
    : context.others.find((other) => other[key] === value);

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
    if (code === "color.unknown") issues.push({ key: "color", code, value: input.color.trim() });
    else if (code !== undefined) issues.push({ key, code });
    else if (key === "short_code") {
      const value = normalizeShortCode(input.short_code);
      const owner = takenBy(key, value, context);
      if (owner !== undefined) {
        issues.push({ key, code: "short-code.taken", value, other: owner.name ?? value });
      }
    } else if (key === "color" && takenBy(key, draft.color, context) !== undefined) {
      issues.push({ key, code: "color.taken" });
    }
  }
  return issues;
};
