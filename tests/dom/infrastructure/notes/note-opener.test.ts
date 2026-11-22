import { assert, describe, it } from "@effect/vitest";
import { Effect } from "effect";
import { afterEach, vi } from "vitest";
import { NoteOpener } from "../../../../src/application/notes";
import { noteOpenerLayer } from "../../../../src/infrastructure/obsidian/notes";
import { App, WorkspaceLeaf } from "../../../support/obsidian";
import { noteOpenerContract } from "../../../support/notes/contract-opener";
import { asObsidian } from "../../../support/obsidian/real";

vi.mock("obsidian", () => import("@test/obsidian"));

noteOpenerContract("Obsidian adapter on the double", () => {
  const app = new App();
  return {
    layer: noteOpenerLayer(asObsidian(app)),
    seed: async (path) => {
      app.vault.seedFile(path, "");
    },
    // Each note in a new tab (`getLeaf("tab")`), made the active one, never in the plugin's tab;
    // anything else shows up next to the path, so the contract's comparison fails on it.
    opened: () =>
      app.workspace.leaves.flatMap((leaf, index) =>
        leaf.openedFiles.map(({ path, state }) => {
          const how = JSON.stringify([app.workspace.leafRequests[index], state]);
          return how === JSON.stringify(["tab", { active: true }]) ? path : `${path} ${how}`;
        }),
      ),
  };
});

const PATH = "Notizen/Fremd.md";

/** Opens `PATH` through the Obsidian adapter while every leaf's `openFile` rejects with `cause`. */
const openRejected = (cause: Error, before: (app: App) => void = () => undefined) => {
  const app = new App();
  app.vault.seedFile(PATH, "");
  vi.spyOn(WorkspaceLeaf.prototype, "openFile").mockImplementation(() => {
    before(app);
    return Promise.reject(cause);
  });
  return NoteOpener.use((opener) => opener.open(PATH)).pipe(
    Effect.provide(noteOpenerLayer(asObsidian(app))),
  );
};

describe("the Obsidian NoteOpener when Obsidian cannot open the note", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.effect("fails with NoteOpenError, a failure the user can retry, not a defect", () =>
    Effect.gen(function* () {
      const cause = new Error("EACCES: permission denied");
      const error = yield* Effect.flip(openRejected(cause));
      assert.strictEqual(error._tag, "NoteOpenError");
      assert.strictEqual(error._tag === "NoteOpenError" && error.cause, cause);
    }),
  );

  it.effect("fails with NoteNotFoundError when the note left the vault meanwhile", () =>
    Effect.gen(function* () {
      const error = yield* Effect.flip(
        openRejected(new Error("gone"), (app) => {
          const file = app.vault.getFileByPath(PATH);
          if (file !== null) app.vault.remove(file);
        }),
      );
      assert.strictEqual(error._tag, "NoteNotFoundError");
    }),
  );

  it.effect("fails with NoteNotFoundError when the rejection says the file is gone", () =>
    Effect.gen(function* () {
      const gone = Object.assign(new Error("ENOENT: no such file or directory"), {
        code: "ENOENT",
      });
      const error = yield* Effect.flip(openRejected(gone));
      assert.strictEqual(error._tag, "NoteNotFoundError");
    }),
  );
});
