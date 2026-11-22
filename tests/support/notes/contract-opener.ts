import { assert, describe, it } from "@effect/vitest";
import { Effect, type Layer } from "effect";
import { NoteOpener } from "../../../src/application/notes";

/** One `NoteOpener` adapter under test, with a way to put notes in and to see what it opened. */
export type NoteOpenerFixture = {
  readonly layer: Layer.Layer<NoteOpener>;
  seed(path: string): Promise<void>;
  /** The paths opened so far, each in a tab of its own. */
  opened(): readonly string[];
};

const open = (fixture: NoteOpenerFixture, path: string) =>
  NoteOpener.use((opener) => opener.open(path)).pipe(Effect.provide(fixture.layer));

/**
 * What every `NoteOpener` adapter promises: it opens a Markdown note by its path, normalised, and
 * fails with `NoteNotFoundError` for a path that holds no Markdown note.
 */
export const noteOpenerContract = (name: string, make: () => NoteOpenerFixture) => {
  describe(`NoteOpener contract: ${name}`, () => {
    it.effect("opens a note by its path, normalised", () =>
      Effect.gen(function* () {
        const fixture = make();
        yield* Effect.promise(() => fixture.seed("Notizen/Fremd.md"));
        yield* open(fixture, "Notizen//Fremd.md");
        assert.deepStrictEqual(fixture.opened(), ["Notizen/Fremd.md"]);
      }),
    );

    it.effect("fails with NoteNotFoundError for a path without a note", () =>
      Effect.gen(function* () {
        const fixture = make();
        const error = yield* Effect.flip(open(fixture, "Notizen/Weg.md"));
        assert.strictEqual(error._tag, "NoteNotFoundError");
        assert.deepStrictEqual(fixture.opened(), []);
      }),
    );
  });
};
