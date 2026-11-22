import { assert, describe, it } from "@effect/vitest";
import { Cause, Effect, Exit, Fiber, Result } from "effect";
import { vi } from "vitest";
import {
  NoteNotFoundError,
  type Frontmatter,
  type FrontmatterChange,
  type Note,
} from "../../../src/application/notes";
import { eventually } from "../wait";
import { COMMUNITY, interruptWhileHeld, promise, run, type NoteStoreFixture } from "./fixture";

const seedForUpdate = async (fixture: NoteStoreFixture) => {
  await fixture.seed(
    "F/A.md",
    { schema: "weg-manager.community/v1", zeta: 1, name: "Alt", unknown: "kept", gone: true },
    "# Body\n\nline\n",
  );
  await fixture.settle();
};

const seedForRename = async (fixture: NoteStoreFixture) => {
  await fixture.seed("F/Alt.md", COMMUNITY, "text\n");
  await fixture.seed("F/Besetzt.md", "none");
  await fixture.settle();
};

/** The contract's updates, trashing and renames; `contract.ts` runs it. */
export const writeContract = (make: () => NoteStoreFixture) => {
  describe("update", () => {
    it.effect("writes the patch and keeps unknown keys, their order and the body", () =>
      Effect.gen(function* () {
        const fixture = make();
        yield* promise(() => seedForUpdate(fixture));
        const note = yield* run(fixture, (store) =>
          store.update("/F/A.md", () =>
            Result.succeed({ set: { name: "Neu", added: ["x"] }, remove: ["gone"] }),
          ),
        );
        const expected: Note = {
          path: "F/A.md",
          frontmatter: {
            schema: "weg-manager.community/v1",
            zeta: 1,
            name: "Neu",
            unknown: "kept",
            added: ["x"],
          },
        };
        assert.deepStrictEqual(note, expected);
        assert.deepStrictEqual(Object.keys(note.frontmatter), Object.keys(expected.frontmatter));
        yield* promise(() => fixture.settle());
        const read = yield* run(fixture, (store) => store.read("F/A.md"));
        assert.deepStrictEqual(
          Object.entries(read.frontmatter),
          Object.entries(expected.frontmatter),
        );
        assert.strictEqual(yield* promise(() => fixture.body("F/A.md")), "# Body\n\nline\n");
      }),
    );

    it.effect("decides on the note's current frontmatter, not on what was read before", () =>
      Effect.gen(function* () {
        const fixture = make();
        yield* promise(() => seedForUpdate(fixture));
        yield* promise(() => fixture.seed("F/A.md", { ...COMMUNITY, name: "Von außen" }));
        const seen: Frontmatter[] = [];
        yield* run(fixture, (store) =>
          store.update("F/A.md", (current) => {
            seen.push(current);
            return Result.succeed({});
          }),
        );
        assert.deepStrictEqual(seen, [{ ...COMMUNITY, name: "Von außen" }]);
      }),
    );

    it.effect("aborts with the change's failure and writes nothing", () =>
      Effect.gen(function* () {
        const fixture = make();
        yield* promise(() => seedForUpdate(fixture));
        const error = yield* Effect.flip(
          run(fixture, (store) =>
            store.update("F/A.md", (current) => {
              (current as Record<string, unknown>)["name"] = "Mutated";
              return Result.fail({ _tag: "Conflict" as const });
            }),
          ),
        );
        assert.deepStrictEqual(error, { _tag: "Conflict" });
        yield* promise(() => fixture.settle());
        const read = yield* run(fixture, (store) => store.read("F/A.md"));
        assert.strictEqual(read.frontmatter["name"], "Alt");
      }),
    );

    it.effect("never writes what the change does to its copy of the frontmatter", () =>
      Effect.gen(function* () {
        const fixture = make();
        yield* promise(() => seedForUpdate(fixture));
        const note = yield* run(fixture, (store) =>
          store.update("F/A.md", (current) => {
            (current as Record<string, unknown>)["name"] = "Mutated";
            return Result.succeed({ set: { zeta: 2 } });
          }),
        );
        assert.strictEqual(note.frontmatter["name"], "Alt");
        yield* promise(() => fixture.settle());
        const read = yield* run(fixture, (store) => store.read("F/A.md"));
        assert.deepStrictEqual([read.frontmatter["name"], read.frontmatter["zeta"]], ["Alt", 2]);
      }),
    );

    it.effect("adds frontmatter to a note without any", () =>
      Effect.gen(function* () {
        const fixture = make();
        yield* promise(() => fixture.seed("Plain.md", "none", "# Plain\n"));
        const note = yield* run(fixture, (store) =>
          store.update("Plain.md", () => Result.succeed({ set: COMMUNITY })),
        );
        assert.deepStrictEqual(note.frontmatter, COMMUNITY);
        assert.strictEqual(yield* promise(() => fixture.body("Plain.md")), "# Plain\n");
      }),
    );

    it.effect("fails with NoteNotFoundError for a missing note and never asks the change", () =>
      Effect.gen(function* () {
        const fixture = make();
        const change = vi.fn<FrontmatterChange<never>>(() => Result.succeed({}));
        const error = yield* Effect.flip(run(fixture, (store) => store.update("X.md", change)));
        assert.strictEqual(error._tag, "NoteNotFoundError");
        assert.strictEqual(change.mock.calls.length, 0);
      }),
    );

    it.effect("fails with NoteUnreadableError for broken YAML and writes nothing", () =>
      Effect.gen(function* () {
        const fixture = make();
        yield* promise(() => fixture.seed("Broken.md", "broken", "body\n"));
        const error = yield* Effect.flip(
          run(fixture, (store) =>
            store.update("Broken.md", () => Result.succeed({ set: { a: 1 } })),
          ),
        );
        assert.strictEqual(error._tag, "NoteUnreadableError");
        assert.strictEqual(yield* promise(() => fixture.body("Broken.md")), "body\n");
      }),
    );

    it.effect("fails with NoteWriteError when the vault rejects the write", () =>
      Effect.gen(function* () {
        const fixture = make();
        yield* promise(() => seedForUpdate(fixture));
        fixture.setFailWrites(true);
        const error = yield* Effect.flip(
          run(fixture, (store) => store.update("F/A.md", () => Result.succeed({ set: { a: 1 } }))),
        );
        assert.strictEqual(error._tag, "NoteWriteError");
        fixture.setFailWrites(false);
        yield* promise(() => fixture.settle());
        const read = yield* run(fixture, (store) => store.read("F/A.md"));
        assert.isFalse("a" in read.frontmatter);
      }),
    );

    it.effect("dies with what the change throws, a bug, and writes nothing", () =>
      Effect.gen(function* () {
        const fixture = make();
        yield* promise(() => seedForUpdate(fixture));
        const bug = new Error("bug in the merge");
        const exit = yield* Effect.exit(
          run(fixture, (store) =>
            store.update("F/A.md", () => {
              throw bug;
            }),
          ),
        );
        assert.isTrue(Exit.isFailure(exit) && Cause.hasDies(exit.cause));
        assert.strictEqual(Exit.isFailure(exit) && Cause.squash(exit.cause), bug);
        yield* promise(() => fixture.settle());
        const read = yield* run(fixture, (store) => store.read("F/A.md"));
        assert.strictEqual(read.frontmatter["name"], "Alt");
      }),
    );

    it.effect("fails with NoteNotFoundError when the note is deleted before the write", () =>
      Effect.gen(function* () {
        const fixture = make();
        yield* promise(() => seedForUpdate(fixture));
        fixture.holdWrites();
        const fiber = yield* Effect.forkChild(
          run(fixture, (store) => store.update("F/A.md", () => Result.succeed({ set: { a: 1 } }))),
        );
        yield* promise(() =>
          eventually(() => {
            if (fixture.heldWrites() !== 1) throw new Error("the write is not waiting yet");
          }),
        );
        fixture.removeOutside("F/A.md");
        fixture.releaseWrites();
        const error = yield* Effect.flip(Fiber.join(fiber));
        assert.instanceOf(error, NoteNotFoundError);
        assert.isUndefined(yield* promise(() => fixture.body("F/A.md")));
      }),
    );

    it.effect(
      "fails with NoteNotFoundError at the first attempt when the note is deleted outside and the host has not noticed",
      () =>
        Effect.gen(function* () {
          const fixture = make();
          yield* promise(() => seedForUpdate(fixture));
          fixture.removeOutsideUnnoticed("F/A.md");
          let asked = false;
          const error = yield* Effect.flip(
            run(fixture, (store) =>
              store.update("F/A.md", () => {
                asked = true;
                return Result.succeed({ set: { a: 1 } });
              }),
            ),
          );
          assert.instanceOf(error, NoteNotFoundError);
          assert.isFalse(asked);
        }),
    );

    it.effect("completes an update that has started, also when interrupted", () =>
      Effect.gen(function* () {
        const fixture = make();
        yield* promise(() => seedForUpdate(fixture));
        yield* interruptWhileHeld(
          fixture,
          run(fixture, (store) =>
            store.update("F/A.md", () => Result.succeed({ set: { zeta: 9 } })),
          ),
        );
        yield* promise(() => fixture.settle());
        const read = yield* run(fixture, (store) => store.read("F/A.md"));
        assert.strictEqual(read.frontmatter["zeta"], 9);
      }),
    );
  });

  describe("trash", () => {
    it.effect("moves the note out of the vault", () =>
      Effect.gen(function* () {
        const fixture = make();
        yield* promise(async () => {
          await fixture.seed("F/A.md", COMMUNITY);
          await fixture.settle();
        });
        yield* run(fixture, (store) => store.trash("F//A.md"));
        yield* promise(() => fixture.settle());
        assert.deepStrictEqual(yield* run(fixture, (store) => store.list), []);
        const error = yield* Effect.flip(run(fixture, (store) => store.read("F/A.md")));
        assert.strictEqual(error._tag, "NoteNotFoundError");
        assert.isTrue(fixture.isFolder("F"));
      }),
    );

    it.effect("fails with NoteNotFoundError for a missing note", () =>
      Effect.gen(function* () {
        const error = yield* Effect.flip(run(make(), (store) => store.trash("X.md")));
        assert.strictEqual(error._tag, "NoteNotFoundError");
      }),
    );

    it.effect("fails with NoteTrashError when the vault rejects it, and keeps the note", () =>
      Effect.gen(function* () {
        const fixture = make();
        yield* promise(() => fixture.seed("A.md", COMMUNITY, "text\n"));
        fixture.setFailWrites(true);
        const error = yield* Effect.flip(run(fixture, (store) => store.trash("A.md")));
        assert.strictEqual(error._tag, "NoteTrashError");
        assert.strictEqual(yield* promise(() => fixture.body("A.md")), "text\n");
      }),
    );
  });

  describe("rename", () => {
    it.effect("renames the note in its folder and keeps frontmatter and body", () =>
      Effect.gen(function* () {
        const fixture = make();
        yield* promise(() => seedForRename(fixture));
        const note = yield* run(fixture, (store) => store.rename("/F/Alt.md", "Neu"));
        assert.deepStrictEqual(note, { path: "F/Neu.md", frontmatter: COMMUNITY });
        assert.strictEqual(yield* promise(() => fixture.body("F/Neu.md")), "text\n");
        assert.isUndefined(yield* promise(() => fixture.body("F/Alt.md")));
        assert.deepStrictEqual(yield* run(fixture, (store) => store.list), [note]);
      }),
    );

    it.effect("returns the note unchanged for its own name", () =>
      Effect.gen(function* () {
        const fixture = make();
        yield* promise(() => seedForRename(fixture));
        const note = yield* run(fixture, (store) => store.rename("F/Alt.md", "Alt"));
        assert.deepStrictEqual(note, { path: "F/Alt.md", frontmatter: COMMUNITY });
      }),
    );

    it.effect("refuses a taken or unusable name, and a missing note", () =>
      Effect.gen(function* () {
        const fixture = make();
        yield* promise(() => seedForRename(fixture));
        const tags: string[] = [];
        for (const [path, newName] of [
          ["F/Alt.md", "Besetzt"],
          ["F/Alt.md", ".versteckt"],
          ["F/Fehlt.md", "Neu"],
        ] as const) {
          tags.push(
            (yield* Effect.flip(run(fixture, (store) => store.rename(path, newName))))._tag,
          );
        }
        assert.deepStrictEqual(tags, [
          "NotePathTakenError",
          "InvalidNoteNameError",
          "NoteNotFoundError",
        ]);
        assert.strictEqual(yield* promise(() => fixture.body("F/Alt.md")), "text\n");
      }),
    );

    it.effect("fails with NoteWriteError when the vault rejects it", () =>
      Effect.gen(function* () {
        const fixture = make();
        yield* promise(() => seedForRename(fixture));
        fixture.setFailWrites(true);
        const exit = yield* Effect.exit(run(fixture, (store) => store.rename("F/Alt.md", "Neu")));
        assert.isTrue(Exit.isFailure(exit));
        const error = yield* Effect.flip(run(fixture, (store) => store.rename("F/Alt.md", "Neu")));
        assert.strictEqual(error._tag, "NoteWriteError");
        assert.strictEqual(yield* promise(() => fixture.body("F/Alt.md")), "text\n");
      }),
    );
  });
};
