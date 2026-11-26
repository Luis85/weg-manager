import { assert, describe, it } from "@effect/vitest";
import { Effect, Result } from "effect";
import { NoteNotFoundError } from "../../../src/application/notes";
import { promise, run, type NoteStoreFixture } from "./fixture";

const NOTE = { schema: "weg-manager.community/v1", name: "Alt", unknown: "kept" };

/**
 * The contract's body section writes (ADR 0007, amendment 26.11.2026): an update may also change
 * the body, in the same atomic write, and `readBody` reads it from the file. `contract.ts` runs it.
 */
export const bodyContract = (make: () => NoteStoreFixture) => {
  describe("update with a body edit", () => {
    it.effect("writes the patch and the edited body in one write, unknown keys kept", () =>
      Effect.gen(function* () {
        const fixture = make();
        yield* promise(() => fixture.seed("F/A.md", NOTE, "# Notizen\n\nmeins\n"));
        yield* promise(() => fixture.settle());
        const note = yield* run(fixture, (store) =>
          store.update(
            "F/A.md",
            () => Result.succeed({ set: { name: "Neu" }, remove: [] }),
            (body, eol) => `${body}${eol}## Verlauf${eol}${eol}- eins${eol}`,
          ),
        );
        assert.deepStrictEqual(note.frontmatter, { ...NOTE, name: "Neu" });
        yield* promise(() => fixture.settle());
        assert.strictEqual(
          yield* promise(() => fixture.body("F/A.md")),
          "# Notizen\n\nmeins\n\n## Verlauf\n\n- eins\n",
        );
        assert.deepStrictEqual((yield* run(fixture, (store) => store.read("F/A.md"))).frontmatter, {
          ...NOTE,
          name: "Neu",
        });
      }),
    );

    it.effect("writes a body edit alone, the frontmatter as it was", () =>
      Effect.gen(function* () {
        const fixture = make();
        yield* promise(() => fixture.seed("F/A.md", NOTE, "Text\n"));
        yield* promise(() => fixture.settle());
        yield* run(fixture, (store) =>
          store.update(
            "F/A.md",
            () => Result.succeed({ set: {}, remove: [] }),
            (body) => `${body}- zwei\n`,
          ),
        );
        yield* promise(() => fixture.settle());
        assert.strictEqual(yield* promise(() => fixture.body("F/A.md")), "Text\n- zwei\n");
        assert.deepStrictEqual(
          (yield* run(fixture, (store) => store.read("F/A.md"))).frontmatter,
          NOTE,
        );
      }),
    );

    it.effect("writes nothing when the patch is empty and the body stays as it is", () =>
      Effect.gen(function* () {
        const fixture = make();
        yield* promise(() => fixture.seed("F/A.md", NOTE, "Text\n"));
        yield* promise(() => fixture.settle());
        const note = yield* run(fixture, (store) =>
          store.update(
            "F/A.md",
            () => Result.succeed({ set: {}, remove: [] }),
            (body) => body,
          ),
        );
        assert.deepStrictEqual(note, { path: "F/A.md", frontmatter: NOTE });
        assert.strictEqual(yield* promise(() => fixture.body("F/A.md")), "Text\n");
      }),
    );
  });

  describe("readBody", () => {
    it.effect("reads the text after the frontmatter, as the file holds it now", () =>
      Effect.gen(function* () {
        const fixture = make();
        yield* promise(() => fixture.seed("F/A.md", NOTE, "# Notizen\n\n- eins\n"));
        yield* promise(() => fixture.settle());
        assert.strictEqual(
          yield* run(fixture, (store) => store.readBody("/F/A.md")),
          "# Notizen\n\n- eins\n",
        );
      }),
    );

    it.effect("is NoteNotFoundError for a path without a note", () =>
      Effect.gen(function* () {
        const fixture = make();
        const error = yield* Effect.flip(run(fixture, (store) => store.readBody("F/Nichts.md")));
        assert.instanceOf(error, NoteNotFoundError);
      }),
    );
  });
};
