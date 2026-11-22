import { Option, Schema } from "effect";
import { array, assert, constantFrom, property, subarray, uniqueArray, uuid } from "fast-check";
import { describe, expect, expectTypeOf, it } from "vitest";
import {
  markMissingReferences,
  reference,
  references,
  required,
  type MissingReference,
} from "../../../../src/domain/notes";
import type { RecordFieldIssue, ReferenceIssue } from "../../../../src/domain/notes/note-type";
import { linkNote, testLink } from "../../../support/notes/test-link-type";
import {
  FULL,
  OTHER_ID,
  TEST_ID,
  TEST_UUID,
  testItem,
} from "../../../support/notes/test-note-type";

const REJECTED = Symbol("rejected");

const read = (schema: Schema.Decoder<unknown>, values: readonly unknown[]) =>
  values.map((value) =>
    Option.getOrElse(Schema.decodeUnknownOption(schema)(value), () => REJECTED),
  );

const ABSENT_ID = "test-item-00000000-0000-4000-8000-0000000000ff";

const item = (path: string, frontmatter: Record<string, unknown>) =>
  testItem.decode({ path, frontmatter });

const link = (path: string, extra: Record<string, unknown>) =>
  testLink.decode({ path, frontmatter: linkNote(1, extra) });

/** The notes with the fields of their type, as the index hands them over. */
const withFields = (...notes: ReturnType<typeof item | typeof link>[]) =>
  notes.map((note) => ({
    fields: note.path.startsWith("link") ? testLink.fields : testItem.fields,
    note,
  }));

describe("reference field kinds", () => {
  it("declare the target type and their own issue code, optional by default", () => {
    expect(reference("community")).toMatchObject({
      kind: "reference",
      issue: "field.reference",
      required: false,
      target: "community",
    });
    expect(references("community")).toMatchObject({
      kind: "references",
      issue: "field.references",
      required: false,
      target: "community",
    });
    expect(required(reference("community"))).toMatchObject({ required: true, target: "community" });
  });

  it("read an id of the target type only", () => {
    const accepted = [TEST_ID, OTHER_ID];
    const rejected = [
      `test-other-${TEST_UUID}`,
      `test-item-${TEST_UUID.toUpperCase()}`,
      `test-item-${TEST_UUID} `,
      TEST_UUID,
      "",
      1,
      [TEST_ID],
      null,
    ];
    expect(read(reference("test-item").schema, [...accepted, ...rejected])).toEqual([
      ...accepted,
      ...rejected.map(() => REJECTED),
    ]);
  });

  it("read a list of ids of the target type, empty or with an id twice", () => {
    const accepted = [[], [TEST_ID], [TEST_ID, OTHER_ID], [TEST_ID, TEST_ID]];
    const rejected = [TEST_ID, [TEST_ID, `test-other-${TEST_UUID}`], [TEST_ID, null], [1], {}];
    expect(read(references("test-item").schema, [...accepted, ...rejected])).toEqual([
      ...accepted,
      ...rejected.map(() => REJECTED),
    ]);
  });

  it("make a malformed value a field issue and leave it out of the values", () => {
    const decoded = link("link.md", { item_id: `test-other-${TEST_UUID}`, item_ids: [TEST_ID, 1] });
    expect(decoded).toMatchObject({
      kind: "editable",
      values: { title: "Link 1" },
      issues: [
        { code: "field.reference", key: "item_id" },
        { code: "field.references", key: "item_ids" },
      ],
    });
  });
});

describe("the issue type of a record", () => {
  it("holds a missing target only for a type that has a reference field", () => {
    expectTypeOf<ReferenceIssue<typeof testItem.fields>>().toBeNever();
    expectTypeOf<ReferenceIssue<typeof testLink.fields>>().toEqualTypeOf<MissingReference>();
    expectTypeOf<
      Extract<RecordFieldIssue<typeof testLink.fields>, { code: "reference.missing" }>
    >().toEqualTypeOf<MissingReference>();
  });
});

