import { assert } from "@effect/vitest";
import { Effect, Fiber, type Layer } from "effect";
import { NoteStore, type Frontmatter } from "../../../src/application/notes";
import { eventually } from "../wait";

/** One adapter under test, with the handles the contract needs to look behind the port. */
export type NoteStoreFixture = {
  readonly layer: Layer.Layer<NoteStore>;
  /** A note written from outside the plugin, as a person, Sync or an agent would. */
  seed(path: string, frontmatter: Frontmatter | "none" | "broken", body?: string): Promise<void>;
  /** Deletes a note from outside the plugin (a person, Sync), as Obsidian then sees it. */
  removeOutside(path: string): void;
  /**
   * Deletes a note from outside the plugin before the host has noticed: Obsidian still lists the
   * file, which is gone from the disk, for the moment until its file watcher reports the delete
   * (measured in 1.15.1, `tests/e2e/specs/note-vanished.e2e.ts`). A host that has no such moment
   * deletes it as `removeOutside` does.
   */
  removeOutsideUnnoticed(path: string): void;
  /** Waits until reads see every write; Obsidian's metadata cache catches up a moment later. */
  settle(): Promise<void>;
  /** The note's body (text after the frontmatter), or `undefined` when there is no such note. */
  body(path: string): Promise<string | undefined>;
  isFolder(path: string): boolean;
  setFailReads(fail: boolean): void;
  setFailWrites(fail: boolean): void;
  holdWrites(): void;
  releaseWrites(): void;
  heldWrites(): number;
};

export const COMMUNITY = { schema: "weg-manager.community/v1", name: "Ahornweg 12" };

/** Runs `use` with the fixture's store. */
export const run = <A, E>(
  fixture: NoteStoreFixture,
  use: (store: NoteStore["Service"]) => Effect.Effect<A, E>,
) => NoteStore.use(use).pipe(Effect.provide(fixture.layer));

export const promise = <A>(start: () => Promise<A>) => Effect.promise(start);

/**
 * Runs `write` while the vault holds writes, interrupts it once it waits there, and checks that
 * the interruption itself waits until the write is released and done.
 */
export const interruptWhileHeld = <A, E>(fixture: NoteStoreFixture, write: Effect.Effect<A, E>) =>
  Effect.gen(function* () {
    fixture.holdWrites();
    const fiber = yield* Effect.forkChild(write);
    yield* promise(() =>
      eventually(() => {
        if (fixture.heldWrites() !== 1) throw new Error("the write is not waiting yet");
      }),
    );
    const interrupting = yield* Effect.forkChild(Fiber.interrupt(fiber));
    yield* Effect.yieldNow;
    assert.isUndefined(interrupting.pollUnsafe());
    fixture.releaseWrites();
    yield* Fiber.join(interrupting);
  });
