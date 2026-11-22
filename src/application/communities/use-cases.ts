import { Effect, Result, Stream } from "effect";
import {
  communityFileName,
  communityType,
  communityValues,
  followsName,
  validateCommunity,
  type CommunityInput,
  type CommunityValues,
} from "../../domain/communities";
import { clashName } from "../../domain/notes";
import {
  NoteStore,
  editChange,
  newRecordFrontmatter,
  noteChanges,
  noteSnapshot,
  type Note,
} from "../notes";
import { Logger, SettingsService } from "../shell";
import { InvalidCommunityError } from "./errors";
import { canChangeShortCode, fileNameOf, toCommunityList, type Community } from "./list";

/**
 * The folder below the root folder where new community notes go. Part of the file contract, so it
 * is German in every UI language (ADR 0007): a vault is shared between devices.
 */
export const COMMUNITIES_FOLDER = "Gemeinschaften";

/** How many file names a rename tries: the name, then ` (2)` up to ` (100)`, as `create` does. */
const RENAME_ATTEMPTS = 100;

/** The communities now, for `useStream`. Never suspends. */
export const communityList = Effect.map(noteSnapshot(communityType), toCommunityList);

/** The communities: the current list first, then each change. */
export const communityListChanges = Stream.map(noteChanges(communityType), toCommunityList);

/**
 * Every community's valid values: what the uniqueness rules compare with. The edited community is
 * among them; the rules never check its loaded values against anything.
 */
const valuesOf = (communities: readonly Community[]) => communities.map((c) => c.values);

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
    const { communities } = yield* communityList;
    const values = yield* checked(input, { others: valuesOf(communities) });
    const { rootFolder } = yield* (yield* SettingsService).current;
    const frontmatter = yield* newRecordFrontmatter(communityType, values);
    return yield* (yield* NoteStore).create({
      folder: `${rootFolder}/${COMMUNITIES_FOLDER}`,
      name: communityFileName(values.name, values.short_code),
      frontmatter,
    });
  });

/** Where the community lives now: a note renamed meanwhile is found by its id (ADR 0007). */
const pathOf = (community: Community) =>
  Effect.map(communityList, ({ communities }) => {
    const found = communities.find(
      (candidate) => candidate.id !== undefined && candidate.id === community.id,
    );
    return found?.path ?? community.path;
  });

/**
 * Gives the file the community's new name, when the name changed and the file still carries the
 * old one (`followsName`); a name the user gave the file stays. A taken name gets ` (2)`, ` (3)`,
 * … A rename that fails keeps the saved note where it is and is logged: the record is saved, and
 * the file name is only for people.
 */
const followName = (note: Note, before: Community, values: CommunityValues) =>
  Effect.gen(function* () {
    const old = before.values.name;
    if (old === undefined || old === values.name) return note;
    const fileName = fileNameOf(note.path);
    if (!followsName(fileName, old, before.values.short_code ?? values.short_code)) return note;
    const store = yield* NoteStore;
    const target = communityFileName(values.name, values.short_code);
    for (let attempt = 1; attempt <= RENAME_ATTEMPTS; attempt += 1) {
      const renamed = yield* Effect.result(store.rename(note.path, clashName(target, attempt)));
      if (Result.isSuccess(renamed)) return renamed.success;
      if (renamed.failure._tag !== "NotePathTakenError") break;
    }
    yield* (yield* Logger).log({ level: "warn", event: "communities.rename.failed" });
    return note;
  });

/**
 * Saves the form of `community` (as it was loaded) with `input` (PBI-56, ADR 0007). The rules run
 * against the other communities; the short code stays as loaded unless it may be repaired
 * (`canChangeShortCode`). The write merges per field with an outside edit; a field both changed
 * is a conflict, a note that is no longer this record is refused, and a note that is gone is
 * `NoteNotFoundError`. Then the file follows the name.
 */
export const updateCommunity = (community: Community, input: CommunityInput) =>
  Effect.gen(function* () {
    const { communities } = yield* communityList;
    const loaded = community.values;
    const fixed = canChangeShortCode(community)
      ? input
      : { ...input, short_code: loaded.short_code ?? input.short_code };
    const values = yield* checked(fixed, {
      others: valuesOf(communities),
      loaded,
    });
    const path = yield* pathOf(community);
    const store = yield* NoteStore;
    const written = yield* store.update(
      path,
      editChange(communityType, community.frontmatter, values),
    );
    return yield* followName(written, community, values);
  });

/** Moves the community's note to Obsidian's trash; one renamed meanwhile is found by its id. */
export const deleteCommunity = (community: Community) =>
  Effect.flatMap(pathOf(community), (path) => NoteStore.use((store) => store.trash(path)));
