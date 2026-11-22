import { assert, describe, it } from "@effect/vitest";
import { Effect, Fiber, Stream } from "effect";
import { NoteIndexReadError, defineRecords, fileNameOf } from "../../../../src/application/notes";
import { settle } from "../../../support/notes/index-fixture";
import {
  SAMPLE_FOLDER,
  indexed,
  ready,
  recordFixture,
  sampleId,
  sampleNote,
  sampleType,
  samples,
} from "../../../support/notes/record-fixture";

const decoded = (path: string, frontmatter: Record<string, unknown>) => {
  const note = sampleType.decode({ path, frontmatter });
  if (note.kind === "not-this-type") throw new Error("not a sample");
  return note;
};

const listOf = (...notes: ReturnType<typeof decoded>[]) =>
  samples.toList({ ready: true, failure: undefined, notes });

describe("a record list (defineRecords)", () => {
  it("keeps the index's status and is empty without notes", () => {
    const failure = new NoteIndexReadError();
    assert.deepStrictEqual(samples.toList({ ready: false, failure, notes: [] }), {
      ready: false,
      failure,
      records: [],
    });
  });

  it("shows each note with its path, file name, id, values, issues and whether it may be edited", () => {
    const frontmatter = sampleNote(1, { title: "Ahornweg 12", note: 7 });
    assert.deepStrictEqual(
      listOf(decoded(`${SAMPLE_FOLDER}/Ahornweg 12.md`, frontmatter)).records,
      [
        {
          path: `${SAMPLE_FOLDER}/Ahornweg 12.md`,
          fileName: "Ahornweg 12",
          id: sampleId(1),
          editable: true,
          values: { title: "Ahornweg 12", code: "A1" },
          issues: [{ key: "note", code: "field.text" }],
          frontmatter,
        },
      ],
    );
  });

  it("sorts by title as people read it, then by path, and puts untitled notes by file name", () => {
    const list = listOf(
      decoded("b/Zeta.md", sampleNote(1, { title: "Zeta" })),
      decoded("a/Weg 10.md", sampleNote(2, { title: "Weg 10" })),
      decoded("a/Weg 9.md", sampleNote(3, { title: "Weg 9" })),
      decoded("a/Ähre.md", sampleNote(4, { title: "Ähre" })),
      decoded("a/Zeta.md", sampleNote(5, { title: "Zeta" })),
      decoded("c/Mitte.md", sampleNote(6, { title: undefined })),
    );
    assert.deepStrictEqual(
      list.records.map((record) => record.path),
      ["a/Ähre.md", "c/Mitte.md", "a/Weg 9.md", "a/Weg 10.md", "a/Zeta.md", "b/Zeta.md"],
    );
  });

  it("lists a read-only note with its issues", () => {
    const frontmatter = sampleNote(1, { schema: "weg-manager.sample/v3" });
    assert.deepStrictEqual(listOf(decoded("N.md", frontmatter)).records[0], {
      path: "N.md",
      fileName: "N",
      id: sampleId(1),
      editable: false,
      values: {},
      issues: [{ code: "schema.newer", version: 3 }],
      frontmatter,
    });
  });

  it("names a record by its title, else by its file name", () => {
    const { records } = listOf(
      decoded("x/Datei A.md", sampleNote(1, { title: "Ahornweg" })),
      decoded("x/Datei B.md", sampleNote(2, { title: 3 })),
      decoded("x/Notes.md über C.md", sampleNote(3, { title: 4 })),
    );
    assert.deepStrictEqual(records.map(samples.shownName), [
      "Ahornweg",
      "Datei B",
      "Notes.md über C",
    ]);
  });

  it("gives a field issue the data the feature adds, and the issues between records", () => {
    const coded = defineRecords({
      type: sampleType,
      title: "title",
      fallbackName: (values) => values.code,
      log: "samples",
      issue: (issue, frontmatter) =>
        issue.code === "field.text" ? { ...issue, value: String(frontmatter[issue.key]) } : issue,
      between: (rows, shownName) => rows.filter((row) => shownName(row) !== "B"),
    });
    const { records } = coded.toList({
      ready: true,
      failure: undefined,
      notes: [
        decoded("B.md", sampleNote(2, { title: "B" })),
        decoded("A.md", sampleNote(1, { title: "A", note: 7 })),
      ],
    });
    assert.deepStrictEqual(
      records.map((record) => record.issues),
      [[{ key: "note", code: "field.text", value: "7" }]],
    );
  });
});

describe("fileNameOf", () => {
  it("is the file name of a path, without folder and .md", () => {
    assert.strictEqual(fileNameOf("WEG Manager/Akten/Ahornweg 12.md"), "Ahornweg 12");
    assert.strictEqual(fileNameOf("Ohne Ordner.md"), "Ohne Ordner");
    assert.strictEqual(fileNameOf("a/Notes.md über C.md"), "Notes.md über C");
  });
});

describe("the list as a view follows it", () => {
  it.effect("reads the index's records now", () => {
    const fixture = recordFixture();
    return Effect.gen(function* () {
      assert.deepStrictEqual(yield* samples.list, {
        ready: false,
        failure: undefined,
        records: [],
      });
      fixture.memory.seed(`${SAMPLE_FOLDER}/A1.md`, sampleNote(1));
      yield* ready;
      const list = yield* samples.list;
      assert.isTrue(list.ready);
      assert.deepStrictEqual(
        list.records.map((record) => record.id),
        [sampleId(1)],
      );
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("emits the list now, then each change of the index", () => {
    const fixture = recordFixture();
    return Effect.gen(function* () {
      fixture.memory.seed(`${SAMPLE_FOLDER}/A1.md`, sampleNote(1));
      yield* ready;
      const seen = yield* Effect.forkChild(
        Stream.runCollect(
          Stream.map(Stream.take(samples.changes, 2), (list) =>
            list.records.map(samples.shownName),
          ),
        ),
      );
      yield* settle;
      fixture.memory.seed(`${SAMPLE_FOLDER}/A2.md`, sampleNote(2, { title: "Ahornweg" }));
      yield* indexed;
      assert.deepStrictEqual(yield* Fiber.join(seen), [["Akte 1"], ["Ahornweg", "Akte 1"]]);
    }).pipe(Effect.provide(fixture.layer));
  });
});
