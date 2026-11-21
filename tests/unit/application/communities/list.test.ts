import { assert, describe, it } from "@effect/vitest";
import { Effect, Fiber, Stream } from "effect";
import {
  canChangeShortCode,
  communityList,
  communityListChanges,
  shownName,
  toCommunityList,
} from "../../../../src/application/communities";
import { NoteIndexReadError } from "../../../../src/application/notes";
import { communityType } from "../../../../src/domain/communities";
import {
  FOLDER,
  communitiesFixture,
  communityId,
  communityNote,
  indexed,
  ready,
} from "../../../support/communities/fixture";
import { settle } from "../../../support/notes/index-fixture";

const decoded = (path: string, frontmatter: Record<string, unknown>) => {
  const note = communityType.decode({ path, frontmatter });
  if (note.kind === "not-this-type") throw new Error("not a community");
  return note;
};

describe("toCommunityList", () => {
  it("keeps the index's status and is empty without notes", () => {
    const failure = new NoteIndexReadError();
    assert.deepStrictEqual(toCommunityList({ ready: false, failure, notes: [] }), {
      ready: false,
      failure,
      communities: [],
    });
  });

  it("shows each note with its path, file name, id, values, issues and whether it may be edited", () => {
    const frontmatter = communityNote(1, { name: "Ahornweg 12", color: 7 });
    const list = toCommunityList({
      ready: true,
      failure: undefined,
      notes: [decoded(`${FOLDER}/Ahornweg 12.md`, frontmatter)],
    });
    assert.deepStrictEqual(list.communities, [
      {
        path: `${FOLDER}/Ahornweg 12.md`,
        fileName: "Ahornweg 12",
        id: communityId(1),
        editable: true,
        values: { name: "Ahornweg 12", short_code: "G1", kind: "WEG", unit_label: "Einheiten" },
        issues: [{ key: "color", code: "color.unknown" }],
        frontmatter,
      },
    ]);
  });

  it("sorts by name as people read it, then by path, and puts nameless notes by file name", () => {
    const list = toCommunityList({
      ready: true,
      failure: undefined,
      notes: [
        decoded("b/Zeta.md", communityNote(1, { name: "Zeta" })),
        decoded("a/Weg 10.md", communityNote(2, { name: "Weg 10" })),
        decoded("a/Weg 9.md", communityNote(3, { name: "Weg 9" })),
        decoded("a/Ähre.md", communityNote(4, { name: "Ähre" })),
        decoded("a/Zeta.md", communityNote(5, { name: "Zeta" })),
        decoded("c/Mitte.md", communityNote(6, { name: undefined })),
      ],
    });
    assert.deepStrictEqual(
      list.communities.map((community) => community.path),
      ["a/Ähre.md", "c/Mitte.md", "a/Weg 9.md", "a/Weg 10.md", "a/Zeta.md", "b/Zeta.md"],
    );
  });

  it("marks every community whose short code another one has, and nothing else", () => {
    const list = toCommunityList({
      ready: true,
      failure: undefined,
      notes: [
        decoded("A.md", communityNote(1, { name: "A", short_code: "AW" })),
        decoded("B.md", communityNote(2, { name: "B", short_code: "AW" })),
        decoded("C.md", communityNote(3, { name: "C", short_code: "TG" })),
      ],
    });
    assert.deepStrictEqual(
      list.communities.map((community) => community.issues),
      [
        [{ key: "short_code", code: "short-code.duplicate" }],
        [{ key: "short_code", code: "short-code.duplicate" }],
        [],
      ],
    );
    assert.deepStrictEqual(
      list.communities.map((community) => community.editable),
      [true, true, true],
    );
  });

  it("lists a read-only note with its issues", () => {
    const list = toCommunityList({
      ready: true,
      failure: undefined,
      notes: [decoded("N.md", communityNote(1, { schema: "weg-manager.community/v3" }))],
    });
    assert.deepStrictEqual(list.communities[0], {
      path: "N.md",
      fileName: "N",
      id: communityId(1),
      editable: false,
      values: {},
      issues: [{ code: "schema.newer", version: 3 }],
      frontmatter: communityNote(1, { schema: "weg-manager.community/v3" }),
    });
  });
});

/** Community 1 named `A`, beside `others`, as the list shows it. */
const community = (extra: Record<string, unknown>, others: Record<string, unknown>[] = []) =>
  toCommunityList({
    ready: true,
    failure: undefined,
    notes: [
      decoded("A.md", communityNote(1, { name: "A", ...extra })),
      ...others.map((other, at) =>
        decoded(`O${at}.md`, communityNote(at + 2, { name: "O", ...other })),
      ),
    ],
  }).communities[0];

describe("canChangeShortCode", () => {
  it("is false for a valid, unique short code, also beside another field's issue", () => {
    for (const found of [community({}), community({ color: "amber" })]) {
      assert.isFalse(found !== undefined && canChangeShortCode(found));
    }
  });

  it("is true for a missing, broken or duplicate short code", () => {
    for (const found of [
      community({ short_code: undefined }),
      community({ short_code: "x" }),
      community({}, [{ short_code: "G1" }]),
    ]) {
      assert.isTrue(found !== undefined && canChangeShortCode(found));
    }
  });
});

describe("communityList", () => {
  it.effect("reads the index's communities now", () => {
    const fixture = communitiesFixture();
    return Effect.gen(function* () {
      assert.deepStrictEqual(yield* communityList, {
        ready: false,
        failure: undefined,
        communities: [],
      });
      fixture.memory.seed(`${FOLDER}/G1.md`, communityNote(1));
      yield* ready;
      const list = yield* communityList;
      assert.isTrue(list.ready);
      assert.deepStrictEqual(
        list.communities.map((entry) => entry.id),
        [communityId(1)],
      );
    }).pipe(Effect.provide(fixture.layer));
  });
});

describe("communityListChanges", () => {
  it.effect("emits the list now, then each change of the index", () => {
    const fixture = communitiesFixture();
    return Effect.gen(function* () {
      fixture.memory.seed(`${FOLDER}/G1.md`, communityNote(1));
      yield* ready;
      const seen = yield* Effect.forkChild(
        Stream.runCollect(
          Stream.map(Stream.take(communityListChanges, 2), (list) =>
            list.communities.map(shownName),
          ),
        ),
      );
      yield* settle;
      fixture.memory.seed(`${FOLDER}/G2.md`, communityNote(2, { name: "Ahornweg" }));
      yield* indexed;
      assert.deepStrictEqual(yield* Fiber.join(seen), [
        ["Gemeinschaft 1"],
        ["Ahornweg", "Gemeinschaft 1"],
      ]);
    }).pipe(Effect.provide(fixture.layer));
  });
});

describe("shownName", () => {
  it("is the community's name, else its file name", () => {
    const { communities } = toCommunityList({
      ready: true,
      failure: undefined,
      notes: [
        decoded("x/Datei A.md", communityNote(1, { name: "Ahornweg" })),
        decoded("x/Datei B.md", communityNote(2, { name: 3 })),
        decoded("x/Notes.md über C.md", communityNote(3, { name: 4 })),
      ],
    });
    assert.deepStrictEqual(communities.map(shownName), ["Ahornweg", "Datei B", "Notes.md über C"]);
  });
});
