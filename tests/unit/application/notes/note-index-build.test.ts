import { assert, describe, it } from "@effect/vitest";
import { Effect, Exit, Layer, Stream } from "effect";
import { TestClock } from "effect/testing";
import { AppEvent } from "../../../../src/application/events";
import { NoteIndex } from "../../../../src/application/notes";
import { INDEX_BATCH_QUIET } from "../../../../src/application/notes/index-batches";
import {
  TYPES,
  built,
  decoded,
  expectedSnapshot,
  indexFixture,
  item,
  itemId,
  paths,
  publish,
  settle,
  snapshotOf,
  testOther,
  unindexed,
  vaultReady,
} from "../../../support/notes/index-fixture";
import { testItem } from "../../../support/notes/test-note-type";

const md = (path: string) => ({ path, extension: "md" });

describe("the note index before VaultReady", () => {
  it.effect("is not ready and empty, also while the vault already holds notes", () => {
    const fixture = indexFixture();
    fixture.memory.seed("WEG Manager/A.md", item(1));
    return Effect.gen(function* () {
      yield* publish(AppEvent.LayoutReady());
      yield* TestClock.adjust(INDEX_BATCH_QUIET);
      const status = { ready: false, failure: undefined };
      assert.deepStrictEqual(yield* snapshotOf(testItem), expectedSnapshot(status));
      assert.deepStrictEqual(yield* snapshotOf(testOther), expectedSnapshot(status));
      assert.deepStrictEqual(yield* unindexed, { ...status, notes: [] });
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("drops the events before it: the build reads them, nothing reads them again", () => {
    const fixture = indexFixture();
    return Effect.gen(function* () {
      yield* publish(AppEvent.LayoutReady());
      fixture.memory.seed("WEG Manager/A.md", item(1));
      yield* publish(AppEvent.MetadataChanged(md("WEG Manager/Fehlt.md")));
      yield* TestClock.adjust(INDEX_BATCH_QUIET);
      yield* publish(AppEvent.VaultReady());
      const snapshot = yield* built;
      yield* TestClock.adjust(INDEX_BATCH_QUIET);
      assert.deepStrictEqual(paths(snapshot), ["WEG Manager/A.md"]);
      assert.strictEqual(fixture.reads(), 0);
    }).pipe(Effect.provide(fixture.layer));
  });
});

describe("the note index's build", () => {
  it.effect("decodes every record of every registered type, sorted by path", () => {
    const fixture = indexFixture();
    fixture.memory.seed("WEG Manager/b.md", item(2));
    fixture.memory.seed("WEG Manager/B.md", item(1));
    fixture.memory.seed("Archiv/Ä.md", item(3, { count: "viele" }));
    fixture.memory.seed("Archiv/Andere.md", {
      schema: "weg-manager.test-other/v1",
      id: "test-other-00000000-0000-4000-8000-000000000001",
      title: "Andere",
    });
    fixture.memory.seed("Archiv/Ohne.md", { title: "keine Notiz des Plugins" });
    return Effect.gen(function* () {
      yield* vaultReady;
      const snapshot = yield* built;
      assert.isTrue(snapshot.ready);
      assert.isUndefined(snapshot.failure);
      assert.deepStrictEqual(paths(snapshot), [
        "Archiv/Ä.md",
        "WEG Manager/B.md",
        "WEG Manager/b.md",
      ]);
      assert.deepStrictEqual(snapshot.notes, [
        decoded("Archiv/Ä.md", item(3, { count: "viele" })),
        decoded("WEG Manager/B.md", item(1)),
        decoded("WEG Manager/b.md", item(2)),
      ]);
      assert.deepStrictEqual(snapshot.notes[0]?.issues, [{ code: "field.number", key: "count" }]);
      const other = yield* snapshotOf(testOther);
      assert.deepStrictEqual(
        other.notes.map((note) => [note.path, note.kind, note.values]),
        [["Archiv/Andere.md", "editable", { title: "Andere" }]],
      );
      assert.deepStrictEqual(yield* unindexed, { ready: true, failure: undefined, notes: [] });
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("marks a duplicate id read-only in every type that shares it", () => {
    const fixture = indexFixture();
    fixture.memory.seed("A.md", item(1));
    fixture.memory.seed("B.md", item(1, { title: "Kopie" }));
    fixture.memory.seed("C.md", item(2));
    return Effect.gen(function* () {
      yield* vaultReady;
      const snapshot = yield* built;
      assert.deepStrictEqual(
        snapshot.notes.map((note) => [note.path, note.kind, note.issues]),
        [
          ["A.md", "read-only", [{ code: "id.duplicate", other: "B.md" }]],
          ["B.md", "read-only", [{ code: "id.duplicate", other: "A.md" }]],
          ["C.md", "editable", []],
        ],
      );
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("keeps a read-only record of its type with its issues", () => {
    const fixture = indexFixture();
    fixture.memory.seed("Neu.md", { ...item(1), schema: "weg-manager.test-item/v9" });
    fixture.memory.seed("Ohne id.md", { ...item(2), id: undefined });
    return Effect.gen(function* () {
      yield* vaultReady;
      const snapshot = yield* built;
      assert.deepStrictEqual(
        snapshot.notes.map((note) => [note.path, note.kind, note.issues]),
        [
          ["Neu.md", "read-only", [{ code: "schema.newer", version: 9 }]],
          ["Ohne id.md", "read-only", [{ code: "id.missing" }]],
        ],
      );
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("shows a malformed marker and an unknown type anywhere, by path", () => {
    const fixture = indexFixture();
    fixture.memory.seed("Privat/Kaputt.md", { schema: "weg-manager.Test/1" });
    fixture.memory.seed("WEG Manager/Termin.md", { schema: "weg-manager.meeting/v2" });
    fixture.memory.seed("Archiv/Fremd.md", { schema: "other.thing/v1" });
    return Effect.gen(function* () {
      yield* vaultReady;
      yield* built;
      assert.deepStrictEqual(yield* unindexed, {
        ready: true,
        failure: undefined,
        notes: [
          { path: "Privat/Kaputt.md", issue: { code: "schema.malformed" } },
          {
            path: "WEG Manager/Termin.md",
            issue: { code: "schema.unknown-type", type: "meeting" },
          },
        ],
      });
      assert.deepStrictEqual((yield* snapshotOf(testItem)).notes, []);
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("shows a note with unreadable frontmatter in the root folder only", () => {
    const fixture = indexFixture({ settings: { rootFolder: "Beirat" } });
    fixture.memory.seed("Beirat/Kaputt.md", "broken");
    fixture.memory.seed("Beirat/Punkte/Auch kaputt.md", "broken");
    fixture.memory.seed("Beirat/Ohne.md", "none", "# Text\n");
    fixture.memory.seed("WEG Manager/Kaputt.md", "broken");
    fixture.memory.seed("Beirat Alt/Kaputt.md", "broken");
    return Effect.gen(function* () {
      yield* vaultReady;
      yield* built;
      assert.deepStrictEqual(
        (yield* unindexed).notes,
        ["Beirat/Kaputt.md", "Beirat/Punkte/Auch kaputt.md"].map((path) => ({
          path,
          issue: { code: "frontmatter.unreadable" },
        })),
      );
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("logs counts only", () => {
    const fixture = indexFixture();
    fixture.memory.seed("A.md", item(1));
    fixture.memory.seed("B.md", item(2));
    fixture.memory.seed("C.md", item(3));
    fixture.memory.seed("D.md", { schema: "weg-manager.meeting/v1" });
    fixture.memory.seed("WEG Manager/E.md", "broken");
    return Effect.gen(function* () {
      yield* vaultReady;
      yield* built;
      yield* settle;
      assert.deepStrictEqual(fixture.logger.entries(), [
        { level: "info", event: "notes.index.built", data: { records: 3, unindexed: 2 } },
      ]);
    }).pipe(Effect.provide(fixture.layer));
  });
});

describe("the note index's registry", () => {
  it.effect("dies for a type that is not registered", () => {
    const fixture = indexFixture({ types: [testItem] });
    return Effect.gen(function* () {
      const index = yield* NoteIndex;
      const defect = new Error("The note type test-other is not registered.");
      assert.deepStrictEqual(yield* Effect.exit(index.snapshot(testOther)), Exit.die(defect));
      assert.deepStrictEqual(
        yield* Effect.exit(Stream.runHead(index.changes(testOther))),
        Exit.die(defect),
      );
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("refuses one type name twice", () =>
    Effect.gen(function* () {
      const fixture = indexFixture({ types: [...TYPES, testItem] });
      const exit = yield* Effect.exit(Layer.build(fixture.layer).pipe(Effect.scoped));
      assert.deepStrictEqual(exit, Exit.die(new Error("A note type is registered twice.")));
    }),
  );

  it.effect("holds the records of a type with no notes as an empty list", () => {
    const fixture = indexFixture();
    fixture.memory.seed("A.md", item(1, { id: itemId(7) }));
    return Effect.gen(function* () {
      yield* vaultReady;
      yield* built;
      assert.deepStrictEqual(
        yield* snapshotOf(testOther),
        expectedSnapshot({ ready: true, failure: undefined }),
      );
    }).pipe(Effect.provide(fixture.layer));
  });
});
