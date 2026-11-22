import { assert, describe, expect, it } from "@effect/vitest";
import { Effect, Result } from "effect";
import { vi } from "vitest";
import { NoteStore, NoteWriteRefusedError } from "../../../../src/application/notes";
import { noteStoreLayer } from "../../../../src/infrastructure/obsidian/notes";
import { App, TFile, normalizePath, stringifyYaml } from "../../../support/obsidian";
import { splitFrontmatter } from "../../../support/obsidian/metadata-cache";
import { noteStoreContract, type NoteStoreFixture } from "../../../support/notes/contract";
import { NORMALIZE_CASES } from "../../../support/notes/fidelity";

vi.mock("obsidian", () => import("@test/obsidian"));

const textOf = (frontmatter: Parameters<NoteStoreFixture["seed"]>[1], body = ""): string => {
  if (frontmatter === "none") return body;
  if (frontmatter === "broken") return `---\nschema: [unclosed\n---\n${body}`;
  return `---\n${stringifyYaml(frontmatter)}---\n${body}`;
};

/** The Obsidian adapter on the double, with handles that go through the double's public API. */
const onDouble = (app = new App()): NoteStoreFixture => ({
  layer: noteStoreLayer(app as never),
  seed: (path, frontmatter, body) =>
    Promise.resolve(app.vault.seedFile(path, textOf(frontmatter, body))),
  removeOutside: (path) => {
    const file = app.vault.getFileByPath(path);
    if (file === null) throw new Error(`no file at ${path}`);
    app.metadataCache.forget(file);
    app.vault.remove(file);
  },
  settle: () => app.metadataCache.whenIndexed(),
  body: async (path) => {
    const file = app.vault.getFileByPath(path);
    if (file === null) return undefined;
    const text = await app.vault.read(file);
    return splitFrontmatter(text)?.body ?? text;
  },
  isFolder: (path) => app.vault.getFolderByPath(path) !== null,
  setFailReads: (fail) => {
    app.vault.failReads = fail;
  },
  setFailWrites: (fail) => {
    app.vault.failWrites = fail;
  },
  holdWrites: () => app.vault.holdWrites(),
  releaseWrites: () => app.vault.releaseWrites(),
  heldWrites: () => app.vault.heldWrites(),
});

/** As on Windows and macOS: the disk refuses a second name that differs only in case or form. */
const onCaseInsensitiveDisk = () => {
  const app = new App();
  app.vault.caseInsensitive = true;
  return onDouble(app);
};

noteStoreContract("Obsidian adapter on the double", () => onDouble());
noteStoreContract("Obsidian adapter on a case-insensitive disk", onCaseInsensitiveDisk);

/** The reviewer's note: a comment and unknown keys that a full YAML round trip would change. */
const REVIEWED = [
  "---",
  "# Kommentar des Beirats",
  "plz: 01067",
  "version: 1.10",
  "iban_nr: 12345678901234567890",
  "flow: [a, b]",
  "quoted: 'yes'",
  "schema: weg-manager.community/v1",
  "kind: WEG",
  "---",
  "Body",
  "",
].join("\n");

/** The file's bytes as text, BOM included (`vault.read` drops a BOM, as Obsidian's does). */
const rawText = (app: App, path: string): string => {
  const file = app.vault.getFileByPath(path);
  if (file === null) throw new Error(`no file at ${path}`);
  return app.vault.textOf(file);
};

const run = <A, E>(app: App, use: (store: NoteStore["Service"]) => Effect.Effect<A, E>) =>
  NoteStore.use(use).pipe(Effect.provide(noteStoreLayer(app as never)));

const textAt = (app: App, path: string) => {
  const file = app.vault.getFileByPath(path);
  if (file === null) throw new Error(`no file at ${path}`);
  return app.vault.read(file);
};

