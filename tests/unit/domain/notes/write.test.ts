import { Result } from "effect";
import { describe, expect, it } from "vitest";
import type { Frontmatter } from "../../../../src/domain/notes";
import {
  FULL,
  FULL_VALUES,
  OTHER_ID,
  TEST_ID,
  testItem,
  testItemType,
  type TestValues,
} from "../../../support/notes/test-note-type";

const merge = (base: Frontmatter, edited: TestValues, current: Frontmatter) =>
  testItem.merge(base, edited, current);

const patched = (result: ReturnType<typeof merge>) => {
  if (Result.isFailure(result)) throw new Error(`expected a patch, got ${result.failure._tag}`);
  return result.success;
};

const failure = (result: ReturnType<typeof merge>) => {
  if (Result.isSuccess(result)) throw new Error("expected a failure");
  return result.failure;
};

const NOTHING = { set: {}, remove: [] };

describe("newFrontmatter", () => {
  it("writes schema, then id, then the declared fields in declaration order", () => {
    const { title, short_code, count, done, due, tags } = FULL_VALUES;
    const frontmatter = testItem.newFrontmatter(TEST_ID, {
      tags,
      due,
      done,
      count,
      short_code,
      title,
    });
    expect(frontmatter).toEqual(FULL);
    expect(Object.keys(frontmatter)).toEqual([
      "schema",
      "id",
      "title",
      "short_code",
      "count",
      "done",
      "due",
      "tags",
    ]);
  });

  it("leaves unset fields out and copies lists", () => {
    const tags = ["x"];
    const frontmatter = testItem.newFrontmatter(TEST_ID, { title: "T", count: undefined, tags });
    expect(frontmatter).toEqual({ schema: FULL.schema, id: TEST_ID, title: "T", tags: ["x"] });
    expect(Object.keys(frontmatter)).toEqual(["schema", "id", "title", "tags"]);
    expect(frontmatter["tags"]).not.toBe(tags);
  });

  it("ignores keys the type does not declare", () => {
    const values = { title: "T", stray: 1 } as TestValues;
    expect(testItem.newFrontmatter(TEST_ID, values)).toEqual({
      schema: FULL.schema,
      id: TEST_ID,
      title: "T",
    });
  });
});

describe("merge: the user's changes", () => {
  it("writes nothing when the user changed nothing", () => {
    expect(patched(merge(FULL, FULL_VALUES, FULL))).toEqual(NOTHING);
    expect(patched(merge(FULL, { ...FULL_VALUES, tags: ["a", "b"] }, FULL))).toEqual(NOTHING);
  });

  it("writes each field the user changed while the note still has the loaded value", () => {
    const edited = { ...FULL_VALUES, title: "Neu", tags: ["c"], done: true };
    const patch = patched(merge(FULL, edited, { ...FULL }));
    expect(patch).toEqual({ set: { title: "Neu", done: true, tags: ["c"] }, remove: [] });
    expect(patch.set["tags"]).not.toBe(edited.tags);
  });

  it("removes a field the user cleared", () => {
    const { count: _count, ...edited } = FULL_VALUES;
    expect(patched(merge(FULL, { ...edited, due: undefined }, FULL))).toEqual({
      set: {},
      remove: ["count", "due"],
    });
  });

  it("takes an empty property (null) for an unset one on every side", () => {
    const base = { ...FULL, count: null };
    const { count: _count, ...unset } = FULL_VALUES;
    expect(patched(merge(base, unset, base))).toEqual(NOTHING);
    const { count: _gone, ...current } = base;
    expect(patched(merge(base, { ...unset, count: 5 }, current))).toEqual({
      set: { count: 5 },
      remove: [],
    });
    expect(patched(merge(FULL, unset, { ...FULL, count: null }))).toEqual(NOTHING);
  });

  it("leaves a broken value the user did not touch, and repairs one the user set", () => {
    const base = { ...FULL, count: "x" };
    const { count: _count, ...untouched } = FULL_VALUES;
    expect(patched(merge(base, untouched, base))).toEqual(NOTHING);
    expect(patched(merge(base, { ...untouched, count: 2 }, base))).toEqual({
      set: { count: 2 },
      remove: [],
    });
  });

  it("never touches a key the type does not declare", () => {
    const base = { ...FULL, extra: 1, schema_note: "x" };
    const current = { ...base, extra: 2, added: true };
    const edited = { ...FULL_VALUES, title: "Neu", extra: 3 } as TestValues;
    expect(patched(merge(base, edited, current))).toEqual({ set: { title: "Neu" }, remove: [] });
  });
});

