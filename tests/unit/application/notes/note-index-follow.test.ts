import { assert, describe, it } from "@effect/vitest";
import { Duration, Effect, Result } from "effect";
import { TestClock } from "effect/testing";
import { AppEvent } from "../../../../src/application/events";
import { NoteStore } from "../../../../src/application/notes";
import {
  INDEX_BATCH_MAX,
  INDEX_BATCH_QUIET,
} from "../../../../src/application/notes/index-batches";
import {
  built,
  countingType,
  indexFixture,
  item,
  itemId,
  paths,
  publish,
  recordSnapshots,
  settle,
  snapshotOf,
  testOther,
  unindexed,
  until,
  untilUnindexed,
  vaultReady,
} from "../../../support/notes/index-fixture";
import { testItem } from "../../../support/notes/test-note-type";

const quiet = Duration.toMillis(INDEX_BATCH_QUIET);

/** Builds the index, then records the test type's snapshots from then on. */
const ready = Effect.gen(function* () {
  yield* vaultReady;
  yield* built;
  return yield* recordSnapshots(testItem);
});

describe("the note index following the vault", () => {
  it.effect("reads a note after MetadataChanged once the batch is quiet", () => {
    const fixture = indexFixture();
    return Effect.gen(function* () {
      const seen = yield* ready;
      fixture.memory.seed("WEG Manager/A.md", item(1));
      yield* TestClock.adjust(quiet - 1);
      assert.deepStrictEqual(paths(yield* snapshotOf(testItem)), []);
      yield* TestClock.adjust(1);
      const snapshot = yield* until(testItem, (next) => next.notes.length === 1);
      assert.deepStrictEqual(paths(snapshot), ["WEG Manager/A.md"]);
      assert.strictEqual(seen.length, 2);
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("ignores FileCreated and FileModified: MetadataChanged follows each", () => {
    const fixture = indexFixture();
    return Effect.gen(function* () {
      yield* ready;
      yield* publish(AppEvent.FileCreated({ path: "A.md", extension: "md" }));
      yield* publish(AppEvent.FileModified({ path: "A.md", extension: "md" }));
      yield* TestClock.adjust(INDEX_BATCH_MAX);
      assert.strictEqual(fixture.reads(), 0);
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("ignores files that are not Markdown and events that are no file events", () => {
    const fixture = indexFixture();
    return Effect.gen(function* () {
      yield* ready;
      yield* publish(AppEvent.MetadataChanged({ path: "A.canvas", extension: "canvas" }));
      yield* publish(AppEvent.FileDeleted({ path: "A.pdf", extension: "pdf" }));
      yield* publish(AppEvent.FileRenamed({ path: "B.txt", oldPath: "A.txt", extension: "txt" }));
      yield* publish(AppEvent.ActiveFileChanged({ path: "A.md" }));
      yield* TestClock.adjust(INDEX_BATCH_MAX);
      assert.strictEqual(fixture.reads(), 0);
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("removes a deleted note", () => {
    const fixture = indexFixture();
    fixture.memory.seed("A.md", item(1));
    fixture.memory.seed("B.md", item(2));
    return Effect.gen(function* () {
      yield* ready;
      yield* NoteStore.use((store) => store.trash("A.md"));
      yield* TestClock.adjust(quiet);
      const snapshot = yield* until(testItem, (next) => next.notes.length === 1);
      assert.deepStrictEqual(paths(snapshot), ["B.md"]);
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("moves a renamed record to its new path, also out of Markdown and into it", () => {
    const fixture = indexFixture();
    fixture.memory.seed("F/A.md", item(1));
    fixture.memory.seed("F/C.md", item(3));
    return Effect.gen(function* () {
      yield* ready;
      yield* NoteStore.use((store) => store.rename("F/A.md", "B"));
      yield* TestClock.adjust(quiet);
      const renamed = yield* until(testItem, (next) => next.notes[0]?.path === "F/B.md");
      assert.deepStrictEqual(paths(renamed), ["F/B.md", "F/C.md"]);
      assert.strictEqual(renamed.notes[0]?.id, itemId(1));
      // Renamed to another extension outside the store: Obsidian publishes the new extension.
      yield* publish(
        AppEvent.FileRenamed({ path: "F/C.txt", oldPath: "F/C.md", extension: "txt" }),
      );
      yield* NoteStore.use((store) => store.trash("F/C.md"));
      yield* TestClock.adjust(quiet);
      assert.deepStrictEqual(paths(yield* until(testItem, (next) => next.notes.length === 1)), [
        "F/B.md",
      ]);
      fixture.memory.seed("F/D.md", item(4));
      yield* publish(AppEvent.FileRenamed({ path: "F/D.md", oldPath: "F/D.txt", extension: "md" }));
      yield* TestClock.adjust(quiet);
      assert.deepStrictEqual(paths(yield* until(testItem, (next) => next.notes.length === 2)), [
        "F/B.md",
        "F/D.md",
      ]);
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("moves a note that changes its type from one snapshot to the other", () => {
    const fixture = indexFixture();
    fixture.memory.seed("A.md", item(1));
    return Effect.gen(function* () {
      yield* ready;
      fixture.memory.seed("A.md", {
        schema: "weg-manager.test-other/v1",
        id: "test-other-00000000-0000-4000-8000-000000000001",
        title: "Jetzt anders",
      });
      yield* TestClock.adjust(quiet);
      yield* until(testItem, (next) => next.notes.length === 0);
      assert.deepStrictEqual(paths(yield* snapshotOf(testOther)), ["A.md"]);
      fixture.memory.seed("A.md", { schema: "weg-manager.meeting/v1" });
      yield* TestClock.adjust(quiet);
      yield* until(testOther, (next) => next.notes.length === 0);
      assert.deepStrictEqual((yield* unindexed).notes, [
        { path: "A.md", issue: { code: "schema.unknown-type", type: "meeting" } },
      ]);
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("marks duplicates as they appear and clears them as they go", () => {
    const fixture = indexFixture();
    fixture.memory.seed("A.md", item(1));
    return Effect.gen(function* () {
      yield* ready;
      fixture.memory.seed("Kopie.md", item(1));
      yield* TestClock.adjust(quiet);
      const twice = yield* until(testItem, (next) => next.notes.length === 2);
      assert.deepStrictEqual(
        twice.notes.map((note) => note.kind),
        ["read-only", "read-only"],
      );
      fixture.memory.seed("Kopie.md", item(2));
      yield* TestClock.adjust(quiet);
      const apart = yield* until(testItem, (next) =>
        next.notes.every((note) => note.kind === "editable"),
      );
      assert.deepStrictEqual(
        apart.notes.map((note) => note.id),
        [itemId(1), itemId(2)],
      );
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("shows and clears an unreadable note in the root folder as it changes", () => {
    const fixture = indexFixture();
    fixture.memory.seed("WEG Manager/A.md", item(1));
    return Effect.gen(function* () {
      yield* ready;
      fixture.memory.seed("WEG Manager/A.md", "broken");
      fixture.memory.seed("Privat/B.md", "broken");
      yield* TestClock.adjust(quiet);
      yield* until(testItem, (next) => next.notes.length === 0);
      assert.deepStrictEqual((yield* unindexed).notes, [
        { path: "WEG Manager/A.md", issue: { code: "frontmatter.unreadable" } },
      ]);
      fixture.memory.seed("WEG Manager/A.md", "none");
      yield* TestClock.adjust(quiet);
      yield* untilUnindexed((next) => next.notes.length === 0);
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("turns a burst of changes into one publish", () => {
    const fixture = indexFixture();
    return Effect.gen(function* () {
      const seen = yield* ready;
      for (let n = 1; n <= 20; n += 1) {
        fixture.memory.seed(`Sync/${n}.md`, item(n));
        yield* TestClock.adjust(10);
      }
      assert.strictEqual(seen.length, 1);
      yield* TestClock.adjust(quiet - 10);
      yield* until(testItem, (next) => next.notes.length === 20);
      assert.strictEqual(seen.length, 2);
      yield* TestClock.adjust(INDEX_BATCH_MAX);
      assert.strictEqual(seen.length, 2);
      assert.strictEqual(fixture.reads(), 20);
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("publishes a steady stream of changes at least once per maximum wait", () => {
    const fixture = indexFixture();
    const max = Duration.toMillis(INDEX_BATCH_MAX);
    const step = quiet / 2;
    return Effect.gen(function* () {
      const seen = yield* ready;
      // Idle first: the maximum counts from the batch's first event, not from the last batch.
      yield* TestClock.adjust(step);
      for (let n = 1; n * step < max; n += 1) {
        fixture.memory.seed(`Sync/${n}.md`, item(n));
        yield* TestClock.adjust(step);
      }
      assert.strictEqual(seen.length, 1);
      fixture.memory.seed("Sync/last.md", item(99));
      yield* TestClock.adjust(step);
      yield* until(testItem, (next) => next.notes.length > 0);
      assert.strictEqual(seen.length, 2);
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("decodes only the notes whose frontmatter changed", () => {
    const counting = countingType();
    const fixture = indexFixture({ types: [counting.type, testOther] });
    fixture.memory.seed("A.md", item(1));
    fixture.memory.seed("B.md", item(2));
    return Effect.gen(function* () {
      yield* ready;
      assert.strictEqual(counting.decodes(), 2);
      fixture.memory.seed("A.md", item(1), "Nur der Text ist neu.\n");
      fixture.memory.seed("B.md", item(2, { title: "Neu" }));
      yield* TestClock.adjust(quiet);
      yield* until(testItem, (next) => next.notes[1]?.values.title === "Neu");
      assert.strictEqual(counting.decodes(), 3);
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("publishes nothing for a type whose notes did not change, duplicates included", () => {
    const fixture = indexFixture();
    fixture.memory.seed("A.md", item(1));
    fixture.memory.seed("B.md", item(1));
    fixture.memory.seed("C.md", {
      schema: "weg-manager.test-other/v1",
      id: "test-other-00000000-0000-4000-8000-000000000001",
      title: "Andere",
    });
    return Effect.gen(function* () {
      const seen = yield* ready;
      fixture.memory.seed("C.md", {
        schema: "weg-manager.test-other/v1",
        id: "test-other-00000000-0000-4000-8000-000000000001",
        title: "Geändert",
      });
      yield* TestClock.adjust(quiet);
      yield* until(testOther, (next) => next.notes[0]?.values.title === "Geändert");
      yield* settle;
      assert.strictEqual(seen.length, 1);
      assert.deepStrictEqual(
        seen[0]?.notes.map((note) => note.kind),
        ["read-only", "read-only"],
      );
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect(
    "looks for unreadable notes only for a path in the root folder that is no record",
    () => {
      const fixture = indexFixture();
      fixture.memory.seed("WEG Manager/A.md", item(1));
      fixture.memory.seed("Privat/B.md", "none");
      return Effect.gen(function* () {
        yield* ready;
        assert.strictEqual(fixture.scans(), 1);
        fixture.setFailUnreadable(true);
        fixture.memory.seed("WEG Manager/A.md", item(1, { title: "Neu" }));
        fixture.memory.seed("Privat/B.md", "broken");
        yield* TestClock.adjust(quiet);
        const followed = yield* until(testItem, (next) => next.notes[0]?.values.title === "Neu");
        assert.isUndefined(followed.failure);
        assert.strictEqual(fixture.scans(), 1);
      }).pipe(Effect.provide(fixture.layer));
    },
  );

  it.effect("publishes nothing when a re-read finds the same content", () => {
    const fixture = indexFixture();
    fixture.memory.seed("A.md", item(1));
    fixture.memory.seed("B.md", "none");
    return Effect.gen(function* () {
      const seen = yield* ready;
      const before = yield* snapshotOf(testItem);
      fixture.memory.seed("A.md", item(1), "Der Text ist neu.\n");
      fixture.memory.seed("B.md", "none", "Auch neu.\n");
      yield* TestClock.adjust(quiet);
      yield* Effect.yieldNow;
      assert.strictEqual(fixture.reads(), 2);
      assert.strictEqual(seen.length, 1);
      assert.strictEqual((yield* snapshotOf(testItem)).notes[0], before.notes[0]);
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("shows each write through the store once its events are batched", () => {
    const fixture = indexFixture();
    return Effect.gen(function* () {
      yield* ready;
      const store = yield* NoteStore;
      const created = yield* store.create({
        folder: "WEG Manager",
        name: "A",
        frontmatter: item(1),
      });
      yield* TestClock.adjust(quiet);
      assert.deepStrictEqual(paths(yield* until(testItem, (next) => next.notes.length === 1)), [
        created.path,
      ]);
      yield* store.update(created.path, () => Result.succeed({ set: { title: "Neu" } }));
      yield* TestClock.adjust(quiet);
      yield* until(testItem, (next) => next.notes[0]?.values.title === "Neu");
      const renamed = yield* store.rename(created.path, "B");
      yield* TestClock.adjust(quiet);
      yield* until(testItem, (next) => next.notes[0]?.path === renamed.path);
      yield* store.trash(renamed.path);
      yield* TestClock.adjust(quiet);
      yield* until(testItem, (next) => next.notes.length === 0);
    }).pipe(Effect.provide(fixture.layer));
  });
});
