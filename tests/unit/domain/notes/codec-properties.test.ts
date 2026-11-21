import { Result } from "effect";
import {
  anything,
  array,
  assert,
  boolean,
  constantFrom,
  date,
  dictionary,
  double,
  integer,
  oneof,
  option,
  property,
  record,
  string,
  uuid,
  type Arbitrary,
} from "fast-check";
import { isDeepStrictEqual } from "node:util";
import { describe, expect, it } from "vitest";
import type { Frontmatter } from "../../../../src/domain/notes";
import { testItem, type TestValues } from "../../../support/notes/test-note-type";

const KEYS: readonly string[] = testItem.keys;

const dateText = date({
  min: new Date("0001-01-01T00:00:00Z"),
  max: new Date("9999-12-31T00:00:00Z"),
  noInvalidDate: true,
}).map((value) => value.toISOString().slice(0, 10));

/** Valid values of the test type; `-0` becomes `0`, as YAML has no negative zero. */
const values: Arbitrary<TestValues> = record(
  {
    title: string(),
    short_code: string({ maxLength: 5 }),
    count: oneof(integer(), double({ noNaN: true, noDefaultInfinity: true })).map((n) =>
      n === 0 ? 0 : n,
    ),
    done: boolean(),
    due: dateText,
    tags: array(string()),
  },
  { requiredKeys: ["title"] },
);

const id = uuid().map((value) => `test-item-${value}`);

/** Keys the type does not know, with any values. */
const unknownKeys = dictionary(
  string().filter((key) => !KEYS.includes(key) && key !== "schema" && key !== "id"),
  anything(),
);

/** Any values for the declared keys, as an outside edit might leave them. */
const outsideFields = record(
  Object.fromEntries(KEYS.map((key) => [key, option(anything(), { nil: undefined })])),
  { requiredKeys: [] },
);

const markers = constantFrom(
  undefined,
  "weg-manager.test-item/v1",
  "weg-manager.test-item/v2",
  "weg-manager.test-item/v3",
  "weg-manager.test-item/v4",
  "weg-manager.test-item/v0",
  "weg-manager.other/v1",
  "weg-manager.",
);

const anyFrontmatter: Arbitrary<Frontmatter> = record({
  rest: dictionary(string(), anything()),
  schema: oneof(markers, anything()),
  id: oneof(id, anything()),
  fields: outsideFields,
}).map(({ rest, schema, id: value, fields }) => ({ ...rest, ...fields, schema, id: value }));

const keysOf = (result: ReturnType<typeof testItem.merge>): string[] =>
  Result.isSuccess(result) ? [...Object.keys(result.success.set), ...result.success.remove] : [];

describe("note codec properties", () => {
  it("decode and merge never throw, whatever the frontmatter", () => {
    assert(
      property(anyFrontmatter, anyFrontmatter, values, (base, current, edited) => {
        const decoded = testItem.decode({ path: "x.md", frontmatter: base });
        expect(["not-this-type", "read-only", "editable"]).toContain(decoded.kind);
        testItem.merge(base, edited, current);
      }),
    );
  });

  it("decodes what it builds into the same values, without an issue", () => {
    assert(
      property(id, values, (recordId, recordValues) => {
        const frontmatter = testItem.newFrontmatter(recordId, recordValues);
        expect(testItem.decode({ path: "x.md", frontmatter })).toEqual({
          kind: "editable",
          path: "x.md",
          frontmatter,
          version: 3,
          id: recordId,
          values: recordValues,
          issues: [],
        });
      }),
    );
  });

  it("writes nothing outside the declared keys", () => {
    assert(
      property(
        id,
        values,
        values,
        unknownKeys,
        unknownKeys,
        outsideFields,
        (recordId, loaded, edited, extra, changedExtra, changedFields) => {
          const base = { ...extra, ...testItem.newFrontmatter(recordId, loaded) };
          const current = { ...base, ...changedExtra, ...changedFields };
          for (const key of keysOf(testItem.merge(base, edited, current))) {
            expect(KEYS).toContain(key);
          }
        },
      ),
    );
  });

  it("writes exactly the user's changes while the note is as loaded", () => {
    assert(
      property(id, values, values, unknownKeys, (recordId, loaded, edited, extra) => {
        const base = { ...extra, ...testItem.newFrontmatter(recordId, loaded) };
        const changed = KEYS.filter(
          (key) => !isDeepStrictEqual(edited[key as "title"], loaded[key as "title"]),
        );
        const set = Object.fromEntries(
          changed.flatMap((key) => {
            const value = edited[key as "title"];
            return value === undefined ? [] : [[key, value]];
          }),
        );
        const remove = changed.filter((key) => edited[key as "title"] === undefined);
        expect(testItem.merge(base, edited, { ...base })).toEqual(Result.succeed({ set, remove }));
      }),
    );
  });

  it("writes nothing when the user changed nothing, whatever the outside changed", () => {
    assert(
      property(id, values, unknownKeys, outsideFields, (recordId, loaded, extra, changedFields) => {
        const base = { ...extra, ...testItem.newFrontmatter(recordId, loaded) };
        const decoded = testItem.decode({ path: "x.md", frontmatter: base });
        if (decoded.kind !== "editable") throw new Error("a built note is editable");
        const current = { ...base, ...changedFields };
        expect(testItem.merge(base, decoded.values as TestValues, current)).toEqual(
          Result.succeed({ set: {}, remove: [] }),
        );
      }),
    );
  });
});
