import { Effect, Result } from "effect";
import { describe, expect, it } from "vitest";
import {
  NoteEditConflictError,
  NoteWriteRefusedError,
  editChange,
  newRecordFrontmatter,
} from "../../../../src/application/notes";
import { sequentialIdGenerator } from "../../../../src/infrastructure/memory/notes";
import { FULL, FULL_VALUES, OTHER_ID, testItem } from "../../../support/notes/test-note-type";

describe("newRecordFrontmatter", () => {
  it("gives each new record a fresh id of its type, then its values", async () => {
    const ids = sequentialIdGenerator();
    const make = newRecordFrontmatter(testItem, { title: "Eins" });
    const [first, second] = await Effect.runPromise(
      Effect.all([make, newRecordFrontmatter(testItem, FULL_VALUES)]).pipe(
        Effect.provide(ids.layer),
      ),
    );
    expect(first).toEqual({
      schema: "weg-manager.test-item/v3",
      id: "test-item-00000000-0000-4000-8000-000000000001",
      title: "Eins",
    });
    expect(second).toEqual({ ...FULL, id: "test-item-00000000-0000-4000-8000-000000000002" });
  });
});

describe("editChange", () => {
  it("returns the merge's patch", () => {
    const change = editChange(testItem, FULL, { ...FULL_VALUES, title: "Neu" });
    expect(change({ ...FULL, count: 9 })).toEqual(
      Result.succeed({ set: { title: "Neu" }, remove: [] }),
    );
  });

  it("fails with a conflict error that lists every conflicting field", () => {
    const change = editChange(testItem, FULL, { ...FULL_VALUES, title: "Mine", tags: ["x"] });
    const result = change({ ...FULL, title: "Theirs", tags: ["y"] });
    const conflicts = [
      { key: "title", base: "Ahornweg 12", edited: "Mine", current: "Theirs" },
      { key: "tags", base: ["a", "b"], edited: ["x"], current: ["y"] },
    ];
    expect(result).toEqual(Result.fail(new NoteEditConflictError({ conflicts })));
  });

  it("takes only conflicts that name their field", () => {
    expect(() => new NoteEditConflictError({ conflicts: [{ key: 1 } as never] })).toThrow(
      "Schema validation failed",
    );
  });

  it.each([
    [{ ...FULL, schema: "weg-manager.other/v1" }, "other-type"],
    [{ ...FULL, schema: "weg-manager.test-item/v4" }, "newer-version"],
    [{ ...FULL, id: OTHER_ID }, "identity"],
  ] as const)("refuses a note that is no longer the loaded record (%#)", (current, reason) => {
    const change = editChange(testItem, FULL, FULL_VALUES);
    expect(change(current)).toEqual(Result.fail(new NoteWriteRefusedError({ reason })));
  });
});
