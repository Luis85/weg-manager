import { assert, describe, it } from "@effect/vitest";
import { Effect, Fiber, Layer } from "effect";
import {
  InvalidCommunityError,
  canChangeShortCode,
  communityList,
  updateCommunity,
  type Community,
} from "../../../../src/application/communities";
import {
  NoteEditConflictError,
  NoteNotFoundError,
  NoteStore,
  NoteWriteRefusedError,
} from "../../../../src/application/notes";
import { NoteWriteError } from "../../../../src/application/notes/errors";
import type { CommunityInput } from "../../../../src/domain/communities";
import {
  FOLDER,
  communitiesFixture,
  communityNote,
  indexed,
  ready,
  stored,
} from "../../../support/communities/fixture";
import { settle } from "../../../support/notes/index-fixture";

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

const first = Effect.map(communityList, ({ communities }) => {
  const [community] = communities;
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

  it.effect("writes nothing and names the conflict when both changed a field", () => {
    const fixture = communitiesFixture();
    return Effect.gen(function* () {
      const community = yield* loaded(fixture);
      const theirs = { ...community.frontmatter, kind: "Tiefgarage" };
      fixture.memory.seed(PATH, theirs, BODY);
      const error = yield* Effect.flip(
        updateCommunity(community, inputOf(community, { kind: "Haus" })),
      );
      assert.deepStrictEqual(
        error,
        new NoteEditConflictError({
          conflicts: [{ key: "kind", base: "WEG", edited: "Haus", current: "Tiefgarage" }],
        }),
      );
      assert.deepStrictEqual((yield* stored(PATH)).frontmatter, theirs);
    }).pipe(Effect.provide(fixture.layer));
  });

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

  it.effect("keeps a valid short code: it is fixed once given", () => {
    const fixture = communitiesFixture();
    return Effect.gen(function* () {
      const community = yield* loaded(fixture);
      assert.isFalse(canChangeShortCode(community));
      yield* updateCommunity(community, inputOf(community, { short_code: "XY", kind: "Haus" }));
      assert.deepStrictEqual((yield* stored(PATH)).frontmatter, {
        ...community.frontmatter,
        kind: "Haus",
      });
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("repairs a broken short code, upper-cased", () => {
    const fixture = communitiesFixture();
    return Effect.gen(function* () {
      const community = yield* loaded(fixture, { short_code: "a" });
      assert.isTrue(canChangeShortCode(community));
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
      assert.isTrue(canChangeShortCode(community));
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

  it.effect("renames a file with a clash suffix and adds one when the new name is taken", () => {
    const fixture = communitiesFixture();
    return Effect.gen(function* () {
      fixture.memory.seed(`${FOLDER}/Neu.md`, "none");
      const community = yield* loaded(fixture, {}, `${FOLDER}/Gemeinschaft 1 (2).md`);
      const note = yield* updateCommunity(community, inputOf(community, { name: "Neu" }));
      assert.strictEqual(note.path, `${FOLDER}/Neu (2).md`);
      assert.deepStrictEqual(yield* paths, [`${FOLDER}/Neu (2).md`]);
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("keeps a file name the user chose", () => {
    const fixture = communitiesFixture();
    return Effect.gen(function* () {
      const community = yield* loaded(fixture, {}, `${FOLDER}/Unsere WEG.md`);
      const note = yield* updateCommunity(community, inputOf(community, { name: "Neu" }));
      assert.strictEqual(note.path, `${FOLDER}/Unsere WEG.md`);
      assert.strictEqual((yield* stored(note.path)).frontmatter["name"], "Neu");
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("does not rename when the name stays", () => {
    const fixture = communitiesFixture();
    return Effect.gen(function* () {
      const community = yield* loaded(fixture, {}, `${FOLDER}/Gemeinschaft 1 (2).md`);
      const note = yield* updateCommunity(community, inputOf(community, { kind: "Haus" }));
      assert.strictEqual(note.path, `${FOLDER}/Gemeinschaft 1 (2).md`);
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

  it.effect("still renames the file when an unload interrupts while the save is written", () => {
    const fixture = communitiesFixture();
    return Effect.gen(function* () {
      const community = yield* loaded(fixture);
      fixture.memory.holdWrites();
      const saving = yield* Effect.forkChild(
        updateCommunity(community, inputOf(community, { name: "Neu" })),
      );
      yield* settle;
      assert.strictEqual(fixture.memory.heldWrites(), 1);
      // `ManagedRuntime.dispose` interrupts the command's fiber and waits for it.
      const unloading = yield* Effect.forkChild(Fiber.interrupt(saving));
      yield* settle;
      fixture.memory.releaseWrites();
      yield* Fiber.join(unloading);
      assert.deepStrictEqual(yield* paths, [`${FOLDER}/Neu.md`]);
      assert.strictEqual((yield* stored(`${FOLDER}/Neu.md`)).frontmatter["name"], "Neu");
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("tries up to the hundredth name", () => {
    const fixture = communitiesFixture();
    return Effect.gen(function* () {
      const community = yield* loaded(fixture);
      for (let n = 1; n <= 99; n += 1) {
        fixture.memory.seed(`${FOLDER}/${n === 1 ? "Neu" : `Neu (${n})`}.md`, "none");
      }
      const note = yield* updateCommunity(community, inputOf(community, { name: "Neu" }));
      assert.strictEqual(note.path, `${FOLDER}/Neu (100).md`);
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("stops trying names when the rename fails for another reason", () => {
    const fixture = communitiesFixture();
    let renames = 0;
    const failing = Layer.effect(
      NoteStore,
      NoteStore.useSync((store) =>
        NoteStore.of({
          ...store,
          rename: () =>
            Effect.suspend(() => {
              renames += 1;
              return Effect.fail(new NoteWriteError({ cause: new Error("disk") }));
            }),
        }),
      ),
    );
    return Effect.gen(function* () {
      const community = yield* loaded(fixture);
      const note = yield* updateCommunity(community, inputOf(community, { name: "Neu" })).pipe(
        Effect.provide(failing),
      );
      assert.strictEqual(note.path, PATH);
      assert.strictEqual(renames, 1);
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("finds a note renamed meanwhile by its id", () => {
    const fixture = communitiesFixture();
    return Effect.gen(function* () {
      fixture.memory.seed(PATH, communityNote(1), BODY);
      fixture.memory.seed(
        `${FOLDER}/Andere.md`,
        communityNote(2, { name: "Andere", color: "blue" }),
      );
      yield* ready;
      const community = (yield* communityList).communities[1];
      if (community === undefined) throw new Error("no community");
      yield* NoteStore.use((store) => store.rename(PATH, "Eigener Name"));
      yield* indexed;
      const note = yield* updateCommunity(community, inputOf(community, { kind: "Haus" }));
      assert.strictEqual(note.path, `${FOLDER}/Eigener Name.md`);
      assert.strictEqual((yield* stored(note.path)).frontmatter["kind"], "Haus");
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("refuses to write when a copy with the same id appeared meanwhile", () => {
    const fixture = communitiesFixture();
    return Effect.gen(function* () {
      const community = yield* loaded(fixture);
      // Sorted by name, the copy comes first: neither of the two may be written (ADR 0007).
      const copy = `${FOLDER}/Gemeinschaft 1 (Kopie).md`;
      fixture.memory.seed(copy, communityNote(1), BODY);
      yield* indexed;
      const error = yield* Effect.flip(
        updateCommunity(community, inputOf(community, { kind: "Haus" })),
      );
      assert.deepStrictEqual(error, new NoteWriteRefusedError({ reason: "duplicate-id" }));
      assert.deepStrictEqual((yield* stored(PATH)).frontmatter, communityNote(1));
      assert.deepStrictEqual((yield* stored(copy)).frontmatter, communityNote(1));
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("fails with NoteNotFoundError when the note is gone", () => {
    const fixture = communitiesFixture();
    return Effect.gen(function* () {
      const community = yield* loaded(fixture);
      yield* NoteStore.use((store) => store.trash(PATH));
      yield* indexed;
      const error = yield* Effect.flip(updateCommunity(community, inputOf(community)));
      assert.deepStrictEqual(error, new NoteNotFoundError());
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("refuses to write a note a newer version saved meanwhile", () => {
    const fixture = communitiesFixture();
    return Effect.gen(function* () {
      const community = yield* loaded(fixture);
      const newer = { ...community.frontmatter, schema: "weg-manager.community/v2" };
      fixture.memory.seed(PATH, newer, BODY);
      const error = yield* Effect.flip(
        updateCommunity(community, inputOf(community, { kind: "Haus" })),
      );
      assert.deepStrictEqual(error, new NoteWriteRefusedError({ reason: "newer-version" }));
      assert.deepStrictEqual((yield* stored(PATH)).frontmatter, newer);
    }).pipe(Effect.provide(fixture.layer));
  });
});
