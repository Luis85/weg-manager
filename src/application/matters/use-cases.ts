import { Effect, Result } from "effect";
import {
  matterType,
  matterValues,
  nextNumber,
  validateMatter,
  type MatterInput,
  type MatterValues,
} from "../../domain/matters";
import { editedValues, type FormDraft } from "../../domain/notes";
import { InvalidMatterError } from "./errors";
import { matterRecords, type Matter } from "./list";

/** The matters now, for `useStream`. Never suspends. */
export const matterList = matterRecords.list;

/** The matters: the current list first, then each change. */
export const matterListChanges = matterRecords.changes;

/** The other matters' ids and numbers: what the number rule compares with. */
const othersOf = (self: Matter | undefined) =>
  Effect.map(matterRecords.list, ({ records }) =>
    records
      .filter((other) => self === undefined || other.id !== self.id)
      .map((other) => ({ id: other.id, number: other.values.number })),
  );

/**
 * The values to save, or the issues why not. Once the rules pass, the matter type reads every
 * field; a value the rules let through and the type rejects would be a bug in the rules.
 */
const checked = (
  input: MatterInput,
  context: Parameters<typeof validateMatter>[1],
  draft: FormDraft<typeof matterType.fields> = matterValues(input),
): Effect.Effect<MatterValues, InvalidMatterError> => {
  const issues = validateMatter(input, context);
  if (issues.length > 0) return Effect.fail(new InvalidMatterError({ issues }));
  const values = matterType.parse(draft);
  return Result.isSuccess(values)
    ? Effect.succeed(values.success)
    : Effect.die(new Error("validateMatter passed values the matter type rejects."));
};

/**
 * Creates a matter (PBI-05): the number is the highest in the vault plus one, whatever the form
 * held (owner decision 26.11.2026); then the rules, then a note named by its outcome in
 * `<rootFolder>/Vorgänge/`, with a fresh id and an empty body.
 */
export const createMatter = (input: MatterInput) =>
  Effect.gen(function* () {
    const others = yield* othersOf(undefined);
    const numbers = others.flatMap((other) => (other.number === undefined ? [] : [other.number]));
    const numbered = { ...input, number: nextNumber(numbers) };
    const values = yield* checked(numbered, { others });
    return yield* matterRecords.create(values);
  });

/**
 * Saves the form of `matter` (as it was loaded) with `input`: the rules against the other matters,
 * a kept number or outcome unchecked, then the record kit's per-field merge and rename.
 */
export const updateMatter = (matter: Matter, input: MatterInput) =>
  Effect.gen(function* () {
    const others = yield* othersOf(matter);
    const loaded = { number: matter.values.number, outcome: matter.values.outcome };
    const edited = editedValues(matterType, input, matterValues(input), matter.frontmatter);
    const values = yield* checked(input, { others, loaded }, edited);
    return yield* matterRecords.update(matter, values);
  });
