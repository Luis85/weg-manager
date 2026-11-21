import { describe, expect, it } from "vitest";
import { defineNoteType, markDuplicateIds, required, text } from "../../../../src/domain/notes";
import { FULL, OTHER_ID, TEST_ID, testItem } from "../../../support/notes/test-note-type";

const other = defineNoteType({
  type: "other-thing",
  version: 1,
  fields: { name: required(text()) },
  migrations: {},
});

const OTHER_THING_ID = "other-thing-3f2b8c1e-7a44-4d0b-9c2e-5b1f0a6d9e21";

const item = (path: string, frontmatter: Record<string, unknown>) =>
  testItem.decode({ path, frontmatter });

describe("markDuplicateIds", () => {
  it("marks every note that shares its id read-only with a duplicate issue", () => {
    const first = item("a.md", FULL);
    const second = item("b.md", { ...FULL, title: "Kopie", count: "x" });
    const alone = item("c.md", { ...FULL, id: OTHER_ID });
    const marked = markDuplicateIds([first, second, alone]);
    expect(marked).toEqual([
      { ...first, kind: "read-only", issues: [{ code: "id.duplicate" }] },
      {
        ...second,
        kind: "read-only",
        issues: [{ code: "field.number", key: "count" }, { code: "id.duplicate" }],
      },
      alone,
    ]);
    expect(marked[2]).toBe(alone);
  });

  it("adds the issue to a note that is already read-only", () => {
    const newer = item("a.md", { ...FULL, schema: "weg-manager.test-item/v4" });
    const current = item("b.md", FULL);
    expect(markDuplicateIds([newer, current])).toEqual([
      { ...newer, issues: [{ code: "schema.newer", version: 4 }, { code: "id.duplicate" }] },
      { ...current, kind: "read-only", issues: [{ code: "id.duplicate" }] },
    ]);
  });

  it("ignores notes without an id and notes of no type", () => {
    const noId = item("a.md", { ...FULL, id: undefined });
    const noId2 = item("b.md", { ...FULL, id: undefined });
    const foreign = item("c.md", { schema: "weg-manager.other-thing/v1", id: TEST_ID });
    const foreign2 = item("d.md", { schema: "weg-manager.other-thing/v1", id: TEST_ID });
    const notes = [noId, noId2, foreign, foreign2];
    expect(markDuplicateIds(notes)).toEqual(notes);
  });

  it("works over notes of several types", () => {
    const mine = item("a.md", FULL);
    const theirs = other.decode({
      path: "b.md",
      frontmatter: { schema: "weg-manager.other-thing/v1", id: OTHER_THING_ID, name: "x" },
    });
    const theirs2 = other.decode({
      path: "c.md",
      frontmatter: { schema: "weg-manager.other-thing/v1", id: OTHER_THING_ID, name: "y" },
    });
    const marked = markDuplicateIds([mine, theirs, theirs2]);
    expect(marked.map((note) => note.kind)).toEqual(["editable", "read-only", "read-only"]);
  });

  it("returns an empty list for no notes", () => {
    expect(markDuplicateIds([])).toEqual([]);
  });
});
