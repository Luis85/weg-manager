import { assert, describe, it } from "@effect/vitest";
import { Effect, Option, Stream } from "effect";
import { TestClock } from "effect/testing";
import {
  communityList,
  communityListChanges,
  communitySelectionChanges,
  shownName,
  type Community,
} from "../../src/application/communities";
import {
  NoteStore,
  rebuildNoteIndex,
  unindexedChanges,
  unindexedSnapshot,
} from "../../src/application/notes";
import { INDEX_BATCH_QUIET } from "../../src/application/notes/index-batches";
import { Clipboard } from "../../src/application/shell";
import { harnessLayer, parseScenario } from "../../harness/layers";

/** The communities once the index's first build is published, or its failure. */
const built = Effect.andThen(
  Stream.runHead(
    Stream.filter(unindexedChanges, (snapshot) => snapshot.ready || snapshot.failure !== undefined),
  ),
  communityList,
);

const names = (communities: readonly Community[]) => communities.map(shownName);

describe("harnessLayer scenarios", () => {
  it.effect("loaded: two communities, the selection asks for a choice", () =>
    Effect.gen(function* () {
      const list = yield* built;
      assert.deepStrictEqual(names(list.communities), ["Ahornweg 12", "Tiefgarage Ahornweg"]);
      assert.deepStrictEqual(
        list.communities.map((community) => community.issues),
        [[], []],
      );
      const selection = yield* Stream.runHead(
        Stream.filter(communitySelectionChanges, (next) => next.ready),
      );
      assert.isTrue(Option.getOrThrow(selection).choiceNeeded);
    }).pipe(Effect.provide(harnessLayer("loaded"))),
  );

  it.effect("empty: no community and nothing to show", () =>
    Effect.gen(function* () {
      const list = yield* built;
      assert.deepStrictEqual(list.communities, []);
      assert.deepStrictEqual((yield* unindexedSnapshot).notes, []);
    }).pipe(Effect.provide(harnessLayer("empty"))),
  );

  it.effect("invalid: a broken field, a duplicate short code and notes of no known type", () =>
    Effect.gen(function* () {
      const list = yield* built;
      assert.deepStrictEqual(
        list.communities.map((community) => [
          shownName(community),
          community.issues.map((issue) => issue.code),
        ]),
        [
          ["Ahornweg 12", ["short-code.duplicate"]],
          ["Birkenallee", ["color.unknown"]],
          ["Doppelt", ["short-code.duplicate"]],
        ],
      );
      assert.deepStrictEqual(
        (yield* unindexedSnapshot).notes.map((note) => [note.path, note.issue.code]),
        [
          ["Notizen/Fremd.md", "schema.malformed"],
          ["WEG Manager/Gemeinschaften/Kaputt.md", "frontmatter.unreadable"],
        ],
      );
    }).pipe(Effect.provide(harnessLayer("invalid"))),
  );

  it.effect("readonly: a note of a newer schema version beside a valid one", () =>
    Effect.gen(function* () {
      const list = yield* built;
      assert.deepStrictEqual(
        list.communities.map((community) => [shownName(community), community.editable]),
        [
          ["Ahornweg 12", true],
          ["Aus der Zukunft", false],
        ],
      );
    }).pipe(Effect.provide(harnessLayer("readonly"))),
  );

  it.effect("failure: the first build fails, a retry reads the communities", () =>
    Effect.gen(function* () {
      const failed = yield* built;
      assert.deepStrictEqual([failed.ready, failed.failure?._tag], [false, "NoteIndexReadError"]);
      yield* rebuildNoteIndex;
      const retried = yield* communityList;
      assert.deepStrictEqual([retried.ready, retried.failure], [true, undefined]);
      assert.deepStrictEqual(names(retried.communities), ["Ahornweg 12", "Tiefgarage Ahornweg"]);
    }).pipe(Effect.provide(harnessLayer("failure"))),
  );
});

describe("harnessLayer", () => {
  it.effect("follows a community written through the in-memory NoteStore", () =>
    Effect.gen(function* () {
      yield* built;
      yield* NoteStore.use((store) =>
        store.create({
          folder: "WEG Manager/Gemeinschaften",
          name: "Birke",
          frontmatter: {
            schema: "weg-manager.community/v1",
            id: "community-00000000-0000-4000-8000-0000000000ff",
            name: "Birke",
            short_code: "BI",
            color: "blue",
            kind: "WEG",
            unit_label: "Einheiten",
          },
        }),
      );
      yield* TestClock.adjust(INDEX_BATCH_QUIET);
      const shown = yield* Stream.runHead(
        Stream.filter(communityListChanges, (list) => list.communities.length === 1),
      );
      assert.deepStrictEqual(names(Option.getOrThrow(shown).communities), ["Birke"]);
    }).pipe(Effect.provide(harnessLayer("empty"))),
  );

  it.effect("reports a clipboard failure as ClipboardError, and writes through a given one", () =>
    Effect.gen(function* () {
      const error = yield* Effect.flip(
        Clipboard.use((clipboard) => clipboard.write("x")).pipe(
          Effect.provide(harnessLayer("loaded")),
        ),
      );
      assert.strictEqual(error._tag, "ClipboardError");
      const writes: string[] = [];
      const ok = harnessLayer("loaded", {
        writeClipboard: async (text) => {
          writes.push(text);
        },
      });
      yield* Clipboard.use((clipboard) => clipboard.write("y")).pipe(Effect.provide(ok));
      assert.deepStrictEqual(writes, ["y"]);
    }),
  );
});

describe("parseScenario", () => {
  it("accepts known scenarios and falls back to loaded", () => {
    assert.strictEqual(parseScenario("invalid"), "invalid");
    assert.strictEqual(parseScenario("failure"), "failure");
    assert.strictEqual(parseScenario("default"), "loaded");
    assert.strictEqual(parseScenario(null), "loaded");
  });
});
