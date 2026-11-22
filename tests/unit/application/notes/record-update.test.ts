import { assert, describe, it } from "@effect/vitest";
import { Effect, Fiber, Layer } from "effect";
import {
  NoteEditConflictError,
  NoteNotFoundError,
  NoteStore,
  NoteWriteRefusedError,
} from "../../../../src/application/notes";
import { NoteWriteError } from "../../../../src/application/notes/errors";
import { settle } from "../../../support/notes/index-fixture";
import {
  SAMPLE_FOLDER,
  firstSample,
  indexed,
  ready,
  recordFixture,
  sampleNote,
  samples,
  stored,
  storedPaths,
} from "../../../support/notes/record-fixture";

const PATH = `${SAMPLE_FOLDER}/Akte 1.md`;
const BODY = "Eigene Notizen\n";
const LOADED = { title: "Akte 1", code: "A1" };

/** Seeds sample 1 at `path`, builds the index and loads sample 1 as a form does. */
const loaded = (
  fixture: ReturnType<typeof recordFixture>,
  extra: Record<string, unknown> = {},
  path = PATH,
) =>
  Effect.gen(function* () {
    fixture.memory.seed(path, sampleNote(1, extra), BODY);
    yield* ready;
    return yield* firstSample;
  });

describe("updating a record", () => {
  it.effect(
    "writes the changed fields and keeps an outside change, unknown keys and the body",
    () => {
      const fixture = recordFixture();
      return Effect.gen(function* () {
        const record = yield* loaded(fixture, { reviewer: "Agent" });
        fixture.memory.seed(PATH, { ...record.frontmatter, code: "B1" }, BODY);
        yield* samples.update(record, { ...LOADED, note: "Hof" });
        assert.deepStrictEqual((yield* stored(PATH)).frontmatter, {
          ...record.frontmatter,
          code: "B1",
          note: "Hof",
        });
        assert.strictEqual(fixture.memory.body(PATH), BODY);
      }).pipe(Effect.provide(fixture.layer));
    },
  );

  it.effect("writes nothing and names the conflict when both changed a field", () => {
    const fixture = recordFixture();
    return Effect.gen(function* () {
      const record = yield* loaded(fixture, { note: "Hof" });
      const theirs = { ...record.frontmatter, note: "Keller" };
      fixture.memory.seed(PATH, theirs, BODY);
      const error = yield* Effect.flip(samples.update(record, { ...LOADED, note: "Garten" }));
      assert.deepStrictEqual(
        error,
        new NoteEditConflictError({
          conflicts: [{ key: "note", base: "Hof", edited: "Garten", current: "Keller" }],
        }),
      );
      assert.deepStrictEqual((yield* stored(PATH)).frontmatter, theirs);
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("renames the file with the title while it carries the old title", () => {
    const fixture = recordFixture();
    return Effect.gen(function* () {
      const record = yield* loaded(fixture);
      const note = yield* samples.update(record, { ...LOADED, title: "Ahornweg 12/14" });
      assert.strictEqual(note.path, `${SAMPLE_FOLDER}/Ahornweg 12-14.md`);
      assert.deepStrictEqual(yield* storedPaths, [`${SAMPLE_FOLDER}/Ahornweg 12-14.md`]);
      assert.strictEqual(fixture.memory.body(note.path), BODY);
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("renames a file with a clash suffix and adds one when the new name is taken", () => {
    const fixture = recordFixture();
    return Effect.gen(function* () {
      fixture.memory.seed(`${SAMPLE_FOLDER}/Neu.md`, "none");
      const record = yield* loaded(fixture, {}, `${SAMPLE_FOLDER}/Akte 1 (2).md`);
      const note = yield* samples.update(record, { ...LOADED, title: "Neu" });
      assert.strictEqual(note.path, `${SAMPLE_FOLDER}/Neu (2).md`);
      assert.deepStrictEqual(yield* storedPaths, [`${SAMPLE_FOLDER}/Neu (2).md`]);
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("follows a file named by the fallback the note had, else by the new one", () => {
    const fixture = recordFixture();
    return Effect.gen(function* () {
      const record = yield* loaded(fixture, { title: "..." }, `${SAMPLE_FOLDER}/A1.md`);
      const renamed = yield* samples.update(record, { title: "Neu", code: "B2" });
      assert.strictEqual(renamed.path, `${SAMPLE_FOLDER}/Neu.md`);
      fixture.memory.seed(`${SAMPLE_FOLDER}/C3.md`, sampleNote(2, { title: "...", code: 5 }));
      yield* indexed;
      const broken = (yield* samples.list).records.find((row) => row.fileName === "C3");
      if (broken === undefined) throw new Error("no sample");
      const repaired = yield* samples.update(broken, { title: "Alt", code: "C3" });
      assert.strictEqual(repaired.path, `${SAMPLE_FOLDER}/Alt.md`);
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("keeps a file name the user chose", () => {
    const fixture = recordFixture();
    return Effect.gen(function* () {
      const record = yield* loaded(fixture, {}, `${SAMPLE_FOLDER}/Unsere Akte.md`);
      const note = yield* samples.update(record, { ...LOADED, title: "Neu" });
      assert.strictEqual(note.path, `${SAMPLE_FOLDER}/Unsere Akte.md`);
      assert.strictEqual((yield* stored(note.path)).frontmatter["title"], "Neu");
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("does not rename when the title stays, or the note had none", () => {
    const fixture = recordFixture();
    return Effect.gen(function* () {
      const record = yield* loaded(fixture, {}, `${SAMPLE_FOLDER}/Akte 1 (2).md`);
      const note = yield* samples.update(record, { ...LOADED, note: "Hof" });
      assert.strictEqual(note.path, `${SAMPLE_FOLDER}/Akte 1 (2).md`);
      fixture.memory.seed(`${SAMPLE_FOLDER}/Ohne.md`, sampleNote(2, { title: undefined }));
      yield* indexed;
      const untitled = (yield* samples.list).records.find((row) => row.fileName === "Ohne");
      if (untitled === undefined) throw new Error("no untitled sample");
      const kept = yield* samples.update(untitled, { title: "Neu", code: "A2" });
      assert.strictEqual(kept.path, `${SAMPLE_FOLDER}/Ohne.md`);
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("keeps the saved note when the rename fails, and logs it without a name", () => {
    const fixture = recordFixture();
    return Effect.gen(function* () {
      const record = yield* loaded(fixture);
      for (let n = 1; n <= 100; n += 1) {
        fixture.memory.seed(`${SAMPLE_FOLDER}/${n === 1 ? "Neu" : `Neu (${n})`}.md`, "none");
      }
      const note = yield* samples.update(record, { ...LOADED, title: "Neu" });
      assert.strictEqual(note.path, PATH);
      assert.strictEqual((yield* stored(PATH)).frontmatter["title"], "Neu");
      assert.deepStrictEqual(
        fixture.logger.entries().filter((entry) => entry.event.startsWith("samples.")),
        [{ level: "warn", event: "samples.rename.failed" }],
      );
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("still renames the file when an unload interrupts while the save is written", () => {
    const fixture = recordFixture();
    return Effect.gen(function* () {
      const record = yield* loaded(fixture);
      fixture.memory.holdWrites();
      const saving = yield* Effect.forkChild(samples.update(record, { ...LOADED, title: "Neu" }));
      yield* settle;
      assert.strictEqual(fixture.memory.heldWrites(), 1);
      // `ManagedRuntime.dispose` interrupts the command's fiber and waits for it.
      const unloading = yield* Effect.forkChild(Fiber.interrupt(saving));
      yield* settle;
      fixture.memory.releaseWrites();
      yield* Fiber.join(unloading);
      assert.deepStrictEqual(yield* storedPaths, [`${SAMPLE_FOLDER}/Neu.md`]);
      assert.strictEqual((yield* stored(`${SAMPLE_FOLDER}/Neu.md`)).frontmatter["title"], "Neu");
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("tries up to the hundredth name", () => {
    const fixture = recordFixture();
    return Effect.gen(function* () {
      const record = yield* loaded(fixture);
      for (let n = 1; n <= 99; n += 1) {
        fixture.memory.seed(`${SAMPLE_FOLDER}/${n === 1 ? "Neu" : `Neu (${n})`}.md`, "none");
      }
      const note = yield* samples.update(record, { ...LOADED, title: "Neu" });
      assert.strictEqual(note.path, `${SAMPLE_FOLDER}/Neu (100).md`);
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("stops trying names when the rename fails for another reason", () => {
    const fixture = recordFixture();
    let renames = 0;
    const failing = Layer.effect(
      NoteStore,
      NoteStore.useSync((store) =>
        NoteStore.of({
          ...store,
          rename: () =>
            Effect.suspend(() => {
              renames += 1;
              return Effect.fail(new NoteWriteError({ cause: new Error("disk") }));
            }),
        }),
      ),
    );
    return Effect.gen(function* () {
      const record = yield* loaded(fixture);
      const note = yield* samples
        .update(record, { ...LOADED, title: "Neu" })
        .pipe(Effect.provide(failing));
      assert.strictEqual(note.path, PATH);
      assert.strictEqual(renames, 1);
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("finds a note renamed meanwhile by its id", () => {
    const fixture = recordFixture();
    return Effect.gen(function* () {
      fixture.memory.seed(PATH, sampleNote(1), BODY);
      fixture.memory.seed(`${SAMPLE_FOLDER}/Ablage.md`, sampleNote(2, { title: "Ablage" }));
      yield* ready;
      const record = (yield* samples.list).records[1];
      if (record === undefined) throw new Error("no sample");
      yield* NoteStore.use((store) => store.rename(PATH, "Eigener Name"));
      yield* indexed;
      const note = yield* samples.update(record, { ...LOADED, note: "Hof" });
      assert.strictEqual(note.path, `${SAMPLE_FOLDER}/Eigener Name.md`);
      assert.strictEqual((yield* stored(note.path)).frontmatter["note"], "Hof");
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("refuses to write when a copy with the same id appeared meanwhile", () => {
    const fixture = recordFixture();
    return Effect.gen(function* () {
      const record = yield* loaded(fixture);
      // Sorted by title, the copy comes first: neither of the two may be written (ADR 0007).
      const copy = `${SAMPLE_FOLDER}/Akte 1 (Kopie).md`;
      fixture.memory.seed(copy, sampleNote(1), BODY);
      yield* indexed;
      const error = yield* Effect.flip(samples.update(record, { ...LOADED, note: "Hof" }));
      assert.deepStrictEqual(error, new NoteWriteRefusedError({ reason: "duplicate-id" }));
      assert.deepStrictEqual((yield* stored(PATH)).frontmatter, sampleNote(1));
      assert.deepStrictEqual((yield* stored(copy)).frontmatter, sampleNote(1));
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("fails with NoteNotFoundError when the note is gone", () => {
    const fixture = recordFixture();
    return Effect.gen(function* () {
      const record = yield* loaded(fixture);
      yield* NoteStore.use((store) => store.trash(PATH));
      yield* indexed;
      const error = yield* Effect.flip(samples.update(record, LOADED));
      assert.deepStrictEqual(error, new NoteNotFoundError());
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("refuses to write a note a newer version saved meanwhile", () => {
    const fixture = recordFixture();
    return Effect.gen(function* () {
      const record = yield* loaded(fixture);
      const newer = { ...record.frontmatter, schema: "weg-manager.sample/v2" };
      fixture.memory.seed(PATH, newer, BODY);
      const error = yield* Effect.flip(samples.update(record, { ...LOADED, note: "Hof" }));
      assert.deepStrictEqual(error, new NoteWriteRefusedError({ reason: "newer-version" }));
      assert.deepStrictEqual((yield* stored(PATH)).frontmatter, newer);
    }).pipe(Effect.provide(fixture.layer));
  });
});
