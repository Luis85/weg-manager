import { assert, describe, it } from "@effect/vitest";
import { Effect, type Layer } from "effect";
import { vi } from "vitest";
import { NoteNotFoundError, VaultFiles } from "../../../../src/application/notes";
import { memoryVaultFiles } from "../../../../src/infrastructure/memory/notes";
import { vaultFilesLayer } from "../../../../src/infrastructure/obsidian/notes/vault-files";
import { App } from "../../../support/obsidian";
import { asObsidian } from "../../../support/obsidian/real";

vi.mock("obsidian", () => import("@test/obsidian"));

type Fixture = {
  readonly layer: Layer.Layer<VaultFiles>;
  /** Puts a file there from outside, as a person would. */
  readonly seed: (path: string) => Promise<void>;
};

const onDouble = (): Fixture => {
  const app = new App();
  return {
    layer: vaultFilesLayer(asObsidian(app)),
    seed: async (path) => {
      const folder = path.slice(0, path.lastIndexOf("/"));
      if (app.vault.getFolderByPath(folder) === null) await app.vault.createFolder(folder);
      app.vault.seedFile(path, "x");
    },
  };
};

const inMemory = (): Fixture => {
  const files = memoryVaultFiles();
  return { layer: files.layer, seed: (path) => Promise.resolve(files.seed(path)) };
};

const BYTES = new Uint8Array([37, 80, 68, 70]);

/** What every `VaultFiles` adapter promises (ADR 0007, amendment 26.11.2026). */
const vaultFilesContract = (name: string, make: () => Fixture) => {
  describe(`VaultFiles contract: ${name}`, () => {
    it.effect("writes a new file into a missing folder and finds it", () => {
      const fixture = make();
      return Effect.gen(function* () {
        const files = yield* VaultFiles;
        const path = yield* files.write(
          "WEG Manager/Quellen/AW",
          "2026-11-26 Mail Licht.pdf",
          BYTES,
        );
        assert.strictEqual(path, "WEG Manager/Quellen/AW/2026-11-26 Mail Licht.pdf");
        assert.isTrue(yield* files.exists(path));
        assert.isFalse(yield* files.exists("WEG Manager/Quellen/AW/fehlt.pdf"));
        assert.isDefined(yield* files.resourceUrl(path));
        assert.isUndefined(yield* files.resourceUrl("WEG Manager/Quellen/AW/fehlt.pdf"));
      }).pipe(Effect.provide(fixture.layer));
    });

    it.effect("never overwrites: a taken name gets (2) before the extension", () => {
      const fixture = make();
      return Effect.gen(function* () {
        yield* Effect.promise(() => fixture.seed("Q/Angebot.pdf"));
        const files = yield* VaultFiles;
        assert.strictEqual(yield* files.freePath("Q", "Angebot.pdf"), "Q/Angebot (2).pdf");
        assert.strictEqual(
          yield* files.freePath("Q", "Angebot.pdf", ["Q/Angebot (2).pdf"]),
          "Q/Angebot (3).pdf",
        );
        assert.strictEqual(yield* files.write("Q", "angebot.PDF", BYTES), "Q/angebot (2).PDF");
        assert.strictEqual(yield* files.write("Q", "Angebot.pdf", BYTES), "Q/Angebot (3).pdf");
      }).pipe(Effect.provide(fixture.layer));
    });

    it.effect("refuses a name with a character no file name may hold", () => {
      const fixture = make();
      return Effect.gen(function* () {
        const files = yield* VaultFiles;
        const error = yield* Effect.flip(files.write("Q", "a:b.pdf", BYTES));
        assert.strictEqual(error._tag, "InvalidNoteNameError");
      }).pipe(Effect.provide(fixture.layer));
    });

    it.effect("opens only a file that is there", () => {
      const fixture = make();
      return Effect.gen(function* () {
        const files = yield* VaultFiles;
        const error = yield* Effect.flip(files.open("Q/fehlt.png"));
        assert.instanceOf(error, NoteNotFoundError);
      }).pipe(Effect.provide(fixture.layer));
    });
  });
};

vaultFilesContract("in memory", inMemory);
vaultFilesContract("Obsidian (double)", onDouble);
