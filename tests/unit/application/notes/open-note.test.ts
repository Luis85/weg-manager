import { assert, describe, it } from "@effect/vitest";
import { Effect } from "effect";
import { openNote } from "../../../../src/application/notes";
import { memoryNoteStore } from "../../../../src/infrastructure/memory/notes";

describe("openNote", () => {
  it.effect("opens the note at the path through the NoteOpener", () => {
    const memory = memoryNoteStore();
    memory.seed("Notizen/Fremd.md", "none");
    return Effect.gen(function* () {
      yield* openNote("Notizen/Fremd.md");
      assert.deepStrictEqual(memory.opened(), ["Notizen/Fremd.md"]);
      const error = yield* Effect.flip(openNote("Notizen/Weg.md"));
      assert.strictEqual(error._tag, "NoteNotFoundError");
    }).pipe(Effect.provide(memory.opener));
  });
});
