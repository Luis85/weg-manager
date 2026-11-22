import { assert, describe, it } from "@effect/vitest";
import { Duration, Effect, Exit, Layer } from "effect";
import { TestClock } from "effect/testing";
import {
  built,
  indexFixture,
  item,
  itemId,
  snapshotOf,
  testOther,
  until,
  vaultReady,
} from "../../../support/notes/index-fixture";
import { linkNote, testLink } from "../../../support/notes/test-link-type";
import { testItem } from "../../../support/notes/test-note-type";
import { INDEX_BATCH_QUIET } from "../../../../src/application/notes/index-batches";

const quiet = Duration.toMillis(INDEX_BATCH_QUIET);

const LINK_TYPES = [testItem, testLink];

const missing = (id: string) => ({ code: "reference.missing", key: "item_ids", id }) as const;

describe("the note index's references", () => {
  it.effect("marks each id no record has, and keeps the note editable with its values", () => {
    const fixture = indexFixture({ types: LINK_TYPES });
    fixture.memory.seed("A.md", item(1));
    fixture.memory.seed("Link.md", linkNote(1, { item_ids: [itemId(1), itemId(2)] }));
    return Effect.gen(function* () {
      yield* vaultReady;
      yield* built;
      const [link] = (yield* snapshotOf(testLink)).notes;
      assert.strictEqual(link?.kind, "editable");
      assert.deepStrictEqual(link?.values.item_ids, [itemId(1), itemId(2)]);
      assert.deepStrictEqual(link?.issues, [missing(itemId(2))]);
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("drops the issue once the target's note comes, and adds it when it goes", () => {
    const fixture = indexFixture({ types: LINK_TYPES });
    fixture.memory.seed("Link.md", linkNote(1, { item_ids: [itemId(2)] }));
    return Effect.gen(function* () {
      yield* vaultReady;
      yield* built;
      fixture.memory.seed("B.md", item(2));
      yield* TestClock.adjust(quiet);
      yield* until(testLink, ({ notes }) => notes[0]?.issues.length === 0);
      fixture.memory.removeOutside("B.md");
      yield* TestClock.adjust(quiet);
      const after = yield* until(testLink, ({ notes }) => notes[0]?.issues.length === 1);
      assert.deepStrictEqual(after.notes[0]?.issues, [missing(itemId(2))]);
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("dies at build for a reference to a type no module registers", () =>
    Effect.gen(function* () {
      const fixture = indexFixture({ types: [testLink, testOther] });
      const exit = yield* Effect.exit(Layer.build(fixture.layer).pipe(Effect.scoped));
      const defect = new Error(
        "The field item_id of test-link refers to the note type test-item, which is not registered.",
      );
      assert.deepStrictEqual(exit, Exit.die(defect));
    }),
  );
});

describe("a snapshot's lookup by id", () => {
  it.effect("finds each record by its id; a duplicated id gives the first note by path", () => {
    const fixture = indexFixture();
    fixture.memory.seed("A.md", item(1));
    fixture.memory.seed("D.md", item(3, { title: "Kopie" }));
    fixture.memory.seed("C.md", item(3));
    fixture.memory.seed("E.md", item(4, { id: undefined }));
    return Effect.gen(function* () {
      yield* vaultReady;
      const snapshot = yield* built;
      const [first, duplicate, second] = snapshot.notes;
      assert.deepStrictEqual([...snapshot.byId.keys()], [itemId(1), itemId(3)]);
      assert.strictEqual(snapshot.byId.get(itemId(1)), first);
      assert.strictEqual(snapshot.byId.get(itemId(3)), duplicate);
      assert.strictEqual(duplicate?.path, "C.md");
      assert.strictEqual(duplicate?.kind, "read-only");
      assert.strictEqual(second?.path, "D.md");
      assert.isUndefined(snapshot.byId.get(itemId(4)));
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("is built once per published snapshot and follows each change", () => {
    const fixture = indexFixture();
    fixture.memory.seed("A.md", item(1));
    return Effect.gen(function* () {
      yield* vaultReady;
      const snapshot = yield* built;
      assert.strictEqual((yield* snapshotOf(testItem)).byId, snapshot.byId);
      fixture.memory.seed("Other.md", {
        schema: "weg-manager.test-other/v1",
        id: "test-other-00000000-0000-4000-8000-000000000001",
        title: "Andere",
      });
      yield* TestClock.adjust(quiet);
      yield* until(testOther, ({ notes }) => notes.length === 1);
      assert.strictEqual((yield* snapshotOf(testItem)).byId, snapshot.byId);
      fixture.memory.seed("A.md", item(1, { title: "Neu" }));
      yield* TestClock.adjust(quiet);
      const changed = yield* until(testItem, ({ notes }) => notes[0]?.values.title === "Neu");
      assert.strictEqual(changed.byId.get(itemId(1)), changed.notes[0]);
    }).pipe(Effect.provide(fixture.layer));
  });
});
