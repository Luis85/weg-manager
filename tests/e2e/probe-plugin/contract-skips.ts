/**
 * Why a NoteStore contract case cannot run in real Obsidian: the fixture knob it needs has no
 * counterpart in a real app (`contract-fixture.ts` throws `SkipCase` with one of these). Shared
 * with `tests/e2e/specs/note-store-contract.e2e.ts`, which lists the skipped cases by name.
 */
export const SKIP_REASONS = {
  failReads: "needs a vault whose reads fail; a real vault cannot be made to fail them",
  failWrites: "needs a vault whose writes fail; a real vault cannot be made to fail them",
  holdWrites: "needs a write held at the vault; a real vault cannot hold one",
  unnoticed:
    "needs the moment between an outside delete and Obsidian's file watcher, a few milliseconds, too short to aim at (note-vanished.e2e.ts holds the vault's listing instead)",
} as const;
