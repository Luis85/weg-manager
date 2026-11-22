import { Effect, Result } from "effect";
import {
  communityType,
  communityValues,
  validateCommunity,
  type CommunityInput,
  type CommunityValues,
} from "../../domain/communities";
import { editedValues, type FormDraft } from "../../domain/notes";
import { InvalidCommunityError } from "./errors";
import { canChangeShortCode, communityRecords, shownName, type Community } from "./list";

/** The communities now, for `useStream`. Never suspends. */
export const communityList = communityRecords.list;

/** The communities: the current list first, then each change. */
export const communityListChanges = communityRecords.changes;

/**
 * Every community's valid values and shown name: what the uniqueness rules compare with and name.
 * The edited community is among them; the rules never check its loaded values against anything.
 */
const valuesOf = (communities: readonly Community[]) =>
  communities.map((c) => ({ ...c.values, name: shownName(c) }));

/**
 * The values to save (`draft`, by default what the form holds), or the issues why not. Once the
 * rules pass, the community type reads every field (`parse`); a value the rules let through and
 * the type rejects would be a bug in the rules, so it is a defect, not the user's failure.
 */
const checked = (
  input: CommunityInput,
  context: Parameters<typeof validateCommunity>[1],
  draft: FormDraft<typeof communityType.fields> = communityValues(input),
): Effect.Effect<CommunityValues, InvalidCommunityError> => {
  const issues = validateCommunity(input, context);
  if (issues.length > 0) return Effect.fail(new InvalidCommunityError({ issues }));
  const values = communityType.parse(draft);
  return Result.isSuccess(values)
    ? Effect.succeed(values.success)
    : Effect.die(new Error("validateCommunity passed values the community type rejects."));
};

/**
 * Creates a community (PBI-56): checks the rules against the other communities, then writes a note
 * named after it into `<rootFolder>/Gemeinschaften/`, with a fresh id and an empty body. A taken
 * file name gets ` (2)`. The view follows through the index.
 */
export const createCommunity = (input: CommunityInput) =>
  Effect.gen(function* () {
    const { records } = yield* communityList;
    const values = yield* checked(input, { others: valuesOf(records) });
    return yield* communityRecords.create(values);
  });

/**
 * Saves the form of `community` (as it was loaded) with `input` (PBI-56, ADR 0007). The rules run
 * against the other communities; the short code stays as loaded unless it may be repaired
 * (`canChangeShortCode`). A field left as loaded keeps the note's value as written, not even
 * trimmed (`editedValues`). The record kit then merges per field with an outside edit and lets the
 * file follow the name, as one command.
 */
export const updateCommunity = (community: Community, input: CommunityInput) =>
  Effect.gen(function* () {
    const { records } = yield* communityList;
    const loaded = community.values;
    const fixed = canChangeShortCode(community)
      ? input
      : { ...input, short_code: loaded.short_code ?? input.short_code };
    const edited = editedValues(
      communityType,
      fixed,
      communityValues(fixed),
      community.frontmatter,
    );
    const values = yield* checked(fixed, { others: valuesOf(records), loaded }, edited);
    return yield* communityRecords.update(community, values);
  });

/** Moves the community's note to Obsidian's trash; one renamed meanwhile is found by its id. */
export const deleteCommunity = communityRecords.remove;
