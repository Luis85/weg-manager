import { assert, describe, it } from "@effect/vitest";
import { Cause, Effect, Exit, Fiber, Result } from "effect";
import {
  asDefect,
  createNote,
  isFileGone,
  trashCommand,
  writeCommand,
} from "../../../../src/application/notes/command";
import type { PlannedNote } from "../../../../src/application/notes/paths";

const normalize = (path: string) => path.replace(/\/+/g, "/").replace(/^\/|\/$/g, "") || "/";

/** A vault without files or folders. */
const unfoldered = { siblingsOf: () => [], foldersIn: () => [] };

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

describe("isFileGone", () => {
  it("is true for what Node rejects with when the file is not there", () => {
    const rejection = Object.assign(new Error("ENOENT: no such file or directory, open 'a.md'"), {
      errno: -2,
      code: "ENOENT",
      syscall: "open",
    });
    assert.isTrue(isFileGone(rejection));
    assert.isTrue(isFileGone({ code: "ENOENT" }));
  });

  it("is false for every other rejection, also one that only says ENOENT", () => {
    assert.isFalse(isFileGone(Object.assign(new Error("EACCES"), { code: "EACCES" })));
    assert.isFalse(isFileGone(new Error("ENOENT: no such file or directory")));
    assert.isFalse(isFileGone({ code: "enoent" }));
    assert.isFalse(isFileGone({ cause: { code: "ENOENT" } }));
    for (const other of ["ENOENT", 2, null, undefined, {}, []]) {
      assert.isFalse(isFileGone(other));
    }
  });
});

describe("createNote", () => {
  it.effect(
    "writes the planned note in the vault's folder and returns it with its own frontmatter",
    () =>
      Effect.gen(function* () {
        const writes: [PlannedNote, string][] = [];
        const frontmatter = { tags: ["a"] };
        const note = yield* createNote(
          { folder: "/f/", name: "A", frontmatter, body: "# A\n" },
          normalize,
          {
            siblingsOf: (folder) => (folder === "F" ? ["F/a.md"] : []),
            foldersIn: (folder) => (folder === "/" ? ["F"] : []),
          },
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
        { siblingsOf: () => [], foldersIn: () => [] },
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
          createNote({ folder: "", name: ".x", frontmatter: {} }, normalize, unfoldered, write),
        );
        assert.deepStrictEqual([invalid._tag, calls], ["InvalidNoteNameError", 0]);
        const failed = yield* Effect.flip(
          createNote({ folder: "", name: "x", frontmatter: {} }, normalize, unfoldered, write),
        );
        assert.deepStrictEqual([failed._tag, calls], ["NoteWriteError", 1]);
      }),
  );
});

describe("trashCommand", () => {
  it.effect("succeeds when the move resolves true, or nothing as the d.ts promises", () =>
    Effect.gen(function* () {
      yield* trashCommand(() => Promise.resolve(true));
      yield* trashCommand(() => Promise.resolve());
    }),
  );

  it.effect("fails with NoteTrashError when the move resolves false: Obsidian's failed trash", () =>
    Effect.gen(function* () {
      const error = yield* Effect.flip(trashCommand(() => Promise.resolve(false)));
      assert.strictEqual(error._tag, "NoteTrashError");
    }),
  );

  it.effect("fails with NoteTrashError and the cause when the move rejects", () =>
    Effect.gen(function* () {
      const cause = new Error("EACCES");
      const error = yield* Effect.flip(trashCommand(() => Promise.reject(cause)));
      assert.deepStrictEqual([error._tag, error.cause], ["NoteTrashError", cause]);
    }),
  );
});
