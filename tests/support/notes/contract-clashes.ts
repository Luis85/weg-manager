import { assert, describe, it } from "@effect/vitest";
import { Effect } from "effect";
import { COMMUNITY, promise, run, type NoteStoreFixture } from "./fixture";

/** "Müller" with the umlaut decomposed, as macOS writes file names (NFD). */
const MUELLER_NFD = "Müller";
/** "Müller" composed, as Windows, Linux and `normalizePath` write it (NFC). */
const MUELLER_NFC = "Müller";

/**
 * Names clash as on Windows and macOS, the product's platforms: regardless of case and of the
 * Unicode form (NFC or NFD) of a name. `contract.ts` runs it.
 */
export const clashContract = (make: () => NoteStoreFixture) => {
  describe("name clashes by case and Unicode form", () => {
    it.effect("creates a note whose name differs only in case with (2)", () =>
      Effect.gen(function* () {
        const fixture = make();
        yield* promise(() => fixture.seed("F/Ahornweg.md", COMMUNITY));
        const note = yield* run(fixture, (store) =>
          store.create({ folder: "F", name: "ahornweg", frontmatter: COMMUNITY }),
        );
        assert.strictEqual(note.path, "F/ahornweg (2).md");
        assert.strictEqual(yield* promise(() => fixture.body("F/Ahornweg.md")), "");
      }),
    );

    it.effect("counts a folder whose name differs only in case as taken", () =>
      Effect.gen(function* () {
        const fixture = make();
        yield* promise(() => fixture.seed("F/AHORNWEG.md/inner.md", "none"));
        const note = yield* run(fixture, (store) =>
          store.create({ folder: "F", name: "Ahornweg", frontmatter: {} }),
        );
        assert.strictEqual(note.path, "F/Ahornweg (2).md");
      }),
    );

    it.effect("creates a note whose name differs only in its Unicode form with (2)", () =>
      Effect.gen(function* () {
        const fixture = make();
        yield* promise(() => fixture.seed(`F/${MUELLER_NFD}.md`, "none", "von macOS\n"));
        const note = yield* run(fixture, (store) =>
          store.create({ folder: "F", name: MUELLER_NFC, frontmatter: COMMUNITY }),
        );
        assert.strictEqual(note.path, `F/${MUELLER_NFC} (2).md`);
        assert.strictEqual(
          yield* promise(() => fixture.body(`F/${MUELLER_NFD}.md`)),
          "von macOS\n",
        );
      }),
    );

    it.effect("keeps a name that only another folder holds", () =>
      Effect.gen(function* () {
        const fixture = make();
        yield* promise(() => fixture.seed("G/Ahornweg.md", "none"));
        const note = yield* run(fixture, (store) =>
          store.create({ folder: "F", name: "ahornweg", frontmatter: {} }),
        );
        assert.strictEqual(note.path, "F/ahornweg.md");
      }),
    );

    it.effect("refuses a rename onto another note's name in another case", () =>
      Effect.gen(function* () {
        const fixture = make();
        yield* promise(async () => {
          await fixture.seed("F/Alt.md", COMMUNITY, "alt\n");
          await fixture.seed("F/Besetzt.md", "none", "besetzt\n");
          await fixture.settle();
        });
        const error = yield* Effect.flip(
          run(fixture, (store) => store.rename("F/Alt.md", "BESETZT")),
        );
        assert.strictEqual(error._tag, "NotePathTakenError");
        assert.deepStrictEqual(
          yield* promise(async () => [
            await fixture.body("F/Alt.md"),
            await fixture.body("F/Besetzt.md"),
          ]),
          ["alt\n", "besetzt\n"],
        );
      }),
    );

    it.effect("renames a note to its own name in another case", () =>
      Effect.gen(function* () {
        const fixture = make();
        yield* promise(async () => {
          await fixture.seed("F/Ahornweg.md", COMMUNITY, "text\n");
          await fixture.settle();
        });
        const note = yield* run(fixture, (store) => store.rename("F/Ahornweg.md", "ahornweg"));
        assert.deepStrictEqual(note, { path: "F/ahornweg.md", frontmatter: COMMUNITY });
        assert.strictEqual(yield* promise(() => fixture.body("F/ahornweg.md")), "text\n");
        assert.isUndefined(yield* promise(() => fixture.body("F/Ahornweg.md")));
        yield* promise(() => fixture.settle());
        assert.deepStrictEqual(yield* run(fixture, (store) => store.list), [note]);
      }),
    );
  });
};
