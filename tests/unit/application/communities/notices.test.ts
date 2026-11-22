import { assert, describe, it } from "@effect/vitest";
import { Effect } from "effect";
import {
  communityList,
  createCommunity,
  deleteCommunity,
  updateCommunity,
  type Community,
} from "../../../../src/application/communities";
import { NoteStore } from "../../../../src/application/notes";
import {
  FOLDER,
  communitiesFixture,
  communityNote,
  ready,
} from "../../../support/communities/fixture";

const INPUT = {
  name: "Tiefgarage Ahornweg",
  short_code: "tg",
  color: "violet",
  kind: "Tiefgarage",
  unit_label: "Stellplätze",
};

const first = Effect.map(communityList, ({ communities }): Community => {
  const [community] = communities;
  if (community === undefined) throw new Error("no community");
  return community;
});

/** A notice that confirms a write: its title says what happened, there is nothing more to say. */
const confirmation = (title: string) => ({ severity: "info", title, detail: "" });

describe("the notices that confirm a write", () => {
  it.effect("confirms a created community by its name", () => {
    const fixture = communitiesFixture();
    return Effect.gen(function* () {
      yield* ready;
      yield* createCommunity(INPUT);
      assert.deepStrictEqual(fixture.notifier.messages(), [
        confirmation("„Tiefgarage Ahornweg“ angelegt"),
      ]);
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("confirms a saved community by its new name", () => {
    const fixture = communitiesFixture();
    return Effect.gen(function* () {
      fixture.memory.seed(`${FOLDER}/Gemeinschaft 1.md`, communityNote(1));
      yield* ready;
      const community = yield* first;
      yield* updateCommunity(community, { ...INPUT, name: "Ahornweg 12", short_code: "G1" });
      assert.deepStrictEqual(fixture.notifier.messages(), [
        confirmation("„Ahornweg 12“ gespeichert"),
      ]);
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("confirms a deleted community by the name it showed", () => {
    const fixture = communitiesFixture();
    return Effect.gen(function* () {
      fixture.memory.seed(`${FOLDER}/Ohne Namen.md`, communityNote(1, { name: undefined }));
      yield* ready;
      yield* deleteCommunity(yield* first);
      assert.deepStrictEqual(fixture.notifier.messages(), [
        confirmation("„Ohne Namen“ in den Papierkorb verschoben"),
      ]);
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("confirms nothing that failed", () => {
    const fixture = communitiesFixture();
    return Effect.gen(function* () {
      fixture.memory.seed(`${FOLDER}/Gemeinschaft 1.md`, communityNote(1));
      yield* ready;
      const community = yield* first;
      yield* Effect.flip(createCommunity({ ...INPUT, name: "" }));
      fixture.memory.setFailWrites(true);
      yield* Effect.flip(updateCommunity(community, { ...INPUT, short_code: "G1" }));
      yield* Effect.flip(deleteCommunity(community));
      assert.deepStrictEqual(fixture.notifier.messages(), []);
      assert.strictEqual((yield* NoteStore.use((store) => store.list)).length, 1);
    }).pipe(Effect.provide(fixture.layer));
  });
});
