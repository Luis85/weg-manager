import { Effect } from "effect";
import {
  communityType,
  communityValues,
  validateCommunity,
  type CommunityInput,
  type CommunityValues,
} from "../../domain/communities";
import { editedValues } from "../../domain/notes";
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

/** The values to save, or the issues why not. Every field is set once the rules pass. */
const checked = (
  input: CommunityInput,
  context: Parameters<typeof validateCommunity>[1],
): Effect.Effect<CommunityValues, InvalidCommunityError> => {
  const issues = validateCommunity(input, context);
  return issues.length > 0
    ? Effect.fail(new InvalidCommunityError({ issues }))
    : Effect.succeed(communityValues(input) as CommunityValues);
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
    yield* checked(fixed, { others: valuesOf(records), loaded });
    const draft = communityValues(fixed);
    const values = editedValues(communityType, fixed, draft, community.frontmatter);
    return yield* communityRecords.update(community, values as CommunityValues);
  });

/** Moves the community's note to Obsidian's trash; one renamed meanwhile is found by its id. */
export const deleteCommunity = communityRecords.remove;
