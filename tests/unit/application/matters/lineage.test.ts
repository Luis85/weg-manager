import { assert, describe, it } from "@effect/vitest";
import { Effect } from "effect";
import {
  InvalidMergeError,
  InvalidSplitError,
  matterList,
  mergeMatters,
  splitMatter,
} from "../../../../src/application/matters";
import {
  FOLDER,
  MANAGER,
  matterId,
  matterNote,
  mattersFixture,
  ready,
  stored,
} from "../../../support/matters/fixture";

const byOutcome = (outcome: string) =>
  Effect.map(matterList, ({ records }) => {
    const found = records.find((matter) => matter.values.outcome === outcome);
    if (found === undefined) throw new Error(`no matter ${outcome}`);
    return found;
  });

const part = (outcome: string, due_on = "") => ({
  outcome,
  responsible_id: MANAGER,
  due_on,
  status: "open" as const,
  next_step: "Nachfragen",
});

describe("splitMatter (PBI-06)", () => {
  it.effect(
    "creates the parts with new numbers and the source's community, kind, topic and source",
    () => {
      const fixture = mattersFixture();
      fixture.memory.seed(
        `${FOLDER}/Sammel.md`,
        matterNote(7, { id: matterId(50), outcome: "Sammel", topic: "Mängel" }),
        "",
      );
      return Effect.gen(function* () {
        yield* ready;
        yield* splitMatter(yield* byOutcome("Sammel"), {
          reason: "Zwei Mängel",
          parts: [
            part("Tür repariert", "2026-12-01"),
            { ...part("Licht repariert"), status: "unclear" },
          ],
        });
        const first = (yield* stored(`${FOLDER}/Tür repariert.md`)).frontmatter;
        const second = (yield* stored(`${FOLDER}/Licht repariert.md`)).frontmatter;
        assert.deepStrictEqual(
          [
            first["number"],
            first["topic"],
            first["kind"],
            first["source"],
            first["split_from_id"],
            first["due_on"],
          ],
          [8, "Mängel", "manager_promise", "Mail", matterId(50), "2026-12-01"],
        );
        assert.deepStrictEqual([second["number"], second["status"]], [9, "unclear"]);
        const source = (yield* stored(`${FOLDER}/Sammel.md`)).frontmatter;
        assert.deepStrictEqual(
          [source["status"], source["split_into_ids"]],
          ["obsolete", [first["id"], second["id"]]],
        );
        assert.include(
          fixture.memory.body(`${FOLDER}/Sammel.md`) ?? "",
          `Zwei Mängel [kind:: split] [actor:: board] [status:: obsolete] [related:: ${String(first["id"])} ${String(second["id"])}]`,
        );
      }).pipe(Effect.provide(fixture.layer));
    },
  );

  it.effect("refuses one part and writes nothing", () => {
    const fixture = mattersFixture();
    fixture.memory.seed(`${FOLDER}/Sammel.md`, matterNote(7, { outcome: "Sammel" }), "");
    return Effect.gen(function* () {
      yield* ready;
      const error = yield* Effect.flip(
        splitMatter(yield* byOutcome("Sammel"), { reason: "x", parts: [part("A")] }),
      );
      assert.deepStrictEqual(
        error,
        new InvalidSplitError({ issues: [{ part: undefined, code: "parts.too-few" }] }),
      );
      assert.strictEqual((yield* stored(`${FOLDER}/Sammel.md`)).frontmatter["status"], "open");
    }).pipe(Effect.provide(fixture.layer));
  });
});

describe("mergeMatters (PBI-07)", () => {
  it.effect(
    "takes the chosen values into the target and closes the duplicate with a reference",
    () => {
      const fixture = mattersFixture();
      fixture.memory.seed(
        `${FOLDER}/Ziel.md`,
        matterNote(1, { id: matterId(61), outcome: "Ziel", due_on: "2026-11-30" }),
        "",
      );
      fixture.memory.seed(
        `${FOLDER}/Dublette.md`,
        matterNote(2, {
          id: matterId(62),
          outcome: "Dublette",
          due_on: "2026-12-15",
          next_step: "Anders",
        }),
        "",
      );
      return Effect.gen(function* () {
        yield* ready;
        yield* mergeMatters(yield* byOutcome("Ziel"), yield* byOutcome("Dublette"), {
          reason: "Gleicher Mangel",
          choices: { due_on: "duplicate", next_step: "target", outcome: "target" },
        });
        const target = (yield* stored(`${FOLDER}/Ziel.md`)).frontmatter;
        assert.deepStrictEqual(
          [target["due_on"], target["next_step"], target["outcome"], target["merged_from_ids"]],
          ["2026-12-15", "Nachfragen.", "Ziel", [matterId(62)]],
        );
        const duplicate = (yield* stored(`${FOLDER}/Dublette.md`)).frontmatter;
        assert.deepStrictEqual(
          [duplicate["status"], duplicate["merged_into_id"]],
          ["obsolete", matterId(61)],
        );
        assert.include(
          fixture.memory.body(`${FOLDER}/Ziel.md`) ?? "",
          `[kind:: merge] [actor:: board] [related:: ${matterId(62)}]`,
        );
        assert.include(
          fixture.memory.body(`${FOLDER}/Dublette.md`) ?? "",
          `[kind:: merge] [actor:: board] [status:: obsolete] [related:: ${matterId(61)}]`,
        );
      }).pipe(Effect.provide(fixture.layer));
    },
  );

  it.effect("refuses matters of different communities and writes nothing (criterion 3)", () => {
    const fixture = mattersFixture();
    fixture.memory.seed(
      `${FOLDER}/Ziel.md`,
      matterNote(1, { id: matterId(61), outcome: "Ziel" }),
      "",
    );
    fixture.memory.seed(
      `${FOLDER}/Andere.md`,
      matterNote(2, {
        id: matterId(62),
        outcome: "Andere",
        community_id: "community-00000000-0000-4000-8000-000000000077",
      }),
      "",
    );
    return Effect.gen(function* () {
      yield* ready;
      const error = yield* Effect.flip(
        mergeMatters(yield* byOutcome("Ziel"), yield* byOutcome("Andere"), {
          reason: "x",
          choices: {},
        }),
      );
      assert.deepStrictEqual(error, new InvalidMergeError({ issues: ["merge.other-community"] }));
      assert.strictEqual(fixture.memory.body(`${FOLDER}/Ziel.md`), "");
    }).pipe(Effect.provide(fixture.layer));
  });
});
