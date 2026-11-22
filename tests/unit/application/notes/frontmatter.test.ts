import { describe, expect, it } from "vitest";
import { copyFrontmatter, recordNotes } from "../../../../src/application/notes/frontmatter";
import { applyPatch } from "../../../../src/application/notes/patch";

describe("applyPatch", () => {
  it("sets known keys in place, appends new ones and keeps every other key and the order", () => {
    const target: Record<string, unknown> = { schema: "weg-manager.x/v1", name: "A", extra: 1 };
    applyPatch(target, { set: { name: "B", added: true } });
    expect(Object.entries(target)).toEqual([
      ["schema", "weg-manager.x/v1"],
      ["name", "B"],
      ["extra", 1],
      ["added", true],
    ]);
  });

  it("removes the keys it is told to remove and leaves the others where they were", () => {
    const target: Record<string, unknown> = { a: 1, b: 2, c: 3 };
    applyPatch(target, { remove: ["b", "missing"] });
    expect(Object.entries(target)).toEqual([
      ["a", 1],
      ["c", 3],
    ]);
  });

  it("sets a key that is both set and removed, in its place", () => {
    const target: Record<string, unknown> = { a: 1, b: 2, c: 3 };
    applyPatch(target, { set: { b: 20 }, remove: ["b"] });
    expect(Object.entries(target)).toEqual([
      ["a", 1],
      ["b", 20],
      ["c", 3],
    ]);
  });

  it("changes nothing for an empty patch", () => {
    const target: Record<string, unknown> = { a: 1 };
    applyPatch(target, {});
    expect(target).toEqual({ a: 1 });
  });

  it("copies the values it sets, so the caller's list stays its own", () => {
    const list = ["x"];
    const target: Record<string, unknown> = {};
    applyPatch(target, { set: { list } });
    list.push("y");
    expect(target["list"]).toEqual(["x"]);
  });
});

describe("copyFrontmatter", () => {
  it("is empty for a note without frontmatter", () => {
    expect(copyFrontmatter(undefined)).toEqual({});
    expect(copyFrontmatter(null)).toEqual({});
  });

  it("copies deeply, so a change to the copy never reaches the source", () => {
    const source = { list: ["a"], name: "A" };
    const copy = copyFrontmatter(source) as { list: string[]; name: string };
    copy.list.push("b");
    copy.name = "B";
    expect(source).toEqual({ list: ["a"], name: "A" });
  });
});

describe("recordNotes", () => {
  it("keeps the records, sorted by path, each with its own copy of the frontmatter", () => {
    const shared = { schema: "weg-manager.community/v1", tags: ["a"] };
    // Neither sorted nor reversed, so only a real sort gives the expected order.
    const notes = recordNotes([
      { path: "a/Erste.md", frontmatter: { schema: "weg-manager.item/v2" } },
      { path: "b/Zweite.md", frontmatter: shared },
      { path: "Ohne.md", frontmatter: { title: "x" } },
      { path: "Kaputt.md", frontmatter: undefined },
      { path: "B.md", frontmatter: { schema: "weg-manager.item/v1" } },
    ]);
    expect(notes).toEqual([
      { path: "B.md", frontmatter: { schema: "weg-manager.item/v1" } },
      { path: "a/Erste.md", frontmatter: { schema: "weg-manager.item/v2" } },
      { path: "b/Zweite.md", frontmatter: shared },
    ]);
    expect(notes[2]?.frontmatter).not.toBe(shared);
  });

  it("is empty when no note is a record", () => {
    expect(recordNotes([])).toEqual([]);
    expect(recordNotes([{ path: "x.md", frontmatter: {} }])).toEqual([]);
  });
});
