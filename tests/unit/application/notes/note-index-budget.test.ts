import { assert, describe, it } from "@effect/vitest";
import { Duration, Effect, Fiber } from "effect";
import { TestClock } from "effect/testing";
import { rebuildNoteIndex, type IndexedType } from "../../../../src/application/notes";
import { INDEX_BATCH_QUIET } from "../../../../src/application/notes/index-batches";
import { REFERENCE_PROFILE, referenceVault } from "../../../../scripts/reference-vault.mjs";
import { splitFrontmatter } from "../../../support/obsidian/metadata-cache";
import { parseYaml } from "../../../support/obsidian/yaml";
import {
  indexFixture,
  settle,
  snapshotOf,
  until,
  untilUnindexed,
  vaultReady,
} from "../../../support/notes/index-fixture";
import {
  REFERENCE_TYPES,
  referenceCommunity,
  referenceItem,
} from "../../../support/notes/reference-types";

/**
 * Budgets of the index on the F-21 reference vault (2,000 records, 200 plain notes), in Node over
 * the in-memory store: no metadata cache, so this is the index's own work. The budget is counted
 * work, not wall-clock time: reads of the store and decodes of notes. Time depends on the machine
 * (a loaded CI runner, Stryker running several suites at once), counts do not, and they show what
 * the time would be spent on. A build decodes every record once and reads no file twice; a rebuild
 * decodes nothing unchanged; an edit of one note costs one read and one decode, never a rebuild's
 * worth. The e2e spec measures time in Obsidian.
 */
const EDITS = 5;

const frontmatterOf = (text: string) => {
  const split = splitFrontmatter(text);
  return split === undefined ? "none" : (parseYaml(split.yaml) ?? "none");
};

/** A note type that counts its decodes, whatever its decode does. */
const counting = (inner: IndexedType, counter: { decodes: number }): IndexedType => ({
  type: inner.type,
  fields: inner.fields,
  decode: (note) => {
    counter.decodes += 1;
    return inner.decode(note);
  },
});

type Titled = { readonly notes: readonly { readonly values: { readonly title?: string } }[] };

describe("the note index's budget (B-NFR-04)", () => {
  it.effect("builds the reference vault by reading each note once; one edit costs one read", () => {
    const counter = { decodes: 0 };
    const types = REFERENCE_TYPES.map((type) => counting(type, counter));
    const fixture = indexFixture({ types });
    const vault = referenceVault();
    for (const [path, text] of vault) fixture.memory.seed(path, frontmatterOf(text));
    const [point, text] = [...vault].find(([path]) => path.includes("/Punkte/")) ?? [];
    if (point === undefined || text === undefined) throw new Error("no point in the vault");
    const frontmatter = frontmatterOf(text) as Record<string, unknown>;

    /** One outside edit, from the end of the quiet delay until a view has it; its work counted. */
    const edit = (title: string) =>
      Effect.gen(function* () {
        const before = { reads: fixture.reads(), decodes: counter.decodes };
        fixture.memory.seed(point, { ...frontmatter, title });
        const seen = (snapshot: Titled) =>
          snapshot.notes.some((note) => note.values.title === title);
        const waiting = yield* Effect.forkChild(until(referenceItem, seen));
        yield* settle;
        yield* Effect.andThen(
          TestClock.adjust(Duration.toMillis(INDEX_BATCH_QUIET)),
          Fiber.join(waiting),
        );
        return { reads: fixture.reads() - before.reads, decodes: counter.decodes - before.decodes };
      });

    return Effect.gen(function* () {
      yield* Effect.andThen(
        vaultReady,
        untilUnindexed((snapshot) => snapshot.ready),
      );
      const items = yield* snapshotOf(referenceItem);
      const communities = yield* snapshotOf(referenceCommunity);
      assert.strictEqual(items.notes.length + communities.notes.length, REFERENCE_PROFILE.records);
      assert.isTrue(
        items.notes.every((note) => note.kind === "editable" && note.issues.length === 0),
      );
      const build = { reads: fixture.reads(), decodes: counter.decodes };
      // A build decodes each record once and reads no file of the vault twice.
      assert.strictEqual(build.decodes, REFERENCE_PROFILE.records);
      assert.isAtMost(build.reads, vault.size);

      // A rebuild lists the vault again but decodes nothing that has not changed.
      const beforeRebuild = { reads: fixture.reads(), decodes: counter.decodes };
      yield* rebuildNoteIndex;
      const rebuild = {
        reads: fixture.reads() - beforeRebuild.reads,
        decodes: counter.decodes - beforeRebuild.decodes,
      };
      assert.deepStrictEqual(rebuild, { reads: 0, decodes: 0 });

      for (let n = 1; n <= EDITS; n += 1) {
        const work = yield* edit(`Neu ${n}`);
        assert.deepStrictEqual(work, { reads: 1, decodes: 1 });
      }
    }).pipe(Effect.provide(fixture.layer));
  });
});
