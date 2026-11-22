import { assert, describe, expect, it } from "@effect/vitest";
import { Effect, Fiber, Stream } from "effect";
import {
  CommunitySelectionService,
  SELECTION_KEY,
  communitySelection,
  communitySelectionChanges,
  selectCommunity,
  type CommunitySelection,
} from "../../../../src/application/communities";
import { NoteStore } from "../../../../src/application/notes";
import { DeviceStore } from "../../../../src/application/shell";
import {
  FOLDER,
  communitiesFixture,
  communityId,
  communityNote,
  indexed,
  ready,
} from "../../../support/communities/fixture";
import { settle, vaultReady } from "../../../support/notes/index-fixture";

const storedSelection = DeviceStore.use((store) => store.read(SELECTION_KEY));

const selection = (id: string | undefined, choiceNeeded = false): CommunitySelection => ({
  ready: true,
  id,
  choiceNeeded,
});

/** Seeds communities 1 to `count` with their own colours. */
const seed = (fixture: ReturnType<typeof communitiesFixture>, count: number) => {
  const colors = ["teal", "violet", "blue"];
  for (let n = 1; n <= count; n += 1) {
    fixture.memory.seed(`${FOLDER}/G${n}.md`, communityNote(n, { color: colors[n - 1] }));
  }
};

