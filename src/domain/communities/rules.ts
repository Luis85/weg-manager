import { Schema } from "effect";
import type { Frontmatter } from "../notes";
import {
  COMMUNITY_COLORS,
  COMMUNITY_KEYS,
  communityType,
  type CommunityColor,
  type CommunityKey,
} from "./community-type";

/** What the community form holds: the text of each field as typed. */
export type CommunityInput = { readonly [K in CommunityKey]: string };

/** The values a form saves: trimmed, blank as unset, the short code upper-case. */
export type CommunityDraft = { readonly [K in CommunityKey]: string | undefined };

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
  Schema.Struct({ key: Schema.Literals(COMMUNITY_KEYS), code: PlainIssueCode }),
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

/**
 * The values an edit saves (DV-01: only the fields the person changed are written). A field whose
 * input is still the text the form loaded keeps the note's value as written, surrounding spaces
 * included, while that value is valid; every other field is what `communityValues` makes of it,
 * so a broken value the form shows is repaired by a save.
 */
export const editedValues = (input: CommunityInput, loaded: Frontmatter): CommunityDraft => {
  const draft = communityValues(input);
  const broken = new Set(communityType.check(loaded).map((issue) => issue.key));
  const kept = (key: CommunityKey): string | undefined => {
    const value = loaded[key];
    return value === input[key] && !broken.has(key) ? value : draft[key];
  };
  return {
    name: kept("name"),
    short_code: kept("short_code"),
    color: kept("color"),
    kind: kept("kind"),
    unit_label: kept("unit_label"),
  };
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
    const value = draft[key] ?? "";
    if (code === "color.unknown") issues.push({ key: "color", code, value });
    else if (code !== undefined) issues.push({ key, code });
    else if (key === "short_code") {
      const owner = takenBy(key, value, context);
      if (owner !== undefined) {
        issues.push({ key, code: "short-code.taken", value, other: owner.name ?? value });
      }
    } else if (key === "color" && takenBy(key, value, context) !== undefined) {
      issues.push({ key, code: "color.taken" });
    }
  }
  return issues;
};
