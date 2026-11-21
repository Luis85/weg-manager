import { describe, expect, it } from "vitest";
import { type Frontmatter, type Migrations } from "../../../../src/domain/notes";
import {
  FULL,
  FULL_VALUES,
  TEST_ID,
  TEST_MIGRATIONS,
  testItem,
  testItemType,
} from "../../../support/notes/test-note-type";

const PATH = "WEG Manager/Test/Ahornweg.md";
const at = (frontmatter: Frontmatter) => ({ path: PATH, frontmatter });

/** Records which steps ran, in order, and with what; then runs the real step. */
const recording = () => {
  const calls: Array<{ readonly from: number; readonly input: Frontmatter }> = [];
  const step =
    (from: 1 | 2) =>
    (input: Frontmatter): unknown => {
      calls.push({ from, input });
      return TEST_MIGRATIONS[from]?.(input);
    };
  const migrations: Migrations = { 1: step(1), 2: step(2) };
  return { calls, codec: testItemType(migrations) };
};

/** A step that must not run. */
const never = (): never => {
  throw new Error("must not run");
};

describe("the declaration", () => {
  it("names its type, version and keys in declaration order", () => {
    expect(testItem.type).toBe("test-item");
    expect(testItem.version).toBe(3);
    expect(testItem.keys).toEqual(["title", "short_code", "count", "done", "due", "tags"]);
  });
});

describe("decode: a current record", () => {
  it("reads every declared field, keeps the note as loaded and is editable", () => {
    const note = at({ ...FULL, extra: "kept", other_key: [1] });
    expect(testItem.decode(note)).toEqual({
      kind: "editable",
      path: PATH,
      frontmatter: note.frontmatter,
      version: 3,
      id: TEST_ID,
      values: FULL_VALUES,
      issues: [],
    });
  });

  it("leaves absent and empty optional fields out, without an issue", () => {
    const decoded = testItem.decode(
      at({ schema: FULL.schema, id: TEST_ID, title: "T", count: null, tags: null }),
    );
    expect(decoded).toMatchObject({ kind: "editable", values: { title: "T" }, issues: [] });
    expect(decoded.kind === "editable" && Object.keys(decoded.values)).toEqual(["title"]);
  });

  it("decodes the valid fields of a partly broken record and names each broken one", () => {
    const note = at({
      schema: FULL.schema,
      id: TEST_ID,
      title: null,
      short_code: "TOO LONG",
      count: "4",
      done: "yes",
      due: "2026-02-30",
      tags: "a",
    });
    expect(testItem.decode(note)).toEqual({
      kind: "editable",
      path: PATH,
      frontmatter: note.frontmatter,
      version: 3,
      id: TEST_ID,
      values: {},
      issues: [
        { code: "field.missing", key: "title" },
        { code: "short-code.length", key: "short_code" },
        { code: "field.number", key: "count" },
        { code: "field.checkbox", key: "done" },
        { code: "field.date", key: "due" },
        { code: "field.list", key: "tags" },
      ],
    });
  });

  it("calls a missing required field missing, and a wrong one by its kind", () => {
    const missing = testItem.decode(at({ schema: FULL.schema, id: TEST_ID, count: 1 }));
    expect(missing).toMatchObject({
      kind: "editable",
      values: { count: 1 },
      issues: [{ code: "field.missing", key: "title" }],
    });
    const wrong = testItem.decode(at({ schema: FULL.schema, id: TEST_ID, title: 7 }));
    expect(wrong).toMatchObject({ issues: [{ code: "field.text", key: "title" }] });
  });
});

describe("decode: not a record of this type", () => {
  it.each([
    ["no schema", {}, { kind: "none" }],
    ["another prefix", { schema: "other.test-item/v3" }, { kind: "none" }],
    ["a malformed marker", { schema: "weg-manager.test-item/v0" }, { kind: "malformed" }],
    [
      "another type",
      { ...FULL, schema: "weg-manager.community/v3" },
      { kind: "record", type: "community", version: 3 },
    ],
  ])("says so for %s and carries the parsed marker", (_label, frontmatter, marker) => {
    expect(testItem.decode(at(frontmatter))).toEqual({
      kind: "not-this-type",
      path: PATH,
      frontmatter,
      marker,
    });
  });
});

