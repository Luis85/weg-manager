import { Effect, Layer } from "effect";
import { describe, expect, it } from "vitest";
import {
  NoteEditConflictError,
  NoteStore,
  editChange,
  newRecordFrontmatter,
  type Frontmatter,
} from "../../../../src/application/notes";
import {
  memoryNoteStore,
  sequentialIdGenerator,
} from "../../../../src/infrastructure/memory/notes";
import { testItem, type TestValues } from "../../../support/notes/test-note-type";

const ID = "test-item-00000000-0000-4000-8000-000000000001";
const PATH = "WEG Manager/Test/Ahornweg.md";
const BODY = "Notizen des Nutzers\n";
const VALUES: TestValues = { title: "Ahornweg 12", count: 4, tags: ["a"] };

/**
 * Creates a note of the test type through the store, lets the form load it, changes it "outside"
 * as Sync or a person would, then saves the form's edit through `update` with the merge.
 */
const scenario = (outside: (loaded: Frontmatter) => Frontmatter, edited: TestValues) => {
  const memory = memoryNoteStore();
  const layer = Layer.merge(memory.layer, sequentialIdGenerator().layer);
  return Effect.runPromise(
    Effect.gen(function* () {
      const store = yield* NoteStore;
      const frontmatter = yield* newRecordFrontmatter(testItem, VALUES);
      const created = yield* store.create({
        folder: "WEG Manager/Test",
        name: "Ahornweg",
        frontmatter,
        body: BODY,
      });
      const loaded = testItem.decode(yield* store.read(created.path));
      if (loaded.kind !== "editable") throw new Error("a created note is editable");
      memory.seed(created.path, outside(loaded.frontmatter), BODY);
      const saved = yield* Effect.result(
        store.update(created.path, editChange(testItem, loaded.frontmatter, edited)),
      );
      const after = yield* store.read(created.path);
      return { loaded, saved, after, body: memory.body(created.path) };
    }).pipe(Effect.provide(layer)),
  );
};

/** An outside edit of the title and the count. */
const theirs = (frontmatter: Frontmatter) => ({ ...frontmatter, title: "Theirs", count: 9 });

describe("saving a form edit through the NoteStore", () => {
  it("creates the note with schema, id and the values in declaration order", async () => {
    const { loaded } = await scenario((frontmatter) => frontmatter, VALUES);
    expect(loaded.path).toBe(PATH);
    expect(Object.entries(loaded.frontmatter)).toEqual([
      ["schema", "weg-manager.test-item/v3"],
      ["id", ID],
      ["title", "Ahornweg 12"],
      ["count", 4],
      ["tags", ["a"]],
    ]);
  });

  it("writes the user's change when nobody else changed the note", async () => {
    const { saved, after, body } = await scenario((frontmatter) => ({ ...frontmatter }), {
      ...VALUES,
      title: "Ahornweg 14",
      done: true,
    });
    expect(saved._tag).toBe("Success");
    expect(Object.entries(after.frontmatter)).toEqual([
      ["schema", "weg-manager.test-item/v3"],
      ["id", ID],
      ["title", "Ahornweg 14"],
      ["count", 4],
      ["tags", ["a"]],
      ["done", true],
    ]);
    expect(body).toBe(BODY);
  });

  it("keeps an outside change to other fields and unknown keys beside the user's", async () => {
    const { saved, after, body } = await scenario(
      (frontmatter) => ({ reviewer: "Agent", ...frontmatter, count: 9 }),
      { ...VALUES, title: "Ahornweg 14" },
    );
    expect(saved._tag).toBe("Success");
    expect(Object.entries(after.frontmatter)).toEqual([
      ["reviewer", "Agent"],
      ["schema", "weg-manager.test-item/v3"],
      ["id", ID],
      ["title", "Ahornweg 14"],
      ["count", 9],
      ["tags", ["a"]],
    ]);
    expect(body).toBe(BODY);
  });

  it("writes nothing and names the conflict when both changed the same field", async () => {
    const { loaded, saved, after } = await scenario(theirs, { ...VALUES, title: "Mine" });
    expect(saved).toMatchObject({
      _tag: "Failure",
      failure: new NoteEditConflictError({
        conflicts: [{ key: "title", base: "Ahornweg 12", edited: "Mine", current: "Theirs" }],
      }),
    });
    expect(after.frontmatter).toEqual(theirs(loaded.frontmatter));
  });
});