describe("Obsidian NoteStore adapter", () => {
  it.effect("writes a new note as one file: YAML frontmatter, then the body", () =>
    Effect.gen(function* () {
      const app = new App();
      yield* run(app, (notes) =>
        notes.create({
          folder: "F",
          name: "A",
          frontmatter: { schema: "weg-manager.community/v1", tags: ["a", "b"], none: null },
          body: "# A\n",
        }),
      );
      assert.strictEqual(
        yield* Effect.promise(() => textAt(app, "F/A.md")),
        "---\nschema: weg-manager.community/v1\ntags:\n  - a\n  - b\nnone:\n---\n# A\n",
      );
    }),
  );

  it.effect("writes a note without frontmatter as its body alone", () =>
    Effect.gen(function* () {
      const app = new App();
      yield* run(app, (notes) => notes.create({ folder: "", name: "A", frontmatter: {} }));
      assert.strictEqual(yield* Effect.promise(() => textAt(app, "A.md")), "");
    }),
  );

  it.effect("returns a written note before the metadata cache has caught up", () =>
    Effect.gen(function* () {
      const app = new App();
      const note = yield* run(app, (notes) =>
        notes.create({ folder: "", name: "A", frontmatter: { schema: "weg-manager.x/v1" } }),
      );
      assert.deepStrictEqual(note.frontmatter, { schema: "weg-manager.x/v1" });
      const file = app.vault.getFileByPath("A.md");
      assert.isTrue(file instanceof TFile);
      assert.isNull(app.metadataCache.getFileCache(file as TFile));
    }),
  );

  it.effect("leaves the file alone when an update changes nothing", () =>
    Effect.gen(function* () {
      const app = new App();
      yield* Effect.promise(() => app.vault.create("A.md", "---\na: 1\n---\nbody\n"));
      const modified = vi.fn<() => void>();
      app.vault.on("modify", modified);
      yield* run(app, (notes) => notes.update("A.md", () => Result.succeed({ set: { a: 1 } })));
      assert.strictEqual(modified.mock.calls.length, 0);
    }),
  );

  it.effect("changes only the line of the key it sets, byte for byte", () =>
    Effect.gen(function* () {
      const app = new App();
      app.vault.seedFile("A.md", REVIEWED);
      const note = yield* run(app, (notes) =>
        notes.update("A.md", () => Result.succeed({ set: { kind: "Haus" } })),
      );
      assert.strictEqual(rawText(app, "A.md"), REVIEWED.replace("kind: WEG", "kind: Haus"));
      assert.deepStrictEqual(note.frontmatter, {
        plz: 1067,
        version: 1.1,
        iban_nr: 12345678901234567000,
        flow: ["a", "b"],
        quoted: "yes",
        schema: "weg-manager.community/v1",
        kind: "Haus",
      });
    }),
  );

  it.effect("saves a note that starts with a BOM and keeps the BOM and its line breaks", () =>
    Effect.gen(function* () {
      const app = new App();
      const text = "\uFEFF---\r\nschema: weg-manager.community/v1\r\nkind: WEG\r\n---\r\nBody\r\n";
      app.vault.seedFile("A.md", text);
      yield* Effect.promise(() => app.metadataCache.whenIndexed());
      const read = yield* run(app, (notes) => notes.read("A.md"));
      assert.deepStrictEqual(read.frontmatter, { schema: "weg-manager.community/v1", kind: "WEG" });
      yield* run(app, (notes) =>
        notes.update("A.md", () => Result.succeed({ set: { kind: "Haus", tags: ["a"] } })),
      );
      assert.strictEqual(
        rawText(app, "A.md"),
        "\uFEFF---\r\nschema: weg-manager.community/v1\r\nkind: Haus\r\ntags:\r\n  - a\r\n---\r\nBody\r\n",
      );
    }),
  );

  it.effect(
    "writes into a block closed by `----` or `--- `, and the cache reads what it wrote",
    () =>
      Effect.gen(function* () {
        const app = new App();
        app.vault.seedFile("A.md", "---\nkind: WEG # Art\n----\nbody\n");
        app.vault.seedFile("B.md", "---\r\nkind: WEG\r\n---  \r\nbody\r\n");
        for (const path of ["A.md", "B.md"]) {
          yield* run(app, (notes) =>
            notes.update(path, () => Result.succeed({ set: { kind: "Haus" } })),
          );
        }
        assert.strictEqual(rawText(app, "A.md"), "---\nkind: Haus # Art\n----\nbody\n");
        assert.strictEqual(rawText(app, "B.md"), "---\r\nkind: Haus\r\n---  \r\nbody\r\n");
        yield* Effect.promise(() => app.metadataCache.whenIndexed());
        const read = yield* run(app, (notes) =>
          Effect.all([notes.read("A.md"), notes.read("B.md")]),
        );
        assert.deepStrictEqual(
          read.map((note) => note.frontmatter),
          [{ kind: "Haus" }, { kind: "Haus" }],
        );
      }),
  );

  it.effect(
    "refuses a note whose frontmatter it cannot edit line by line, and writes nothing",
    () =>
      Effect.gen(function* () {
        const app = new App();
        app.vault.seedFile("A.md", "---\na: 1\n-----\nbody\n");
        const modified = vi.fn<() => void>();
        app.vault.on("modify", modified);
        const error = yield* Effect.flip(
          run(app, (notes) => notes.update("A.md", () => Result.succeed({ set: { a: 2 } }))),
        );
        assert.deepStrictEqual(error, new NoteWriteRefusedError({ reason: "layout" }));
        assert.strictEqual(modified.mock.calls.length, 0);
      }),
  );

  it.effect("writes a new note's values as an update writes them", () =>
    Effect.gen(function* () {
      const app = new App();
      yield* run(app, (notes) =>
        notes.create({ folder: "", name: "A", frontmatter: { plz: "01067", word: "yes" } }),
      );
      assert.strictEqual(rawText(app, "A.md"), '---\nplz: "01067"\nword: "yes"\n---\n');
    }),
  );

  it.effect("counts a frontmatter block that holds nothing as readable", () =>
    Effect.gen(function* () {
      const app = new App();
      app.vault.seedFile("F/Leer.md", "---\n---\nbody\n");
      app.vault.seedFile("F/Kaputt.md", "---\nschema: [unclosed\n---\n");
      app.vault.seedFile("F/Kaputt.txt", "---\nschema: [unclosed\n---\n");
      yield* Effect.promise(() => app.metadataCache.whenIndexed());
      assert.deepStrictEqual(yield* run(app, (notes) => notes.unreadable("F")), ["F/Kaputt.md"]);
    }),
  );

  it.effect("treats a non-Markdown file as no note", () =>
    Effect.gen(function* () {
      const app = new App();
      yield* Effect.promise(() => app.vault.create("A.txt", "x"));
      const error = yield* Effect.flip(run(app, (notes) => notes.read("A.txt")));
      assert.strictEqual(error._tag, "NoteNotFoundError");
    }),
  );
});

describe("the double's normalizePath", () => {
  it.each(NORMALIZE_CASES)("normalizes %j to %j as Obsidian does", (input, expected) => {
    expect(normalizePath(input)).toBe(expected);
  });
});