describe("decode: versions", () => {
  it("reads a newer version as read-only with its version, interpreting no field", () => {
    const { calls, codec } = recording();
    const note = at({ ...FULL, schema: "weg-manager.test-item/v4" });
    expect(codec.decode(note)).toEqual({
      kind: "read-only",
      path: PATH,
      frontmatter: note.frontmatter,
      version: 4,
      id: TEST_ID,
      values: {},
      issues: [{ code: "schema.newer", version: 4 }],
    });
    expect(calls).toEqual([]);
  });

  it("keeps no id for a newer version whose id is broken", () => {
    const note = at({ schema: "weg-manager.test-item/v9", id: "x" });
    expect(testItem.decode(note)).toMatchObject({
      kind: "read-only",
      id: undefined,
      issues: [{ code: "schema.newer", version: 9 }],
    });
  });

  it("migrates a v1 note in memory through both steps, in order, and decodes it", () => {
    const { calls, codec } = recording();
    const v1 = { schema: "weg-manager.test-item/v1", id: TEST_ID, name: "Alt", count: "3", x: 1 };
    const note = at(v1);
    expect(codec.decode(note)).toEqual({
      kind: "editable",
      path: PATH,
      frontmatter: v1,
      version: 1,
      id: TEST_ID,
      values: { title: "Alt", count: 3 },
      issues: [],
    });
    expect(calls).toEqual([
      { from: 1, input: v1 },
      {
        from: 2,
        input: { schema: "weg-manager.test-item/v1", id: TEST_ID, count: "3", x: 1, title: "Alt" },
      },
    ]);
    expect(note.frontmatter).toEqual({ ...v1 });
  });

  it("runs only the steps from the note's version on", () => {
    const { calls, codec } = recording();
    const decoded = codec.decode(
      at({ schema: "weg-manager.test-item/v2", id: TEST_ID, title: "T", count: "5" }),
    );
    expect(decoded).toMatchObject({
      kind: "editable",
      version: 2,
      values: { title: "T", count: 5 },
    });
    expect(calls.map(({ from }) => from)).toEqual([2]);
  });

  it("never runs an entry for the current version or later", () => {
    const codec = testItemType({ ...TEST_MIGRATIONS, 3: never, 4: never });
    for (const fields of [
      { schema: "weg-manager.test-item/v1", name: "T" },
      { schema: "weg-manager.test-item/v3", title: "T" },
    ]) {
      expect(codec.decode(at({ ...fields, id: TEST_ID }))).toMatchObject({
        kind: "editable",
        values: { title: "T" },
        issues: [],
      });
    }
  });

  it("needs no step for a version without an entry", () => {
    const codec = testItemType({});
    const decoded = codec.decode(
      at({ schema: "weg-manager.test-item/v1", id: TEST_ID, title: "T" }),
    );
    expect(decoded).toMatchObject({ kind: "editable", version: 1, values: { title: "T" } });
  });

  it.each([
    [
      "throws",
      () => {
        throw new Error("broken step");
      },
    ],
    ["returns a list", () => []],
    ["returns null", () => null],
    ["returns text", () => "x"],
  ])("makes the note read-only with the step's version when a step %s", (_label, broken) => {
    const codec = testItemType({ ...TEST_MIGRATIONS, 2: broken });
    const note = at({ schema: "weg-manager.test-item/v1", id: TEST_ID, name: "T" });
    expect(codec.decode(note)).toEqual({
      kind: "read-only",
      path: PATH,
      frontmatter: note.frontmatter,
      version: 1,
      id: TEST_ID,
      values: {},
      issues: [{ code: "migration.failed", from: 2 }],
    });
  });
});

describe("decode: identity", () => {
  it.each([
    ["missing", undefined, "id.missing"],
    ["empty", null, "id.missing"],
    ["malformed", "test-item-1", "id.malformed"],
    ["of another type", "community-3f2b8c1e-7a44-4d0b-9c2e-5b1f0a6d9e21", "id.other-type"],
  ])("makes a note with an id that is %s read-only, still showing its fields", (_l, id, code) => {
    const note = at({ schema: FULL.schema, id, title: "T", count: "x" });
    expect(testItem.decode(note)).toEqual({
      kind: "read-only",
      path: PATH,
      frontmatter: note.frontmatter,
      version: 3,
      id: undefined,
      values: { title: "T" },
      issues: [{ code }, { code: "field.number", key: "count" }],
    });
  });
});
