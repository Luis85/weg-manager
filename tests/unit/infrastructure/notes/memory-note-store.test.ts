import { Effect, Result } from "effect";
import { describe, expect, it } from "vitest";
import { NoteStore } from "../../../../src/application/notes";
import {
  TEST_ONLY_MARKER,
  memoryNoteStore,
  normalizePath,
} from "../../../../src/infrastructure/memory/notes";
import { noteStoreContract } from "../../../support/notes/contract";
import { noteOpenerContract } from "../../../support/notes/contract-opener";
import { NORMALIZE_CASES } from "../../../support/notes/fidelity";

noteStoreContract("in-memory adapter", () => {
  const memory = memoryNoteStore();
  return {
    ...memory,
    seed: (path, frontmatter, body) => Promise.resolve(memory.seed(path, frontmatter, body)),
    settle: () => Promise.resolve(),
    body: (path) => Promise.resolve(memory.body(path)),
  };
});

noteOpenerContract("in-memory adapter", () => {
  const memory = memoryNoteStore();
  return {
    layer: memory.opener,
    seed: (path) => Promise.resolve(memory.seed(path, "none")),
    opened: memory.opened,
  };
});

/** The text of the made-up failure an effect ends with: `error.cause.message`. */
const causeOf = (effect: Effect.Effect<unknown, { readonly cause?: unknown }>) =>
  Effect.runPromise(Effect.flip(effect)).then((error) =>
    error.cause instanceof Error ? error.cause.message : "",
  );

describe("the failures the in-memory adapter makes up", () => {
  it("carry the test-only marker, which check:dist looks for in the plugin bundle, and say what failed", async () => {
    const memory = memoryNoteStore();
    const use = <A, E>(action: (store: NoteStore["Service"]) => Effect.Effect<A, E>) =>
      NoteStore.use(action).pipe(Effect.provide(memory.layer));
    memory.seed("A.md", { schema: "weg-manager.community/v1" });
    memory.seed("Kaputt.md", "broken");
    memory.setFailReads(true);
    expect(await causeOf(use((store) => store.list))).toBe(`${TEST_ONLY_MARKER}: read failed`);
    memory.setFailReads(false);
    memory.setFailWrites(true);
    expect(await causeOf(use((store) => store.trash("A.md")))).toBe(
      `${TEST_ONLY_MARKER}: write failed`,
    );
    memory.setFailWrites(false);
    expect(await causeOf(use((store) => store.update("Kaputt.md", () => Result.succeed({}))))).toBe(
      `${TEST_ONLY_MARKER}: broken YAML`,
    );
  });
});

describe("in-memory normalizePath", () => {
  it.each(NORMALIZE_CASES)("normalizes %j to %j as Obsidian does", (input, expected) => {
    expect(normalizePath(input)).toBe(expected);
  });
});
