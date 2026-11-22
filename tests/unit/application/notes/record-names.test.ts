import { assert, describe, it } from "@effect/vitest";
import { Effect, Fiber, Stream } from "effect";
import { shownReference } from "../../../../src/application/notes";
import {
  SAMPLE_FOLDER,
  indexed,
  ready,
  recordFixture,
  sampleId,
  sampleNote,
  samples,
} from "../../../support/notes/record-fixture";

describe("the shown names of referenced records (PBI-71)", () => {
  it.effect("names a record by its title, else its file name, and none for an unknown id", () => {
    const fixture = recordFixture();
    return Effect.gen(function* () {
      fixture.memory.seed(`${SAMPLE_FOLDER}/Akte 1.md`, sampleNote(1, { title: "Ahornweg 12" }));
      fixture.memory.seed(`${SAMPLE_FOLDER}/Ohne Titel.md`, sampleNote(2, { title: null }));
      yield* ready;
      const names = yield* samples.names;
      assert.strictEqual(names(sampleId(1)), "Ahornweg 12");
      assert.strictEqual(names(sampleId(2)), "Ohne Titel");
      assert.strictEqual(names(sampleId(3)), undefined);
      assert.strictEqual(shownReference(names, sampleId(1)), "Ahornweg 12");
      assert.strictEqual(shownReference(names, sampleId(3)), sampleId(3));
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("follows the index: the current names first, then each change", () => {
    const fixture = recordFixture();
    return Effect.gen(function* () {
      fixture.memory.seed(`${SAMPLE_FOLDER}/Akte 1.md`, sampleNote(1));
      yield* ready;
      const seen = yield* Effect.forkChild(
        samples.nameChanges.pipe(
          Stream.map((names) => names(sampleId(1))),
          Stream.take(2),
          Stream.runCollect,
        ),
      );
      yield* indexed;
      fixture.memory.seed(`${SAMPLE_FOLDER}/Akte 1.md`, sampleNote(1, { title: "Akte 1a" }));
      yield* indexed;
      assert.deepStrictEqual(yield* Fiber.join(seen), ["Akte 1", "Akte 1a"]);
    }).pipe(Effect.provide(fixture.layer));
  });
});
