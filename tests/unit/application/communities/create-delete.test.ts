import { assert, describe, it } from "@effect/vitest";
import { Effect } from "effect";
import {
  COMMUNITIES_FOLDER,
  InvalidCommunityError,
  communityList,
  createCommunity,
  deleteCommunity,
} from "../../../../src/application/communities";
import { NoteNotFoundError, NoteStore } from "../../../../src/application/notes";
import type { CommunityInput } from "../../../../src/domain/communities";
import {
  FOLDER,
  communitiesFixture,
  communityId,
  communityNote,
  indexed,
  ready,
  stored,
} from "../../../support/communities/fixture";

const INPUT: CommunityInput = {
  name: "Ahornweg 12",
  short_code: "aw",
  color: "teal",
  kind: "WEG",
  unit_label: "Einheiten",
};

const listed = NoteStore.use((store) => store.list);

describe("createCommunity", () => {
  it.effect("writes a note named after the community into the root folder's Gemeinschaften", () => {
    const fixture = communitiesFixture();
    return Effect.gen(function* () {
      yield* ready;
      const note = yield* createCommunity(INPUT);
      assert.strictEqual(COMMUNITIES_FOLDER, "Gemeinschaften");
      assert.strictEqual(note.path, `WEG Manager/${COMMUNITIES_FOLDER}/Ahornweg 12.md`);
      const read = yield* stored(note.path);
      assert.deepStrictEqual(Object.entries(read.frontmatter), [
        ["schema", "weg-manager.community/v1"],
        ["id", communityId(1)],
        ["name", "Ahornweg 12"],
        ["short_code", "AW"],
        ["color", "teal"],
        ["kind", "WEG"],
        ["unit_label", "Einheiten"],
      ]);
      assert.strictEqual(fixture.memory.body(note.path), "");
      yield* indexed;
      const list = yield* communityList;
      assert.deepStrictEqual(
        list.communities.map((community) => community.id),
        [communityId(1)],
      );
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("uses the root folder from the settings", () => {
    const fixture = communitiesFixture({ settings: { rootFolder: "Beirat/WEG" } });
    return Effect.gen(function* () {
      yield* ready;
      const note = yield* createCommunity(INPUT);
      assert.strictEqual(note.path, "Beirat/WEG/Gemeinschaften/Ahornweg 12.md");
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("adds (2) when the file name is taken and keeps the user's name in the note", () => {
    const fixture = communitiesFixture();
    return Effect.gen(function* () {
      fixture.memory.seed(`${FOLDER}/Ahornweg 12-14.md`, "none");
      yield* ready;
      const note = yield* createCommunity({ ...INPUT, name: "Ahornweg 12/14" });
      assert.strictEqual(note.path, `${FOLDER}/Ahornweg 12-14 (2).md`);
      assert.strictEqual((yield* stored(note.path)).frontmatter["name"], "Ahornweg 12/14");
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("refuses broken input with every issue and writes nothing", () => {
    const fixture = communitiesFixture();
    return Effect.gen(function* () {
      yield* ready;
      const error = yield* Effect.flip(
        createCommunity({ name: " ", short_code: "A", color: "", kind: "WEG", unit_label: "" }),
      );
      assert.deepStrictEqual(
        error,
        new InvalidCommunityError({
          issues: [
            { key: "name", code: "field.missing" },
            { key: "short_code", code: "short-code.invalid" },
            { key: "color", code: "field.missing" },
            { key: "unit_label", code: "field.missing" },
          ],
        }),
      );
      assert.deepStrictEqual(yield* listed, []);
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("refuses a short code and a colour another community has", () => {
    const fixture = communitiesFixture();
    return Effect.gen(function* () {
      fixture.memory.seed(`${FOLDER}/Alt.md`, communityNote(9, { short_code: "AW" }));
      yield* ready;
      const error = yield* Effect.flip(createCommunity(INPUT));
      assert.deepStrictEqual(
        error,
        new InvalidCommunityError({
          issues: [
            { key: "short_code", code: "short-code.taken" },
            { key: "color", code: "color.taken" },
          ],
        }),
      );
      assert.strictEqual((yield* listed).length, 1);
    }).pipe(Effect.provide(fixture.layer));
  });
});

describe("deleteCommunity", () => {
  it.effect("moves the note to the trash, and the list drops it", () => {
    const fixture = communitiesFixture();
    return Effect.gen(function* () {
      fixture.memory.seed(`${FOLDER}/G1.md`, communityNote(1));
      fixture.memory.seed(`${FOLDER}/G2.md`, communityNote(2, { color: "blue" }));
      yield* ready;
      const [first] = (yield* communityList).communities;
      if (first === undefined) throw new Error("no community");
      yield* deleteCommunity(first);
      assert.deepStrictEqual(
        (yield* listed).map((note) => note.path),
        [`${FOLDER}/G2.md`],
      );
      yield* indexed;
      assert.deepStrictEqual(
        (yield* communityList).communities.map((community) => community.id),
        [communityId(2)],
      );
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("finds a note renamed meanwhile by its id", () => {
    const fixture = communitiesFixture();
    return Effect.gen(function* () {
      fixture.memory.seed(`${FOLDER}/G1.md`, communityNote(1));
      yield* ready;
      const [first] = (yield* communityList).communities;
      if (first === undefined) throw new Error("no community");
      yield* NoteStore.use((store) => store.rename(first.path, "Umbenannt"));
      yield* indexed;
      yield* deleteCommunity(first);
      assert.deepStrictEqual(yield* listed, []);
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("fails with NoteNotFoundError when the note is gone", () => {
    const fixture = communitiesFixture();
    return Effect.gen(function* () {
      fixture.memory.seed(`${FOLDER}/G1.md`, communityNote(1));
      yield* ready;
      const [first] = (yield* communityList).communities;
      if (first === undefined) throw new Error("no community");
      yield* NoteStore.use((store) => store.trash(first.path));
      const error = yield* Effect.flip(deleteCommunity(first));
      assert.deepStrictEqual(error, new NoteNotFoundError());
    }).pipe(Effect.provide(fixture.layer));
  });
});
