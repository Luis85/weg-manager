import { assert, describe, it } from "@effect/vitest";
import { Effect } from "effect";
import {
  MAX_NAME_ATTEMPTS,
  checkNoteName,
  planNewNote,
  planRename,
  freeNotePath,
  renamedNotePath,
} from "../../../../src/application/notes/paths";

/** Obsidian's `normalizePath`, as far as these tests need it. */
const normalize = (path: string) => path.replace(/\/+/g, "/").replace(/^\/|\/$/g, "") || "/";

describe("freeNotePath", () => {
  it.effect("takes the name when it is free", () =>
    Effect.gen(function* () {
      const path = yield* freeNotePath(
        "WEG Manager/Gemeinschaften",
        "Ahornweg",
        normalize,
        () => false,
      );
      assert.strictEqual(path, "WEG Manager/Gemeinschaften/Ahornweg.md");
    }),
  );

  it.effect("puts a note into the vault root for an empty or root folder", () =>
    Effect.gen(function* () {
      assert.strictEqual(yield* freeNotePath("", "A", normalize, () => false), "A.md");
      assert.strictEqual(yield* freeNotePath("/", "A", normalize, () => false), "A.md");
    }),
  );

  it.effect("adds (2), (3), … until a name is free", () =>
    Effect.gen(function* () {
      const taken = new Set(["F/A.md", "F/A (2).md"]);
      const path = yield* freeNotePath("F", "A", normalize, (candidate) => taken.has(candidate));
      assert.strictEqual(path, "F/A (3).md");
    }),
  );

  it.effect("gives up with NotePathTakenError after the last attempt", () =>
    Effect.gen(function* () {
      const asked: string[] = [];
      const error = yield* Effect.flip(
        freeNotePath("F", "A", normalize, (candidate) => {
          asked.push(candidate);
          return true;
        }),
      );
      assert.strictEqual(error._tag, "NotePathTakenError");
      assert.strictEqual(asked.length, MAX_NAME_ATTEMPTS);
      assert.strictEqual(asked.at(-1), `F/A (${MAX_NAME_ATTEMPTS}).md`);
    }),
  );

  it.effect("takes the last attempt when it is free", () =>
    Effect.gen(function* () {
      const last = `F/A (${MAX_NAME_ATTEMPTS}).md`;
      const path = yield* freeNotePath("F", "A", normalize, (candidate) => candidate !== last);
      assert.strictEqual(path, last);
    }),
  );
});

describe("renamedNotePath", () => {
  it("keeps the folder and replaces the name", () => {
    assert.strictEqual(renamedNotePath("a/b/Alt.md", "Neu", normalize), "a/b/Neu.md");
    assert.strictEqual(renamedNotePath("Alt.md", "Neu", normalize), "Neu.md");
  });
});

describe("checkNoteName", () => {
  it.effect("passes a usable name", () => Effect.asVoid(checkNoteName("Ahornweg 12")));

  it.effect("fails with the issue of an unusable name", () =>
    Effect.gen(function* () {
      const error = yield* Effect.flip(checkNoteName("a/b"));
      assert.strictEqual(error._tag, "InvalidNoteNameError");
      assert.strictEqual(error.issue, "forbidden-character");
    }),
  );
});

describe("planNewNote", () => {
  it.effect("normalizes the folder, finds a free path and copies the frontmatter", () =>
    Effect.gen(function* () {
      const frontmatter = { tags: ["a"] };
      const asked: string[] = [];
      const plan = yield* planNewNote(
        { folder: "/F//G/", name: "A", frontmatter },
        normalize,
        (folder) => {
          asked.push(folder);
          return ["F/G/A.md", "F/G/B.md"];
        },
      );
      assert.deepStrictEqual(plan, {
        folder: "F/G",
        path: "F/G/A (2).md",
        frontmatter: { tags: ["a"] },
      });
      assert.deepStrictEqual(asked, ["F/G"]);
      assert.notStrictEqual(plan.frontmatter, frontmatter);
    }),
  );

  it.effect("treats a name in another case or Unicode form as taken, folders included", () =>
    Effect.gen(function* () {
      const siblings = ["F/AHORNWEG.md", "F/ahornweg (2).md", "F/Mu\u0308ller.md", "F/Ordner.md"];
      const plan = (name: string) =>
        planNewNote({ folder: "F", name, frontmatter: {} }, normalize, () => siblings);
      assert.strictEqual((yield* plan("Ahornweg")).path, "F/Ahornweg (3).md");
      assert.strictEqual((yield* plan("M\u00FCller")).path, "F/M\u00FCller (2).md");
      assert.strictEqual((yield* plan("ordner")).path, "F/ordner (2).md");
      assert.strictEqual((yield* plan("Neu")).path, "F/Neu.md");
    }),
  );

  it.effect("checks the name before it looks for a path", () =>
    Effect.gen(function* () {
      let asked = 0;
      const error = yield* Effect.flip(
        planNewNote({ folder: "F", name: "", frontmatter: {} }, normalize, () => {
          asked += 1;
          return [];
        }),
      );
      assert.strictEqual(error._tag, "InvalidNoteNameError");
      assert.strictEqual(asked, 0);
    }),
  );
});

const siblingsInF = (folder: string) =>
  folder === "F" ? ["F/Alt.md", "F/Besetzt.md", "F/Mu\u0308ller.md"] : ["Wurzel.md"];

describe("planRename", () => {
  it.effect("keeps the folder and takes a free name", () =>
    Effect.gen(function* () {
      assert.strictEqual(yield* planRename("F/Alt.md", "Neu", normalize, siblingsInF), "F/Neu.md");
      assert.strictEqual(yield* planRename("Wurzel.md", "Neu", normalize, siblingsInF), "Neu.md");
    }),
  );

  it.effect("allows the note's own name, also in another case", () =>
    Effect.gen(function* () {
      assert.strictEqual(yield* planRename("F/Alt.md", "Alt", normalize, siblingsInF), "F/Alt.md");
      assert.strictEqual(yield* planRename("F/Alt.md", "ALT", normalize, siblingsInF), "F/ALT.md");
      assert.strictEqual(
        yield* planRename("Wurzel.md", "wurzel", normalize, siblingsInF),
        "wurzel.md",
      );
    }),
  );

  it.effect("refuses another note's name in any case or Unicode form", () =>
    Effect.gen(function* () {
      for (const name of ["Besetzt", "besetzt", "M\u00FCller"]) {
        const error = yield* Effect.flip(planRename("F/Alt.md", name, normalize, siblingsInF));
        assert.strictEqual(error._tag, "NotePathTakenError");
      }
    }),
  );

  it.effect("refuses an unusable name before it looks at the folder", () =>
    Effect.gen(function* () {
      let asked = 0;
      const error = yield* Effect.flip(
        planRename("F/Alt.md", "a:b", normalize, () => {
          asked += 1;
          return [];
        }),
      );
      assert.deepStrictEqual([error._tag, asked], ["InvalidNoteNameError", 0]);
    }),
  );
});