describe("markMissingReferences", () => {
  it("names each id no record has, once per field, and keeps the note editable with its values", () => {
    const target = item("a.md", FULL);
    const source = link("link.md", {
      item_id: ABSENT_ID,
      item_ids: [ABSENT_ID, TEST_ID, ABSENT_ID],
    });
    const [, marked] = markMissingReferences(withFields(target, source));
    expect(marked).toEqual({
      ...source,
      issues: [
        { code: "reference.missing", key: "item_id", id: ABSENT_ID },
        { code: "reference.missing", key: "item_ids", id: ABSENT_ID },
      ],
    });
  });

  it("names every missing id of a list in list order", () => {
    const second = "test-item-00000000-0000-4000-8000-0000000000fe";
    const [marked] = markMissingReferences(
      withFields(link("link.md", { item_ids: [ABSENT_ID, second] })),
    );
    expect(marked?.kind !== "not-this-type" && marked?.issues).toEqual([
      { code: "reference.missing", key: "item_ids", id: ABSENT_ID },
      { code: "reference.missing", key: "item_ids", id: second },
    ]);
  });

  it("finds a target that is read-only or duplicated", () => {
    const newer = item("a.md", { ...FULL, schema: "weg-manager.test-item/v4" });
    const twice = [
      item("b.md", { ...FULL, id: OTHER_ID }),
      item("c.md", { ...FULL, id: OTHER_ID }),
    ];
    const source = link("link.md", { item_id: TEST_ID, item_ids: [OTHER_ID] });
    const marked = markMissingReferences(withFields(newer, ...twice, source));
    expect(marked[3]).toBe(source);
  });

  it("leaves every note without a missing target as it is, the same object", () => {
    const notes = [
      item("a.md", FULL),
      link("link.md", { item_id: TEST_ID }),
      link("link-2.md", { item_id: "broken" }),
      testItem.decode({ path: "foreign.md", frontmatter: { schema: "weg-manager.other/v1" } }),
    ];
    const marked = markMissingReferences(withFields(...notes));
    marked.forEach((note, at) => expect(note).toBe(notes[at]));
  });

  it("checks a read-only note's values, and nothing of a note it could not read", () => {
    const noId = link("link.md", { id: undefined, item_id: ABSENT_ID });
    const newer = link("link-2.md", { schema: "weg-manager.test-link/v2", item_id: ABSENT_ID });
    const [first, second] = markMissingReferences(withFields(noId, newer));
    expect(first).toEqual({
      ...noId,
      issues: [
        { code: "id.missing" },
        { code: "reference.missing", key: "item_id", id: ABSENT_ID },
      ],
    });
    expect(second).toBe(newer);
  });

  it("does not count a note without an id of its own as a target", () => {
    const noId = item("a.md", { ...FULL, id: undefined });
    const [, marked] = markMissingReferences(
      withFields(noId, link("link.md", { item_id: TEST_ID })),
    );
    expect(marked?.kind !== "not-this-type" && marked?.issues).toEqual([
      { code: "reference.missing", key: "item_id", id: TEST_ID },
    ]);
  });

  it("returns an empty list for no notes", () => {
    expect(markMissingReferences([])).toEqual([]);
  });
});

describe("missing reference properties", () => {
  const ids = uniqueArray(
    uuid().map((value) => `test-item-${value}`),
    { minLength: 1, maxLength: 8 },
  );

  it("names exactly the distinct ids of a list that no record has, in list order", () => {
    assert(
      property(
        ids.chain((all) =>
          subarray(all).chain((present) =>
            array(constantFrom(...all), { maxLength: 12 }).map((list) => ({ present, list })),
          ),
        ),
        ({ present, list }) => {
          const targets = present.map((id, at) => item(`items/${at}.md`, { ...FULL, id }));
          const source = link("link.md", { item_ids: list });
          const marked = markMissingReferences(withFields(...targets, source)).at(-1);
          const missing = [...new Set(list.filter((id) => !present.includes(id)))];
          expect(marked).toEqual({
            ...source,
            issues: missing.map((id) => ({ code: "reference.missing", key: "item_ids", id })),
          });
          expect(marked?.kind).toBe("editable");
        },
      ),
    );
  });
});