describe("merge: an outside edit", () => {
  it("keeps the note's value for a field only the outside changed", () => {
    expect(patched(merge(FULL, FULL_VALUES, { ...FULL, count: 9, tags: ["z"] }))).toEqual(NOTHING);
  });

  it("writes the user's fields beside the outside's other fields", () => {
    const current = { ...FULL, count: 9 };
    expect(patched(merge(FULL, { ...FULL_VALUES, title: "Neu" }, current))).toEqual({
      set: { title: "Neu" },
      remove: [],
    });
  });

  it("is no conflict when both sides changed a field to the same value", () => {
    const current = { ...FULL, title: "Neu", tags: ["c", "d"] };
    const edited = { ...FULL_VALUES, title: "Neu", tags: ["c", "d"] };
    expect(patched(merge(FULL, edited, current))).toEqual(NOTHING);
  });

  it("is a conflict when both sides changed a field differently, listing every such field", () => {
    const current = { ...FULL, title: "Theirs", count: 9, due: "2027-01-01", tags: ["x"] };
    const { due: _due, ...rest } = FULL_VALUES;
    const edited = { ...rest, title: "Mine", count: 4, tags: ["y"] };
    expect(failure(merge(FULL, edited, current))).toEqual({
      _tag: "conflict",
      conflicts: [
        { key: "title", base: "Ahornweg 12", edited: "Mine", current: "Theirs" },
        { key: "due", base: "2026-11-21", edited: undefined, current: "2027-01-01" },
        { key: "tags", base: ["a", "b"], edited: ["y"], current: ["x"] },
      ],
    });
  });

  it("is a conflict when the outside removed a field the user changed", () => {
    const { title: _title, ...current } = FULL;
    expect(failure(merge(FULL, { ...FULL_VALUES, title: "Mine" }, current))).toEqual({
      _tag: "conflict",
      conflicts: [{ key: "title", base: "Ahornweg 12", edited: "Mine", current: undefined }],
    });
  });

  it("is a conflict when the user repairs a broken value that the outside changed too", () => {
    const base = { ...FULL, count: "x" };
    expect(failure(merge(base, { ...FULL_VALUES, count: 2 }, { ...base, count: "y" }))).toEqual({
      _tag: "conflict",
      conflicts: [{ key: "count", base: "x", edited: 2, current: "y" }],
    });
  });
});

describe("merge: guards", () => {
  it.each([
    ["has no schema any more", { ...FULL, schema: undefined }, "other-type"],
    ["is of another type", { ...FULL, schema: "weg-manager.community/v3" }, "other-type"],
    ["has a malformed marker", { ...FULL, schema: "weg-manager.test-item/v" }, "other-type"],
    ["is of a newer version", { ...FULL, schema: "weg-manager.test-item/v4" }, "newer-version"],
    ["has another id", { ...FULL, id: OTHER_ID }, "identity"],
    ["has no id", { ...FULL, id: undefined }, "identity"],
  ])("refuses the write when the note %s", (_label, current, reason) => {
    expect(failure(merge(FULL, { ...FULL_VALUES, title: "Mine" }, current))).toEqual({
      _tag: "refused",
      reason,
    });
  });

  it("refuses a base without a valid id, even if the note still has it", () => {
    const base = { ...FULL, id: "test-item-1" };
    expect(failure(merge(base, FULL_VALUES, base))).toEqual({
      _tag: "refused",
      reason: "identity",
    });
  });

  it("refuses when the note's version cannot be migrated", () => {
    const codec = testItemType({
      1: () => {
        throw new Error("broken step");
      },
    });
    const v1 = { ...FULL, schema: "weg-manager.test-item/v1" };
    expect(failure(codec.merge(FULL, FULL_VALUES, v1))).toEqual({
      _tag: "refused",
      reason: "migration-failed",
    });
    expect(failure(codec.merge(v1, FULL_VALUES, FULL))).toEqual({
      _tag: "refused",
      reason: "migration-failed",
    });
  });
});

describe("merge: a note of an older version", () => {
  const v1 = { schema: "weg-manager.test-item/v1", id: TEST_ID, name: "Alt", count: "3", x: 1 };
  const loaded = { title: "Alt", count: 3 };

  it("writes the current version and what the migration changed, with the user's change", () => {
    expect(patched(merge(v1, { ...loaded, title: "Neu" }, v1))).toEqual({
      set: { schema: "weg-manager.test-item/v3", count: 3, title: "Neu" },
      remove: ["name"],
    });
  });

  it("writes the migration alone when the user changed nothing", () => {
    expect(patched(merge(v1, loaded, v1))).toEqual({
      set: { schema: "weg-manager.test-item/v3", count: 3, title: "Alt" },
      remove: ["name"],
    });
  });

  it("lets the user clear a field the migration would set", () => {
    expect(patched(merge(v1, { title: "Alt" }, v1))).toEqual({
      set: { schema: "weg-manager.test-item/v3", title: "Alt" },
      remove: ["count", "name"],
    });
  });

  it("compares an outside edit in the current form", () => {
    expect(failure(merge(v1, { ...loaded, title: "Neu" }, { ...v1, name: "Theirs" }))).toEqual({
      _tag: "conflict",
      conflicts: [{ key: "title", base: "Alt", edited: "Neu", current: "Theirs" }],
    });
  });

  it("writes into a note another device has already lifted to the current version", () => {
    const lifted = { schema: FULL.schema, id: TEST_ID, title: "Alt", count: 3, x: 1 };
    expect(patched(merge(v1, { ...loaded, title: "Neu" }, lifted))).toEqual({
      set: { title: "Neu" },
      remove: [],
    });
  });
});
