import { assert, describe, it } from "@effect/vitest";
import { Effect } from "effect";
import {
  InvalidCommunityError,
  communityList,
  updateCommunity,
  type Community,
} from "../../../../src/application/communities";
import { NoteStore } from "../../../../src/application/notes";
import type { CommunityInput } from "../../../../src/domain/communities";
import {
  FOLDER,
  communitiesFixture,
  communityNote,
  indexed,
  ready,
  stored,
} from "../../../support/communities/fixture";

const PATH = `${FOLDER}/Gemeinschaft 1.md`;
const BODY = "Eigene Notizen\n";

/** The form's input for community 1 as loaded, with `change` on top. */
const inputOf = (community: Community, change: Partial<CommunityInput> = {}): CommunityInput => ({
  name: community.values.name ?? "",
  short_code: community.values.short_code ?? "",
  color: community.values.color ?? "",
  kind: community.values.kind ?? "",
  unit_label: community.values.unit_label ?? "",
  ...change,
});

const first = Effect.map(communityList, ({ records }) => {
  const [community] = records;
  if (community === undefined) throw new Error("no community");
  return community;
});

const paths = NoteStore.use((store) => store.list).pipe(
  Effect.map((notes) => notes.map((note) => note.path)),
);

/** Seeds community 1 at `path` (and `others`), builds the index and loads community 1. */
const loaded = (
  fixture: ReturnType<typeof communitiesFixture>,
  extra: Record<string, unknown> = {},
  path = PATH,
) =>
  Effect.gen(function* () {
    fixture.memory.seed(path, communityNote(1, extra), BODY);
    yield* ready;
    return yield* first;
  });

