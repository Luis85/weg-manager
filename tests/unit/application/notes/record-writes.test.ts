import { assert, describe, it } from "@effect/vitest";
import { Effect } from "effect";
import {
  NoteNotFoundError,
  NoteStore,
  NoteWriteRefusedError,
} from "../../../../src/application/notes";
import {
  SAMPLE_FOLDER,
  firstSample,
  indexed,
  ready,
  recordFixture,
  sampleId,
  sampleNote,
  samples,
  stored,
  storedPaths,
} from "../../../support/notes/record-fixture";

const VALUES = { title: "Ahornweg 12", code: "AW" };

describe("creating a record", () => {
  it.effect("writes a note named after its title into the type's folder below the root", () => {
    const fixture = recordFixture();
    return Effect.gen(function* () {
      yield* ready;
      const note = yield* samples.create({ ...VALUES, note: "Hof" });
      assert.strictEqual(note.path, `${SAMPLE_FOLDER}/Ahornweg 12.md`);
      const read = yield* stored(note.path);
      assert.deepStrictEqual(Object.entries(read.frontmatter), [
        ["schema", "weg-manager.sample/v1"],
        ["id", sampleId(1)],
        ["title", "Ahornweg 12"],
        ["code", "AW"],
        ["note", "Hof"],
      ]);
      assert.strictEqual(fixture.memory.body(note.path), "");
      yield* indexed;
      assert.deepStrictEqual(
        (yield* samples.list).records.map((record) => record.id),
        [sampleId(1)],
      );
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("uses the root folder from the settings", () => {
    const fixture = recordFixture({ settings: { rootFolder: "Beirat/WEG" } });
    return Effect.gen(function* () {
      yield* ready;
      const note = yield* samples.create(VALUES);
      assert.strictEqual(note.path, "Beirat/WEG/Akten/Ahornweg 12.md");
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("adds (2) when the file name is taken and keeps the title as typed in the note", () => {
    const fixture = recordFixture();
    return Effect.gen(function* () {
      fixture.memory.seed(`${SAMPLE_FOLDER}/Ahornweg 12-14.md`, "none");
      yield* ready;
      const note = yield* samples.create({ ...VALUES, title: "Ahornweg 12/14" });
      assert.strictEqual(note.path, `${SAMPLE_FOLDER}/Ahornweg 12-14 (2).md`);
      assert.strictEqual((yield* stored(note.path)).frontmatter["title"], "Ahornweg 12/14");
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("names the file by the fallback when the title leaves no usable name", () => {
    const fixture = recordFixture();
    return Effect.gen(function* () {
      yield* ready;
      const note = yield* samples.create({ ...VALUES, title: "..." });
      assert.strictEqual(note.path, `${SAMPLE_FOLDER}/AW.md`);
    }).pipe(Effect.provide(fixture.layer));
  });
});

describe("deleting a record", () => {
  it.effect("moves the note to the trash, and the list drops it", () => {
    const fixture = recordFixture();
    return Effect.gen(function* () {
      fixture.memory.seed(`${SAMPLE_FOLDER}/A1.md`, sampleNote(1));
      fixture.memory.seed(`${SAMPLE_FOLDER}/A2.md`, sampleNote(2));
      yield* ready;
      yield* samples.remove(yield* firstSample);
      assert.deepStrictEqual(yield* storedPaths, [`${SAMPLE_FOLDER}/A2.md`]);
      yield* indexed;
      assert.deepStrictEqual(
        (yield* samples.list).records.map((record) => record.id),
        [sampleId(2)],
      );
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("finds a note renamed meanwhile by its id", () => {
    const fixture = recordFixture();
    return Effect.gen(function* () {
      fixture.memory.seed(`${SAMPLE_FOLDER}/A1.md`, sampleNote(1));
      yield* ready;
      const record = yield* firstSample;
      yield* NoteStore.use((store) => store.rename(record.path, "Umbenannt"));
      yield* indexed;
      yield* samples.remove(record);
      assert.deepStrictEqual(yield* storedPaths, []);
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("refuses to trash either note when a copy with the same id appeared meanwhile", () => {
    const fixture = recordFixture();
    return Effect.gen(function* () {
      fixture.memory.seed(`${SAMPLE_FOLDER}/Akte 1.md`, sampleNote(1));
      yield* ready;
      const record = yield* firstSample;
      fixture.memory.seed(`${SAMPLE_FOLDER}/Akte 1 (Kopie).md`, sampleNote(1));
      yield* indexed;
      const error = yield* Effect.flip(samples.remove(record));
      assert.deepStrictEqual(error, new NoteWriteRefusedError({ reason: "duplicate-id" }));
      assert.deepStrictEqual(yield* storedPaths, [
        `${SAMPLE_FOLDER}/Akte 1 (Kopie).md`,
        `${SAMPLE_FOLDER}/Akte 1.md`,
      ]);
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("deletes a note without an id by its own path", () => {
    const fixture = recordFixture();
    return Effect.gen(function* () {
      fixture.memory.seed(`${SAMPLE_FOLDER}/A.md`, sampleNote(1, { title: "A", id: undefined }));
      fixture.memory.seed(`${SAMPLE_FOLDER}/B.md`, sampleNote(2, { title: "B", id: undefined }));
      yield* ready;
      const [, second] = (yield* samples.list).records;
      if (second === undefined) throw new Error("no sample");
      yield* samples.remove(second);
      assert.deepStrictEqual(yield* storedPaths, [`${SAMPLE_FOLDER}/A.md`]);
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("fails with NoteNotFoundError when the note is gone", () => {
    const fixture = recordFixture();
    return Effect.gen(function* () {
      fixture.memory.seed(`${SAMPLE_FOLDER}/A1.md`, sampleNote(1));
      yield* ready;
      const record = yield* firstSample;
      yield* NoteStore.use((store) => store.trash(record.path));
      const error = yield* Effect.flip(samples.remove(record));
      assert.deepStrictEqual(error, new NoteNotFoundError());
    }).pipe(Effect.provide(fixture.layer));
  });
});

/** A notice that confirms a write: its title says what happened, there is nothing more to say. */
const confirmation = (title: string) => ({ severity: "info", title, detail: "" });

describe("the notices that confirm a write", () => {
  it.effect("confirms a created record by its title", () => {
    const fixture = recordFixture();
    return Effect.gen(function* () {
      yield* ready;
      yield* samples.create({ ...VALUES, title: "Tiefgarage Ahornweg" });
      assert.deepStrictEqual(fixture.notifier.messages(), [
        confirmation("„Tiefgarage Ahornweg“ angelegt"),
      ]);
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("confirms a saved record by its new title", () => {
    const fixture = recordFixture();
    return Effect.gen(function* () {
      fixture.memory.seed(`${SAMPLE_FOLDER}/Akte 1.md`, sampleNote(1));
      yield* ready;
      yield* samples.update(yield* firstSample, { title: "Ahornweg 12", code: "A1" });
      assert.deepStrictEqual(fixture.notifier.messages(), [
        confirmation("„Ahornweg 12“ gespeichert"),
      ]);
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("confirms a deleted record by the name it showed", () => {
    const fixture = recordFixture();
    return Effect.gen(function* () {
      fixture.memory.seed(`${SAMPLE_FOLDER}/Ohne Titel.md`, sampleNote(1, { title: undefined }));
      yield* ready;
      yield* samples.remove(yield* firstSample);
      assert.deepStrictEqual(fixture.notifier.messages(), [
        confirmation("„Ohne Titel“ in den Papierkorb verschoben"),
      ]);
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("confirms nothing that failed", () => {
    const fixture = recordFixture();
    return Effect.gen(function* () {
      fixture.memory.seed(`${SAMPLE_FOLDER}/Akte 1.md`, sampleNote(1));
      yield* ready;
      const record = yield* firstSample;
      fixture.memory.setFailWrites(true);
      yield* Effect.flip(samples.create(VALUES));
      yield* Effect.flip(samples.update(record, { title: "Neu", code: "A1" }));
      yield* Effect.flip(samples.remove(record));
      assert.deepStrictEqual(fixture.notifier.messages(), []);
      assert.strictEqual((yield* storedPaths).length, 1);
    }).pipe(Effect.provide(fixture.layer));
  });
});
