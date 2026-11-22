import { assert, describe, it } from "@effect/vitest";
import { Cause, Effect, Exit, Fiber, Result } from "effect";
import { asDefect, createNote, writeCommand } from "../../../../src/application/notes/command";
import type { PlannedNote } from "../../../../src/application/notes/paths";

const normalize = (path: string) => path.replace(/\/+/g, "/").replace(/^\/|\/$/g, "") || "/";

describe("writeCommand", () => {
  it.effect("succeeds with what the write returns", () =>
    Effect.gen(function* () {
      assert.strictEqual(yield* writeCommand(() => Promise.resolve(Result.succeed(4))), 4);
    }),
  );

  it.effect("fails with the typed failure the write decided on", () =>
    Effect.gen(function* () {
      const error = yield* Effect.flip(
        writeCommand(() => Promise.resolve(Result.fail({ _tag: "Conflict" as const }))),
      );
      assert.deepStrictEqual(error, { _tag: "Conflict" });
    }),
  );

  it.effect("turns a rejected write into NoteWriteError with the cause", () =>
    Effect.gen(function* () {
      const cause = new Error("EACCES");
      const error = yield* Effect.flip(writeCommand<number, never>(() => Promise.reject(cause)));
      assert.strictEqual(error._tag, "NoteWriteError");
      assert.strictEqual(error.cause, cause);
    }),
  );

  it.effect("dies with what plugin code threw through asDefect, a bug and no failed write", () =>
    Effect.gen(function* () {
      const bug = new TypeError("bug in the merge");
      const exit = yield* Effect.exit(
        writeCommand<number, never>(async () => {
          await Promise.resolve();
          return asDefect(() => {
            throw bug;
          });
        }),
      );
      assert.isTrue(Exit.isFailure(exit) && Cause.hasDies(exit.cause));
      assert.strictEqual(Exit.isFailure(exit) && Cause.squash(exit.cause), bug);
    }),
  );

  it("asDefect returns what the code returns", () => {
    assert.strictEqual(
      asDefect(() => 3),
      3,
    );
  });

  it.effect("waits for a started write when interrupted", () =>
    Effect.gen(function* () {
      const disk: { done?: () => void } = {};
      let written = false;
      const fiber = yield* Effect.forkChild(
        writeCommand(async () => {
          await new Promise<void>((resolve) => {
            disk.done = resolve;
          });
          written = true;
          return Result.succeed(undefined);
        }),
      );
      yield* Effect.yieldNow;
      const interrupting = yield* Effect.forkChild(Fiber.interrupt(fiber));
      yield* Effect.yieldNow;
      assert.isUndefined(interrupting.pollUnsafe());
      disk.done?.();
      yield* Fiber.join(interrupting);
      assert.isTrue(written);
    }),
  );
});

describe("createNote", () => {
  it.effect("writes the planned note with its body and returns it with its own frontmatter", () =>
    Effect.gen(function* () {
      const writes: [PlannedNote, string][] = [];
      const frontmatter = { tags: ["a"] };
      const note = yield* createNote(
        { folder: "/F/", name: "A", frontmatter, body: "# A\n" },
        normalize,
        (folder) => (folder === "F" ? ["F/a.md"] : []),
        (plan, body) => {
          writes.push([plan, body]);
          return Promise.resolve();
        },
      );
      assert.deepStrictEqual(note, { path: "F/A (2).md", frontmatter: { tags: ["a"] } });
      assert.deepStrictEqual(writes, [
        [{ folder: "F", path: "F/A (2).md", frontmatter: { tags: ["a"] } }, "# A\n"],
      ]);
      assert.notStrictEqual(note.frontmatter, writes[0]?.[0].frontmatter);
      assert.notStrictEqual(note.frontmatter, frontmatter);
    }),
  );

  it.effect("writes an empty body when the note has none", () =>
    Effect.gen(function* () {
      const bodies: string[] = [];
      yield* createNote(
        { folder: "", name: "A", frontmatter: {} },
        normalize,
        () => [],
        (_, body) => {
          bodies.push(body);
          return Promise.resolve();
        },
      );
      assert.deepStrictEqual(bodies, [""]);
    }),
  );

  it.effect(
    "writes nothing for an unusable name and fails with NoteWriteError on a rejected write",
    () =>
      Effect.gen(function* () {
        let calls = 0;
        const write = () => {
          calls += 1;
          return Promise.reject(new Error("EACCES"));
        };
        const invalid = yield* Effect.flip(
          createNote({ folder: "", name: ".x", frontmatter: {} }, normalize, () => [], write),
        );
        assert.deepStrictEqual([invalid._tag, calls], ["InvalidNoteNameError", 0]);
        const failed = yield* Effect.flip(
          createNote({ folder: "", name: "x", frontmatter: {} }, normalize, () => [], write),
        );
        assert.deepStrictEqual([failed._tag, calls], ["NoteWriteError", 1]);
      }),
  );
});
