import { assert, describe, it } from "@effect/vitest";
import { Effect } from "effect";
import {
  InvalidCommunityError,
  communityList,
  createCommunity,
  deleteCommunity,
} from "../../../../src/application/communities";
import { NoteStore } from "../../../../src/application/notes";
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
      assert.strictEqual(note.path, "WEG Manager/Gemeinschaften/Ahornweg 12.md");
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
        list.records.map((community) => community.id),
        [communityId(1)],
      );
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

  it.effect("refuses a name too long for a file name at the field and writes nothing", () => {
    const fixture = communitiesFixture();
    return Effect.gen(function* () {
      yield* ready;
      const error = yield* Effect.flip(createCommunity({ ...INPUT, name: "漢".repeat(83) }));
      assert.deepStrictEqual(
        error,
        new InvalidCommunityError({ issues: [{ key: "name", code: "name.too-long" }] }),
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
            { key: "short_code", code: "short-code.taken", value: "AW", other: "Gemeinschaft 9" },
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
      const [first] = (yield* communityList).records;
      if (first === undefined) throw new Error("no community");
      yield* deleteCommunity(first);
      assert.deepStrictEqual(
        (yield* listed).map((note) => note.path),
        [`${FOLDER}/G2.md`],
      );
      yield* indexed;
      assert.deepStrictEqual(
        (yield* communityList).records.map((community) => community.id),
        [communityId(2)],
      );
    }).pipe(Effect.provide(fixture.layer));
  });
});
