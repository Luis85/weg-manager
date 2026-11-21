import { assert, describe, it } from "@effect/vitest";
import { Effect } from "effect";
import { COMMUNITY, interruptWhileHeld, promise, run, type NoteStoreFixture } from "./fixture";

/** Broken, plain and record notes in and around the folder `WEG Manager`. */
const seedBlocks = (fixture: NoteStoreFixture) =>
  promise(async () => {
    await fixture.seed("WEG Manager/Kaputt.md", "broken");
    await fixture.seed("WEG Manager/Punkte/AW/Auch kaputt.md", "broken", "# Text\n");
    await fixture.seed("WEG Manager/Ahornweg.md", COMMUNITY);
    await fixture.seed("WEG Manager/Ohne Eigenschaften.md", "none", "# Text\n");
    await fixture.seed("WEG Manager Alt/Kaputt.md", "broken");
    await fixture.seed("Privat/Kaputt.md", "broken");
    await fixture.settle();
  });

/** The contract's reads and creates; `contract.ts` runs it. */
export const readContract = (make: () => NoteStoreFixture) => {
  describe("list", () => {
    it.effect("lists every record anywhere in the vault, by path, and nothing else", () =>
      Effect.gen(function* () {
        const fixture = make();
        yield* promise(async () => {
          await fixture.seed("WEG Manager/Gemeinschaften/Ahornweg.md", COMMUNITY);
          await fixture.seed("Archiv/Alt.md", { schema: "weg-manager.community/v1", x: 1 });
          await fixture.seed("Lose.md", { schema: "weg-manager.item/v2" });
          await fixture.seed("Ohne Schema.md", { title: "x" });
          await fixture.seed("Fremd.md", { schema: "other.thing/v1" });
          await fixture.seed("Ohne Eigenschaften.md", "none", "# Text\n");
          await fixture.seed("Kaputt.md", "broken");
          await fixture.settle();
        });
        const notes = yield* run(fixture, (store) => store.list);
        assert.deepStrictEqual(notes, [
          { path: "Archiv/Alt.md", frontmatter: { schema: "weg-manager.community/v1", x: 1 } },
          { path: "Lose.md", frontmatter: { schema: "weg-manager.item/v2" } },
          { path: "WEG Manager/Gemeinschaften/Ahornweg.md", frontmatter: COMMUNITY },
        ]);
      }),
    );

    it.effect("is empty for a vault without records", () =>
      Effect.gen(function* () {
        const fixture = make();
        assert.deepStrictEqual(yield* run(fixture, (store) => store.list), []);
      }),
    );

    it.effect("fails with VaultReadError when the vault cannot be read", () =>
      Effect.gen(function* () {
        const fixture = make();
        fixture.setFailReads(true);
        const error = yield* Effect.flip(run(fixture, (store) => store.list));
        assert.strictEqual(error._tag, "VaultReadError");
      }),
    );
  });

  describe("read", () => {
    it.effect("reads a note by its normalized path, as a copy", () =>
      Effect.gen(function* () {
        const fixture = make();
        yield* promise(async () => {
          await fixture.seed("F/A.md", { ...COMMUNITY, tags: ["a"] });
          await fixture.settle();
        });
        const note = yield* run(fixture, (store) => store.read("/F//A.md"));
        assert.deepStrictEqual(note, {
          path: "F/A.md",
          frontmatter: { ...COMMUNITY, tags: ["a"] },
        });
        (note.frontmatter["tags"] as string[]).push("b");
        const again = yield* run(fixture, (store) => store.read("F/A.md"));
        assert.deepStrictEqual(again.frontmatter["tags"], ["a"]);
      }),
    );

    it.effect("reads a note without frontmatter, or with broken YAML, as {}", () =>
      Effect.gen(function* () {
        const fixture = make();
        yield* promise(async () => {
          await fixture.seed("Plain.md", "none", "# Plain\n");
          await fixture.seed("Broken.md", "broken");
          await fixture.settle();
        });
        const plain = yield* run(fixture, (store) => store.read("Plain.md"));
        const broken = yield* run(fixture, (store) => store.read("Broken.md"));
        assert.deepStrictEqual(
          [plain, broken],
          [
            { path: "Plain.md", frontmatter: {} },
            { path: "Broken.md", frontmatter: {} },
          ],
        );
      }),
    );

    it.effect("fails with NoteNotFoundError for a missing note or a folder", () =>
      Effect.gen(function* () {
        const fixture = make();
        yield* promise(() => fixture.seed("F/A.md", COMMUNITY));
        for (const path of ["F/B.md", "F", "A.md"]) {
          const error = yield* Effect.flip(run(fixture, (store) => store.read(path)));
          assert.strictEqual(error._tag, "NoteNotFoundError");
        }
      }),
    );

    it.effect("fails with VaultReadError when the vault cannot be read", () =>
      Effect.gen(function* () {
        const fixture = make();
        yield* promise(async () => {
          await fixture.seed("A.md", COMMUNITY);
          await fixture.settle();
        });
        fixture.setFailReads(true);
        const error = yield* Effect.flip(run(fixture, (store) => store.read("A.md")));
        assert.strictEqual(error._tag, "VaultReadError");
      }),
    );
  });

  describe("unreadable", () => {
    it.effect("lists the notes in a folder and below whose frontmatter is broken, by path", () =>
      Effect.gen(function* () {
        const fixture = make();
        yield* seedBlocks(fixture);
        const inRoot = yield* run(fixture, (store) => store.unreadable("/WEG Manager/"));
        assert.deepStrictEqual(inRoot, [
          "WEG Manager/Kaputt.md",
          "WEG Manager/Punkte/AW/Auch kaputt.md",
        ]);
      }),
    );

    it.effect("lists every such note in the vault for the vault root", () =>
      Effect.gen(function* () {
        const fixture = make();
        yield* seedBlocks(fixture);
        assert.deepStrictEqual(yield* run(fixture, (store) => store.unreadable("/")), [
          "Privat/Kaputt.md",
          "WEG Manager Alt/Kaputt.md",
          "WEG Manager/Kaputt.md",
          "WEG Manager/Punkte/AW/Auch kaputt.md",
        ]);
      }),
    );

    it.effect("is empty for a folder without such notes, or no folder at all", () =>
      Effect.gen(function* () {
        const fixture = make();
        yield* seedBlocks(fixture);
        assert.deepStrictEqual(yield* run(fixture, (store) => store.unreadable("Fehlt")), []);
        assert.deepStrictEqual(yield* run(fixture, (store) => store.unreadable("WEG")), []);
      }),
    );

    it.effect("fails with VaultReadError when the vault cannot be read", () =>
      Effect.gen(function* () {
        const fixture = make();
        yield* seedBlocks(fixture);
        fixture.setFailReads(true);
        const error = yield* Effect.flip(run(fixture, (store) => store.unreadable("/")));
        assert.strictEqual(error._tag, "VaultReadError");
      }),
    );
  });

  describe("create", () => {
    it.effect("creates the missing folders and the note, and returns it as written", () =>
      Effect.gen(function* () {
        const fixture = make();
        const note = yield* run(fixture, (store) =>
          store.create({
            folder: "/WEG Manager//Gemeinschaften/",
            name: "Ahornweg 12",
            frontmatter: COMMUNITY,
            body: "# Ahornweg\n",
          }),
        );
        const path = "WEG Manager/Gemeinschaften/Ahornweg 12.md";
        assert.deepStrictEqual(note, { path, frontmatter: COMMUNITY });
        assert.isTrue(fixture.isFolder("WEG Manager"));
        assert.isTrue(fixture.isFolder("WEG Manager/Gemeinschaften"));
        assert.strictEqual(yield* promise(() => fixture.body(path)), "# Ahornweg\n");
        yield* promise(() => fixture.settle());
        assert.deepStrictEqual(yield* run(fixture, (store) => store.list), [note]);
      }),
    );

    it.effect("creates a note in the vault root, with an empty body by default", () =>
      Effect.gen(function* () {
        const fixture = make();
        const note = yield* run(fixture, (store) =>
          store.create({ folder: "", name: "Wurzel", frontmatter: COMMUNITY }),
        );
        assert.strictEqual(note.path, "Wurzel.md");
        assert.strictEqual(yield* promise(() => fixture.body("Wurzel.md")), "");
      }),
    );

    it.effect("resolves a name clash with (2), (3), …", () =>
      Effect.gen(function* () {
        const fixture = make();
        yield* promise(() => fixture.seed("F/A.md", "none"));
        const second = yield* run(fixture, (store) =>
          store.create({ folder: "F", name: "A", frontmatter: COMMUNITY }),
        );
        const third = yield* run(fixture, (store) =>
          store.create({ folder: "F", name: "A", frontmatter: COMMUNITY }),
        );
        assert.deepStrictEqual([second.path, third.path], ["F/A (2).md", "F/A (3).md"]);
      }),
    );

    it.effect("refuses an unusable name and creates nothing", () =>
      Effect.gen(function* () {
        const fixture = make();
        const error = yield* Effect.flip(
          run(fixture, (store) => store.create({ folder: "F", name: "a/b", frontmatter: {} })),
        );
        assert.deepStrictEqual(
          [error._tag, "issue" in error && error.issue],
          ["InvalidNoteNameError", "forbidden-character"],
        );
        assert.isFalse(fixture.isFolder("F"));
      }),
    );

    it.effect("fails with NoteWriteError when the vault rejects the write", () =>
      Effect.gen(function* () {
        const fixture = make();
        fixture.setFailWrites(true);
        const error = yield* Effect.flip(
          run(fixture, (store) => store.create({ folder: "F", name: "A", frontmatter: {} })),
        );
        assert.strictEqual(error._tag, "NoteWriteError");
        assert.isUndefined(yield* promise(() => fixture.body("F/A.md")));
      }),
    );

    it.effect("completes a create that has started, also when interrupted", () =>
      Effect.gen(function* () {
        const fixture = make();
        yield* interruptWhileHeld(
          fixture,
          run(fixture, (store) => store.create({ folder: "F", name: "A", frontmatter: COMMUNITY })),
        );
        assert.strictEqual(yield* promise(() => fixture.body("F/A.md")), "");
      }),
    );
  });
};