describe("updateCommunity", () => {
  it.effect(
    "writes the changed fields and keeps an outside change, unknown keys and the body",
    () => {
      const fixture = communitiesFixture();
      return Effect.gen(function* () {
        const community = yield* loaded(fixture, { reviewer: "Agent" });
        fixture.memory.seed(PATH, { ...community.frontmatter, unit_label: "Wohnungen" }, BODY);
        yield* updateCommunity(community, inputOf(community, { kind: "Haus" }));
        const after = yield* stored(PATH);
        assert.deepStrictEqual(after.frontmatter, {
          ...community.frontmatter,
          kind: "Haus",
          unit_label: "Wohnungen",
        });
        assert.strictEqual(fixture.memory.body(PATH), BODY);
      }).pipe(Effect.provide(fixture.layer));
    },
  );

  it.effect("leaves a field the user did not change as written, spaces included", () => {
    const fixture = communitiesFixture();
    return Effect.gen(function* () {
      const community = yield* loaded(fixture, { name: "Gemeinschaft 1 " });
      const note = yield* updateCommunity(community, inputOf(community, { kind: "Haus" }));
      assert.strictEqual(note.path, PATH);
      assert.deepStrictEqual((yield* stored(PATH)).frontmatter, {
        ...community.frontmatter,
        kind: "Haus",
      });
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("keeps an outside change to a field with spaces the user did not change", () => {
    const fixture = communitiesFixture();
    return Effect.gen(function* () {
      const community = yield* loaded(fixture, { name: "Gemeinschaft 1 " });
      fixture.memory.seed(PATH, { ...community.frontmatter, name: "Ahornweg 14" }, BODY);
      yield* updateCommunity(community, inputOf(community, { kind: "Haus" }));
      assert.deepStrictEqual((yield* stored(PATH)).frontmatter, {
        ...community.frontmatter,
        name: "Ahornweg 14",
        kind: "Haus",
      });
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("changes a valid short code, upper-cased, and keeps the other fields (PBI-78)", () => {
    const fixture = communitiesFixture();
    return Effect.gen(function* () {
      const community = yield* loaded(fixture);
      yield* updateCommunity(community, inputOf(community, { short_code: "xy" }));
      assert.deepStrictEqual((yield* stored(PATH)).frontmatter, {
        ...community.frontmatter,
        short_code: "XY",
      });
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("refuses a valid short code another community has (PBI-78)", () => {
    const fixture = communitiesFixture();
    return Effect.gen(function* () {
      fixture.memory.seed(
        `${FOLDER}/Zweite.md`,
        communityNote(2, { short_code: "TG", color: "blue" }),
      );
      const community = yield* loaded(fixture);
      const taken = yield* Effect.flip(
        updateCommunity(community, inputOf(community, { short_code: "tg" })),
      );
      assert.deepStrictEqual(
        taken,
        new InvalidCommunityError({
          issues: [
            { key: "short_code", code: "short-code.taken", value: "TG", other: "Gemeinschaft 2" },
          ],
        }),
      );
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("repairs a broken short code, upper-cased", () => {
    const fixture = communitiesFixture();
    return Effect.gen(function* () {
      const community = yield* loaded(fixture, { short_code: "a" });
      yield* updateCommunity(community, inputOf(community, { short_code: "aw" }));
      assert.strictEqual((yield* stored(PATH)).frontmatter["short_code"], "AW");
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("lets a duplicate short code be changed, or kept while other fields are saved", () => {
    const fixture = communitiesFixture();
    return Effect.gen(function* () {
      fixture.memory.seed(
        `${FOLDER}/Zweite.md`,
        communityNote(2, { short_code: "G1", color: "blue" }),
      );
      const community = yield* loaded(fixture);
      yield* updateCommunity(community, inputOf(community, { kind: "Haus" }));
      assert.strictEqual((yield* stored(PATH)).frontmatter["kind"], "Haus");
      yield* indexed;
      const again = yield* first;
      const taken = yield* Effect.flip(
        updateCommunity(again, inputOf(again, { short_code: "G1", color: "blue" })),
      );
      assert.deepStrictEqual(
        taken,
        new InvalidCommunityError({ issues: [{ key: "color", code: "color.taken" }] }),
      );
      yield* updateCommunity(again, inputOf(again, { short_code: "AW" }));
      assert.strictEqual((yield* stored(PATH)).frontmatter["short_code"], "AW");
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("refuses a colour another community uses", () => {
    const fixture = communitiesFixture();
    return Effect.gen(function* () {
      fixture.memory.seed(`${FOLDER}/Zweite.md`, communityNote(2, { color: "blue" }));
      const community = yield* loaded(fixture);
      const error = yield* Effect.flip(
        updateCommunity(community, inputOf(community, { color: "blue" })),
      );
      assert.deepStrictEqual(
        error,
        new InvalidCommunityError({ issues: [{ key: "color", code: "color.taken" }] }),
      );
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("saves a note whose name is too long for a file name, while the name stays", () => {
    const fixture = communitiesFixture();
    const long = "漢".repeat(90);
    return Effect.gen(function* () {
      const community = yield* loaded(fixture, { name: long });
      const note = yield* updateCommunity(community, inputOf(community, { kind: "Haus" }));
      assert.strictEqual(note.path, PATH);
      assert.strictEqual((yield* stored(PATH)).frontmatter["kind"], "Haus");
      const error = yield* Effect.flip(
        updateCommunity(community, inputOf(community, { name: `${long}字` })),
      );
      assert.deepStrictEqual(
        error,
        new InvalidCommunityError({ issues: [{ key: "name", code: "name.too-long" }] }),
      );
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("renames the file with the name while it carries the old name", () => {
    const fixture = communitiesFixture();
    return Effect.gen(function* () {
      const community = yield* loaded(fixture);
      const note = yield* updateCommunity(
        community,
        inputOf(community, { name: "Ahornweg 12/14" }),
      );
      assert.strictEqual(note.path, `${FOLDER}/Ahornweg 12-14.md`);
      assert.deepStrictEqual(yield* paths, [`${FOLDER}/Ahornweg 12-14.md`]);
      assert.strictEqual(fixture.memory.body(note.path), BODY);
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("keeps the saved note when the rename fails, and logs it without a name", () => {
    const fixture = communitiesFixture();
    return Effect.gen(function* () {
      const community = yield* loaded(fixture);
      for (let n = 1; n <= 100; n += 1) {
        fixture.memory.seed(`${FOLDER}/${n === 1 ? "Neu" : `Neu (${n})`}.md`, "none");
      }
      const note = yield* updateCommunity(community, inputOf(community, { name: "Neu" }));
      assert.strictEqual(note.path, PATH);
      assert.strictEqual((yield* stored(PATH)).frontmatter["name"], "Neu");
      assert.deepStrictEqual(
        fixture.logger.entries().filter((entry) => entry.event.startsWith("communities.")),
        [{ level: "warn", event: "communities.rename.failed" }],
      );
    }).pipe(Effect.provide(fixture.layer));
  });
});
