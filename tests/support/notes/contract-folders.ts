import { assert, describe, it } from "@effect/vitest";
import { Effect } from "effect";
import { COMMUNITY, promise, run, type NoteStoreFixture } from "./fixture";

const create = (fixture: NoteStoreFixture, folder: string, name: string) =>
  run(fixture, (store) => store.create({ folder, name, frontmatter: COMMUNITY }));

/**
 * Folders are found as names clash (`clashKey`: NFC, then lower case), segment by segment, so a
 * root folder `weg manager/` serves the setting `WEG Manager`; the path keeps the vault's spelling.
 * Where folders differ only in case (a case-sensitive disk holds both), the one spelled exactly as
 * asked wins, else the first by code unit. `contract.ts` runs it.
 */
export const folderContract = (make: () => NoteStoreFixture) => {
  describe("folders found regardless of case", () => {
    it.effect("creates a note in the existing folder that differs in case, in its spelling", () =>
      Effect.gen(function* () {
        const fixture = make();
        yield* promise(() => fixture.seed("weg manager/Alt.md", "none"));
        const note = yield* create(fixture, "WEG Manager/Gemeinschaften", "Ahornweg");
        assert.strictEqual(note.path, "weg manager/Gemeinschaften/Ahornweg.md");
        assert.isTrue(fixture.isFolder("weg manager/Gemeinschaften"));
        assert.isFalse(fixture.isFolder("WEG Manager"));
      }),
    );

    it.effect("finds the subfolder by case too, and the names that clash in it", () =>
      Effect.gen(function* () {
        const fixture = make();
        yield* promise(() => fixture.seed("weg manager/gemeinschaften/Ahornweg.md", "none"));
        const note = yield* create(fixture, "/WEG Manager//Gemeinschaften/", "AHORNWEG");
        assert.strictEqual(note.path, "weg manager/gemeinschaften/AHORNWEG (2).md");
        assert.isFalse(fixture.isFolder("WEG Manager/Gemeinschaften"));
      }),
    );

    it.effect("takes the folder spelled as asked, else the first by code unit", () =>
      Effect.gen(function* () {
        const fixture = make();
        yield* promise(async () => {
          await fixture.seed("weg manager/a.md", "none");
          await fixture.seed("WEG Manager/b.md", "none");
        });
        const paths = [
          (yield* create(fixture, "weg manager", "Exakt")).path,
          (yield* create(fixture, "WEG Manager", "Genau")).path,
          (yield* create(fixture, "Weg Manager", "Erster")).path,
        ];
        assert.deepStrictEqual(paths, [
          "weg manager/Exakt.md",
          "WEG Manager/Genau.md",
          "WEG Manager/Erster.md",
        ]);
      }),
    );

    it.effect("creates what is missing below the folder it found, in the asked spelling", () =>
      Effect.gen(function* () {
        const fixture = make();
        yield* promise(() => fixture.seed("Archiv/x.md", "none"));
        const note = yield* create(fixture, "archiv/Neu/Tief", "A");
        assert.strictEqual(note.path, "Archiv/Neu/Tief/A.md");
      }),
    );

    it.effect("lists the unreadable notes of the folder that differs in case", () =>
      Effect.gen(function* () {
        const fixture = make();
        yield* promise(async () => {
          await fixture.seed("weg manager/Kaputt.md", "broken");
          await fixture.seed("Privat/Kaputt.md", "broken");
          await fixture.settle();
        });
        const broken = yield* run(fixture, (store) => store.unreadable("WEG Manager"));
        assert.deepStrictEqual(broken, ["weg manager/Kaputt.md"]);
      }),
    );

    it.effect("lists the unreadable notes of the one folder it takes among several", () =>
      Effect.gen(function* () {
        const fixture = make();
        yield* promise(async () => {
          await fixture.seed("weg manager/Klein.md", "broken");
          await fixture.seed("WEG Manager/Gross.md", "broken");
          await fixture.settle();
        });
        const lists = yield* run(fixture, (store) =>
          Effect.all([
            store.unreadable("weg manager"),
            store.unreadable("WEG MANAGER"),
            store.unreadable("/"),
          ]),
        );
        assert.deepStrictEqual(lists, [
          ["weg manager/Klein.md"],
          ["WEG Manager/Gross.md"],
          ["WEG Manager/Gross.md", "weg manager/Klein.md"],
        ]);
      }),
    );
  });
};
