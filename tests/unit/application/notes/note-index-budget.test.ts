import { assert, describe, it } from "@effect/vitest";
import { Duration, Effect, Fiber } from "effect";
import { TestClock } from "effect/testing";
import { INDEX_BATCH_QUIET, rebuildNoteIndex } from "../../../../src/application/notes";
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
 * the in-memory store: no metadata cache, so this is the index's own work, decode and duplicates
 * included. A dev container measures a build at 30 to 160 ms and one edit at 2 to 5 ms of work
 * (6 to 20 ms with the test's own clock and stream); the bounds leave a wide margin, so a slow CI
 * runner or the mutation run does not flake. The e2e spec measures the same in Obsidian.
 */
const BUILD_BUDGET_MS = 1000;
const EDIT_BUDGET_MS = 50;
const EDITS = 5;

const frontmatterOf = (text: string) => {
  const split = splitFrontmatter(text);
  return split === undefined ? "none" : (parseYaml(split.yaml) ?? "none");
};

const elapsed = <A, E, R>(effect: Effect.Effect<A, E, R>) =>
  Effect.gen(function* () {
    const started = performance.now();
    yield* effect;
    return performance.now() - started;
  });

const median = (values: readonly number[]) =>
  values.toSorted((a, b) => a - b)[values.length >> 1] ?? Infinity;

type Titled = { readonly notes: readonly { readonly values: { readonly title?: string } }[] };

describe("the note index's budget (B-NFR-04)", () => {
  it.effect("builds the reference vault within its budget; one edit costs a fraction", () => {
    const fixture = indexFixture({ types: REFERENCE_TYPES });
    const vault = referenceVault();
    for (const [path, text] of vault) fixture.memory.seed(path, frontmatterOf(text));
    const [point, text] = [...vault].find(([path]) => path.includes("/Punkte/")) ?? [];
    if (point === undefined || text === undefined) throw new Error("no point in the vault");
    const frontmatter = frontmatterOf(text) as Record<string, unknown>;

    /** One outside edit, timed from the end of the quiet delay until a view has it. */
    const edit = (title: string) =>
      Effect.gen(function* () {
        fixture.memory.seed(point, { ...frontmatter, title });
        const seen = (snapshot: Titled) =>
          snapshot.notes.some((note) => note.values.title === title);
        const waiting = yield* Effect.forkChild(until(referenceItem, seen));
        yield* settle;
        const quiet = TestClock.adjust(Duration.toMillis(INDEX_BATCH_QUIET));
        return yield* elapsed(Effect.andThen(quiet, Fiber.join(waiting)));
      });

    return Effect.gen(function* () {
      const first = yield* elapsed(
        Effect.andThen(
          vaultReady,
          untilUnindexed((snapshot) => snapshot.ready),
        ),
      );
      const items = yield* snapshotOf(referenceItem);
      const communities = yield* snapshotOf(referenceCommunity);
      assert.strictEqual(items.notes.length + communities.notes.length, REFERENCE_PROFILE.records);
      assert.isTrue(
        items.notes.every((note) => note.kind === "editable" && note.issues.length === 0),
      );
      // The plugin builds once per load; a rebuild shows the cost without the JIT's warm-up.
      const rebuild = yield* elapsed(rebuildNoteIndex);
      const edits: number[] = [];
      for (let n = 1; n <= EDITS; n += 1) edits.push(yield* edit(`Neu ${n}`));
      assert.isBelow(first, BUILD_BUDGET_MS);
      assert.isBelow(rebuild, BUILD_BUDGET_MS);
      assert.isBelow(median(edits), EDIT_BUDGET_MS);
      assert.isBelow(median(edits), rebuild / 2);
    }).pipe(Effect.provide(fixture.layer));
  });
});
