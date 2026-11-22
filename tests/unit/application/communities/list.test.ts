import { assert, describe, it } from "@effect/vitest";
import { canChangeShortCode, toCommunityList } from "../../../../src/application/communities";
import { communityType } from "../../../../src/domain/communities";
import { FOLDER, communityId, communityNote } from "../../../support/communities/fixture";

const decoded = (path: string, frontmatter: Record<string, unknown>) => {
  const note = communityType.decode({ path, frontmatter });
  if (note.kind === "not-this-type") throw new Error("not a community");
  return note;
};

describe("toCommunityList", () => {
  it("shows each note with its path, file name, id, values, issues and whether it may be edited", () => {
    const frontmatter = communityNote(1, { name: "Ahornweg 12", color: 7 });
    const list = toCommunityList({
      ready: true,
      failure: undefined,
      notes: [decoded(`${FOLDER}/Ahornweg 12.md`, frontmatter)],
    });
    assert.deepStrictEqual(list.records, [
      {
        path: `${FOLDER}/Ahornweg 12.md`,
        fileName: "Ahornweg 12",
        id: communityId(1),
        editable: true,
        values: { name: "Ahornweg 12", short_code: "G1", kind: "WEG", unit_label: "Einheiten" },
        issues: [{ key: "color", code: "color.unknown", value: "7" }],
        frontmatter,
      },
    ]);
  });

  it("gives an unknown colour its text as written, and leaves the other issues as they are", () => {
    const list = toCommunityList({
      ready: true,
      failure: undefined,
      notes: [
        decoded("A.md", communityNote(1, { name: "A", color: "cyan", short_code: "a" })),
        decoded("B.md", communityNote(2, { name: "B", color: true })),
        decoded("C.md", communityNote(3, { name: "C", color: ["teal"] })),
      ],
    });
    assert.deepStrictEqual(
      list.records.map((community) => community.issues),
      [
        [
          { key: "short_code", code: "short-code.invalid" },
          { key: "color", code: "color.unknown", value: "cyan" },
        ],
        [{ key: "color", code: "color.unknown", value: "true" }],
        [{ key: "color", code: "color.unknown", value: "" }],
      ],
    );
  });

  it("names the other community with the same short code, not just any other", () => {
    const list = toCommunityList({
      ready: true,
      failure: undefined,
      notes: [
        decoded("A.md", communityNote(1, { name: "A", short_code: "AW" })),
        decoded("B.md", communityNote(2, { name: "B", short_code: "TG" })),
        decoded("C.md", communityNote(3, { name: "C", short_code: "AW" })),
      ],
    });
    assert.deepStrictEqual(
      list.records.map((community) => community.issues),
      [
        [{ key: "short_code", code: "short-code.duplicate", value: "AW", other: "C" }],
        [],
        [{ key: "short_code", code: "short-code.duplicate", value: "AW", other: "A" }],
      ],
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
      list.records.map((community) => community.issues),
      [
        [{ key: "short_code", code: "short-code.duplicate", value: "AW", other: "B" }],
        [{ key: "short_code", code: "short-code.duplicate", value: "AW", other: "A" }],
        [],
      ],
    );
    assert.deepStrictEqual(
      list.records.map((community) => community.editable),
      [true, true, true],
    );
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
  }).records[0];

describe("canChangeShortCode", () => {
  it("is false for a valid, unique short code, also beside another field's issue", () => {
    for (const found of [community({}), community({ color: "cyan" })]) {
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
