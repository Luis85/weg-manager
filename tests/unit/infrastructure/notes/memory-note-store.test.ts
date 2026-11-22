import { describe, expect, it } from "vitest";
import { memoryNoteStore, normalizePath } from "../../../../src/infrastructure/memory/notes";
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

describe("in-memory normalizePath", () => {
  it.each(NORMALIZE_CASES)("normalizes %j to %j as Obsidian does", (input, expected) => {
    expect(normalizePath(input)).toBe(expected);
  });
});
