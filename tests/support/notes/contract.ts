import { describe } from "@effect/vitest";
import { clashContract } from "./contract-clashes";
import { readContract } from "./contract-reads";
import { writeContract } from "./contract-writes";
import type { NoteStoreFixture } from "./fixture";

export type { NoteStoreFixture } from "./fixture";

/**
 * The behaviour every `NoteStore` adapter promises. `tests/unit/infrastructure/notes/` runs it
 * against the in-memory adapter and against the Obsidian adapter on the Obsidian double, case for
 * case, so the two cannot drift apart.
 */
export const noteStoreContract = (name: string, make: () => NoteStoreFixture) => {
  describe(`NoteStore contract: ${name}`, () => {
    readContract(make);
    writeContract(make);
    clashContract(make);
  });
};