describe("the community selection", () => {
  it("is a service of its own, kept per device under its own key", () => {
    expect(CommunitySelectionService.key).toBe("weg-manager/application/CommunitySelectionService");
    expect(SELECTION_KEY).toBe("community-selection");
  });

  it.effect(
    "is not ready and selects nothing before the index is built, and stores nothing",
    () => {
      const fixture = communitiesFixture();
      return Effect.gen(function* () {
        seed(fixture, 1);
        yield* settle;
        assert.deepStrictEqual(yield* communitySelection, {
          ready: false,
          id: undefined,
          choiceNeeded: false,
        });
        assert.isUndefined(yield* storedSelection);
      }).pipe(Effect.provide(fixture.layer));
    },
  );

  it.effect("selects the only community and stores it for the device", () => {
    const fixture = communitiesFixture();
    return Effect.gen(function* () {
      seed(fixture, 1);
      yield* ready;
      yield* settle;
      assert.deepStrictEqual(yield* communitySelection, selection(communityId(1)));
      assert.strictEqual(yield* storedSelection, communityId(1));
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("selects none of two when nothing is stored, and asks for a choice", () => {
    const fixture = communitiesFixture();
    return Effect.gen(function* () {
      seed(fixture, 2);
      yield* ready;
      yield* settle;
      assert.deepStrictEqual(yield* communitySelection, selection(undefined, true));
      assert.isUndefined(yield* storedSelection);
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("asks for nothing while there is no community", () => {
    const fixture = communitiesFixture();
    return Effect.gen(function* () {
      yield* ready;
      yield* settle;
      assert.deepStrictEqual(yield* communitySelection, selection(undefined));
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("keeps the stored community", () => {
    const fixture = communitiesFixture({ device: { [SELECTION_KEY]: communityId(2) } });
    return Effect.gen(function* () {
      seed(fixture, 2);
      yield* ready;
      yield* settle;
      assert.deepStrictEqual(yield* communitySelection, selection(communityId(2)));
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("ignores a stored value that is no community id", () => {
    const fixture = communitiesFixture({ device: { [SELECTION_KEY]: { id: 3 } } });
    return Effect.gen(function* () {
      seed(fixture, 2);
      yield* ready;
      yield* settle;
      assert.deepStrictEqual(yield* communitySelection, selection(undefined, true));
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("stores a choice, and every follower sees it", () => {
    const fixture = communitiesFixture();
    return Effect.gen(function* () {
      seed(fixture, 2);
      yield* ready;
      yield* settle;
      const seen = yield* Effect.forkChild(
        Stream.runCollect(Stream.take(communitySelectionChanges, 2)),
      );
      yield* settle;
      yield* selectCommunity(communityId(1));
      assert.deepStrictEqual(yield* Fiber.join(seen), [
        selection(undefined, true),
        selection(communityId(1)),
      ]);
      assert.deepStrictEqual(yield* communitySelection, selection(communityId(1)));
      assert.strictEqual(yield* storedSelection, communityId(1));
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("falls back by the rule when the selected community is deleted", () => {
    const fixture = communitiesFixture({ device: { [SELECTION_KEY]: communityId(3) } });
    return Effect.gen(function* () {
      seed(fixture, 3);
      yield* ready;
      yield* settle;
      assert.deepStrictEqual(yield* communitySelection, selection(communityId(3)));
      yield* NoteStore.use((store) => store.trash(`${FOLDER}/G3.md`));
      yield* indexed;
      assert.deepStrictEqual(yield* communitySelection, selection(undefined, true));
      yield* NoteStore.use((store) => store.trash(`${FOLDER}/G2.md`));
      yield* indexed;
      assert.deepStrictEqual(yield* communitySelection, selection(communityId(1)));
      // The rule's choice is not stored over the user's: the stored community may come back.
      assert.strictEqual(yield* storedSelection, communityId(3));
      // Gone for good: a second community then asks for a choice once.
      fixture.memory.seed(`${FOLDER}/G4.md`, communityNote(4, { color: "rust" }));
      yield* indexed;
      assert.deepStrictEqual(yield* communitySelection, selection(undefined, true));
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("selects the stored community again when its note was gone for a moment", () => {
    const fixture = communitiesFixture({ device: { [SELECTION_KEY]: communityId(2) } });
    return Effect.gen(function* () {
      seed(fixture, 2);
      yield* ready;
      yield* settle;
      assert.deepStrictEqual(yield* communitySelection, selection(communityId(2)));
      // Sync deletes the note and writes it again; broken YAML while typing does the same.
      yield* NoteStore.use((store) => store.trash(`${FOLDER}/G2.md`));
      yield* indexed;
      assert.deepStrictEqual(yield* communitySelection, selection(communityId(1)));
      fixture.memory.seed(`${FOLDER}/G2.md`, communityNote(2, { color: "violet" }));
      yield* indexed;
      assert.deepStrictEqual(yield* communitySelection, selection(communityId(2)));
      assert.strictEqual(yield* storedSelection, communityId(2));
      assert.strictEqual(fixture.deviceWrites(), 0);
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("stores the rule's choice over a stored value that is no community id", () => {
    const fixture = communitiesFixture({ device: { [SELECTION_KEY]: "item-gone" } });
    return Effect.gen(function* () {
      seed(fixture, 1);
      yield* ready;
      yield* settle;
      assert.deepStrictEqual(yield* communitySelection, selection(communityId(1)));
      assert.strictEqual(yield* storedSelection, communityId(1));
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("stores the user's choice over a stored community that is gone", () => {
    const fixture = communitiesFixture({ device: { [SELECTION_KEY]: communityId(3) } });
    return Effect.gen(function* () {
      seed(fixture, 2);
      yield* ready;
      yield* settle;
      yield* selectCommunity(communityId(2));
      assert.deepStrictEqual(yield* communitySelection, selection(communityId(2)));
      assert.strictEqual(yield* storedSelection, communityId(2));
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("keeps the first community selected when a second one is added", () => {
    const fixture = communitiesFixture();
    return Effect.gen(function* () {
      seed(fixture, 1);
      yield* ready;
      yield* settle;
      fixture.memory.seed(`${FOLDER}/G2.md`, communityNote(2, { color: "blue" }));
      yield* indexed;
      assert.deepStrictEqual(yield* communitySelection, selection(communityId(1)));
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("leaves out both notes of a duplicated id, and asks for nothing", () => {
    const fixture = communitiesFixture();
    return Effect.gen(function* () {
      fixture.memory.seed(`${FOLDER}/A.md`, communityNote(1));
      fixture.memory.seed(`${FOLDER}/B.md`, communityNote(1, { short_code: "B1" }));
      yield* ready;
      yield* settle;
      assert.deepStrictEqual(yield* communitySelection, selection(undefined));
      assert.isUndefined(yield* storedSelection);
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("selects only a community without issues", () => {
    const fixture = communitiesFixture();
    return Effect.gen(function* () {
      seed(fixture, 1);
      fixture.memory.seed(`${FOLDER}/Farbe.md`, communityNote(2, { color: "amber" }));
      fixture.memory.seed(`${FOLDER}/Neu.md`, {
        ...communityNote(3, { color: "blue" }),
        schema: "weg-manager.community/v2",
      });
      yield* ready;
      yield* settle;
      assert.deepStrictEqual(yield* communitySelection, selection(communityId(1)));
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("leaves out both communities of a duplicate short code", () => {
    const fixture = communitiesFixture();
    return Effect.gen(function* () {
      seed(fixture, 1);
      fixture.memory.seed(`${FOLDER}/G2.md`, communityNote(2, { color: "blue" }));
      fixture.memory.seed(
        `${FOLDER}/G3.md`,
        communityNote(3, { short_code: "G2", color: "violet" }),
      );
      yield* ready;
      yield* settle;
      assert.deepStrictEqual(yield* communitySelection, selection(communityId(1)));
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("treats a stored community with an issue as gone for the moment", () => {
    const fixture = communitiesFixture({ device: { [SELECTION_KEY]: communityId(2) } });
    return Effect.gen(function* () {
      seed(fixture, 3);
      yield* ready;
      yield* settle;
      assert.deepStrictEqual(yield* communitySelection, selection(communityId(2)));
      fixture.memory.seed(`${FOLDER}/G2.md`, communityNote(2, { color: "amber" }));
      yield* indexed;
      assert.deepStrictEqual(yield* communitySelection, selection(undefined, true));
      // A user's choice is never offered a community with an issue.
      yield* selectCommunity(communityId(2));
      assert.deepStrictEqual(yield* communitySelection, selection(undefined, true));
      fixture.memory.seed(`${FOLDER}/G2.md`, communityNote(2, { color: "violet" }));
      yield* indexed;
      assert.deepStrictEqual(yield* communitySelection, selection(communityId(2)));
      assert.strictEqual(yield* storedSelection, communityId(2));
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("does not store a choice by the rule while the index reports a failure", () => {
    const fixture = communitiesFixture();
    return Effect.gen(function* () {
      seed(fixture, 1);
      fixture.memory.setFailReads(true);
      yield* vaultReady;
      yield* settle;
      assert.deepStrictEqual(yield* communitySelection, {
        ready: false,
        id: undefined,
        choiceNeeded: false,
      });
      assert.isUndefined(yield* storedSelection);
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("leaves out a note without an id", () => {
    const fixture = communitiesFixture();
    return Effect.gen(function* () {
      seed(fixture, 1);
      fixture.memory.seed(`${FOLDER}/Ohne id.md`, communityNote(2, { id: undefined }));
      yield* ready;
      yield* settle;
      assert.deepStrictEqual(yield* communitySelection, selection(communityId(1)));
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("publishes nothing and writes nothing when a change keeps the selection", () => {
    const fixture = communitiesFixture();
    return Effect.gen(function* () {
      seed(fixture, 1);
      yield* ready;
      yield* settle;
      const seen: CommunitySelection[] = [];
      yield* Effect.forkChild(
        Stream.runForEach(communitySelectionChanges, (next) =>
          Effect.sync(() => {
            seen.push(next);
          }),
        ),
      );
      yield* settle;
      fixture.memory.seed(`${FOLDER}/G1.md`, communityNote(1, { name: "Umbenannt" }));
      yield* indexed;
      assert.deepStrictEqual(seen, [selection(communityId(1))]);
      assert.strictEqual(fixture.deviceWrites(), 1);
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("selects by the rule but stores nothing while a read failed", () => {
    const fixture = communitiesFixture();
    return Effect.gen(function* () {
      seed(fixture, 2);
      yield* ready;
      yield* settle;
      fixture.setFailUnreadable(true);
      yield* NoteStore.use((store) => store.trash(`${FOLDER}/G2.md`));
      fixture.memory.seed(`${FOLDER}/Ohne Eigenschaften.md`, "none");
      yield* indexed;
      assert.deepStrictEqual(yield* communitySelection, selection(communityId(1)));
      assert.isUndefined(yield* storedSelection);
    }).pipe(Effect.provide(fixture.layer));
  });
});
